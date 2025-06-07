"use client";


import { use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { doc, onSnapshot, updateDoc, collection, query, where } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Link from "next/link";
import { dbFire } from "../../app/firebase/firebase";


//types 

import { Transaction } from "./types/transaction";
import { Timestamp } from "firebase/firestore"; // ✅ correct

import { error } from "console";

export default function OrderHistory() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const today = new Date();
    const yearParam = searchParams.get("year") ?? today.getFullYear.toString();
    const monthParam = searchParams.get("month") ?? (today.getMonth() + 1).toString().padStart(2, "0");
    const dateParam = searchParams.get("date") ?? today.getDate().toString().padStart(2, "0")

    const [selectedYear, setSelectedYear] = useState(yearParam)
    const [selectedMonth, setSelectedMonth] = useState(monthParam)
    const [selectedDate, setSelectedDate] = useState(dateParam)



    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [orderId, setOrderId] = useState("");

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
        })
    }, []);

    // onSnapshot to fetch transactions
    useEffect(() => {
        const startDate = new Date(`${selectedYear}-${selectedMonth}-${selectedDate}`);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);


        const startTimestamp = Timestamp.fromDate(startDate);
        const endTimestamp = Timestamp.fromDate(endDate);


        const q = query(
            collection(dbFire, "transactions"),
            where("status", "==", "paid"),
            where("created_at", ">=", startTimestamp),
            where("created_at", "<", endTimestamp)

        );
        const onSubscribe = onSnapshot(q, (snapshot) => {
            const data: Transaction[] = snapshot.docs.map((doc) => ({
                ...(doc.data() as Transaction),
            }));
            setTransactions(data);
            setLoading(false)
        }, (error) => {
            console.log("Failed to fetch transactions", error);
            setLoading(false)
        });
        return () => onSubscribe();

    }, [selectedYear, selectedMonth, selectedDate])
    
    if (isAdmin === null)
        return <p className="text-gray-500 p-6">Checking admin access...</p>;
    if (!isAdmin)
        return (
            <p className="text-red-600 font-semibold p-6">⛔ Access denied. Admins only.</p>
        );

    return (
        <>
            <div className="p-6">
               <h1>Order History</h1>
            </div>
        </>
    )

}
