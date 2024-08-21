import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import LoginPage from './LoginPage';
import Header from './Header';
import BigPanel from './BigPanel';
import LoadingScreen from './LoadingScreen'; // Import the LoadingScreen component

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState(null);
  const [selectedRepo, setSelectedRepo] = useState('');
  const [finishFetchRepo, setFinishFetchRepo] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add a loading state

  useEffect(() => {
    const savedIsAuthenticated = localStorage.getItem('isAuthenticated');
    const savedSelectedRepo = localStorage.getItem('selectedRepo');

    if (savedIsAuthenticated && savedSelectedRepo) {
      setIsAuthenticated(true);
      setSelectedRepo(savedSelectedRepo);
      setData({ repo: savedSelectedRepo });

      // Fetch selected repo data
      (async () => {
        try {
          const response = await fetch(`http://54.243.195.75:3000/api/fetchSelectedRepo?selectedRepo=${encodeURIComponent(savedSelectedRepo)}`);
          if (!response.ok) {
            console.error('Failed to fetch selected repository data');
          } else {
            setFinishFetchRepo(true);
          }
        } catch (error) {
          console.error('Error fetching selected repository data:', error);
        } finally {
          setIsLoading(false); // Set loading to false after fetch is done
        }
      })();
    } else {
      setIsLoading(false); // Set loading to false if there's no saved authentication or repo
    }
  }, []);

  const handleLogin = async (selectedRepo) => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
    setSelectedRepo(selectedRepo);
    setData({ repo: selectedRepo });
    setIsLoading(true); // Set loading to true when starting fetch

    try {
      const response = await fetch(`http://54.243.195.75:3000/api/fetchSelectedRepo?selectedRepo=${encodeURIComponent(selectedRepo)}`);
      if (!response.ok) {
        console.error('Failed to fetch selected repository data');
      } else {
        setFinishFetchRepo(true);
      }
    } catch (error) {
      console.error('Error fetching selected repository data:', error);
    } finally {
      setIsLoading(false); // Set loading to false after fetch is done
    }
  };

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setData(null);
    setSelectedRepo('');
    setFinishFetchRepo(false);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('selectedRepo');
  };

  return (
    <Router>
      <div className="App">
        <Header isOpen={isOpen} togglePanel={togglePanel} onLogout={handleLogout} />
        <div className="App-body">
          {isLoading ? ( // Check if loading state is true
            <LoadingScreen /> // Show the loading screen
          ) : (
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
                    <BigPanel data={data} setData={setData} />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
            </Routes>
          )}
        </div>
      </div>
    </Router>
  );
}

export default App;
