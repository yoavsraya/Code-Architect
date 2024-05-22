// IntegrateGitButton
import axios from 'axios';
import React from 'react';
import './IntegrateGitButton.css';
try
{
  const dotenvPath = path.join(__dirname, '../../../.env');
  require('dotenv').config({ path: dotenvPath });
}
catch (error)
{
  console.error('Error loading .env file:', error);
}

const path = require('path');

const LoginURL = process.env.SSH_HOST;
const port = process.env.REACT_PORT;

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