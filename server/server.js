'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from the code/ directory
app.use(express.static(path.join(__dirname, '../code')));

// Mount all routes
const { verifyToken } = require('./middleware/auth');
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

// Root and index.html → login
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../code/login.html'));
});
app.get('/index.html', (req, res) => {
  res.redirect('/login.html');
});

app.listen(PORT, () => {
  console.log(`WealthOS server running at http://localhost:${PORT}`);
});
