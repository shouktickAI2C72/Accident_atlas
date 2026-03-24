"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { MapIcon, Navigation } from "lucide-react";
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Leaflet components must be imported dynamically without SSR
const MapContainer = dynamic(() => import('react-leaflet').then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((m) => m.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then((m) => m.CircleMarker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((m) => m.Popup), { ssr: false });

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
    // Pune
    { id: 18, lat: 18.5204, lng: 73.8567, city: "Pune", location: "Pune-Mumbai Expressway", severity: "Fatal", speed: 90, weather: "Raining", casualties: 4 },
    { id: 19, lat: 18.5596, lng: 73.7756, city: "Pune", location: "Hinjewadi", severity: "Slight", speed: 30, weather: "Fine", casualties: 1 },
];

export default function MapPage() {
    const mapCenter: [number, number] = [22.0, 78.5];

    const getColor = (severity: string) => {
        switch (severity) {
            case 'Fatal': return '#fb7185'; // rose-400 for better dark mode visibility
            case 'Serious': return '#fb923c'; // orange-400
            case 'Slight': return '#34d399'; // emerald-400
            default: return '#818cf8';
        }
    };

    const getRadius = (severity: string) => {
        switch (severity) {
            case 'Fatal': return 12;
            case 'Serious': return 8;
            case 'Slight': return 6;
            default: return 6;
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-700 pb-10">
            
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-full h-[400px] bg-gradient-to-bl from-emerald-500/10 via-teal-500/5 to-transparent pointer-events-none -z-10 rounded-tr-[5rem]" />

            <div className="pt-2 px-2 md:px-0">
                <h1 className="text-3xl md:text-5xl font-extrabold text-gradient-premium tracking-tight mb-2">
                    Global Severity Heatmap
                </h1>
                <p className="text-slate-400 text-sm md:text-base max-w-3xl">
                    Geospatial visualization of predictive AI incident clustering across major high-risk zones.
                </p>
            </div>

            <Card className="glass-card relative overflow-hidden group border-none">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 to-transparent pointer-events-none" />
                
                <CardHeader className="p-6 md:p-8 border-b border-white/5 bg-white/[0.01]">
                    <CardTitle className="text-xl md:text-2xl text-slate-100 flex items-center gap-3 font-bold">
                        <MapIcon className="w-6 h-6 text-emerald-400" /> Live Incident Hotspots
                    </CardTitle>
                    <CardDescription className="text-slate-400 text-sm mt-1">
                        Interactive map visualizing severity clusters with precise coordinates.
                    </CardDescription>
                </CardHeader>
                
                <CardContent className="p-4 md:p-8">
                    <div className="h-[500px] md:h-[650px] w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(16,185,129,0.15)] border border-white/10 relative group-hover:shadow-[0_0_50px_rgba(16,185,129,0.25)] transition-shadow duration-500">

                        {/* Dark mode overlay for map fade edge */}
                        <div className="absolute inset-0 z-0 bg-slate-950 pointer-events-none" />
                        
                        {/* Map Overlay Gradient Frame */}
                        <div className="absolute inset-0 pointer-events-none z-[400] shadow-[inset_0_0_50px_rgba(15,23,42,1)]" />

                        {typeof window !== 'undefined' && (
                            <MapContainer
                                center={mapCenter}
                                zoom={5}
                                style={{ height: '100%', width: '100%', background: '#09090b' }}
                                className="z-10 cursor-crosshair"
                                zoomControl={false}
                            >
                                {/* CartoDB Dark Matter tile layer - High Contrast */}
                                <TileLayer
                                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                />

                                {accidentData.map((acc) => (
                                    <CircleMarker
                                        key={acc.id}
                                        center={[acc.lat, acc.lng]}
                                        radius={getRadius(acc.severity)}
                                        pathOptions={{
                                            color: getColor(acc.severity),
                                            fillColor: getColor(acc.severity),
                                            fillOpacity: 0.7,
                                            weight: 3,
                                            className: 'animate-pulse origin-center'
                                        }}
                                    >
                                        <Popup className="custom-popup">
                                            <div className="bg-slate-900/90 backdrop-blur-md p-3 text-white text-sm whitespace-nowrap border border-white/10 rounded-xl shadow-2xl min-w-[200px]">
                                                <div className="font-bold text-base border-b border-white/10 pb-2 mb-3 flex items-center gap-2">
                                                    <Navigation className="w-4 h-4 text-slate-400" />
                                                    {acc.city}
                                                </div>
                                                <div className="space-y-1.5 flex flex-col">
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-400">Severity</span>
                                                        <span className="font-bold" style={{ color: getColor(acc.severity) }}>{acc.severity}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-400">Location</span>
                                                        <span className="font-medium">{acc.location}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-400">Speed Limit</span>
                                                        <span className="font-mono">{acc.speed} km/h</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-400">Conditions</span>
                                                        <span className="font-medium">{acc.weather}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Popup>
                                    </CircleMarker>
                                ))}
                            </MapContainer>
                        )}

                        <style jsx global>{`
                          .leaflet-popup-content-wrapper {
                            background: transparent !important;
                            padding: 0 !important;
                            border-radius: 12px !important;
                            overflow: hidden;
                            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
                          }
                          .leaflet-popup-tip {
                            background: #0f172a !important;
                            border: 1px solid rgba(255, 255, 255, 0.1);
                          }
                          .leaflet-container a {
                            color: #818cf8 !important;
                          }
                        `}</style>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 md:gap-10 mt-8 justify-center bg-slate-900/50 py-4 px-6 rounded-2xl w-fit mx-auto border border-white/5">
                        <div className="flex items-center text-sm font-bold text-slate-300 uppercase tracking-widest">
                            <span className="w-3.5 h-3.5 rounded-full bg-rose-500 mr-3 shadow-[0_0_12px_rgba(244,63,94,0.8)] animate-pulse"></span> Fatal Risk
                        </div>
                        <div className="flex items-center text-sm font-bold text-slate-300 uppercase tracking-widest">
                            <span className="w-3.5 h-3.5 rounded-full bg-orange-500 mr-3 shadow-[0_0_12px_rgba(249,115,22,0.8)]"></span> Serious Risk
                        </div>
                        <div className="flex items-center text-sm font-bold text-slate-300 uppercase tracking-widest">
                            <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 mr-3 shadow-[0_0_12px_rgba(52,211,153,0.8)]"></span> Slight Risk
                        </div>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}
