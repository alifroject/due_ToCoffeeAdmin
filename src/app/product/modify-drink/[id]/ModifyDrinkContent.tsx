"use client";

import { useState, useEffect, useRef } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { dbFire, storage } from "../../../firebase/firebase";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";



import { Montserrat } from 'next/font/google';



const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "700"] });

interface ModifyDrinkContentProps {
  drinkData: {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string | null;
    available?: boolean;
  };
}

export default function ModifyDrinkContent({ drinkData }: ModifyDrinkContentProps) {
  const [name, setName] = useState<string>(drinkData.name);
  const [description, setDescription] = useState<string>(drinkData.description);
  const [price, setPrice] = useState<number>(drinkData.price);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(drinkData.imageUrl);
  const [available, setAvailable] = useState<boolean>(drinkData.available ?? true);
  const [loading, setLoading] = useState<boolean>(false);



  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setName(drinkData.name);
    setDescription(drinkData.description);
    setPrice(drinkData.price);
    setImageUrl(drinkData.imageUrl);
    setAvailable(drinkData.available ?? true);
  }, [drinkData]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !price) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    let downloadUrl = imageUrl;

    try {
      if (image) {
        const fileName = `drink-images/${Date.now()}_${image.name}`;
        const storageRef = ref(storage, fileName);
        await uploadBytes(storageRef, image);
        downloadUrl = await getDownloadURL(storageRef);
        setImageUrl(downloadUrl);
      }

      const docRef = doc(dbFire, "drinks", drinkData.id);
      await updateDoc(docRef, {
        name,
        description,
        price,
        imageUrl: downloadUrl || "",
        available,
      });

      alert("Drink updated!");
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update drink");
    }

    setLoading(false);
  };

  // Cursor follow overlay text
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!overlayRef.current) return;
    const rect = overlayRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    overlayRef.current.style.setProperty("--x", `${x}px`);
    overlayRef.current.style.setProperty("--y", `${y}px`);
  };

  return (
    <form
      onSubmit={handleUpdate}
      className="mx-auto p-6 bg-white shadow-md rounded-2xl grid grid-cols-2 gap-6"
    >
      <h2 className={`${montserrat.className} text-2xl text-black  mb-6`}>
        Modify drink Product
      </h2>


      {/* IMAGE UPLOAD - spans 2 cols */}
      <label
        htmlFor="imageUpload"
        className="relative col-span-2 h-64 cursor-pointer border-2 border-dashed border-gray-300 rounded-lg overflow-hidden flex items-center justify-center"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          if (overlayRef.current) overlayRef.current.style.opacity = "0";
        }}
        onMouseEnter={() => {
          if (overlayRef.current) overlayRef.current.style.opacity = "1";
        }}
      >
        {(imagePreview || imageUrl) ? (
          <img
            src={imagePreview || imageUrl || ""}
            alt="Drink"
            className="object-contain w-[200px] h-[100px"  // Smaller image, centered by flex parent
            style={{ pointerEvents: "none" }} // So input clicks register on label
          />
        ) : (
          <span className="text-gray-400">No image available</span>
        )}

        {/* Overlay with cursor-follow text */}
        <div
          ref={overlayRef}
          className="pointer-events-none absolute inset-0 flex items-center justify-center text-white bg-black bg-opacity-40 opacity-0 transition-opacity duration-300"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            "--x": "50%",
            "--y": "50%",
          } as React.CSSProperties}
        >
          <span
            className="relative"
            style={{
              position: "absolute",
              left: "var(--x)",
              top: "var(--y)",
              transform: "translate(-50%, -50%)",
              whiteSpace: "nowrap",
              fontWeight: "600",
              userSelect: "none",
              pointerEvents: "none",
            }}
          >
            Click here to change
          </span>
        </div>

        <input
          id="imageUpload"
          type="file"
          accept="image/*"
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={handleImageUpload}
        />
      </label>


      {/* NAME */}
      <div>
        <label className="block text-sm text-gray-700 mb-1">Name</label>
        <div className="relative">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-black w-full p-3 border border-gray-300 rounded-lg pr-12 transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter name..."
          />
          {/* Icon right side */}
          {name.length > 0 ? (
            <FaCheckCircle
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 text-2xl cursor-pointer
                hover:text-green-600 hover:scale-110 transition-transform duration-300"
              title="Looks good!"
            />
          ) : (
            <FaTimesCircle
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 text-2xl cursor-pointer
                hover:text-red-600 hover:scale-110 transition-transform duration-300"
              title="Please fill this field"
            />
          )}
        </div>
      </div>

      {/* PRICE */}
      <div>
        <label className="block text-sm  text-gray-700 mb-1">Price (IDR)</label>
        <div className="relative">
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="text-black w-full p-3 border border-gray-300 rounded-lg pr-12 transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter price..."
          />
          {/* Icon right side */}
          {price > 0 ? (
            <FaCheckCircle
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 text-2xl cursor-pointer
                hover:text-green-600 hover:scale-110 transition-transform duration-300"
              title="Valid price"
            />
          ) : (
            <FaTimesCircle
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 text-2xl cursor-pointer
                hover:text-red-600 hover:scale-110 transition-transform duration-300"
              title="Price must be greater than zero"
            />
          )}
        </div>
      </div>

      <div className="flex flex-col justify-center space-y-4">
        <label className="block text-sm  text-gray-700 mb-2">Available</label>

        <div className="flex items-center  space-x-4">
          {/* Flip card toggle */}
          <div
            className="relative w-[200px] h-14 rounded-xl cursor-pointer [perspective:1000px]"
            onClick={() => setAvailable(!available)}
            role="button"
            aria-pressed={available}
            tabIndex={0}
            onKeyDown={e => { if (e.key === "Enter" || e.key === " ") setAvailable(!available); }}
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

      {/* DESCRIPTION textarea */}
      <div className="col-span-1 md:col-span-1">
        <label className="block text-sm  text-gray-700 mb-1">Description</label>
        <textarea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="text-black w-full p-2 border rounded-lg"
        />
      </div>

      {/* BUTTONS: Back and Save */}
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
          className={`w-full md:w-1/2 py-3 rounded-xl text-white font-semibold transition ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          {loading ? "Updating..." : "Save"}
        </button>
      </div>

    </form>
  );
}
