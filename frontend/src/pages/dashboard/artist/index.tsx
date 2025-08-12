import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  PlusCircle, Settings, ShoppingBag, Star, 
  LayoutDashboard, LogOut, PaintBucket, Image,
  AlertCircle
} from 'lucide-react';

import ArtistProfile from './ArtistProfile';
import ArtworkList from './ArtworkList';
import CreateArtwork from './CreateArtwork';
import EditArtwork from './EditArtwork';
import ArtistOrders from './ArtistOrders';
import ArtistReviews from './ArtistReviews';
import { useAppContext } from '../../../context/AppContext';
import { toast } from 'react-toastify';
import { debugToken } from '../../../utils/debugToken';

const ArtistDashboard: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Debug authentication when component mounts and handle auth errors
  useEffect(() => {
    console.log('Artist Dashboard - Auth State:', state.auth);
    const tokenInfo = debugToken();
    const token = localStorage.getItem('access_token');
    
    // Check for auth inconsistency - token missing but marked as authenticated
    if (state.auth.isAuthenticated && !token) {
      console.error('Auth inconsistency detected: Token missing but marked as authenticated');
      setAuthError('Auth inconsistency: Token missing but marked as authenticated');
      toast.error('Authentication error. Please log in again.');
      // Clear the inconsistent state
      dispatch({ type: 'LOGOUT' });
      // Redirect to login page after a short delay
      setTimeout(() => navigate('/login'), 500);
    }
    else if (!state.auth.isAuthenticated || !state.auth.token) {
      setAuthError('You are not authenticated. Please log in again.');
      toast.error('Authentication error: Please log in again');
      // Redirect to login page after a short delay
      setTimeout(() => navigate('/login'), 500);
    } else if (state.auth.user?.role !== 'ARTIST') {
      setAuthError(`Invalid role: ${state.auth.user?.role}. Artist role required.`);
      toast.error('Access denied: Artist role required');
    }
  }, [state.auth, navigate, dispatch]);
  
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
              <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                {state.auth.user?.profileImage ? (
                  <img 
                    src={state.auth.user.profileImage} 
                    alt="Profile" 
                    className="h-full w-full rounded-full object-cover" 
                  />
                ) : (
                  <PaintBucket size={36} className="text-blue-600" />
                )}
              </div>
              <h3 className="text-lg font-semibold">
                {state.auth.user?.firstName} {state.auth.user?.lastName}
              </h3>
              <span className="text-sm text-gray-500">Artist</span>
            </div>
            
            <nav className="space-y-1">
              <Link 
                to="/dashboard/artist" 
                className={`flex items-center px-4 py-2 rounded-md ${
                  location.pathname === '/dashboard/artist' 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <LayoutDashboard className="mr-3 h-5 w-5" />
                Dashboard
              </Link>
              
              <Link 
                to="/dashboard/artist/artworks" 
                className={`flex items-center px-4 py-2 rounded-md ${
                  location.pathname === '/dashboard/artist/artworks' 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Image className="mr-3 h-5 w-5" />
                My Artworks
              </Link>
              
              <Link 
                to="/dashboard/artist/create" 
                className={`flex items-center px-4 py-2 rounded-md ${
                  location.pathname === '/dashboard/artist/create' 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <PlusCircle className="mr-3 h-5 w-5" />
                Upload Artwork
              </Link>
              
              <Link 
                to="/dashboard/artist/orders" 
                className={`flex items-center px-4 py-2 rounded-md ${
                  location.pathname === '/dashboard/artist/orders' 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ShoppingBag className="mr-3 h-5 w-5" />
                Orders & Sales
              </Link>
              
              <Link 
                to="/dashboard/artist/reviews" 
                className={`flex items-center px-4 py-2 rounded-md ${
                  location.pathname === '/dashboard/artist/reviews' 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Star className="mr-3 h-5 w-5" />
                Reviews
              </Link>
              
              <Link 
                to="/dashboard/artist/profile" 
                className={`flex items-center px-4 py-2 rounded-md ${
                  location.pathname === '/dashboard/artist/profile' 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Settings className="mr-3 h-5 w-5" />
                Profile Settings
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
            {authError ? (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <p className="text-red-700">{authError}</p>
                </div>
                <div className="mt-4">
                  <button 
                    onClick={() => navigate('/login')} 
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                  >
                    Go to Login
                  </button>
                </div>
              </div>
            ) : (
              <Routes>
                <Route index element={<ArtistDashboardHome />} />
                <Route path="artworks" element={<ArtworkList />} />
                <Route path="create" element={<CreateArtwork />} />
                <Route path="edit/:artworkId" element={<EditArtwork />} />
                <Route path="orders" element={<ArtistOrders />} />
                <Route path="reviews" element={<ArtistReviews />} />
                <Route path="profile" element={<ArtistProfile />} />
              </Routes>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Dashboard Home Component
const ArtistDashboardHome: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Artist Dashboard</h1>
      
      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Total Artworks</p>
              <h3 className="text-xl font-bold">24</h3>
            </div>
            <div className="bg-blue-100 p-2 rounded-full">
              <Image className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Sales This Month</p>
              <h3 className="text-xl font-bold">$1,240</h3>
            </div>
            <div className="bg-emerald-100 p-2 rounded-full">
              <ShoppingBag className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Avg. Rating</p>
              <h3 className="text-xl font-bold">4.8</h3>
            </div>
            <div className="bg-amber-100 p-2 rounded-full">
              <Star className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick actions */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link 
            to="/dashboard/artist/create" 
            className="flex items-center p-4 bg-white border rounded-lg hover:bg-blue-50 transition-colors"
          >
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              <PlusCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium">Upload New Artwork</h3>
              <p className="text-sm text-gray-500">Add a new piece to your collection</p>
            </div>
          </Link>
          
          <Link 
            to="/dashboard/artist/orders" 
            className="flex items-center p-4 bg-white border rounded-lg hover:bg-blue-50 transition-colors"
          >
            <div className="bg-emerald-100 p-2 rounded-full mr-3">
              <ShoppingBag className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-medium">View Recent Orders</h3>
              <p className="text-sm text-gray-500">Check your recent sales</p>
            </div>
          </Link>
          
          <Link 
            to="/dashboard/artist/reviews" 
            className="flex items-center p-4 bg-white border rounded-lg hover:bg-blue-50 transition-colors"
          >
            <div className="bg-amber-100 p-2 rounded-full mr-3">
              <Star className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-medium">Latest Reviews</h3>
              <p className="text-sm text-gray-500">See what customers are saying</p>
            </div>
          </Link>
        </div>
      </div>
      
      {/* Recent activity */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b">
            <h3 className="font-medium">Latest Updates</h3>
          </div>
          <div className="divide-y">
            <div className="px-4 py-3 flex items-center">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <ShoppingBag className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm">New order for <span className="font-medium">Sunset at the Beach</span></p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="px-4 py-3 flex items-center">
              <div className="bg-amber-100 p-2 rounded-full mr-3">
                <Star className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm">New 5-star review on <span className="font-medium">Mountain Landscape</span></p>
                <p className="text-xs text-gray-500">Yesterday</p>
              </div>
            </div>
            <div className="px-4 py-3 flex items-center">
              <div className="bg-emerald-100 p-2 rounded-full mr-3">
                <Image className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm">You uploaded <span className="font-medium">City Streets</span></p>
                <p className="text-xs text-gray-500">2 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistDashboard;
