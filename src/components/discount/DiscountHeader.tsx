"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import DiscountAddForm from "./DiscountAddForm"; // adjust import path

interface DiscountHeaderProps {
  filter: string;
  setFilter: (value: string) => void;
}

export default function DiscountHeader({ filter, setFilter }: DiscountHeaderProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white rounded-2xl shadow-md p-6 border border-gray-100 font-sans">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-wide select-none" style={{ fontVariant: 'small-caps' }}>
          🎉 Discount Manager
        </h1>

        <div className="flex items-center gap-4">
          {/* Filter Dropdown */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-2 text-sm text-gray-800 bg-gray-50 focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm transition duration-300 tracking-wide"
          >
            <option value="all">All</option>
            <option value="active">Active Only</option>
            <option value="expired">Expired</option>
          </select>

          {/* Add Button */}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl shadow-md transition duration-200 font-semibold tracking-wide select-none"
            aria-label="Add Discount"
          >
            <Plus className="w-5 h-5" />
            Add Discount
          </button>
        </div>
      </div>

      {/* Modal Form */}
      {showModal && <DiscountAddForm onClose={() => setShowModal(false)} />}
    </>

  );
}
