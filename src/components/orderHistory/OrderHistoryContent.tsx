"use client";

import React, { forwardRef, useState } from "react";
import { Transaction } from "./types/transaction";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import { IoMdArrowDropdown } from "react-icons/io";
import Link from "next/link";


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
            <div className="bg-white border border-blue-200 rounded-xl p-6 shadow-md space-y-6">
                {/* Row 1: Title */}
                <h1 className="text-3xl font-bold">📦 Transaction History</h1>

                {/* Row 2: Filter controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* From Date Picker */}
                    <div>
                        <label className="block mb-2 font-semibold text-gray-700">From Date</label>
                        <DatePicker
                            selected={fromDateObj}
                            onChange={(date: Date | null) => {
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

                    {/* To Date Picker */}
                    <div>
                        <label className="block mb-2 font-semibold text-gray-700">To Date</label>
                        <DatePicker
                            selected={toDateObj}
                            onChange={(date: Date | null) => {
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
                        <label className="block mb-2 font-semibold text-gray-700">Queue Number Status</label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full bg-white text-gray-800 font-medium border border-blue-300 rounded-xl px-4 py-2 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300"
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
                <div className="overflow-x-auto mt-4">
                    <table className="min-w-full divide-y divide-blue-200 border border-blue-200 rounded-xl bg-white shadow">
                        <thead className="bg-blue-100">
                            <tr>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-blue-800">Order ID</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-blue-800">Amount</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-blue-800">Payment Status</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-blue-800">Order Status</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-blue-800">Created At</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-blue-800">Customer</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-blue-800">View</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-100">
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
                                        <tr key={transaction.order_id} className="hover:bg-blue-50 transition">
                                            <td className="px-4 py-2 text-sm font-medium text-blue-900">{transaction.order_id}</td>
                                            <td className="px-4 py-2 text-sm text-blue-800">Rp {transaction.amount.toLocaleString("id-ID")}</td>
                                            <td className="px-4 py-2 text-sm text-blue-800">{transaction.status}</td>
                                            <td className="px-4 py-2 text-sm text-blue-800">{transaction.queue_number_status}</td>
                                            <td className="px-4 py-2 text-sm text-blue-800">
                                                {transactionDate.toLocaleString("id-ID", {
                                                    dateStyle: "full",
                                                    timeStyle: "short",
                                                })}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-blue-800">
                                                {transaction.userName} ({transaction.userEmail})
                                            </td>
                                            <td>
                                               <Link
                                               href={`/transaction-history/${transaction.order_id}`}
                                               className="text-red-600"
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
