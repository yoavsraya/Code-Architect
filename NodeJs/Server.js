const fs = require('fs');
const path = require('path');
const http = require('http');
const express = require('express');
const WebSocket = require('ws');
const GitHubApi = require('./GitHubApi');
const OpenAIApi = require('./OpenAI');
const CsUtiles = require('../C#/utils');
const cors = require('cors'); 
//const { exec } = require('child_process');

const app = express();
app.use(cors()); 
app.use(express.json());
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let isLoggedIn = false;
let parsedResult;

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
      
      console.log(' GET callback')
      ///gitHub API
      console.log("GetUserData function")
      await GitHubApi.GetUserData(code);
      console.log("getRepositories function")
      await GitHubApi.getRepositories();
      // Select the first repository in the list //TODO: Change to choose button in the future
      //console.log("PullSelectedRepo fuction")
      //await GitHubApi.PullSelectedRepo();
      console.log("cloneSelectedRepo function")
      await GitHubApi.cloneSelectedRepo();

      
      // C# rosln
      console.log("csRunBuild function")
      await CsUtiles.csRunBuild();
      console.log("csRun function")
      await CsUtiles.csRun("/home/ec2-user/Code-Analyzer/UserFiles");
      
      
      ///chat GTP
      console.log("runAI function")
      const aiResult = await OpenAIApi.RunAI();
      try {
        parsedResult = JSON.parse(aiResult);
        console.log(parsedResult);
    } catch (error) {
        console.error('Failed to parse aiResult:', aiResult);
        console.error('Error:', error);
    }
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        console.log("let the react know that the login is done")
        client.send(JSON.stringify({ loggedIn: true }));
      }
    });
    res.send({ message: 'Successfully authenticated!'});
    }
    catch (error) {
      console.error('Error during authentication:', error);
      res.status(500).send('Authentication failed');
      }
      });
      
  app.get('/api/message', (req, res) => {
    console.log("GET /api/message");
    res.send(parsedResult);
  });

//app.listen(port, () => console.log(`Server listening on port ${port}!`));
server.listen(port, () => console.log(`Server listening on port ${port}!`));
