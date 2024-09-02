import React from 'react';
import './LoadingScreenAI.css'; // Import the loadingPage.css

const LoadingScreenAI = () => {
  return (
    <div className="loading-screenAI">
      <div className="loading-graphicAI"></div> {/* Graphic above the text */}
      <h2 className="loading-textAI">AI is checking your code</h2>
    </div>
  );
};

export default LoadingScreenAI;
