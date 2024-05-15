const fs = require('fs');
const path = require('path');
const GitHubApi = require('./GitHubApi'); // Import the github.js module

const express = require('express');
const app = express();
app.use(express.json());

let octokit;
let user;

const dotenv = require('dotenv').config({ path: '../.env' });
if (dotenv.error)
{
  const dotenv = require('dotenv').config();
  if (dotenv.error)
    {
      throw dotenv.error;
    }
}
const port = process.env.Server_PORT;

app.get('/', (req, res) => res.send('Hello World!')); //TODO: Change to the main page

// Route for the login button (can be in a separate file for organization)
app.get('/LogIn', (req, res) => {
  const loginLink = `<a href="${GitHubApi.getLoginUrl()}">Login with gitHub</a>`;
  res.send(loginLink);
});

// responds from GitHub
app.get(`/webhook`, async (req, res) => {
  const code = req.query.code;
  console.log(code);
}); 

app.get(`/${process.env.CALLBACK_URL}`, async (req, res) => {
  const code = req.query.code;
  console.log(code);
  try {
      GitHubApi.GetUserData(code);
      const repoNames = await GitHubApi.getRepositories();
      console.log(repoNames); // This will log an array of repository names
      
      // Select the first repository in the list //TODO: Change to choose button in the future
      GitHubApi.PullSelectedRepo();
  }
  catch (error) {
    console.error('Error during authentication:', error);
    res.status(500).send('Authentication failed');
  }
  res.send('Successfully authenticated!');
});



app.listen(port, () => console.log(`Server listening on port ${port}!`));