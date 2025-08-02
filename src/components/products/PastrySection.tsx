"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { dbFire } from "../../app/firebase/firebase";

export default function PastryList() {
  const [pastries, setPastries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const router = useRouter();

  const fetchPastries = async () => {
    try {
      const querySnapshot = await getDocs(collection(dbFire, "pastries"));
      const pastryData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPastries(pastryData);
    } catch (error) {
      console.error("Error fetching pastries data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Are you sure you want to delete this pastry?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(dbFire, "pastries", id));
      setPastries(prev => prev.filter(pastry => pastry.id !== id));
      alert("Pastry deleted successfully!");
    } catch (error) {
      console.error("Error deleting pastry:", error);
      alert("Failed to delete pastry.");
    }
  };

  useEffect(() => {
    fetchPastries();
  }, []);

  const filteredPastries = pastries.filter(pastry =>
    pastry.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPastries.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPastries.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="p-6 min-h-screen flex flex-col bg-gradient-to-b from-[#f7f3ef] via-[#fefaf7] to-[#f5f0eb] font-sans text-[#3b2f2f]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-light tracking-wide text-[#4b2e2e]">🥐 Our Pastries</h2>
        <button
          onClick={() => router.push("/product/add-pastry")}
          className="bg-[#6f4e37] hover:bg-[#8b5e3c] text-white font-medium py-2 px-5 rounded-lg transition duration-300 shadow-md hover:shadow-lg"
        >
          + Add Pastry
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search pastries by name..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full md:w-1/2 px-4 py-2 border border-[#d1bfa3] rounded-lg shadow-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#8b5e3c] placeholder:text-[#9e8a7a]"
        />
      </div>

      {loading ? (
        <p className="text-center text-[#7b6a5d]">Loading...</p>
      ) : filteredPastries.length === 0 ? (
        <p className="text-center text-[#9e8a7a] italic">No pastries found</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 relative z-10">
            {currentItems.map((pastry) => (
              <div
                key={pastry.id}
                className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-shadow duration-300 flex flex-col border border-[#eeeae6] relative min-h-[420px]"
              >
                {pastry.imageUrl && (
                  <Image
                    src={pastry.imageUrl}
                    alt={pastry.name}
                    width={400}
                    height={250}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-[#4b2e2e]">{pastry.name}</h3>
                    <p className="text-lg font-light text-[#6f4e37]">
                      Rp {Number(pastry.price).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="px-4 pb-4 flex justify-between space-x-2">
                  <button
                    onClick={() => router.push(`/product/modify-pastry/${pastry.id}`)}
                    className="w-full bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-2 text-sm rounded-lg font-medium transition"
                  >
                    ✏️ Modify
                  </button>
                  <button
                    onClick={() => handleDelete(pastry.id)}
                    className="w-full bg-red-100 text-red-600 hover:bg-red-200 px-3 py-2 text-sm rounded-lg font-medium transition"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-8">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-3 h-3 mx-1 rounded-full ${currentPage === i + 1 ? "bg-[#6f4e37]" : "bg-[#b0a089]"
                  } transition-colors duration-300`}
              ></button>
            ))}
          </div>
        </>
      )}
    </div>

  );
}
