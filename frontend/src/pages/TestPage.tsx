// Test page in app to verify localStorage sharing
import React, { useState, useEffect } from 'react';

const TestPage: React.FC = () => {
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
      setTestMessage('❌ No token or user info found. Please login first.');
    }
  }, []);

  const handleSetTestData = () => {
    // Set test data
    try {
      localStorage.setItem('token', 'test-token-12345');
      localStorage.setItem('bhaobhao_user', JSON.stringify({ email: 'test@example.com', full_name: 'Test User' }));
      
      // Verify it was set
      const verifyToken = localStorage.getItem('token');
      const verifyUser = localStorage.getItem('bhaobhao_user');
      
      if (verifyToken && verifyUser) {
        setToken(verifyToken);
        setUserInfo(verifyUser);
        setTestMessage('✅ Test data set! Check DevTools → Application → Local Storage to verify. Then check the landing page.');
      } else {
        setTestMessage('❌ Error: Data was not saved to localStorage. Check browser console for errors.');
      }
    } catch (error) {
      console.error('Error setting localStorage:', error);
      setTestMessage(`❌ Error: ${error.message}. Check if localStorage is enabled.`);
    }
  };

  const handleRefresh = () => {
    // Re-read from localStorage
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('bhaobhao_user');
    
    setToken(storedToken || 'No token found');
    setUserInfo(storedUser || 'No user info found');
    
    if (storedToken && storedUser) {
      setTestMessage('✅ SUCCESS: Token and user info found in localStorage!');
    } else {
      setTestMessage('❌ No token or user info found. Please login or set test data first.');
    }
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
      <h1 style={{ color: '#0d9488', marginBottom: '1rem' }}>App - localStorage Test</h1>
      
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
            backgroundColor: '#0d9488',
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
          onClick={handleRefresh}
          style={{
            padding: '10px 20px',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px',
            marginBottom: '10px'
          }}
        >
          Refresh from localStorage
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
      
      <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fff3cd', borderRadius: '4px', border: '1px solid #ffc107' }}>
        <strong>💡 Tip:</strong> After setting test data, open DevTools → Application → Local Storage → <code>http://localhost:2000</code> to verify the data is actually stored.
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#e7f3ff', borderRadius: '4px' }}>
        <h3>Instructions:</h3>
        <ol>
          <li>Login in the app to set token in localStorage</li>
          <li>Open the landing page at <code>http://localhost:3000/</code></li>
          <li>Or go to test page: <code>http://localhost:3000/test</code></li>
          <li>You should see the token and user info there!</li>
        </ol>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <a 
          href="http://localhost:3000/" 
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
          Go to Landing Page →
        </a>
        <a 
          href="http://localhost:3000/test" 
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            display: 'inline-block'
          }}
        >
          Go to Landing Test Page →
        </a>
      </div>
    </div>
  );
};

export default TestPage;

