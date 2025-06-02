"use client";

import React from "react";  // Import React explicitly
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Custom marker icons
const blueIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

const redIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

interface MapProps {
    lat: number;
    lng: number;
}

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

const DistanceLabel = ({ lat, lng }: MapProps) => {
    const cafe = {
        lat: -6.3550517591942395,
        lng: 106.84201298272988,
    };

    const distance = getDistanceFromLatLonInKm(lat, lng, cafe.lat, cafe.lng).toFixed(2);

    const map = useMap();

    React.useEffect(() => {
        // Create a custom label for the distance
        const distanceLabel = new (L.Control.extend({
            options: { position: "topright" }
        }))();

        distanceLabel.onAdd = () => {
            const div = L.DomUtil.create("div", "leaflet-control");
            div.innerHTML = `<strong>Distance to cafe: ${distance} km</strong>`;
            div.style.background = "rgba(255, 255, 255, 0.9)";
            div.style.padding = "8px 12px";
            div.style.borderRadius = "8px";
            div.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
            div.style.fontSize = "14px";
            div.style.color = "#333";
            div.style.margin = "10px";
            return div;
        };


        distanceLabel.addTo(map);

        return () => {
            map.removeControl(distanceLabel); // Clean up on unmount
        };
    }, [map, lat, lng, distance]);

    return null;
};

export default function Map({ lat, lng }: MapProps) {
    const cafe = {
        lat: -6.3550517591942395,
        lng: 106.84201298272988,
    };

    const positions: [number, number][] = [
        [lat, lng],
        [cafe.lat, cafe.lng],
    ];

    return (
        <div className="h-96 w-full rounded-2xl mt-10 overflow-hidden border border-gray-300 shadow-xl bg-white relative transition-transform hover:scale-[1.01] duration-300 ring-1 ring-blue-100">
            <MapContainer center={[lat, lng]} zoom={16} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }} className="z-0">
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                />
                {/* Add the custom distance label */}
                <DistanceLabel lat={lat} lng={lng} />

                {/* Draw a straight line between the user's location and the cafe */}
                <Polyline positions={positions} color="blue" weight={4} opacity={0.7} />

                {/* User Marker with blue icon */}
                <Marker position={[lat, lng]} icon={blueIcon}>
                    <Popup>
                        📍 User's pickup location
                    </Popup>
                </Marker>

                {/* Cafe Marker with red icon */}
                <Marker position={[cafe.lat, cafe.lng]} icon={redIcon}>
                    <Popup>☕ Cafe Location</Popup>
                </Marker>
            </MapContainer>
        </div>
    );
}
