import React, { useState, useEffect } from 'react';
import IntegrateGitButton from './IntegrateGitButton';
import './LoginPage.css';
import loginImage from './login-bg.png';

const LoginPage = ({ onLogin, setData }) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [repoList, setRepoList] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState('');

  const handleLoginSuccess = (data) => {
    console.log('Login successful. Data:', data);
    setRepoList(data); // Assuming the response is a list of repo names
  };

  const handleLoginFail = (error) => {
    setErrorMessage(error); // Set the error message to display
    alert(error); // For demonstration, showing an alert. You can replace this with your error handling UI.
  };

  const handleRepoSelect = (event) => {
    setSelectedRepo(event.target.value);
  };

  const handleConfirmSelection = () => {
    if (selectedRepo) {
      onLogin(selectedRepo); // Notify the parent component with the selected repository
      setData({ repo: selectedRepo }); // Set the selected repository data
    } else {
      setErrorMessage('Please select a repository.');
    }
  };

  useEffect(() => {
    // Log the updated repoList when it changes
    console.log('Updated repo list:', repoList);
  }, [repoList]);

  return (
    <div className="login-page">
      <img src={loginImage} alt="Login Background" className="login-image" />
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      <div className="login-content">
        <IntegrateGitButton setData={setData} onSuccess={handleLoginSuccess} onFail={handleLoginFail} />
      </div>
      {repoList.length > 0 && (
        <div className="repo-list">
          <label htmlFor="repo-select">Choose a repository:</label>
          <select id="repo-select" value={selectedRepo} onChange={handleRepoSelect}>
            <option value="" disabled>Select a repository</option>
            {repoList.map((repo, index) => (
              <option key={index} value={repo}>
                {repo}
              </option>
            ))}
          </select>
          <button onClick={handleConfirmSelection}>Confirm Selection</button>
        </div>
      )}
    </div>
  );
};

export default LoginPage;