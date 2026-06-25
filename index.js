const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// In-memory store for URL mappings
const urlStore = new Map();

// Base URL for shortened links
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

/**
 * POST /shorten
 * Accepts { url: string } and returns a shortened URL
 */
app.post('/shorten', (req, res) => {
  const { url } = req.body;

  // Input validation for empty URLs
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return res.status(400).json({ error: 'URL is required and must be a non-empty string' });
  }

  // Validate URL format
  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  const shortId = crypto.randomBytes(4).toString('hex');
  urlStore.set(shortId, url);

  res.json({
    shortUrl: `${BASE_URL}/${shortId}`,
    originalUrl: url,
    shortId
  });
});

/**
 * GET /:shortId
 * Redirects to the original URL
 */
app.get('/:shortId', (req, res) => {
  const { shortId } = req.params;

  // Handle 404 for missing shortIds
  const originalUrl = urlStore.get(shortId);
  if (!originalUrl) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  res.redirect(originalUrl);
});

/**
 * GET /stats/:shortId
 * Returns metadata about a shortened URL
 */
app.get('/stats/:shortId', (req, res) => {
  const { shortId } = req.params;
  const originalUrl = urlStore.get(shortId);

  if (!originalUrl) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  res.json({
    shortId,
    originalUrl,
    createdAt: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`URL Shortener running on port ${PORT}`);
});

module.exports = app;
