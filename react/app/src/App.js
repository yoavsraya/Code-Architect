import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import LoginPage from './LoginPage';
import Header from './Header';
import BigPanel from './BigPanel';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState(null); // State variable to store the entire JSON response
  const [selectedRepo, setSelectedRepo] = useState('');
  const [finishFetchRepo, setFinishFetchRepo] = useState(false);
  const falseval = false;

  const handleLogin = async (selectedRepo) => {
    // Logic to handle login, e.g., saving the token
    setIsAuthenticated(true);
    setSelectedRepo(selectedRepo); // Store the selected repository name in the state
    setData({ repo: selectedRepo }); // Store the selected repository name in the data state

    try {
      console.log("sending fetch to fetch selected repo");
      const response = await fetch(`http://54.243.195.75:3000/api/fetchSelectedRepo?selectedRepo=${encodeURIComponent(selectedRepo)}`);
      console.log("done!!!");
      if (!response.ok) {
        console.error('Failed to fetch selected repository data');
      } else {
        console.log("finishFetchRepo = true");
        setFinishFetchRepo(true);
      }
    } catch (error) {
      console.error('Error fetching selected repository data:', error);
    }
  };

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Router>
      <div className="App">
        <Header isOpen={isOpen} togglePanel={togglePanel} /> {/* Pass the hamburger menu state and toggle function */}
        <div className="App-body">
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
                  <BigPanel data={data} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
