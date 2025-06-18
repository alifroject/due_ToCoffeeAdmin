"use client";

import { Pencil, Trash2 } from "lucide-react";

interface DiscountItem {
  id: string;
  name: string;
  percentage: string;
  duration: string;
  comment?: string;
  image?: string;
  minimumPurchase?: string;
}

const mockDiscounts: DiscountItem[] = [
  {
    id: "1",
    name: "Summer Sale",
    percentage: "25%",
    duration: "2025-06-01 to 2025-06-30",
    comment: "Applies to all products",
    image: "https://via.placeholder.com/100",
    minimumPurchase: "$50",
  },
  {
    id: "2",
    name: "Buy 1 Get 1",
    percentage: "100%",
    duration: "2025-07-01 to 2025-07-10",
    comment: "Only on selected items",
    image: "",
    minimumPurchase: "$30",
  },
];

export default function DiscountItems() {
  const handleEdit = (id: string) => {
    console.log("Edit discount:", id);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this discount?")) {
      console.log("Deleted discount:", id);
    }
  };

  return (
    <div className="mt-6 space-y-4">
      {mockDiscounts.map((discount) => (
        <div
          key={discount.id}
          className="bg-white rounded-lg shadow-md p-4 border border-gray-100 flex flex-col md:flex-row gap-4"
        >
          {/* Image */}
          {discount.image ? (
            <img
              src={discount.image}
              alt={discount.name}
              className="w-24 h-24 object-cover rounded-md"
            />
          ) : (
            <div className="w-24 h-24 bg-gray-200 flex items-center justify-center rounded-md text-gray-500 text-sm">
              No Image
            </div>
          )}

          {/* Details */}
          <div className="flex-1 space-y-1">
            <h2 className="text-xl font-semibold text-gray-800">{discount.name}</h2>
            <p className="text-sm text-gray-600">
              <strong>Percentage:</strong> {discount.percentage}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Duration:</strong> {discount.duration}
            </p>
            {discount.minimumPurchase && (
              <p className="text-sm text-gray-600">
                <strong>Min. Purchase:</strong> {discount.minimumPurchase}
              </p>
            )}
            {discount.comment && (
              <p className="text-sm text-gray-500 italic">{discount.comment}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex md:flex-col gap-2 self-start">
            <button
              onClick={() => handleEdit(discount.id)}
              className="flex items-center gap-1 px-3 py-1 bg-yellow-500 text-white rounded-md text-sm hover:bg-yellow-600 transition"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </button>

            <button
              onClick={() => handleDelete(discount.id)}
              className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 transition"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
