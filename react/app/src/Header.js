import React from 'react';
import './Header.css';
import logo from './logo3.png';
import logo2 from './logo4.png';

const Header = () => {
  return (
    <header className="header">
      <div className="logo-container-left">
        <img src={logo} alt="Logo" className="logo" />
      </div>
      <div className="logo-container-right">
        <img src={logo2} alt="Logo 2" className="logo" />
      </div>
    </header>
  );
};

export default Header;
