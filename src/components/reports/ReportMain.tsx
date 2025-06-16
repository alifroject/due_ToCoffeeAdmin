"use client";

import { useState } from "react";
import Sales from "../../components/reports/Sales";
import BestSelling from "../../components/reports/BestSelling";
import LocationAverage from "../../components/reports/LocationAverage";
import ButtonAbove from "../../components/reports/ButtonAbove";

export default function MainReport() {
    const [activePage, setActivePage] = useState("Sales");

    const renderPage = () => {
        switch (activePage) {
            case "Sales":
                return <Sales />;
            case "BestSelling":
                return <BestSelling />;
            case "LocationAverage":
                return <LocationAverage />;
            default:
                return <Sales />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 flex flex-col">
            {/* Header buttons outside */}
            <div className="flex justify-end mb-4 gap-2">
                <ButtonAbove />
            </div>

            {/* Main layout: sidebar + content */}
            <div className="flex gap-6 flex-1 h-0">
                {/* Sidebar */}
                <div className="w-64 bg-gray-200 p-4 rounded-lg shadow flex flex-col">
                    <h2 className="text-sm font-bold mb-4">Reports</h2>
                    <ul className="space-y-2 flex-1">
                        <li>
                            <button className={`w-full text-left p-1 rounded text-xs ${activePage === "Sales" ? "bg-blue-400 text-white" : "hover:bg-blue-200"}`} onClick={() => setActivePage("Sales")}>Sales</button>
                        </li>
                        <li>
                            <button className={`w-full text-left p-1 rounded text-xs ${activePage === "BestSelling" ? "bg-blue-400 text-white" : "hover:bg-blue-200"}`} onClick={() => setActivePage("BestSelling")}>Best Selling</button>
                        </li>
                        <li>
                            <button className={`w-full text-left p-1 rounded text-xs ${activePage === "LocationAverage" ? "bg-blue-400 text-white" : "hover:bg-blue-200"}`} onClick={() => setActivePage("LocationAverage")}>Location Avg</button>
                        </li>
                    </ul>
                </div>

                {/* Main Content */}
                <div className="flex-1 bg-white p-6 rounded-lg shadow flex flex-col">
                    {renderPage()}
                </div>
            </div>
        </div>
    );
}
