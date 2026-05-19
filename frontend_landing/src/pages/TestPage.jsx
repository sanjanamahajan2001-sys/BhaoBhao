// Test page to verify localStorage sharing
import React, { useState, useEffect } from 'react';

const TestPage = () => {
  const [token, setToken] = useState('');
  const [userInfo, setUserInfo] = useState('');
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    // Read from localStorage
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('bhaobhao_user');
    
    setToken(storedToken || 'No token found');
    setUserInfo(storedUser || 'No user info found');
    
    if (storedToken && storedUser) {
      setTestMessage('✅ SUCCESS: Token and user info found in localStorage!');
    } else {
      setTestMessage('❌ No token or user info found. Please login in the app first.');
    }
  }, []);

  const handleSetTestData = () => {
    // Set test data
    localStorage.setItem('token', 'test-token-12345');
    localStorage.setItem('bhaobhao_user', JSON.stringify({ email: 'test@example.com', full_name: 'Test User' }));
    setToken('test-token-12345');
    setUserInfo(JSON.stringify({ email: 'test@example.com', full_name: 'Test User' }));
    setTestMessage('✅ Test data set! Check the app to see if it can read this.');
  };

  const handleClearData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('bhaobhao_user');
    setToken('No token found');
    setUserInfo('No user info found');
    setTestMessage('✅ Data cleared!');
  };

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '800px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#C4A77D', marginBottom: '1rem' }}>Landing Page - localStorage Test</h1>
      
      <div style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '1.5rem', 
        borderRadius: '8px',
        marginBottom: '1rem'
      }}>
        <h2 style={{ marginTop: 0 }}>Current localStorage Status:</h2>
        <p><strong>Token:</strong> {token.substring(0, 50)}...</p>
        <p><strong>User Info:</strong> {userInfo.substring(0, 100)}...</p>
        <p style={{ 
          padding: '1rem', 
          backgroundColor: token ? '#d4edda' : '#f8d7da',
          borderRadius: '4px',
          marginTop: '1rem'
        }}>
          <strong>{testMessage}</strong>
        </p>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3>Test Actions:</h3>
        <button 
          onClick={handleSetTestData}
          style={{
            padding: '10px 20px',
            backgroundColor: '#C4A77D',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px',
            marginBottom: '10px'
          }}
        >
          Set Test Data
        </button>
        <button 
          onClick={handleClearData}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '10px'
          }}
        >
          Clear Data
        </button>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#e7f3ff', borderRadius: '4px' }}>
        <h3>Instructions:</h3>
        <ol>
          <li>Open the app at <code>http://localhost:2000/auth/</code> (or test page at <code>http://localhost:2000/auth/test</code>)</li>
          <li>Login to set token in localStorage</li>
          <li>Come back to this page and refresh</li>
          <li>You should see the token and user info here!</li>
        </ol>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <a 
          href="http://localhost:2000/auth/" 
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            display: 'inline-block',
            marginRight: '10px'
          }}
        >
          Go to App →
        </a>
        <a 
          href="http://localhost:2000/auth/test" 
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            display: 'inline-block'
          }}
        >
          Go to App Test Page →
        </a>
      </div>
    </div>
  );
};

export default TestPage;

