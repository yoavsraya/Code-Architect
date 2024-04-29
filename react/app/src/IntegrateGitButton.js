// IntegrateGitButton.js
import React from 'react';
import './IntegrateGitButton.css';

const IntegrateGitButton = () => {
  const handleClick = () => {
    // Add your integration logic here
    console.log('Integrating Git...');
  };

  return (
    <button className="integrate-git-button" onClick={handleClick}>
      Integrate Git
    </button>
  );
};

export default IntegrateGitButton;
