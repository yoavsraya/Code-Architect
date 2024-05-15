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

app.post('/getRepoFiles', async (req, res) => {
  const repoName = req.body.repoName;

  try {
    const { data } = await octokit.rest.repos.getContent({
      owner: user.userName, // Use the user's GitHub username here
      repo: repoName,
      path: '', // Use an empty string to get the root directory
    });

    const fileContents = await Promise.all(data.map(async file => {
      if (file.type === 'file') {
        const contentResponse = await octokit.rest.repos.getContent({
          owner: user.userName,
          repo: repoName,
          path: file.path,
        });

        // The file content is base64 encoded, so it needs to be decoded
        const content = Buffer.from(contentResponse.data.content, 'base64').toString('utf8');
        
        console.log(content);
        fs.writeFileSync(path.join(__dirname, 'fileContent.txt'), content, 'utf8');
      }
    }));

    res.send(fileContents);
  } catch (error) {
    console.log(error);
    res.status(500).send('Error getting files');
  }
});

app.listen(port, () => console.log(`Server listening on port ${port}!`));