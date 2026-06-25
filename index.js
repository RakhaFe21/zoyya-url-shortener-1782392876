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

  // TODO: Add input validation for empty URLs
  // Currently accepts any body without checking if url is present or valid

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

  // TODO: Handle 404 for missing shortIds
  // Currently returns undefined redirect if shortId not found

  const originalUrl = urlStore.get(shortId);
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
