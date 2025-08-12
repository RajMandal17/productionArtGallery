import React, { useEffect, useState } from 'react';
import { BarChart2 } from 'lucide-react';
import { adminAPI } from '../../../services/adminAPI';

const AdminAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const data = await adminAPI.getAnalytics();
        setAnalytics(data);
      } catch (err) {
        setError('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div>Loading analytics...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!analytics) return null;

  return (
    <div>
      <h1 className="text-2xl font-semibold flex items-center mb-6">
        <BarChart2 className="mr-2 h-6 w-6" /> Analytics
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Users</p>
          <h3 className="text-2xl font-bold">{analytics.totalUsers}</h3>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Artists</p>
          <h3 className="text-2xl font-bold">{analytics.totalArtists}</h3>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Customers</p>
          <h3 className="text-2xl font-bold">{analytics.totalCustomers}</h3>
        </div>
        <div className="bg-indigo-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Artworks</p>
          <h3 className="text-2xl font-bold">{analytics.totalArtworks}</h3>
        </div>
        <div className="bg-amber-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Orders</p>
          <h3 className="text-2xl font-bold">{analytics.totalOrders}</h3>
        </div>
        <div className="bg-pink-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <h3 className="text-2xl font-bold">${analytics.totalRevenue?.toLocaleString()}</h3>
        </div>
      </div>
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Recent Orders</h2>
        <div className="bg-white border rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.recentOrders?.map((order: any) => (
                <tr key={order.id}>
                  <td className="px-4 py-2">#{order.id?.substring(0, 8)}</td>
                  <td className="px-4 py-2">{order.customerName}</td>
                  <td className="px-4 py-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2">${order.totalAmount?.toFixed(2)}</td>
                  <td className="px-4 py-2">{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-2">Monthly Stats (Last 6 Months)</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.monthlyStats?.map((stat: any, idx: number) => (
                <tr key={idx}>
                  <td className="px-4 py-2">{stat.month} {stat.year}</td>
                  <td className="px-4 py-2">{stat.orders}</td>
                  <td className="px-4 py-2">${stat.revenue?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
