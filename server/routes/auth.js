'use strict';

const express = require('express');
const { query } = require('../db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

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

router.post('/invite/accept', verifyToken, async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token is required' });

    const invRes = await query('SELECT * FROM family_invitations WHERE token = $1', [token]);
    const inv = invRes.rows[0];
    if (!inv) return res.status(404).json({ error: 'Invite not found' });
    if (inv.status !== 'pending') return res.status(410).json({ error: 'Invite already used or expired' });
    if (new Date(inv.expires_at) < new Date()) return res.status(410).json({ error: 'Invite has expired' });

    const appUserId = req.userId;
    const appUserEmail = req.userEmail || '';
    if (inv.email && appUserEmail && inv.email.toLowerCase() !== appUserEmail.toLowerCase()) {
      return res.status(403).json({ error: 'This invite was sent to a different email address.' });
    }

    const memberRes = await query('SELECT * FROM family_members WHERE id = $1', [inv.family_member_id]);
    const member = memberRes.rows[0];
    if (!member) return res.status(404).json({ error: 'Family member not found' });

    await query('UPDATE family_members SET linked_user_id = $1 WHERE id = $2', [appUserId, member.id]);
    await query("UPDATE family_invitations SET status = 'accepted' WHERE id = $1", [inv.id]);
    await query('INSERT INTO setup_progress (user_id) VALUES ($1) ON CONFLICT DO NOTHING', [appUserId]);

    return res.status(200).json({
      success: true,
      user: {
        id: appUserId,
        memberName: member.name
      }
    });
  } catch (err) {
    console.error('POST /auth/invite/accept error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
