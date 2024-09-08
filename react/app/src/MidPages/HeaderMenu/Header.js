import React, { useState } from 'react';
import './Header.css';
import bannerLogo from '../../Utiles/logoAndPic/bannerLogo.png';
import githubLogo from '../../Utiles/logoAndPic/github-logo-white.png';
import Menu from './Menu';


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
        <a href="https://github.com/yoavsraya/Code-Architect" target="_blank" rel="noopener noreferrer">
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
