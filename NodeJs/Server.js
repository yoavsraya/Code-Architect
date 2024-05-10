const express = require('express');
const app = express();
const { Octokit } = require("@octokit/rest");

let octokit;
let user;
class User {
  constructor(accessToken, userName, repositories) {
    this.accessToken = accessToken;
    this.userName = userName;
    this.repositories = repositories;
    this.selectedRepo = null;
  }
}

const dotenv = require('dotenv').config({ path: './NodeJs/.env' });
if (dotenv.error)
{
  const dotenv = require('dotenv').config();
  if (dotenv.error)
    {
      throw dotenv.error;
    }
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
app.get(`/webhook`, async (req, res) => {
  const code = req.query.code;
  console.log(code);
}); // This was missing

app.get(`/${process.env.CALLBACK_URL}`, async (req, res) => {
  const code = req.query.code;
  console.log(code);

  try {
    const userData = await GitHubApi.exchangeCodeForToken(code);
    console.log(userData);
    res.send('Successfully authenticated!');
    
    octokit = new Octokit({
      auth: `${userData.access_token}`,
    });
    
    const { data } = await octokit.rest.users.getAuthenticated();
    const username = data.login;

    octokit.rest.repos.listForAuthenticatedUser()
    .then(({ data }) => {
      user = new User(userData.access_token,username,data);
      const repoNames = data.map(repo => repo.name);
      console.log(repoNames); // This will log an array of repository names
      user.selectedRepo = data[0];
    })
    .catch(error => {
      console.error('Error getting repositories:', error);
    });
  }
  catch (error) {
    console.error('Error during authentication:', error);
    res.status(500).send('Authentication failed');
  }
});

app.post('/getRepoFiles', (req, res) => {
  const repoName = req.body.repoName;

  const octokit = new Octokit({
    auth: user.accessToken, // Use the user's access token here
  });

  octokit.rest.repos.getContent({
    owner: user.username, // Use the user's GitHub username here
    repo: repoName,
    path: '', // Use an empty string to get the root directory
  })
  .then(({ data }) => {
    const fileNames = data.map(file => file.name);
    console.log(fileNames); // This will log an array of file names
    res.send(fileNames);
  })
  .catch(error => {
    console.error('Error getting files:', error);
    res.status(500).send('Error getting files');
  });
});


app.listen(port, () => console.log(`Server listening on port ${port}!`));