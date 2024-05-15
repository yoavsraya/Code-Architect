const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');
const { Octokit } = require("@octokit/rest");
const fs = require('fs');

let UserData;
let UserAuto;
const CLIENT_ID = process.env.Git_Hub_CLIENT_ID;
const CLIENT_SECRET = process.env.Git_Hub_CLIENT_SECRET;

const dotenv = require('dotenv').config({ path: '../.env' });
if (dotenv.error)
  {
    const dotenv = require('dotenv').config();
    if (dotenv.error)
      {
        throw dotenv.error;
      }
  }

  octokit = new Octokit({
    auth: `${userData.access_token}`,
  });

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

async function GetUserData(code)
{
    try { 
      UserAuto = await exchangeCodeForToken(code);
      const {user} = await octokit.rest.users.getAuthenticated();
      UserData = user;
    }
    catch (error) {
      console.error('Error getting user data:', error);
      throw error; // Re-throw for handling in server.js
    }
}

async function exchangeCodeForToken(code) {
  const params = {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    code,
    grant_type: 'authorization_code',
  };

  try {
    const response = await axios.post('https://github.com/login/oauth/access_token', params, {
      headers: {
        Accept: 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    throw error; // Re-throw for handling in server.js
  }
}

async function PullSelectedRepo()
{
  user.selectedRepo = userData[0];
  octokit.rest.repos.getContent({
    owner: username,
    repo: user.selectedRepo.name,
    path: '/', // get the content of the root directory
  })
  .then(({ data }) => {
  // data is an array of objects, each representing a file or directory in the repository
  const csFiles = data
    .filter(file => file.type === 'file' && file.path.endsWith('.cs'));

  // Get the content of each .cs file
  csFiles.forEach(file => {
    octokit.rest.repos.getContent({
      owner: username,
      repo: user.selectedRepo.name,
      path: file.path,
    })
    .then(({ data }) => {
      // data.content holds the content of the file, encoded in base64
      const fileContent = Buffer.from(data.content, 'base64').toString('utf8');

      // Save the content of the file to a local file
      fs.writeFile(`../UserFiles/${file.name}`, fileContent, 'utf8', (err) => {
        if (err) {
          console.error(`Error writing file ${file.name}:`, err);
        } else {
          console.log(`File ${file.name} has been saved.`);
        }
      });
    })
    .catch(error => {
      console.error(`Error getting content of ${file.path}:`, error);
    });
  });
})
.catch(error => {
  console.error('Error getting repository content:', error);
});
}

async function getRepositories() {
  const username = UserData.login;
  octokit.rest.repos.listForAuthenticatedUser()
    .then(({ UserData }) => {
      user = new User(userData.access_token,username,UserData);
      const repoNames = data.map(repo => repo.name);
      console.log(repoNames); // This will log an array of repository names
    })  
      .catch(error => {
        console.error('Error getting repositories:', error);
    });
  
}


module.exports = {
  getLoginUrl,
  exchangeCodeForToken,
  GetOctokit,
  PullSelectedRepo,
  getRepositories,
  GetUserData,
};
