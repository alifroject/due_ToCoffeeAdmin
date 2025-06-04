"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { dbFire } from "@/app/firebase/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Link from "next/link";
import { Search } from "lucide-react"; // if using Lucide
import { Timestamp } from "firebase/firestore";
import { ArrowLeft } from "lucide-react"; // or any icon you like
import SlidingBox from "../../components/navigate/SlidingBox";
import QueueNumberColumn from "../../components/navigate/QueueNumberColumn";

interface QueueStatus {
  accepted: boolean;
  almost_ready: boolean;
  in_progress: boolean;
  ready_for_pickup: boolean;
  updated_at: any;
}

interface Transaction {
  order_id: string;
  userName: string;
  amount: number;
  status: string;
  created_at: any; // Firebase timestamp
  queue_status?: QueueStatus; // Optional
}

export default function QueuePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize date from URL query params or fallback to today
  const today = new Date();
  const yearParam = searchParams.get("year") ?? today.getFullYear().toString();
  const monthParam = searchParams.get("month") ?? (today.getMonth() + 1).toString().padStart(2, "0");
  const dateParam = searchParams.get("date") ?? today.getDate().toString().padStart(2, "0");

  const [selectedYear, setSelectedYear] = useState(yearParam);
  const [selectedMonth, setSelectedMonth] = useState(monthParam);
  const [selectedDate, setSelectedDate] = useState(dateParam);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [orderId, setOrderId] = useState("");

  const [isBoxVisible, setIsBoxVisible] = useState(false);



  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdTokenResult(true);
        const isAdmin =
          token.claims.role === "admin" || user.email === "due-to2026@gmail.com";
        setIsAdmin(isAdmin);
      } else {
        setIsAdmin(false);
      }
    });
  }, []);

  // Fetch transactions based on selected date
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const startDate = new Date(`${selectedYear}-${selectedMonth}-${selectedDate}`);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);

      const startTimestamp = Timestamp.fromDate(startDate);
      const endTimestamp = Timestamp.fromDate(endDate);
      endDate.setDate(endDate.getDate() + 1);

      const q = query(
        collection(dbFire, "transactions"),
        where("status", "==", "paid"),
        where("created_at", ">=", startTimestamp),
        where("created_at", "<", endTimestamp)
      );

      const snapshot = await getDocs(q);
      const data: Transaction[] = snapshot.docs.map((doc) => ({
        ...(doc.data() as Transaction),
      }));
      setTransactions(data);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchTransactions();
  }, [isAdmin, selectedYear, selectedMonth, selectedDate]);

  // When filters change, update URL query params so the state is saved in the URL
  useEffect(() => {
    router.replace(
      `/order-queue?year=${selectedYear}&month=${selectedMonth}&date=${selectedDate}`,
      { scroll: false } // prevent page scroll on param change
    );
  }, [selectedYear, selectedMonth, selectedDate]);

  if (isAdmin === null)
    return <p className="text-gray-500 p-6">Checking admin access...</p>;
  if (!isAdmin)
    return (
      <p className="text-red-600 font-semibold p-6">⛔ Access denied. Admins only.</p>
    );

  return (
    <>
      {/* Animated Floating Button */}
      <button
        onClick={() => setIsBoxVisible(true)}
        className="fixed top-22 right-10 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg animate-bounceX hover:scale-110 transition-transform"
        title="Open Menu"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>


      {/* Sliding Box Component */}
      <SlidingBox isVisible={isBoxVisible} onClose={() => setIsBoxVisible(false)} />


      <div className="p-6 mx-auto rounded-xl">
        {/* Filter Section */}
        <div className="bg-blue-50 bg-white border border-blue-200 p-4 rounded-lg shadow-inner mb-6">
          <h1 className="text-3xl font-bold mb-6 text-gray-800 px-4 py-2 rounded shadow-inner text-center">
            🧾 Order Queue 
          </h1>

          <div className="flex flex-wrap justify-between items-start gap-4 font-[Inter]">
            {/* Left side: Filter by Date */}
            <div>
              <h2 className="text-lg font-semibold text-blue-900 mb-2">📅 Filter by Date</h2>
              <div className="flex flex-wrap items-center gap-4">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="bg-white text-gray-800 font-medium border border-blue-300 focus:border-blue-500 rounded-xl px-4 py-2 shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl focus:ring-2 focus:ring-blue-200 focus:outline-none"
                >
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                </select>

                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-white text-gray-800 font-medium border border-blue-300 focus:border-blue-500 rounded-xl px-4 py-2 shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl focus:ring-2 focus:ring-blue-200 focus:outline-none"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i} value={(i + 1).toString().padStart(2, "0")}>
                      {new Date(0, i).toLocaleString("default", { month: "long" })}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-white text-gray-800 font-medium border border-blue-300 focus:border-blue-500 rounded-xl px-4 py-2 shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl focus:ring-2 focus:ring-blue-200 focus:outline-none"
                >
                  {Array.from({ length: 31 }, (_, i) => (
                    <option key={i} value={(i + 1).toString().padStart(2, "0")}>
                      {(i + 1).toString().padStart(2, "0")}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right side: Filter by Order ID */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Search className="w-5 h-5 text-blue-900" />
                <h2 className="text-lg font-semibold text-blue-900">Filter by Order ID</h2>
              </div>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Enter Order ID..."
                className="bg-white text-gray-800 font-medium border border-blue-300 focus:border-blue-500 rounded-xl px-4 py-2 shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl focus:ring-2 focus:ring-blue-200 focus:outline-none w-60"
              />
            </div>
          </div>

          {/* Reminder Buttons - Added below, centered */}
          <div className="flex justify-center gap-4 mt-6 flex-wrap">
            <div className="bg-green-100 text-green-800 px-6 py-2 rounded-full  shadow select-none">
              Order Accepted
            </div>
            <div className="bg-blue-100 text-blue-800 px-6 py-2 rounded-full shadow select-none">
              In Progress
            </div>
            <div className="bg-red-100 text-red-800 px-6 py-2 rounded-full  shadow select-none">
              Almost Ready
            </div>
            <div className="bg-gray-100 text-gray-900 px-6 py-2 rounded-full  shadow select-none">
              Ready for Pickup
            </div>
          </div>

        </div>



        {/* Transactions table */}
        {loading ? (
          <div className="flex justify-center items-center space-x-3 py-10">
            <span className="h-4 w-4 rounded-full bg-gray-800 animate-ping"></span>
            <p className="text-gray-600 font-medium animate-pulse transition-colors duration-500 ease-in-out">
              Loading orders...
            </p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="bg-yellow-50 text-yellow-700 p-4 rounded shadow text-center font-medium">
            No orders have been paid yet.
          </div>
        ) : (
          <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl shadow-lg">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-blue-100 text-blue-900">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Order ID</th>
                  <th className="px-6 py-3 text-left font-semibold">User Name</th>
                  <th className="px-6 py-3 text-left font-semibold">Date</th>
                  <th className="px-6 py-3 text-right font-semibold">Amount</th>
                  <th className="px-6 py-3 text-center font-semibold">Status</th>
                  <th className="px-6 py-3 text-center font-semibold">Action</th>
                  <th className="px-6 py-3 text-center font-semibold">Queue Number</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((tx, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-800">{tx.order_id}</td>
                    <td className="px-6 py-4 text-gray-700">{tx.userName}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {tx.created_at?.toDate
                        ? tx.created_at.toDate().toLocaleString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: false,
                          timeZoneName: "short",
                        })
                        : "Invalid Date"}
                    </td>

                    <td className="px-6 py-4 text-right text-green-600 font-semibold">
                      {typeof tx.amount === "number"
                        ? `Rp${tx.amount.toLocaleString("id-ID")}`
                        : "Rp0"}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${tx.status === "paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                        }`}>
                        {tx.status === "paid" ? "✅ Paid" : "❌ Unpaid"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        href={`/order-queue/${tx.order_id}`}
                        className={`
      inline-flex items-center gap-2 px-4 py-1.5 rounded-md font-medium transition
      ${tx.queue_status ? (
                            tx.queue_status.accepted ? 'bg-green-100 hover:bg-green-200 text-green-700' :
                              tx.queue_status.in_progress ? 'bg-blue-100 hover:bg-blue-200 text-blue-700' :
                                tx.queue_status.almost_ready ? 'bg-red-100 hover:bg-red-200 text-red-700' :
                                  tx.queue_status.ready_for_pickup ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' :
                                    'bg-blue-100 hover:bg-blue-200 text-blue-700'
                          ) : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                          }
    `}
                      >
                        {tx.queue_status ? (
                          tx.queue_status.accepted ? (
                            <>
                              Order Accepted <span className="text-green-600 text-lg"></span>
                            </>
                          ) : tx.queue_status.in_progress ? (
                            <>
                              In Progress <span className="text-blue-600 text-lg"></span>
                            </>
                          ) : tx.queue_status.almost_ready ? (
                            <>
                              Almost Ready <span className="text-red-600 text-lg"></span>
                            </>
                          ) : tx.queue_status.ready_for_pickup ? (
                            <>
                              Ready for Pickup <span className="text-gray-600 text-lg"></span>
                            </>
                          ) : (
                            <>
                              Accept Order <span className="text-blue-600 text-lg">&rarr;</span>
                            </>
                          )
                        ) : (
                          <>
                            Accept Order <span className="text-blue-600 text-lg">&rarr;</span>
                          </>
                        )}
                      </Link>
                    </td>

                    <td colSpan={6}>
                      <QueueNumberColumn order_id={tx.order_id} />
                     
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </>
  );

}
