import React, { useState, useEffect } from 'react';
import { isAuthenticated, getUserInfo, logout } from '../utils/auth';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  // Helper function to get app URL (uses relative path for production)
  const getAppUrl = (path = '') => {
    const baseUrl = import.meta.env.VITE_CUSTOMER_PORTAL_URL || "https://bhaobhao-customer.vercel.app";
    const finalPath = path === '/' ? '/auth' : path;
    return `${baseUrl}${finalPath}`;
  };

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      setIsLoggedIn(authenticated);
      if (authenticated) {
        setUserInfo(getUserInfo());
      }
    };
    
    checkAuth();
    
    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = () => {
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically in case of same-tab navigation
    const interval = setInterval(checkAuth, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const navbar = document.querySelector('.navbar');
    const scrollThreshold = 100;
  
    const handleScroll = () => {
      let currentScroll = window.pageYOffset || document.documentElement.scrollTop;
  
      if (currentScroll <= scrollThreshold) {
        // Show navbar at top of page
        navbar.style.transform = 'translateX(-50%) translateY(0)';
        navbar.style.opacity = '1';
      } else {
        // User has scrolled down past threshold → permanently hide
        navbar.style.transform = 'translateX(-50%) translateY(-120px)';
        navbar.style.opacity = '0';
      }
    };
  
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  

  const handleToggle = () => {
    setIsOpen(!isOpen);
    const navToggle = document.getElementById('navToggle');
    const navMobile = document.getElementById('navMobile');
    navToggle.classList.toggle('active');
    navMobile.classList.toggle('active');
  };

  const handleLinkClick = () => {
    setIsOpen(false);
    const navToggle = document.getElementById('navToggle');
    const navMobile = document.getElementById('navMobile');
    navToggle.classList.remove('active');
    navMobile.classList.remove('active');
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo - LEFT */}
        <a href="#" className="nav-logo">
          <img src="./new-logo2.jpg" alt="Bhao Bhao" />
        </a>

        {/* Right Side - Menu + Contact together */}
        <div className="nav-right">
          {isLoggedIn ? (
            // Logged-in state: Show menu with "My Bookings" + user info and logout
            <>
              <ul className="nav-menu">
                <li><a href="#services" className="nav-link">Services</a></li>
                <li><a href={getAppUrl('/history')} className="nav-link">My Bookings</a></li>
                <li><a href="#testimonials" className="nav-link">Happy Parents</a></li>
                <li><a href="#about" className="nav-link">About</a></li>
              </ul>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {userInfo?.profile_image ? (
                    <img 
                      src={userInfo.profile_image} 
                      alt={userInfo.full_name || userInfo.email} 
                      style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #C4A77D' }}
                    />
                  ) : (
                    <div style={{ 
                      width: '36px', 
                      height: '36px', 
                      borderRadius: '50%', 
                      backgroundColor: '#C4A77D',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '16px'
                    }}>
                      {(userInfo?.full_name || userInfo?.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  style={{ 
                    padding: '10px 20px', 
                    backgroundColor: 'transparent', 
                    color: 'white', 
                    border: 'none',
                    borderRadius: '25px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            // Logged-out state: Show normal menu
            <>
              <ul className="nav-menu">
                <li><a href="#services" className="nav-link">Services</a></li>
                <li><a href="#testimonials" className="nav-link">Happy Parents</a></li>
                <li><a href="#about" className="nav-link">About</a></li>
              </ul>

              <a href="#contact" className="nav-contact">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path
                    d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z">
                  </path>
                </svg>
                Contact
              </a>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button className="nav-toggle" id="navToggle" onClick={handleToggle}>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className="nav-mobile" id="navMobile">
        <ul className="nav-mobile-menu">
          {isLoggedIn ? (
            <>
              <li style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {userInfo?.profile_image ? (
                    <img 
                      src={userInfo.profile_image} 
                      alt={userInfo.full_name || userInfo.email} 
                      style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #C4A77D' }}
                    />
                  ) : (
                    <div style={{ 
                      width: '36px', 
                      height: '36px', 
                      borderRadius: '50%', 
                      backgroundColor: '#C4A77D',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '16px'
                    }}>
                      {(userInfo?.full_name || userInfo?.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span style={{ color: 'white', fontSize: '15px', fontWeight: '500' }}>
                    {userInfo?.full_name || userInfo?.email || 'User'}
                  </span>
                </div>
              </li>
              <li><a href="#services" className="nav-mobile-link" onClick={handleLinkClick}>Services</a></li>
              <li><a href={getAppUrl('/history')} className="nav-mobile-link" onClick={handleLinkClick}>My Bookings</a></li>
              <li><a href="#testimonials" className="nav-mobile-link" onClick={handleLinkClick}>Happy Parents</a></li>
              <li><a href="#about" className="nav-mobile-link" onClick={handleLinkClick}>About</a></li>
              <li>
                <a href="#contact" className="nav-mobile-contact" onClick={handleLinkClick}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                    strokeLinejoin="round">
                    <path
                      d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z">
                    </path>
                  </svg>
                  Contact
                </a>
              </li>
              <li style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '15px', paddingTop: '15px' }}>
                <button
                  onClick={() => { handleLogout(); handleLinkClick(); }}
                  style={{ 
                    width: '100%',
                    padding: '12px 20px',
                    backgroundColor: 'transparent',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '25px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li><a href="#services" className="nav-mobile-link" onClick={handleLinkClick}>Services</a></li>
              <li><a href="#testimonials" className="nav-mobile-link" onClick={handleLinkClick}>Happy Parents</a></li>
              <li><a href="#about" className="nav-mobile-link" onClick={handleLinkClick}>About</a></li>
              <li>
                <a href="#contact" className="nav-mobile-contact" onClick={handleLinkClick}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                    strokeLinejoin="round">
                    <path
                      d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z">
                    </path>
                  </svg>
                  Contact
                </a>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;

