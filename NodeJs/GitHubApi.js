const axios = require('axios');
const path = require('path');
const { Octokit } = require("@octokit/rest");
const fs = require('fs');
const dotenvPath = path.join(__dirname, '../.env');
require('dotenv').config({ path: dotenvPath });

let UserData;
let UserAuto;
const CLIENT_ID = process.env.GIT_HUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GIT_HUB_CLIENT_SECRET;

  class User {
    constructor(accessToken, userName, repositories) {
      this.accessToken = accessToken;
      this.userName = userName;
      this.repositories = repositories;
      this.selectedRepo = null;
    }
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
    const octokit = new Octokit({ auth: accessToken });
    const { data: user } = await octokit.rest.users.getAuthenticated();
    UserAuto = user;
    UserData = new User(accessToken, user.login, []);
  
  }
  catch (error) {
    console.error('Error getting user data:', error);
    throw error; // Re-throw for handling in server.js
  }
}


async function PullSelectedRepo()
{
  UserData.selectedRepo = UserData.repositories[0];
  console.log(`Selected repository: ${UserData.selectedRepo}`);
  try
  {
    const { data: content } = await this.octokit.rest.repos.getContent({
      owner: this.userName,
      repo: this.selectedRepo,
      path: '', // Get the root directory
    });
    const csFiles = content.filter(file => file.type === 'file' && file.path.endsWith('.cs'));
    // Get the content of each .cs file
    csFiles.forEach(file => {
      octokit.rest.repos.getContent
      ({
        owner: username,
        repo: user.selectedRepo.name,
        path: file.path,
      })
      .then(({ data }) => 
      {
        // data.content holds the content of the file, encoded in base64
        const fileContent = Buffer.from(data.content, 'base64').toString('utf8');
  
        // Save the content of the file to a local file
        fs.writeFile(`../UserFiles/${file.name}`, fileContent, 'utf8', (err) => {
          if (err)
          {
            console.error(`Error writing file ${file.name}:`, err);
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
    const { data: repos } = await this.octokit.rest.repos.listForAuthenticatedUser();
    const repoNames = repos.map(repo => repo.name);
    console.log(repoNames);
    userData.repositories = repoNames;
  }
  catch(error)
  {
    console.error('Error getting repositories:', error);
  }
  
}


module.exports = {
  getLoginUrl,
  exchangeCodeForToken,
  PullSelectedRepo,
  getRepositories,
  GetUserData,
};
