import './App.css';
import IntegrateGitButton from './IntegrateGitButton'; // Correct import
import GraphComponent from './GraphComponent'; // Assuming GraphComponent is defined correctly
import React, { useState } from 'react';

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState(null); // State variable to store the entire JSON response

  return (
    <div className="App">
      <header className="App-header" style={{ position: 'relative', padding: '20px' }}>
        <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
          <IntegrateGitButton setData={setData} />
        </div>
        <button className="hamburger-button" onClick={() => setIsOpen(!isOpen)}>
          ☰
        </button>
        {isOpen && data && (
          <div className="panel">
            <div className="message">
              <pre>{JSON.stringify(data, null, 2)}</pre>
            </div>
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
