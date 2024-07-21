import React, { useState } from 'react';
import IntegrateGitButton from './IntegrateGitButton';
import './LoginPage.css';
import loginImage from './login-bg.png';

const LoginPage = ({ onLogin, setData }) => {
  const [errorMessage, setErrorMessage] = useState('');

  const handleLoginSuccess = (response) => {
    console.log(response);
    onLogin(response); // Assuming onLogin is a prop function to handle login success
  };

  const handleLoginFail = (error) => {
    setErrorMessage(error); // Set the error message to display
    alert(error); // For demonstration, showing an alert. You can replace this with your error handling UI.
  };

  return (
    <div className="login-page">
      <img src={loginImage} alt="Login Background" className="login-image" />
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      <div className="login-content">
        <IntegrateGitButton setData={setData} onSuccess={handleLoginSuccess} onFail={handleLoginFail} />
      </div>
    </div>
  );
};

export default LoginPage;