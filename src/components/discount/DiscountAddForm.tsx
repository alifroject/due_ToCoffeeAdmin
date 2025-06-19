"use client";

import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { addDoc, collection, getDocs, query } from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
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


  const [uploading, setUploading] = useState(false);
  const [discountType, setDiscountType] = useState("");
  const [selectedItem, setSelectedItem] = useState(""); // collection/category
  const [selectedProduct, setSelectedProduct] = useState(""); // specific product
  const [productOptions, setProductOptions] = useState<string[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!selectedItem) return;

      try {
        const q = query(collection(dbFire, selectedItem)); // dynamic collection
        const snapshot = await getDocs(q);
        const products = snapshot.docs.map((doc) => doc.data().name); // assuming `name` field
        setProductOptions(products);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    fetchProducts();
  }, [selectedItem]);

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const storage = getStorage();
    const storageRef = ref(storage, `discount-images/${Date.now()}-${file.name}`);

    try {
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      setFormData((prev) => ({ ...prev, image: downloadURL }));
    } catch (error) {
      console.error("Image upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(dbFire, "discount"), {
        ...formData,
        type: discountType,
        bogoItem: selectedItem,
        bogoProduct: selectedProduct,
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
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white w-full max-w-5xl max-h-[90vh] p-8 rounded-2xl shadow-2xl relative animate-fadeIn overflow-hidden">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition"
          >
            <X className="w-6 h-6" />
          </button>

          <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">
            Add New Discount
          </h2>

          <div className="overflow-y-auto max-h-[70vh] pr-2">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Discount Name */}
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Summer Sale"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Discount Type */}
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                <select
                  name="discountType"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="daily">Daily Discount</option>
                  <option value="bogo">Buy One Get One</option>
                  <option value="event">Event</option>
                </select>
              </div>

              {/* Conditional Fields for BOGO */}
              {discountType === "bogo" && (
                <>
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Collection</label>
                    <select
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={selectedItem}
                      onChange={(e) => {
                        setSelectedItem(e.target.value);
                        setSelectedProduct("");
                      }}
                      required
                    >
                      <option value="">Choose Collection</option>
                      <option value="coffees">Coffees</option>
                      <option value="drinks">Drinks</option>
                      <option value="pastries">Pastries</option>
                      <option value="foods">Foods</option>
                    </select>
                  </div>

                  {selectedItem && (
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Product from {selectedItem.charAt(0).toUpperCase() + selectedItem.slice(1)}
                      </label>
                      <select
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                        required
                      >
                        <option value="">Choose Product</option>
                        {productOptions.map((product) => (
                          <option key={product} value={product}>
                            {product}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}

              {/* Percentage */}
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Percentage (%)</label>
                <input
                  type="number"
                  name="percentage"
                  placeholder="e.g. 25"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Minimum Purchase */}
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Purchase</label>
                <input
                  type="number"
                  name="minimumPurchase"
                  placeholder="e.g. 50"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={handleChange}
                />
              </div>

              {/* Duration From */}
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration From</label>
                <DatePicker
                  selected={formData.durationFrom}
                  onChange={(date) =>
                    date && setFormData((prev) => ({ ...prev, durationFrom: date }))
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Duration To */}
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration To</label>
                <DatePicker
                  selected={formData.durationTo}
                  onChange={(date) =>
                    date && setFormData((prev) => ({ ...prev, durationTo: date }))
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Upload Image */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Banner/Image</label>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={async (e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file) await handleImageUpload({ target: { files: [file] } } as any);
                  }}
                  onClick={() => document.getElementById("imageInput")?.click()}
                  className="w-full border-2 border-dashed border-blue-300 bg-blue-50 rounded-lg cursor-pointer text-center p-6 hover:bg-blue-100 transition"
                >
                  <p className="text-gray-600">
                    {uploading ? "Uploading..." : "Click or Drag & Drop to upload image"}
                  </p>
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
                    <div className="border rounded-lg overflow-hidden">
                      <img
                        src={formData.image}
                        alt="Uploaded"
                        className="w-full object-contain max-h-64"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes or Terms</label>
                <textarea
                  name="comment"
                  rows={3}
                  placeholder="Internal notes or public terms"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={handleChange}
                />
              </div>

              {/* Submit */}
              <div className="col-span-2">
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold text-lg transition"
                  disabled={uploading}
                >
                  {uploading ? "Uploading image..." : "Submit Discount"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

    </>
  );
}
