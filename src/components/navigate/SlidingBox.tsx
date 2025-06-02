// components/SlidingBox.tsx
"use client";
import React from "react";

interface SlidingBoxProps {
  isVisible: boolean;
  onClose: () => void;
}

const SlidingBox: React.FC<SlidingBoxProps> = ({ isVisible, onClose }) => {
  return (
    <div
      className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 z-50 ${
        isVisible ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="font-bold text-gray-700">Menu</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          ✖
        </button>
      </div>
      <div className="p-4">
        <p>This is your sliding box!</p>
      </div>
    </div>
  );
};

export default SlidingBox;
