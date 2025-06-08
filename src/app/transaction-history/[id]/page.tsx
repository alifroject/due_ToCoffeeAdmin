"use client";

import { useParams } from "next/navigation";
import { useTransactionDetail } from "@/components/hooks/useTransactionDetail";

export default function TransactionHistoryDetail() {
    const params = useParams();
    const id = params.id as string;

    // ✅ Hook is always called regardless of `id`
    const { transaction, loading } = useTransactionDetail(id);

    if (loading) return <p>Loading...</p>;
    if (!transaction) return <p>Transaction not found</p>;

    return (
        <div className="p-4 bg-white rounded-xl text-black border shadow">
            <div className="sticky top-[80px] z-50">
                <button
                    onClick={() => window.history.back()}
                    className="bg-red-600 backdrop-blur-md text-white hover:bg-red-400 hover:text-white rounded-full w-11 h-11 flex items-center justify-center shadow-md border border-gray-300"
                    aria-label="Go back"
                >
                    ←
                </button>
            </div>
            <h1 className="text-2xl font-bold mb-2">🧾 Transaction Detail</h1>
            <p><strong>Order ID:</strong> {transaction.order_id}</p>
            <p><strong>Amount:</strong> Rp {transaction.amount.toLocaleString("id-ID")}</p>
            <p><strong>Status:</strong> {transaction.status}</p>
            <p><strong>Queue Number Status:</strong> {transaction.queue_number_status}</p>
            <p><strong>Customer:</strong> {transaction.userName} ({transaction.userEmail})</p>
            <p><strong>Created:</strong> {transaction.created_at.toDate().toLocaleString("id-ID")}</p>
        </div>
    );
}
