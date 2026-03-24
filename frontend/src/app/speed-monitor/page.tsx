"use client";

import React, { useState, useEffect, useRef } from "react";
import { Gauge, Play, Square, Settings, AlertTriangle, CheckCircle, Info, RefreshCw, Activity, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

type Unit = "km/h" | "mph" | "m/s";
type EventType = "ALERT" | "SAFE" | "INFO";

interface EventLog {
  id: string;
  timestamp: Date;
  type: EventType;
  message: string;
}

export default function SpeedMonitorPage() {
  const [isActive, setIsActive] = useState(false);
  const [isSimulation, setIsSimulation] = useState(false);
  const [speedMs, setSpeedMs] = useState(0); 
  const [simTargetSpeedKmh, setSimTargetSpeedKmh] = useState(60);
  const [speedLimitKmh, setSpeedLimitKmh] = useState(60);
  const [unit, setUnit] = useState<Unit>("km/h");
  
  const [events, setEvents] = useState<EventLog[]>([]);
  const [alertCount, setAlertCount] = useState(0);
  const [isHttps, setIsHttps] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const simIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPosRef = useRef<GeolocationPosition | null>(null);
  
  const wasAlertingRef = useRef(false);

  useEffect(() => {
    setIsHttps(window.location.protocol === "https:" || window.location.hostname === "localhost");
    logEvent("INFO", "Speed Monitor initialized successfully.");
    return () => stopMonitoring();
  }, []);

  const convertSpeed = (ms: number, targetUnit: Unit) => {
    switch (targetUnit) {
      case "km/h": return ms * 3.6;
      case "mph": return ms * 2.23694;
      case "m/s": return ms;
    }
  };
  
  const getDisplayLimit = () => {
    const limitMs = speedLimitKmh / 3.6;
    return Math.round(convertSpeed(limitMs, unit));
  };
  
  const currentSpeedValue = convertSpeed(speedMs, unit);
  const currentSpeedKmh = speedMs * 3.6;
  const isAlert = currentSpeedKmh > speedLimitKmh;

  useEffect(() => {
    if (!isActive) return;

    if (isAlert && !wasAlertingRef.current) {
        logEvent("ALERT", `LIMIT EXCEEDED: ${Math.round(currentSpeedValue)} ${unit} (Limit: ${getDisplayLimit()})`);
        setAlertCount(prev => prev + 1);
        wasAlertingRef.current = true;
    } else if (!isAlert && wasAlertingRef.current) {
        logEvent("SAFE", `WITHIN SAFE SPEED: ${Math.round(currentSpeedValue)} ${unit} (Limit: ${getDisplayLimit()})`);
        wasAlertingRef.current = false;
    }
  }, [isAlert, isActive, currentSpeedValue, getDisplayLimit, unit]);

  const logEvent = (type: EventType, message: string) => {
    setEvents(prev => {
      const newLog: EventLog = {
        id: Math.random().toString(36).substring(7),
        timestamp: new Date(),
        type,
        message
      };
      return [newLog, ...prev].slice(0, 50); 
    });
  };

  const clearEvents = () => setEvents([]);
  const resetStats = () => {
      setAlertCount(0);
      setEvents([]);
      logEvent("INFO", "Statistics reset.");
  };

  const getDistanceFromLatLonInM = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; 
    const dLat = (lat2 - lat1) * Math.PI / 180;  
    const dLon = (lon2 - lon1) * Math.PI / 180; 
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c; 
  };

  const toggleMonitoring = () => isActive ? stopMonitoring() : startMonitoring();

  const startMonitoring = () => {
    setIsActive(true);
    wasAlertingRef.current = false;
    setErrorMsg(null);
    setSpeedMs(0);
    logEvent("INFO", `Monitoring started in ${isSimulation ? "Simulation" : "GPS"} mode.`);

    if (isSimulation) {
      simIntervalRef.current = setInterval(() => {
        setSpeedMs(prevMs => {
          const currentKmh = prevMs * 3.6;
          const newKmh = currentKmh + (simTargetSpeedKmh - currentKmh) * 0.12;
          return newKmh / 3.6;
        });
      }, 100);
    } else {
      if (!navigator.geolocation) {
        setErrorMsg("Geolocation is not supported by your browser");
        setIsActive(false);
        return;
      }

      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          if (position.coords.speed !== null) {
            setSpeedMs(position.coords.speed);
          } else {
             if (lastPosRef.current) {
                 const timeDiff = (position.timestamp - lastPosRef.current.timestamp) / 1000;
                 if (timeDiff > 0) {
                     const dist = getDistanceFromLatLonInM(
                         lastPosRef.current.coords.latitude, lastPosRef.current.coords.longitude,
                         position.coords.latitude, position.coords.longitude
                     );
                     setSpeedMs(dist / timeDiff);
                 }
             }
          }
          lastPosRef.current = position;
        },
        (error) => {
          setErrorMsg(`GPS Error: ${error.message} (Please ensure location permissions are enabled)`);
          setIsActive(false);
        },
        // Increased timeout significantly for mobile devices taking longer to lock GPS
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 30000 }
      );
    }
  };

  const stopMonitoring = () => {
    setIsActive(false);
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }
    setSpeedMs(0);
    logEvent("INFO", "Monitoring stopped.");
  };

  useEffect(() => {
    if (isActive) {
      stopMonitoring();
      startMonitoring();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSimulation]);

  const radius = 120;
  const centerX = 150;
  const centerY = 150;
  const maxDisplayKmh = 160;
  const minAngle = -150;
  const maxAngle = 150;
  const angleSweep = maxAngle - minAngle;
  
  const getAngleForSpeed = (kmh: number) => {
    const ratio = Math.min(Math.max(kmh / maxDisplayKmh, 0), 1);
    return minAngle + ratio * angleSweep;
  };

  const needleAngle = getAngleForSpeed(currentSpeedKmh);
  const limitAngle = getAngleForSpeed(speedLimitKmh);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      
      {/* Decorative Header Background */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none -z-10 rounded-t-3xl" />

      {/* Header */}
      <div className="pt-2 px-2 md:px-0">
        <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 mb-2 flex items-center gap-3">
            <Activity className="w-8 h-8 text-cyan-400" /> Speed Monitor
        </h1>
        <p className="text-slate-400 text-sm md:text-base max-w-2xl">
            Real-time GPS vehicle speed tracking with beautiful visual telemetry and configurable alerts.
        </p>
      </div>

      {!isHttps && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 p-4 rounded-2xl flex items-center gap-3 backdrop-blur-md shadow-lg">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">Warning: Geolocation requires HTTPS. This page may not work accurately over HTTP.</p>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-3 backdrop-blur-md shadow-lg">
            <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5 sm:mt-0" />
            <div>
                <p className="text-sm font-bold">Failed to access GPS</p>
                <p className="text-xs opacity-80 mt-1">{errorMsg}</p>
            </div>
            <button onClick={() => startMonitoring()} className="mt-3 sm:mt-0 sm:ml-auto px-4 py-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-sm font-semibold transition-colors">
                Retry Connection
            </button>
        </div>
      )}

      {/* Alert Banner Main */}
      {isActive && (
        <div className={cn(
            "p-4 md:p-6 rounded-2xl border flex items-center gap-4 transition-all duration-500",
            isAlert 
                ? "bg-red-500/10 border-red-500/50 shadow-[0_0_40px_rgba(255,45,85,0.2)] text-red-400" 
                : "bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.1)] text-emerald-400"
        )}>
            <div className={cn("p-3 rounded-full", isAlert ? "bg-red-500/20" : "bg-emerald-500/20")}>
                {isAlert ? <AlertTriangle className="w-6 h-6 md:w-8 md:h-8 animate-pulse" /> : <CheckCircle className="w-6 h-6 md:w-8 md:h-8" />}
            </div>
            <div className="flex-1">
                <h3 className="text-base md:text-lg font-bold tracking-tight">
                    {isAlert ? "SPEED ALERT ACTIVATED" : "SPEED IS OPTIMAL"}
                </h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm opacity-90">
                    <div>Current: <span className="font-mono font-bold text-white">{Math.round(currentSpeedValue)}</span> {unit}</div>
                    <div className="hidden md:block text-slate-500">•</div>
                    <div>Limit: <span className="font-mono font-bold text-white">{getDisplayLimit()}</span> {unit}</div>
                </div>
            </div>
        </div>
      )}

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
        <div className="relative overflow-hidden bg-slate-900/50 backdrop-blur-xl border border-white/5 p-5 md:p-6 rounded-3xl shadow-xl group hover:border-cyan-500/30 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Gauge className="w-16 h-16 text-cyan-500" />
            </div>
            <p className="text-xs md:text-sm text-slate-400 font-medium mb-2 uppercase tracking-wider">Speed</p>
            <div className="flex items-baseline gap-2">
                <span className={cn("text-4xl md:text-5xl font-mono font-bold transition-colors",
                        isActive ? (isAlert ? "text-red-500" : "text-cyan-400") : "text-slate-600"
                )}>
                    {isActive ? Math.round(currentSpeedValue) : "0"}
                </span>
                <span className="text-slate-500 font-medium">{unit}</span>
            </div>
        </div>
        
        <div className="relative overflow-hidden bg-slate-900/50 backdrop-blur-xl border border-white/5 p-5 md:p-6 rounded-3xl shadow-xl group hover:border-orange-500/30 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Settings className="w-16 h-16 text-orange-500" />
            </div>
            <p className="text-xs md:text-sm text-slate-400 font-medium mb-2 uppercase tracking-wider">Limit</p>
            <div className="flex items-baseline gap-2">
                <span className="text-4xl md:text-5xl font-mono font-bold border-b-2 border-orange-500/30 text-orange-400">
                    {getDisplayLimit()}
                </span>
                <span className="text-slate-500 font-medium">{unit}</span>
            </div>
        </div>

        <div className="col-span-2 md:col-span-1 relative overflow-hidden bg-slate-900/50 backdrop-blur-xl border border-white/5 p-5 md:p-6 rounded-3xl shadow-xl group hover:border-red-500/30 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <AlertTriangle className="w-16 h-16 text-red-500" />
            </div>
            <p className="text-xs md:text-sm text-slate-400 font-medium mb-2 uppercase tracking-wider">Alerts</p>
            <div className="flex items-baseline gap-2">
                <span className="text-4xl md:text-5xl font-mono font-bold text-slate-200">
                    {alertCount}
                </span>
            </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
        {/* Left Column: Speedometer */}
        <div className="lg:col-span-5 relative bg-gradient-to-b from-slate-900/80 to-slate-950/90 backdrop-blur-xl border border-white/10 p-6 md:p-10 rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center min-h-[450px]">
            
            {/* Pulsing background effect when active */}
            {isActive && (
                <div className={cn("absolute inset-0 rounded-[2.5rem] opacity-20 transition-colors duration-1000", isAlert ? "bg-red-500/20 animate-pulse" : "bg-cyan-500/10")} />
            )}

            <div className="relative w-[280px] h-[280px] md:w-[320px] md:h-[320px] z-10">
                <svg viewBox="0 0 300 300" className="w-full h-full drop-shadow-2xl">
                    {/* Background Arc */}
                    <path
                        d={`M 65.14 234.85 A 120 120 0 1 1 234.85 234.85`}
                        fill="none"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="24"
                        strokeLinecap="round"
                    />

                    {/* Active Speed Arc Gradient Setup */}
                    <defs>
                        <linearGradient id="speedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#00d9ff" />
                            <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                        <linearGradient id="alertGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#ff2d55" />
                            <stop offset="100%" stopColor="#f43f5e" />
                        </linearGradient>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                            <feMerge>
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Active Speed Arc */}
                    {isActive && (
                        <path
                            d={`M 65.14 234.85 A 120 120 0 ${needleAngle > 30 ? 1 : 0} 1 
                               ${centerX + radius * Math.sin(needleAngle * Math.PI / 180)}
                               ${centerY - radius * Math.cos(needleAngle * Math.PI / 180)}`}
                            fill="none"
                            stroke={isAlert ? "url(#alertGradient)" : "url(#speedGradient)"}
                            strokeWidth="24"
                            strokeLinecap="round"
                            className="transition-all duration-150 ease-out"
                            filter="url(#glow)"
                        />
                    )}

                    {/* Speed Limit Marker */}
                    <path
                        d={`M ${centerX + (radius - 20) * Math.sin(limitAngle * Math.PI / 180)} ${centerY - (radius - 20) * Math.cos(limitAngle * Math.PI / 180)} L ${centerX + (radius + 20) * Math.sin(limitAngle * Math.PI / 180)} ${centerY - (radius + 20) * Math.cos(limitAngle * Math.PI / 180)}`}
                        stroke="#f97316"
                        strokeWidth="8"
                        strokeLinecap="round"
                        className="transition-all duration-300"
                    />

                    {/* Tick Marks & Labels */}
                    {[0, 20, 40, 60, 80, 100, 120, 140, 160].map(tickSpeed => {
                        const tickAngle = getAngleForSpeed(tickSpeed);
                        const isMajor = tickSpeed % 40 === 0;
                        return (
                            <g key={tickSpeed}>
                                <line
                                    x1={centerX + (radius - (isMajor ? 14 : 7)) * Math.sin(tickAngle * Math.PI / 180)}
                                    y1={centerY - (radius - (isMajor ? 14 : 7)) * Math.cos(tickAngle * Math.PI / 180)}
                                    x2={centerX + (radius - 2) * Math.sin(tickAngle * Math.PI / 180)}
                                    y2={centerY - (radius - 2) * Math.cos(tickAngle * Math.PI / 180)}
                                    stroke="rgba(255,255,255,0.2)"
                                    strokeWidth={isMajor ? 3 : 2}
                                    strokeLinecap="round"
                                />
                                {isMajor && (
                                    <text
                                        x={centerX + (radius - 38) * Math.sin(tickAngle * Math.PI / 180)}
                                        y={centerY - (radius - 38) * Math.cos(tickAngle * Math.PI / 180)}
                                        fill="#94a3b8"
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        fontSize="13"
                                        fontWeight="600"
                                        className="font-mono"
                                        style={{ transformOrigin: 'center' }}
                                    >
                                        {tickSpeed}
                                    </text>
                                )}
                            </g>
                        );
                    })}

                    {/* Needle Pivot */}
                    <circle cx={centerX} cy={centerY} r="12" fill="#0f172a" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                    <circle cx={centerX} cy={centerY} r="4" fill={isActive ? (isAlert ? "#ff2d55" : "#00d9ff") : "#475569"} />
                    
                    {/* Needle */}
                    {isActive && (
                        <polygon
                            points={`${centerX - 4},${centerY} ${centerX + 4},${centerY} ${centerX},${centerY - radius + 30}`}
                            fill={isAlert ? "#ff2d55" : "#00d9ff"}
                            style={{ 
                                transform: `rotate(${needleAngle}deg)`, 
                                transformOrigin: `${centerX}px ${centerY}px`,
                                transition: 'transform 100ms cubic-bezier(0.2, 0.8, 0.2, 1), fill 300ms ease-in-out'
                            }}
                            filter="url(#glow)"
                        />
                    )}
                </svg>
            </div>

            <button
                onClick={toggleMonitoring}
                className={cn(
                    "mt-6 w-full py-4 rounded-xl font-bold shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-sm tracking-wider uppercase z-10",
                    isActive 
                        ? "bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20" 
                        : "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white hover:from-cyan-400 hover:to-indigo-500 hover:shadow-cyan-500/25 border border-white/10"
                )}
            >
                {isActive ? <Square className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                {isActive ? "Stop Tracking" : "Start Tracking"}
            </button>
            <p className="text-xs text-slate-500 mt-4 text-center z-10">
                {isActive ? "Actively monitoring location..." : "Ready to monitor speed boundaries."}
            </p>
        </div>

        {/* Right Column: Controls & Configuration */}
        <div className="lg:col-span-7 flex flex-col gap-6">
            
            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 p-6 md:p-8 rounded-3xl shadow-xl">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-slate-100">
                    <Settings className="w-6 h-6 text-indigo-400" /> Settings & Telemetry
                </h3>
                
                <div className="space-y-8">
                    {/* Modern Mode Toggle */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5 gap-4">
                        <div className="flex items-center gap-3">
                            <MapPin className="w-10 h-10 p-2 rounded-xl bg-indigo-500/20 text-indigo-400" />
                            <div>
                                <div className="font-semibold text-slate-200">Data Source</div>
                                <div className="text-sm text-slate-500">Live GPS tracking or UI slider simulation</div>
                            </div>
                        </div>
                        <div className="flex bg-slate-950/50 p-1.5 rounded-xl border border-white/10 w-full sm:w-auto">
                            <button
                                onClick={() => setIsSimulation(false)}
                                className={cn("flex-1 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300", 
                                    !isSimulation ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                                )}
                            >
                                GPS Live
                            </button>
                            <button
                                onClick={() => setIsSimulation(true)}
                                className={cn("flex-1 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300", 
                                    isSimulation ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                                )}
                            >
                                Simulation
                            </button>
                        </div>
                    </div>

                    {/* Simulation Slider */}
                    {isSimulation && (
                        <div className="space-y-4 p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 animate-in flip-in-y duration-300">
                            <div className="flex justify-between items-center">
                                <label className="font-semibold text-indigo-300">Simulate Speed</label>
                                <div className="px-3 py-1 bg-indigo-500/20 rounded-md">
                                    <span className="text-indigo-200 font-mono font-bold text-lg">{simTargetSpeedKmh}</span>
                                    <span className="text-indigo-400 text-xs ml-1">km/h</span>
                                </div>
                            </div>
                            <input 
                                type="range" 
                                min="0" max="160" 
                                value={simTargetSpeedKmh}
                                onChange={(e) => setSimTargetSpeedKmh(Number(e.target.value))}
                                className="w-full h-3 bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-500"
                            />
                        </div>
                    )}

                    {/* Speed Limit Config */}
                    <div className="space-y-4 px-2">
                        <div className="flex justify-between items-center">
                            <label className="font-semibold text-slate-300">Speed Limit Threshold</label>
                            <div className="flex items-baseline gap-1">
                                <span className="text-orange-400 font-mono font-bold text-2xl">{speedLimitKmh}</span>
                                <span className="text-slate-500 text-sm font-medium">km/h</span>
                            </div>
                        </div>
                        <input 
                            type="range" 
                            min="20" max="120" step="5"
                            value={speedLimitKmh}
                            onChange={(e) => setSpeedLimitKmh(Number(e.target.value))}
                            className="w-full h-3 bg-slate-800 rounded-full appearance-none cursor-pointer accent-orange-500"
                        />
                        <div className="flex justify-between text-xs font-bold text-slate-600 px-1">
                            <span>20</span><span>60</span><span>120</span>
                        </div>
                    </div>

                    {/* Units */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-2 pt-2">
                        <label className="font-semibold text-slate-300 whitespace-nowrap">Display Unit</label>
                        <select 
                            value={unit}
                            onChange={(e) => setUnit(e.target.value as Unit)}
                            className="bg-slate-900 border border-white/10 text-slate-200 text-sm font-medium rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent block w-full p-3 outline-none transition-shadow"
                        >
                            <option value="km/h">Kilometers per hour (km/h)</option>
                            <option value="mph">Miles per hour (mph)</option>
                            <option value="m/s">Meters per second (m/s)</option>
                        </select>
                    </div>

                </div>
            </div>

            {/* Event Log */}
            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl shadow-xl flex flex-col overflow-hidden max-h-[350px] md:max-h-[400px]">
                <div className="p-5 md:p-6 border-b border-white/5 flex flex-wrap justify-between items-center gap-4 bg-white/[0.02]">
                    <h3 className="font-bold flex items-center gap-2 text-slate-200">
                        <Info className="w-5 h-5 text-cyan-400" /> Activity Log
                    </h3>
                    <div className="flex gap-2">
                        <button onClick={resetStats} className="text-xs px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 transition-colors flex items-center gap-2 font-medium">
                            <RefreshCw className="w-3.5 h-3.5" /> Reset Stats
                        </button>
                        <button onClick={clearEvents} className="text-xs px-4 py-2 bg-white/5 hover:bg-red-500/20 hover:text-red-300 rounded-lg text-slate-300 transition-colors font-medium">
                            Clear Log
                        </button>
                    </div>
                </div>
                <div className="p-3 md:p-4 overflow-y-auto flex-1 space-y-2">
                    {events.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500 py-10">
                            <Info className="w-10 h-10 mb-3 opacity-20" />
                            <p className="text-sm font-medium">No activity recorded yet.</p>
                        </div>
                    ) : (
                        events.map(event => (
                            <div key={event.id} className="text-sm p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex gap-4 items-start hover:bg-white/[0.04] transition-colors">
                                <span className="text-slate-500 font-mono text-xs mt-0.5 whitespace-nowrap bg-slate-950/50 px-2 py-1 rounded-md">
                                    {event.timestamp.toLocaleTimeString(undefined, { hour12: false })}
                                </span>
                                <div className="flex-1">
                                    <span className={cn(
                                        "text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-md mr-3 inline-block mb-1 sm:mb-0",
                                        event.type === 'ALERT' && "bg-red-500/10 text-red-400 border border-red-500/20",
                                        event.type === 'SAFE' && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
                                        event.type === 'INFO' && "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                                    )}>
                                        {event.type}
                                    </span>
                                    <span className="text-slate-300 leading-relaxed block sm:inline">{event.message}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

        </div>

      </div>
    </div>
  );
}
