// token.js
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const chalk = require('chalk');
const Token = require('./models/Token');

async function getFbToken(email, password) {
  const baseAccessToken = '350685531728|62f8ce9f74b12f84c123cc23437a4a32';
  const data = new URLSearchParams({
    adid: uuidv4(),
    format: 'json',
    device_id: uuidv4(),
    credentials_type: 'device_based_login_password',
    email,
    password,
    access_token: baseAccessToken,
    generate_session_cookies: '1',
    method: 'auth.login'
  });

  try {
    const response = await axios.post(
      "https://b-graph.facebook.com/auth/login",
      data,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 30000
      }
    );
    if (response.status === 200 && response.data.access_token) {
      return response.data.access_token;
    } else if (response.data.error) {
      console.error(chalk.red(`Error: ${response.data.error.message}`));
    } else {
      console.error(chalk.red(`Failed with HTTP code ${response.status}`));
    }
  } catch (err) {
    console.error(chalk.red(`Connection Error: ${err.message}`));
  }
  return null;
}

async function storeToken(email, accessToken) {
  try {
    const tokenDoc = new Token({ email, accessToken });
    await tokenDoc.save();
    console.log(chalk.blue('Token saved to database successfully!'));
  } catch (err) {
    console.error(chalk.red(`Error saving token: ${err.message}`));
  }
}

async function getLatestToken() {
  try {
    // Fetch the most recently saved token
    const tokenDoc = await Token.findOne().sort({ createdAt: -1 });
    return tokenDoc ? tokenDoc.accessToken : null;
  } catch (err) {
    console.error(chalk.red(`Error reading token from database: ${err.message}`));
    return null;
  }
}

module.exports = { getFbToken, storeToken, getLatestToken };
