import React, { useState, useEffect } from "react";
import { collection, addDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { DollarSign, Package, ShoppingBag, UploadCloud } from "lucide-react";
import "./AddProduct.css";

const AddProduct = () => {
  const [name, setName] = useState("");
  const [det, setDet] = useState("");
  const [price, setPrice] = useState("");
  const [newprice, setNewPrice] = useState("");
  const [images, setImages] = useState([]); // array of File objects
  const [previews, setPreviews] = useState([]); // array of preview URLs
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState("Empty");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errormessage, setErrormessage] = useState("");
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  const CLOUD_NAME = "dlrxomdfh";
  const UPLOAD_PRESET = "Shop-preset";

  // Fetch products in real-time
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      const productList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setProducts(productList);
    });
    return () => unsubscribe();
  }, []);

  // Auto clear messages after 5s
  useEffect(() => {
    if (message || errormessage) {
      const timer = setTimeout(() => {
        setMessage("");
        setErrormessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, errormessage]);

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const handleFocus = () => {
    setMessage("");
    setErrormessage("");
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    // Validate all files
    for (let file of files) {
      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        setErrormessage("Only JPEG/PNG images are allowed.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrormessage("Each file must be less than 5MB.");
        return;
      }
    }

    setImages(files);
    setPreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !det || !price || !newprice || !quantity || category === "Empty" || images.length === 0) {
      setErrormessage("Please fill in all fields.");
      return;
    }

    if (parseFloat(price) <= 0 || parseInt(quantity) < 0 || parseFloat(newprice) < 0) {
      setErrormessage("Price must be > 0 and quantity >= 0.");
      return;
    }

    try {
      setLoading(true);

      // Upload multiple images to Cloudinary
      const uploadedUrls = [];
      for (let img of images) {
        const formData = new FormData();
        formData.append("file", img);
        formData.append("upload_preset", UPLOAD_PRESET);
        formData.append("cloud_name", CLOUD_NAME);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        uploadedUrls.push(data.secure_url);
      }

      // Add product to Firestore
      await addDoc(collection(db, "products"), {
        name,
        det,
        price: parseFloat(price),
        newprice: parseFloat(newprice),
        quantity: parseInt(quantity),
        category,
        images: uploadedUrls, // store array of URLs
        createdAt: new Date(),
      });

      // Reset form
      setName("");
      setDet("");
      setPrice("");
      setNewPrice("");
      setQuantity("");
      setCategory("Empty");
      setImages([]);
      setPreviews([]);
      setMessage("Product added successfully!");
    } catch (error) {
      console.error(error);
      setErrormessage("Failed to add product. Try again.");
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
      setShowModal(false);
      setSelectedProductId(null);
    } catch (error) {
      console.error(error);
      alert("Failed to delete product");
    }
  };

  return (
    <div className="add-product-container">
      <h2>Add New Product</h2>

      <div className="message-box">
        {message && <p className="success">{message}</p>}
        {errormessage && <p className="error">{errormessage}</p>}
      </div>

      <form onSubmit={handleSubmit} className="form">
        <label htmlFor="category-select">Category</label>
        <select id="category-select" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="Empty">Select Category</option>
          <option value="men">Men</option>
          <option value="women">Women</option>
          <option value="kids">Kids</option>
        </select>

        <div className="input-wrapper">
          <ShoppingBag className="input-icon" size={18} />
          <input
            type="text"
            placeholder="Product Name"
            value={name}
            onFocus={handleFocus}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <input
          type="text"
          placeholder="Product Details"
          value={det}
          onFocus={handleFocus}
          onChange={(e) => setDet(e.target.value)}
        />

        <div className="grid-row">
          <div className="input-wrapper small">
            <DollarSign className="input-icon" size={18} />
            <input
              type="number"
              placeholder="Price"
              value={price}
              onFocus={handleFocus}
              onChange={(e) => setPrice(e.target.value)}
              step="0.1"
            />
          </div>

          <div className="input-wrapper small">
            <DollarSign className="input-icon" size={18} />
            <input
              type="number"
              placeholder="New Price"
              value={newprice}
              onFocus={handleFocus}
              onChange={(e) => setNewPrice(e.target.value)}
              step="0.1"
            />
          </div>

          <div className="input-wrapper small">
            <Package className="input-icon" size={18} />
            <input
              type="number"
              placeholder="Quantity"
              value={quantity}
              onFocus={handleFocus}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
        </div>

          <input
            type="file"
            accept="image/*"
            id="fileInput"
            onChange={handleImageChange}
            style={{ display: "none" }}
            multiple
          />
          <button
            type="button"
            className="upload-btn"
            onClick={() => document.getElementById("fileInput").click()}
            aria-label="Upload product images"
          >
            <UploadCloud size={20} /> Upload Images
          </button>
        <div className="img-input-wrapper file-upload">

        {previews.length > 0 && (
          <div className="preview-box">
            {previews.map((src, idx) => (
              <div key={idx} className="relative">
                <img src={src} alt={`Preview ${idx}`} className="preview-img" />
                <button
                  type="button"
                  className="remove-image absolute top-1 right-1 bg-red-600 text-white rounded-full px-1"
                  onClick={() => {
                    const newImages = images.filter((_, i) => i !== idx);
                    const newPreviews = previews.filter((_, i) => i !== idx);
                    setImages(newImages);
                    setPreviews(newPreviews);
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        </div>

        <button className="add-btn" type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Product"}
        </button>
      </form>

      <h2>Existing Products</h2>
      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        ["men", "women", "kids"].map((cat) => (
          <div key={cat}>
            <h3>{cat.toUpperCase()}</h3>
            <ul className="product-list">
              {products
                .filter((p) => p.category === cat)
                .map((product) => (
                  <li key={product.id} className="product-item">
                    {/* Display first image of product */}
                    <img className="exist-product-img" src={product.images && product.images[0]} alt={product.name} />
                    <div className="product-info">
                      <p>
                        <ShoppingBag size={14} /> <strong>{product.name}</strong>
                      </p>
                      <p>
                        <DollarSign size={14} /> ${product.price.toFixed(2)}
                      </p>
                      <p>
                        <DollarSign size={14} /> ${product.newprice}
                      </p>
                      <p>
                        <Package size={14} /> Qty: {product.quantity}
                      </p>
                    </div>
                    <button className="delete-btn" onClick={() => openModal(product.id)}>
                      Delete
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        ))
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <p>Are you sure you want to delete this product?</p>
            <div className="modal-actions">
              <button className="confirm-btn" onClick={confirmDelete}>
                Yes, Delete
              </button>
              <button className="cancel-btn" onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProduct;
