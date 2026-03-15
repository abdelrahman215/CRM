const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const routes = require('./routes');
const config = require('./config/env');
const { scheduleFollowUpReminders } = require('./cron/followUpReminder');

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  })
);
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', routes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

scheduleFollowUpReminders();

app.listen(config.port, () => {
  console.log(`Avenue CRM backend running on port ${config.port}`);
});

