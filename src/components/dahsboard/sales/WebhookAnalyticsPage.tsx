"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { dbFire } from "../../../app/firebase/firebase";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

type RawWebhook = {
    bank_code: string;
    amount: number;
    currency: string;
    created: string;
};

export default function WebhookAnalyticsPage() {
    const [bankData, setBankData] = useState<{ name: string; value: number }[]>([]);
    const [currencyData, setCurrencyData] = useState<
        { currency: string; country: string; count: number }[]
    >([]);

    useEffect(() => {
        (async () => {
            const snap = await getDocs(collection(dbFire, "transactions"));
            const calls: RawWebhook[] = [];

            snap.docs.forEach(doc => {
                const data = doc.data();
                if (data.raw_webhook) calls.push(data.raw_webhook);
            });

            const now = new Date();
            const threshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            const recent = calls.filter(rw => new Date(rw.created) >= threshold);

            // Bank usage data
            const byBank: Record<string, number> = {};
            recent.forEach(rw => {
                byBank[rw.bank_code] = (byBank[rw.bank_code] || 0) + 1;
            });
            const bankArray = Object.entries(byBank).map(([name, value]) => ({
                name,
                value,
            }));
            setBankData(bankArray);

            // Currency usage data
            const byCurrency: Record<string, number> = {};
            recent.forEach(rw => {
                byCurrency[rw.currency] = (byCurrency[rw.currency] || 0) + 1;
            });

            const entries = Object.entries(byCurrency);
            const mapped = await Promise.all(
                entries.map(async ([currency, count]) => {
                    try {
                        const res = await fetch(
                            `https://restcountries.com/v3.1/currency/${currency}`
                        );
                        const json = await res.json();
                        const country =
                            Array.isArray(json) && json[0]?.name?.common
                                ? json[0].name.common
                                : currency;
                        return { currency, country, count };
                    } catch (err) {
                        return { currency, country: currency, count };
                    }
                })
            );

            setCurrencyData(mapped);
        })();
    }, []);

    const COLORS = ["#4a90e2", "#50e3c2", "#f5a623", "#e94c6f", "#9013fe"];

    return (
        <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Pie Chart Card */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">
                        🏦 Bank Code Usage (Last 30 Days)
                    </h3>
                    {bankData.length === 0 ? (
                        <p className="text-gray-400">No data available</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={bankData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label={({ name, percent }) =>
                                        `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                                    }
                                >
                                    {bankData.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#fff",
                                        borderRadius: "8px",
                                        border: "1px solid #eee",
                                        fontSize: "0.9rem",
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Currency Table Card */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">
                        💱 Top Currencies (Last 30 Days)
                    </h3>
                    {currencyData.length === 0 ? (
                        <p className="text-gray-400">No data available</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-gray-700">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="text-left px-4 py-2">No</th>
                                        <th className="text-left px-4 py-2">Currency</th>
                                        <th className="text-left px-4 py-2">Country</th>
                                        <th className="text-left px-4 py-2">Count</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currencyData.map((row, i) => (
                                        <tr key={`${row.currency}-${row.country}`} className="hover:bg-gray-100">
                                            <td className="px-4 py-2">{i + 1}</td>
                                            <td className="px-4 py-2">{row.currency}</td>
                                            <td className="px-4 py-2">{row.country}</td>
                                            <td className="px-4 py-2">{row.count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
