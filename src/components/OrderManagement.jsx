import React, { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, deleteDoc, doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { 
  Trash2, 
  Package, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ShoppingBag,
  AlertCircle,
  CheckCircle
} from "lucide-react";

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [cancellations, setCancellations] = useState([]);

  // Set up real-time listener for orders
  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(collection(db, "orders"), (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        docId: doc.id,   // Firestore's real document ID
        ...doc.data()
      }));
      
      setOrders(ordersData);
      setLoading(false);
      
      if (ordersData.length === 0) {
        setMessage("No orders found.");
      }
    }, (error) => {
      console.error("Error fetching orders:", error);
      setErrorMessage("Failed to fetch orders. Please try again.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Set up real-time listener for cancellations
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "cancellations"), (snapshot) => {
      const cancellationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setCancellations(cancellationsData);
      // console.log("Cancellations data:", cancellationsData); // Add this for debugging
    }, (error) => {
      console.error("Error fetching cancellations:", error);
      setErrorMessage("Failed to fetch cancellations. Please try again.");
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = useCallback((docId) => {
    setDeleteId(docId);
    setShowModal(true);
  }, []);

  const handleDeleteAll = useCallback(() => {
    setShowDeleteAllModal(true);
  }, []);

  // Function to approve cancellation and update order status
  // const handleApproveCancellation = useCallback(async (orderDocId, cancellationId) => {
  //   try {
  //     // Update the order status to "Cancelled"
  //     await updateDoc(doc(db, "orders", orderDocId), { 
  //       status: "Cancelled",
  //       canceled: true
  //     });
      
  //     // Delete the cancellation request after approval
  //     await deleteDoc(doc(db, "cancellations", cancellationId));
      
  //     setMessage("Order has been cancelled successfully");
  //   } catch (error) {
  //     console.error("Error approving cancellation:", error);
  //     setErrorMessage("Failed to approve cancellation");
  //   }
  // }, []);

  // Function to reject cancellation (remove cancellation request)
  // const handleRejectCancellation = useCallback(async (cancellationId) => {
  //   try {
  //     // Delete the cancellation request
  //     await deleteDoc(doc(db, "cancellations", cancellationId));
      
  //     setMessage("Cancellation request has been rejected");
  //   } catch (error) {
  //     console.error("Error rejecting cancellation:", error);
  //     setErrorMessage("Failed to reject cancellation");
  //   }
  // }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteId) return;

    try {
      await deleteDoc(doc(db, "orders", deleteId));
      setMessage("Order deleted successfully!");
      setShowModal(false);
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting order:", error);
      setErrorMessage("Failed to delete order. Please try again.");
      setShowModal(false);
    }
  }, [deleteId]);

  const confirmDeleteAll = useCallback(async () => {
    if (orders.length === 0) {
      setShowDeleteAllModal(false);
      return;
    }

    setIsDeletingAll(true);
    
    try {
      // Delete all orders
      const deletePromises = orders.map(order => deleteDoc(doc(db, "orders", order.docId)));
      await Promise.all(deletePromises);
      
      setMessage("All orders deleted successfully!");
      // Close modal immediately after successful deletion
      setShowDeleteAllModal(false);
    } catch (error) {
      console.error("Error deleting all orders:", error);
      setErrorMessage("Failed to delete all orders. Please try again.");
      // Also close modal on error
      setShowDeleteAllModal(false);
    } finally {
      setIsDeletingAll(false);
    }
  }, [orders]);

  // Close modal when orders become empty
  useEffect(() => {
    if (orders.length === 0 && showDeleteAllModal) {
      setShowDeleteAllModal(false);
    }
  }, [orders.length, showDeleteAllModal]);

  useEffect(() => {
    if (message || errorMessage) {
      const timer = setTimeout(() => {
        setMessage("");
        setErrorMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, errorMessage]);

  const formatDate = useCallback((timestamp) => {
    if (!timestamp) return "No timestamp";
    
    const date = timestamp.seconds 
      ? new Date(timestamp.seconds * 1000) 
      : new Date(timestamp);
    
    return date.toLocaleString();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      {/* Toast Messages */}
      {(message || errorMessage) && (
        <div className="fixed top-4 right-4 z-50">
          {message && (
            <div className="mb-2 p-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              {message}
            </div>
          )}
          {errorMessage && (
            <div className="mb-2 p-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {errorMessage}
            </div>
          )}
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-red-700 to-red-200 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Order Management</h1>
                <p className="text-red-100 mt-1">Manage and track customer orders</p>
              </div>
              <button
                onClick={handleDeleteAll}
                disabled={loading || orders.length === 0 || isDeletingAll}
                className="mt-4 md:mt-0 px-4 py-2 bg-red-600 bg-opacity-90 hover:bg-opacity-100 text-white rounded-lg transition-colors flex items-center disabled:opacity-50"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                {isDeletingAll ? "Deleting..." : "Delete All"}
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-700"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Orders Yet</h2>
            <p className="text-gray-600">When customers place orders, they will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {orders.map(order => {
              // Check if there are cancellation requests for this order
              // Try matching by both order.id and order.docId to cover all possibilities
              const orderCancellations = cancellations.filter(c => 
                c.orderId === order.docId || c.orderId === order.id
              );
              const hasCancellationRequest = orderCancellations.length > 0;
              
              // Debug logging
              // console.log(`Order ${order.id} (docId: ${order.docId}) has ${orderCancellations.length} cancellation requests`);
              
              return (
                <div key={order.docId} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="p-6">
                    {/* Order Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">Order ID: <span className="text-red-700">{order.id}</span></h2>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatDate(order.timestamp)}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(order.docId)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
<div className="mt-4">
  <h4 className="font-medium flex items-center mb-2 text-gray-800">
    <MapPin className="mr-2 text-red-500" /> Delivery Location
  </h4>
  <div className="w-full h-72 rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg">
    {order.location && order.location.lat && order.location.lng ? (
      <iframe
        title={`map-${order.id}`}
        src={`https://www.google.com/maps?q=${order.location.lat},${order.location.lng}&t=k&z=17&output=embed`}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        className="rounded-xl"
      ></iframe>
    ) : order.client?.address ? (
      <iframe
        title={`map-address-${order.id}`}
        src={`https://www.google.com/maps?q=${encodeURIComponent(
          order.client.address
        )}&t=k&z=17&output=embed`}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        className="rounded-xl"
      ></iframe>
    ) : (
      <p className="text-gray-500 italic">No location provided</p>
    )}
  </div>
</div>

                    {/* Client Details */}
                    {order.client && (
                      <div className="bg-gray-50 rounded-xl p-4 mb-6">
                        <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                          <User className="w-5 h-5 mr-2" />
                          Client Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex items-center text-sm">
                            <User className="w-4 h-4 mr-2 text-gray-500" />
                            <span className="font-medium text-gray-900">{order.client.name}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Mail className="w-4 h-4 mr-2 text-gray-500" />
                            <span className="text-gray-700">{order.client.email}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Phone className="w-4 h-4 mr-2 text-gray-500" />
                            <span className="text-gray-700">{order.client.phone}</span>
                          </div>
                          <div className="flex items-start text-sm">
                            <MapPin className="w-4 h-4 mr-2 text-gray-500 mt-0.5" />
                            <span className="text-gray-700">{order.client.address}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Order Items */}
                    <div>
                      <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                        <ShoppingBag className="w-5 h-5 mr-2" />
                        Ordered Items
                      </h3>
                      <div className="space-y-4">
                        {order.items?.map((item, index) => (
                          <div key={item.id || index} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 bg-gray-50 rounded-lg">
                            <img
                              src={item.image || (Array.isArray(item.images) ? item.images[0] : item.images)}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                              onError={(e) => {
                                e.target.src = "/placeholder.jpg";
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                              <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-600">
                                <span>Qty: <span className="font-medium">{item.qty}</span></span>
                                {item.selectedSize && (
                                  <span>Size: <span className="font-medium">{item.selectedSize}</span></span>
                                )}
                                <span>Price: <span className="font-medium">${Number(item.price).toFixed(2)}</span></span>
                              </div>
                              <div className="mt-1 text-sm font-medium text-red-700">
                                Total: ${(item.qty * Number(item.price)).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Total */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">Order Total:</span>
                        <span className="text-xl font-bold text-red-700">
                          ${order.items?.reduce((total, item) => total + (item.qty * Number(item.price)), 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    {/* Order Status */}
<div className="mt-4 pt-4 border-t border-gray-200">
  <div className="flex justify-between items-center">
    <span className="text-lg font-semibold text-gray-900">Order Status:</span>
    
    <select
  value={order.status || "Pending"}
  onChange={async (e) => {
    const newStatus = e.target.value;
    try {
      await updateDoc(doc(db, "orders", order.docId), { status: newStatus });
      setMessage("Order status updated!");
    } catch (error) {
      console.error("Error updating status:", error);
      setErrorMessage("Failed to update status");
    }
  }}
>

      <option value="Pending">Pending</option>
      <option value="In Transit">In Transit</option>
      <option value="Delivered">Delivered</option>
      <option value="Cancelled">Cancelled</option>
    </select>

    <span
      className={`ml-4 text-md font-bold ${
        order.status === "Delivered"
          ? "text-green-600"
          : order.status === "In Transit"
          ? "text-yellow-600"
          : order.status === "Cancelled"
          ? "text-red-600"
          : "text-red-600"
      }`}
    >
      {order.status || "Pending"}
    </span>
  </div>
</div>

                    {/* Cancellation Requests Status */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">Cancellation Requests:</span>
                        <span className={hasCancellationRequest ? "text-red-600 font-bold" : "text-green-600 font-bold"}>
                          {hasCancellationRequest ? "Request Received" : "No Requests"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
      </div>

      {/* Confirm Delete Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this order? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete All Modal */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Delete All</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete ALL orders? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteAllModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteAll}
                disabled={isDeletingAll}
                className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors disabled:opacity-50 flex items-center"
              >
                {isDeletingAll ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  "Delete All"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;