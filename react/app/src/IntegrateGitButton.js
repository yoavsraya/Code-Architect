import React from 'react';
import './IntegrateGitButton.css';
import gitHubLogo from './github-logo-white.png';

const IntegrateGitButton = ({ setData, onSuccess, onFail }) => {
  const handleClick = () => {
    console.log('Integrating Git...');

    // Open the login URL in a new window
    const loginWindow = window.open('/Login/integration', '_blank');

    // Connect to the WebSocket server
    const socket = new WebSocket('ws://54.243.195.75:3000');
/////
    socket.onopen = () => {
      console.log('WebSocket connection established');
    };

    socket.onmessage = (event) => {
      console.log('WebSocket message received:', event.data);
      const message = JSON.parse(event.data);
      if (message.loggedIn) {
        console.log("Login finished, fetching repo list");

        // Fetch the repo list and user picture
        Promise.all([
          fetch('http://54.243.195.75:3000/api/repoList').then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          }),
          fetch('http://54.243.195.75:3000/api/getUserPic').then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          })
        ])
        .then(([datarepo, dataurl]) => {
          console.log('Response received from /api/repoList', datarepo);
          console.log('Response received from /api/getUserPic', dataurl);
          onSuccess(datarepo, dataurl); // Notify the parent component with the repo list and user picture
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
////a
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  };

  return (
    <button className="integrate-git-button" onClick={handleClick}>
       <span className="button-text">Login</span>
      <img src={gitHubLogo} alt="GitHub Logo" className="button-image" />
    </button>
  );
};

export default IntegrateGitButton;
