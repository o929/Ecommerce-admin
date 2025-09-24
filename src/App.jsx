import React from "react";
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from "react-router-dom";
import OrderManagement from "./components/OrderManagement";
import AddProduct from "./pages/AddProduct";
import AddHero from "./pages/AddHero";
import { Box, ShoppingCart, PlusCircle, LayoutDashboard, Package, Home } from "lucide-react";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Side Navigation */}
        <nav className="w-64 bg-white shadow-lg flex-shrink-0 hidden md:block">
          <div className="p-6">
            {/* Logo */}
            <div className="flex items-center justify-center mb-10">
              <div className="w-10 h-10 bg-red-700 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <h1 className="ml-3 text-2xl font-bold text-gray-900">Small Shop</h1>
            </div>
            
            {/* Navigation Links */}
            <div className="space-y-2">
     

              <NavLink
                to="/add-hero"
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-red-100 text-red-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                <PlusCircle className="w-5 h-5 mr-3" />
                Add Hero
              </NavLink>

              <NavLink
                to="/add-product"
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-red-100 text-red-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                <PlusCircle className="w-5 h-5 mr-3" />
                Add Product
              </NavLink>

              <NavLink
                to="/orders"
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-red-100 text-red-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                <ShoppingCart className="w-5 h-5 mr-3" />
                Orders
              </NavLink>
            </div>
          </div>
        </nav>

        {/* Mobile Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
          <div className="flex justify-around py-3">
            <NavLink
              to="/add-hero"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
                  isActive
                    ? "text-red-700"
                    : "text-gray-600 hover:text-gray-900"
                }`
              }
            >
              <PlusCircle className="w-6 h-6" />
              <span className="text-xs mt-1">Hero</span>
            </NavLink>

            <NavLink
              to="/add-product"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
                  isActive
                    ? "text-red-700"
                    : "text-gray-600 hover:text-gray-900"
                }`
              }
            >
              <PlusCircle className="w-6 h-6" />
              <span className="text-xs mt-1">Product</span>
            </NavLink>

            <NavLink
              to="/orders"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
                  isActive
                    ? "text-red-700"
                    : "text-gray-600 hover:text-gray-900"
                }`
              }
            >
              <ShoppingCart className="w-6 h-6" />
              <span className="text-xs mt-1">Orders</span>
            </NavLink>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-8">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-red-700 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <h1 className="ml-3 text-xl font-bold text-gray-900">Small Shop</h1>
              </div>
            </div>

            <Routes>
              <Route path="/" element={<AddProduct />}  />
              <Route path="/add-product" element={<AddProduct />} />
              <Route path="/add-hero" element={<AddHero />} />
              <Route path="/orders" element={<OrderManagement />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;