require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Url = require('./models/Url');
const logger = require('./middleware/logger');
const { log } = require('./src/utils/Log');

const app = express();

app.use(express.json());
app.use(cors());
app.use(logger);

mongoose.connect(process.env.MONGO_URI)
  .then(() => log("backend", "info", "db", "MongoDB connected"))
  .catch(err => log("backend", "error", "db", `Mongo connection error: ${err.message}`));

app.use('/shorturls', require('./routes/shorturls'));

app.get('/:shortcode', async (req, res) => {
  const { shortcode } = req.params;

  try {
    const urlEntry = await Url.findOne({ shortcode });

    if (!urlEntry) {
      await log("backend", "warn", "route", `Short URL not found: ${shortcode}`);
      return res.status(404).send('Short URL not found');
    }

    if (new Date() > urlEntry.expiry) {
      await log("backend", "info", "route", `Expired link accessed: ${shortcode}`);
      return res.status(410).send('Link has expired');
    }

    const clickInfo = {
      timestamp: new Date(),
      referrer: req.get('Referer') || 'Direct',
      location: req.ip
    };

    urlEntry.clicks.push(clickInfo);
    urlEntry.clickCount++;
    await urlEntry.save();

    await log("backend", "info", "route", `Redirected: ${shortcode}`);

    return res.redirect(urlEntry.originalUrl);

  } catch (err) {
    await log("backend", "error", "route", `Redirect error: ${err.message}`);
    return res.status(500).send('Something broke');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  log("backend", "info", "server", `Running on http://localhost:${PORT}`);
});
