// src/components/Menu.js

import React from 'react';
import './Menu.css';

const Menu = ({ isOpen , onLogout }) => {
  return (
    <div className={`menu ${isOpen ? 'open' : ''}`}>
      <a href="#about">About Us</a>
      <a href="#logout" onClick={onLogout}>Logout</a>
    </div>
  );
};

export default Menu;
