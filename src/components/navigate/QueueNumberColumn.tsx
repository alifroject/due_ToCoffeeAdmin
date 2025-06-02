"use client";

import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  getDocs,
  updateDoc,
  setDoc,
  collection,
} from "firebase/firestore";
import { dbFire } from "../../app/firebase/firebase";

interface Props {
  orderId: string;
}

export default function QueueNumberColumn({ orderId }: Props) {
  const [showBox, setShowBox] = useState(false);
  const [queueNumber, setQueueNumber] = useState<string | null>(null);
  const [queueStatus, setQueueStatus] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("waiting");
  const [userName, setUserName] = useState<string | null>(null);


  const getDoubleLettersByHour = (date: Date) => {
    const hour = date.getHours();
    const openingHour = 7;
    const closingHour = 21;

    if (hour < openingHour || hour > closingHour) return "XX";

    const index = hour - openingHour;
    const charCode = "A".charCodeAt(0) + index;
    const letter = String.fromCharCode(charCode);
    return letter + letter;
  };

  const assignQueueNumber = async () => {
    const transactionRef = doc(dbFire, "transactions", orderId);
    const transactionSnap = await getDoc(transactionRef);
    if (!transactionSnap.exists()) return;

    const data = transactionSnap.data();
    const username = data.userName || data.user_name || data.name || "Unknown";

    const createdAt = data.created_at?.toDate?.() ?? new Date();
    const letterGroup = getDoubleLettersByHour(createdAt);
    const dd = String(createdAt.getDate()).padStart(2, "0");
    const mm = String(createdAt.getMonth() + 1).padStart(2, "0");
    const yyyy = createdAt.getFullYear();
    const dateStr = `${dd}${mm}${yyyy}`;

    const transactionsRef = collection(dbFire, "transactions");
    const snapshot = await getDocs(transactionsRef);
    const todayGroupDocs = snapshot.docs.filter((doc) => {
      const queue = doc.data().queue_number;
      return queue?.startsWith(letterGroup) && queue?.endsWith(dateStr);
    });

    const numberInGroup = todayGroupDocs.length + 1;
    const newQueueNumber = `${letterGroup}${numberInGroup}_${dateStr}`;

    await updateDoc(transactionRef, {
      queue_number_status: "waiting",
      queue_number: newQueueNumber,
    });

    const queueRef = doc(dbFire, "queue", orderId);
    await setDoc(queueRef, {
      queue_number: newQueueNumber,
      queue_number_status: "waiting",
      name: username,
      created_at: createdAt,
    });

    setQueueNumber(newQueueNumber);
    setQueueStatus("waiting");
    setShowBox(false);
    setUserName("");

  };

  const updateQueueStatus = async () => {
    const transactionRef = doc(dbFire, "transactions", orderId);
    await updateDoc(transactionRef, {
      queue_number_status: selectedStatus,
    });

    const queueRef = doc(dbFire, "queue", orderId);
    await updateDoc(queueRef, {
      queue_number_status: selectedStatus,
    });

    setQueueStatus(selectedStatus);
    setShowBox(false);
  };

  const fetchQueueData = async () => {
    const transactionRef = doc(dbFire, "transactions", orderId);
    const transactionSnap = await getDoc(transactionRef);
    if (transactionSnap.exists()) {
      const data = transactionSnap.data();
      setQueueNumber(data.queue_number ?? null);
      setQueueStatus(data.queue_number_status ?? null);
    }

    const queueRef = doc(dbFire, "queue", orderId);
    const queueSnap = await getDoc(queueRef);
    if (queueSnap.exists()) {
      const data = queueSnap.data();
      setUserName(data.name ?? null);
    }
  };


  useEffect(() => {
    fetchQueueData();
  }, []);

  return (
    <td className="px-4 py-2 text-center">
      <div className="flex flex-col items-center gap-2">
        {queueNumber ? (
          <span className="font-bold text-blue-600">{queueNumber}</span>
        ) : (
          <span className="text-sm text-gray-400 italic">Not set</span>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowBox(true);
              setIsEditMode(false);
            }}
            disabled={!!queueNumber} // Disable if queueNumber is already set
            className={`px-3 py-1 rounded text-xs shadow text-white
    ${queueNumber
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
              }`}
          >
            Add
          </button>

          <button
            onClick={async () => {
              await fetchQueueData(); // Make sure name is fetched
              setShowBox(true);
              setIsEditMode(true);
              setSelectedStatus(queueStatus ?? "waiting");
            }}

            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs shadow"
          >
            Edit
          </button>
        </div>

        {/* Display status below buttons */}
        <span className="text-sm text-gray-700 mt-1">
          Status:
          <span
            className={`font-medium ${queueStatus === "waiting"
                ? "text-green-600"
                : queueStatus === "picked up"
                  ? "text-yellow-700"
                  : queueStatus === "expired"
                    ? "text-red-600"
                    : "text-gray-400"
              }`}
          >
            {typeof queueStatus === "string" ? queueStatus : "Fill the status"}
          </span>


        </span>

      </div>

      {showBox && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80 relative">
            <button
              onClick={() => setShowBox(false)}
              className="absolute top-2 right-3 text-gray-700 hover:text-red-600 text-sm"
            >
              ✕
            </button>

            {!isEditMode ? (
              <>
                <h2 className="text-lg text-black font-semibold mb-4">
                  Assign Queue Number
                </h2>
                <p className="text-sm text-black mb-4">
                  Assigns queue number based on time. 07:00 = AA, ..., 21:00 = OO.
                </p>
                <button
                  onClick={assignQueueNumber}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm w-full"
                >
                  Confirm Assign
                </button>
              </>
            ) : (
              <>
                <h2 className="text-lg text-black font-semibold mb-2">
                  Edit Queue Status
                </h2>

                <div className="mb-4">
                  <p className="text-sm text-gray-800">
                    <strong>Queue:</strong>
                    <span className="text-blue-600 font-semibold">{queueNumber ?? "-"}</span>
                  </p>
                  <p className="text-sm text-gray-800">
                    <strong>Name:</strong>
                    <span className="font-medium">{userName ?? "-"}</span>
                  </p>
                </div>

                <label className="block text-sm mb-2 text-gray-700">Select Status:</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full border text-black rounded px-3 py-2 text-sm mb-4"
                >
                  <option value="waiting">Waiting</option>
                  <option value="picked up">Picked Up</option>
                  <option value="expired">Expired</option>
                </select>

                <button
                  onClick={updateQueueStatus}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded text-sm w-full"
                >
                  Update Status
                </button>
              </>
            )}
          </div>
        </div>
      )}

    </td>
  );
}
