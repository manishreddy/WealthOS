'use strict';

require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Helper: generate JWT token
// ownerUserId: set for invited family members so their data queries route to the owner
function generateToken(userId, email, ownerUserId) {
  const payload = { userId, email };
  if (ownerUserId && ownerUserId !== userId) payload.ownerUserId = ownerUserId;
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
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

// POST /api/auth/reset-password
router.post('/reset-password', (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email and new password are required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (!user) {
      return res.status(404).json({ error: 'No account found with that email' });
    }
    const hash = bcrypt.hashSync(newPassword, 10);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, user.id);
    return res.status(200).json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
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

// GET /api/auth/invite/:token - validate invite token
router.get('/invite/:token', (req, res) => {
  try {
    const inv = db.prepare('SELECT * FROM family_invitations WHERE token = ?').get(req.params.token);
    if (!inv) return res.status(404).json({ error: 'Invite not found' });
    if (inv.status === 'accepted') return res.status(410).json({ error: 'This invite has already been used' });
    if (inv.status !== 'pending') return res.status(410).json({ error: 'This invite is no longer valid' });
    if (new Date(inv.expires_at) < new Date()) return res.status(410).json({ error: 'This invite has expired' });

    const member = db.prepare('SELECT * FROM family_members WHERE id = ?').get(inv.family_member_id);
    const owner = db.prepare('SELECT family_name FROM users WHERE id = ?').get(inv.inviter_user_id);

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

// POST /api/auth/invite/accept - create account via invite
router.post('/invite/accept', (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: 'Token and password are required' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

    const inv = db.prepare('SELECT * FROM family_invitations WHERE token = ?').get(token);
    if (!inv) return res.status(404).json({ error: 'Invite not found' });
    if (inv.status !== 'pending') return res.status(410).json({ error: 'Invite already used or expired' });
    if (new Date(inv.expires_at) < new Date()) return res.status(410).json({ error: 'Invite has expired' });

    const member = db.prepare('SELECT * FROM family_members WHERE id = ?').get(inv.family_member_id);
    if (!member) return res.status(404).json({ error: 'Family member not found' });

    const owner = db.prepare('SELECT family_name FROM users WHERE id = ?').get(inv.inviter_user_id);

    // Check if email already has an account
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(inv.email.toLowerCase());
    if (existing) return res.status(409).json({ error: 'An account with this email already exists. Please log in instead.' });

    const passwordHash = bcrypt.hashSync(password, 10);
    const result = db.prepare(
      'INSERT INTO users (email, password_hash, family_name) VALUES (?, ?, ?)'
    ).run(inv.email.toLowerCase(), passwordHash, owner ? owner.family_name : 'Family');
    const newUserId = result.lastInsertRowid;

    db.prepare('INSERT INTO setup_progress (user_id) VALUES (?)').run(newUserId);

    // Link the family member to the new user
    db.prepare('UPDATE family_members SET linked_user_id = ? WHERE id = ?').run(newUserId, member.id);

    // Mark invite as accepted
    db.prepare("UPDATE family_invitations SET status = 'accepted' WHERE id = ?").run(inv.id);

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
