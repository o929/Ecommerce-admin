import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Users, 
  Package, 
  ChartBar, 
  Settings, 
  Bell,
  Search,
  ChevronDown,
  Menu,
  X,
  Home,
  TrendingUp,
  MapPin
} from 'lucide-react';

// Dashboard Components
const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for the dashboard
  const statsData = [
    { title: 'Total Orders', value: '1,248', change: '+12%', icon: ShoppingCart, color: 'bg-red-100 text-red-600' },
    { title: 'Revenue', value: '$42,567', change: '+8.2%', icon: TrendingUp, color: 'bg-red-100 text-red-600' },
    { title: 'Pending', value: '18', change: '-3%', icon: Package, color: 'bg-yellow-100 text-yellow-600' },
    { title: 'Delivered', value: '1,230', change: '+15%', icon: Package, color: 'bg-green-100 text-green-600' },
  ];

  const ordersData = [
    { id: 'ORD-001', customer: 'John Doe', date: '2023-05-15', amount: '$125.99', status: 'Delivered' },
    { id: 'ORD-002', customer: 'Jane Smith', date: '2023-05-16', amount: '$89.50', status: 'Pending' },
    { id: 'ORD-003', customer: 'Robert Johnson', date: '2023-05-16', amount: '$210.00', status: 'Delivered' },
    { id: 'ORD-004', customer: 'Emily Davis', date: '2023-05-17', amount: '$65.75', status: 'Cancelled' },
    { id: 'ORD-005', customer: 'Michael Wilson', date: '2023-05-17', amount: '$155.25', status: 'Pending' },
  ];

  const topProducts = [
    { name: 'Premium Headphones', sales: 245 },
    { name: 'Wireless Mouse', sales: 189 },
    { name: 'Mechanical Keyboard', sales: 156 },
    { name: 'USB-C Cable', sales: 132 },
    { name: 'Phone Case', sales: 98 },
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Navigation items
  const navItems = [
    { name: 'Dashboard', icon: Home, page: 'dashboard' },
    { name: 'Orders', icon: ShoppingCart, page: 'orders' },
    { name: 'Customers', icon: Users, page: 'customers' },
    { name: 'Products', icon: Package, page: 'products' },
    { name: 'Analytics', icon: ChartBar, page: 'analytics' },
    { name: 'Settings', icon: Settings, page: 'settings' },
  ];

  // Sidebar component
  const Sidebar = () => (
    <motion.div 
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      exit={{ x: -300 }}
      transition={{ type: 'spring', damping: 25 }}
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-red-800 text-white transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out`}
    >
      <div className="flex items-center justify-between h-16 px-6 border-b border-red-700">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <span className="ml-3 text-xl font-bold">AdminPanel</span>
        </div>
        <button 
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden text-white hover:text-red-200 focus:outline-none"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      
      <nav className="mt-6">
        <ul>
          {navItems.map((item) => (
            <li key={item.name}>
              <button
                onClick={() => {
                  setActivePage(item.page);
                  setSidebarOpen(false);
                }}
                className={`flex items-center w-full px-6 py-3 text-left hover:bg-red-700 transition-colors duration-200 ${
                  activePage === item.page ? 'bg-red-700 border-l-4 border-white' : ''
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span>{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="absolute bottom-0 w-full p-6">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-red-700 flex items-center justify-center">
            <span className="font-semibold">AD</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-red-300">admin@example.com</p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Top Navbar component
  const Navbar = () => (
    <header className="bg-white shadow-sm z-40">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-600 hover:text-gray-900 focus:outline-none"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="hidden lg:block lg:ml-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">AdminPanel</span>
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <div className="relative">
            <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
              <Search className="w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                className="ml-2 bg-transparent border-none focus:outline-none w-32 sm:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="ml-4 relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-1 text-gray-600 hover:text-gray-900 focus:outline-none relative"
            >
              <Bell className="w-6 h-6" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-600 rounded-full"></span>
            </button>
            
            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-50"
                >
                  <div className="px-4 py-2 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                      <p className="text-sm font-medium text-gray-900">New order received</p>
                      <p className="text-xs text-gray-500">2 minutes ago</p>
                    </div>
                    <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                      <p className="text-sm font-medium text-gray-900">Customer support message</p>
                      <p className="text-xs text-gray-500">1 hour ago</p>
                    </div>
                    <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                      <p className="text-sm font-medium text-gray-900">Payment processed</p>
                      <p className="text-xs text-gray-500">3 hours ago</p>
                    </div>
                  </div>
                  <div className="px-4 py-2 border-t border-gray-200 text-center">
                    <button className="text-sm text-red-600 hover:text-red-800 font-medium">
                      View All
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="ml-4 relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center text-sm rounded-full focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
                <span className="font-semibold text-white">AD</span>
              </div>
              <ChevronDown className="ml-1 w-4 h-4 text-gray-600" />
            </button>
            
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50"
                >
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">Admin User</p>
                    <p className="text-xs text-gray-500">admin@example.com</p>
                  </div>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Profile
                  </a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Settings
                  </a>
                  <a href="#" className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
                    Sign out
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );

  // Stats Card component
  const StatsCard = ({ title, value, change, icon: Icon, color }) => (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white/80 backdrop-blur-lg rounded-xl shadow-md p-6 border border-gray-100"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <div className="flex items-center mt-2">
            <span className="text-green-600 text-sm font-medium flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              {change}
            </span>
          </div>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );

  // Orders Table component
  const OrdersTable = () => (
    <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
        <button className="text-sm font-medium text-red-600 hover:text-red-800">
          View All
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {ordersData.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{order.customer}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{order.date}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{order.amount}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Sales Chart component (placeholder)
  const SalesChart = () => (
    <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-md p-6 border border-gray-100">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Sales Trend</h2>
      <div className="h-64 flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <ChartBar className="w-12 h-12 mx-auto text-gray-400" />
          <p className="mt-2 text-gray-500">Sales Trend Chart</p>
        </div>
      </div>
    </div>
  );

  // Top Products Chart component (placeholder)
  const TopProductsChart = () => (
    <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-md p-6 border border-gray-100">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Top Products</h2>
      <div className="h-64 flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <Package className="w-12 h-12 mx-auto text-gray-400" />
          <p className="mt-2 text-gray-500">Top Products Chart</p>
        </div>
      </div>
    </div>
  );

  // Map component
  const DeliveryMap = () => (
    <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-md p-6 border border-gray-100">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Delivery Locations</h2>
      <div className="h-64 rounded-lg overflow-hidden">
        <iframe
          src="https://www.openstreetmap.org/export/embed.html?bbox=-0.00401794910430908%2C51.47612752641776%2C0.000305771827048755%2C51.478569861898606&layer=mapnik&marker=51.47734869415813%2C-0.001856061075271605"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Delivery Map"
        ></iframe>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back, Admin! Here's what's happening today.</p>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statsData.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <StatsCard {...stat} />
                </motion.div>
              ))}
            </div>
            
            {/* Charts and Table */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <SalesChart />
              <TopProductsChart />
            </div>
            
            {/* Orders Table and Map */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <OrdersTable />
              </div>
              <div>
                <DeliveryMap />
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;