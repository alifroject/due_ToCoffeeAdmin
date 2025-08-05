"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { dbFire } from "../../app/firebase/firebase";

export default function FoodList() {
  const [foods, setFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const router = useRouter();

  const fetchFoods = async () => {
    try {
      const querySnapshot = await getDocs(collection(dbFire, "foods"));
      const foodData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFoods(foodData);
    } catch (error) {
      console.error("Error fetching foods data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Are you sure you want to delete this food?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(dbFire, "foods", id));
      setFoods(prev => prev.filter(food => food.id !== id));
      alert("Food deleted successfully!");
    } catch (error) {
      console.error("Error deleting food:", error);
      alert("Failed to delete food.");
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  // Logic filter search
  const filteredFoods = foods.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredFoods.length / itemsPerPage);
  const paginatedFoods = filteredFoods.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6 min-h-screen flex flex-col bg-gradient-to-b from-[#f7f3ef] via-[#fefaf7] to-[#f5f0eb] font-sans text-[#3b2f2f]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-light tracking-wide text-[#4b2e2e]">🍽️ Our Foods</h2>
        <button
          onClick={() => router.push("/product/add-food")}
          className="bg-[#6f4e37] hover:bg-[#8b5e3c] text-white font-medium py-2 px-5 rounded-lg transition duration-300 shadow-md hover:shadow-lg"
        >
          + Add Food
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search foods by name..."
          className="w-full md:w-1/2 px-4 py-2 border border-[#d1bfa3] rounded-lg shadow-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#8b5e3c] placeholder:text-[#9e8a7a]"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {loading ? (
        <p className="text-center text-[#7b6a5d]">Loading...</p>
      ) : filteredFoods.length === 0 ? (
        <p className="text-center text-[#9e8a7a] italic">No foods found</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 relative z-10">
            {paginatedFoods.map((food) => (
              <div
                key={food.id}
                className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-shadow duration-300 flex flex-col border border-[#eeeae6] relative min-h-[420px]"
              >
                {food.imageUrl && (
                  <Image
                    src={food.imageUrl}
                    alt={food.name}
                    width={400}
                    height={250}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-[#4b2e2e]">{food.name}</h3>
                    <p className="text-lg font-light text-[#6f4e37]">
                      Rp {Number(food.price).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Modify and Delete buttons BELOW the card */}
                <div className="px-4 pb-4 flex justify-between space-x-2">
                  <button
                    onClick={() => router.push(`/product/modify-food/${food.id}`)}
                    className="w-full bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-2 text-sm rounded-lg font-medium transition"
                  >
                    ✏️ Modify
                  </button>
                  <button
                    onClick={() => handleDelete(food.id)}
                    className="w-full bg-red-100 text-red-600 hover:bg-red-200 px-3 py-2 text-sm rounded-lg font-medium transition"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center mt-8">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`w-3 h-3 mx-1 rounded-full ${currentPage === index + 1 ? "bg-[#6f4e37]" : "bg-[#b0a089]"
                  } transition-colors duration-300`}
              ></button>
            ))}
          </div>
        </>
      )}
    </div>

  );
}
