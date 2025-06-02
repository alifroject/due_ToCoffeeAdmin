"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { dbFire } from "../../../firebase/firebase"; // Ensure dbFire is correctly initialized
import ModifyContent from "./ModifyContent"; // Import your display component

export default function CoffeeModifyPage() {
  const params = useParams();
  const coffeeId = params.id; // Ensure this is the correct dynamic param

  const [coffeeData, setCoffeeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (coffeeId) {
      const fetchCoffeeData = async () => {
        try {
          // Ensure coffeeId is a valid string and not an array
          if (Array.isArray(coffeeId) || !coffeeId) {
            console.error("Invalid Coffee ID:", coffeeId);
            return;
          }

          // Firestore document reference with correct path format
          const docRef = doc(dbFire, "coffees", coffeeId);  // Ensure it's a valid collection name and ID

          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setCoffeeData({ id: docSnap.id, ...docSnap.data() });
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching coffee data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchCoffeeData();
    }
  }, [coffeeId]); // Correctly set the dependency to the coffeeId

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <ModifyContent coffeeData={coffeeData} />
    </div>
  );
}
