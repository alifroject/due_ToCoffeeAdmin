"use client";

import React, { forwardRef, useState } from "react";
import { Transaction } from "./types/transaction";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import { IoMdArrowDropdown } from "react-icons/io";
import Link from "next/link";
import { exportTransactionsToCSV } from "@/components/utils/exportToCSV";



type Props = {
    transactions: Transaction[];
    fromYear: string;
    fromMonth: string;
    fromDate: string;
    toYear: string;
    toMonth: string;
    toDate: string;
    loading: boolean;
    setFromYear: (year: string) => void;
    setFromMonth: (month: string) => void;
    setFromDate: (date: string) => void;
    setToYear: (year: string) => void;
    setToMonth: (month: string) => void;
    setToDate: (date: string) => void;
};

export default function OrderHistoryContent({
    transactions,
    fromYear,
    fromMonth,
    fromDate,
    toYear,
    toMonth,
    toDate,
    loading,
    setFromYear,
    setFromMonth,
    setFromDate,
    setToYear,
    setToMonth,
    setToDate,
}: Props) {
    const fromDateObj = new Date(`${fromYear}-${fromMonth}-${fromDate}`);
    const toDateObj = new Date(`${toYear}-${toMonth}-${toDate}T23:59:59`);



    const formattedFrom = fromDateObj.toLocaleString("id-ID", {
        dateStyle: "full",
        timeStyle: "short",
    });
    const formattedTo = toDateObj.toLocaleString("id-ID", {
        dateStyle: "full",
        timeStyle: "short",
    });

    const CustomInput = forwardRef<HTMLInputElement, any>(({ value, onClick }, ref) => (
        <div
            className="relative w-full"
            onClick={onClick}
            ref={ref as React.Ref<HTMLDivElement>}
            style={{ cursor: "pointer" }}
        >
            <input
                type="text"
                value={value}
                readOnly
                className="w-full bg-white text-gray-800 font-medium border border-blue-300 rounded-xl px-4 py-2 pr-11 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300"
            />
            <IoMdArrowDropdown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none text-xl" />
        </div>
    ));
    const [selectedStatus, setSelectedStatus] = useState<string>(""); // "" means show all

    return (
        <section className="p-6 mx-auto">
            <div className="bg-white border border-blue-100 rounded-2xl p-8 shadow-xl space-y-8 font-sans text-gray-800">
                <div className="relative bg-white border border-blue-100 rounded-2xl p-6 shadow-lg space-y-4">
                    {/* Export button top-right */}
                    <button
                        className="absolute top-5 right-5 flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded"
                        onClick={() =>
                            exportTransactionsToCSV(
                                transactions,
                                fromDateObj,
                                toDateObj,
                                selectedStatus
                            )
                        }
                        aria-label="Export transactions to CSV"
                    >
                        <span className="text-sm font-semibold tracking-wide" style={{ fontVariant: 'small-caps' }}>
                            Export
                        </span>
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M7 17L17 7M7 7h10v10" />
                        </svg>
                    </button>

                    {/* Title */}
                    <h1 className="text-2xl md:text-3xl font-semibold text-blue-900 tracking-wide select-none" style={{ fontVariant: 'small-caps' }}>
                        📦 Transaction History
                    </h1>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* From Date */}
                    <div>
                        <label className="block mb-2 text-gray-700 font-medium tracking-wide">
                            From Date
                        </label>
                        <DatePicker
                            selected={fromDateObj}
                            onChange={(date) => {
                                if (date) {
                                    setFromYear(date.getFullYear().toString());
                                    setFromMonth((date.getMonth() + 1).toString().padStart(2, "0"));
                                    setFromDate(date.getDate().toString().padStart(2, "0"));
                                }
                            }}
                            dateFormat="yyyy-MM-dd"
                            customInput={<CustomInput />}
                            maxDate={toDateObj}
                        />
                    </div>

                    {/* To Date */}
                    <div>
                        <label className="block mb-2 text-gray-700 font-medium tracking-wide">
                            To Date
                        </label>
                        <DatePicker
                            selected={toDateObj}
                            onChange={(date) => {
                                if (date) {
                                    setToYear(date.getFullYear().toString());
                                    setToMonth((date.getMonth() + 1).toString().padStart(2, "0"));
                                    setToDate(date.getDate().toString().padStart(2, "0"));
                                }
                            }}
                            dateFormat="yyyy-MM-dd"
                            customInput={<CustomInput />}
                            minDate={fromDateObj}
                        />
                    </div>

                    {/* Queue Number Status */}
                    <div>
                        <label className="block mb-2 text-gray-700 font-medium tracking-wide">
                            Queue Number Status
                        </label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full bg-white text-gray-900 font-semibold border border-blue-200 rounded-xl px-5 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 tracking-wide"
                        >
                            <option value="">All</option>
                            <option value="expired">Expired</option>
                            <option value="picked up">Picked Up</option>
                            <option value="waiting">Waiting</option>
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <p className="mt-4 text-blue-600 font-semibold">Loading...</p>
            ) : (
                <div className="overflow-x-auto mt-6 rounded-lg shadow-lg border border-gray-300 bg-white">
                    <table className="min-w-full divide-y divide-gray-200 font-sans text-gray-700">
                        <thead className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-300">
                            <tr>
                                {["Order ID", "Amount", "Payment Status", "Order Status", "Created At", "Customer", "View"].map((title) => (
                                    <th
                                        key={title}
                                        className="px-5 py-3 text-left text-xs font-medium tracking-wide text-blue-900 uppercase select-none"
                                        style={{ fontVariant: 'small-caps' }}
                                    >
                                        {title}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {transactions
                                .filter((transaction) => {
                                    const transactionDate = transaction.created_at.toDate();
                                    const isWithinDateRange =
                                        transactionDate >= fromDateObj && transactionDate <= toDateObj;
                                    const matchesStatus =
                                        selectedStatus === "" ||
                                        (transaction.queue_number_status &&
                                            transaction.queue_number_status.toLowerCase() === selectedStatus.toLowerCase());

                                    return isWithinDateRange && matchesStatus;
                                })
                                .sort(
                                    (a, b) =>
                                        b.created_at.toDate().getTime() - a.created_at.toDate().getTime()
                                )
                                .map((transaction) => {
                                    const transactionDate = transaction.created_at.toDate();
                                    return (
                                        <tr
                                            key={transaction.order_id}
                                            className="hover:bg-blue-50 transition-colors duration-300 cursor-pointer"
                                            style={{ fontFeatureSettings: '"liga", "clig", "calt"' }}
                                        >
                                            <td className="px-5 py-3 text-sm font-semibold text-blue-900 tracking-tight whitespace-nowrap">
                                                {transaction.order_id}
                                            </td>
                                            <td className="px-5 py-3 text-sm text-blue-700 tracking-tight">
                                                Rp {transaction.amount.toLocaleString("id-ID")}
                                            </td>
                                            <td className="px-5 py-3 text-sm text-blue-700 tracking-tight capitalize">
                                                {transaction.status}
                                            </td>
                                            <td className="px-5 py-3 text-sm text-blue-700 tracking-tight capitalize">
                                                {transaction.queue_number_status}
                                            </td>
                                            <td className="px-5 py-3 text-sm text-blue-700 tracking-tight font-mono">
                                                {transactionDate.toLocaleString("id-ID", {
                                                    dateStyle: "full",
                                                    timeStyle: "short",
                                                })}
                                            </td>
                                            <td className="px-5 py-3 text-sm text-blue-700 tracking-tight font-serif">
                                                {transaction.userName} <span className="text-gray-400">({transaction.userEmail})</span>
                                            </td>
                                            <td className="px-5 py-3 text-sm">
                                                <Link
                                                    href={`/transaction-history/${transaction.order_id}`}
                                                    className="text-red-600 font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-red-300 rounded"
                                                    tabIndex={0}
                                                >
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>


            )}
        </section>
    );
}
