import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import "./AddProduct.css";

const AddProduct = () => {
  const [name, setName] = useState("");
  const [det, setDet] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null); // file instead of text
  const [preview, setPreview] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  const CLOUD_NAME = "dlrxomdfh";
  const UPLOAD_PRESET = "Shop-preset";

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const querySnapshot = await getDocs(collection(db, "products"));
      const productList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productList);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleFocus = () => {
    if (message) {
      setMessage("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || !image || !quantity) {
      setMessage("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);

      // upload to cloudinary
      const formData = new FormData();
      formData.append("file", image);
      formData.append("upload_preset", UPLOAD_PRESET);
      formData.append("cloud_name", CLOUD_NAME);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      const imageUrl = data.secure_url;

      // save to firestore
      await addDoc(collection(db, "products"), {
        name,
        price: parseFloat(price),
        det,
        image: imageUrl,
        quantity: parseInt(quantity),
        createdAt: new Date(),
      });

      setMessage("Product added successfully!");
      setName("");
      setPrice("");
      setDet("");
      setImage(null);
      setQuantity("");
      fetchProducts();
    } catch (error) {
      console.error("Error adding product:", error);
      setMessage("Failed to add product.");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (id) => {
    setSelectedProductId(id);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteDoc(doc(db, "products", selectedProductId));
      setProducts((prev) => prev.filter((product) => product.id !== selectedProductId));
      setShowModal(false);
      setSelectedProductId(null);
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product");
    }
  };

  return (
    <div className="add-product-container">
      <h2>Add New Product</h2>
      <div className="message-box">{message && <p className="message">{message}</p>}</div>
      <form onSubmit={handleSubmit} className="form">
        <input type="text" placeholder="Product name" value={name} onFocus={handleFocus} onChange={(e) => setName(e.target.value)} />
        <input type="text" placeholder="Product Details" value={det} onFocus={handleFocus} onChange={(e) => setDet(e.target.value)} />
        <input type="number" placeholder="Price" value={price} onFocus={handleFocus} onChange={(e) => setPrice(e.target.value)} step="0.01" />

        {/* File upload instead of URL input */}
        <input type="file" accept="image/*"   onChange={(e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file)); // 👈 generate preview
    }
  }} />
        {preview && (
  <div className="preview-box">
    <img src={preview} alt="Preview" className="preview-img" />
  </div>
)}

        <input type="number" placeholder="Quantity" value={quantity} onFocus={handleFocus} onChange={(e) => setQuantity(e.target.value)} />
        <button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Product"}
        </button>
      </form>

      <h2>Existing Products</h2>
      {loadingProducts ? (
        <p>Loading products...</p>
      ) : products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <ul className="product-list">
          {products.map((product) => (
            <li key={product.id} className="product-item">
              <div>
                <img className="exist-product-img" src={product.image} alt={product.name} />
                 Name: <strong>{product.name} </strong> | Price: <strong>${product.price.toFixed(2)} </strong> | Quantity: <strong>{product.quantity}</strong>
              </div>
              <button className="delete-btn" onClick={() => openModal(product.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
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

export default AddProduct;
