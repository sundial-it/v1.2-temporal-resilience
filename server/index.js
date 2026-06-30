require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const waitlistRouter = require('./routes/waitlist');
const oracleRouter = require('./routes/oracle');

const app = express();
app.use(cors());
app.use(express.json());

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/sundial';
mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.warn('MongoDB connection error:', err.message));

app.use('/api/waitlist', waitlistRouter);
app.use('/api/oracle', oracleRouter);

// Serve client static when deployed
const clientBuild = path.join(__dirname, '..', 'client', 'public');
if (require('fs').existsSync(clientBuild)) {
  app.use(express.static(clientBuild));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuild, 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
