'use strict';

const express = require('express');
const db = require('../db');

const router = express.Router();

const STEPS = ['family', 'monthly', 'savings', 'portfolio', 'goals', 'planning'];

const STEP_COLUMNS = {
  family: 'family_done',
  monthly: 'monthly_done',
  savings: 'savings_done',
  portfolio: 'portfolio_done',
  goals: 'goals_done',
  planning: 'planning_done'
};

function formatProgress(row) {
  if (!row) {
    return {
      familyDone: false,
      monthlyDone: false,
      savingsDone: false,
      portfolioDone: false,
      goalsDone: false,
      planningDone: false,
      percentComplete: 0,
      nextStep: 'family'
    };
  }

  const doneFlags = {
    family: row.family_done === 1,
    monthly: row.monthly_done === 1,
    savings: row.savings_done === 1,
    portfolio: row.portfolio_done === 1,
    goals: row.goals_done === 1,
    planning: row.planning_done === 1
  };

  const doneCount = Object.values(doneFlags).filter(Boolean).length;
  const percentComplete = parseFloat(((doneCount / STEPS.length) * 100).toFixed(2));

  const nextStep = STEPS.find(step => !doneFlags[step]) || null;

  return {
    familyDone: doneFlags.family,
    monthlyDone: doneFlags.monthly,
    savingsDone: doneFlags.savings,
    portfolioDone: doneFlags.portfolio,
    goalsDone: doneFlags.goals,
    planningDone: doneFlags.planning,
    percentComplete,
    nextStep,
    updatedAt: row.updated_at
  };
}

// GET /api/setup/progress
router.get('/progress', (req, res) => {
  try {
    const row = db.prepare(
      'SELECT * FROM setup_progress WHERE user_id = ?'
    ).get(req.userId);

    return res.status(200).json(formatProgress(row));
  } catch (err) {
    console.error('GET /setup/progress error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/setup/progress - body: { step, done }
router.put('/progress', (req, res) => {
  try {
    const { step, done } = req.body;

    if (!step) {
      return res.status(400).json({ error: 'Step is required' });
    }

    if (!STEPS.includes(step)) {
      return res.status(400).json({ error: `Invalid step. Must be one of: ${STEPS.join(', ')}` });
    }

    if (done === undefined || done === null) {
      return res.status(400).json({ error: 'Done flag is required' });
    }

    const col = STEP_COLUMNS[step];
    const doneInt = done ? 1 : 0;

    db.prepare(
      `UPDATE setup_progress SET ${col} = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`
    ).run(doneInt, req.userId);

    const updated = db.prepare(
      'SELECT * FROM setup_progress WHERE user_id = ?'
    ).get(req.userId);

    return res.status(200).json(formatProgress(updated));
  } catch (err) {
    console.error('PUT /setup/progress error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
