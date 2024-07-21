import React from 'react';
import './IntegrateGitButton.css';

const IntegrateGitButton = ({ setData, onSuccess, onFail }) => {
  const handleClick = () => {
    console.log('Integrating Git...');

    // Open the login URL in a new window
    const loginWindow = window.open('/Login/integration', '_blank');

    // Connect to the WebSocket server
    const socket = new WebSocket('ws://54.243.195.75:3000');

    socket.onopen = () => {
      console.log('WebSocket connection established');
    };

    socket.onmessage = (event) => {
      console.log('WebSocket message received:', event.data);
      const message = JSON.parse(event.data);
      if (message.loggedIn) {
        console.log("Login finished, fetching repo list");
        fetch('http://54.243.195.75:3000/api/repoList')
          .then(response => response.json())
          .then(data => {
            console.log('Response received from /api/repoList', data);
            onSuccess(data); // Trigger the onSuccess callback with the data
            if (loginWindow) {
              loginWindow.close();
            }
            console.log("Socket closing");
            socket.close(); // Close the WebSocket connection after receiving the message
          })
          .catch(error => {
            console.error('Fetch error:', error);
            onFail('Fetch error');
            if (loginWindow) {
              loginWindow.close();
            }
            console.log("Socket closing");
            socket.close(); // Close the WebSocket connection after receiving the message
          });
      } else {
        console.log("Login failed, callback ended");
        onFail("Login failed");
        if (loginWindow) {
          loginWindow.close();
        }
        console.log("Socket closing");
        socket.close(); // Close the WebSocket connection after receiving the message
      }
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  };

  return (
    <button className="integrate-git-button" onClick={handleClick}>
      Integrate Git
    </button>
  );
};

export default IntegrateGitButton;
