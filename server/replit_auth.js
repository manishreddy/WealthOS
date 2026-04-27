'use strict';

const { Issuer, Strategy } = require('openid-client');
const passport = require('passport');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { pool, query } = require('./db');

function getCallbackUrl() {
  const domain = process.env.REPLIT_DEV_DOMAIN || process.env.REPLIT_DEPLOYMENT_DOMAIN;
  if (domain) return `https://${domain}/api/auth/callback`;
  return `http://localhost:${process.env.PORT || 5000}/api/auth/callback`;
}

let _client = null;

async function getClient() {
  if (_client) return _client;
  const issuer = await Issuer.discover('https://replit.com/oidc');
  _client = new issuer.Client({
    client_id: process.env.REPL_ID,
    response_types: ['code'],
    redirect_uris: [getCallbackUrl()],
    token_endpoint_auth_method: 'none'
  });
  return _client;
}

async function setupAuth(app) {
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    throw new Error('SESSION_SECRET environment variable is required but not set. Set it in your Replit secrets before starting the server.');
  }

  const clientId = process.env.REPL_ID;
  if (!clientId) {
    throw new Error('REPL_ID environment variable is required for Replit Auth but is not set.');
  }

  app.use(session({
    store: new pgSession({
      pool,
      tableName: 'sessions',
      createTableIfMissing: true
    }),
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: !!process.env.REPLIT_DEPLOYMENT_DOMAIN,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    }
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));

  const client = await getClient();
  passport.use('oidc', new Strategy({ client }, async (tokenSet, userinfo, done) => {
    try {
      const claims = tokenSet.claims();
      return done(null, { claims, userinfo: userinfo || {} });
    } catch (err) {
      return done(err);
    }
  }));
}

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated() && req.user?.claims) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

function registerAuthRoutes(app) {
  app.get('/api/login', async (req, res, next) => {
    if (req.query.invite) {
      req.session.pendingInviteToken = req.query.invite;
    }
    try {
      passport.authenticate('oidc', {
        scope: 'openid email profile'
      })(req, res, next);
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/auth/callback', async (req, res, next) => {
    passport.authenticate('oidc', async (err, user) => {
      if (err || !user) {
        console.error('Auth callback error:', err);
        return res.redirect('/login.html?error=auth_failed');
      }
      req.logIn(user, async (loginErr) => {
        if (loginErr) return next(loginErr);

        try {
          const claims = user.claims;
          const userinfo = user.userinfo || {};
          const replitUserId = claims.sub;
          const email = (claims.email || '').toLowerCase().trim();
          const firstName = claims.first_name || '';
          const lastName = claims.last_name || '';
          const fullName = userinfo.name || [firstName, lastName].filter(Boolean).join(' ') || null;
          const displayName = fullName || email || replitUserId;

          let appUser = null;

          const byReplitId = await query(
            'SELECT * FROM users WHERE replit_user_id = $1',
            [replitUserId]
          );
          if (byReplitId.rows.length > 0) {
            appUser = byReplitId.rows[0];
            if (fullName) {
              await query(
                'UPDATE users SET full_name = $1 WHERE id = $2',
                [fullName, appUser.id]
              );
              appUser.full_name = fullName;
            }
          }

          if (!appUser && email) {
            const byEmail = await query(
              'SELECT * FROM users WHERE email = $1',
              [email]
            );
            if (byEmail.rows.length > 0) {
              appUser = byEmail.rows[0];
              await query(
                'UPDATE users SET replit_user_id = $1, full_name = COALESCE(full_name, $2) WHERE id = $3',
                [replitUserId, fullName || null, appUser.id]
              );
              if (fullName && !appUser.full_name) appUser.full_name = fullName;
            }
          }

          if (!appUser) {
            const familyName = 'My Family';
            const userEmail = email || `${replitUserId}@replit.user`;
            const existingEmail = await query('SELECT id FROM users WHERE email = $1', [userEmail]);
            let newUserId;
            if (existingEmail.rows.length > 0) {
              newUserId = existingEmail.rows[0].id;
              await query('UPDATE users SET replit_user_id = $1, full_name = COALESCE(full_name, $2) WHERE id = $3', [replitUserId, fullName || null, newUserId]);
            } else {
              const newUser = await query(
                'INSERT INTO users (email, password_hash, family_name, replit_user_id, full_name) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [userEmail, '', familyName, replitUserId, fullName || null]
              );
              newUserId = newUser.rows[0].id;
            }
            const userRes = await query('SELECT * FROM users WHERE id = $1', [newUserId]);
            appUser = userRes.rows[0];
            await query('INSERT INTO setup_progress (user_id) VALUES ($1) ON CONFLICT DO NOTHING', [appUser.id]);

            if (displayName) {
              await query(
                'INSERT INTO family_members (user_id, name, role, risk_profile, display_order) VALUES ($1, $2, $3, $4, $5)',
                [appUser.id, displayName, 'primary', 'moderate', 0]
              ).catch(() => {});
            }
          }

          const pendingInvite = req.session.pendingInviteToken;

          req.session.regenerate((regenErr) => {
            if (regenErr) return next(regenErr);
            req.session.passport = { user };
            req.session.appUserId = appUser.id;
            req.session.appUserEmail = appUser.email;
            req.session.replitUserId = replitUserId;
            req.session.ownerResolved = false;
            req.session.cachedOwnerUserId = null;
            if (pendingInvite) {
              return res.redirect(`/invite.html?token=${encodeURIComponent(pendingInvite)}&from_auth=1`);
            }
            return res.redirect('/dashboard.html');
          });
        } catch (syncErr) {
          console.error('User sync error:', syncErr);
          return res.redirect('/login.html?error=sync_failed');
        }
      });
    })(req, res, next);
  });

  app.get('/api/logout', (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      req.session.destroy(() => {
        res.redirect('/login.html');
      });
    });
  });

  app.get('/api/auth/user', (req, res) => {
    if (!req.isAuthenticated() || !req.session?.appUserId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    query('SELECT id, email, family_name, full_name, created_at FROM users WHERE id = $1', [req.session.appUserId])
      .then(result => {
        const user = result.rows[0];
        if (!user) return res.status(404).json({ error: 'User not found' });
        return res.json({
          id: user.id,
          email: user.email,
          name: user.full_name || null,
          familyName: user.family_name,
          createdAt: user.created_at
        });
      })
      .catch(err => {
        console.error('GET /api/auth/user error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      });
  });
}

module.exports = { setupAuth, registerAuthRoutes, isAuthenticated };
