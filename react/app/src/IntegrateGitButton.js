// IntegrateGitButton
import axios from 'axios';
import React from 'react';
import './IntegrateGitButton.css';

const path = require('path');

const LoginURL = secrets.SSH_HOST;
const port = secrets.SERVER_PORT;

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