import React from 'react';
import './IntegrateGitButton.css';

const IntegrateGitButton = ({ setData, onSuccess, onFail }) => {
  const handleClick = () => {
    console.log('Integrating Git...');

    // Open the login URL in a new window
    const loginWindow = window.open('/Login/integrartion', '_blank');

    // Connect to the WebSocket server
    const socket = new WebSocket('ws://54.243.195.75:3000');

    socket.onopen = () => {
      console.log('WebSocket connection established');
    };

    socket.onmessage = (event) => {
      console.log('WebSocket message received:', event.data);
      const message = JSON.parse(event.data);
      if (message.loggedIn)
      {
        console.log("login finished, call back ended")
        fetch('http://54.243.195.75:3000/api/message')
        .then(response => {
          console.log('Response received from /api/message');
          return response.json();
        })
        .then(data => {
          setData(data); // Assuming you want to set some data on successful login
          onSuccess(data); // Trigger the onSuccess callback
        });
      }
      else
      {
        console.log("login finished, call back ended");
        onFail("login faild");
      }

      if (loginWindow)
      {
        loginWindow.close();
      }
      console.log("socket close")
      socket.close(); // Close the WebSocket connection after receiving the message     
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
