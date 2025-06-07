"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Timestamp } from "firebase/firestore";

import { dbFire } from "../../app/firebase/firebase";
import { Transaction } from "./types/transaction";
import OrderHistoryContent from "./OrderHistoryContent";

export default function OrderHistory() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const today = new Date();

  // Parse date range from URL params or default to today
  const fromYearParam = searchParams.get("fromYear") ?? today.getFullYear().toString();
  const fromMonthParam = searchParams.get("fromMonth") ?? (today.getMonth() + 1).toString().padStart(2, "0");
  const fromDateParam = searchParams.get("fromDate") ?? today.getDate().toString().padStart(2, "0");

  const toYearParam = searchParams.get("toYear") ?? today.getFullYear().toString();
  const toMonthParam = searchParams.get("toMonth") ?? (today.getMonth() + 1).toString().padStart(2, "0");
  const toDateParam = searchParams.get("toDate") ?? today.getDate().toString().padStart(2, "0");

  // State for "From" date
  const [fromYear, setFromYear] = useState(fromYearParam);
  const [fromMonth, setFromMonth] = useState(fromMonthParam);
  const [fromDate, setFromDate] = useState(fromDateParam);

  // State for "To" date
  const [toYear, setToYear] = useState(toYearParam);
  const [toMonth, setToMonth] = useState(toMonthParam);
  const [toDate, setToDate] = useState(toDateParam);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdTokenResult(true);
        const isAdmin = token.claims.role === "admin" || user.email === "due-to2026@gmail.com";
        setIsAdmin(isAdmin);
      } else {
        setIsAdmin(false);
      }
    });
  }, []);

  useEffect(() => {
    // Build from and to Date objects
    const fromDateObj = new Date(`${fromYear}-${fromMonth}-${fromDate}`);
    const toDateObj = new Date(`${toYear}-${toMonth}-${toDate}`);
    // Add one day to include the whole 'toDate'
    toDateObj.setDate(toDateObj.getDate() + 1);

    const startTimestamp = Timestamp.fromDate(fromDateObj);
    const endTimestamp = Timestamp.fromDate(toDateObj);

    const q = query(
      collection(dbFire, "transactions"),
      where("status", "==", "paid"),
      where("created_at", ">=", startTimestamp),
      where("created_at", "<", endTimestamp)
    );

    setLoading(true);
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: Transaction[] = snapshot.docs.map((doc) => doc.data() as Transaction);
        setTransactions(data);
        setLoading(false);
      },
      (error) => {
        console.error("Failed to fetch transactions", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [fromYear, fromMonth, fromDate, toYear, toMonth, toDate]);

  useEffect(() => {
    router.replace(
      `/transaction-history?fromYear=${fromYear}&fromMonth=${fromMonth}&fromDate=${fromDate}` +
      `&toYear=${toYear}&toMonth=${toMonth}&toDate=${toDate}`
    );
  }, [fromYear, fromMonth, fromDate, toYear, toMonth, toDate]);

  if (isAdmin === null) return <p className="text-gray-500 p-6">Checking admin access...</p>;
  if (!isAdmin) return <p className="text-red-600 font-semibold p-6">⛔ Access denied. Admins only.</p>;

  return (
    <OrderHistoryContent
      transactions={transactions}
      loading={loading}
      fromYear={fromYear}
      fromMonth={fromMonth}
      fromDate={fromDate}
      toYear={toYear}
      toMonth={toMonth}
      toDate={toDate}
      setFromYear={setFromYear}
      setFromMonth={setFromMonth}
      setFromDate={setFromDate}
      setToYear={setToYear}
      setToMonth={setToMonth}
      setToDate={setToDate}
    />
  );
}
