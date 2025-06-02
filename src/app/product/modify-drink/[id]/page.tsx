"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { dbFire } from "../../../firebase/firebase"; // Ensure dbFire is correctly initialized
import ModifyDrinkContent  from  './ModifyDrinkContent'

export default function DrinkModify() {
  const params = useParams();
  const drinkId = params.id; // Ensure this is the correct dynamic param

  const [drinkData, setDrinkData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (drinkId) {
      const fetchDrinkData = async () => {
        try {
          // Ensure coffeeId is a valid string and not an array
          if (Array.isArray(drinkId) || !drinkId) {
            console.error("Invalid Drink ID:", drinkId);
            return;
          }

          // Firestore document reference with correct path format
          const docRef = doc(dbFire, "drinks", drinkId);  // Ensure it's a valid collection name and ID

          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setDrinkData({ id: docSnap.id, ...docSnap.data() });
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching coffee data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchDrinkData();
    }
  }, [drinkId]); // Correctly set the dependency to the coffeeId

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <ModifyDrinkContent drinkData={drinkData} />
    </div>
  );
}
