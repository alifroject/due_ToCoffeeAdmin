"use client";

import { useState } from "react";
import DiscountHeader from "./DiscountHeader"; // adjust path if needed
import DiscountItems from "./DiscountItems"
export default function MainDiscount() {
    const [filter, setFilter] = useState<string>("all");

    return (
        <main className="p-6 bg-gray-50 min-h-screen">
            {/* Header Component */}
            <DiscountHeader filter={filter} setFilter={setFilter} />

            {/* Main Content Placeholder */}
            <div className="mt-6 p-6 rounded-xl bg-white shadow border border-gray-200">
                <p className="text-gray-600">Showing discounts: <strong>{filter}</strong></p>
                <DiscountItems />
            </div>
        </main>
    );
}
