"use client";

import { useState } from "react";
import DiscountHeader from "./DiscountHeader";
import DiscountItems from "./DiscountItems";
import DiscountEditForm from "./DiscountEditForm";

export default function MainDiscount() {
  const [filter, setFilter] = useState<string>("all");
  const [selectedDiscountId, setSelectedDiscountId] = useState<string>(""); // always a string, not null

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <DiscountHeader filter={filter} setFilter={setFilter} />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Discount List */}
        <div className="rounded-xl bg-white shadow border border-gray-200 p-6">
          <p className="text-gray-600">
            Showing discounts: <strong>{filter}</strong>
          </p>
          <DiscountItems onEdit={(id: string) => setSelectedDiscountId(id)} />
        </div>

        {/* Right: Edit Form always visible */}
        <div className="rounded-xl bg-white shadow border border-gray-200 p-6">
          <DiscountEditForm
            id={selectedDiscountId}
            onClose={() => setSelectedDiscountId("")}
          />
        </div>
      </div>
    </main>
  );
}
