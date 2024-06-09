// src/App.js

import React from 'react';
import logo from './logo.svg';
import './App.css';
import IntegrateGitButton from './IntegrateGitButton';
import GraphComponent from './GraphComponent';

function App() {
  return (
    <div className="App">
      <header className="App-header" style={{ position: 'relative', padding: '20px' }}>
        <img src={logo} className="App-logo" alt="logo" style={{ position: 'absolute', top: '10px', right: '10px', width: '50px', height: '50px' }} />
        <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
          <IntegrateGitButton />
        </div>
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
