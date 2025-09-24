import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { 
  DollarSign, 
  Package, 
  ShoppingBag, 
  Upload, 
  Trash2, 
  X, 
  Plus,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  Search
} from "lucide-react";

export default function AddProduct() {
  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState("");
  const [sizes, setSizes] = useState([]);

  // Files + previews
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef(null);

  // UI + data
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errormessage, setErrormessage] = useState("");
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Cloudinary
  const CLOUD_NAME = "dlrxomdfh";
  const UPLOAD_PRESET = "Shop-preset";

  // Available sizes
  const availableSizes = useMemo(() => ["XS", "S", "M", "L", "XL", "XXL"], []);

  // Firestore real-time subscription
  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  // Auto clear messages
  useEffect(() => {
    if (!message && !errormessage) return;
    const t = setTimeout(() => {
      setMessage("");
      setErrormessage("");
    }, 3500);
    return () => clearTimeout(t);
  }, [message, errormessage]);

  // Cleanup previews
  useEffect(() => {
    return () => {
      previews.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {}
      });
    };
  }, [previews]);

  // Close modal with ESC
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setShowModal(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // --- Helpers ---
  const handleFocus = () => {
    setMessage("");
    setErrormessage("");
  };

  const handleImageChange = useCallback((e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate
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

    // Append files and previews
    setImages((prev) => [...prev, ...files]);
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);
  }, []);

  const removeImageAt = useCallback((index) => {
    const url = previews[index];
    if (url) {
      try {
        URL.revokeObjectURL(url);
      } catch (e) {}
    }
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setImages((prev) => prev.filter((_, i) => i !== index));
  }, [previews]);

  const toggleSize = useCallback((value) => {
    setSizes((prev) => (prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]));
  }, []);

  // --- Submit product ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrormessage("");
    setMessage("");

    // Basic validation
    if (
      !name.trim() ||
      !description.trim() ||
      !price ||
      !newPrice ||
      !quantity ||
      !category ||
      images.length === 0 ||
      sizes.length === 0
    ) {
      setErrormessage("Please fill in all fields and add at least one image & size.");
      return;
    }

    if (parseFloat(price) <= 0 || parseInt(quantity) < 0 || parseFloat(newPrice) < 0) {
      setErrormessage("Price must be > 0 and quantity >= 0.");
      return;
    }

    try {
      setLoading(true);

      // Upload images to Cloudinary
      const uploadedUrls = [];
      for (let img of images) {
        const fd = new FormData();
        fd.append("file", img);
        fd.append("upload_preset", UPLOAD_PRESET);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
          method: "POST",
          body: fd,
        });
        const data = await res.json();
        if (!data.secure_url) throw new Error(data.error?.message || "Image upload failed");
        uploadedUrls.push(data.secure_url);
      }

      // Save to Firestore
      await addDoc(collection(db, "products"), {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        newPrice: parseFloat(newPrice),
        quantity: parseInt(quantity, 10),
        category,
        sizes,
        images: uploadedUrls,
        createdAt: new Date(),
      });

      // Cleanup
      previews.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {}
      });
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Reset form
      setName("");
      setDescription("");
      setPrice("");
      setNewPrice("");
      setQuantity("");
      setCategory("");
      setSizes([]);
      setImages([]);
      setPreviews([]);

      setMessage("Product added successfully!");
    } catch (err) {
      console.error(err);
      setErrormessage(err.message || "Failed to add product. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- Delete single product ---
  const openModal = useCallback((id) => {
    setSelectedProductId(id);
    setShowModal(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!selectedProductId) return;
    try {
      await deleteDoc(doc(db, "products", selectedProductId));
      setShowModal(false);
      setSelectedProductId(null);
      setMessage("Product deleted successfully!");
    } catch (err) {
      console.error(err);
      setErrormessage("Failed to delete product");
    }
  }, [selectedProductId]);

  // --- Delete all products ---
  const deleteAllProducts = useCallback(async () => {
    if (!products.length) return setMessage("No products to delete.");
    const confirmed = window.confirm("Are you sure you want to delete ALL products? This cannot be undone.");
    if (!confirmed) return;

    try {
      const batch = writeBatch(db);
      products.forEach((p) => batch.delete(doc(db, "products", p.id)));
      await batch.commit();
      setMessage("All products deleted");
    } catch (err) {
      console.error(err);
      setErrormessage("Failed to delete all products");
    }
  }, [products]);

  const formatPrice = useCallback((p) => (p != null ? Number(p).toFixed(2) : "0.00"), []);

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    return products.filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase())  
    );
  }, [products, searchQuery]);

  // Group products by category (filtered)
  const groupedProducts = useMemo(() => {
    return {
      men: filteredProducts.filter((p) => p.category === "men"),
      women: filteredProducts.filter((p) => p.category === "women"),
      kids: filteredProducts.filter((p) => p.category === "kids"),
    };
  }, [filteredProducts]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      {/* Toast Messages */}
      {(message || errormessage) && (
        <div className="fixed top-4 right-4 z-50">
          {message && (
            <div className="mb-2 p-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              {message}
            </div>
          )}
          {errormessage && (
            <div className="mb-2 p-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {errormessage}
            </div>
          )}
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-700 to-red-600 p-6">
            <h1 className="text-2xl md:text-3xl font-bold text-white">Product Management</h1>
            <p className="text-red-100 mt-1">Add and manage your inventory</p>
          </div>

          <div className="p-4 md:p-8">
            {/* Add Product Form */}
            <div className="mb-10">
              <h2 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200">Add New Product</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
                  >
                    <option value="">Select Category</option>
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                    <option value="kids">Kids</option>
                  </select>
                </div>

                {/* Sizes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Available Sizes</label>
                  <div className="flex flex-wrap gap-3">
                    {availableSizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        className={`px-4 py-2 rounded-lg border transition-colors ${
                          sizes.includes(size)
                            ? "bg-red-600 text-white border-red-600"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Product name */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <div className="relative">
                    <ShoppingBag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Enter product name"
                      value={name}
                      onFocus={handleFocus}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    placeholder="Enter product description"
                    value={description}
                    onFocus={handleFocus}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
                  />
                </div>

                {/* Price grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <div className="relative">
                      <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        placeholder="0"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* File upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
                  <label
                    htmlFor="fileInput"
                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <Upload className="w-10 h-10 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Click to upload images</span>
                    <span className="text-xs text-gray-500 mt-1">JPEG, PNG up to 5MB each</span>
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    id="fileInput"
                    onChange={handleImageChange}
                    multiple
                    className="hidden"
                  />
                </div>

                {/* Image Preview */}
                {previews.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image Previews</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {previews.map((src, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={src}
                            alt={`Preview ${idx}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeImageAt(idx)}
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-700 hover:bg-red-800 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding Product...
                    </>
                  ) : (
                    "Add Product"
                  )}
                </button>
              </form>
            </div>

            {/* Delete all button */}
            {products.length > 0 && (
              <div className="mb-8 flex justify-end">
                <button
                  onClick={deleteAllProducts}
                  className="flex items-center px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete All Products
                </button>
              </div>
            )}

            {/* Existing Products */}
            <div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Existing Products</h2>
                
                {/* Search Bar */}
                <div className="relative mt-4 md:mt-0 w-full md:w-80">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-10">
                  <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {searchQuery ? "No products found matching your search." : "No products found. Add some products to get started."}
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.entries(groupedProducts).map(([category, items]) => (
                    items.length > 0 && (
                      <div key={category}>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 capitalize">{category}</h3>
                        <div className="space-y-4">
                          {items.map((product) => (
                            <div key={product.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                              <div className="p-4">
                                <div className="flex flex-col sm:flex-row gap-4">
                                  {product.images && product.images[0] ? (
                                    <img
                                      src={product.images[0]}
                                      alt={product.name || product.description}
                                      className="w-full sm:w-32 h-32 object-cover rounded-lg"
                                    />
                                  ) : (
                                    <div className="w-full sm:w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                                      <ImageIcon className="w-12 h-12 text-gray-300" />
                                    </div>
                                  )}

                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-900 truncate">{product.name}</h4>
                                    <div className="mt-1 flex items-baseline">
                                      {product.price !== product.newPrice && (
                                        <span className="text-sm text-gray-500 line-through mr-2">
                                          ${formatPrice(product.price)}
                                        </span>
                                      )}
                                      <span className="text-lg font-bold text-red-700">
                                        ${formatPrice(product.newPrice || product.price)}
                                      </span>
                                    </div>
                                    <div className="mt-1 flex items-center text-sm text-gray-600">
                                      <Package className="w-4 h-4 mr-1" />
                                      <span>Qty: {product.quantity}</span>
                                    </div>
                                    {product.sizes?.length > 0 && (
                                      <div className="mt-1 flex flex-wrap gap-1">
                                        {product.sizes.map((size, idx) => (
                                          <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                            {size}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
                                <button
                                  onClick={() => openModal(product.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Delete Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
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
    </div>
  );
}