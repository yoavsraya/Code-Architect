import React from 'react';
import './LoadingScreenAI.css'; // Import the loadingPage.css

const LoadingScreenAI = () => {
  return (
    <div className="loading-screenAI">
      <div className="loading-graphicAI"></div> {/* Graphic above the text */}
      <h2 className="loading-textAI">The AI ​​expands is analysis on the specific topic you requested</h2>
    </div>
  );
};

export default LoadingScreenAI;