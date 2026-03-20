import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icons (Leaflet issue with bundlers)
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Координати за Ресторан Ксантика, Хиподром, Скопје
const VENUE_POSITION: [number, number] = [41.9892, 21.4197];

export default function WeddingMap() {
  return (
    <MapContainer
      center={VENUE_POSITION}
      zoom={16}
      style={{ width: "100%", height: "300px", borderRadius: "4px" }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={VENUE_POSITION} icon={icon}>
        <Popup>Ресторан Ксантика</Popup>
      </Marker>
    </MapContainer>
  );
}
