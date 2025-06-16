"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { dbFire } from "../../app/firebase/firebase";

export default function CoffeeList() {
  const [coffees, setCoffees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

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

  const filteredCoffees = coffees.filter((coffee) =>
    coffee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCoffees.length / itemsPerPage);
  const paginatedCoffees = filteredCoffees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

      {/* 🔍 Input filter nama kopi */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search coffee by name..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // reset page ketika search berubah
          }}
          className="w-full md:w-1/2 px-4 py-2 border rounded-lg shadow-sm  text-black focus:outline-none focus:ring-2 focus:ring-[#6f4e37]"
        />
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : filteredCoffees.length === 0 ? (
        <p className="text-center text-gray-500">No coffee available</p>
      ) : (
        <>
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {paginatedCoffees.map((coffee) => (
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
                    <p className="text-lg font-semibold text-[#6f4e37]">
                      Rp {Number(coffee.price).toLocaleString()}
                    </p>
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

          {/* Pagination dots */}
          <div className="flex justify-center mt-8">
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
