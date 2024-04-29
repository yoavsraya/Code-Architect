const express = require('express');
const app = express();

const dotenv = require('dotenv');
dotenv.config();

const port = process.env.PORT;

const GitHubApi = require('./GitHubApi'); // Import the github.js module

// Route for the login button (can be in a separate file for organization)
app.get('/', (req, res) => {
  // Generate the login link using CLIENT_ID from environment variables
  const loginLink = `<a href="${GitHubApi.getLoginUrl()}">Login with GitHub</a>`;
  res.send(loginLink);
});

// Route for the callback URL after authorization
app.get(process.env.CALLBACK_URL, async (req, res) => {
  const code = req.query.code;

  try {
    const userData = await GitHubApi.exchangeCodeForToken(code);
    // Handle successful authentication (e.g., redirect to protected route)
    res.send('Successfully authenticated!');
  } catch (error) {
    console.error('Error during authentication:', error);
    res.status(500).send('Authentication failed');
  }
});

app.listen(port, () => console.log(`Server listening on port ${port}`));
