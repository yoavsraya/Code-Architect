const fs = require('fs');
const path = require('path');
const http = require('http');
const express = require('express');
const WebSocket = require('ws');
const GitHubApi = require('./GitHubApi');
const OpenAIApi = require('./OpenAI');
const CsUtiles = require('../C#/utils');
const cors = require('cors'); 
const AIconversationHistory = require('./InitAIConversation');

const app = express();
app.use(cors()); 
app.use(express.json());
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let isLoggedIn = false;
let parsedResult;
let repoList;

const port = process.env.SERVER_PORT;

wss.on('connection', ws => {
  console.log('Client connected');
  // Send a message to the client when login status changes
  
  ws.on('close', () => console.log('Client disconnected'));
});

app.get('/login-status', (req, res) => {
  res.json({ loggedIn: isLoggedIn });
});

try
{
  const dotenvPath = path.join(__dirname, '../.env');
  require('dotenv').config({ path: dotenvPath });
}
catch (error)
{
  console.error('Error loading .env file:', error);
}

app.get('/', (req, res) => res.send('Hello World!')); 

// Route for the login button
app.get('/LogIn', (req, res) => {
  const loginUrl = GitHubApi.getLoginUrl();
  res.redirect(loginUrl);
});

// responds from GitHub
app.get(`/webhook`, async (req, res) => {
  const code = req.query.code;
  console.log(code);
}); 

app.get(`/callback`, async (req, res) => {
  const code = req.query.code;
  try {
      console.log(' GET callback')
      ///gitHub API
      console.log("GetUserData function")
      await GitHubApi.GetUserData(code);
      console.log("getRepositories function")
      repoList = await GitHubApi.getRepositories();
      console.log("repo names:");
      console.log(repoList);
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          console.log("let the react know that the login is done")
          client.send(JSON.stringify({ loggedIn: true }));
        }
      });
    }
    catch (error) {
      console.error('Error during authentication:', error);
      res.status(500).send('Authentication failed');
      }
});
      
app.get('/api/repoList', (req, res) => {
  console.log("GET /api/repoList");
  res.send(repoList);
});

app.get('/api/getUserPic', async (req, res) => {
  console.log("GET /api/getUserPic");
  url = await GitHubApi.GetUserPic();
  res.json({ avatar_url: url });
});

app.get('/api/fetchSelectedRepo', async (req, res) => {
  console.log("GET /api/fetchSelectedRepo");
  const selectedRepo = GitHubApi.getRepoByName(req.query.selectedRepo);
  console.log("repo name");
  console.log(req.query.selectedRepo);
  console.log("repo value");
  console.log(selectedRepo);
      //console.log("PullSelectedRepo fuction")
      //await GitHubApi.PullSelectedRepo();
  console.log("cloneSelectedRepo function")
  await GitHubApi.cloneSelectedRepo(selectedRepo);
  res.status(200);
  res.send();
});

app.get('/api/buildProject', async (req, res) => {
  console.log("GET /api/buildProject");
  // C# rosln
  console.log("csRunBuild function")
  try
  {
    await CsUtiles.csRunBuild();
    //   gulp.task('build', function() {
    // Your build tasks here
    //     console.log('Building project...');
    // });
      console.log("csRun function")
      //await CsUtiles.csRun("/home/ec2-user/Code-Analyzer/UserFiles")
    //   gulp.task('run', function() {
    //     // Your run tasks here
    //     console.log('Running project...');
    // });
  }
  catch
  {
    
  }
});

app.get('/api/runAI', async (req, res) => {
  console.log("GET /api/runProject");
  try
  {
    ///chat GTP
    console.log("runAI function")
    const aiResult = await OpenAIApi.RunAI(AIconversationHistory);
    try
    {
      parsedResult = JSON.parse(aiResult);
    }
    catch (error)
    {
      console.error('Failed to parse aiResult:', aiResult);
      console.error('Error:', error);
    }
  }
  catch
  {
    
  }
});

//app.listen(port, () => console.log(`Server listening on port ${port}!`));
server.listen(port, () => console.log(`Server listening on port ${port}!`));
