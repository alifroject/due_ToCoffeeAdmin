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

interface Transaction {
    order_id: string;
    paid_amount: number;
}


export default function Transactionj() {
    const [data, setData] = useState<Transaction[]>([]);

    useEffect(() => {
        const fetchTransactions = async () => {
            // Mocked data – replace this with your real Firestore fetch
            const transactions: Transaction[] = [
                { order_id: "order_1750938476209", paid_amount: 117000 },
                { order_id: "order_1751122304741", paid_amount: 95000 },
                { order_id: "order_1751130928323", paid_amount: 128000 },
                { order_id: "order_1751173469973", paid_amount: 104000 },
                { order_id: "order_1751273977906", paid_amount: 150000 },
                // Add more here...
            ];
            setData(transactions);
        };

        fetchTransactions();
    }, []);

    const COLORS = [
        "#a855f7", // purple-500
        "#c084fc", // purple-400
        "#d8b4fe", // purple-300
        "#f3e8ff", // purple-100
    ];

    return (
        <div className="w-full h-[600px] bg-gradient-to-br from-purple-100 via-purple-200 to-white p-6 rounded-2xl shadow-xl">
            <h2 className="text-3xl font-bold text-purple-700 mb-4 text-center">Paid Amounts in June</h2>
            <ResponsiveContainer width="100%" height="90%">
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                    <XAxis type="number" tick={{ fill: "#6b21a8", fontWeight: 500 }} />
                    <YAxis
                        dataKey="order_id"
                        type="category"
                        tick={{ fill: "#7e22ce", fontSize: 12 }}
                        width={140}
                    />
                    <Tooltip
                        cursor={{ fill: "rgba(168,85,247,0.1)" }}
                        contentStyle={{
                            backgroundColor: "#f3e8ff",
                            border: "1px solid #c084fc",
                            borderRadius: 10,
                            color: "#6b21a8",
                        }}
                    />
                    <Bar
                        dataKey="paid_amount"
                        radius={[0, 20, 20, 0]}
                        barSize={18}
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={`url(#colorUv${index})`}
                            />
                        ))}
                    </Bar>

                    <defs>
                        {data.map((_, index) => (
                            <linearGradient
                                id={`colorUv${index}`}
                                key={index}
                                x1="0"
                                y1="0"
                                x2="1"
                                y2="0"
                            >
                                <stop offset="0%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.7} />
                                <stop offset="100%" stopColor={COLORS[(index + 1) % COLORS.length]} stopOpacity={1} />
                            </linearGradient>
                        ))}
                    </defs>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}


