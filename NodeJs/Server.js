const express = require('express');
const app = express();

const dotenv = require('dotenv').config({ path: './NodeJs/.env' });
if (dotenv.error)
{
  throw dotenv.error;
}
const port = process.env.PORT || 3000;

const GitHubApi = require('./GitHubApi'); // Import the github.js module

app.get('/', (req, res) => res.send('Hello World!'));

// Route for the login button (can be in a separate file for organization)
app.get('/LogIn', (req, res) => {
  const loginLink = `<a href="${GitHubApi.getLoginUrl()}">Login with gitHub</a>`;
  res.send(loginLink);
});

// responds from GitHub
app.get(`/${process.env.CALLBACK_URL}`, async (req, res) => {
  const code = req.query.code;
  console.log(code);

app.get(`/webhook`, async (req, res) => {
  const code = req.query.code;
  console.log(code);

  try {
    const userData = await GitHubApi.exchangeCodeForToken(code);
    console.log(userData);
    res.send('Successfully authenticated!');
  } catch (error) {
    console.error('Error during authentication:', error);
    res.status(500).send('Authentication failed');
  }
});

app.listen(port, () => console.log(`Server listening on port ${port}!`));
