// IntegrateGitButton
import React from 'react';
import './IntegrateGitButton.css';


//const path = require('path');

const IntegrateGitButton = () => {
  const handleClick = () => {
    console.log('Integrating Git...');
    window.open(`http://54.243.195.75:3000/Login`);   
  };

  return (
    <button className="integrate-git-button" onClick={handleClick}>
      Integrate Git
    </button>
  );
};

export default IntegrateGitButton;