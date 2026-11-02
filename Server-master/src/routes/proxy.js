const express = require('express');
const router = express.Router();
const https = require('https');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * GET /api/proxy/pdf?url=...
 * Proxies a PDF from an external source (like Google Drive) to bypass CORS and 522 errors.
 */
router.get('/pdf', asyncHandler(async (req, res) => {
  const targetUrl = req.query.url;
  
  if (!targetUrl) {
    return res.status(400).json({ error: 'Missing target URL' });
  }

  const driveIdMatch = targetUrl.match(/\/d\/(.+?)\/|id=(.+?)(&|$)/);
  const driveId = driveIdMatch ? (driveIdMatch[1] || driveIdMatch[2]) : null;
  const initialUrl = driveId 
    ? `https://drive.google.com/uc?id=${driveId}&export=download`
    : targetUrl;

  const fetchStream = (url, depth = 0) => {
    if (depth > 5) {
      return res.status(500).json({ error: 'Too many redirects' });
    }

    https.get(url, (proxyRes) => {
      // Handle Redirects
      if (proxyRes.statusCode >= 300 && proxyRes.statusCode < 400 && proxyRes.headers.location) {
        return fetchStream(proxyRes.headers.location, depth + 1);
      }

      if (proxyRes.statusCode !== 200) {
        return res.status(proxyRes.statusCode).json({ error: `Source returned ${proxyRes.statusCode}` });
      }

      // Success - Pipe it
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      proxyRes.pipe(res);
    }).on('error', (err) => {
      console.error('Proxy Fetch Error:', err);
      res.status(500).json({ error: 'Failed to fetch the document' });
    });
  };

  fetchStream(initialUrl);
}));

module.exports = router;
