import React, { useState, useEffect } from 'react';
import IntegrateGitButton from './IntegrateGitButton';
import CustomSelect from './CustomSelect';
import './LoginPage.css';
import loginImage from './logoAndPic/login logo.svg';
import Header from './Header';

const LoginPage = ({ onLogin, setData }) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [repoList, setRepoList] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState('');
  const [userProfile, setUserProfile] = useState(null);

  const handleLoginSuccess = (datarepo, dataurl) => {
    console.log('Login successful. Repo Data:', datarepo, 'User Profile:', dataurl);
    setRepoList(datarepo); // Assuming the response is a list of repo names
    setUserProfile(dataurl); // Store the user profile data
  };

  const handleLoginFail = (error) => {
    setErrorMessage(error); // Set the error message to display
    alert(error); // For demonstration, showing an alert. You can replace this with your error handling UI.
  };

  const handleRepoSelect = (selectedOption) => {
    setSelectedRepo(selectedOption ? selectedOption.value : '');
  };

  const handleConfirmSelection = () => {
    if (selectedRepo) {
      onLogin(selectedRepo); // Notify the parent component with the selected repository
      setData({ repo: selectedRepo }); // Set the selected repository data
      setErrorMessage(''); // Clear any previous error message
    } else {
      setErrorMessage('Please select a repository from the list.'); // Set custom error message
    }
  };

  useEffect(() => {
    // Log the updated repoList when it changes
    console.log('Updated repo list:', repoList);
  }, [repoList]);

  // Convert repoList to options for the CustomSelect component
  const repoOptions = repoList.map(repo => ({ value: repo, label: repo }));

  return (
    <div className="login-page">
      <Header /> {/* Include the Header component */}
      <img
        src={userProfile ? userProfile.avatar_url : loginImage}
        alt="Login Background"
        className="login-image"
      />
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      <div className="login-content">
        {!userProfile && (
          <IntegrateGitButton setData={setData} onSuccess={handleLoginSuccess} onFail={handleLoginFail} />
        )}
      </div>
      {repoList.length > 0 && (
        <div className="repo-list">
          <CustomSelect
            options={repoOptions}
            value={repoOptions.find(option => option.value === selectedRepo)}
            onChange={handleRepoSelect}
            placeholder="Select a repository" // Pass the placeholder text here
          />
          <button onClick={handleConfirmSelection}>Confirm Selection</button>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
