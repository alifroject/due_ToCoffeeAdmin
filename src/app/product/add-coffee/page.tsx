"use client";
import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { dbFire, storage } from "../../firebase/firebase";
import { CheckCircle } from "lucide-react";



import { Montserrat } from 'next/font/google';



const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "700"] });

export default function CoffeeForm() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");


  const [available, setAvailable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const [price, setPrice] = useState<number | "">("");


  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      let downloadUrl: string | null = null;

      if (image) {
        const fileName = `coffee-images/${Date.now()}_${image.name}`;
        const storageRef = ref(storage, fileName);
        await uploadBytes(storageRef, image);
        downloadUrl = await getDownloadURL(storageRef);
        setImageUrl(downloadUrl);
      }

      await addDoc(collection(dbFire, "coffees"), {
        name,
        description,
        price,
        available,
        imageUrl: downloadUrl || "",
        createdAt: serverTimestamp(),
      });

      alert("✅ Coffee added successfully!");
      setName("");
      setDescription("");
      setPrice("");


      setAvailable(true);
      setImage(null);
      setImagePreview(null);
      setImageUrl(null);
    } catch (error) {
      console.error("Upload error:", error);
      alert("❌ Failed to upload. Try again.");
    }

    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="min-h-screen w-full mx-auto m-8 p-6 bg-white rounded-2xl shadow space-y-6"
    >
      <h2 className={`${montserrat.className} text-2xl text-black mb-6`}>
        Add Coffee Product
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Baris 1 & 2: kiri */}
        <div className="space-y-4">
          {/* Name */}
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder=" "
              className="peer w-full p-4 pt-6 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black placeholder-transparent transition duration-300"
            />
            <label className="absolute left-4 top-2 text-sm text-gray-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-500">
              Name
            </label>
          </div>

          {/* Sizes & Prices */}
          <div>
            <label className="block text-sm font-medium mt-10 text-gray-700 mb-2">
              Sizes & Prices
            </label>
            {/* Price */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (IDR)
              </label>
              <input
                type="number"
                min={0}
                placeholder="Enter price"
                value={price}
                onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full p-3 rounded-lg border border-gray-300 text-black"
              />
            </div>

          </div>

          {/* Availability */}
          <div className="flex items-center gap-2 mt-4">
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

        {/* Baris 1 & 2: kanan */}
        <div className="space-y-4">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Image</label>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setHoverPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
              }}
              onMouseLeave={() => setHoverPos(null)}
              onClick={() => document.getElementById("imageInput")?.click()}
              className="relative flex flex-col items-center justify-center w-full h-[300px] border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-400 transition text-gray-500 bg-gray-50 overflow-hidden"
            >
              <input
                id="imageInput"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              {!imagePreview ? (
                <div className="flex flex-col items-center text-gray-500">
                  <div className="text-5xl mb-2">📂</div>
                  <div className="text-lg font-medium">Click here to drop an image</div>
                </div>
              ) : (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-lg"
                />
              )}

              {/* Floating image preview on hover */}
              {imagePreview && hoverPos && (
                <div
                  className="absolute w-50 h-10 flex items-center justify-center rounded shadow-lg border bg-white text-gray-700 text-center text-sm font-medium pointer-events-none transition-all duration-150 ease-out"
                  style={{
                    top: hoverPos.y + 10,
                    left: hoverPos.x + 10,
                    transform: "translate(-50%, -50%)",
                    zIndex: 50,
                  }}
                >
                  Click here to change an image
                </div>
              )}
            </div>

            {imageUrl && (
              <a
                href={imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-2 text-blue-500 underline"
              >
                View Uploaded Image
              </a>
            )}
          </div>
        </div>

        {/* Baris 3: Description full width */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Smooth espresso with steamed milk"
            className="w-full p-2 rounded-lg border focus:ring-2 focus:ring-blue-400 outline-none text-black"
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 w-full mt-6">
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
          {loading ? "Submitting..." : "Save"}
        </button>
      </div>
    </form>

  );
}
