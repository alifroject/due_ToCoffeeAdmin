"use client";

import React, { forwardRef } from "react";

import { Transaction } from "./types/transaction";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import { IoMdArrowDropdown } from "react-icons/io";

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
  const toDateObj = new Date(`${toYear}-${toMonth}-${toDate}`);

  const formattedFrom = fromDateObj.toLocaleString("id-ID", {
    dateStyle: "full",
    timeStyle: "short",
  });
  const formattedTo = toDateObj.toLocaleString("id-ID", {
    dateStyle: "full",
    timeStyle: "short",
  });

  // Custom input component for DatePicker with icon inside
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

  return (
    <section className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">📅 Order History</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            placeholderText="Pilih tanggal mulai"
            customInput={<CustomInput />}
            maxDate={toDateObj} // Prevent picking from date after to date
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
            placeholderText="Pilih tanggal selesai"
            customInput={<CustomInput />}
            minDate={fromDateObj} // Prevent picking to date before from date
          />
        </div>
      </div>

      <div className="mt-6">
        <p>
          Showing orders from <strong>{formattedFrom}</strong> to <strong>{formattedTo}</strong>
        </p>
      </div>

      {/* You can render your filtered transactions based on fromDateObj and toDateObj here */}
    </section>
  );
}
