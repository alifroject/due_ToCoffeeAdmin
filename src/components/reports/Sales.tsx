"use client";

import { use, useEffect, useState } from "react";
import { doc, onSnapshot, updateDoc, collection } from "firebase/firestore";
import { dbFire } from "../../app/firebase/firebase";


interface Transaction {
    order_id: String
}


export default function Sales() {

    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        const onSub = onSnapshot(collection(dbFire, "transactions"), (snapshot) => {
            const data: Transaction[] = snapshot.docs.map((doc) => ({
                ...doc.data(),
            })) as Transaction[];

            setTransactions(data);
        })
        return () => onSub();
    }, []);

    return (
        <>
        <div>
            <h1>Sales</h1>
            <h1>{transactions.length}</h1>
        </div>
        </>
    );
}