import React, { useState, useEffect } from 'react';
import { getAuthToken, isAuthenticated } from '../utils/auth';

const HeroSection = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasOngoingBooking, setHasOngoingBooking] = useState(false); // NOTE: Track ongoing booking for CTA text.
  const [hasDraftBooking, setHasDraftBooking] = useState(false); // NOTE: Track in-progress booking for CTA text.

  // Helper function to get app URL (uses relative path for production)
  const getAppUrl = (path = '') => {
    return `/auth${path}`;
  };

  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(isAuthenticated());
    };

    const checkDraftBooking = () => {
      if (typeof window === 'undefined') return;
      const draft = localStorage.getItem('booking_draft');
      setHasDraftBooking(!!draft); // NOTE: Draft booking controls resume CTA.
    };

    const checkOngoingBooking = async () => {
      const token = getAuthToken();
      if (!token) {
        setHasOngoingBooking(false);
        return;
      }

      try {
        const apiKey = import.meta.env.VITE_API_KEY; // NOTE: Required by backend API key middleware.
        // NOTE: Use /api to match nginx proxy in production.
        const response = await fetch('/api/bookings/upcoming_bookings', {
          headers: {
            Authorization: `Bearer ${token}`,
            'x-api-key': apiKey ?? '',
          },
        });
        if (!response.ok) {
          setHasOngoingBooking(false);
          return;
        }
        const data = await response.json();
        const hasBookings =
          (Array.isArray(data?.data) && data.data.length > 0) ||
          (typeof data?.count === 'number' && data.count > 0);
        setHasOngoingBooking(hasBookings);
      } catch (error) {
        console.error('Failed to check bookings:', error);
        setHasOngoingBooking(false);
      }
    };

    checkAuth();
    checkDraftBooking();
    checkOngoingBooking();

    // Listen for storage changes
    const handleStorageChange = () => {
      checkAuth();
      checkDraftBooking();
      checkOngoingBooking();
    };

    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(() => {
      checkAuth();
      checkDraftBooking();
      checkOngoingBooking();
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);
  return (
    <section className="hero-section">
      {/* Paw Decorations */}
      <svg className="paw-decoration paw-1" viewBox="0 0 100 100" fill="#C4A77D">
        <ellipse cx="50" cy="65" rx="25" ry="20" />
        <circle cx="25" cy="35" r="12" />
        <circle cx="50" cy="25" r="12" />
        <circle cx="75" cy="35" r="12" />
        <circle cx="35" cy="50" r="10" />
        <circle cx="65" cy="50" r="10" />
      </svg>
      <svg className="paw-decoration paw-2" viewBox="0 0 100 100" fill="#C4A77D">
        <ellipse cx="50" cy="65" rx="25" ry="20" />
        <circle cx="25" cy="35" r="12" />
        <circle cx="50" cy="25" r="12" />
        <circle cx="75" cy="35" r="12" />
        <circle cx="35" cy="50" r="10" />
        <circle cx="65" cy="50" r="10" />
      </svg>

      <div className="container" style={{ position: 'relative', top: '50px' }}>
        <div className="row align-items-center">
          <div className="col-lg-6">
            <div className="top-badge">
              India's top rated pet grooming service
            </div>

            <h1 className="hero-title">In-home pet grooming experts you can trust</h1>

            <p className="hero-subtitle">Step into a world where every grooming experience makes pets look and feel
              their absolute best.</p>

            <div className="hero-buttons">
              {isLoggedIn ? (
                <a
                  href={getAppUrl(
                    hasDraftBooking ? '/booking' : hasOngoingBooking ? '/history' : '/booking'
                  )}
                  className="btn-primary-custom"
                >
                  {hasDraftBooking || hasOngoingBooking
                    ? 'View booking'
                    : 'Book a grooming service'}
                </a>
              ) : (
                <a href={getAppUrl('/')} className="btn-primary-custom">
                  Book a grooming service
                </a>
              )}
            </div>

            <div className="trusted-section">
              <div className="customer-avatars">
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face"
                  alt="Customer" />
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
                  alt="Customer" />
                <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face"
                  alt="Customer" />
                <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop&crop=face"
                  alt="Customer" />
              </div>
              <p className="trusted-text"><strong>Trusted by 3000+ customers</strong></p>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="hero-image-container">
              <img src="./women_with_cat.png" alt="Pet Grooming Expert" className="hero-main-image"
                style={{ borderRadius: '30px' }} />
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="stats-section">
          <div className="stat-item">
            <div className="stat-icon heart">
              <img src="./img3.png" alt="" />
            </div>
            <div className="stat-content">
              <h4>3000+</h4>
              <p>Happy Pets</p>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon check">
              <img src="./img4.png" alt="" />
            </div>
            <div className="stat-content">
              <h4>50+</h4>
              <p>Expert Groomers</p>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon star">
              <img src="./img5.png" alt="" />
            </div>
            <div className="stat-content">
              <h4>4.9</h4>
              <p>Average Rating</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
