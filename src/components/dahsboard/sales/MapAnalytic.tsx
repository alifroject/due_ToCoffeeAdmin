"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import { useEffect, useState } from "react";
import { dbFire } from "../../../app/firebase/firebase";
import { collection, getDocs } from "firebase/firestore";

// 🔵 Café Icon (blue)
const cafeIcon = new Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3075/3075977.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// 🔴 User Icon (red)
const userIcon = new Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
  iconSize: [20, 20],
  iconAnchor: [10, 20],
});

// Manual Depok café
const cafeLocations = [
  {
    name: "Cafe Depok 1",
    latitude: -6.4025,
    longitude: 106.7942,
  },
];

type Transaction = {
  location: {
    latitude: number;
    longitude: number;
  };
  type?: string;
};

export default function TransactionMapPage() {
  const [userLocations, setUserLocations] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      const snap = await getDocs(collection(dbFire, "transactions"));
      const data = snap.docs.map((doc) => doc.data() as Transaction);
      const valid = data.filter(
        (tx) => tx.location?.latitude && tx.location?.longitude
      );
      setUserLocations(valid);
    };

    fetchTransactions();
  }, []);

  return (
    <div className="p-6 text-black dark:text-white">
      <h2 className="text-2xl text-black font-bold mb-4">Transaction Location Map</h2>

      <div className="rounded-xl overflow-hidden border dark:border-neutral-700 shadow-lg h-[500px]">
        <MapContainer
          center={[-2.5489, 118.0149]} // Center of Indonesia
          zoom={5.5}
          scrollWheelZoom={true}
          className="w-full h-full z-0"
        >
          {/* Minimal / grayscale tile */}
          <TileLayer
            url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; OpenMapTiles &copy; OpenStreetMap contributors'
          />

          {/* Static Café Markers (Blue) */}
          {cafeLocations.map((cafe, idx) => (
            <Marker
              key={`cafe-${idx}`}
              position={[cafe.latitude, cafe.longitude]}
              icon={cafeIcon}
            >
              <Popup>
                <div>
                  <strong>{cafe.name}</strong>
                  <br />
                  Lat: {cafe.latitude}
                  <br />
                  Lng: {cafe.longitude}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* User Location Markers from Firestore (Red) */}
          {userLocations.map((tx, idx) => (
            <Marker
              key={`user-${idx}`}
              position={[tx.location.latitude, tx.location.longitude]}
              icon={userIcon}
            >
              <Popup>
                <div>
                  <strong>User Transaction</strong>
                  <br />
                  Lat: {tx.location.latitude.toFixed(4)}
                  <br />
                  Lng: {tx.location.longitude.toFixed(4)}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
