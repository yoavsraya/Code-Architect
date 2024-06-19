import './App.css';
import IntegrateGitButton from './IntegrateGitButton'; // Correct import
import GraphComponent from './GraphComponent'; // Assuming GraphComponent is defined correctly
import React, { useState } from 'react';

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState(null); // State variable to store the entire JSON response

  return (
    <div className="App">
      <header className="App-header">
        <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
          <IntegrateGitButton setData={setData} />
        </div>
        <button className="hamburger-button" onClick={() => setIsOpen(!isOpen)}>
          ☰
        </button>
        {isOpen && data && (
          <div className="panel">
            <div className="message"
            dangerouslySetInnerHTML={{ __html: data.message.content }}
            />
            </div>
          
        )}
        <div className="graph-container">
          <GraphComponent />
        </div>
      </header>
    </div>
  );
}

export default App;
