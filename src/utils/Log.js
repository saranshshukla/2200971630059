require('dotenv').config();
const fetch = require('node-fetch');

// Read access token from .env or paste directly for test
const accessToken = process.env.ACCESS_TOKEN;

async function log(stack, level, pkg, message) {
  const body = {
    stack: stack.toLowerCase(),
    level: level.toLowerCase(),
    package: pkg.toLowerCase(),
    message
  };

  console.log('Sending log body:', body);

  try {
    const res = await fetch('http://20.244.56.144/evaluation-service/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}` 
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      console.error("log failed:", res.status);
    } else {
      const data = await res.json();
      console.log("log success:", data);
    }

  } catch (err) {
    console.error("log error:", err.message);
  }
}

module.exports = { log };
