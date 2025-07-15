const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

const { loggerMiddleware, logMessage } = require('../Logging_middleware/logger');

app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);

const urlDB = {};

const generateCode = (length = 6) => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  while (code.length < length) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

// Create short URL
app.post('/shorturls', async (req, res) => {
  const { url, validity = 30, shortcode } = req.body;

  try {
    new URL(url); // validate URL
  } catch {
    await logMessage('backend', 'warn', 'Invalid URL submitted');
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  const code = shortcode || generateCode();
  if (urlDB[code]) {
    return res.status(409).json({ error: 'Shortcode already exists' });
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + validity * 60000);

  urlDB[code] = {
    url,
    createdAt: now.toISOString(),
    expiry: expiresAt.toISOString(),
    clicks: []
  };

  await logMessage('backend', 'info', `Shortlink created: ${code}`);

  res.status(201).json({
    shortlink: `http://localhost:${port}/${code}`,
    expiresIn: expiresAt.toISOString()
  });
});

// Redirect
app.get('/:code', async (req, res) => {
  const entry = urlDB[req.params.code];
  if (!entry) {
    return res.status(404).json({ error: 'Shortcode not found' });
  }

  if (new Date(entry.expiry) < new Date()) {
    return res.status(410).json({ error: 'Short URL expired' });
  }

  entry.clicks.push({
    time: new Date().toISOString(),
    referer: req.get('referer') || 'direct',
    geo: 'IN'
  });

  await logMessage('backend', 'info', `Redirected: ${req.params.code}`);
  res.redirect(entry.url);
});

// Stats
app.get('/shorturls/:code', (req, res) => {
  const entry = urlDB[req.params.code];
  if (!entry) return res.status(404).json({ error: 'Shortcode not found' });

  res.json({
    url: entry.url,
    createdAt: entry.createdAt,
    expiry: entry.expiry,
    clicks: entry.clicks.length,
    details: entry.clicks
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
