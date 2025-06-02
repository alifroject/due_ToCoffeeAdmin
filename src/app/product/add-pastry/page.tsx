"use client";
import { useState, useRef } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { dbFire, storage } from "../../firebase/firebase";
import { CheckCircle } from "lucide-react";
import { Montserrat } from 'next/font/google';



const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "700"] });

export default function PastryForm() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [available, setAvailable] = useState(true);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHover, setIsHover] = useState(false);


  const handleImageUpload = (file: File) => {
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };



  // File input change event
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  };

  // Drag and drop event
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageUpload(file);
  };

  // Submit handler uploads image and saves pastry data
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !price) {
      alert("Please fill in all fields except image (optional)");
      return;
    }

    setLoading(true);

    try {
      let downloadUrl: string | null = null;

      if (image) {
        const fileName = `pastry-images/${Date.now()}_${image.name}`;
        const storageRef = ref(storage, fileName);
        await uploadBytes(storageRef, image);
        downloadUrl = await getDownloadURL(storageRef);
        setImageUrl(downloadUrl);
      }

      await addDoc(collection(dbFire, "pastries"), {
        name,
        description,
        price,
        available,
        imageUrl: downloadUrl || "",
        createdAt: serverTimestamp(),
      });

      alert("Pastry added!");
      setName("");
      setDescription("");
      setPrice("");
      setAvailable(true);
      setImage(null);
      setImagePreview(null);
      setImageUrl(null);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload");
    }

    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto m-20 bg-white shadow-md rounded-2xl p-6 space-y-6"
    >
      <h2 className={`${montserrat.className} text-2xl text-black  mb-6`}>
        Add Pastry Product
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder=" "
              className="peer w-full p-4 pt-6 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black placeholder-transparent transition duration-300"
            />
            <label className="absolute left-4 top-2 text-sm text-gray-500 transition-all
      peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
      peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-500">
              Name
            </label>
          </div>

          <div className="relative">
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              placeholder=" "
              className="peer w-full p-4 pt-6 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black placeholder-transparent transition duration-300"
            />
            <label className="absolute left-4 top-2 text-sm text-gray-500 transition-all
      peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
      peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-500">
              Price (IDR)
            </label>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <label className="text-sm  text-gray-700">Available?</label>

            <button
              type="button"
              onClick={() => setAvailable((prev) => !prev)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-lg border transition duration-300 ${available ? "bg-green-100 border-green-500" : "bg-gray-100 border-gray-300"
                }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${available ? "bg-green-500 animate-pulse" : "bg-gray-400"
                  }`}
              >
                {available && <CheckCircle size={16} className="text-white" />}
              </div>
              <span className="text-sm text-gray-700 font-medium">
                {available ? "Available" : "Unavailable"}
              </span>
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div>
          <label className="block  text-sm text-gray-700 mb-1">Upload Image</label>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsHover(true);
            }}
            onDragLeave={() => setIsHover(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsHover(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleImageUpload(file);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full h-40 border-2 border-dashed rounded-xl flex items-center justify-center text-gray-500 cursor-pointer transition-colors duration-300 ${isHover ? "border-blue-400 bg-blue-50" : "border-gray-300"
              }`}
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <p className="text-sm text-gray-500">Drag & Drop or Click to Upload</p>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
              }}
              className="hidden"
            />
          </div>
          
          <div className="relative mt-5">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder=" "
              rows={4}
              className="peer w-full p-4 pt-6 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black placeholder-transparent transition duration-300 resize-none"
            />
            <label className="absolute left-4 top-2 text-sm text-gray-500 transition-all
    peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
    peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-500">
              Description
            </label>
          </div>

        </div>


      </div>

      {/* Buttons */}
      <div className="flex flex-col md:flex-row gap-4 w-full pt-4">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => window.history.back()}
          className="w-full md:w-1/2 py-3 rounded-xl font-semibold text-red-600 border border-red-500 bg-white hover:bg-gradient-to-r hover:from-red-100 hover:to-pink-100 transition"
        >
          Back
        </button>

        {/* Save Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full md:w-1/2 py-3 rounded-xl text-white font-semibold transition ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>


    </form>
  );
}
