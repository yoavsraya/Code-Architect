const axios = require('axios');
const path = require('path');
const { Octokit } = require("@octokit/rest");
const fs = require('fs');
const { error } = require('console');
const { exec } = require('child_process');
const dotenvPath = path.join(__dirname, '../.env');
require('dotenv').config({ path: dotenvPath });

let UserData;
let UserAuto;
let octokit;
const CLIENT_ID = process.env.GIT_HUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GIT_HUB_CLIENT_SECRET;
const localPath = '/home/ec2-user/Code-Analyzer/UserFiles'; 

  class User {
    constructor(accessToken, userName, repositories) {
      this.accessToken = accessToken;
      this.userName = userName;
      this.repositories = repositories;
      this.selectedRepo = null;
    }
  }

  async function deleteFolder(directory) {
    await exec(`rm -rf ${directory}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error deleting directory: ${error}`);
        return;
      }
      console.log(`Directory deleted successfully: ${stdout}`);
    });

    await exec(`mkdir -p ${directory}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error creating directory: ${error}`);
        return;
      }
      console.log(`Directory created successfully: ${stdout}`);
    });
  }

function getLoginUrl() {
  return `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=user`;
}

async function exchangeCodeForToken(code) {
  const response = await axios.post(
    'https://github.com/login/oauth/access_token',
    {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
    },
    {
      headers: {
        accept: 'application/json',
      },
    },
  );

  const { data } = response;
  if (data.error) {
    throw new Error(`Failed to exchange code for token: ${data.error}`);
  }

  return data.access_token;
}

async function GetUserData(code)
{
  try { 
    const accessToken = await exchangeCodeForToken(code);
    octokit = await new Octokit({ auth: accessToken });
    const { data: user } = await octokit.rest.users.getAuthenticated();
    UserAuto = user;
    UserData = new User(accessToken, user.login, []);
    console.log(UserData);
    await deleteFolder(localPath);
  }
  catch (error) {
    console.error('Error getting user data:', error);
    throw error; // Re-throw for handling in server.js
  }
}

async function cloneSelectedRepo()
{
  UserData.selectedRepo = UserData.repositories[3];
  const repoUrl = `https://github.com/${UserData.selectedRepo.owner}/${UserData.selectedRepo.name}.git`; // replace with your repo url

  exec(`git clone ${repoUrl} ${localPath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error cloning repository: ${error}`);
      return;
    }
  console.log(`Repository cloned successfully: ${stdout}`);
});
}

async function PullSelectedRepo()
{
  UserData.selectedRepo = UserData.repositories[3];
  try
  {
    console.log(`Selected repository: ${UserData.selectedRepo.owner}/${UserData.selectedRepo.name}`);
    const { data: content } = await octokit.rest.repos.getContent({
      owner: UserData.selectedRepo.owner,
      repo: UserData.selectedRepo.name,
      path: '', // Get the root directory
    });
    console.log(`repository content:`);
    console.log(content);
    //const { data: content } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      //owner: UserData.userName,
      //repo: UserData.selectedRepo,
      //path: '',
      //headers: {
        //'X-GitHub-Api-Version': '2022-11-28'
      //}
    //});

    const csFiles = content.filter(file => file.type === 'file' && file.path.endsWith('.cs'));
    console.log(`cs files: ${csFiles}`);
    // Get the content of each .cs file
    csFiles.forEach(file => {
      octokit.rest.repos.getContent
      ({
        owner: UserData.selectedRepo.owner,
        repo: UserData.selectedRepo.name,
        path: file.path,
      })
      .then(({ data }) => 
      {
        // data.content holds the content of the file, encoded in base64
        const fileContent = Buffer.from(data.content, 'base64').toString('utf8');
        console.log(`file content: ${fileContent}`);
        // Save the content of the file to a local file
        fs.writeFile(`../UserFiles/${file.name}`, fileContent, 'utf8', (err) => {
          if (err)
          {
            console.error(`Error writing file ${file.name}:`, err);
            throw error;
          }
          else
          {
            console.log(`File ${file.name} has been saved.`);
          }
        });
      })
      .catch(error => {
        console.error(`Error getting content of ${file.path}:`, error);
        throw error;
      });
    });
  }
  catch(error)
  {
    console.error('Error pulling selected repository:', error);
    throw error;
  }
  // data is an array of objects, each representing a file or directory in the repository

}

async function getRepositories() {
  try
  {
    const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser();
    UserData.repositories = repos.map(repo => ({ owner: repo.owner.login, name: repo.name }));
    console.log(UserData.repositories);
  }
  catch(error)
  {
    console.error('Error getting repositories:', error);
    throw error;
  }
  
}


module.exports = {
  getLoginUrl,
  cloneSelectedRepo,
  exchangeCodeForToken,
  PullSelectedRepo,
  getRepositories,
  GetUserData,
};
