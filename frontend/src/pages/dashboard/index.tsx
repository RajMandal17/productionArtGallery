import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ProtectedRoute from '../../components/common/ProtectedRoute';

// Lazy load dashboard components
const AdminDashboard = React.lazy(() => import('./admin'));
const ArtistDashboard = React.lazy(() => import('./artist'));
const CustomerDashboard = React.lazy(() => import('./customer'));

// Lazy load customer pages
const BrowseArtworks = React.lazy(() => import('./customer/BrowseArtworks'));
const CustomerProfile = React.lazy(() => import('./customer/CustomerProfile'));
const OrderHistory = React.lazy(() => import('./customer/OrderHistory'));
const OrderDetails = React.lazy(() => import('./customer/OrderDetails'));
const WishlistItems = React.lazy(() => import('./customer/WishlistItems'));

// Lazy load artist pages
const ArtistProfile = React.lazy(() => import('./artist/ArtistProfile'));
const ArtworkList = React.lazy(() => import('./artist/ArtworkList'));
const CreateArtwork = React.lazy(() => import('./artist/CreateArtwork'));
const EditArtwork = React.lazy(() => import('./artist/EditArtwork'));
const ArtistOrders = React.lazy(() => import('./artist/ArtistOrders'));
const ArtistReviews = React.lazy(() => import('./artist/ArtistReviews'));

// Lazy load admin pages
const AdminUsers = React.lazy(() => import('./admin/AdminUsers'));
const AdminArtworks = React.lazy(() => import('./admin/AdminArtworks'));
const AdminOrders = React.lazy(() => import('./admin/AdminOrders'));
const AdminAnalytics = React.lazy(() => import('./admin/AdminAnalytics'));
const AdminSettings = React.lazy(() => import('./admin/AdminSettings'));

const Dashboard = () => {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen"><LoadingSpinner size="large" /></div>}>
      <Routes>
        {/* Root dashboard redirects based on role */}
        <Route path="/" element={<Navigate to="/dashboard/customer" replace />} />
        
        {/* Admin routes */}
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Artist routes */}
        <Route 
          path="/artist/*" 
          element={
            <ProtectedRoute requiredRole="ARTIST">
              <ArtistDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Customer routes */}
        <Route 
          path="/customer/*" 
          element={
            <ProtectedRoute requiredRole="CUSTOMER">
              <CustomerDashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Suspense>
  );
};

export default Dashboard;
