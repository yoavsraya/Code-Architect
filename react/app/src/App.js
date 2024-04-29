import logo from './logo.svg';
import './App.css';
import React from 'react';
import IntegrateGitButton from './IntegrateGitButton';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div style={{ marginTop: '80px' }}>
          <IntegrateGitButton />
        </div>
      </header>
    </div>
  );
}

export default App;
