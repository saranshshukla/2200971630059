const express = require('express');
const router = express.Router();
const Url = require('../models/Url');
const { nanoid } = require('nanoid');
const { log } = require('../src/utils/Log');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

router.post('/', async (req, res) => {
  try {
    const { url, validity = 30, shortcode } = req.body;

    if (!url) {
      await log("backend", "warn", "route", "Missing URL in POST /shorturls");
      return res.status(400).json({ error: 'URL is required' });
    }

    const code = shortcode || nanoid(6);

    const existing = await Url.findOne({ shortcode: code });
    if (existing) {
      await log("backend", "warn", "route", `Shortcode conflict: ${code}`);
      return res.status(400).json({ error: 'Shortcode already in use' });
    }

    const expiryDate = new Date(Date.now() + validity * 60 * 1000);

    const newUrl = new Url({
      originalUrl: url,
      shortcode: code,
      expiry: expiryDate
    });

    await newUrl.save();
    await log("backend", "info", "route", `Short URL created: ${code}`);

    res.status(201).json({
      shortLink: `${BASE_URL}/${code}`,
      expiry: expiryDate.toISOString()
    });

  } catch (err) {
    await log("backend", "error", "route", `POST error: ${err.message}`);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

router.get('/:shortcode', async (req, res) => {
  try {
    const { shortcode } = req.params;

    const urlEntry = await Url.findOne({ shortcode });
    if (!urlEntry) {
      await log("backend", "warn", "route", `Stats not found: ${shortcode}`);
      return res.status(404).json({ error: 'Short URL not found' });
    }

    await log("backend", "info", "route", `Stats fetched for: ${shortcode}`);

    res.json({
      originalUrl: urlEntry.originalUrl,
      createdAt: urlEntry.createdAt.toISOString(),
      expiry: urlEntry.expiry.toISOString(),
      clickCount: urlEntry.clickCount,
      clicks: urlEntry.clicks
    });

  } catch (err) {
    await log("backend", "error", "route", `GET stats error: ${err.message}`);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
