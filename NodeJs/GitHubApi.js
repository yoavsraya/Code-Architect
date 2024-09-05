const axios = require('axios');
const path = require('path');
const { Octokit } = require("@octokit/rest");
const fs = require('fs');
const { exec } = require('child_process');
const dotenvPath = path.join(__dirname, '../.env');
require('dotenv').config({ path: dotenvPath });
const fetch = require('node-fetch');


let UserData;
let UserAuto;
let octokit;
const CLIENT_ID = process.env.GIT_HUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GIT_HUB_CLIENT_SECRET;
const localPath = '/home/ec2-user/Code-Architect/UserFiles'; 
const projectPath = '/home/ec2-user/Code-Architect/C#'; // Path to the C# project


class User {
    constructor(accessToken, userName, repositories, userPicture) {
        this.accessToken = accessToken;
        this.userName = userName;
        this.repositories = repositories;
        this.selectedRepo = null;
        this.userPic = userPicture;
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
}

async function createFolder(directory) {
    await exec(`mkdir -p ${directory}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error creating directory: ${error}`);
            return;
        }
        console.log(`Directory created successfully: ${stdout}`);
    });
}

function getRepoByName(repoName) {
    return UserData.repositories.find(repo => repo.name === repoName);
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
        }
    );

    const { data } = response;
    if (data.error) {
        throw new Error(`Failed to exchange code for token: ${data.error}`);
    }

    return data.access_token;
}

async function GetUserData(code) {
    try {
        const accessToken = await exchangeCodeForToken(code);
        octokit = new Octokit({ auth: accessToken, request: { fetch } });
        const { data: user } = await octokit.rest.users.getAuthenticated();
        UserAuto = user;
        UserData = new User(accessToken, user.login, [], user.avatar_url);
        await deleteFolder(localPath);
        await createFolder(localPath);
    } catch (error) {
        console.error('Error getting user data:', error);
        throw error;
    }
    console.log("END GetUserData function");
}

async function cloneSelectedRepo(selectedRepo) {
  UserData.selectedRepo = selectedRepo;
  console.log(`Selected repository: ${UserData.selectedRepo.owner}/${UserData.selectedRepo.name}`);
  
  const repoUrl = `https://github.com/${UserData.selectedRepo.owner}/${UserData.selectedRepo.name}.git`;

  // Clone the repository
  exec(`git clone ${repoUrl} ${localPath}`, (error, stdout, stderr) => {
      if (error) {
          console.error(`Error cloning repository: ${stderr}`);
          return;
      }
      console.log(`Repository cloned successfully: ${stdout}`);
  });


  console.log("END cloneSelectedRepo function");
}


async function getRepositories() {
    try {
        const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser();
        UserData.repositories = repos.map(repo => ({ owner: repo.owner.login, name: repo.name }));
        console.log(UserData.repositories);
        return UserData.repositories.map(repo => repo.name);
    } catch (error) {
        console.error('Error getting repositories:', error);
        throw error;
    }
}

async function GetUserPic() {
    if (UserData.userPic) {
        console.log("UserData.userPic");
        console.log(UserData.userPic);
        return UserData.userPic;
    } else {
        return null;
    }
}

module.exports = {
    getLoginUrl,
    cloneSelectedRepo,
    exchangeCodeForToken,
    getRepositories,
    GetUserData,
    GetUserPic,
    getRepoByName,
};