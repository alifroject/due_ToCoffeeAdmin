"use client";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { dbFire } from "../../../app/firebase/firebase";
import { ShoppingBasket, CheckCircle, Ban } from "lucide-react";

const collections = ["pastries", "coffees", "foods", "drinks"];

function useCountUp(target: number, speed = 20) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let current = 0;
    const step = Math.ceil(target / speed);
    const interval = setInterval(() => {
      current += step;
      if (current >= target) {
        setCount(target);
        clearInterval(interval);
      } else {
        setCount(current);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [target, speed]);

  return count;
}

export default function HeaderStats() {
  const [availableTarget, setAvailableTarget] = useState(0);
  const [unavailableTarget, setUnavailableTarget] = useState(0);

  const availableCount = useCountUp(availableTarget);
  const unavailableCount = useCountUp(unavailableTarget);

  useEffect(() => {
    const fetchData = async () => {
      let available = 0;
      let unavailable = 0;

      for (const name of collections) {
        const snapshot = await getDocs(collection(dbFire, name));
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.available === true) available++;
          else if (data.available === false) unavailable++;
        });
      }

      setAvailableTarget(available);
      setUnavailableTarget(unavailable);
    };

    fetchData();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center bg-blue-100 p-6 rounded-xl shadow font-sans">
      {/* Product Types */}
      <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center space-y-2">
        <ShoppingBasket size={36} className="text-blue-500" />
        <h2 className="text-2xl font-bold tracking-wide text-gray-800">4 Product Types</h2>
        <p className="text-sm text-gray-500">Pastries, Coffees, Foods, Drinks</p>
      </div>

      {/* Available */}
      <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center space-y-2">
        <CheckCircle size={36} className="text-green-500" />
        <h2 className="text-2xl font-bold tracking-wide text-gray-800">{availableCount} Available</h2>
        <p className="text-sm text-green-600">Items in stock</p>
      </div>

      {/* Unavailable */}
      <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center space-y-2">
        <Ban size={36} className="text-red-500" />
        <h2 className="text-2xl font-bold tracking-wide text-gray-800">{unavailableCount} Unavailable</h2>
        <p className="text-sm text-red-600">Out of stock</p>
      </div>
    </div>
  );
}
