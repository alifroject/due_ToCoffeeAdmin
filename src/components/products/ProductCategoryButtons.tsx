"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

type Props = {
  selected: string;
  setSelected: (val: string) => void;
};

const categories = [
  { id: "coffee", label: "Coffee" },
  { id: "drink", label: "Drink" },
  { id: "pastry", label: "Pastry" },
  { id: "food", label: "Food" },
];

export default function ProductCategoryButtons({ selected, setSelected }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full space-y-4">
      {/* Mobile Dropdown */}
      <div className="relative block md:hidden">
        <button
          className="w-full flex items-center justify-between px-4 py-2 bg-orange-400 text-white rounded-md shadow transition hover:bg-orange-500"
          onClick={() => setOpen((prev) => !prev)}
        >
          <span>{categories.find((c) => c.id === selected)?.label || "Select Category"}</span>
          <ChevronDown className={`ml-2 transition-transform ${open ? "rotate-180" : ""}`} size={18} />
        </button>
        {open && (
          <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-md shadow-md overflow-hidden">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelected(cat.id);
                  setOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm relative overflow-hidden group
                  ${selected === cat.id ? "font-semibold text-orange-700" : "text-gray-700"}
                `}
              >
                <span
                  className="absolute bottom-0 left-0 w-full h-0 bg-orange-200 group-hover:h-full transition-all duration-500 ease-in-out z-0"
                />
                <span className="relative z-10">{cat.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Horizontal Buttons */}
      <div className="hidden md:flex gap-4">
        {categories.map((cat) => {
          const isSelected = selected === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelected(cat.id)}
              className={`relative overflow-hidden px-4 py-2 rounded-md font-medium transition-all duration-300 border
                ${isSelected
                  ? "text-white bg-transparent border-orange-300"
                  : "text-gray-800 bg-white border-gray-300 hover:text-white"}`}
            >
              {/* Coffee fill animation */}
              <span
                className={`absolute bottom-0 left-0 w-full ${
                  isSelected ? "h-full" : "h-0 hover:h-full"
                } transition-all duration-500 ease-in-out z-0`}
                style={{ backgroundColor: "#D2B48C" }} // coffee-cream color
              />
              <span className="relative z-10">{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
