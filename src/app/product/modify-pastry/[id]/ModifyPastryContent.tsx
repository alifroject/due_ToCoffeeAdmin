"use client";

import { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { dbFire, storage } from "../../../firebase/firebase";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

interface ModifyPastryContentProps {
  pastryData: {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string | null;
    available?: boolean;
  };
}

export default function ModifyPastryContent({ pastryData }: ModifyPastryContentProps) {
  const [name, setName] = useState(pastryData.name);
  const [description, setDescription] = useState(pastryData.description);
  const [price, setPrice] = useState(pastryData.price);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(pastryData.imageUrl);
  const [loading, setLoading] = useState(false);
  const [available, setAvailable] = useState(pastryData.available ?? true);

  useEffect(() => {
    console.log("Received pastryData:", pastryData); // Cek id di sini
    setName(pastryData.name);
    setDescription(pastryData.description);
    setPrice(pastryData.price);
    setImageUrl(pastryData.imageUrl);
    setAvailable(pastryData.available ?? true);
    setImage(null);
    setImagePreview(null);
  }, [pastryData]);


  const setFileAndPreview = (file: File) => {
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFileAndPreview(file);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !description || price === null || isNaN(price)) {
      alert("Please fill in all fields correctly.");
      return;
    }

    if (!pastryData?.id) {
      alert("Pastry ID is missing. Cannot update.");
      setLoading(false);
      return;
    }

    setLoading(true);
    let downloadUrl = imageUrl;

    try {
      if (image) {
        const fileName = `pastry-images/${Date.now()}_${image.name}`;
        const storageRef = ref(storage, fileName);
        await uploadBytes(storageRef, image);
        downloadUrl = await getDownloadURL(storageRef);
        setImageUrl(downloadUrl);
      }

      const docRef = doc(dbFire, "pastries", pastryData.id);
      await updateDoc(docRef, {
        name,
        description,
        price,
        imageUrl: downloadUrl || "",
        available,
      });

      alert("Pastry updated!");
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update pastry");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleUpdate} className="mx-auto grid grid-cols-2 gap-4 p-6 bg-white shadow-lg rounded-2xl">
      {/* Row 1: Image Upload Full Width */}
      <div className="col-span-2 flex flex-col items-center gap-2 border border-dashed border-blue-300 rounded-xl p-4 hover:shadow-lg transition duration-200">
        <label className="block text-sm font-semibold text-gray-700">Change Image</label>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        {imagePreview ? (
          <img src={imagePreview} alt="New Preview" className="w-40 h-40 object-cover rounded-lg border" />
        ) : imageUrl ? (
          <img src={imageUrl} alt="Current" className="w-40 h-40 object-cover rounded-lg border" />
        ) : (
          <div className="text-sm text-gray-500">No image selected</div>
        )}
      </div>

      <div className="relative transition duration-300">
        <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter name..."
          className="mt-1 text-black w-full p-3 border border-gray-300 rounded-xl pr-12 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-shadow"
        />
        {name.length > 0 ? (
          <FaCheckCircle
            className="absolute right-3 top-[50px] transform -translate-y-1/2 text-green-500 text-2xl cursor-pointer
              hover:text-green-600 hover:scale-110 transition-transform duration-300"
            title="Looks good!"
          />
        ) : (
          <FaTimesCircle
            className="absolute right-3 top-[50px] transform -translate-y-1/2 text-red-500 text-2xl cursor-pointer
              hover:text-red-600 hover:scale-110 transition-transform duration-300"
            title="Please fill this field"
          />
        )}
      </div>

      {/* PRICE */}
      <div className="relative transition duration-300">
        <label className="block text-sm font-semibold text-gray-700 mb-1">Price (IDR)</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          placeholder="Enter price..."
          className="mt-1 text-black w-full p-3 border border-gray-300 rounded-xl pr-12 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-shadow"
        />
        {price > 0 ? (
          <FaCheckCircle
            className="absolute right-3 top-[50px] transform -translate-y-1/2 text-green-500 text-2xl cursor-pointer
              hover:text-green-600 hover:scale-110 transition-transform duration-300"
            title="Valid price"
          />
        ) : (
          <FaTimesCircle
            className="absolute right-3 top-[50px] transform -translate-y-1/2 text-red-500 text-2xl cursor-pointer
              hover:text-red-600 hover:scale-110 transition-transform duration-300"
            title="Price must be greater than zero"
          />
        )}
      </div>

      {/* Row 3: Availability and Description */}
      {/* AVAILABILITY TOGGLE */}
      <div className="flex flex-col justify-center space-y-4">
        <label className="block text-sm text-gray-700 mb-2">Available</label>

        <div className="flex items-center space-x-4">
          {/* Flip card toggle */}
          <div
            className="relative w-[200px] h-14 rounded-xl cursor-pointer [perspective:1000px]"
            onClick={() => setAvailable(!available)}
            role="button"
            aria-pressed={available}
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === "Enter" || e.key === " ") setAvailable(!available);
            }}
          >
            <div
              className={`transition-transform duration-500 w-full h-full relative rounded-xl transform-style-preserve-3d ${available ? "rotate-x-0" : "rotate-x-180"}`}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Front: Available */}
              <div
                className="absolute inset-0 bg-green-200 flex items-center justify-center rounded-xl"
                style={{ backfaceVisibility: "hidden" }}
              >
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

          {/* Label */}
          <span
            className={`text-gray-700 font-medium select-none ${available ? "animate-pulse text-green-600" : "text-red-600"}`}
          >
            {available ? "Available" : "Not Available"}
          </span>
        </div>
      </div>

      {/* DESCRIPTION TEXTAREA */}
      <div className="col-span-1">
        <label className="block text-sm text-gray-700 mb-1">Description</label>
        <textarea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add some description..."
          className="text-black w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 transition-shadow"
        />
      </div>
      {/* Row 4: Back and Save Buttons */}
      <div className="col-span-2 flex flex-col md:flex-row justify-center gap-4 mt-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="w-full md:w-1/2 py-3 rounded-xl font-semibold text-red-600 border border-red-500 bg-white hover:bg-gradient-to-r hover:from-red-100 hover:to-pink-100 transition"
        >
          Back
        </button>

        <button
          type="submit"
          disabled={loading}
          className={`w-full md:w-1/2 py-3 rounded-xl text-white font-semibold transition ${loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          {loading ? "Updating..." : "Save"}
        </button>
      </div>

    </form>
  );
}
