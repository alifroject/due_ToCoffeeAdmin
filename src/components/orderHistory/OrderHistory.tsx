"use client";


import { use, useEffect, useState } from "react";
import { doc, onSnapshot, updateDoc, collection } from "firebase/firestore";
import { dbFire } from "../../app/firebase/firebase";


//types 

import { Transaction } from "./types/transaction";

export default function OrderHistory() {
    const [transactions, setTransaction] = useState<Transaction[]>([]);

    useEffect(() => {
        const onSub = onSnapshot(collection(dbFire, "transactions"), (snapshot) => {
            const data: Transaction[] = snapshot.docs.map((doc) => ({
                ...doc.data(),
            })) as Transaction[];
            setTransaction(data);
        })
        return () => onSub();
    }, []);
    return (
        <>
            <div className="bg-black text-white">
                <h1>Sales</h1>
                {transactions.filter((tx) => tx.queue_number_status === "expired").map((tx, index) => (
                    <div key={index}>
                        <p>{tx.order_id}</p>
                    </div>
                ))}
            </div>
        </>
    )
}
