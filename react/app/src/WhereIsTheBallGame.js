// WhereIsTheBallGame.js
import React, { useState } from 'react';
import './WhereIsTheBallGame.css'; // Add your CSS styles for the game

const WhereIsTheBallGame = () => {
  const [ballPosition, setBallPosition] = useState(Math.floor(Math.random() * 3));
  const [guess, setGuess] = useState(null);
  const [message, setMessage] = useState('');

  const handleGuess = (index) => {
    setGuess(index);
    if (index === ballPosition) {
      setMessage('You found the ball!');
    } else {
      setMessage('Try again!');
    }
  };

  return (
    <div className="game-container">
      <h3>Find the Ball!</h3>
      <div className="cups">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className={`cup ${guess === index ? 'guessed' : ''}`}
            onClick={() => handleGuess(index)}
          >
            {guess === index && index === ballPosition ? '⚽' : '🧢'}
          </div>
        ))}
      </div>
      {message && <p>{message}</p>}
      <button onClick={() => window.location.reload()}>Play Again</button>
    </div>
  );
};

export default WhereIsTheBallGame;
