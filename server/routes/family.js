'use strict';

const crypto = require('crypto');
const express = require('express');
const { query } = require('../db');
const { sendInviteEmail } = require('../email');

const router = express.Router();

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

function computeAgeBasedTargets(age) {
  const safeAge = age && age > 0 ? age : 30;
  let equity = Math.max(100 - safeAge, 20);
  let debt = Math.min(safeAge, 60);
  let gold = 5;
  let others = 5;
  const total = equity + debt + gold + others;
  if (total !== 100) {
    equity = equity + (100 - total);
  }
  return { equity, debt, gold, others };
}

async function markFamilyDone(userId) {
  await query(
    'UPDATE setup_progress SET family_done = 1, updated_at = NOW() WHERE user_id = $1',
    [userId]
  );
}

async function getMemberInviteStatus(memberId) {
  const result = await query(
    'SELECT status, expires_at FROM family_invitations WHERE family_member_id = $1 ORDER BY created_at DESC LIMIT 1',
    [memberId]
  );
  const inv = result.rows[0];
  if (!inv) return null;
  if (inv.status === 'accepted') return 'accepted';
  if (new Date(inv.expires_at) < new Date()) return 'expired';
  return 'pending';
}

async function formatMember(m) {
  const inviteStatus = m.email ? await getMemberInviteStatus(m.id) : null;
  return {
    id: m.id,
    name: m.name,
    dob: m.dob || '',
    age: m.age,
    role: m.role,
    riskProfile: m.risk_profile,
    email: m.email || '',
    linkedUserId: m.linked_user_id || null,
    inviteStatus,
    isActive: m.is_active === 1,
    displayOrder: m.display_order,
    createdAt: m.created_at
  };
}

async function createAndSendInvite(member, inviterUserId, appUrl) {
  if (!member.email) return;

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  await query(
    "UPDATE family_invitations SET status = 'superseded' WHERE family_member_id = $1 AND status = 'pending'",
    [member.id]
  );

  await query(
    'INSERT INTO family_invitations (family_member_id, inviter_user_id, email, token, status, expires_at) VALUES ($1, $2, $3, $4, $5, $6)',
    [member.id, inviterUserId, member.email, token, 'pending', expiresAt]
  );

  const inviterRes = await query('SELECT family_name FROM users WHERE id = $1', [inviterUserId]);
  const inviter = inviterRes.rows[0];
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

router.get('/', async (req, res) => {
  try {
    const userRes = await query('SELECT family_name FROM users WHERE id = $1', [req.userId]);
    const user = userRes.rows[0];
    if (!user) return res.status(404).json({ error: 'User not found' });

    const membersRes = await query(
      'SELECT * FROM family_members WHERE user_id = $1 AND is_active = 1 ORDER BY display_order ASC, id ASC',
      [req.userId]
    );

    const members = await Promise.all(membersRes.rows.map(formatMember));

    return res.status(200).json({
      familyName: user.family_name,
      members
    });
  } catch (err) {
    console.error('GET /family error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/', async (req, res) => {
  try {
    const { familyName } = req.body;
    if (!familyName || !familyName.trim()) {
      return res.status(400).json({ error: 'Family name is required' });
    }
    await query('UPDATE users SET family_name = $1 WHERE id = $2', [familyName.trim(), req.userId]);
    return res.status(200).json({ familyName: familyName.trim() });
  } catch (err) {
    console.error('PUT /family error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/members', async (req, res) => {
  try {
    const membersRes = await query(
      'SELECT * FROM family_members WHERE user_id = $1 AND is_active = 1 ORDER BY display_order ASC, id ASC',
      [req.userId]
    );
    const members = await Promise.all(membersRes.rows.map(formatMember));
    return res.status(200).json(members);
  } catch (err) {
    console.error('GET /family/members error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

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

    const maxOrderRes = await query(
      'SELECT MAX(display_order) as max_order FROM family_members WHERE user_id = $1',
      [req.userId]
    );
    const maxOrder = maxOrderRes.rows[0];
    const nextOrder = (maxOrder && maxOrder.max_order !== null) ? parseInt(maxOrder.max_order) + 1 : 0;

    const result = await query(
      'INSERT INTO family_members (user_id, name, dob, age, role, risk_profile, email, display_order) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      [req.userId, name.trim(), safeDob, safeAge, safeRole, safeRiskProfile, safeEmail, nextOrder]
    );
    const memberId = result.rows[0].id;

    const targets = computeAgeBasedTargets(safeAge);
    await query(`
      INSERT INTO savings_targets (user_id, member_id, equity_pct, debt_pct, gold_pct, others_pct, use_age_based)
      VALUES ($1, $2, $3, $4, $5, $6, 1)
      ON CONFLICT (user_id, member_id) DO UPDATE SET
        equity_pct = EXCLUDED.equity_pct,
        debt_pct = EXCLUDED.debt_pct,
        gold_pct = EXCLUDED.gold_pct,
        others_pct = EXCLUDED.others_pct
    `, [req.userId, memberId, targets.equity, targets.debt, targets.gold, targets.others]);

    await markFamilyDone(req.userId);

    const memberRes = await query('SELECT * FROM family_members WHERE id = $1', [memberId]);
    const member = memberRes.rows[0];

    if (safeEmail) {
      await createAndSendInvite(member, req.userId, getAppUrl(req));
    }

    const refreshed = await query('SELECT * FROM family_members WHERE id = $1', [memberId]);
    return res.status(201).json(await formatMember(refreshed.rows[0]));
  } catch (err) {
    console.error('POST /family/members error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/members/:id', async (req, res) => {
  try {
    const memberId = parseInt(req.params.id, 10);
    const { name, age, dob, role, riskProfile, email } = req.body;

    const existingRes = await query(
      'SELECT * FROM family_members WHERE id = $1 AND user_id = $2',
      [memberId, req.userId]
    );
    const existing = existingRes.rows[0];
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

    await query(
      'UPDATE family_members SET name = $1, dob = $2, age = $3, role = $4, risk_profile = $5, email = $6 WHERE id = $7 AND user_id = $8',
      [newName, newDob, newAge, newRole, newRiskProfile, newEmail, memberId, req.userId]
    );

    if (dob !== undefined || age !== undefined) {
      const targets = computeAgeBasedTargets(newAge);
      const targetsRes = await query(
        'SELECT * FROM savings_targets WHERE user_id = $1 AND member_id = $2',
        [req.userId, memberId]
      );
      const existingTargets = targetsRes.rows[0];

      if (existingTargets && existingTargets.use_age_based === 1) {
        await query(
          'UPDATE savings_targets SET equity_pct = $1, debt_pct = $2, gold_pct = $3, others_pct = $4 WHERE user_id = $5 AND member_id = $6',
          [targets.equity, targets.debt, targets.gold, targets.others, req.userId, memberId]
        );
      }
    }

    await markFamilyDone(req.userId);

    const updatedRes = await query('SELECT * FROM family_members WHERE id = $1', [memberId]);
    const updated = updatedRes.rows[0];

    const emailChanged = newEmail && newEmail !== (existing.email || '');
    if (emailChanged && !updated.linked_user_id) {
      await createAndSendInvite(updated, req.userId, getAppUrl(req));
    }

    const refreshedRes = await query('SELECT * FROM family_members WHERE id = $1', [memberId]);
    return res.status(200).json(await formatMember(refreshedRes.rows[0]));
  } catch (err) {
    console.error('PUT /family/members/:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/members/:id/resend-invite', async (req, res) => {
  try {
    const memberId = parseInt(req.params.id, 10);
    const memberRes = await query(
      'SELECT * FROM family_members WHERE id = $1 AND user_id = $2 AND is_active = 1',
      [memberId, req.userId]
    );
    const member = memberRes.rows[0];

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

router.delete('/members/:id', async (req, res) => {
  try {
    const memberId = parseInt(req.params.id, 10);

    const existingRes = await query(
      'SELECT * FROM family_members WHERE id = $1 AND user_id = $2',
      [memberId, req.userId]
    );
    if (!existingRes.rows[0]) {
      return res.status(404).json({ error: 'Member not found' });
    }

    await query(
      'UPDATE family_members SET is_active = 0 WHERE id = $1 AND user_id = $2',
      [memberId, req.userId]
    );

    return res.status(200).json({ success: true, message: 'Member deactivated successfully' });
  } catch (err) {
    console.error('DELETE /family/members/:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
