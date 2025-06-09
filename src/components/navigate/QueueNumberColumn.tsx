"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { dbFire } from "@/app/firebase/firebase";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import QRScannerPopup from "./QRScannerAutoPickup";

interface Props {
  order_id: string;
  onClose: () => void;
}

export default function MarkPickedUpButton({ order_id }: Props) {
  const [loading, setLoading] = useState(true);
  const [pickedUp, setPickedUp] = useState(false);
  const [isClickable, setIsClickable] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);

  useEffect(() => {
    const transactionRef = doc(dbFire, "transactions", order_id);

    const unsubscribe = onSnapshot(transactionRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const isPickedUp = data?.queue_status?.picked_up === true;
        setPickedUp(isPickedUp);
        setIsClickable(data?.queue_number_status === "waiting");

        if (isPickedUp) {
          setFadeOut(true);
          setTimeout(() => setShowChecklist(true), 300);
        } else {
          setFadeOut(false);
          setShowChecklist(false);
        }
      }
      setLoading(false);
    });

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
    } catch (error) {
      alert("Failed to update status. Please try again.");
      console.error(error);
    }
  };

  const handleScanSuccess = async () => {
    setShowScanner(false);
    setFadeOut(true);
    await markPickedUp();

    setShowChecklist(false);
    setTimeout(() => setShowChecklist(true), 1000);
  };

  if (loading) {
    return (
      <button disabled className="px-4 py-2 bg-gray-400 text-white rounded cursor-wait">
        Loading...
      </button>
    );
  }

  return (
    <>
      {/* Fixed-height container to avoid layout jump */}
      <div className="min-h-[48px] flex items-center justify-center">
        {!fadeOut && (
          <div className="flex gap-3 transition-opacity duration-300 opacity-100">
            <button
              onClick={async () => {
                await markPickedUp();
                setFadeOut(true);
                setTimeout(() => setShowChecklist(true), 300);
              }}
              disabled={!isClickable}
              className={`px-4 py-2 rounded text-white transition-all duration-200 ${
                isClickable ? "bg-green-500 hover:bg-green-600" : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Manual
            </button>

            <button
              onClick={() => setShowScanner(true)}
              disabled={!isClickable}
              className={`px-4 py-2 rounded text-white transition-all duration-200 ${
                isClickable ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Scan
            </button>
          </div>
        )}

        {fadeOut && showChecklist && (
          <div className="inline-flex items-center space-x-2 text-green-600 font-semibold">
            <CheckCircleIcon className="w-6 h-6" />
            <span>Picked up successfully!</span>
          </div>
        )}
      </div>

      {/* Scanner popup */}
      {showScanner && (
        <QRScannerPopup
          order_id={order_id}
          onClose={() => setShowScanner(false)}
          onSuccess={handleScanSuccess}
        />
      )}
    </>
  );
}
