"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ShieldAlert, AlertTriangle, TrendingUp, Activity, Zap, CheckCircle } from "lucide-react";
import axios from "axios";
import { cn } from "@/lib/utils";

interface ContributingFactor {
    name: string;
    impact: number;
}

interface PredictionResult {
    severity: string;
    probability: number;
    all_probabilities: Record<string, number>;
    risk_level: string;
    contributing_factors: ContributingFactor[];
    explanation: string;
}

const WEATHER_MAP: Record<string, number> = {
    fine: 1,
    raining: 2,
    snowing: 3,
    fine_winds: 4,
    raining_winds: 5,
    snowing_winds: 6,
    fog: 7,
};

const ROAD_MAP: Record<string, number> = {
    dry: 1,
    "wet/damp": 2,
    snow: 3,
    "frost/ice": 4,
    flood: 5,
};

const LIGHT_MAP: Record<string, number> = {
    daylight: 1,
    dark_lights_lit: 4,
    dark_lights_unlit: 5,
    dark_no_lights: 6,
};

const VEHICLE_MAP: Record<string, number> = {
    car: 1,
    motorcycle: 2,
    van: 8,
    hgv: 11,
    bus: 5,
};

const SEVERITY_COLORS: Record<string, { bg: string; text: string; glow: string; bar: string }> = {
    Slight: {
        bg: "bg-emerald-500/10 border border-emerald-500/30",
        text: "text-emerald-400",
        glow: "shadow-[0_0_40px_rgba(16,185,129,0.15)]",
        bar: "bg-gradient-to-r from-emerald-500 to-emerald-400",
    },
    Serious: {
        bg: "bg-orange-500/10 border border-orange-500/30",
        text: "text-orange-400",
        glow: "shadow-[0_0_40px_rgba(249,115,22,0.15)]",
        bar: "bg-gradient-to-r from-orange-500 to-amber-400",
    },
    Fatal: {
        bg: "bg-red-500/10 border border-red-500/50",
        text: "text-red-500",
        glow: "shadow-[0_0_40px_rgba(255,45,85,0.25)]",
        bar: "bg-gradient-to-r from-red-600 to-rose-400",
    },
};

const RISK_BADGE: Record<string, { color: string; icon: React.ReactNode }> = {
    Low: { color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: <CheckCircle className="w-3.5 h-3.5" /> },
    Medium: { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: <TrendingUp className="w-3.5 h-3.5" /> },
    High: { color: "bg-orange-500/20 text-orange-400 border-orange-500/30", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
    Critical: { color: "bg-red-500/20 text-red-400 border-red-500/40", icon: <Zap className="w-3.5 h-3.5 animate-pulse" /> },
};

export default function PredictPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<PredictionResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [age, setAge] = useState("");
    const [speed, setSpeed] = useState("");
    const [weather, setWeather] = useState("");
    const [road, setRoad] = useState("");
    const [lighting, setLighting] = useState("");
    const [vehicle, setVehicle] = useState("");
    const [vehicles, setVehicles] = useState("");

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const payload = {
            Age_of_Driver: parseInt(age),
            Speed_limit: parseInt(speed),
            Weather_Conditions: WEATHER_MAP[weather] ?? 1,
            Road_Surface_Conditions: ROAD_MAP[road] ?? 1,
            Light_Conditions: LIGHT_MAP[lighting] ?? 1,
            Vehicle_Type: VEHICLE_MAP[vehicle] ?? 1,
            Number_of_Vehicles: parseInt(vehicles) || 1,
        };

        try {
            const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
            const res = await axios.post(`${baseUrl}/predict`, payload);
            setResult(res.data);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Prediction failed";
            setError(msg);
            setResult(null);
        } finally {
            setLoading(false);
        }
    };

    const severityStyle = result ? SEVERITY_COLORS[result.severity] || SEVERITY_COLORS.Slight : null;
    const riskBadge = result ? RISK_BADGE[result.risk_level] || RISK_BADGE.Low : null;

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-700 pb-10">
            
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-bl from-indigo-500/10 via-cyan-500/5 to-transparent pointer-events-none -z-10 rounded-tr-[5rem]" />

            <div className="pt-2 px-2 md:px-0">
                <h1 className="text-3xl md:text-5xl font-extrabold text-gradient-premium tracking-tight mb-2">
                    Accident Risk Inference
                </h1>
                <p className="text-slate-400 text-sm md:text-base max-w-3xl">
                    Input situational telemetry to run the Random Forest model classification. Analyze severity distribution and core factors.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* ───── Form Section (7/12 cols) ───── */}
                <Card className="glass-card lg:col-span-7 relative group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-transparent rounded-3xl pointer-events-none" />
                    <CardHeader className="p-6 md:p-8 border-b border-white/5 bg-white/[0.01]">
                        <CardTitle className="text-xl md:text-2xl text-slate-100 flex items-center gap-3 font-bold">
                            <Settings className="w-6 h-6 text-indigo-400" /> Incident Parameters
                        </CardTitle>
                        <CardDescription className="text-slate-400 text-sm mt-1">
                            Configure environmental, road, and operator variables.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8">
                        <form onSubmit={onSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-7">
                                
                                {/* Driver Age */}
                                <div className="space-y-2.5">
                                    <Label htmlFor="age" className="text-sm font-semibold text-slate-300 ml-1">Driver Age</Label>
                                    <Input 
                                        id="age" type="number" placeholder="E.g. 35" 
                                        value={age} onChange={(e) => setAge(e.target.value)} 
                                        className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500 h-12 rounded-xl transition-all shadow-inner" 
                                        required 
                                    />
                                </div>

                                {/* Speed Limit */}
                                <div className="space-y-2.5">
                                    <Label htmlFor="speed" className="text-sm font-semibold text-slate-300 ml-1">Speed Limit (km/h)</Label>
                                    <Select value={speed} onValueChange={setSpeed} required>
                                        <SelectTrigger className="bg-slate-900/50 border-white/10 text-white focus:ring-2 focus:ring-indigo-500 h-12 rounded-xl transition-all shadow-inner">
                                            <SelectValue placeholder="Select limit" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-white/10 text-slate-100 shadow-2xl rounded-xl backdrop-blur-3xl">
                                            <SelectItem value="20">20 km/h</SelectItem>
                                            <SelectItem value="30">30 km/h</SelectItem>
                                            <SelectItem value="40">40 km/h</SelectItem>
                                            <SelectItem value="50">50 km/h</SelectItem>
                                            <SelectItem value="60">60 km/h</SelectItem>
                                            <SelectItem value="70">70 km/h</SelectItem>
                                            <SelectItem value="80">80 km/h</SelectItem>
                                            <SelectItem value="100">100 km/h</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Weather Condition */}
                                <div className="space-y-2.5">
                                    <Label htmlFor="weather" className="text-sm font-semibold text-slate-300 ml-1">Weather Conditions</Label>
                                    <Select value={weather} onValueChange={setWeather} required>
                                        <SelectTrigger className="bg-slate-900/50 border-white/10 text-white focus:ring-2 focus:ring-indigo-500 h-12 rounded-xl transition-all shadow-inner">
                                            <SelectValue placeholder="Select weather" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-white/10 text-slate-100 shadow-2xl rounded-xl backdrop-blur-3xl">
                                            <SelectItem value="fine">Clear / Fine</SelectItem>
                                            <SelectItem value="raining">Raining</SelectItem>
                                            <SelectItem value="snowing">Snowing</SelectItem>
                                            <SelectItem value="fine_winds">Clear + High Winds</SelectItem>
                                            <SelectItem value="raining_winds">Raining + High Winds</SelectItem>
                                            <SelectItem value="snowing_winds">Snowing + High Winds</SelectItem>
                                            <SelectItem value="fog">Fog / Mist</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Road Surface */}
                                <div className="space-y-2.5">
                                    <Label htmlFor="road" className="text-sm font-semibold text-slate-300 ml-1">Road Surface State</Label>
                                    <Select value={road} onValueChange={setRoad} required>
                                        <SelectTrigger className="bg-slate-900/50 border-white/10 text-white focus:ring-2 focus:ring-indigo-500 h-12 rounded-xl transition-all shadow-inner">
                                            <SelectValue placeholder="Select surface" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-white/10 text-slate-100 shadow-2xl rounded-xl backdrop-blur-3xl">
                                            <SelectItem value="dry">Dry</SelectItem>
                                            <SelectItem value="wet/damp">Wet / Damp</SelectItem>
                                            <SelectItem value="snow">Snow accumulation</SelectItem>
                                            <SelectItem value="frost/ice">Frost / Ice</SelectItem>
                                            <SelectItem value="flood">Flood (over 3cm)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Lighting */}
                                <div className="space-y-2.5">
                                    <Label htmlFor="lighting" className="text-sm font-semibold text-slate-300 ml-1">Lighting Conditions</Label>
                                    <Select value={lighting} onValueChange={setLighting} required>
                                        <SelectTrigger className="bg-slate-900/50 border-white/10 text-white focus:ring-2 focus:ring-indigo-500 h-12 rounded-xl transition-all shadow-inner">
                                            <SelectValue placeholder="Select lighting" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-white/10 text-slate-100 shadow-2xl rounded-xl backdrop-blur-3xl">
                                            <SelectItem value="daylight">Daylight</SelectItem>
                                            <SelectItem value="dark_lights_lit">Dark - Route Lit</SelectItem>
                                            <SelectItem value="dark_lights_unlit">Dark - Route Unlit</SelectItem>
                                            <SelectItem value="dark_no_lights">Dark - No Infrastructure</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Vehicle Type */}
                                <div className="space-y-2.5">
                                    <Label htmlFor="vehicle" className="text-sm font-semibold text-slate-300 ml-1">Primary Vehicle</Label>
                                    <Select value={vehicle} onValueChange={setVehicle} required>
                                        <SelectTrigger className="bg-slate-900/50 border-white/10 text-white focus:ring-2 focus:ring-indigo-500 h-12 rounded-xl transition-all shadow-inner">
                                            <SelectValue placeholder="Select vehicle" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-white/10 text-slate-100 shadow-2xl rounded-xl backdrop-blur-3xl">
                                            <SelectItem value="car">Civilian Car</SelectItem>
                                            <SelectItem value="motorcycle">Motorcycle</SelectItem>
                                            <SelectItem value="van">Van / Light Goods</SelectItem>
                                            <SelectItem value="hgv">Heavy Goods Vehicle (HGV)</SelectItem>
                                            <SelectItem value="bus">Bus / Coach</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Number of Vehicles */}
                                <div className="space-y-2.5 sm:col-span-2">
                                    <Label htmlFor="vehicles" className="text-sm font-semibold text-slate-300 ml-1">Total Involved Vehicles</Label>
                                    <Input 
                                        id="vehicles" type="number" min={1} placeholder="E.g. 2" 
                                        value={vehicles} onChange={(e) => setVehicles(e.target.value)} 
                                        className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500 h-12 rounded-xl transition-all shadow-inner" 
                                        required 
                                    />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/5 flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white w-full sm:w-auto h-14 px-10 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transition-all transform active:scale-[0.98] font-bold text-base uppercase tracking-wider"
                                >
                                    {loading ? (
                                        <><Loader2 className="mr-3 h-5 w-5 animate-spin" /> Computing Inference...</>
                                    ) : (
                                        <><Activity className="mr-2 h-5 w-5" /> Execute Prediction Model</>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* ───── Results Section (5/12 cols) ───── */}
                <div className="lg:col-span-5 h-full">
                    <Card className={cn("glass-card border-none h-full transition-all duration-700 relative overflow-hidden", 
                        result ? severityStyle?.glow : "opacity-80")}
                    >
                        {result && <div className={cn("absolute inset-0 opacity-10 pointer-events-none rounded-3xl mix-blend-screen", severityStyle?.bg)} />}
                        
                        <CardHeader className="border-b border-white/5 bg-white/[0.01] p-6">
                            <CardTitle className="text-xl flex items-center text-slate-100 font-bold">
                                <ShieldAlert className="w-5 h-5 mr-3 text-cyan-400" /> Output Analytics
                            </CardTitle>
                        </CardHeader>
                        
                        <CardContent className="p-6 md:p-8 h-full">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-6 text-slate-400">
                                    <div className="relative">
                                        <div className="absolute inset-0 rounded-full blur-2xl bg-cyan-500/40 animate-pulse"></div>
                                        <Loader2 className="w-12 h-12 animate-spin text-cyan-400 relative z-10" />
                                    </div>
                                    <p className="animate-pulse font-medium tracking-wide uppercase text-sm">Evaluating Tree Ensembles...</p>
                                </div>
                            ) : error ? (
                                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center text-red-400 space-y-4">
                                    <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20">
                                        <AlertTriangle className="w-10 h-10 text-red-500" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg">Inference Failed</p>
                                        <p className="text-sm mt-1 opacity-80">{error}</p>
                                    </div>
                                </div>
                            ) : result ? (
                                <div className="space-y-8 animate-in zoom-in-95 duration-500">

                                    {/* ── Severity + Risk Badge ── */}
                                    <div className={cn("text-center p-6 md:p-8 rounded-3xl relative z-10", severityStyle?.bg)}>
                                        <p className="text-xs text-slate-300 font-bold uppercase tracking-[0.2em] mb-3 opacity-80">Predicted Classification</p>
                                        <h2 className={cn("text-5xl font-black tracking-tight", severityStyle?.text)}>
                                            {result.severity}
                                        </h2>
                                        <div className="mt-5 flex justify-center">
                                            {riskBadge && (
                                                <span className={cn("inline-flex items-center gap-2 px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full border shadow-lg backdrop-blur-md", riskBadge.color)}>
                                                    {riskBadge.icon} {result.risk_level} Risk Level
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* ── Probability Breakdown ── */}
                                    <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/5 relative z-10">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-5 flex items-center gap-2">
                                            <Activity className="w-4 h-4 text-indigo-400" /> Probability Matrix
                                        </h3>
                                        <div className="space-y-4">
                                            {Object.entries(result.all_probabilities).map(([label, pct]) => {
                                                const style = SEVERITY_COLORS[label] || SEVERITY_COLORS.Slight;
                                                const isMax = label === result.severity;
                                                return (
                                                    <div key={label}>
                                                        <div className="flex justify-between mb-1.5">
                                                            <span className={cn("text-xs font-bold tracking-wide", isMax ? style.text : 'text-slate-400')}>
                                                                {label}
                                                            </span>
                                                            <span className={cn("text-xs font-mono font-bold", isMax ? 'text-white' : 'text-slate-500')}>
                                                                {pct}%
                                                            </span>
                                                        </div>
                                                        <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-white/5 shadow-inner">
                                                            <div
                                                                className={cn("h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_currentColor]", style.bar)}
                                                                style={{ width: `${Math.max(pct, 2)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* ── Explanation ── */}
                                    <div className="relative z-10 px-2 mt-4">
                                        <p className="text-sm text-slate-300 leading-relaxed font-medium">
                                            <span className="text-indigo-400 font-bold mr-2">Analysis:</span>
                                            {result.explanation}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center text-slate-500 opacity-60">
                                    <Activity className="w-16 h-16 mb-4 opacity-20" />
                                    <p className="text-sm max-w-[250px] font-medium leading-relaxed">
                                        Awaiting parameters to initiate inference generation...
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}

// We need an empty export to satisfy next.js tools if running into namespace issues.
function Settings(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1.8 1.98 2 2 0 0 1-2.14-1.2l-.12-.22a2 2 0 0 0-2.8-.73l-.3.17a2 2 0 0 0-.74 2.81l.12.22a2 2 0 0 1-.5 2.5 2 2 0 0 1-2.4-.41l-.17-.3A2 2 0 0 0 2 11.78v.44a2 2 0 0 0 2 2v.18a2 2 0 0 1-1.98 1.8 2 2 0 0 1-1.2-2.14l-.22-.12a2 2 0 0 0-2.81-.74l-.17.3a2 2 0 0 0 2.81-.74l.22.12a2 2 0 0 1 2.5-.5 2 2 0 0 1 .41-2.4l-.3-.17a2 2 0 0 0 .73-2.8l.17-.3a2 2 0 0 0 .74-2.81l-.12-.22a2 2 0 0 1 1.98-1.8 2 2 0 0 1 2.14 1.2l.22.12a2 2 0 0 0 2.8.74l.3-.17a2 2 0 0 0 .74-2.81l-.12-.22a2 2 0 0 1 1.8-1.98z"/><circle cx="12" cy="12" r="3"/></svg>
}
