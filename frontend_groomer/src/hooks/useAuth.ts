import { useState, useEffect } from 'react';
import { Groomer } from '../types';

export const useAuth = () => {
  const [groomer, setGroomer] = useState<Groomer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    // const token = localStorage.getItem('groomer_token');
    // const groomerInfo = localStorage.getItem('groomer_info');
    const token = sessionStorage.getItem('groomer_token');
    const groomerInfo = sessionStorage.getItem('groomer_info');

    if (token && groomerInfo) {
      try {
        const parsedGroomer = JSON.parse(groomerInfo);
        setGroomer(parsedGroomer);
      } catch (error) {
        console.error('Error parsing groomer info:', error);
        // localStorage.removeItem('groomer_token');
        // localStorage.removeItem('groomer_info');
        sessionStorage.removeItem('groomer_token');
        sessionStorage.removeItem('groomer_info');
      }
    }

    setIsLoading(false);
  }, []);

  const login = (groomerData: Groomer, token: string) => {
    console.log('Login function called with:', groomerData);
    // localStorage.setItem('groomer_token', token);
    // localStorage.setItem('groomer_info', JSON.stringify(groomerData));
    sessionStorage.setItem('groomer_token', token);
    sessionStorage.setItem('groomer_info', JSON.stringify(groomerData));
    setGroomer(groomerData);
  };

  const logout = () => {
    console.log('Logout function called');
    // localStorage.removeItem('groomer_token');
    // localStorage.removeItem('groomer_info');
    sessionStorage.removeItem('groomer_token');
    sessionStorage.removeItem('groomer_info');
    setGroomer(null);
  };

  const isAuthenticated = !!groomer;

  return {
    groomer,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
};
