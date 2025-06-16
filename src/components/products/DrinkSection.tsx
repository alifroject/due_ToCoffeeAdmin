"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { dbFire } from "../../app/firebase/firebase";
import { BsThreeDotsVertical } from "react-icons/bs";

export default function DrinkList() {
  const [drinks, setDrinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const router = useRouter();

  const fetchDrinks = async () => {
    try {
      const querySnapshot = await getDocs(collection(dbFire, "drinks"));
      const drinkData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDrinks(drinkData);
    } catch (error) {
      console.error("Error fetching drinks data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Are you sure you want to delete this drink?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(dbFire, "drinks", id));
      setDrinks((prev) => prev.filter((drink) => drink.id !== id));
      alert("Drink deleted successfully!");
    } catch (error) {
      console.error("Error deleting drink:", error);
      alert("Failed to delete drink.");
    }
  };

  useEffect(() => {
    fetchDrinks();
  }, []);

  const filteredDrinks = drinks.filter((drink) =>
    drink.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredDrinks.length / itemsPerPage);
  const paginatedDrinks = filteredDrinks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-[#4b2e2e]">Our Drinks</h2>
        <button
          onClick={() => router.push("/product/add-drink")}
          className="bg-[#6f4e37] hover:bg-[#8b5e3c] text-white font-semibold py-2 px-4 rounded-lg transition duration-300 shadow"
        >
          + Add Drink
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search drinks..."
          className="w-full md:w-1/2 px-4 py-2 border rounded-lg shadow-sm text-black focus:outline-none focus:ring-2 focus:ring-[#6f4e37]"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : filteredDrinks.length === 0 ? (
        <p className="text-center text-gray-500">No drinks found</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {paginatedDrinks.map((drink) => (
              <div
                key={drink.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col overflow-hidden relative"
              >
                {drink.imageUrl && (
                  <Image
                    src={drink.imageUrl}
                    alt={drink.name}
                    width={400}
                    height={250}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-[#4b2e2e]">{drink.name}</h3>
                    <p className="text-lg font-semibold text-[#6f4e37]">
                      Rp {Number(drink.price).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Three Dots Dropdown */}
                <div className="absolute top-3 right-3">
                  <button
                    onClick={() =>
                      setActiveDropdown(activeDropdown === drink.id ? null : drink.id)
                    }
                  >
                    <BsThreeDotsVertical className="text-2xl text-[#4b2e2e]" />
                  </button>
                  {activeDropdown === drink.id && (
                    <div className="absolute right-0 mt-2 bg-white border rounded shadow-lg z-10">
                      <button
                        onClick={() => {
                          setActiveDropdown(null);
                          router.push(`/product/modify-drink/${drink.id}`);
                        }}
                        className="block px-4 py-2 text-left w-full hover:bg-gray-100"
                      >
                        Modify
                      </button>
                      <button
                        onClick={() => {
                          setActiveDropdown(null);
                          handleDelete(drink.id);
                        }}
                        className="block px-4 py-2 text-left w-full hover:bg-gray-100 text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-3 mt-8">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`w-3 h-3 mx-1 rounded-full ${
                  currentPage === index + 1 ? "bg-[#6f4e37]" : "bg-blue-700"
                }`}
              ></button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
