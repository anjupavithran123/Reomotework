import { useState, useEffect } from "react";

export default function ProfilepicUpload() {
  const [image, setImage] = useState(null);

  // Load saved image on component mount
  useEffect(() => {
    const savedImage = localStorage.getItem("profilePic");
    if (savedImage) {
      setImage(savedImage);
    }
  }, []);

  // Handle new image upload
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onloadend = () => {
        setImage(reader.result); 
        localStorage.setItem("profilePic", reader.result); // save in localStorage
      };

      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="">
      <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-400 mb-4">
        {image ? (
          <img src={image} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <p className="flex items-center justify-center h-full text-gray-500 text-sm">
            No Image
          </p>
        )}
      </div>

      <input type="file" accept="image/*" onChange={handleFileChange} />
    </div>
  );
}
