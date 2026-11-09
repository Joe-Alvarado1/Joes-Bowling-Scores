require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const TARGET = process.env.TARGET_URL; // Apps Script exec URL

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Origin is not allowed by CORS.'));
  },
}));
app.use(express.json());

app.options('*', (req, res) => res.sendStatus(204));

// Health/info endpoint for browser checks
app.get('/', (req, res) => {
  res.json({ ok: true, proxy: true, target: TARGET || null });
});

// Informative GET on /proxy (use POST to forward)
app.get('/proxy', (req, res) => {
  res.status(200).json({ error: 'This endpoint accepts POST to forward requests to the target.' });
});

app.post('/proxy', async (req, res) => {
  if (!TARGET) return res.status(500).json({ error: 'TARGET_URL not configured' });
  try {
    const response = await fetch(TARGET, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      timeout: 10000,
    });
    const text = await response.text();
    res.status(response.status).send(text);
  } catch (err) {
    res.status(502).json({ error: String(err) });
  }
});

app.listen(PORT, '127.0.0.1', () => console.log(`Proxy listening on http://127.0.0.1:${PORT}`));
