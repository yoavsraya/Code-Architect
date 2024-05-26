const fs = require('fs');
const path = require('path');
const GitHubApi = require('./GitHubApi');
try
{
  const dotenvPath = path.join(__dirname, '../.env');
  require('dotenv').config({ path: dotenvPath });
}
catch (error)
{
  console.error('Error loading .env file:', error);
}

const express = require('express');
const app = express();
app.use(express.json());

const port = process.env.SERVER_PORT;
console.log(port);

app.get('/', (req, res) => res.send('Hello World!')); //TODO: Change to the main page

// Route for the login button
app.get('/LogIn', (req, res) => {
  const loginLink = `<a href="${GitHubApi.getLoginUrl()}">Login with gitHub</a>`;
  res.send(loginLink);
});

// responds from GitHub
app.get(`/webhook`, async (req, res) => {
  const code = req.query.code;
  console.log(code);
}); 

app.get(`/callback`, async (req, res) => {
  const code = req.query.code;
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