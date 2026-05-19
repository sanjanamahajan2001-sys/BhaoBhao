// Auth utility for landing page
// Checks localStorage for token and user info (shared with main app)

const authExpiryKey = 'auth_expires_at'; // NOTE: 15-min local session expiry.

const isAuthExpired = () => {
  if (typeof window === 'undefined') return true;
  const expiresAt = localStorage.getItem(authExpiryKey);
  return !!expiresAt && Date.now() > Number(expiresAt);
};

export const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  if (isAuthExpired()) {
    // NOTE: Expired session - clear localStorage.
    localStorage.removeItem('token');
    localStorage.removeItem('bhaobhao_user');
    localStorage.removeItem(authExpiryKey);
    return null;
  }
  return localStorage.getItem('token');
};

export const getUserInfo = () => {
  if (typeof window === 'undefined') return null;
  if (isAuthExpired()) {
    // NOTE: Expired session - clear localStorage.
    localStorage.removeItem('token');
    localStorage.removeItem('bhaobhao_user');
    localStorage.removeItem(authExpiryKey);
    return null;
  }
  const userStr = localStorage.getItem('bhaobhao_user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (e) {
    console.error('Error parsing user info:', e);
    return null;
  }
};

export const isAuthenticated = () => {
  const token = getAuthToken();
  const user = getUserInfo();
  return !!(token && user);
};

export const logout = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('bhaobhao_user');
  localStorage.removeItem('demo_bookings');
  localStorage.removeItem(authExpiryKey); // NOTE: Clear local session expiry.
  // Reload to show logged-out state
  window.location.reload();
};
