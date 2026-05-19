import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { store } from './store';

import { AuthProvider } from './contexts/AuthContext';
import { BookingProvider } from './contexts/BookingContext';

import Layout from './components/Layout';
import MinimalLayout from './components/MinimalLayout';

import Auth from './pages/Auth';
import Profile from './pages/Profile';
import Booking from './pages/Booking';
import BookingHistory from './pages/BookingHistory';
import CompleteProfile from './pages/CompleteProfile';
import TestPage from './pages/TestPage';

import './App.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BookingProvider>
            {/* IMPORTANT: ensures /auth/... refresh works */}
            <Router basename="/auth">
              <div className="App">
                <Routes>
                  {/* LOGIN */}
                  <Route path="/" element={<Auth />} />

                  {/* COMPLETE PROFILE */}
                  <Route
                    path="/complete-profile"
                    element={
                      <MinimalLayout>
                        <CompleteProfile />
                      </MinimalLayout>
                    }
                  />

                  {/* PROFILE */}
                  <Route
                    path="/profile"
                    element={
                      <Layout>
                        <Profile />
                      </Layout>
                    }
                  />

                  {/* BOOKING */}
                  <Route
                    path="/booking"
                    element={
                      <Layout>
                        <Booking />
                      </Layout>
                    }
                  />

                  {/* BOOKING HISTORY */}
                  <Route
                    path="/history"
                    element={
                      <Layout>
                        <BookingHistory />
                      </Layout>
                    }
                  />

                  {/* TEST PAGE */}
                  <Route
                    path="/test"
                    element={<TestPage />}
                  />
                </Routes>
              </div>
            </Router>
          </BookingProvider>
        </AuthProvider>

        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </Provider>
  );
}

export default App;

