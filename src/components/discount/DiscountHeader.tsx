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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-xl shadow-sm p-4 border border-gray-200">
        <h1 className="text-3xl font-semibold text-gray-800">🎉 Discount Manager</h1>

        <div className="flex items-center gap-3">
          {/* Filter Dropdown */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 bg-gray-50 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          >
            <option value="all">All</option>
            <option value="active">Active Only</option>
            <option value="expired">Expired</option>
          </select>

          {/* Add Button */}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow transition duration-150"
          >
            <Plus className="w-4 h-4" />
            Add Discount
          </button>
        </div>
      </div>

      {/* Modal Form */}
      {showModal && <DiscountAddForm onClose={() => setShowModal(false)} />}
    </>
  );
}
