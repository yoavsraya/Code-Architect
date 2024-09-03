import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Menu.css';

const Menu = ({ isOpen, onLogout, onClose }) => {
  const navigate = useNavigate();

  const handleAboutClick = (e) => {
    e.preventDefault(); // Prevent default link behavior
    onClose(); // Close menu
    navigate('/about'); // Navigate to About page
  };

  const handleLogOutClick = (e) => {
    e.preventDefault(); // Prevent default link behavior
    onClose(); // Close menu

    // Check if onLogout is defined and the user is authenticated before calling it
    if (onLogout) {
      onLogout();
    } else {
      console.warn("Logout function is not available or user is not authenticated.");
    }
  };

  return (
    <div className={`menu ${isOpen ? 'open' : ''}`}>
      <button onClick={handleAboutClick}>About Us</button>
      <button onClick={handleLogOutClick}>Logout</button>
    </div>
  );
};

export default Menu;