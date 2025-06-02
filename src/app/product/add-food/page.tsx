"use client";
import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { dbFire, storage } from "../../firebase/firebase";
import { Montserrat } from 'next/font/google';



const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "700"] });
export default function Foodform() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [available, setAvailable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [hovering, setHovering] = useState(false);

  // ✅ Fix image upload from file input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      setImage(file); // Add this line
    }
  };




  const handleMouseMove = (e: React.MouseEvent<HTMLLabelElement>) => {
    setTooltipPos({ x: e.clientX, y: e.clientY });
  };

  const handleImageUpload = (file: File) => {
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageUpload(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !price) {
      alert("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      let downloadUrl: string | null = null;

      if (image) {
        const fileName = `food-images/${Date.now()}_${image.name}`;
        const storageRef = ref(storage, fileName);
        await uploadBytes(storageRef, image);
        downloadUrl = await getDownloadURL(storageRef);
        setImageUrl(downloadUrl);
      }

      await addDoc(collection(dbFire, "foods"), {
        name,
        description,
        price,
        imageUrl: downloadUrl || "",
        available,
        createdAt: serverTimestamp(),
      });

      alert("Food added successfully!");
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
      className="m-20 mx-auto p-6 bg-white shadow-md rounded-2xl space-y-6"
    >
      <h2 className={`${montserrat.className} text-2xl text-black  mb-6`}>
        Add Food Product
      </h2>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT COLUMN */}
        <div className="space-y-8">
          {/* Name */}
          <div>
            <label className="block text-base  text-gray-900 mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Nasi Goreng, Burger"
              className="mt-1 w-full p-4 rounded-2xl border border-gray-300 shadow-sm
        focus:border-blue-600 focus:ring-2 focus:ring-blue-300
        text-gray-900 placeholder-gray-400
        transition duration-300 ease-in-out
        hover:border-blue-400"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-base text-gray-900 mb-2">Price (IDR)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              placeholder="e.g. 35000"
              className="mt-1 w-full p-4 rounded-2xl border border-gray-300 shadow-sm
        focus:border-blue-600 focus:ring-2 focus:ring-blue-300
        text-gray-900 placeholder-gray-400
        transition duration-300 ease-in-out
        hover:border-blue-400"
            />
          </div>

          {/* Available Toggle */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAvailable((prev) => !prev)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-lg border transition duration-300 select-none
        ${available
                  ? "bg-green-100 border-green-500"
                  : "bg-gray-100 border-gray-300 hover:bg-gray-200"}
        hover:scale-105
        focus:outline-none focus:ring-2 focus:ring-green-400`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300
          ${available ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}
              >
                {available && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-gray-700 font-medium">
                {available ? "Available" : "Unavailable"}
              </span>
            </button>
          </div>
        </div>


        {/* RIGHT COLUMN */}
        {/* RIGHT COLUMN */}
        <div className="space-y-8">
          {/* IMAGE UPLOAD with tooltip and hover animation */}
          <div>
            <label className="block text-sm  text-gray-800 mb-2">Image</label>

            <label
              htmlFor="imageInput"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => {
                setHovering(false);
                setTooltipPos(null);
              }}

              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setDragActive(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                const file = e.dataTransfer.files[0];
                if (file) {
                  setImage(file);
                  const reader = new FileReader();
                  reader.onloadend = () => setImagePreview(reader.result as string);
                  reader.readAsDataURL(file);
                }
              }}

              className={`relative flex items-center justify-center cursor-pointer border-2 border-dashed rounded-2xl w-full h-[250px] bg-gray-50 hover:border-black transition-colors overflow-hidden group
  ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-400"}`}
            >

              <input
                type="file"
                id="imageInput"
                accept="image/*"
                onChange={handleFileChange} // assuming handleFileChange is your handler
                className="hidden"
              />

              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-2xl transform transition-transform duration-300 group-hover:scale-110 shadow-lg"
                />
              ) : (
                <span className="text-gray-500 text-center px-4 select-none">
                  Drop or click to upload
                </span>
              )}

              {hovering && tooltipPos && (
                <div
                  className="pointer-events-none absolute px-3 py-1 bg-black text-white text-xs rounded-md whitespace-nowrap select-none opacity-90"
                  style={{
                    top: tooltipPos.y + 15,
                    left: tooltipPos.x + 15,
                    transform: "translate(-50%, 0)",
                    zIndex: 50,
                  }}
                >
                  Click here to add
                </div>
              )}
            </label>

            {imageUrl && (
              <a
                href={imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-blue-600 underline mt-3 hover:text-blue-800 transition"
              >
                View Uploaded Image
              </a>
            )}
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-sm  text-gray-800 mb-1">Description</label>
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Delicious fried rice with egg and vegetables"
              className="mt-1 w-full p-3 rounded-xl border border-gray-300 focus:border-black focus:ring-1 focus:ring-black text-gray-900 resize-none transition"
            />
          </div>
        </div>


      </div>

      {/* BUTTONS */}
      <div className="col-span-2 flex flex-col md:flex-row justify-center gap-4 pt-6">
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
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
