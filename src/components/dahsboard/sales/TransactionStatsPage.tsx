"use client";

import { useEffect, useState } from "react";
import { dbFire } from "../../../app/firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Area,
    Legend,
} from "recharts";

type Transaction = {
    created_at: { seconds: number };
    queue_number_status: string;
};

type GroupedData = {
    date: string;
    picked: number;
    expired: number;
};

export default function TransactionStatsPage() {
    const [chartData, setChartData] = useState<GroupedData[]>([]);
    const [selectedRange, setSelectedRange] = useState<"daily" | "weekly" | "monthly">("daily");

    useEffect(() => {
        const fetchTransactions = async () => {
            const snap = await getDocs(collection(dbFire, "transactions"));
            const transactions = snap.docs.map((doc) => doc.data() as Transaction);

            const grouped: Record<string, GroupedData> = {};

            for (const tx of transactions) {
                const dateObj = new Date(tx.created_at.seconds * 1000);

                let key = "";

                if (selectedRange === "weekly") {
                    key = `${dateObj.getFullYear()}-W${getWeekNumber(dateObj)}`;
                } else if (selectedRange === "monthly") {
                    key = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}`;
                } else {
                    key = dateObj.toISOString().split("T")[0];
                }

                if (!grouped[key]) {
                    grouped[key] = {
                        date: key,
                        picked: 0,
                        expired: 0,
                    };
                }

                const status = tx.queue_number_status;
                if (status === "picked up") {
                    grouped[key].picked += 1;
                } else if (status === "expired") {
                    grouped[key].expired += 1;
                }
            }

            const sorted = Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
            setChartData(sorted);
        };

        fetchTransactions();
    }, [selectedRange]);

    return (
        <div className="p-6 text-black dark:text-white">

            <div className="mb-6">
                <label htmlFor="rangeSelect" className="mr-3 text-black font-medium">
                    Select Range:
                </label>
                <select
                    id="rangeSelect"
                    value={selectedRange}
                    onChange={(e) => setSelectedRange(e.target.value as "daily" | "weekly" | "monthly")}
                    className="p-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-neutral-800"
                >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                </select>
            </div>

            {/* Two-column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Line Chart */}
                {/* Line Chart */}
                <div className="bg-white p-4 rounded-xl shadow border border-gray-100">
                    <h3 className="text-lg font-semibold mb-4 text-black">Line Chart: {selectedRange}</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                            {/* Define stronger neon glow filters */}
                            <defs>
                                <filter id="green-glow" x="-100%" y="-100%" width="300%" height="300%">
                                    <feDropShadow dx="0" dy="9" stdDeviation="15" floodColor="#10B981" floodOpacity="0.9" />
                                </filter>
                                <filter id="red-glow" x="-100%" y="-100%" width="300%" height="300%">
                                    <feDropShadow dx="0" dy="9" stdDeviation="15" floodColor="#EF4444" floodOpacity="0.9" />
                                </filter>
                            </defs>

                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="date" stroke="#4B5563" />
                            <YAxis allowDecimals={false} stroke="#4B5563" />
                            <Tooltip />
                            <Legend />

                            {/* Neon Glow Layer */}
                            <Line
                                type="monotone"
                                dataKey="picked"
                                stroke="#10B981"
                                strokeWidth={3.5}
                                dot={false}
                                name="Picked Up"
                                filter="url(#green-glow)"
                            />
                            <Line
                                type="monotone"
                                dataKey="expired"
                                stroke="#EF4444"
                                strokeWidth={3.5}
                                dot={false}
                                name="Expired"
                                filter="url(#red-glow)"
                            />

                            {/* Solid Line Layer */}
                            <Line
                                type="monotone"
                                dataKey="picked"
                                stroke="#10B981"
                                strokeWidth={2}
                                dot={false}
                                name="Picked Up"
                            />
                            <Line
                                type="monotone"
                                dataKey="expired"
                                stroke="#EF4444"
                                strokeWidth={2}
                                dot={false}
                                name="Expired"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>


                {/* Bar Chart */}
                {/* Bar Chart */}
                <div className="bg-white p-4 rounded-xl shadow border border-gray-100">
                    <h3 className="text-lg font-semibold mb-4 text-black">Bar Chart: {selectedRange}</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" stroke="#333" />
                            <YAxis allowDecimals={false} stroke="#333" />
                            <Tooltip />
                            <Legend />
                            <Bar
                                dataKey="picked"
                                stackId="a"
                                fill="#10B981"
                                radius={[4, 4, 0, 0]}
                                name="Picked Up"
                            />
                            <Bar
                                dataKey="expired"
                                stackId="a"
                                fill="#EF4444"
                                radius={[4, 4, 0, 0]}
                                name="Expired"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

            </div>
        </div>
    );
}

function getWeekNumber(date: Date): number {
    const firstDay = new Date(date.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((date.getTime() - firstDay.getTime()) / (24 * 60 * 60 * 1000));
    return Math.ceil((dayOfYear + firstDay.getDay() + 1) / 7);
}
