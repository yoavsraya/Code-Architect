import React from 'react';
import './AboutPage.css';
import { useNavigate } from 'react-router-dom';
import aboutUspic from './logoAndPic/aboutUS.svg';

const AboutPage = () => {
    const navigate = useNavigate(); // Hook to navigate programmatically
  
    const handleBack = () => {
        navigate('/'); // Navigate back to the previous page
    };
  
    return (
        <div className="about-page">
          <button className="back-button" onClick={handleBack}>Back</button>
          <div className="image-container">
        <img src={aboutUspic} alt="About Us" className="about-image" />
      </div>
    </div>
  );
};

export default AboutPage;