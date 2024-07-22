import React from 'react';
import './Header.css';
import logo from './logo3.png';
import logo2 from './logo4.png';
import logo3 from './logo5.png';
import githubLogo from './github-logo.png'; // Add your GitHub logo image

const Header = ({ isOpen, togglePanel }) => {
  return (
    <header className="header">
      <div className="left-section">
        <img src={logo3} alt="Logo 3" className="logo" />
      </div>
      <div className="right-section">
        <a href="https://github.com/yoavsraya/Code-Analyzer" target="_blank" rel="noopener noreferrer">
          <img src={githubLogo} alt="GitHub" className="github-logo" />
        </a>
        <div className="hamburger-menu" onClick={togglePanel}>
          <svg viewBox="0 0 100 80" width="30" height="30">
            <rect width="100" height="10" fill="black"></rect>
            <rect y="30" width="100" height="10" fill="black"></rect>
            <rect y="60" width="100" height="10" fill="black"></rect>
          </svg>
        </div>
      </div>
    </header>
  );
};

export default Header;
