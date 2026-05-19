export const checkTokenExpiry = () => {
  const expiry = sessionStorage.getItem('tokenExpiry');
  if (expiry && Date.now() > parseInt(expiry, 10)) {
    // Token expired
    // localStorage.removeItem('adminToken');
    // localStorage.removeItem('tokenExpiry');
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('tokenExpiry');
    return true; // expired
  }
  return false;
};
