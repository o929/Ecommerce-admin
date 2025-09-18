import React, { useState, useEffect } from "react";
import { collection, addDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { UploadCloud, Type } from "lucide-react";
import "./AddHero.css";

const AddHero = () => {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errormessage, setErrormessage] = useState("");
  const [heroes, setHeroes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedHeroId, setSelectedHeroId] = useState(null);

  const CLOUD_NAME = "dlrxomdfh"; // replace with your Cloudinary cloud name
  const UPLOAD_PRESET = "Shop-preset"; // replace with your preset

  // Real-time fetch heroes
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "heroes"), (snapshot) => {
      const heroList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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

  const handleImageChange = (e) => {
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !subtitle || !description || !image) {
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

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!data.secure_url) throw new Error("Image upload failed");
      const imageUrl = data.secure_url;

      // Save to Firestore
      await addDoc(collection(db, "heroes"), {
        title,
        subtitle,
        description,
        image: imageUrl,
        createdAt: new Date(),
      });

      // Reset
      setTitle("");
      setSubtitle("");
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

  const openModal = (id) => {
    setSelectedHeroId(id);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteDoc(doc(db, "heroes", selectedHeroId));
      setShowModal(false);
      setSelectedHeroId(null);
    } catch (error) {
      console.error(error);
      alert("Failed to delete hero");
    }
  };

  return (
    <div className="add-hero-container">
      <h2>Add Hero Section</h2>

      <div className="message-box">
        {message && <p className="success">{message}</p>}
        {errormessage && <p className="error">{errormessage}</p>}
      </div>

      <form onSubmit={handleSubmit} className="form">
      
        <div className="input-wrapper">
          <Type size={18} />
          <input
            type="text"
            placeholder="Hero Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="input-wrapper">
          <Type size={18} />
          <input
            type="text"
            placeholder="Buttun title"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
          />
        </div>

        <textarea
          placeholder="Hero Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="input-wrapper file-upload">
          <input
            type="file"
            accept="image/*"
            id="fileInput"
            onChange={handleImageChange}
            style={{ display: "none" }}
          />
          <button
            type="button"
            className="upload-btn"
            onClick={() => document.getElementById("fileInput").click()}
          >
            <UploadCloud size={20} /> Upload Image
          </button>
        </div>

        {preview && (
          <div className="preview-box">
            <img src={preview} alt="Preview" className="preview-img" />
            <button type="button" onClick={() => { setImage(null); setPreview(null); }}>
              Remove
            </button>
          </div>
        )}

        <button className="add-btn" type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Hero"}
        </button>
      </form>

      <h2>Existing Heroes</h2>
      {heroes.length === 0 ? (
        <p>No hero sections found.</p>
      ) : (
        <ul className="hero-list">
          {heroes.map((hero) => (
            <li key={hero.id} className="hero-item">
              <img src={hero.image} alt={hero.title} className="hero-img" />
              <div className="hero-info">
                <h3>Title: <strong>{hero.title}</strong> </h3>
                <p>Button: <strong>{hero.subtitle}</strong> </p>
                <p>Description: <strong>{hero.description}</strong> </p>
              </div>
              <button className="delete-btn" onClick={() => openModal(hero.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <p>Are you sure you want to delete this hero?</p>
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

export default AddHero;
