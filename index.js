

const express = require('express');
const { nanoid } = require('nanoid');
const bodyParser = require('body-parser');
const requestIp = require('request-ip');

const loggingMiddleware = require('./loggingMiddleware');
const storage = require('./storage');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(loggingMiddleware);


app.post('/shorturls', (req, res) => {
  const { url, validity, shortcode } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'url is required' });
  }

  let finalShortcode = shortcode || nanoid(6);
  
  while (storage.shortcodeExists(finalShortcode)) {
    finalShortcode = nanoid(6);
  }

  const now = new Date();
  const expiresInMinutes = validity || 30;
  const expiryDate = new Date(now.getTime() + expiresInMinutes * 60000);

  storage.saveUrl(finalShortcode, {
    originalUrl: url,
    createdAt: now,
    expiry: expiryDate,
    clicks: []
  });

  res.status(201).json({
    shortLink: `http://localhost:${PORT}/${finalShortcode}`,
    expiry: expiryDate.toISOString()
  });
});

// GET /shorturls/:shortcode
app.get('/shorturls/:shortcode', (req, res) => {
  const { shortcode } = req.params;
  const record = storage.getUrl(shortcode);

  if (!record) {
    return res.status(404).json({ error: 'Shortcode not found' });
  }

  res.json({
    originalUrl: record.originalUrl,
    createdAt: record.createdAt.toISOString(),
    expiry: record.expiry.toISOString(),
    totalClicks: record.clicks.length,
    clicks: record.clicks
  });
});


app.get('/:shortcode', (req, res) => {
  const { shortcode } = req.params;
  const record = storage.getUrl(shortcode);

  if (!record) {
    return res.status(404).send('Shortcode not found');
  }

  const now = new Date();
  if (now > record.expiry) {
    return res.status(410).send('Link expired');
  }

  
  storage.incrementClicks(shortcode, {
    timestamp: now.toISOString(),
    referrer: req.get('Referrer') || null,
    ip: requestIp.getClientIp(req)
  });

  res.redirect(record.originalUrl);
});


app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

