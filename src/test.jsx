import React, { useState } from 'react';
import axios from 'axios';

const ImageUploader = () => {
  const [imageURL, setImageURL] = useState('');

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'YOUR_UPLOAD_PRESET');

    try {
      const res = await axios.post('https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload', formData);
      setImageURL(res.data.secure_url);
      console.log("Uploaded image:", res.data.secure_url);
    } catch (err) {
      console.error("Upload error", err);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleUpload} />
      {imageURL && <img src={imageURL} alt="Uploaded" style={{ width: 200 }} />}
    </div>
  );
};

export default ImageUploader;
