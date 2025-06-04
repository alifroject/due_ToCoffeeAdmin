"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { dbFire } from "../../app/firebase/firebase";
import { CheckCircleIcon } from "@heroicons/react/24/solid"; // Or any icon you want to use

interface Props {
  order_id: string;
}

export default function MarkPickedUpButton({ order_id }: Props) {
  const [isClickable, setIsClickable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pickedUp, setPickedUp] = useState(false);

  useEffect(() => {
    const transactionRef = doc(dbFire, "transactions", order_id);

    const unsubscribe = onSnapshot(
      transactionRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const ready = data?.queue_status?.ready_for_pickup;
          const picked = data?.queue_status?.picked_up;

          setIsClickable(ready === true && picked !== true);
          setPickedUp(picked === true);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error listening to transaction:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [order_id]);

  const markPickedUp = async () => {
    try {
      const transactionRef = doc(dbFire, "transactions", order_id);
      const queueRef = doc(dbFire, "queue", order_id);

      await updateDoc(transactionRef, {
        queue_number_status: "picked up",
        "queue_status.picked_up": true,
      });

      await updateDoc(queueRef, {
        queue_number_status: "picked up",
      });

      alert("Status updated to picked up.");
      setIsClickable(false);
      setPickedUp(true);
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update status. Please try again.");
    }
  };

  if (loading) {
    return (
      <button className="px-4 py-2 bg-gray-400 text-white rounded cursor-wait" disabled>
        Loading...
      </button>
    );
  }

  if (pickedUp) {
    // Show checklist icon and message instead of button
    return (
      <div className="flex items-center space-x-2 text-green-600 font-semibold">
        <CheckCircleIcon className="w-6 h-6" />
        <span>this is picked up by customer</span>
      </div>
    );
  }

  return (
    <button
      onClick={markPickedUp}
      disabled={!isClickable}
      className={`px-4 py-2 rounded text-white transition-all duration-200 ${
        isClickable
          ? "bg-green-500 hover:bg-green-600 cursor-pointer"
          : "bg-gray-400 cursor-not-allowed"
      }`}
    >
      Mark Picked Up
    </button>
  );
}
