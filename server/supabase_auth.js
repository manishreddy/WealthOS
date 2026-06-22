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

  // Temporary diagnostic: tests multiple DB connection paths from Vercel runtime
  app.get('/api/health/db', async (req, res) => {
    const dns = require('dns').promises;
    const net = require('net');
    const { Pool } = require('pg');

    const DIRECT_HOST = 'db.tfgovjiwyrepdinmkkzr.supabase.co';
    const POOLER_HOST = 'aws-0-ap-south-1.pooler.supabase.com';
    const DB_USER = 'postgres.tfgovjiwyrepdinmkkzr';
    const DB_NAME = 'postgres';

    // Helper: DNS lookup
    async function dnsCheck(h) {
      try { return await dns.lookup(h, { all: true }); } catch (e) { return { err: e.message }; }
    }

    // Helper: TCP reachability
    async function tcpCheck(h, p) {
      return new Promise(resolve => {
        const s = net.createConnection({ host: h, port: p, timeout: 4000 });
        s.once('connect', () => { s.destroy(); resolve('ok'); });
        s.once('error', e => { s.destroy(); resolve({ err: e.message }); });
        s.once('timeout', () => { s.destroy(); resolve({ err: 'timeout' }); });
      });
    }

    // Helper: PostgreSQL SELECT 1
    async function pgCheck(opts) {
      const p = new Pool({ ...opts, max: 1, connectionTimeoutMillis: 6000 });
      try {
        const r = await p.query('SELECT 1 AS ok');
        return r.rows[0];
      } catch (e) {
        return { err: e.message, code: e.code };
      } finally {
        await p.end().catch(() => {});
      }
    }

    const pwd = (() => {
      const m = (process.env.DATABASE_URL || '').match(/\/\/[^:]+:([^@]+)@/);
      if (!m) return '';
      return decodeURIComponent(m[1].replace(/\+/g, '%2B'));
    })();

    const ssl = { rejectUnauthorized: false };

    const [directDns, poolerDns, directTcp5432, pooler5432Tcp, pooler6543Tcp,
           directPg, poolerPg5432, poolerPg6543, poolerPg5432plain, poolerPg6543plain] = await Promise.all([
      dnsCheck(DIRECT_HOST),
      dnsCheck(POOLER_HOST),
      tcpCheck(DIRECT_HOST, 5432),
      tcpCheck(POOLER_HOST, 5432),
      tcpCheck(POOLER_HOST, 6543),
      pgCheck({ user: 'postgres', password: pwd, host: DIRECT_HOST, port: 5432, database: DB_NAME, ssl }),
      pgCheck({ user: DB_USER, password: pwd, host: POOLER_HOST, port: 5432, database: DB_NAME, ssl }),
      pgCheck({ user: DB_USER, password: pwd, host: POOLER_HOST, port: 6543, database: DB_NAME, ssl }),
      pgCheck({ user: 'postgres', password: pwd, host: POOLER_HOST, port: 5432, database: DB_NAME, ssl }),
      pgCheck({ user: 'postgres', password: pwd, host: POOLER_HOST, port: 6543, database: DB_NAME, ssl }),
    ]);

    const envUrl = process.env.DATABASE_URL || '';
    const envHost = (envUrl.match(/@([^:/]+)/) || [])[1] || 'not-found';
    const envPort = (envUrl.match(/:(\d+)\//) || [])[1] || 'not-found';
    const envUser = (envUrl.match(/\/\/([^:]+):/) || [])[1] || 'not-found';

    res.json({
      envParsed: { host: envHost, port: envPort, user: envUser },
      direct: { dns: directDns, tcp5432: directTcp5432, pg5432: directPg },
      pooler: {
        dns: poolerDns, tcp5432: pooler5432Tcp, tcp6543: pooler6543Tcp,
        pgProjectRef5432: poolerPg5432,
        pgProjectRef6543: poolerPg6543,
        pgPlain5432: poolerPg5432plain,
        pgPlain6543: poolerPg6543plain,
      },
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
           VALUES ($1, $2, 'primary', 'moderate', 0) ON CONFLICT DO NOTHING`,
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
        'SELECT id, email, family_name, full_name, created_at FROM users WHERE supabase_auth_id = $1',
        [user.id]
      );
      const appUser = result.rows[0];
      if (!appUser) return res.status(401).json({ error: 'User not provisioned' });
      return res.json({
        id: appUser.id, email: appUser.email,
        name: appUser.full_name || null,
        familyName: appUser.family_name,
        createdAt: appUser.created_at
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
