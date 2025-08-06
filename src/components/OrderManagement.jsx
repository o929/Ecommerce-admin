// src/components/OrderManagement.jsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebaseConfig";

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
    try {
      await deleteDoc(doc(db, "orders", orderId));
      setOrders(prev => prev.filter(order => order.id !== orderId));
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Received Orders</h2>

      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        orders.map(order => (
          <div
            key={order.id}
            style={{
              border: "1px solid #ccc",
              margin: "10px 0",
              padding: "10px",
              borderRadius: "5px"
            }}
          >
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

            {/* Render client details */}
            {order.client && (
              <div style={{ marginTop: "10px", padding: "10px", backgroundColor: "#f1f1f1" }}>
                <h3>Client Details</h3>
                <p><strong>Client Name:</strong> {order.client.name}</p>
                <p><strong>Email:</strong> {order.client.email}</p>
                <p><strong>Phone:</strong> {order.client.phone}</p>
                <p><strong>Address:</strong> {order.client.address}</p>
              </div>
            )}

            <ul>
              {order.items?.map((item, index) => (
                <>
                <h3>The Order</h3>
                  <li key={item.id || index} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <img
        src={item.image} // or item.img if that's your field name
        alt={item.name}
        style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 4 }}
      />
      <span>
        {item.qty} x {item.name} (${item.price?.toFixed(2)}) Total: <strong>${item.qty * item.price.toFixed(2)}</strong> 
      </span>
    </li>
                </>
              ))}
            </ul>

            <button
              onClick={() => handleDelete(order.id)}
              style={{
                marginTop: "10px",
                padding: "5px 10px",
                backgroundColor: "#f44336",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Delete Order
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default OrderManagement;
