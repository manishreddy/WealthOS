'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDb } = require('./db');
const { setupAuth, registerAuthRoutes } = require('./replit_auth');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '../code')));

const { verifyToken } = require('./middleware/auth');

async function startServer() {
  try {
    await initDb();

    await setupAuth(app);
    registerAuthRoutes(app);

    app.use('/api/auth', require('./routes/auth'));
    app.use('/api/family', verifyToken, require('./routes/family'));
    app.use('/api/monthly', verifyToken, require('./routes/monthly'));
    app.use('/api/savings', verifyToken, require('./routes/savings'));
    app.use('/api/portfolio', verifyToken, require('./routes/portfolio'));
    app.use('/api/goals', verifyToken, require('./routes/goals'));
    app.use('/api/planning', verifyToken, require('./routes/planning'));
    app.use('/api/setup', verifyToken, require('./routes/setup'));
    app.use('/api/wealthbot', verifyToken, require('./routes/wealthbot'));
    app.use('/api/ai-parse', verifyToken, require('./routes/ai-parse'));
    app.use('/api/import', verifyToken, require('./routes/import'));
    app.use('/api/projections', verifyToken, require('./routes/projections'));

    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '../code/index.html'));
    });
    app.get('/index.html', (req, res) => {
      res.sendFile(path.join(__dirname, '../code/index.html'));
    });

    app.listen(PORT, () => {
      console.log(`WealthOS server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
