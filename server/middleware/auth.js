'use strict';

const { query } = require('../db');

async function verifyToken(req, res, next) {
  if (!req.isAuthenticated || !req.isAuthenticated() || !req.session?.appUserId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const appUserId = req.session.appUserId;

  if (req.session.ownerResolved) {
    req.userId = req.session.cachedOwnerUserId || appUserId;
    req.actualUserId = appUserId;
    req.userEmail = req.session.appUserEmail || '';
    return next();
  }

  try {
    const memberCheck = await query(
      'SELECT fm.user_id FROM family_members fm WHERE fm.linked_user_id = $1 AND fm.user_id != $1 LIMIT 1',
      [appUserId]
    );

    if (memberCheck.rows.length > 0) {
      const ownerUserId = memberCheck.rows[0].user_id;
      req.session.cachedOwnerUserId = ownerUserId;
      req.session.ownerResolved = true;
      req.userId = ownerUserId;
    } else {
      req.session.cachedOwnerUserId = null;
      req.session.ownerResolved = true;
      req.userId = appUserId;
    }

    req.actualUserId = appUserId;
    req.userEmail = req.session.appUserEmail || '';
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { verifyToken };
