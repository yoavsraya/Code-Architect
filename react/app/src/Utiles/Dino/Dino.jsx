import React, { useEffect, useRef, useState } from "react";
import "./Dino.css";

function Dino({ gameStarted, onGameOver, onRestart }) {
  const dinoRef = useRef();
  const cactusRef = useRef();
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const jump = () => {
    if (dinoRef.current && !dinoRef.current.classList.contains("jump") && !gameOver) {
      dinoRef.current.classList.add("jump");
      setTimeout(() => {
        if (dinoRef.current) { // Ensure dinoRef is still defined
          dinoRef.current.classList.remove("jump");
        }
      }, 300);
    }
  };

  useEffect(() => {
    let isAlive;
    if (gameStarted) {
      if (cactusRef.current) {
        cactusRef.current.style.animation = "block 1s infinite linear"; // Start cactus animation
      }

      isAlive = setInterval(() => {
        if (gameOver) return; // Stop processing if the game is over

        if (dinoRef.current && cactusRef.current) { // Ensure both refs are defined
          const dinoTop = parseInt(getComputedStyle(dinoRef.current).getPropertyValue("bottom"));
          const cactusLeft = parseInt(getComputedStyle(cactusRef.current).getPropertyValue("left"));

          if (cactusLeft < 60 && cactusLeft > 0 && dinoTop <= 75) {
            setGameOver(true);
            setScore(0);
            onGameOver();
            if (cactusRef.current) {
              cactusRef.current.style.animation = "none"; // Stop cactus animation
            }
          } else {
            setScore((prevScore) => prevScore + 1);
          }
        }
      }, 10);

      document.addEventListener("keydown", jump);
    } else {
      // Ensure cactus is not moving before the game starts
      if (cactusRef.current) {
        cactusRef.current.style.animation = "none";
      }
    }

    // Restart the game with the space key
    const handleSpaceKey = (event) => {
      if (event.code === "Space" && gameOver) {
        onRestart();
        setGameOver(false);
        setScore(0);
        if (cactusRef.current) {
          cactusRef.current.style.animation = "block 1s infinite linear"; // Restart cactus animation
        }
      }
    };

    document.addEventListener("keydown", handleSpaceKey);

    return () => {
      clearInterval(isAlive);
      document.removeEventListener("keydown", jump);
      document.removeEventListener("keydown", handleSpaceKey);
    };
  }, [gameStarted, gameOver, onGameOver, onRestart]);

  return (
    <div className="game">
      <div className="score">Score: {score}</div>
      {gameOver && <div className="game-over">Game Over! Press Space to Restart</div>}
      <div id="dino" ref={dinoRef}></div>
      <div id="cactus" ref={cactusRef}></div>
    </div>
  );
}

export default Dino;
