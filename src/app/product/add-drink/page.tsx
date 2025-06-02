"use client";
import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { dbFire, storage } from "../../firebase/firebase";



import { Montserrat } from 'next/font/google';



const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "700"] });

export default function Drinkform() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [available, setAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);


  // Tooltip state
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [hovering, setHovering] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

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
        const fileName = `drink-images/${Date.now()}_${image.name}`;
        const storageRef = ref(storage, fileName);
        await uploadBytes(storageRef, image);
        downloadUrl = await getDownloadURL(storageRef);
        setImageUrl(downloadUrl);
      }

      await addDoc(collection(dbFire, "drinks"), {
        name,
        description,
        price,
        available,
        imageUrl: downloadUrl || "",
        createdAt: serverTimestamp(),
      });

      alert("Drink added!");
      setName("");
      setDescription("");
      setPrice("");
      setAvailable(false);
      setImage(null);
      setImagePreview(null);
      setImageUrl(null);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload");
    }

    setLoading(false);
  };

  // Update tooltip position on mouse move inside drop box
  const handleMouseMove = (e: React.MouseEvent<HTMLLabelElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="m-6 mx-auto p-8 bg-white shadow-xl rounded-3xl space-y-8 font-sans"
    >
      <h2 className={`${montserrat.className} text-2xl text-black  mb-6`}>
        Add Drink Product
      </h2>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Left Column */}
        <div className="space-y-8">
          {/* Name */}
          <div>
            <label className="block text-base font-semibold text-gray-900 mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Cappuccino, Latte"
              className="mt-1 w-full p-4 rounded-2xl border border-gray-300 shadow-sm
               focus:border-blue-600 focus:ring-2 focus:ring-blue-300
               text-gray-900 placeholder-gray-400
               transition duration-300 ease-in-out
               hover:border-blue-400"
            />
          </div>

          {/* Price */}
          <div className="mt-6">
            <label className="block text-base font-semibold text-gray-900 mb-2">Price (IDR)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              placeholder="e.g. 30000"
              className="mt-1 w-full p-4 rounded-2xl border border-gray-300 shadow-sm
               focus:border-blue-600 focus:ring-2 focus:ring-blue-300
               text-gray-900 placeholder-gray-400
               transition duration-300 ease-in-out
               hover:border-blue-400"
            />
          </div>


          {/* Available checkbox with animated toggle button */}
          <div className="flex items-center gap-2 mt-8">
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

        {/* Right Column */}
        <div className="space-y-8">
          {/* Image Upload with tooltip and bigger hover */}
          <div>
            <label className="block  text-sm font-semibold text-gray-800 mb-2">Image</label>

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
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragging(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files[0];
                if (file) {
                  setImage(file);
                  const reader = new FileReader();
                  reader.onloadend = () => setImagePreview(reader.result as string);
                  reader.readAsDataURL(file);
                }
              }}
              className={`relative flex items-center justify-center cursor-pointer border-2 border-dashed rounded-2xl w-full h-[250px] transition-colors overflow-hidden group 
    ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-400 bg-gray-50 hover:border-black"}`}
            >

              <input
                type="file"
                id="imageInput"
                accept="image/*"
                onChange={handleImageUpload}
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

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">Description</label>
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Smooth espresso with steamed milk and creamy foam"
              className="mt-1 w-full p-3 rounded-xl border border-gray-300 focus:border-black focus:ring-1 focus:ring-black text-gray-900 resize-none transition"
            />
          </div>
        </div>
      </div>

      {/* Buttons side by side, close together */}
      <div className="flex justify-center gap-x-4 mt-8">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-8 py-3 border border-red-500 w-[300px] text-red-600 rounded-2xl hover:bg-red-100 font-semibold transition"
        >
          Back
        </button>

        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 bg-blue-600 text-white w-[300px] rounded-2xl font-semibold disabled:opacity-60 hover:bg-blue-700 transition"
        >
          {loading ? "Submitting..." : "Save"}
        </button>
      </div>

    </form>
  );
}
