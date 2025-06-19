"use client";

import { useEffect, useState } from "react";
import { dbFire } from "../../app/firebase/firebase";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { Pencil, Trash2 } from "lucide-react";

interface DiscountItem {
  id: string;
  name: string;
  percentage: number;
  duration: {
    from: any;
    to: any;
  };
  comment?: string;
  image?: string;
  minimumPurchase?: number;
}

interface DiscountItemsProps {
  onEdit: (id: string) => void;
}

export default function DiscountItems({ onEdit }: DiscountItemsProps) {
  const [discounts, setDiscounts] = useState<DiscountItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(dbFire, "discount"),
      (snapshot) => {
        const fetched: DiscountItem[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            name: data.name,
            percentage: data.percentage,
            duration: {
              from: data.duration?.from,
              to: data.duration?.to,
            },
            comment: data.comment,
            image: data.image,
            minimumPurchase: data.minimumPurchase,
          };
        });

        setDiscounts(fetched);
        setLoading(false);
      },
      (error) => {
        console.error("Real-time snapshot error:", error);
        setLoading(false);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  const handleEdit = (id: string) => {
    onEdit(id);
  };

  const handleDelete = async (id: string) => {
    const confirmed = confirm("Are you sure you want to delete this discount?");
    if (confirmed) {
      try {
        await deleteDoc(doc(dbFire, "discount", id));
      } catch (err) {
        console.error("Error deleting discount:", err);
      }
    }
  };

  if (loading) return <div>Loading discounts...</div>;

  return (
    <div className="mt-6 overflow-x-auto w-full">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <thead className="bg-gray-50 text-left text-sm text-gray-600 uppercase tracking-wider">
          <tr>
            <th className="p-4">Image</th>
            <th className="p-4">Name</th>
            <th className="p-4">Duration</th>
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
                    className="w-14 h-14 object-cover rounded-md"
                  />
                ) : (
                  <span className="text-gray-400 italic">No Image</span>
                )}
              </td>
              <td className="p-4 font-medium text-gray-800">
                {discount.name}
              </td>
              <td className="p-4">
                {discount.duration.from?.toDate?.()?.toLocaleDateString()} -{" "}
                {discount.duration.to?.toDate?.()?.toLocaleDateString()}
              </td>
              <td className="p-4 flex items-center justify-center gap-3">
                <button
                  onClick={() => handleEdit(discount.id)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(discount.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
