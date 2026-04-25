'use strict';

require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

function generateToken(userId, email, ownerUserId) {
  const payload = { userId, email };
  if (ownerUserId && ownerUserId !== userId) payload.ownerUserId = ownerUserId;
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}

router.post('/signup', async (req, res) => {
  try {
    const { email, password, familyName } = req.body;

    if (!email || !password || !familyName) {
      return res.status(400).json({ error: 'Email, password, and family name are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    if (!familyName.trim()) {
      return res.status(400).json({ error: 'Family name cannot be empty' });
    }

    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    const result = await query(
      'INSERT INTO users (email, password_hash, family_name) VALUES ($1, $2, $3) RETURNING id',
      [email.toLowerCase().trim(), passwordHash, familyName.trim()]
    );
    const userId = result.rows[0].id;

    await query('INSERT INTO setup_progress (user_id) VALUES ($1)', [userId]);

    const userName = (req.body.userName || '').trim();
    if (userName) {
      await query(
        'INSERT INTO family_members (user_id, name, role, risk_profile, display_order) VALUES ($1, $2, $3, $4, $5)',
        [userId, userName, 'primary', 'moderate', 0]
      );
    }

    const token = generateToken(userId, email.toLowerCase().trim());

    return res.status(201).json({
      token,
      user: {
        id: userId,
        email: email.toLowerCase().trim(),
        familyName: familyName.trim()
      }
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValid = bcrypt.compareSync(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user.id, user.email);

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        familyName: user.family_name
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email and new password are required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    const result = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ error: 'No account found with that email' });
    }
    const hash = bcrypt.hashSync(newPassword, 10);
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, user.id]);
    return res.status(200).json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/me', verifyToken, async (req, res) => {
  try {
    const result = await query('SELECT id, email, family_name, created_at FROM users WHERE id = $1', [req.userId]);
    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(200).json({
      id: user.id,
      email: user.email,
      familyName: user.family_name,
      createdAt: user.created_at
    });
  } catch (err) {
    console.error('Get me error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/invite/:token', async (req, res) => {
  try {
    const result = await query('SELECT * FROM family_invitations WHERE token = $1', [req.params.token]);
    const inv = result.rows[0];
    if (!inv) return res.status(404).json({ error: 'Invite not found' });
    if (inv.status === 'accepted') return res.status(410).json({ error: 'This invite has already been used' });
    if (inv.status !== 'pending') return res.status(410).json({ error: 'This invite is no longer valid' });
    if (new Date(inv.expires_at) < new Date()) return res.status(410).json({ error: 'This invite has expired' });

    const memberRes = await query('SELECT * FROM family_members WHERE id = $1', [inv.family_member_id]);
    const member = memberRes.rows[0];
    const ownerRes = await query('SELECT family_name FROM users WHERE id = $1', [inv.inviter_user_id]);
    const owner = ownerRes.rows[0];

    return res.status(200).json({
      valid: true,
      email: inv.email,
      memberName: member ? member.name : '',
      familyName: owner ? owner.family_name : '',
      ownerUserId: inv.inviter_user_id
    });
  } catch (err) {
    console.error('GET /auth/invite/:token error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/invite/accept', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: 'Token and password are required' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

    const invRes = await query('SELECT * FROM family_invitations WHERE token = $1', [token]);
    const inv = invRes.rows[0];
    if (!inv) return res.status(404).json({ error: 'Invite not found' });
    if (inv.status !== 'pending') return res.status(410).json({ error: 'Invite already used or expired' });
    if (new Date(inv.expires_at) < new Date()) return res.status(410).json({ error: 'Invite has expired' });

    const memberRes = await query('SELECT * FROM family_members WHERE id = $1', [inv.family_member_id]);
    const member = memberRes.rows[0];
    if (!member) return res.status(404).json({ error: 'Family member not found' });

    const ownerRes = await query('SELECT family_name FROM users WHERE id = $1', [inv.inviter_user_id]);
    const owner = ownerRes.rows[0];

    const existingRes = await query('SELECT id FROM users WHERE email = $1', [inv.email.toLowerCase()]);
    if (existingRes.rows.length > 0) return res.status(409).json({ error: 'An account with this email already exists. Please log in instead.' });

    const passwordHash = bcrypt.hashSync(password, 10);
    const userResult = await query(
      'INSERT INTO users (email, password_hash, family_name) VALUES ($1, $2, $3) RETURNING id',
      [inv.email.toLowerCase(), passwordHash, owner ? owner.family_name : 'Family']
    );
    const newUserId = userResult.rows[0].id;

    await query('INSERT INTO setup_progress (user_id) VALUES ($1)', [newUserId]);
    await query('UPDATE family_members SET linked_user_id = $1 WHERE id = $2', [newUserId, member.id]);
    await query("UPDATE family_invitations SET status = 'accepted' WHERE id = $1", [inv.id]);

    const token_jwt = generateToken(newUserId, inv.email.toLowerCase(), inv.inviter_user_id);

    return res.status(201).json({
      token: token_jwt,
      user: {
        id: newUserId,
        email: inv.email.toLowerCase(),
        familyName: owner ? owner.family_name : 'Family',
        memberName: member.name
      }
    });
  } catch (err) {
    console.error('POST /auth/invite/accept error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
