require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const path = require('path');
const runMigrations = require('./db/migrations');

const app = express();
app.use(cors());
app.use(express.json());

runMigrations().catch(err => console.error('Migration error:', err.message));

app.use('/api/analyze', require('./routes/analyze'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/history', require('./routes/history'));

const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
