import React, { useState } from 'react';
import './Header.css';
import logo from './logo3.png';
import logo2 from './logo4.png';
import bannerLogo from './logoAndPic/bannerLogo.png';
import githubLogo from './github-logo-white.png'; // Add your GitHub logo image
import Menu from './Menu'; // Import the Menu component


const Header = ({ onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="left-section">
        <img src={bannerLogo} alt="Logo 3" className="logo" />
      </div>
      <div className="right-section">
        <a href="https://github.com/yoavsraya/Code-Analyzer" target="_blank" rel="noopener noreferrer">
          <img src={githubLogo} alt="GitHub" className="github-logo" />
        </a>
        <div className="hamburger-menu" onClick={toggleMenu}>
          <svg viewBox="0 0 100 80" width="30" height="30">
            <rect width="100" height="10" fill="white"></rect>
            <rect y="30" width="100" height="10" fill="white"></rect>
            <rect y="60" width="100" height="10" fill="white"></rect>
          </svg>
        </div>
      </div>
      <Menu isOpen={isMenuOpen} onLogout={onLogout} onClose={closeMenu}/>
    </header>
  );
};

export default Header;
