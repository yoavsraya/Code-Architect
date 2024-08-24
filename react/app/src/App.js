import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import LoginPage from './LoginPage';
import Header from './Header';
import BigPanel from './BigPanel';
import LoadingScreen from './LoadingScreen'; // Import the LoadingScreen component

function App() {
  const [finishFetchRepo, setFinishFetchRepo] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Set loading to false initially
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState(null);
  const [selectedRepo, setSelectedRepo] = useState('');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const connectWebSocket = () => {
      const ws = new WebSocket('ws://localhost:5001'); // Updated to match the C# server port

      ws.onopen = () => {
        console.log('WebSocket connection established');
      };

      ws.onmessage = (event) => {
        console.log('WebSocket message received in app.js:', event.data);
        try {
          const message = JSON.parse(event.data);
          if (message.GraphJason) {
            setIsLoading(false); // Stop loading screen when the message is received
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed. Attempting to reconnect...');
        // Attempt to reconnect after a delay
        setTimeout(connectWebSocket, 5000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        // Attempt to reconnect after a delay
        setTimeout(connectWebSocket, 10000);
      };

      setSocket(ws);
    };

    connectWebSocket();

    // Cleanup WebSocket connection on component unmount
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);

  async function fetchAndBuildProject(i_selectedRepo) {
    try {
      const response = await fetch(`http://54.243.195.75:3000/api/fetchSelectedRepo?selectedRepo=${encodeURIComponent(i_selectedRepo)}`);
      if (!response.ok) {
        console.error('Failed to fetch selected repository data');
      } else {
        setFinishFetchRepo(true);
        console.log('Selected repository data fetched successfully');
      }
    } catch (error) {
      console.error('Error fetching selected repository data:', error);
    }

    try {
      const response = await fetch(`http://54.243.195.75:3000/api/buildProject`);
      if (!response.ok) {
        console.error('Failed to build the project');
      } else {
        console.log('Project built successfully');
      }
    } catch (error) {
      console.error('Error building the project:', error);
    }
  }

  useEffect(() => {
    const savedIsAuthenticated = localStorage.getItem('isAuthenticated');
    const savedSelectedRepo = localStorage.getItem('selectedRepo');

    console.log('check if the user already signed in and selected a repo', savedIsAuthenticated, savedSelectedRepo);
    if (savedIsAuthenticated && savedSelectedRepo) {
      console.log('User is already authenticated');
      setIsAuthenticated(true);
      setSelectedRepo(savedSelectedRepo);
      setData({ repo: savedSelectedRepo });

      // Start loading when checking saved authentication
      setIsLoading(true);
      try {
        fetchAndBuildProject(savedSelectedRepo);
      } catch (error) {
        console.error('Error fetching selected repository data:', error);
      }
    }
  }, []);

  const handleLogin = async (selectedRepo) => {
    console.log("handle login");
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
    setSelectedRepo(selectedRepo);
    setData({ repo: selectedRepo });
    setIsLoading(true); // Start loading when login starts
    try {
      fetchAndBuildProject(selectedRepo);
    } catch (error) {
      console.error('Error fetching selected repository data:', error);
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
                  isLoading ? ( // Show loading screen if loading is true
                    <LoadingScreen />
                  ) : (
                    <BigPanel data={data} setData={setData} />
                  )
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
