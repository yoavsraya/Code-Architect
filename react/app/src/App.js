import './App.css';
import IntegrateGitButton from './IntegrateGitButton';
import GraphComponent from './GraphComponent';
import React, { useState, useEffect } from 'react';

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState(''); // State variable to store the message

  // Fetch the message from the server when the component mounts
  useEffect(() => {
    fetch('/api/message') // Replace '/api/message' with the path to your server's endpoint
      .then(response => response.json()) // Parse the response as JSON
      .then(data => setMessage(data.message)); // Store the message in state
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    <div className="App">
      <header className="App-header" style={{ position: 'relative', padding: '20px' }}>
        <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
          <IntegrateGitButton />
        </div>
        <button className="hamburger-button" onClick={() => setIsOpen(!isOpen)}>
          ☰
        </button>
        {isOpen && (
          <div className="panel">
            <div className="message">
              <p>{message}</p>
            </div>
            {/* Add more messages as needed */}
          </div>
        )}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
          <div style={{ width: '100%', height: '650px', background: '#282c34' }}>
            <GraphComponent />
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;