'use strict';

const express = require('express');
const db = require('../db');

const router = express.Router();

// Helper: compute age-based allocation targets
function computeAgeBasedTargets(age) {
  const safeAge = age && age > 0 ? age : 30;
  let equity = Math.max(100 - safeAge, 20);   // at least 20%
  let debt = Math.min(safeAge, 60);            // at most 60%
  let gold = 5;
  let others = 5;

  // Normalize so sum = 100
  const total = equity + debt + gold + others;
  if (total !== 100) {
    const diff = 100 - total;
    equity = equity + diff; // absorb difference in equity
  }

  return { equity, debt, gold, others };
}

// Helper: update setup_progress family_done
function markFamilyDone(userId) {
  db.prepare(
    'UPDATE setup_progress SET family_done = 1, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?'
  ).run(userId);
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
      members: members.map(m => ({
        id: m.id,
        name: m.name,
        age: m.age,
        role: m.role,
        riskProfile: m.risk_profile,
        isActive: m.is_active === 1,
        displayOrder: m.display_order,
        createdAt: m.created_at
      }))
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

    return res.status(200).json(members.map(m => ({
      id: m.id,
      name: m.name,
      age: m.age,
      role: m.role,
      riskProfile: m.risk_profile,
      isActive: m.is_active === 1,
      displayOrder: m.display_order,
      createdAt: m.created_at
    })));
  } catch (err) {
    console.error('GET /family/members error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/family/members - add new member
router.post('/members', (req, res) => {
  try {
    const { name, age, role, riskProfile } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Member name is required' });
    }

    const safeAge = age ? parseInt(age, 10) : null;
    const safeRole = role || 'member';
    const safeRiskProfile = riskProfile || 'moderate';

    // Get current max display_order for this user
    const maxOrder = db.prepare(
      'SELECT MAX(display_order) as max_order FROM family_members WHERE user_id = ?'
    ).get(req.userId);
    const nextOrder = (maxOrder && maxOrder.max_order !== null) ? maxOrder.max_order + 1 : 0;

    // Insert member
    const result = db.prepare(
      'INSERT INTO family_members (user_id, name, age, role, risk_profile, display_order) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(req.userId, name.trim(), safeAge, safeRole, safeRiskProfile, nextOrder);

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

    // Mark setup progress
    markFamilyDone(req.userId);

    // Fetch and return the created member
    const member = db.prepare('SELECT * FROM family_members WHERE id = ?').get(memberId);
    return res.status(201).json({
      id: member.id,
      name: member.name,
      age: member.age,
      role: member.role,
      riskProfile: member.risk_profile,
      isActive: member.is_active === 1,
      displayOrder: member.display_order,
      createdAt: member.created_at
    });
  } catch (err) {
    console.error('POST /family/members error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/family/members/:id - update member
router.put('/members/:id', (req, res) => {
  try {
    const memberId = parseInt(req.params.id, 10);
    const { name, age, role, riskProfile } = req.body;

    // Verify member belongs to this user
    const existing = db.prepare(
      'SELECT * FROM family_members WHERE id = ? AND user_id = ?'
    ).get(memberId, req.userId);

    if (!existing) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const newName = name ? name.trim() : existing.name;
    const newAge = age !== undefined ? parseInt(age, 10) : existing.age;
    const newRole = role || existing.role;
    const newRiskProfile = riskProfile || existing.risk_profile;

    if (!newName) {
      return res.status(400).json({ error: 'Member name cannot be empty' });
    }

    db.prepare(
      'UPDATE family_members SET name = ?, age = ?, role = ?, risk_profile = ? WHERE id = ? AND user_id = ?'
    ).run(newName, newAge, newRole, newRiskProfile, memberId, req.userId);

    // Update savings_targets if age changed
    if (age !== undefined) {
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

    // Mark setup progress
    markFamilyDone(req.userId);

    // Return updated member
    const updated = db.prepare('SELECT * FROM family_members WHERE id = ?').get(memberId);
    return res.status(200).json({
      id: updated.id,
      name: updated.name,
      age: updated.age,
      role: updated.role,
      riskProfile: updated.risk_profile,
      isActive: updated.is_active === 1,
      displayOrder: updated.display_order,
      createdAt: updated.created_at
    });
  } catch (err) {
    console.error('PUT /family/members/:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/family/members/:id - soft delete
router.delete('/members/:id', (req, res) => {
  try {
    const memberId = parseInt(req.params.id, 10);

    // Verify member belongs to this user
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
