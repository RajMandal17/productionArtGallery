import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, Database, ShoppingBag, LayoutDashboard, 
  LogOut, Image, BarChart2, Settings
} from 'lucide-react';

import { useAppContext } from '../../../context/AppContext';

import AdminUsers from './AdminUsers';
import AdminArtworks from './AdminArtworks';
import AdminOrders from './AdminOrders';
import AdminAnalytics from './AdminAnalytics';
import AdminSettings from './AdminSettings';

const AdminDashboard: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 bg-white rounded-lg shadow-md p-4">
            <div className="flex flex-col items-center pb-5 mb-5 border-b">
              <div className="h-20 w-20 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                {state.auth.user?.profileImage ? (
                  <img 
                    src={state.auth.user.profileImage} 
                    alt="Profile" 
                    className="h-full w-full rounded-full object-cover" 
                  />
                ) : (
                  <Settings size={36} className="text-purple-600" />
                )}
              </div>
              <h3 className="text-lg font-semibold">
                {state.auth.user?.firstName} {state.auth.user?.lastName}
              </h3>
              <span className="text-sm text-gray-500">Administrator</span>
            </div>
            
            <nav className="space-y-1">
              <Link 
                to="/dashboard/admin" 
                className={`flex items-center px-4 py-2 rounded-md ${
                  location.pathname === '/dashboard/admin' 
                    ? 'bg-purple-50 text-purple-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <LayoutDashboard className="mr-3 h-5 w-5" />
                Dashboard
              </Link>
              
              <Link 
                to="/dashboard/admin/users" 
                className={`flex items-center px-4 py-2 rounded-md ${
                  location.pathname === '/dashboard/admin/users' 
                    ? 'bg-purple-50 text-purple-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Users className="mr-3 h-5 w-5" />
                Manage Users
              </Link>
              
              <Link 
                to="/dashboard/admin/artworks" 
                className={`flex items-center px-4 py-2 rounded-md ${
                  location.pathname === '/dashboard/admin/artworks' 
                    ? 'bg-purple-50 text-purple-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Image className="mr-3 h-5 w-5" />
                Manage Artworks
              </Link>
              
              <Link 
                to="/dashboard/admin/orders" 
                className={`flex items-center px-4 py-2 rounded-md ${
                  location.pathname === '/dashboard/admin/orders' || location.pathname.includes('/dashboard/admin/orders/')
                    ? 'bg-purple-50 text-purple-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ShoppingBag className="mr-3 h-5 w-5" />
                Manage Orders
              </Link>
              
              <Link 
                to="/dashboard/admin/analytics" 
                className={`flex items-center px-4 py-2 rounded-md ${
                  location.pathname === '/dashboard/admin/analytics' 
                    ? 'bg-purple-50 text-purple-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <BarChart2 className="mr-3 h-5 w-5" />
                Analytics
              </Link>
              
              <Link 
                to="/dashboard/admin/settings" 
                className={`flex items-center px-4 py-2 rounded-md ${
                  location.pathname === '/dashboard/admin/settings' 
                    ? 'bg-purple-50 text-purple-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Settings className="mr-3 h-5 w-5" />
                Settings
              </Link>
              
              <button 
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-2 mt-4 text-red-600 rounded-md hover:bg-red-50"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Logout
              </button>
            </nav>
          </div>
          
          {/* Main Content */}
          <div className="flex-1 bg-white rounded-lg shadow-md p-6">
            <Routes>
              <Route index element={<AdminDashboardHome />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="artworks" element={<AdminArtworks />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="settings" element={<AdminSettings />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

// Dashboard Home Component
const AdminDashboardHome: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Admin Dashboard</h1>
      
      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-purple-50 border border-purple-100 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <h3 className="text-xl font-bold">Loading...</h3>
            </div>
            <div className="bg-purple-100 p-2 rounded-full">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Total Artworks</p>
              <h3 className="text-xl font-bold">Loading...</h3>
            </div>
            <div className="bg-indigo-100 p-2 rounded-full">
              <Image className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <h3 className="text-xl font-bold">Loading...</h3>
            </div>
            <div className="bg-amber-100 p-2 rounded-full">
              <ShoppingBag className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick actions */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => navigate('/dashboard/admin/users')}
            className="flex items-center p-4 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="bg-purple-100 p-2 rounded-full mr-3">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-left">
              <h3 className="font-medium">Manage Users</h3>
              <p className="text-sm text-gray-500">View and edit user accounts</p>
            </div>
          </button>
          
          <button 
            onClick={() => navigate('/dashboard/admin/artworks')}
            className="flex items-center p-4 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="bg-indigo-100 p-2 rounded-full mr-3">
              <Image className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="text-left">
              <h3 className="font-medium">Manage Artworks</h3>
              <p className="text-sm text-gray-500">Review and manage listings</p>
            </div>
          </button>
          
          <button 
            onClick={() => navigate('/dashboard/admin/orders')}
            className="flex items-center p-4 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="bg-amber-100 p-2 rounded-full mr-3">
              <ShoppingBag className="h-5 w-5 text-amber-600" />
            </div>
            <div className="text-left">
              <h3 className="font-medium">Manage Orders</h3>
              <p className="text-sm text-gray-500">Process customer orders</p>
            </div>
          </button>
        </div>
      </div>
      
      {/* Recent activity */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b">
            <h3 className="font-medium">System Updates</h3>
          </div>
          <div className="p-4">
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                </div>
                <div>
                  <p className="text-sm">
                    <span className="font-medium">System:</span> Admin dashboard initialized successfully
                  </p>
                  <span className="text-xs text-gray-500">Just now</span>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-blue-100 p-1 rounded-full mr-3 mt-1">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                </div>
                <div>
                  <p className="text-sm">
                    <span className="font-medium">System:</span> Loading admin data and statistics
                  </p>
                  <span className="text-xs text-gray-500">Just now</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
