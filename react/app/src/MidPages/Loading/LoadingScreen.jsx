import React, { useState, useEffect } from 'react';
import './LoadingScreen.css';
import Dino from "../../Utiles/Dino/Dino";

const LoadingScreen = () => {
  const [gameStarted, setGameStarted] = useState(false); // Initialize to false to wait for user input
  const [gameOver, setGameOver] = useState(false);

  const handleGameOver = () => {
    setGameStarted(false);
    setGameOver(true);
  };

  const handleRestart = () => {
    setGameStarted(true);
    setGameOver(false);
  };

  // Wait for the first space press to start the game
  useEffect(() => {
    const handleSpaceKey = (event) => {
      if (event.code === "Space" && !gameStarted) {
        setGameStarted(true); // Start the game on first space bar press
      }
    };

    document.addEventListener("keydown", handleSpaceKey);
    return () => document.removeEventListener("keydown", handleSpaceKey);
  }, [gameStarted]);

  return (
    <div className="loading-screen">
      <Dino gameStarted={gameStarted} onGameOver={handleGameOver} onRestart={handleRestart} />
        <div className="loading-text">fetching your data...</div>
        <div className="loading-graphic"></div>
    </div>
  );
};

export default LoadingScreen;
