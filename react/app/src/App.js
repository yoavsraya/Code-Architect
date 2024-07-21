import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import GraphComponent from './GraphComponent';
import LoginPage from './LoginPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState(null); // State variable to store the entire JSON response

  const handleLogin = (response) => {
    // Logic to handle login, e.g., saving the token
    setIsAuthenticated(true);
  };

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Routes>
            <Route
              path="/login"
              element={
                isAuthenticated ? (
                  <Navigate to="/" />
                ) : (
                  <LoginPage onLogin={handleLogin} setData={setData} />
                )
              }
            />
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  <>
                    <button className="hamburger-button" onClick={() => setIsOpen(!isOpen)}>
                      ☰
                    </button>
                    {isOpen && data && (
                      <div className="panel">
                        <div className="message" dangerouslySetInnerHTML={{ __html: data.message.content }} />
                      </div>
                    )}
                    <div className="graph-container">
                      <GraphComponent />
                    </div>
                  </>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
          </Routes>
        </header>
      </div>
    </Router>
  );
}

export default App;
