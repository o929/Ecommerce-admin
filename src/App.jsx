import React from "react";
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from "react-router-dom";
import OrderManagement from "./components/OrderManagement";
import AddProduct from "./pages/AddProduct";
import AddHero from "./pages/AddHero";
import { Box, ShoppingCart, PlusCircle } from "lucide-react";
import "./index.css";

function App() {
  const styles = {
    appContainer: {
      display: "flex",
      minHeight: "100vh",
    },
    nav: {
      display: "flex",
      flexDirection: "column",
      width: "220px",
      backgroundColor: "#f4f4f4",
      padding: "20px",
      borderRight: "1px solid #ccc",
    },
    logo: {
      fontSize: "24px",
      fontWeight: "bold",
      color: "#333",
      marginBottom: "30px",
      textAlign: "center",
    },
    links: {
      display: "flex",
      flexDirection: "column",
      gap: "20px",
    },
    link: {
      textDecoration: "none",
      color: "#007bff",
      fontWeight: "bold",
      fontSize: "16px",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "10px",
      borderRadius: "8px",
      transition: "background-color 0.2s, color 0.2s",
    },
    activeLink: {
      color: "#ff4d4f",
      backgroundColor: "#ffe4e6",
    },
    mainContent: {
      flex: 1,
      padding: "30px",
      backgroundColor: "#f9fafb",
    },
  };

  return (
    <Router>
      <div style={styles.appContainer}>
        {/* Side Navigation */}
        <nav style={styles.nav}>
          <h2 style={styles.logo}>Small Shop</h2>
          <div style={styles.links}>
            <NavLink
              to="/add-hero"
              style={({ isActive }) =>
                isActive ? { ...styles.link, ...styles.activeLink } : styles.link
              }
            >
              <PlusCircle size={18} /> Add Hero
            </NavLink>

            <NavLink
              to="/add-product"
              style={({ isActive }) =>
                isActive ? { ...styles.link, ...styles.activeLink } : styles.link
              }
            >
              <PlusCircle size={18} />  Add Product
            </NavLink>

            <NavLink
              to="/orders"
              style={({ isActive }) =>
                isActive ? { ...styles.link, ...styles.activeLink } : styles.link
              }
            >
          📦 Orders
            </NavLink>
          </div>
        </nav>

        {/* Main Content */}
        <main style={styles.mainContent}>
          <Routes>
            <Route path="/" element={<Navigate to="/add-product" replace />} />
            <Route path="*" element={<Navigate to="/add-product" replace />} />
            <Route path="/add-product" element={<AddProduct />} />
            <Route path="/add-hero" element={<AddHero />} />
            <Route path="/orders" element={<OrderManagement />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
