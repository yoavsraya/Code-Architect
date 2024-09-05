import React, { useEffect, useRef, useState } from "react";
import "./Dino.css";

function Dino({ gameStarted, onGameOver }) {
  const dinoRef = useRef();
  const cactusRef = useRef();
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const jump = () => {
    if (!!dinoRef.current && !dinoRef.current.classList.contains("jump") && !gameOver) {
      dinoRef.current.classList.add("jump");
      setTimeout(function () {
        dinoRef.current.classList.remove("jump");
      }, 300);
    }
  };

  useEffect(() => {
    let isAlive;
    if (gameStarted) {
      isAlive = setInterval(function () {
        if (!gameOver) {
          const dinoTop = parseInt(getComputedStyle(dinoRef.current).getPropertyValue("top"));
          const cactusLeft = parseInt(getComputedStyle(cactusRef.current).getPropertyValue("left"));

          if (cactusLeft < 40 && cactusLeft > 0 && dinoTop >= 140) {
            setGameOver(true);
            setScore(0);
            onGameOver();
          } else {
            setScore(prevScore => prevScore + 1);
          }
        }
      }, 10);

      document.addEventListener("keydown", jump);
    }

    return () => {
      clearInterval(isAlive);
      document.removeEventListener("keydown", jump);
    };
  }, [gameStarted, gameOver, onGameOver]);

  const handleRestart = () => {
    setGameOver(false);
    setScore(0);
    cactusRef.current.style.left = '580px';
  };

  return (
    <div className="game">
      <div className="score">Score: {score}</div>
      {gameOver && (
        <div className="game-over">
          Game Over! Your Score: {score}
        </div>
      )}
      <div id="dino" ref={dinoRef}></div>
      <div id="cactus" ref={cactusRef}></div>
    </div>
  );
}

export default Dino;
