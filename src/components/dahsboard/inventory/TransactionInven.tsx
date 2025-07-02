"use client";
import React, { useEffect, useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { collection, getDocs } from "firebase/firestore";
import { dbFire } from "../../../app/firebase/firebase";

interface Transaction {
    order_id: string;
    paid_amount: number;
    paid_at: Date;
}

interface ChartData {
    label: string;
    total: number;
    date: string;
    order_id: string;
}

export default function TransactionInv() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "monthly" | "yearly">("all");

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const querySnapshot = await getDocs(collection(dbFire, "transactions"));
                const fetched: Transaction[] = [];

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const rawWebhook = data.raw_webhook;
                    const paidAmount = rawWebhook?.paid_amount;
                    const orderId = data.order_id;
                    const paidAtRaw = rawWebhook?.paid_at;

                    if (paidAmount && orderId && paidAtRaw) {
                        const paidAt =
                            paidAtRaw instanceof Date
                                ? paidAtRaw
                                : paidAtRaw?.toDate
                                    ? paidAtRaw.toDate()
                                    : new Date(paidAtRaw);

                        if (!isNaN(paidAt.getTime())) {
                            fetched.push({
                                order_id: orderId,
                                paid_amount: paidAmount,
                                paid_at: paidAt,
                            });
                        }
                    }
                });

                setTransactions(fetched);
            } catch (err) {
                console.error("Error fetching transactions:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    const COLORS = ["#a855f7", "#c084fc", "#d8b4fe", "#f3e8ff"];

    // Filtering
    const now = new Date();
    const filteredTransactions = transactions.filter((t) => {
        if (filter === "monthly") {
            return (
                t.paid_at.getMonth() === now.getMonth() &&
                t.paid_at.getFullYear() === now.getFullYear()
            );
        }
        if (filter === "yearly") {
            return t.paid_at.getFullYear() === now.getFullYear();
        }
        return true; // all
    });

    const chartData: ChartData[] = filteredTransactions
        .sort((a, b) => b.paid_amount - a.paid_amount) // Sort descending by paid_amount
        .slice(0, 15) // Take top 15
        .map((t) => ({
            label: t.order_id,
            total: t.paid_amount,
            date: t.paid_at.toLocaleDateString("id-ID"),
            order_id: t.order_id,
        }));

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-full m-5 md:m-14 max-w-6xl h-[510px] mx-auto p-5 bg-white  rounded-xl shadow-[0_2px_12px_rgba(234,179,8,0.3)] text-sm">



                <h2 className="text-xl font-bold text-purple-700 mb-4">
                    Top 15 Paid Transactions
                </h2>

                <div className="mb-4 flex items-center gap-2">
                    <label className="text-purple-700 font-medium">Filter:</label>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as "all" | "monthly" | "yearly")}
                        className="border border-purple-300 rounded px-2 py-1 text-xs text-purple-800"
                    >
                        <option value="all">All</option>
                        <option value="monthly">This Month</option>
                        <option value="yearly">This Year</option>
                    </select>
                </div>
                {loading ? (
                    <div className="text-center mt-16 text-gray-500 text-sm">Loading...</div>
                ) : chartData.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm mt-16">
                        No transaction data available.
                    </div>
                ) : (
                    // ✅ Make this scrollable wrapper only for chart
                    <div className="w-full">
                        <div className="w-full h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">


                                <BarChart
                                    data={chartData}
                                    margin={{ top: 10, right: 30, left: 10, bottom: 60 }}
                                >
                                    <XAxis
                                        dataKey="label"
                                        tick={{ fill: "#6b21a8", fontSize: 8 }}
                                        angle={-45}
                                        textAnchor="end"
                                        interval={0}
                                    />
                                    <YAxis tick={{ fill: "#9333ea", fontSize: 10 }} type="number" />
                                    <Tooltip
                                        cursor={{ fill: "rgba(168,85,247,0.05)" }}
                                        contentStyle={{
                                            backgroundColor: "#f3e8ff",
                                            border: "1px solid #c084fc",
                                            borderRadius: 10,
                                            color: "#6b21a8",
                                            fontSize: 10,
                                        }}
                                        formatter={(value: any) =>
                                            `Rp ${Number(value).toLocaleString("id-ID")}`
                                        }
                                        labelFormatter={(label: string) => `Order ID: ${label}`}
                                    />
                                    <Bar dataKey="total" radius={[10, 10, 0, 0]} barSize={30}>
                                        {chartData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}



            </div>
        </div>



    );
}
