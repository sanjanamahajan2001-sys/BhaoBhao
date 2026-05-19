import React, { ReactNode, useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useBooking } from '../contexts/BookingContext';
import axiosInstance from '@/utils/axiosInstance';
import {
  Home,
  User,
  Calendar,
  History,
  Settings,
  LogOut,
  Bell,
  X,
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

interface UpcomingBooking {
  booking: {
    id: number;
    appointment_time_slot: string;
    status: string;
  };
  pet: {
    pet_name: string;
  };
  service: {
    service_name: string;
  };
  address: {
    full_address: string;
  };
}
// Format date to short readable format
export const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, loading, signOut } = useAuth();
  const { resetBooking, setIsRescheduling } = useBooking();
  const navigate = useNavigate();
  const location = useLocation();

  const [showNotification, setShowNotification] = useState(false);
  const [hasShownLoginNotification, setHasShownLoginNotification] =
    useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Refs for detecting outside clicks
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);

  // React Query for fetching upcoming bookings
  const { data: upcomingBookings } = useQuery({
    queryKey: ['upcomingBookings'],
    queryFn: async () => {
      const res = await axiosInstance.get('/bookings/upcoming_bookings');
      return res.data?.data || [];
    },
    enabled: !!user, // Only fetch when user is logged in
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  // Get the next upcoming booking
  const nextBooking = React.useMemo(() => {
    if (!upcomingBookings?.length) return null;

    const now = new Date();
    const upcoming = upcomingBookings
      .filter(
        (b: UpcomingBooking) =>
          new Date(b.booking.appointment_time_slot) > now &&
          b.booking.status !== 'Completed'
      )
      .sort(
        (a: UpcomingBooking, b: UpcomingBooking) =>
          new Date(a.booking.appointment_time_slot).getTime() -
          new Date(b.booking.appointment_time_slot).getTime()
      )[0];

    return upcoming || null;
  }, [upcomingBookings]);

  // Show notification when user logs in and has upcoming bookings
  useEffect(() => {
    if (user && nextBooking && !hasShownLoginNotification) {
      setShowNotification(true);
      setHasShownLoginNotification(true);

      // Auto-hide notification after 10 seconds
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [user, nextBooking, hasShownLoginNotification]);

  // Reset notification state when user logs out
  useEffect(() => {
    if (!user) {
      setHasShownLoginNotification(false);
      setShowNotification(false);
      setShowProfileDropdown(false);
    }
  }, [user]);

  // Handle clicks outside dropdown and notification
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close profile dropdown if clicked outside
      if (
        showProfileDropdown &&
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(event.target as Node)
      ) {
        setShowProfileDropdown(false);
      }

      // Close notification if clicked outside
      if (
        showNotification &&
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node) &&
        notificationButtonRef.current &&
        !notificationButtonRef.current.contains(event.target as Node)
      ) {
        setShowNotification(false);
      }
    };

    // Handle scroll to close notification
    const handleScroll = () => {
      if (showNotification) {
        setShowNotification(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [showProfileDropdown, showNotification]);

  useEffect(() => {
    // Only redirect if we're sure there's no user (after loading is complete)
    // Don't redirect if we're already on auth page
    // Also check if user exists in localStorage as a fallback
    if (!loading) {
      const storedUser = localStorage.getItem('bhaobhao_user');
      if (!user && !storedUser && location.pathname !== '/auth') {
        navigate('/auth');
      }
    }
  }, [user, loading, navigate, location.pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/booking', icon: Calendar, label: 'Book' },
    { path: '/history', icon: History, label: 'History' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a
              href="/"
              onClick={(e) => {
                // Reset booking state when clicking logo to start fresh booking
                resetBooking();
                setIsRescheduling(false);
              }}
              className="flex cursor-pointer items-center space-x-3"
            >
              <img
                src="/auth/logo-simple.png"
                alt="Bhao Bhao"
                className="h-8 w-auto rounded-lg"
                onError={(e) => {
                  // Fallback to root path if /auth/ path doesn't work
                  const img = e.target as HTMLImageElement;
                  if (img.src.includes('/auth/')) {
                    img.src = '/logo-simple.png';
                  }
                }}
              />
              {/* <div className="max-sm:hidden">
                <h1 className="text-xl font-bold text-gray-900">Bhao Bhao</h1>
                <p className="text-sm text-gray-500">Premium Pet Care</p>
              </div> */}
            </a>

            <div className="flex items-center space-x-4">
              {/* Notification Bell */}
              <div className="relative">
                <button
                  ref={notificationButtonRef}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
                  onClick={() => setShowNotification(!showNotification)}
                >
                  <Bell className="h-6 w-6 text-gray-700" />
                  {nextBooking && (
                    <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                  )}
                </button>
                {/* Floating Notification */}
               {showNotification && (
  nextBooking ? (
    <div className="absolute right-0 mt-3 z-[100] max-w-lg w-max">
      <div
        ref={notificationRef}
        className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 transform transition-all duration-300 ease-in-out animate-slide-in-from-top"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Bell className="h-6 w-6 text-teal-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                Upcoming Appointment
              </p>
              <p className="text-sm text-teal-600 font-semibold mt-2">
                {nextBooking?.service?.service_name}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Pet: {nextBooking?.pet?.pet_name}
              </p>
              <p className="text-xs text-gray-600">
                {formatDateTime(nextBooking?.booking?.appointment_time_slot)}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowNotification(false)}
            className="flex-shrink-0 ml-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        <div className="mt-3 flex space-x-4 w-full">
          <button
            onClick={() => {
              navigate('/history');
              setShowNotification(false);
            }}
            className="text-xs bg-teal-600 w-full text-white px-3 py-1 rounded-md hover:bg-teal-700 transition-colors"
          >
            View Details
          </button>

          <button
            onClick={() => setShowNotification(false)}
            className="text-xs bg-gray-100 w-full text-gray-700 px-3 py-1 rounded-md hover:bg-gray-200 transition-colors"
          >
            Dismiss
          </button>
        </div>

      </div>
    </div>
  ) : (
    <div className="absolute right-0 mt-3 z-[100] bg-white border border-gray-200 shadow-md rounded-md px-4 py-2 text-sm text-gray-600">
      No Notifications
    </div>
  )
)}

              </div>

              {/* User Profile */}
              <div className="relative">
                <button
                  ref={profileButtonRef}
                  className="flex items-center space-x-3 p-1 rounded-full hover:bg-teal-50 transition-colors"
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                >
                  {user?.profile_image ? (
                    <img
                      src={user?.profile_image}
                      alt={user?.full_name}
                      className="w-8 h-8 rounded-full object-cover shadow-sm"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center hover:bg-yellow-400 transition-colors">
                      <span className="text-white text-sm font-semibold">
                        {user.full_name?.charAt(0).toUpperCase() ||
                          user?.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </button>

                {/* Dropdown */}
                {showProfileDropdown && (
                  <div
                    ref={profileDropdownRef}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 animate-slide-in-from-top overflow-hidden"
                  >
                    <div className="py-1">
                      <button
                        onClick={() => {
                          navigate('/profile');
                          setShowProfileDropdown(false);
                        }}
                        className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors text-left"
                      >
                        <Settings className="h-4 w-4 mr-3 flex-shrink-0" />
                        <span>Edit Profile</span>
                      </button>
                      <button
                        onClick={() => {
                          // Reset booking state before navigating
                          resetBooking();
                          setIsRescheduling(false);
                          navigate('/booking');
                          setShowProfileDropdown(false);
                        }}
                        className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors text-left"
                      >
                        <Calendar className="h-4 w-4 mr-3 flex-shrink-0" />
                        <span>Add New Booking</span>
                      </button>
                      <button
                        onClick={() => {
                          navigate('/history');
                          setShowProfileDropdown(false);
                        }}
                        className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors text-left"
                      >
                        <History className="h-4 w-4 mr-3 flex-shrink-0" />
                        <span>Booking History</span>
                      </button>
                      <div className="border-t border-gray-200 my-1"></div>
                      <button
                        onClick={signOut}
                        className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut className="h-4 w-4 mr-3 flex-shrink-0" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="animate-fadeIn">{children}</div>
      </main>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 sm:hidden z-50">
        <div className="grid grid-cols-4 gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  // Close any open dropdowns when navigating
                  setShowProfileDropdown(false);
                  setShowNotification(false);
                }}
                className={`flex flex-col items-center py-3 px-2 text-xs transition-colors ${
                  isActive
                    ? 'text-teal-600 bg-teal-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <item.icon
                  className={`h-5 w-5 mb-1 ${isActive ? 'text-teal-600' : ''}`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-20 sm:hidden"></div>

      <style>{`
        @keyframes slide-in-from-top {
          0% {
            transform: translateY(-100%) translateX(0);
            opacity: 0;
          }
          100% {
            transform: translateY(0) translateX(0);
            opacity: 1;
          }
        }

        @keyframes fade-in-down {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-in-from-top {
          animation: slide-in-from-top 0.3s ease-out;
        }

        .animate-fade-in-down {
          animation: fade-in-down 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Layout;

