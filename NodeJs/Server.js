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
const GraphData = require('./GraphData.js');
const temporaryAIResponseGM = require('./TempAIResponseGM.js');
const tempAIResponseExpandFactoryPattern = require('./TempAIResponseExpandFactoryPattern.js');

const app = express();
app.use(cors()); 
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let isLoggedIn = false;
let parsedResult; 
let repoList;

const port = process.env.SERVER_PORT;

let conversationHistory = []; // In-memory array to store conversation history

wss.on('connection', ws => {
  console.log('Client connected');
  ws.on('close', () => console.log('Client disconnected'));
});

app.get('/login-status', (req, res) => {
  res.json({ loggedIn: isLoggedIn });
});

try {
  const dotenvPath = path.join(__dirname, '../.env');
  require('dotenv').config({ path: dotenvPath });
} catch (error) {
  console.error('Error loading .env file:', error);
}

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/LogIn', (req, res) => {
  const loginUrl = GitHubApi.getLoginUrl();
  res.redirect(loginUrl);
});

app.get(`/webhook`, async (req, res) => {
  const code = req.query.code;
  console.log(code);
});

app.get(`/callback`, async (req, res) => {
  const code = req.query.code;
  try {
    console.log(' GET callback');
    await GitHubApi.GetUserData(code);
    repoList = await GitHubApi.getRepositories();
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ loggedIn: true }));
      }
    });
  } catch (error) {
    console.error('Error during authentication:', error);
    res.status(500).send('Authentication failed');
  }
});

app.get('/api/repoList', (req, res) => {
  res.send(repoList);
});

app.get('/api/getUserPic', async (req, res) => {
  const url = await GitHubApi.GetUserPic();
  res.json({ avatar_url: url });
});

app.get('/api/fetchSelectedRepo', async (req, res) => {
  const selectedRepo = GitHubApi.getRepoByName(req.query.selectedRepo);
  await GitHubApi.cloneSelectedRepo(selectedRepo);
  res.status(200).send();
});

app.get('/api/buildProject', async (req, res) => {
  try {
    await CsUtiles.csRunBuild();
  } catch (error) {
    console.error('Error during build:', error);
  }
});

app.get('/api/runAI', async (req, res) => {
  try {
    const aiResult = temporaryAIResponseGM;
    console.log('AI Result:', aiResult);

    res.send({ content: aiResult});
  } catch (error) {
    console.error('Error running AI:', error);
    res.status(500).send('Error running AI');
  }
});

app.post('/api/expand', async (req, res) => {
  const { topic, files } = req.body;
  console.log(`Received request to expand topic: ${topic}`);
  console.log(`Files to search: ${files.join(', ')}`);

  let fileContents = '';

  files.forEach(file => {
    const filePath = path.join('/home/ec2-user/Code-Analyzer/UserFiles', file);
    console.log(`Checking file: ${filePath}`);
    if (fs.existsSync(filePath)) {
      console.log(`File found: ${filePath}`);
      fileContents += fs.readFileSync(filePath, 'utf-8');
    } else {
      console.log(`File not found: ${filePath}`);
    }
  });

  console.log(`File contents: ${fileContents}`);

  // Add to conversation history in memory
  conversationHistory.push({ topic, files, fileContents });

  const expandedMessage = tempAIResponseExpandFactoryPattern; // Replace with actual expansion logic if needed
  console.log(`Expanded message: ${expandedMessage}`);
  
  res.json({ content: expandedMessage, conversationHistory });
});

app.get('/api/getGraphData', async (req, res) => {
  data = await GraphData.createGraphFromData();
  res.status(200).send(data);
});

server.listen(port, () => console.log(`Server listening on port ${port}!`));
