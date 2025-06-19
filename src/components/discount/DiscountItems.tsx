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
    <div className="mt-6 overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <thead className="bg-gray-50 text-left text-sm text-gray-600 uppercase tracking-wider">
          <tr>
            <th className="p-4">Image</th>
            <th className="p-4">Name</th>
            <th className="p-4">Percentage</th>
            <th className="p-4">Duration</th>
            <th className="p-4">Min. Purchase</th>
            <th className="p-4">Comment</th>
            <th className="p-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="text-sm divide-y divide-gray-100">
          {mockDiscounts.map((discount) => (
            <tr key={discount.id} className="hover:bg-gray-50 transition">
              <td className="p-4">
                {discount.image ? (
                  <img
                    src={discount.image}
                    alt={discount.name}
                    className="w-14 h-14 object-cover rounded-md border border-gray-200"
                  />
                ) : (
                  <div className="w-14 h-14 bg-gray-200 flex items-center justify-center rounded-md text-xs text-gray-500">
                    No Image
                  </div>
                )}
              </td>
              <td className="p-4 font-medium text-gray-800">{discount.name}</td>
              <td className="p-4">{discount.percentage}</td>
              <td className="p-4">{discount.duration}</td>
              <td className="p-4">{discount.minimumPurchase ?? "-"}</td>
              <td className="p-4 text-gray-500 italic">
                {discount.comment ?? "-"}
              </td>
              <td className="p-4 text-center space-x-2">
                <button
                  onClick={() => handleEdit(discount.id)}
                  className="inline-flex items-center px-2 py-1 text-sm text-yellow-700 bg-yellow-100 hover:bg-yellow-200 rounded-md"
                >
                  <Pencil className="w-4 h-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(discount.id)}
                  className="inline-flex items-center px-2 py-1 text-sm text-red-700 bg-red-100 hover:bg-red-200 rounded-md"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
