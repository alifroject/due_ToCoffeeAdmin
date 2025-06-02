"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { dbFire } from "../../../firebase/firebase";
import ModifyPastryContent from './ModifyPastryContent';

export default function PastryModify() {
  const params = useParams();
  const pastryId = params.id;

  const [pastryData, setPastryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pastryId) {
      const fetchPastryData = async () => {
        try {
          if (Array.isArray(pastryId) || !pastryId) {
            console.error("Invalid Pastry ID:", pastryId);
            return;
          }

          const docRef = doc(dbFire, "pastries", pastryId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setPastryData({ id: docSnap.id, ...docSnap.data() });
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching pastry data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchPastryData();
    }
  }, [pastryId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      
      <ModifyPastryContent pastryData={pastryData} />
    </div>
  );
}
