"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { dbFire } from "../../app/firebase/firebase";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Props {
  onClose: () => void;
}

export default function DiscountAddForm({ onClose }: Props) {
  const [formData, setFormData] = useState({
    name: "",
    percentage: 0,
    durationFrom: new Date(),
    durationTo: new Date(),
    comment: "",
    image: "",
    minimumPurchase: 0,

  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === "percentage" || name === "minimumPurchase"
          ? Number(value)
          : value,
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(dbFire, "discount"), {
        ...formData,
        duration: {
          from: formData.durationFrom,
          to: formData.durationTo,
        },
        createdAt: new Date(),
      });
      onClose();
    } catch (error) {
      console.error("Error adding discount:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg p-6 rounded-2xl shadow-xl relative animate-fadeIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
          Add New Discount
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Summer Sale"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              required
            />
          </div>

          {/* Percentage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Percentage (%)
            </label>
            <input
              type="number"
              name="percentage"
              placeholder="e.g. 25"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              required
            />
          </div>

          {/* Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration From
              </label>
              <DatePicker
                selected={formData.durationFrom}
                onChange={(date) =>
                  date && setFormData((prev) => ({ ...prev, durationFrom: date }))
                }
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration To
              </label>
              <DatePicker
                selected={formData.durationTo}
                onChange={(date) =>
                  date && setFormData((prev) => ({ ...prev, durationTo: date }))
                }
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Minimum Purchase */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Purchase
            </label>
            <input
              type="number"
              name="minimumPurchase"
              placeholder="e.g. 50"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
            />
          </div>

          {/* Image Upload */}
          {/* Image Upload with Drag & Drop + Click */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Banner/Image
            </label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setFormData((prev) => ({ ...prev, image: reader.result as string }));
                  };
                  reader.readAsDataURL(file);
                }
              }}
              onClick={() => {
                const input = document.getElementById("imageInput");
                input?.click();
              }}
              className="w-full border-2 border-dashed border-blue-300 bg-blue-50 rounded-md cursor-pointer text-center p-6 hover:bg-blue-100 transition"
            >
              <p className="text-gray-600">Click or Drag & Drop to upload image</p>
              <input
                id="imageInput"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {formData.image && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-1">Preview:</p>
                <img
                  src={formData.image}
                  alt="Uploaded"
                  className="w-full h-auto max-h-64 object-contain rounded-md border"
                />
              </div>
            )}
          </div>


          {/* Comment / Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes or Terms
            </label>
            <textarea
              name="comment"
              rows={3}
              placeholder="Internal notes or public terms"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium transition"
          >
            Submit Discount
          </button>
        </form>
      </div>
    </div>
  );
}
