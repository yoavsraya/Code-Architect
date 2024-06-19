import React from 'react';
import './IntegrateGitButton.css';

const IntegrateGitButton = ({ setData }) => {
  const handleClick = () => {
    console.log('Integrating Git...');

    // Open the login URL in a new window
    const loginWindow = window.open('http://54.243.195.75:3000/Login', '_blank');

    // Connect to the WebSocket server
    const socket = new WebSocket('ws://54.243.195.75:3000');

    socket.onopen = () => {
      console.log('WebSocket connection established');
    };

    socket.onmessage = (event) => {
      console.log('WebSocket message received:', event.data);
      const message = JSON.parse(event.data);
      if (message.loggedIn) {
        console.log("login finished, call back ended")
        fetch('http://54.243.195.75:3000/api/message')
        .then(response => {
          console.log('Response received from /api/message');
          return response.json();
        })
        .then(aiResult => {
          console.log("Parsed aiResult:", aiResult);
          setData(aiResult); // Set the data state to the entire JSON response
          if (loginWindow)
          {
            loginWindow.close();
          }
            console.log("socket close")
            socket.close(); // Close the WebSocket connection after receiving the message
          })
          .catch(error => console.error('Error:', error));
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
