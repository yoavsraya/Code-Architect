import React, { useState } from 'react';
import './LoadingScreen.css';
import Dino from "./Dino/Dino";

const LoadingScreen = () => {
  const [gameStarted, setGameStarted] = useState(false);

  const handleStart = () => {
    setGameStarted(true);
  };

  const handleGameOver = () => {
    setGameStarted(false);
  };

  return (
    <div className="loading-screen">
      <Dino gameStarted={gameStarted} onGameOver={handleGameOver} />
      {!gameStarted && (
        <button onClick={handleStart} className="start-button">Start Game</button>
      )}
      <div className="loading-text-container">
        <h2 className="loading-text">fetching your data...</h2>
        <div className="loading-graphic"></div>
      </div>
    </div>
  );
};

export default LoadingScreen;
