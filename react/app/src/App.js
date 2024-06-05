import React from 'react';
import logo from './logo.svg';
import './App.css';
import IntegrateGitButton from './IntegrateGitButton';
import GraphComponent from './GraphComponent';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div style={{ marginTop: '80px' }}>
          <IntegrateGitButton />
        </div>
      </header>
      <div style={{ height: '100vh' }}>
        <h1>3D Graph Visualization</h1>
        <GraphComponent />
      </div>
    </div>
  );
}

export default App;
