const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, '../logs/app.log');

function logger(req, res, next) {
  const log = `${new Date().toISOString()} | ${req.method} ${req.originalUrl} | ${req.ip}\n`;

  fs.appendFile(logFile, log, (err) => {
    if (err) {
      // log write failed
      console.error('log write error');
    }
  });

  next();
}

module.exports = logger;
