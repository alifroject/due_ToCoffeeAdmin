"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { dbFire } from "../../app/firebase/firebase";

export default function CoffeeList() {
  const [coffees, setCoffees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchCoffees = async () => {
    try {
      const querySnapshot = await getDocs(collection(dbFire, "coffees"));
      const coffeeData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCoffees(coffeeData);
    } catch (error) {
      console.error("Error fetching coffee data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Are you sure you want to delete this coffee?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(dbFire, "coffees", id));
      setCoffees((prev) => prev.filter((coffee) => coffee.id !== id));
      alert("Coffee deleted successfully!");
    } catch (error) {
      console.error("Error deleting coffee:", error);
      alert("Failed to delete coffee.");
    }
  };

  useEffect(() => {
    fetchCoffees();
  }, []);

  return (
    <div className="p-6 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-[#4b2e2e]"></h2>
        <button
          onClick={() => router.push("/product/add-coffee")}
          className="bg-[#6f4e37] hover:bg-[#8b5e3c] text-white font-semibold py-2 px-4 rounded-lg transition duration-300 shadow"
        >
          + Add Coffee
        </button>
      </div>

      {/* Hapus dropdown filter */}

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : coffees.length === 0 ? (
        <p className="text-center text-gray-500">No coffee available</p>
      ) : (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {coffees.map((coffee) => (
            <div
              key={coffee.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col overflow-hidden"
            >
              {coffee.imageUrl && (
                <Image
                  src={coffee.imageUrl}
                  alt={coffee.name}
                  width={400}
                  height={250}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-[#4b2e2e]">{coffee.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">{coffee.description}</p>
                  <p className="text-lg font-semibold text-[#6f4e37]">
                    Rp {Number(coffee.price).toLocaleString()}
                  </p>
                  <p className="text-sm italic text-gray-500">Type: {coffee.type}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => router.push(`/product/modify-coffee/${coffee.id}`)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm transition"
                  >
                    Modify
                  </button>
                  <button
                    onClick={() => handleDelete(coffee.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
