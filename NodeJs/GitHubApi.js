const clientId = 'Iv1.9131546c6e351853';
const clientSecret = 'edb93e0f1ece919b8ace161b951509843b3001e7';
const redirectUri = 'http://localhost:3000/callback'; // Replace with your callback URL
const appId = '887581';

const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const CALLBACK_URL = process.env.CALLBACK_URL;

function getLoginUrl() {
  return `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=user`;
}

async function exchangeCodeForToken(code) {
  const params = {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    code,
    grant_type: 'authorization_code',
  };

  try {
    const response = await axios.post('https://github.com/login/oauth/access_token', params, {
      headers: {
        Accept: 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    throw error; // Re-throw for handling in server.js
  }
}


module.exports = {
  getLoginUrl,
  exchangeCodeForToken,
};
