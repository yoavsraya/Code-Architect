import React from 'react';
import './LoadingScreen.css'; // Import the loadingPage.css

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <div className="loading-graphic"></div> {/* Graphic above the text */}
      <h2 className="loading-text">fetching your data...</h2>
    </div>
  );
};

export default LoadingScreen;
