'use strict';

const crypto = require('crypto');
const express = require('express');
const db = require('../db');
const { sendInviteEmail } = require('../email');

const router = express.Router();

// Helper: compute age from DOB string (YYYY-MM-DD)
function ageFromDob(dob) {
  if (!dob) return null;
  const today = new Date();
  const birth = new Date(dob);
  if (isNaN(birth)) return null;
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

// Helper: compute age-based allocation targets
function computeAgeBasedTargets(age) {
  const safeAge = age && age > 0 ? age : 30;
  let equity = Math.max(100 - safeAge, 20);   // at least 20%
  let debt = Math.min(safeAge, 60);            // at most 60%
  let gold = 5;
  let others = 5;

  const total = equity + debt + gold + others;
  if (total !== 100) {
    const diff = 100 - total;
    equity = equity + diff;
  }

  return { equity, debt, gold, others };
}

// Helper: update setup_progress family_done
function markFamilyDone(userId) {
  db.prepare(
    'UPDATE setup_progress SET family_done = 1, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?'
  ).run(userId);
}

// Helper: get invite status for a member
function getMemberInviteStatus(memberId) {
  const inv = db.prepare(
    'SELECT status, expires_at FROM family_invitations WHERE family_member_id = ? ORDER BY created_at DESC LIMIT 1'
  ).get(memberId);
  if (!inv) return null;
  if (inv.status === 'accepted') return 'accepted';
  if (new Date(inv.expires_at) < new Date()) return 'expired';
  return 'pending';
}

// Helper: format member for API response
function formatMember(m) {
  return {
    id: m.id,
    name: m.name,
    dob: m.dob || '',
    age: m.age,
    role: m.role,
    riskProfile: m.risk_profile,
    email: m.email || '',
    linkedUserId: m.linked_user_id || null,
    inviteStatus: m.email ? getMemberInviteStatus(m.id) : null,
    isActive: m.is_active === 1,
    displayOrder: m.display_order,
    createdAt: m.created_at
  };
}

// Helper: create and send invite for a member
async function createAndSendInvite(member, inviterUserId, appUrl) {
  if (!member.email) return;

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  // Invalidate previous invites for this member
  db.prepare(
    "UPDATE family_invitations SET status = 'superseded' WHERE family_member_id = ? AND status = 'pending'"
  ).run(member.id);

  db.prepare(
    'INSERT INTO family_invitations (family_member_id, inviter_user_id, email, token, status, expires_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(member.id, inviterUserId, member.email, token, 'pending', expiresAt);

  const inviter = db.prepare('SELECT family_name FROM users WHERE id = ?').get(inviterUserId);
  const inviteUrl = `${appUrl}/invite.html?token=${token}`;

  try {
    await sendInviteEmail({
      toEmail: member.email,
      inviterName: inviter ? inviter.family_name : 'Your family',
      familyName: inviter ? inviter.family_name : 'WealthOS Family',
      memberName: member.name,
      inviteUrl
    });
  } catch (err) {
    console.error('Failed to send invite email:', err.message);
  }
}

function getAppUrl(req) {
  return process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
}

// GET /api/family - returns familyName + members
router.get('/', (req, res) => {
  try {
    const user = db.prepare('SELECT family_name FROM users WHERE id = ?').get(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const members = db.prepare(
      'SELECT * FROM family_members WHERE user_id = ? AND is_active = 1 ORDER BY display_order ASC, id ASC'
    ).all(req.userId);

    return res.status(200).json({
      familyName: user.family_name,
      members: members.map(formatMember)
    });
  } catch (err) {
    console.error('GET /family error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/family - update family name
router.put('/', (req, res) => {
  try {
    const { familyName } = req.body;
    if (!familyName || !familyName.trim()) {
      return res.status(400).json({ error: 'Family name is required' });
    }
    db.prepare('UPDATE users SET family_name = ? WHERE id = ?').run(familyName.trim(), req.userId);
    return res.status(200).json({ familyName: familyName.trim() });
  } catch (err) {
    console.error('PUT /family error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/family/members - list active members
router.get('/members', (req, res) => {
  try {
    const members = db.prepare(
      'SELECT * FROM family_members WHERE user_id = ? AND is_active = 1 ORDER BY display_order ASC, id ASC'
    ).all(req.userId);

    return res.status(200).json(members.map(formatMember));
  } catch (err) {
    console.error('GET /family/members error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/family/members - add new member
router.post('/members', async (req, res) => {
  try {
    const { name, age, dob, role, riskProfile, email } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Member name is required' });
    }

    const safeDob = dob || '';
    const safeAge = dob ? ageFromDob(dob) : (age ? parseInt(age, 10) : null);
    const safeRole = role || 'member';
    const safeRiskProfile = riskProfile || 'moderate';
    const safeEmail = (email || '').trim().toLowerCase();

    // Get current max display_order for this user
    const maxOrder = db.prepare(
      'SELECT MAX(display_order) as max_order FROM family_members WHERE user_id = ?'
    ).get(req.userId);
    const nextOrder = (maxOrder && maxOrder.max_order !== null) ? maxOrder.max_order + 1 : 0;

    // Insert member
    const result = db.prepare(
      'INSERT INTO family_members (user_id, name, dob, age, role, risk_profile, email, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(req.userId, name.trim(), safeDob, safeAge, safeRole, safeRiskProfile, safeEmail, nextOrder);

    const memberId = result.lastInsertRowid;

    // Upsert savings_targets with age-based defaults
    const targets = computeAgeBasedTargets(safeAge);
    db.prepare(`
      INSERT INTO savings_targets (user_id, member_id, equity_pct, debt_pct, gold_pct, others_pct, use_age_based)
      VALUES (?, ?, ?, ?, ?, ?, 1)
      ON CONFLICT(user_id, member_id) DO UPDATE SET
        equity_pct = excluded.equity_pct,
        debt_pct = excluded.debt_pct,
        gold_pct = excluded.gold_pct,
        others_pct = excluded.others_pct
    `).run(req.userId, memberId, targets.equity, targets.debt, targets.gold, targets.others);

    markFamilyDone(req.userId);

    const member = db.prepare('SELECT * FROM family_members WHERE id = ?').get(memberId);

    // Send invite if email provided
    if (safeEmail) {
      await createAndSendInvite(member, req.userId, getAppUrl(req));
    }

    return res.status(201).json(formatMember(db.prepare('SELECT * FROM family_members WHERE id = ?').get(memberId)));
  } catch (err) {
    console.error('POST /family/members error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/family/members/:id - update member
router.put('/members/:id', async (req, res) => {
  try {
    const memberId = parseInt(req.params.id, 10);
    const { name, age, dob, role, riskProfile, email } = req.body;

    const existing = db.prepare(
      'SELECT * FROM family_members WHERE id = ? AND user_id = ?'
    ).get(memberId, req.userId);

    if (!existing) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const newName = name ? name.trim() : existing.name;
    const newDob = dob !== undefined ? dob : (existing.dob || '');
    const newAge = newDob ? ageFromDob(newDob) : (age !== undefined ? parseInt(age, 10) : existing.age);
    const newRole = role || existing.role;
    const newRiskProfile = riskProfile || existing.risk_profile;
    const newEmail = email !== undefined ? (email || '').trim().toLowerCase() : (existing.email || '');

    if (!newName) {
      return res.status(400).json({ error: 'Member name cannot be empty' });
    }

    db.prepare(
      'UPDATE family_members SET name = ?, dob = ?, age = ?, role = ?, risk_profile = ?, email = ? WHERE id = ? AND user_id = ?'
    ).run(newName, newDob, newAge, newRole, newRiskProfile, newEmail, memberId, req.userId);

    if (dob !== undefined || age !== undefined) {
      const targets = computeAgeBasedTargets(newAge);
      const existingTargets = db.prepare(
        'SELECT * FROM savings_targets WHERE user_id = ? AND member_id = ?'
      ).get(req.userId, memberId);

      if (existingTargets && existingTargets.use_age_based === 1) {
        db.prepare(
          'UPDATE savings_targets SET equity_pct = ?, debt_pct = ?, gold_pct = ?, others_pct = ? WHERE user_id = ? AND member_id = ?'
        ).run(targets.equity, targets.debt, targets.gold, targets.others, req.userId, memberId);
      }
    }

    markFamilyDone(req.userId);

    const updated = db.prepare('SELECT * FROM family_members WHERE id = ?').get(memberId);

    // Send invite if a new email was set (and member not already linked)
    const emailChanged = newEmail && newEmail !== (existing.email || '');
    if (emailChanged && !updated.linked_user_id) {
      await createAndSendInvite(updated, req.userId, getAppUrl(req));
    }

    return res.status(200).json(formatMember(db.prepare('SELECT * FROM family_members WHERE id = ?').get(memberId)));
  } catch (err) {
    console.error('PUT /family/members/:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/family/members/:id/resend-invite - resend invite email
router.post('/members/:id/resend-invite', async (req, res) => {
  try {
    const memberId = parseInt(req.params.id, 10);
    const member = db.prepare(
      'SELECT * FROM family_members WHERE id = ? AND user_id = ? AND is_active = 1'
    ).get(memberId, req.userId);

    if (!member) return res.status(404).json({ error: 'Member not found' });
    if (!member.email) return res.status(400).json({ error: 'Member has no email address' });
    if (member.linked_user_id) return res.status(400).json({ error: 'Member has already accepted the invite' });

    await createAndSendInvite(member, req.userId, getAppUrl(req));
    return res.status(200).json({ success: true, message: 'Invite sent' });
  } catch (err) {
    console.error('POST /family/members/:id/resend-invite error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/family/members/:id - soft delete
router.delete('/members/:id', (req, res) => {
  try {
    const memberId = parseInt(req.params.id, 10);

    const existing = db.prepare(
      'SELECT * FROM family_members WHERE id = ? AND user_id = ?'
    ).get(memberId, req.userId);

    if (!existing) {
      return res.status(404).json({ error: 'Member not found' });
    }

    db.prepare(
      'UPDATE family_members SET is_active = 0 WHERE id = ? AND user_id = ?'
    ).run(memberId, req.userId);

    return res.status(200).json({ success: true, message: 'Member deactivated successfully' });
  } catch (err) {
    console.error('DELETE /family/members/:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
