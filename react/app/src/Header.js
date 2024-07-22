import React from 'react';
import './Header.css';
import logo from './logo3.png';
import logo2 from './logo4.png';
import githubLogo from './github-logo.png'; // Add your GitHub logo image

const Header = () => {
  return (
    <header className="header">
      <div className="left-section">
        <img src={logo} alt="Logo" className="TextLogo" />
        <img src={logo2} alt="Logo" className="Logo" />
      </div>
      <div className="right-section">
        <a href="https://github.com/yoavsraya/Code-Analyzer" target="_blank" rel="noopener noreferrer">
          <img src={githubLogo} alt="GitHub" className="github-logo" />
        </a>
      </div>
    </header>
  );
};

export default Header;
