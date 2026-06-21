'use strict';

const { createClient } = require('@supabase/supabase-js');
const { query } = require('../db');

let _adminClient = null;
function getAdminClient() {
  if (!_adminClient) {
    _adminClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  }
  return _adminClient;
}

async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.slice(7);
  const supabaseAdmin = getAdminClient();
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const result = await query(
      `SELECT u.id, fm.user_id AS owner_id
       FROM users u
       LEFT JOIN family_members fm ON fm.linked_user_id = u.id AND fm.user_id != u.id
       WHERE u.supabase_auth_id = $1
       LIMIT 1`,
      [user.id]
    );
    if (!result.rows.length) return res.status(401).json({ error: 'User not provisioned' });
    const row = result.rows[0];
    req.actualUserId = row.id;
    req.userId = row.owner_id || row.id;
    req.userEmail = user.email;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { verifyToken };
