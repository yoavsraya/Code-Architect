const fs = require('fs');
const path = require('path');
const http = require('http');
const express = require('express');
const WebSocket = require('ws');
const GitHubApi = require('./GitHubApi');
const OpenAIApi = require('./OpenAI');
const CsUtiles = require('../C#/utils');
const cors = require('cors'); 
const GraphData = require('./GraphData.js');
const getProjectFilePathMapping = require('./GetFilePath');
const { exec } = require('child_process');
const dotenvPath = path.join(__dirname, '../.env');
require('dotenv').config({ path: dotenvPath });

async function init() {
  // Dynamically import the ES module
  const { Webhooks } = await import('@octokit/webhooks');


const app = express();
app.use(cors()); 
app.use(express.json());

const webhooks = new Webhooks({
  secret: process.env.GIT_HUB_WEBHOOK_SECRET, 
});

app.use(webhooks.middleware);

console.log("socket");
const server = http.createServer(app);
console.log('Initializing WebSocket server...');
const wss = new WebSocket.Server({ server });

webhooks.on('push', ({ id, name, payload }) => {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ push: true }));
    }
  })   
});


let isLoggedIn = false;
let repoList;

const port = process.env.SERVER_PORT;
const filePathMapping = getProjectFilePathMapping(); // Initialize filePathMapping



wss.on('connection', (ws, req) => {
  // Log when a new client connects
  console.log(`Client connected from ${req.socket.remoteAddress}`);

  // Log the URL being used for the WebSocket connection
  console.log(`WebSocket connection URL: ${req.url}`);

  ws.on('message', (message) => {
    // Log received messages from clients
    console.log(`Received message from client: ${message}`);
  });

  ws.on('close', () => {
    // Log when a client disconnects
    console.log('Client disconnected');
  });
});

wss.on('error', (error) => {
  // Log any errors that occur on the WebSocket server
  console.error('WebSocket Server Error:', error);
});

app.get('/login-status', (req, res) => {
  res.json({ loggedIn: isLoggedIn });
});


app.get('/', (req, res) => res.send('Hello World!'));

app.get('/LogIn', (req, res) => {
  console.log("/LogIn");
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
    console.log('GET callback');
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
  res.send(repoList); //
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
  const dotnetPath = '/usr/local/share/dotnet'; // Path to dotnet binary
  
  console.log('Running dotnet build...');
  exec(`dotnet build /home/ec2-user/Code-Architect/C#`, {
      env: { ...process.env, PATH: `${process.env.PATH}:${dotnetPath}` }
  }, (buildError, buildStdout, buildStderr) => {
      if (buildError) {
          console.error(`Error during build: ${buildStderr}`);
          return;
      }
      console.log(`Build output: ${buildStdout}`);

      // After building, run the dotnet application
      console.log('Running dotnet application...');
      exec(`dotnet run --project /home/ec2-user/Code-Architect/C# /home/ec2-user/Code-Architect/UserFiles`, {
          env: { ...process.env, PATH: `${process.env.PATH}:${dotnetPath}` }
      }, (runError, runStdout, runStderr) => {
          if (runError) {
              console.error(`Error running application: ${runStderr}`);
              return;
          }
          console.log(`Run output: ${runStdout}`);
      });
  });
});


app.get('/api/runAI', async (req, res) => {
  try {
    const aiResult = await OpenAIApi.RunAI();
    console.log('AI Result:', aiResult);
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ runAI: true  , content: aiResult}));
      }
    });
    res.status(200);
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
    if (!file.endsWith('.cs')) {
      file += '.cs';
    }
    const folder = filePathMapping[file];
    if (folder) {
      const filePath = path.join('/home/ec2-user/Code-Architect/UserFiles', folder, file);
      console.log(`Checking file: ${filePath}`);
      if (fs.existsSync(filePath)) {
        console.log(`File found: ${filePath}`);
        fileContents += fs.readFileSync(filePath, 'utf-8');
      } else {
        console.log(`File not found: ${filePath}`);
      }
    } else {
      console.log(`Folder for file ${file} not found in project structure.`);
    }
  });

  console.log(`File contents: ${fileContents}`);

  try {
    const expandedMessage = await OpenAIApi.ExpandTopic(topic, fileContents);
    console.log(`Expanded message: ${expandedMessage}`);
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ ExtandAI: true }));
      }
    });
    res.json({ content: expandedMessage });
  } catch (error) {
    console.error('Error expanding topic:', error);
    res.status(500).send('Error expanding topic');
  }
});

app.get('/api/getGraphData', async (req, res) => {
  console.log("app.get('/api/getGraphData', async (req, res) => {'");
  try
  {
    data = await GraphData.createGraphFromData();
  }
  catch (error)
  {
    console.error('Error getting graph data:', error);
    res.status(500).send('Error getting graph data');
  }
  finally
  {
    
  }
  res.status(200).send(data);
});

app.get('/api/jasonParsing', async (req, res) => {
  console.log("jason parsing is done notify react");
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN)
    {
      console.log("notife react");
      client.send(JSON.stringify({ GraphJason: true }));
    }
  });
   res.status(200).send();
});

server.listen(port, () => console.log(`Server listening on port ${port}!`));

}
init().catch(console.error);
