"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { dbFire } from "../../app/firebase/firebase";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Props {
    id: string;
    onClose: () => void;
}

export default function DiscountEditForm({ id, onClose }: Props) {
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        percentage: 0,
        durationFrom: new Date(),
        durationTo: new Date(),
        comment: "",
        image: "",
        minimumPurchase: 0,
        type: "",               // NEW
        selectedItem: "",       // NEW
        selectedProduct: "",    // NEW
    });
    const itemOptions = [
        { value: "collection", label: "By Collection" },
        { value: "category", label: "By Category" },
    ];



    useEffect(() => {
        if (!id) return;

        const fetchDiscount = async () => {
            try {
                const docRef = doc(dbFire, "discount", id);
                const snapshot = await getDoc(docRef);
                if (snapshot.exists()) {
                    const data = snapshot.data();
                    setFormData({
                        name: data.name || "",
                        percentage: data.percentage || 0,
                        durationFrom: data.duration?.from?.toDate?.() || new Date(),
                        durationTo: data.duration?.to?.toDate?.() || new Date(),
                        comment: data.comment || "",
                        image: data.image || "",
                        minimumPurchase: data.minimumPurchase || 0,
                        type: data.type || "",
                        selectedItem: data.selectedItem || "",
                        selectedProduct: data.selectedProduct || "",
                    });

                }
            } catch (error) {
                console.error("Failed to fetch discount:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDiscount();
    }, [id]);


    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === "percentage" || name === "minimumPurchase" ? Number(value) : value,
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
            const docRef = doc(dbFire, "discount", id);
            await updateDoc(docRef, {
                name: formData.name,
                percentage: formData.percentage,
                duration: {
                    from: formData.durationFrom,
                    to: formData.durationTo,
                },
                comment: formData.comment,
                image: formData.image,
                minimumPurchase: formData.minimumPurchase,
            });
            onClose();
        } catch (error) {
            console.error("Error updating discount:", error);
        }
    };

    const handleClear = () => {
        setFormData({
            name: "",
            percentage: 0,
            durationFrom: new Date(),
            durationTo: new Date(),
            comment: "",
            image: "",
            minimumPurchase: 0,
            type: "",               // included
            selectedItem: "",       // included
            selectedProduct: "",    // included
        });
    };



    return (
        <>
            <div className="bg-white w-full max-w-2xl p-6 rounded-xl   mt-6">
                <div className="flex justify-between gap-4">
                    <button
                        type="button"
                        onClick={handleClear}
                        className="w-full py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400 transition"
                    >
                        Clear Form
                    </button>


                </div>

                <div className="flex justify-between items-center mb-4">
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition"
                    >
                        <X className="w-5 h-5" />
                    </button>


                    <div className="overflow-y-auto flex-1 pr-1">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-md"
                                    required
                                />
                            </div>

                            {/* Percentage */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Percentage (%)</label>
                                <input
                                    type="number"
                                    name="percentage"
                                    value={formData.percentage}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-md"
                                    required
                                />
                            </div>

                            {/* Discount Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-md"
                                >
                                    <option value="">Select Type</option>
                                    <option value="percentage">Percentage</option>
                                    <option value="fixed">Fixed Amount</option>
                                </select>
                            </div>

                            {/* Apply To */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Apply To</label>
                                <select
                                    name="selectedItem"
                                    value={formData.selectedItem}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-md"
                                >
                                    <option value="">Select Item</option>
                                    {itemOptions.map((item) => (
                                        <option key={item.value} value={item.value}>
                                            {item.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {/* Product/Collection/Category */}
                            {formData.selectedItem && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {formData.selectedItem === "collection"
                                            ? "Select Collection"
                                            : "Select Category"}
                                    </label>
                                    <select
                                        name="selectedProduct"
                                        value={formData.selectedProduct}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border rounded-md"
                                    >
                                        <option value="">Select</option>
                                        {/* For demo purposes, static options */}
                                        {formData.selectedItem === "collection" ? (
                                            <>
                                                <option value="summer">Summer Collection</option>
                                                <option value="winter">Winter Collection</option>
                                            </>
                                        ) : (
                                            <>
                                                <option value="shoes">Shoes</option>
                                                <option value="bags">Bags</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                            )}


                            {/* Duration */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration From</label>
                                    <DatePicker
                                        selected={formData.durationFrom}
                                        onChange={(date) => date && setFormData({ ...formData, durationFrom: date })}
                                        className="w-full px-4 py-2 border rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration To</label>
                                    <DatePicker
                                        selected={formData.durationTo}
                                        onChange={(date) => date && setFormData({ ...formData, durationTo: date })}
                                        className="w-full px-4 py-2 border rounded-md"
                                    />
                                </div>
                            </div>

                            {/* Minimum Purchase */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Purchase</label>
                                <input
                                    type="number"
                                    name="minimumPurchase"
                                    value={formData.minimumPurchase}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-md"
                                />
                            </div>

                            {/* Comment */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                                <textarea
                                    name="comment"
                                    value={formData.comment}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-md"
                                    rows={2}
                                />
                            </div>

                            {/* Image */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Banner/Image</label>
                                {formData.image && (
                                    <img src={formData.image} alt="Current" className="w-full h-40 object-cover mb-2 rounded-md" />
                                )}
                                <input type="file" accept="image/*" onChange={handleImageUpload} />
                            </div>

                            <button
                                type="submit"
                                disabled={uploading}
                                className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                            >
                                {uploading ? "Uploading..." : "Update Discount"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
