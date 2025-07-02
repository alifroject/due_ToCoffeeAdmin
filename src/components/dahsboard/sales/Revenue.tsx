"use client";

import {
    collection,
    getDocs,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { dbFire } from "../../../app/firebase/firebase";
import { CreditCard, Package, Users, DollarSign } from "lucide-react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import "leaflet/dist/leaflet.css";


function CountUpNumber({ end, prefix = "", duration = 1000 }: { end: number, prefix?: string, duration?: number }) {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        let start = 0;
        const increment = Math.ceil(end / (duration / 16)); // ~60fps
        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setCurrent(end);
                clearInterval(timer);
            } else {
                setCurrent(start);
            }
        }, 16);
        return () => clearInterval(timer);
    }, [end, duration]);

    return <>{prefix}{end.toLocaleString("id-ID") === "0" ? "0" : current.toLocaleString("id-ID")}</>;
}


export default function RevenueHeader() {
    const [stats, setStats] = useState({
        transactions: 0,
        products: 0,
        users: 0,
        profits: 0,
    });

    const [prevStats, setPrevStats] = useState({
        transactions: 80,
        products: 100,
        users: 60,
        profits: 200000,
    }); // Simulated previous data for demo

    useEffect(() => {
        const fetchStats = async () => {
            const transSnap = await getDocs(collection(dbFire, "transactions"));
            const transactions = transSnap.size;

            const usersSnap = await getDocs(collection(dbFire, "users"));
            const users = usersSnap.size;

            const productCollections = ["coffees", "drinks", "foods", "pastries"];
            let products = 0;
            for (const col of productCollections) {
                const snap = await getDocs(collection(dbFire, col));
                products += snap.size;
            }

            let profits = 0;
            transSnap.forEach((doc) => {
                const data = doc.data();
                if (data.raw_webhook?.paid_amount) {
                    profits += Number(data.raw_webhook.paid_amount);
                }
            });

            setStats({ transactions, users, products, profits });
        };

        fetchStats();
    }, []);

    const calcPercent = (current: number, prev: number) => {
        if (prev === 0) return 0;
        return ((current - prev) / prev) * 100;
    };

    const getChangeIndicator = (current: number, previous: number) => {
        const change = calcPercent(current, previous);
        const clampedChange = Math.min(Math.abs(change), 100); // clamp to 100%
        const isPositive = change >= 0;
        const Icon = isPositive ? ArrowUpRight : ArrowDownRight;
        const color = isPositive ? "text-green-500" : "text-red-500";

        return (
            <div className={`flex items-center text-xs font-medium ${color}`}>
                <Icon className="w-4 h-4 mr-1" />
                {clampedChange.toFixed(1)}%
            </div>
        );
    };


    const revenueStats = [
        {
            label: "Total Transactions",
            value: stats.transactions,
            icon: <CreditCard className="text-blue-500 w-6 h-6" />,
            prev: prevStats.transactions,
        },
        {
            label: "Total Products",
            value: stats.products,
            icon: <Package className="text-green-500 w-6 h-6" />,
            prev: prevStats.products,
        },
        {
            label: "Total Users",
            value: stats.users,
            icon: <Users className="text-yellow-500 w-6 h-6" />,
            prev: prevStats.users,
        },
        {
            label: "Total Profits",
            value: `Rp${stats.profits.toLocaleString("id-ID")}`,
            numericValue: stats.profits,
            icon: <DollarSign className="text-purple-500 w-6 h-6" />,
            prev: prevStats.profits,
        },
    ];

    return (
        <div className="grid grid-cols-1 text-black sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {revenueStats.map((stat) => (
                <div
                    key={stat.label}
                    className="bg-white text-black rounded-xl shadow p-4 flex items-center space-x-4"
                >
                    <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-full">
                        {stat.icon}
                    </div>
                    <div>
                        <p className="text-sm text-black">{stat.label}</p>
                        <p className="text-xl font-semibold text-black">
                            {typeof stat.value === "string" ? (
                                <CountUpNumber
                                    end={stat.numericValue || 0}
                                    prefix="Rp"
                                />
                            ) : (
                                <CountUpNumber end={stat.value} />
                            )}
                        </p>

                        {getChangeIndicator(
                            stat.numericValue ?? stat.value,
                            stat.prev
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
