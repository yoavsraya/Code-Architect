// src/components/Menu.js

import React from 'react';
import './Menu.css';

const Menu = ({ isOpen }) => {
  return (
    <div className={`menu ${isOpen ? 'open' : ''}`}>
      <a href="#home">Home</a>
      <a href="#about">About</a>
      <a href="#services">Services</a>
      <a href="#contact">Contact</a>
    </div>
  );
};

export default Menu;
