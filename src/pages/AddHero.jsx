import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { 
  Upload, 
  Type, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Image as ImageIcon,
  Trash2,
  Search
} from "lucide-react";

const AddHero = () => {
  const [title, setTitle] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errormessage, setErrormessage] = useState("");
  const [heroes, setHeroes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedHeroId, setSelectedHeroId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const CLOUD_NAME = "dlrxomdfh";
  const UPLOAD_PRESET = "Shop-preset";

  // Real-time fetch heroes ordered by createdAt desc
  useEffect(() => {
    const q = query(collection(db, "heroes"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const heroList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setHeroes(heroList);
    });
    return () => unsubscribe();
  }, []);

  // Auto clear messages
  useEffect(() => {
    if (message || errormessage) {
      const timer = setTimeout(() => {
        setMessage("");
        setErrormessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, errormessage]);

  // Cleanup preview URLs
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // Close modal with ESC
  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && setShowModal(false);
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  // Filter heroes based on search query
  const filteredHeroes = useMemo(() => {
    if (!searchQuery.trim()) return heroes;
    return heroes.filter(hero => 
      hero.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hero.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [heroes, searchQuery]);

  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        setErrormessage("Only JPEG/PNG images are allowed.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrormessage("File size must be less than 5MB.");
        return;
      }
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !buttonText || !description || !image) {
      setErrormessage("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);

      // Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", image);
      formData.append("upload_preset", UPLOAD_PRESET);
      formData.append("cloud_name", CLOUD_NAME);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      if (!data.secure_url) {
        setErrormessage(data.error?.message || "Image upload failed");
        throw new Error(data.error?.message || "Image upload failed");
      }

      // Save to Firestore
      await addDoc(collection(db, "heroes"), {
        title,
        buttonText,
        description,
        image: data.secure_url,
        createdAt: new Date(),
      });

      // Reset
      setTitle("");
      setButtonText("");
      setDescription("");
      setImage(null);
      setPreview(null);
      setMessage("Hero added successfully!");
    } catch (error) {
      console.error(error);
      setErrormessage("Failed to add hero. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const openModal = useCallback((id) => {
    setSelectedHeroId(id);
    setShowModal(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    try {
      await deleteDoc(doc(db, "heroes", selectedHeroId));
      setShowModal(false);
      setSelectedHeroId(null);
      setMessage("Hero deleted successfully!");
    } catch (error) {
      console.error(error);
      setErrormessage("Failed to delete hero. Try again.");
    }
  }, [selectedHeroId]);

  const removeImage = useCallback(() => {
    setImage(null);
    setPreview(null);
  }, []);

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
          <div className="bg-gradient-to-r from-red-700 to-red-300 p-6">
            <h1 className="text-2xl md:text-3xl font-bold text-white">Hero Section Management</h1>
            <p className="text-red-100 mt-1">Create and manage your hero sections</p>
          </div>

          <div className="p-4 md:p-8">
            {/* Add Hero Form */}
            <div className="mb-10">
              <h2 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200">Add New Hero</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hero Title</label>
                  <div className="relative">
                    <Type className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Enter hero title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
                    />
                  </div>
                </div>

                {/* Button Text */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                  <div className="relative">
                    <Type className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Enter button text"
                      value={buttonText}
                      onChange={(e) => setButtonText(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    placeholder="Enter hero description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hero Image</label>
                  <label
                    htmlFor="fileInput"
                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <Upload className="w-10 h-10 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Click to upload image</span>
                    <span className="text-xs text-gray-500 mt-1">JPEG, PNG up to 5MB</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    id="fileInput"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>

                {/* Image Preview */}
                {preview && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image Preview</label>
                    <div className="relative inline-block">
                      <img
                        src={preview}
                        alt="Preview"
                        className="max-w-xs h-40 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
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
                      Adding Hero...
                    </>
                  ) : (
                    "Add Hero"
                  )}
                </button>
              </form>
            </div>

            {/* Existing Heroes */}
            <div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Existing Heroes</h2>
                
                {/* Search Bar */}
                <div className="relative mt-4 md:mt-0 w-full md:w-80">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search heroes..."
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

              {filteredHeroes.length === 0 ? (
                <div className="text-center py-10">
                  <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {searchQuery ? "No heroes found matching your search." : "No hero sections found. Add some heroes to get started."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredHeroes.map((hero) => (
                    <div key={hero.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      <div className="p-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex-shrink-0">
                            {hero.image ? (
                              <img
                                src={hero.image}
                                alt={hero.title}
                                className="w-full sm:w-32 h-32 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-full sm:w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                                <ImageIcon className="w-12 h-12 text-gray-300" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 truncate">Title: {hero.title}</h3>
                            <div className="mt-2 flex items-center text-sm text-gray-600">
                              <span className="truncate">Button: {hero.buttonText}</span>
                            </div>
                            <p className="mt-2 text-sm text-gray-600 line-clamp-2">Description: {hero.description}</p>
                          </div>
                        </div>
                      </div>
                      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
                        <button
                          onClick={() => openModal(hero.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
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
            <p className="text-gray-600 mb-6">Are you sure you want to delete this hero section? This action cannot be undone.</p>
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
};

export default AddHero;