"use client";

import React, { useState, useEffect, useRef } from "react";
import { Gauge, Play, Square, Settings, RefreshCcw, AlertTriangle, CheckCircle, Info, RefreshCw } from "lucide-react";
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
  const [speedMs, setSpeedMs] = useState(0); // Internal speed in m/s
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
  
  // Track previous alert state to detect transitions
  const wasAlertingRef = useRef(false);

  useEffect(() => {
    setIsHttps(window.location.protocol === "https:" || window.location.hostname === "localhost");
    logEvent("INFO", "Speed Monitor initialized.");
    return () => stopMonitoring();
  }, []);

  // --- Speed Conversion Helpers ---
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

  // --- Alert System Logic ---
  useEffect(() => {
    if (!isActive) return;

    if (isAlert && !wasAlertingRef.current) {
        logEvent("ALERT", `SPEED ALERT — LIMIT EXCEEDED: ${Math.round(currentSpeedValue)} ${unit} (Limit: ${getDisplayLimit()})`);
        setAlertCount(prev => prev + 1);
        wasAlertingRef.current = true;
    } else if (!isAlert && wasAlertingRef.current) {
        logEvent("SAFE", `NORMAL — WITHIN SAFE SPEED: ${Math.round(currentSpeedValue)} ${unit} (Limit: ${getDisplayLimit()})`);
        wasAlertingRef.current = false;
    }
  }, [isAlert, isActive, currentSpeedValue, getDisplayLimit, unit]);

  // --- Event Logging ---
  const logEvent = (type: EventType, message: string) => {
    setEvents(prev => {
      const newLog: EventLog = {
        id: Math.random().toString(36).substring(7),
        timestamp: new Date(),
        type,
        message
      };
      return [newLog, ...prev].slice(0, 50); // Keep last 50
    });
  };

  const clearEvents = () => setEvents([]);
  const resetStats = () => {
      setAlertCount(0);
      setEvents([]);
      logEvent("INFO", "Statistics reset.");
  };

  // --- Geolocation Haversine Fallback ---
  const getDistanceFromLatLonInM = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Radius of the earth in m
    const dLat = (lat2 - lat1) * Math.PI / 180;  
    const dLon = (lon2 - lon1) * Math.PI / 180; 
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c; 
  };

  // --- Monitoring Controls ---
  const toggleMonitoring = () => {
    if (isActive) {
      stopMonitoring();
    } else {
      startMonitoring();
    }
  };

  const startMonitoring = () => {
    setIsActive(true);
    wasAlertingRef.current = false;
    setErrorMsg(null);
    setSpeedMs(0);
    logEvent("INFO", `Monitoring started in ${isSimulation ? "Simulation" : "GPS"} mode.`);

    if (isSimulation) {
      // Lerp simulation loop
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
             // Fallback logic
             if (lastPosRef.current) {
                 const timeDiff = (position.timestamp - lastPosRef.current.timestamp) / 1000; // seconds
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
          setErrorMsg(`GPS Error: ${error.message}`);
          setIsActive(false);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
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
    setSpeedMs(0); // Reset dial
    logEvent("INFO", "Monitoring stopped.");
  };

  // Restart monitoring if mode changes while active
  useEffect(() => {
    if (isActive) {
      stopMonitoring();
      startMonitoring();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSimulation]);

  // --- Speedometer SVG Settings ---
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
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gradient mb-2">Speed Monitor</h1>
        <p className="text-slate-400">Real-time vehicle speed detection and alerting system.</p>
      </div>

      {!isHttps && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 p-4 rounded-xl flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">Warning: Geolocation requires HTTPS. This page may not work over HTTP.</p>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-xl flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{errorMsg}</p>
        </div>
      )}

      {/* Alert Banner Main */}
      {isActive && (
        <div className={cn(
            "p-5 rounded-xl border flexitems-center gap-4 transition-all duration-300 shadow-lg",
            isAlert 
                ? "bg-red-500/20 border-red-500 shadow-[0_0_30px_rgba(255,45,85,0.3)] text-red-400" 
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
        )}>
            {isAlert ? <AlertTriangle className="w-8 h-8 animate-pulse" /> : <CheckCircle className="w-8 h-8" />}
            <div>
                <h3 className="text-lg font-bold">
                    {isAlert ? "SPEED ALERT — LIMIT EXCEEDED" : "NORMAL — WITHIN SAFE SPEED"}
                </h3>
                <p className="text-sm opacity-90">
                    Current: <span className="font-mono">{Math.round(currentSpeedValue)}</span> {unit} 
                    {" "}| Limit: <span className="font-mono">{getDisplayLimit()}</span> {unit}
                </p>
            </div>
        </div>
      )}

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-6 flex items-center justify-between">
            <div>
                <p className="text-sm text-slate-400 mb-1">Current Speed</p>
                <div className="flex items-baseline gap-2">
                    <span className={cn("text-4xl font-mono font-bold transition-colors",
                         isActive ? (isAlert ? "text-red-500" : "text-cyan-400") : "text-slate-600"
                    )}>
                        {isActive ? Math.round(currentSpeedValue) : "---"}
                    </span>
                    <span className="text-slate-500 font-medium">{unit}</span>
                </div>
            </div>
            <Gauge className={cn("w-10 h-10", isActive ? "text-cyan-500/50" : "text-slate-700")} />
        </div>
        
        <div className="glass-card p-6 flex items-center justify-between">
            <div>
                <p className="text-sm text-slate-400 mb-1">Speed Limit</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-mono font-bold text-orange-400">
                        {getDisplayLimit()}
                    </span>
                    <span className="text-slate-500 font-medium">{unit}</span>
                </div>
            </div>
            <Settings className="w-10 h-10 text-orange-500/50" />
        </div>

        <div className="glass-card p-6 flex items-center justify-between">
            <div>
                <p className="text-sm text-slate-400 mb-1">Total Alerts</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-mono font-bold text-slate-200">
                        {alertCount}
                    </span>
                </div>
            </div>
            <AlertTriangle className="w-10 h-10 text-red-500/50" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
        {/* Left Column: Speedometer */}
        <div className="glass-card p-8 flex flex-col items-center justify-center min-h-[400px]">
            <div className="relative w-[300px] h-[300px]">
                <svg viewBox="0 0 300 300" className="w-full h-full drop-shadow-2xl">
                    {/* Background Arc */}
                    <path
                        d={`M 65.14 234.85 A 120 120 0 1 1 234.85 234.85`}
                        fill="none"
                        stroke="#1e293b" // slate-800
                        strokeWidth="20"
                        strokeLinecap="round"
                    />

                    {/* Active Speed Arc */}
                    {isActive && (
                        <path
                            d={`M 65.14 234.85 A 120 120 0 ${needleAngle > 30 ? 1 : 0} 1 
                               ${centerX + radius * Math.sin(needleAngle * Math.PI / 180)}
                               ${centerY - radius * Math.cos(needleAngle * Math.PI / 180)}`}
                            fill="none"
                            stroke={isAlert ? "#ff2d55" : "#00d9ff"} // red or cyan
                            strokeWidth="20"
                            strokeLinecap="round"
                            className="transition-all duration-100 ease-out"
                        />
                    )}

                    {/* Speed Limit Marker */}
                    <line
                        x1={centerX + (radius - 15) * Math.sin(limitAngle * Math.PI / 180)}
                        y1={centerY - (radius - 15) * Math.cos(limitAngle * Math.PI / 180)}
                        x2={centerX + (radius + 15) * Math.sin(limitAngle * Math.PI / 180)}
                        y2={centerY - (radius + 15) * Math.cos(limitAngle * Math.PI / 180)}
                        stroke="#ff6b35" // orange
                        strokeWidth="6"
                        strokeLinecap="round"
                    />

                    {/* Tick Marks */}
                    {[0, 40, 80, 120, 160].map(tickSpeed => {
                        const tickAngle = getAngleForSpeed(tickSpeed);
                        const isMajor = tickSpeed % 40 === 0;
                        return (
                            <g key={tickSpeed}>
                                <line
                                    x1={centerX + (radius - (isMajor ? 12 : 6)) * Math.sin(tickAngle * Math.PI / 180)}
                                    y1={centerY - (radius - (isMajor ? 12 : 6)) * Math.cos(tickAngle * Math.PI / 180)}
                                    x2={centerX + (radius + 2) * Math.sin(tickAngle * Math.PI / 180)}
                                    y2={centerY - (radius + 2) * Math.cos(tickAngle * Math.PI / 180)}
                                    stroke="#64748b"
                                    strokeWidth={isMajor ? 3 : 1}
                                />
                                {isMajor && (
                                    <text
                                        x={centerX + (radius - 35) * Math.sin(tickAngle * Math.PI / 180)}
                                        y={centerY - (radius - 35) * Math.cos(tickAngle * Math.PI / 180)}
                                        fill="#94a3b8"
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        fontSize="12"
                                        fontWeight="bold"
                                        style={{ transformOrigin: 'center' }}
                                    >
                                        {tickSpeed}
                                    </text>
                                )}
                            </g>
                        );
                    })}

                    {/* Center Text */}
                    <text x={centerX} y={centerY + 20} textAnchor="middle" fill="#fff" fontSize="48" fontWeight="bold" className="font-mono">
                        {isActive ? Math.round(currentSpeedValue) : "0"}
                    </text>
                    <text x={centerX} y={centerY + 45} textAnchor="middle" fill="#64748b" fontSize="16" fontWeight="bold">
                        {unit}
                    </text>

                    {/* Needle Pivot */}
                    <circle cx={centerX} cy={centerY} r="8" fill={isActive ? (isAlert ? "#ff2d55" : "#00d9ff") : "#334155"} />
                    
                    {/* Needle */}
                    {isActive && (
                        <polygon
                            points={`${centerX - 4},${centerY} ${centerX + 4},${centerY} ${centerX},${centerY - radius + 25}`}
                            fill={isAlert ? "#ff2d55" : "#00d9ff"}
                            style={{ 
                                transform: `rotate(${needleAngle}deg)`, 
                                transformOrigin: `${centerX}px ${centerY}px`,
                                transition: 'transform 100ms ease-out, fill 300ms ease-in-out'
                            }}
                        />
                    )}
                </svg>
            </div>

            <button
                onClick={toggleMonitoring}
                className={cn(
                    "mt-8 px-10 py-4 rounded-full font-bold shadow-lg transition-transform active:scale-95 flex items-center gap-2",
                    isActive 
                        ? "bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30" 
                        : "bg-indigo-600 text-white hover:bg-indigo-500"
                )}
            >
                {isActive ? <Square className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                {isActive ? "STOP MONITORING" : "START MONITORING"}
            </button>
        </div>

        {/* Right Column: Controls & Configuration */}
        <div className="flex flex-col gap-6">
            
            <div className="glass-card p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-indigo-400" /> Configuration
                </h3>
                
                <div className="space-y-6">
                    {/* Mode Toggle */}
                    <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                        <div>
                            <div className="font-medium text-slate-200">Data Source</div>
                            <div className="text-sm text-slate-400">Use GPS or Simulation slider</div>
                        </div>
                        <div className="flex bg-slate-800 rounded-lg p-1">
                            <button
                                onClick={() => setIsSimulation(false)}
                                className={cn("px-4 py-1.5 rounded-md text-sm font-medium transition-colors", 
                                    !isSimulation ? "bg-indigo-500 text-white shadow" : "text-slate-400 hover:text-slate-200"
                                )}
                            >
                                GPS Live
                            </button>
                            <button
                                onClick={() => setIsSimulation(true)}
                                className={cn("px-4 py-1.5 rounded-md text-sm font-medium transition-colors", 
                                    isSimulation ? "bg-indigo-500 text-white shadow" : "text-slate-400 hover:text-slate-200"
                                )}
                            >
                                Simulation
                            </button>
                        </div>
                    </div>

                    {/* Simulation Slider */}
                    {isSimulation && (
                        <div className="space-y-3 p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                            <div className="flex justify-between">
                                <label className="font-medium text-indigo-300">Simulate Speed (km/h)</label>
                                <span className="text-indigo-200 font-mono">{simTargetSpeedKmh}</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" max="160" 
                                value={simTargetSpeedKmh}
                                onChange={(e) => setSimTargetSpeedKmh(Number(e.target.value))}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                        </div>
                    )}

                    {/* Speed Limit Config */}
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <label className="font-medium text-slate-300">Speed Limit Alert (km/h)</label>
                            <span className="text-orange-400 font-mono font-bold">{speedLimitKmh}</span>
                        </div>
                        <input 
                            type="range" 
                            min="20" max="120" step="10"
                            value={speedLimitKmh}
                            onChange={(e) => setSpeedLimitKmh(Number(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                        />
                    </div>

                    {/* Units */}
                    <div className="flex items-center gap-4">
                        <label className="font-medium text-slate-300">Display Unit:</label>
                        <select 
                            value={unit}
                            onChange={(e) => setUnit(e.target.value as Unit)}
                            className="bg-slate-800 border border-white/10 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 outline-none"
                        >
                            <option value="km/h">Kilometers per hour (km/h)</option>
                            <option value="mph">Miles per hour (mph)</option>
                            <option value="m/s">Meters per second (m/s)</option>
                        </select>
                    </div>

                </div>
            </div>

            {/* Event Log */}
            <div className="glass-card flex-1 flex flex-col overflow-hidden max-h-[350px]">
                <div className="p-4 border-b border-white/10 flex justify-between items-center">
                    <h3 className="font-bold flex items-center gap-2">
                        <Info className="w-4 h-4 text-cyan-400" /> Event Log
                    </h3>
                    <div className="flex gap-2">
                        <button onClick={resetStats} className="text-xs px-3 py-1 bg-white/5 hover:bg-white/10 rounded-md text-slate-300 transition-colors flex items-center gap-1">
                            <RefreshCw className="w-3 h-3" /> Stats
                        </button>
                        <button onClick={clearEvents} className="text-xs px-3 py-1 bg-white/5 hover:bg-white/10 rounded-md text-slate-300 transition-colors">
                            Clear
                        </button>
                    </div>
                </div>
                <div className="p-2 overflow-y-auto flex-1 space-y-2">
                    {events.length === 0 ? (
                        <div className="text-center text-slate-500 py-8 text-sm">No events recorded.</div>
                    ) : (
                        events.map(event => (
                            <div key={event.id} className="text-sm p-3 rounded-lg bg-white/5 border border-white/5 flex gap-3">
                                <span className="text-slate-500 font-mono text-xs mt-0.5 whitespace-nowrap">
                                    {event.timestamp.toLocaleTimeString(undefined, { hour12: false })}
                                </span>
                                <div>
                                    <span className={cn(
                                        "text-[10px] uppercase font-bold px-1.5 py-0.5 rounded mr-2",
                                        event.type === 'ALERT' && "bg-red-500/20 text-red-400",
                                        event.type === 'SAFE' && "bg-emerald-500/20 text-emerald-400",
                                        event.type === 'INFO' && "bg-cyan-500/20 text-cyan-400"
                                    )}>
                                        {event.type}
                                    </span>
                                    <span className="text-slate-300">{event.message}</span>
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
