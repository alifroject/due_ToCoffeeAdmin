"use client";

import { useEffect, useState } from "react";
import { dbFire } from "../../app/firebase/firebase";
import {
  collection,
  getDocs,
  Timestamp,
  DocumentData,
} from "firebase/firestore";
import { Pencil, Trash2 } from "lucide-react";


import DiscountEditForm from "./DiscountEditForm"

interface DiscountItem {
  id: string;
  name: string;
  percentage: number;
  durationFrom: Timestamp;
  durationTo: Timestamp;
  comment?: string;
  image?: string;
  minimumPurchase?: number;
}

export default function DiscountItems() {
  const [discounts, setDiscounts] = useState<DiscountItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);


  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        const querySnapshot = await getDocs(collection(dbFire, "discount"));
        const fetched: DiscountItem[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data() as DocumentData;
          fetched.push({
            id: doc.id,
            name: data.name,
            percentage: data.percentage,
            durationFrom: data.durationFrom,
            durationTo: data.durationTo,
            comment: data.comment,
            image: data.image,
            minimumPurchase: data.minimumPurchase,
          });
        });

        setDiscounts(fetched);
      } catch (error) {
        console.error("Failed to fetch discounts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscounts();
  }, []);

  const handleEdit = (id: string) => {
    setSelectedId(id);
    setShowEditForm(true);
  };


  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this discount?")) {
      console.log("Deleted discount:", id);
    }
  };

  if (loading) return <div>Loading discounts...</div>;

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
          {discounts.map((discount) => (
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
              <td className="p-4">{discount.percentage}%</td>
              <td className="p-4">
                {discount.durationFrom?.toDate().toLocaleDateString()} -{" "}
                {discount.durationTo?.toDate().toLocaleDateString()}
              </td>
              <td className="p-4">
                {discount.minimumPurchase
                  ? `Rp ${discount.minimumPurchase.toLocaleString()}`
                  : "-"}
              </td>
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
      {showEditForm && selectedId && (
        <DiscountEditForm
          id={selectedId}
          onClose={() => {
            setShowEditForm(false);
            setSelectedId(null);
          }}
        />
      )}

    </div>
  );
}
