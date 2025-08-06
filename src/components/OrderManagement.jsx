// src/components/OrderManagement.jsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import './OrderManagement.css';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "orders"));
      const ordersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersData);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (orderId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this order?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "orders", orderId));
      setOrders(prev => prev.filter(order => order.id !== orderId));
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
    // const interval = setInterval(fetchOrders, 5000); // every 5s
    // return () => clearInterval(interval);
  }, []);

  return (
    <div className="order-container">
      <h2 className="order-heading">📦 Received Orders</h2>

      {loading ? (
        <p className="loading-text">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="no-orders">No orders yet.</p>
      ) : (
        orders.map(order => (
          <div className="order-box" key={order.id}>
            <p><strong>Order ID:</strong> {order.id}</p>
            <p><strong>Time:</strong> 
              {order.timestamp
                ? new Date(
                    order.timestamp.seconds
                      ? order.timestamp.seconds * 1000
                      : order.timestamp
                  ).toLocaleString()
                : "No timestamp"}
            </p>

            {order.client && (
              <div className="client-details">
                <h3>Client Details</h3>
                <p><strong>Name:</strong> {order.client.name}</p>
                <p><strong>Email:</strong> {order.client.email}</p>
                <p><strong>Phone:</strong> {order.client.phone}</p>
                <p><strong>Address:</strong> {order.client.address}</p>
              </div>
            )}

            <h3 className="order-items-title">🛒 Ordered Items</h3>
            <ul className="order-items">
              {order.items?.map((item, index) => (
                <li key={item.id || index} className="order-item">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="order-item-image"
                  />
                  <span className="order-item-details">
                    {item.qty} x {item.name} (${item.price?.toFixed(2)}) — 
                    <strong> Total: ${item.qty * item.price?.toFixed(2)}</strong>
                  </span>
                </li>
              ))}
            </ul>

            <button className="delete-btn" onClick={() => handleDelete(order.id)}>
              🗑️ Delete Order
            </button>
          </div>
        ))
      )}
            {/* Confirmation Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <p>Are you sure you want to delete this product?</p>
            <div className="modal-actions">
              <button className="confirm-btn" onClick={confirmDelete}>Yes, Delete</button>
              <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
