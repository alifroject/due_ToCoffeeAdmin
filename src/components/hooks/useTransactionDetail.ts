// hooks/useTransactionDetail.ts

import { useEffect, useState } from "react";
import { dbFire } from "@/app/firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Transaction } from "@/components/orderHistory/types/transaction";

export function useTransactionDetail(transactionId: string) {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const docRef = doc(dbFire, "transactions", transactionId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setTransaction(docSnap.data() as Transaction);
        }
      } catch (error) {
        console.error("Error fetching transaction:", error);
      } finally {
        setLoading(false);
      }
    };

    if (transactionId) {
      fetchTransaction();
    }
  }, [transactionId]);

  return { transaction, loading };
}
