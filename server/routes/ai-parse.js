'use strict';

const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');

const router = express.Router();
const client = new Anthropic({
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
});

// POST /api/ai-parse
// Accepts { prompt } OR { prompt, imageBase64, imageMediaType } for screenshot/vision support
router.post('/', async (req, res) => {
  try {
    const { prompt, imageBase64, imageMediaType } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'prompt is required' });
    }

    let messageContent;

    if (imageBase64) {
      // Vision request: image + text prompt
      const mediaType = imageMediaType || 'image/png';
      messageContent = [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: mediaType,
            data: imageBase64,
          },
        },
        {
          type: 'text',
          text: prompt,
        },
      ];
    } else {
      // Text-only request
      messageContent = prompt;
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [{ role: 'user', content: messageContent }],
    });

    const text = message.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('');

    return res.json({ result: text });
  } catch (err) {
    console.error('ai-parse error:', err);
    return res.status(500).json({ error: err.message || 'AI parse failed' });
  }
});

module.exports = router;
