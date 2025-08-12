import React, { useState, useEffect } from 'react';
import { Package, CheckCircle, Clock, AlertTriangle, ShoppingCart } from 'lucide-react';
import { orderAPI } from '../../../services/api';
import { Order } from '../../../types';
import { toast } from 'react-toastify';
import { useAppContext } from '../../../context/AppContext';

const ArtistOrders: React.FC = () => {
  const { state } = useAppContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'shipped' | 'delivered'>('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getAll();
      
      // Filter for artist's artworks only
      const artistId = state.auth.user?.id;
      if (!artistId) {
        setError("User information not found");
        setLoading(false);
        return;
      }
      
      const artistOrders = response.orders.filter(order => 
        order.items.some(item => item.artwork.artistId === artistId)
      );
      
      // For each order, only keep items that belong to this artist
      const filteredOrders = artistOrders.map(order => ({
        ...order,
        items: order.items.filter(item => item.artwork.artistId === artistId),
        // Recalculate total amount for just this artist's items
        totalAmount: order.items
          .filter(item => item.artwork.artistId === artistId)
          .reduce((sum, item) => sum + (item.price * item.quantity), 0)
      }));
      
      setOrders(filteredOrders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again later.');
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'CONFIRMED':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'SHIPPED':
        return <Package className="h-5 w-5 text-purple-500" />;
      case 'DELIVERED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'CANCELLED':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter.toUpperCase());

  const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const pendingOrders = orders.filter(order => order.status === 'PENDING').length;
  const shippedOrders = orders.filter(order => order.status === 'SHIPPED').length;
  const deliveredOrders = orders.filter(order => order.status === 'DELIVERED').length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <p>{error}</p>
        <button 
          onClick={fetchOrders} 
          className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-md text-sm font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-100 inline-flex p-3 rounded-full mb-4">
          <ShoppingCart className="h-8 w-8 text-gray-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">No orders yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          When customers purchase your artwork, their orders will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Orders & Sales</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Sales</p>
              <p className="text-xl font-bold">${totalSales.toFixed(2)}</p>
            </div>
            <div className="bg-green-100 h-10 w-10 rounded-full flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Orders</p>
              <p className="text-xl font-bold">{pendingOrders}</p>
            </div>
            <div className="bg-yellow-100 h-10 w-10 rounded-full flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Shipped</p>
              <p className="text-xl font-bold">{shippedOrders}</p>
            </div>
            <div className="bg-purple-100 h-10 w-10 rounded-full flex items-center justify-center">
              <Package className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Delivered</p>
              <p className="text-xl font-bold">{deliveredOrders}</p>
            </div>
            <div className="bg-green-100 h-10 w-10 rounded-full flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            filter === 'all' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
          }`}
        >
          All Orders
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            filter === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter('confirmed')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            filter === 'confirmed' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
          }`}
        >
          Confirmed
        </button>
        <button
          onClick={() => setFilter('shipped')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            filter === 'shipped' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
          }`}
        >
          Shipped
        </button>
        <button
          onClick={() => setFilter('delivered')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            filter === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
          }`}
        >
          Delivered
        </button>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Items
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order.id.substring(0, 8)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.customer.firstName} {order.customer.lastName}
                    <div className="text-xs text-gray-400">{order.customer.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                    <div className="text-xs text-gray-400 truncate max-w-[200px]">
                      {order.items.map(item => item.artwork.title).join(', ')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${order.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1">{order.status.charAt(0) + order.status.slice(1).toLowerCase()}</span>
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                  No orders match the selected filter
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ArtistOrders;
