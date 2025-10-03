import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, Users, Package, ChartBar, Settings, Bell,
  Search, ChevronDown, Menu, X, Home, TrendingUp
} from 'lucide-react';
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig"; // adjust path if needed

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState([]);
  const [ordersData, setOrdersData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [statusCounts, setStatusCounts] = useState({}); // 🔥 track status counts from Firestore

  // 🔥 Fetch Dashboard Data from Firestore
  useEffect(() => {
    setLoading(true)
    const fetchDashboardData = async () => {
      try {
        // Fetch Orders
        const ordersSnapshot = await getDocs(collection(db, "orders"));
        const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrdersData(orders);

        // ✅ Collect statuses dynamically instead of hardcoding
        const statusMap = orders.reduce((acc, o) => {
          const status = o.status || "Pending";
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});
        setStatusCounts(statusMap);
setLoading(false)
        // Generate Stats from Orders
        const totalOrders = orders.length;
        const delivered = statusMap["Delivered"] || 0;
        const pending = statusMap["Pending"] || 0;
        const inTransit = statusMap["In Transit"] || 0;
        const revenue = orders.reduce((sum, o) => sum + (o.amount ? parseFloat(o.amount) : 0), 0);

        setStatsData([
          { title: 'Total Orders', value: totalOrders, change: '+12%', icon: ShoppingCart, color: 'bg-red-100 text-red-600' },
          { title: 'Revenue', value: `$${revenue.toFixed(2)}`, change: '+8.2%', icon: TrendingUp, color: 'bg-red-100 text-red-600' },
          { title: 'Pending', value: pending, change: '-3%', icon: Package, color: 'bg-yellow-100 text-yellow-600' },
          { title: 'In Transit', value: inTransit, change: '+4%', icon: Package, color: 'bg-blue-100 text-blue-600' },
          { title: 'Delivered', value: delivered, change: '+15%', icon: Package, color: 'bg-green-100 text-green-600' },

        ]);

        // Fetch Top Products
        const productsSnapshot = await getDocs(collection(db, "products"));
        const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Sort products by sales
        const sortedProducts = products.sort((a, b) => (b.sales || 0) - (a.sales || 0)).slice(0, 5);
        setTopProducts(sortedProducts);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  // ✅ rest of your Dashboard (Sidebar, Navbar, StatsCard, OrdersTable, Charts, Map) stays the same
  // just replace the old mock arrays with `statsData`, `ordersData`, `topProducts`

  return (
    <>
    {loading ? <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-700"></div>
          </div>
          : 
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar, Navbar, Main content ... */}
      <div className="p-6 flex-1">
        {/* Example: Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.map((stat, idx) => (
            <motion.div
              key={idx}
              className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div>
                <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-gray-400">{stat.change}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>


    </div>
  }
    </>
  );
};

export default Dashboard;
