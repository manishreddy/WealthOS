'use strict';

require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Helper: generate JWT token
function generateToken(userId, email) {
  return jwt.sign({ userId, email }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// POST /api/auth/signup
router.post('/signup', (req, res) => {
  try {
    const { email, password, familyName } = req.body;

    // Validate required fields
    if (!email || !password || !familyName) {
      return res.status(400).json({ error: 'Email, password, and family name are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Validate familyName not empty
    if (!familyName.trim()) {
      return res.status(400).json({ error: 'Family name cannot be empty' });
    }

    // Check if email already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    // Hash password
    const passwordHash = bcrypt.hashSync(password, 10);

    // Insert user
    const insertUser = db.prepare(
      'INSERT INTO users (email, password_hash, family_name) VALUES (?, ?, ?)'
    );
    const result = insertUser.run(email.toLowerCase().trim(), passwordHash, familyName.trim());
    const userId = result.lastInsertRowid;

    // Insert setup_progress row
    db.prepare('INSERT INTO setup_progress (user_id) VALUES (?)').run(userId);

    // Add the account creator as the first family member (primary)
    const userName = (req.body.userName || '').trim();
    if (userName) {
      db.prepare(
        'INSERT INTO family_members (user_id, name, role, risk_profile, display_order) VALUES (?, ?, ?, ?, ?)'
      ).run(userId, userName, 'primary', 'moderate', 0);
    }

    // Generate token
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

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compare password
    const isValid = bcrypt.compareSync(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
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

// GET /api/auth/me - protected
router.get('/me', verifyToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, email, family_name, created_at FROM users WHERE id = ?').get(req.userId);
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

module.exports = router;
