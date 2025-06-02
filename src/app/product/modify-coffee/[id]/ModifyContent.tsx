"use client";

import { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { dbFire, storage } from "../../../firebase/firebase";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import Image from "next/image";



import { Montserrat } from 'next/font/google';

interface ModifyContentProps {
  coffeeData: {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string | null;
    available?: boolean;

  };
}



const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "700"] });


export default function ModifyContent({ coffeeData }: ModifyContentProps) {
  const [name, setName] = useState(coffeeData.name);
  const [description, setDescription] = useState(coffeeData.description);

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState(coffeeData.imageUrl);
  const [loading, setLoading] = useState(false);

  const [avail, setAvail] = useState(coffeeData.available ?? true);
  const [dragActive, setDragActive] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [showHoverText, setShowHoverText] = useState(false);
  const [price, setPrice] = useState(coffeeData.price);





  useEffect(() => {
    console.log("Received pastryData:", coffeeData);
    setName(coffeeData.name);
    setDescription(coffeeData.description);
    setPrice(coffeeData.price);

    setImageUrl(coffeeData.imageUrl);

    setAvail(coffeeData.available ?? true);
    setImagePreview(null);
    setImage(null);

  }, [coffeeData]);

  const setFileAndPreview = (file: File) => {
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description) return alert("Please fill in all fields");
    setLoading(true);

    let downloadUrl = imageUrl;

    try {
      if (image) {
        const fileName = `coffee-images/${Date.now()}_${image.name}`;
        const storageRef = ref(storage, fileName);
        await uploadBytes(storageRef, image);
        downloadUrl = await getDownloadURL(storageRef);
        setImageUrl(downloadUrl);
      }

      const docRef = doc(dbFire, "coffees", coffeeData.id);
      await updateDoc(docRef, {
        name,
        description,
        imageUrl: downloadUrl || "",
        available: avail,
        price,
      });

      alert("Coffee updated");
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update coffee");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleUpdate} className="mx-auto p-6 bg-white shadow-md rounded-2xl">
      <h2 className={`${montserrat.className} text-2xl text-black mb-6`}>
        Modify Coffee Product
      </h2>

      {/* Image upload - tetap full width */}
      <div
        className={`relative border-dashed border-2 rounded-xl p-5 mb-6 text-center cursor-pointer transition ${dragActive ? "border-blue-600 bg-blue-50" : "border-gray-300"}`}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          const file = e.dataTransfer.files?.[0];
          if (file?.type.startsWith("image/")) setFileAndPreview(file);
        }}
        onMouseEnter={() => setShowHoverText(true)}
        onMouseLeave={() => setShowHoverText(false)}
        onMouseMove={(e) => setCursorPos({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY })}
      >
        <label htmlFor="file-upload" className="block text-sm font-semibold text-gray-700 cursor-pointer">
          Drag & Drop image here or click to select file
        </label>
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file?.type.startsWith("image/")) setFileAndPreview(file);
          }}
          className="hidden"
        />

        {showHoverText && (
          <div
            className="absolute text-xs text-white bg-blue-600 px-2 py-1 rounded shadow pointer-events-none"
            style={{ top: `${cursorPos.y}px`, left: `${cursorPos.x}px`, transform: "translate(-50%, -100%)", zIndex: 50 }}
          >
            Click here to change
          </div>
        )}

        {imagePreview ? (
          <img src={imagePreview} alt="New Preview" className="mx-auto mt-4 w-40 h-40 object-cover rounded-lg border" />
        ) : imageUrl ? (
          <img src={imageUrl} alt="Current" className="mx-auto mt-4 w-40 h-40 object-cover rounded-lg border" />
        ) : (
          <p className="text-gray-400 mt-3">No image selected</p>
        )}
      </div>

      {/* Name dan Price dalam 2 kolom 1 baris */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name tetap */}
        <div className="relative transition duration-300">
          <label className="block text-sm text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name..."
            className="mt-1 text-black w-full p-3 border border-gray-300 rounded-xl pr-12 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-shadow"
          />
          {/* Icon right side */}
          {name.length > 0 ? (
            <FaCheckCircle
              className="absolute right-3 top-[50px] transform -translate-y-1/2 text-green-500 text-2xl cursor-pointer hover:text-green-600 hover:scale-110 transition-transform duration-300"
              title="Looks good!"
            />
          ) : (
            <FaTimesCircle
              className="absolute right-3 top-[50px] transform -translate-y-1/2 text-red-500 text-2xl cursor-pointer hover:text-red-600 hover:scale-110 transition-transform duration-300"
              title="Please fill this field"
            />
          )}
        </div>

        {/* Sizes & Prices tetap */}
        {/* Replace Sizes & Prices with just Price input */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">Price</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="p-2 border rounded w-full text-black"
            min={0}
          />
        </div>


        {/* Description dan Availability satu baris dua kolom */}
        <div className="md:col-span-2 grid grid-cols-2 gap-6 items-center">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 text-black w-full p-3 border border-gray-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Availability</label>
            <div
              className="relative w-full h-14 rounded-xl cursor-pointer [perspective:1000px]"
              onClick={() => setAvail(!avail)}
            >
              <div
                className={`transition-transform duration-500 w-full h-full relative rounded-xl transform-style-preserve-3d ${avail ? "rotate-x-0" : "rotate-x-180"
                  }`}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Front: Available */}
                <div className="absolute inset-0 bg-green-200 flex items-center justify-center rounded-xl" style={{ backfaceVisibility: "hidden" }}>
                  <FaCheckCircle className="text-green-700 text-2xl" />
                </div>

                {/* Back: Not Available */}
                <div
                  className="absolute inset-0 bg-red-200 flex items-center justify-center rounded-xl transform rotate-x-180"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <FaTimesCircle className="text-red-700 text-2xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Buttons */}
      <div className="flex flex-col md:flex-row gap-4 mt-10">
        <button
          type="submit"
          disabled={loading}
          className={`w-full md:w-1/2 py-3 rounded-xl text-white font-semibold transition ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          {loading ? "Updating..." : "Save Changes"}
        </button>

        <button
          type="button"
          onClick={() => window.history.back()}
          className="w-full md:w-1/2 py-3 rounded-xl font-semibold text-red-600 border border-red-500 bg-white hover:bg-gradient-to-r hover:from-red-100 hover:to-pink-100 transition"
        >
          Back
        </button>
      </div>
    </form>

  );
}
