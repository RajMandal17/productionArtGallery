import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AppProvider } from './context/AppContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleBasedRedirect from './components/common/RoleBasedRedirect';
import ProfileRedirect from './components/common/ProfileRedirect';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';

// Temporary debug import
import './utils/debugLocalStorage';

// Pages - Eagerly loaded
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Pages - Lazily loaded
const CartPage = lazy(() => import('./pages/CartPage'));
const ArtistsPage = lazy(() => import('./pages/ArtistsPage'));
const ArtistDetailPage = lazy(() => import('./pages/ArtistDetailPage'));

// Dashboard - Lazily loaded
const ArtistDashboard = lazy(() => import('./pages/dashboard/artist'));
const CustomerDashboard = lazy(() => import('./pages/dashboard/customer'));
const AuthDebugger = lazy(() => import('./components/debug/AuthDebugger'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex justify-center items-center h-[50vh]">
    <LoadingSpinner size="lg" />
  </div>
);

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header />
          <main className="flex-1">
            <ErrorBoundary>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  {/* Public Routes with Role-based Redirect for authenticated users */}
                  <Route path="/" element={<RoleBasedRedirect><HomePage /></RoleBasedRedirect>} />
                  <Route path="/login" element={<RoleBasedRedirect><LoginPage /></RoleBasedRedirect>} />
                  <Route path="/register" element={<RegisterPage />} />
                  
                  {/* Protected Routes - Customer - Lazy loaded */}
                  <Route 
                    path="/dashboard/customer/*" 
                    element={
                      <ProtectedRoute roles={['CUSTOMER']}>
                        <CustomerDashboard />
                      </ProtectedRoute>
                    } 
                  />

                  {/* Dedicated Profile Route - redirects to the customer profile page */}
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute roles={['CUSTOMER']}>
                        <ProfileRedirect />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Protected Routes - Artist - Lazy loaded */}
                  <Route 
                    path="/dashboard/artist/*" 
                    element={
                      <ProtectedRoute roles={['ARTIST']}>
                        <ArtistDashboard />
                      </ProtectedRoute>
                    } 
                  />
                
                {/* Protected Routes - Admin */}
                <Route 
                  path="/dashboard/admin" 
                  element={
                    <ProtectedRoute roles={['ADMIN']}>
                      <div className="min-h-screen flex items-center justify-center">
                        <div className="text-center">
                          <h1 className="text-4xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
                          <p className="text-gray-600">Welcome to your admin dashboard!</p>
                        </div>
                      </div>
                    </ProtectedRoute>
                  } 
                />

                {/* Fallback Routes */}
                <Route 
                  path="/artworks" 
                  element={
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Browse Artworks</h1>
                        <p className="text-gray-600">Artwork listing page coming soon!</p>
                      </div>
                    </div>
                  } 
                />
                
                <Route 
                  path="/artists" 
                  element={<ArtistsPage />} 
                />
                
                <Route 
                  path="/artists/:id" 
                  element={<ArtistDetailPage />} 
                />
                
                {/* Protected Cart Route - Customers only */}
                <Route 
                  path="/cart" 
                  element={
                    <ProtectedRoute roles={['CUSTOMER']}>
                      <CartPage />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Fallback route for 404 */}
                <Route 
                  path="*" 
                  element={
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">404: Not Found</h1>
                        <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
                        <p className="text-sm text-gray-500 mb-4">
                          Current URL: {window.location.pathname}
                        </p>
                        <div className="space-y-2 mb-4">
                          <a href="/" className="block text-blue-600 hover:text-blue-800">Go back home</a>
                          <button 
                            onClick={() => window.location.reload()} 
                            className="block w-full text-gray-600 hover:text-gray-800"
                          >
                            Reload page
                          </button>
                        </div>
                        {/* Debug info */}
                        <div className="text-xs text-gray-400 bg-gray-100 p-2 rounded">
                          Debug: Check browser console for details
                        </div>
                      </div>
                      {/* Debug info */}
                      {(() => {
                        console.log('404 Route Triggered - Current path:', window.location.pathname);
                        console.log('404 Route Triggered - Current URL:', window.location.href);
                        console.log('404 Route Triggered - Auth state:', {
                          token: localStorage.getItem('access_token') ? 'exists' : 'missing',
                          user: localStorage.getItem('user_data') ? 'exists' : 'missing'
                        });
                        return null;
                      })()}
                    </div>
                  } 
                />
              </Routes>
              </Suspense>
            </ErrorBoundary>
          </main>
          <Footer />
        </div>
        
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        
        {/* Auth Debugger Tool - Only for development */}
        <AuthDebugger />
      </Router>
    </AppProvider>
  );
}

export default App;
