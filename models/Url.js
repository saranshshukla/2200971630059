const mongoose = require('mongoose');

const clickSchema = new mongoose.Schema({
  timestamp: Date,
  referrer: String,
  location: String,
});

const urlSchema = new mongoose.Schema({
  originalUrl: { type: String, required: true },
  shortcode: { type: String, unique: true, required: true },
  createdAt: { type: Date, default: Date.now },
  expiry: Date,
  clicks: [clickSchema],
  clickCount: { type: Number, default: 0 },
});

module.exports = mongoose.model('Url', urlSchema);
