"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import { useState } from "react";

// ☕ Cafe Icon (pusat lokasi)
const cafeIcon = new Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/924/924514.png", // Ikon kopi
  iconSize: [38, 38],
  iconAnchor: [19, 38],
});

// 🔴 User Icon (beberapa titik di sekitar cafe)
const userIcon = new Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149071.png", // Ikon user merah
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

// Lokasi cafe utama
const cafeLocation = {
  name: "Cafe Margonda",
  latitude: -6.35473386320184,
  longitude: 106.84160985275757,
};

// Fungsi untuk menghasilkan lokasi acak di sekitar pusat (±100 meter)
function generateNearbyLocations(centerLat: number, centerLng: number, count: number) {
  const locations = [];
  const meterOffset = 0.0009; // ~100 meter
  for (let i = 0; i < count; i++) {
    const randomLat = centerLat + (Math.random() - 0.5) * meterOffset;
    const randomLng = centerLng + (Math.random() - 0.5) * meterOffset;
    locations.push({ latitude: randomLat, longitude: randomLng });
  }
  return locations;
}

// Titik user di sekitar cafe (±100m)
const fakeUserLocations = generateNearbyLocations(
  cafeLocation.latitude,
  cafeLocation.longitude,
  6 // jumlah user
);

export default function TransactionMapPage() {
  const [userLocations] = useState(fakeUserLocations);

  return (
    <div className="p-6 text-black dark:text-white">
      <h2 className="text-2xl text-black font-bold mb-4">
        Transaction Location Map
      </h2>

      <div className="rounded-xl overflow-hidden border dark:border-neutral-700 shadow-lg h-[500px]">
        <MapContainer
          center={[cafeLocation.latitude, cafeLocation.longitude]} // Fokus ke pusat cafe
          zoom={20} // Dekat banget
          scrollWheelZoom={true}
          className="w-full h-full z-0"
        >
          {/* 🌍 Gratis dan tanpa autentikasi */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* Marker Cafe */}
          <Marker
            position={[cafeLocation.latitude, cafeLocation.longitude]}
            icon={cafeIcon}
          >
            <Popup>
              <div>
                <strong>{cafeLocation.name}</strong>
                <br />
                Lat: {cafeLocation.latitude.toFixed(6)}
                <br />
                Lng: {cafeLocation.longitude.toFixed(6)}
              </div>
            </Popup>
          </Marker>

          {/* Marker User di radius ±100m */}
          {userLocations.map((user, idx) => (
            <Marker
              key={`user-${idx}`}
              position={[user.latitude, user.longitude]}
              icon={userIcon}
            >
              <Popup>
                <div>
                  <strong>User {idx + 1}</strong>
                  <br />
                  Lat: {user.latitude.toFixed(6)}
                  <br />
                  Lng: {user.longitude.toFixed(6)}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
