'use strict';

const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { query } = require('./db');

let _adminClient = null;
function getAdminClient() {
  if (!_adminClient) {
    _adminClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  }
  return _adminClient;
}

async function setupAuth(app) {
  app.use((req, res, next) => {
    req.isAuthenticated = () => !!req.userId;
    next();
  });
}

function registerAuthRoutes(app) {
  const { verifyToken } = require('./middleware/auth');

  // Returns Supabase public config so frontend can init the client
  app.get('/api/config', (req, res) => {
    res.json({
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY
    });
  });

  app.get('/login', (req, res) => res.sendFile(path.join(__dirname, '../code/login.html')));
  app.get('/api/login', (req, res) => res.redirect('/login'));
  app.get('/api/logout', (req, res) => res.redirect('/login'));

  // Called by frontend after supabase.auth.signUp() to create the users row
  app.post('/api/auth/provision', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
    const token = authHeader.slice(7);
    const supabaseAdmin = getAdminClient();
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const { name } = req.body;
      const result = await query(
        `INSERT INTO users (email, supabase_auth_id, family_name, full_name)
         VALUES ($1, $2, 'My Family', $3)
         ON CONFLICT (supabase_auth_id) DO UPDATE SET email = EXCLUDED.email
         RETURNING *`,
        [user.email, user.id, name || null]
      );
      const appUser = result.rows[0];
      await query('INSERT INTO setup_progress (user_id) VALUES ($1) ON CONFLICT DO NOTHING', [appUser.id]);
      if (name) {
        await query(
          `INSERT INTO family_members (user_id, name, role, risk_profile, display_order)
           SELECT $1, $2, 'primary', 'moderate', 0
           WHERE NOT EXISTS (SELECT 1 FROM family_members WHERE user_id = $1 AND role = 'primary')`,
          [appUser.id, name]
        ).catch(() => {});
      }
      return res.json({ success: true, userId: appUser.id });
    } catch (err) {
      console.error('provision error:', err);
      return res.status(500).json({ error: 'Failed to provision user' });
    }
  });

  // /api/auth/user has its own JWT check (needed for auth-status polling before verifyToken)
  app.get('/api/auth/user', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Not authenticated' });
    const token = authHeader.slice(7);
    const supabaseAdmin = getAdminClient();
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: 'Not authenticated' });
    try {
      const result = await query(
        `SELECT u.id, u.email, u.family_name, u.full_name, u.created_at,
                fm.dob, fm.age
         FROM users u
         LEFT JOIN family_members fm ON fm.user_id = u.id AND fm.role = 'primary'
         WHERE u.supabase_auth_id = $1`,
        [user.id]
      );
      const appUser = result.rows[0];
      if (!appUser) return res.status(401).json({ error: 'User not provisioned' });
      return res.json({
        id: appUser.id, email: appUser.email,
        name: appUser.full_name || null,
        familyName: appUser.family_name,
        createdAt: appUser.created_at,
        dob: appUser.dob || null,
        age: appUser.age || null,
      });
    } catch (err) {
      console.error('auth/user error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put('/api/auth/profile', verifyToken, async (req, res) => {
    const { name, age, dob } = req.body;
    const userId = req.userId;
    function ageFromDob(dobStr) {
      if (!dobStr) return null;
      const today = new Date(), birth = new Date(dobStr);
      if (isNaN(birth.getTime())) return null;
      let a = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) a--;
      return (a >= 0 && a <= 120) ? a : null;
    }
    try {
      if (name) await query('UPDATE users SET full_name = $1 WHERE id = $2', [name, userId]);
      const safeDob = dob || null;
      const safeAge = safeDob ? ageFromDob(safeDob) : (age ? (parseInt(age, 10) || null) : null);
      const check = await query("SELECT id FROM family_members WHERE user_id = $1 AND role = 'primary'", [userId]);
      if (check.rowCount > 0) {
        const cols = [], vals = [];
        let i = 1;
        if (name) { cols.push(`name = $${i++}`); vals.push(name); }
        if (safeDob !== null) { cols.push(`dob = $${i++}`); vals.push(safeDob); }
        if (safeAge !== null) { cols.push(`age = $${i++}`); vals.push(safeAge); }
        if (cols.length) {
          vals.push(userId);
          await query(`UPDATE family_members SET ${cols.join(', ')} WHERE user_id = $${i} AND role = 'primary'`, vals);
        }
      } else if (name) {
        await query(
          `INSERT INTO family_members (user_id, name, role, age, dob, risk_profile, display_order) VALUES ($1, $2, 'primary', $3, $4, 'moderate', 0)`,
          [userId, name, safeAge, safeDob || '']
        );
      }
      await query('UPDATE setup_progress SET family_done = 1, updated_at = NOW() WHERE user_id = $1', [userId]);
      res.json({ ok: true });
    } catch (err) {
      console.error('PUT /api/auth/profile error:', err);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  app.get('/api/auth/callback', (req, res) => res.redirect('/dashboard.html'));
}

module.exports = { setupAuth, registerAuthRoutes };
