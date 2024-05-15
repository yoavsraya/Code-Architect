// IntegrateGitButton
import axios from 'axios';
import React from 'react';
import './IntegrateGitButton.css';

const path = require('path');
const dotenv = require('dotenv').config({ path: '../../../.env' });
if (dotenv.error)
{
  const dotenv = require('dotenv').config();
  if (dotenv.error)
    {
      throw dotenv.error;
    }
}

const LoginURL = process.env.AppURL;
const port = process.env.Server_PORT;

const IntegrateGitButton = () => {
  const handleClick = () => {
    console.log('Integrating Git...');
    window.open(`http://${LoginURL}:${port}/Login`);   
  };

  return (
    <button className="integrate-git-button" onClick={handleClick}>
      Integrate Git
    </button>
  );
};

export default IntegrateGitButton;