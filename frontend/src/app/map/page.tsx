"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { MapIcon } from "lucide-react";
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Leaflet components must be imported dynamically without SSR
const MapContainer = dynamic(() => import('react-leaflet').then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((m) => m.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then((m) => m.CircleMarker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((m) => m.Popup), { ssr: false });

// Realistic accident hotspot data across major Indian cities
const accidentData = [
    // Delhi NCR
    { id: 1, lat: 28.6139, lng: 77.2090, city: "New Delhi", location: "Connaught Place", severity: "Serious", speed: 50, weather: "Fine", casualties: 2 },
    { id: 2, lat: 28.5355, lng: 77.3910, city: "Noida", location: "Sector 18", severity: "Slight", speed: 40, weather: "Fine", casualties: 1 },
    { id: 3, lat: 28.7041, lng: 77.1025, city: "Delhi", location: "Outer Ring Road", severity: "Fatal", speed: 80, weather: "Fog", casualties: 3 },
    // Mumbai
    { id: 4, lat: 19.0760, lng: 72.8777, city: "Mumbai", location: "Western Express Highway", severity: "Fatal", speed: 70, weather: "Raining", casualties: 4 },
    { id: 5, lat: 19.1136, lng: 72.8697, city: "Mumbai", location: "Andheri East", severity: "Serious", speed: 50, weather: "Raining", casualties: 2 },
    { id: 6, lat: 18.9220, lng: 72.8347, city: "Mumbai", location: "Marine Drive", severity: "Slight", speed: 30, weather: "Fine", casualties: 1 },
    // Bangalore
    { id: 7, lat: 12.9716, lng: 77.5946, city: "Bangalore", location: "MG Road", severity: "Serious", speed: 40, weather: "Fine", casualties: 2 },
    { id: 8, lat: 13.0358, lng: 77.5970, city: "Bangalore", location: "Hebbal Flyover", severity: "Fatal", speed: 60, weather: "Fine", casualties: 3 },
    // Chennai
    { id: 9, lat: 13.0827, lng: 80.2707, city: "Chennai", location: "Anna Salai", severity: "Serious", speed: 50, weather: "Fine", casualties: 1 },
    { id: 10, lat: 13.0067, lng: 80.2206, city: "Chennai", location: "ECR Junction", severity: "Slight", speed: 30, weather: "Raining", casualties: 1 },
    // Hyderabad
    { id: 11, lat: 17.3850, lng: 78.4867, city: "Hyderabad", location: "HITEC City", severity: "Serious", speed: 50, weather: "Fine", casualties: 2 },
    { id: 12, lat: 17.4399, lng: 78.4983, city: "Hyderabad", location: "Secunderabad", severity: "Slight", speed: 30, weather: "Fine", casualties: 1 },
    // Kolkata
    { id: 13, lat: 22.5726, lng: 88.3639, city: "Kolkata", location: "Park Street", severity: "Slight", speed: 30, weather: "Fine", casualties: 1 },
    { id: 14, lat: 22.6533, lng: 88.4464, city: "Kolkata", location: "EM Bypass", severity: "Fatal", speed: 70, weather: "Raining", casualties: 2 },
    // Jaipur
    { id: 15, lat: 26.9124, lng: 75.7873, city: "Jaipur", location: "JLN Marg", severity: "Serious", speed: 60, weather: "Fine", casualties: 2 },
    // Lucknow
    { id: 16, lat: 26.8467, lng: 80.9462, city: "Lucknow", location: "Hazratganj", severity: "Slight", speed: 30, weather: "Fog", casualties: 1 },
    { id: 17, lat: 26.8955, lng: 80.9469, city: "Lucknow", location: "Kanpur Road NH-2", severity: "Fatal", speed: 80, weather: "Fog", casualties: 5 },
    // Pune
    { id: 18, lat: 18.5204, lng: 73.8567, city: "Pune", location: "Pune-Mumbai Expressway", severity: "Fatal", speed: 90, weather: "Raining", casualties: 4 },
    { id: 19, lat: 18.5596, lng: 73.7756, city: "Pune", location: "Hinjewadi", severity: "Slight", speed: 30, weather: "Fine", casualties: 1 },
    // Ahmedabad
    { id: 20, lat: 23.0225, lng: 72.5714, city: "Ahmedabad", location: "SG Highway", severity: "Serious", speed: 60, weather: "Fine", casualties: 2 },
    // Chandigarh
    { id: 21, lat: 30.7333, lng: 76.7794, city: "Chandigarh", location: "Sector 17", severity: "Slight", speed: 30, weather: "Fine", casualties: 1 },
    // Bhopal
    { id: 22, lat: 23.2599, lng: 77.4126, city: "Bhopal", location: "Hoshangabad Road", severity: "Serious", speed: 50, weather: "Fog", casualties: 2 },
    // Varanasi
    { id: 23, lat: 25.3176, lng: 82.9739, city: "Varanasi", location: "Varanasi-Allahabad Highway", severity: "Fatal", speed: 70, weather: "Fine", casualties: 3 },
    // Kochi
    { id: 24, lat: 9.9312, lng: 76.2673, city: "Kochi", location: "NH 66", severity: "Serious", speed: 50, weather: "Raining", casualties: 2 },
];

export default function MapPage() {
    // Center on India
    const mapCenter: [number, number] = [22.0, 78.5];

    const getColor = (severity: string) => {
        switch (severity) {
            case 'Fatal': return '#e11d48'; // rose-600
            case 'Serious': return '#ea580c'; // orange-600
            case 'Slight': return '#10b981'; // emerald-500
            default: return '#6366f1';
        }
    };

    const getRadius = (severity: string) => {
        switch (severity) {
            case 'Fatal': return 10;
            case 'Serious': return 7;
            case 'Slight': return 5;
            default: return 5;
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">

            <div>
                <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-500">
                    Accident Heatmap — India
                </h1>
                <p className="text-slate-400 mt-2">
                    Geographic distribution of predicted accident severity across major Indian cities.
                </p>
            </div>

            <Card className="glass-card border-none bg-slate-900/40">
                <CardHeader>
                    <CardTitle className="text-xl text-slate-200 flex items-center">
                        <MapIcon className="w-5 h-5 mr-2 text-emerald-400" />
                        Live Incident Hotspots
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        Interactive map visualizing severity clusters across high-risk zones in India.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[600px] w-full rounded-xl overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.1)] border border-slate-700/50 relative">

                        {/* Dark mode overlay fix for standard OSM tiles */}
                        <div className="absolute inset-0 z-0 bg-slate-900 pointer-events-none" />

                        {typeof window !== 'undefined' && (
                            <MapContainer
                                center={mapCenter}
                                zoom={5}
                                style={{ height: '100%', width: '100%', background: '#0f172a' }}
                                className="z-10"
                            >
                                {/* CartoDB Dark Matter tile layer */}
                                <TileLayer
                                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                />

                                {accidentData.map((acc) => (
                                    <CircleMarker
                                        key={acc.id}
                                        center={[acc.lat, acc.lng]}
                                        radius={getRadius(acc.severity)}
                                        pathOptions={{
                                            color: getColor(acc.severity),
                                            fillColor: getColor(acc.severity),
                                            fillOpacity: 0.6,
                                            weight: 2
                                        }}
                                    >
                                        <Popup className="custom-popup">
                                            <div className="bg-slate-900 p-2 text-white text-sm whitespace-nowrap">
                                                <div className="font-bold text-base border-b border-indigo-500/30 pb-1 mb-2">
                                                    {acc.city} — <span style={{ color: getColor(acc.severity) }}>{acc.severity}</span>
                                                </div>
                                                <div><strong>Location:</strong> {acc.location}</div>
                                                <div><strong>Speed:</strong> {acc.speed} km/h</div>
                                                <div><strong>Weather:</strong> {acc.weather}</div>
                                                <div><strong>Casualties:</strong> {acc.casualties}</div>
                                            </div>
                                        </Popup>
                                    </CircleMarker>
                                ))}
                            </MapContainer>
                        )}

                        {/* Custom CSS to fix Leaflet popup styling in Next.js */}
                        <style jsx global>{`
              .leaflet-popup-content-wrapper, .leaflet-popup-tip {
                background: #0f172a !important;
                color: #f8fafc !important;
                border: 1px solid rgba(99, 102, 241, 0.2);
                box-shadow: 0 10px 25px rgba(0,0,0,0.5);
              }
              .leaflet-container a {
                color: #818cf8 !important;
              }
            `}</style>
                    </div>

                    <div className="flex items-center gap-6 mt-6 justify-center">
                        <div className="flex items-center text-sm text-slate-300">
                            <span className="w-3 h-3 rounded-full bg-rose-600 mr-2 shadow-[0_0_10px_rgba(225,29,72,0.8)]"></span> Fatal
                        </div>
                        <div className="flex items-center text-sm text-slate-300">
                            <span className="w-3 h-3 rounded-full bg-orange-600 mr-2 shadow-[0_0_10px_rgba(234,88,12,0.8)]"></span> Serious
                        </div>
                        <div className="flex items-center text-sm text-slate-300">
                            <span className="w-3 h-3 rounded-full bg-emerald-500 mr-2 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span> Slight
                        </div>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}
