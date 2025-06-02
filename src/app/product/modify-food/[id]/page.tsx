"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { dbFire } from "../../../firebase/firebase";
import ModifyFoodContent from './ModifyFoodContent';

export default function FoodModify() {
  const params = useParams();
  const foodId = params.id;

  const [foodData, setFoodData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (foodId) {
      const fetchFoodData = async () => {
        try {
          if (Array.isArray(foodId) || !foodId) {
            console.error("Invalid Food ID:", foodId);
            return;
          }

          const docRef = doc(dbFire, "foods", foodId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setFoodData({ id: docSnap.id, ...docSnap.data() });
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching food data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchFoodData();
    }
  }, [foodId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Modify Food Data</h1>
      {foodData ? <ModifyFoodContent foodData={foodData} /> : <p>No food data found.</p>}
    </div>
  );
}
