"use client";
import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { dbFire } from "../../app/firebase/firebase";

interface SlidingBoxProps {
  isVisible: boolean;
  onClose: () => void;
}

interface QueueEntry {
  queue_number: string;
  order_id: string;
  user_name?: string; // optional if you store name inside transaction
}

const SlidingBox: React.FC<SlidingBoxProps> = ({ isVisible, onClose }) => {
  const [queueEntries, setQueueEntries] = useState<QueueEntry[]>([]);

  useEffect(() => {
    if (!isVisible) return;

    const transQuery = query(
      collection(dbFire, "transactions"),
      where("queue_number_status", "==", "waiting")
    );

    const unsubTrans = onSnapshot(transQuery, (snapshot) => {
      const data: QueueEntry[] = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          queue_number: d.queue_number,
          order_id: d.order_id,
          user_name: d.raw_webhook?.payer_email?.split("@")[0] || "Unknown",
        };
      });
      setQueueEntries(data);
    });

    return () => {
      unsubTrans();
    };
  }, [isVisible]);

  return (
    <div
      className={`fixed top-0 right-0 h-full w-72 bg-white shadow-lg transform transition-transform duration-300 z-50 ${
        isVisible ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="font-bold text-gray-700">Waiting Queue</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          ✖
        </button>
      </div>

      <div className="p-4 space-y-2 overflow-y-auto h-[calc(100%-60px)]">
        {queueEntries.length === 0 ? (
          <p className="text-sm text-gray-400">No waiting transactions.</p>
        ) : (
          queueEntries.map((entry, index) => (
            <div
              key={index}
              className="p-3 border rounded shadow-sm bg-blue-50 text-blue-800"
            >
              <p className="font-semibold">Queue: {entry.queue_number}</p>
              <p className="text-xs">Order ID: {entry.order_id}</p>
              <p className="text-xs">User: {entry.user_name}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SlidingBox;
