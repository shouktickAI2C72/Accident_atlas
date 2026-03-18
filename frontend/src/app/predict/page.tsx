"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ShieldAlert, AlertTriangle, TrendingUp, Activity, Zap } from "lucide-react";
import axios from "axios";

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
        bg: "bg-emerald-950/50",
        text: "text-emerald-400",
        glow: "shadow-emerald-500/30",
        bar: "bg-gradient-to-r from-emerald-500 to-emerald-400",
    },
    Serious: {
        bg: "bg-orange-950/50",
        text: "text-orange-400",
        glow: "shadow-orange-500/30",
        bar: "bg-gradient-to-r from-orange-500 to-amber-400",
    },
    Fatal: {
        bg: "bg-rose-950/50",
        text: "text-rose-400",
        glow: "shadow-rose-500/30",
        bar: "bg-gradient-to-r from-rose-600 to-rose-400",
    },
};

const RISK_BADGE: Record<string, { color: string; icon: React.ReactNode }> = {
    Low: { color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: <Activity className="w-3.5 h-3.5" /> },
    Medium: { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: <TrendingUp className="w-3.5 h-3.5" /> },
    High: { color: "bg-orange-500/20 text-orange-400 border-orange-500/30", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
    Critical: { color: "bg-rose-500/20 text-rose-400 border-rose-500/30", icon: <Zap className="w-3.5 h-3.5" /> },
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
            const res = await axios.post("http://localhost:8000/predict", payload);
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
        <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">

            <div>
                <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                    Accident Severity Prediction
                </h1>
                <p className="text-slate-400 mt-2">
                    Enter incident parameters below to run the Random Forest inference model and predict severity instantly.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                {/* ───── Form Section (3/5) ───── */}
                <Card className="glass-card lg:col-span-3 border-none bg-slate-900/40">
                    <CardHeader>
                        <CardTitle className="text-xl text-slate-200">Incident Parameters</CardTitle>
                        <CardDescription className="text-slate-400">Fill in the road and vehicle conditions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={onSubmit} className="space-y-6">

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                {/* Age */}
                                <div className="space-y-2">
                                    <Label htmlFor="age" className="text-slate-300">Driver Age</Label>
                                    <Input id="age" type="number" placeholder="E.g. 35" value={age} onChange={(e) => setAge(e.target.value)} className="bg-slate-800/50 border-slate-700 text-white focus:ring-indigo-500" required />
                                </div>

                                {/* Speed Limit */}
                                <div className="space-y-2">
                                    <Label htmlFor="speed" className="text-slate-300">Speed Limit (mph)</Label>
                                    <Select value={speed} onValueChange={setSpeed} required>
                                        <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                                            <SelectValue placeholder="Select limit" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-slate-700 text-white">
                                            <SelectItem value="20">20 mph</SelectItem>
                                            <SelectItem value="30">30 mph</SelectItem>
                                            <SelectItem value="40">40 mph</SelectItem>
                                            <SelectItem value="50">50 mph</SelectItem>
                                            <SelectItem value="60">60 mph</SelectItem>
                                            <SelectItem value="70">70 mph</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Weather */}
                                <div className="space-y-2">
                                    <Label htmlFor="weather" className="text-slate-300">Weather Conditions</Label>
                                    <Select value={weather} onValueChange={setWeather} required>
                                        <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                                            <SelectValue placeholder="Select weather" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-slate-700 text-white">
                                            <SelectItem value="fine">Fine no high winds</SelectItem>
                                            <SelectItem value="raining">Raining no high winds</SelectItem>
                                            <SelectItem value="snowing">Snowing no high winds</SelectItem>
                                            <SelectItem value="fine_winds">Fine + high winds</SelectItem>
                                            <SelectItem value="raining_winds">Raining + high winds</SelectItem>
                                            <SelectItem value="snowing_winds">Snowing + high winds</SelectItem>
                                            <SelectItem value="fog">Fog or mist</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Road Surface */}
                                <div className="space-y-2">
                                    <Label htmlFor="road" className="text-slate-300">Road Surface</Label>
                                    <Select value={road} onValueChange={setRoad} required>
                                        <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                                            <SelectValue placeholder="Select surface" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-slate-700 text-white">
                                            <SelectItem value="dry">Dry</SelectItem>
                                            <SelectItem value="wet/damp">Wet / Damp</SelectItem>
                                            <SelectItem value="snow">Snow</SelectItem>
                                            <SelectItem value="frost/ice">Frost / Ice</SelectItem>
                                            <SelectItem value="flood">Flood (over 3cm)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Lighting */}
                                <div className="space-y-2">
                                    <Label htmlFor="lighting" className="text-slate-300">Lighting Conditions</Label>
                                    <Select value={lighting} onValueChange={setLighting} required>
                                        <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                                            <SelectValue placeholder="Select lighting" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-slate-700 text-white">
                                            <SelectItem value="daylight">Daylight</SelectItem>
                                            <SelectItem value="dark_lights_lit">Dark - street lights lit</SelectItem>
                                            <SelectItem value="dark_lights_unlit">Dark - street lights unlit</SelectItem>
                                            <SelectItem value="dark_no_lights">Dark - no street lighting</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Vehicle Type */}
                                <div className="space-y-2">
                                    <Label htmlFor="vehicle" className="text-slate-300">Vehicle Type</Label>
                                    <Select value={vehicle} onValueChange={setVehicle} required>
                                        <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                                            <SelectValue placeholder="Select vehicle" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-slate-700 text-white">
                                            <SelectItem value="car">Car</SelectItem>
                                            <SelectItem value="motorcycle">Motorcycle</SelectItem>
                                            <SelectItem value="van">Van / Light Goods</SelectItem>
                                            <SelectItem value="hgv">Heavy Goods Vehicle</SelectItem>
                                            <SelectItem value="bus">Bus / Coach</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Number of Vehicles */}
                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="vehicles" className="text-slate-300">Number of Vehicles</Label>
                                    <Input id="vehicles" type="number" min={1} placeholder="1" value={vehicles} onChange={(e) => setVehicles(e.target.value)} className="bg-slate-800/50 border-slate-700 text-white focus:ring-indigo-500" required />
                                </div>

                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white w-full sm:w-auto h-11 px-8 rounded-lg shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all"
                                >
                                    {loading ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Running ML Inference</>
                                    ) : (
                                        "Predict Severity"
                                    )}
                                </Button>
                            </div>

                        </form>
                    </CardContent>
                </Card>

                {/* ───── Results Section (2/5) ───── */}
                <div className="lg:col-span-2 space-y-4">
                    <Card className={`glass-card border-none bg-slate-900/40 transition-all duration-500 ${result ? 'border-indigo-500/50 shadow-2xl ' + (severityStyle?.glow || '') : 'opacity-60 grayscale'}`}>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-xl flex items-center text-slate-200">
                                <ShieldAlert className="w-5 h-5 mr-2 text-indigo-400" />
                                Prediction Output
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-48 space-y-4 text-slate-400">
                                    <div className="relative">
                                        <div className="absolute inset-0 rounded-full blur-xl bg-indigo-500/30 animate-pulse"></div>
                                        <Loader2 className="w-10 h-10 animate-spin text-indigo-400 relative z-10" />
                                    </div>
                                    <p className="animate-pulse">Analyzing patterns...</p>
                                </div>
                            ) : error ? (
                                <div className="flex flex-col items-center justify-center h-48 text-center text-rose-400 text-sm space-y-2">
                                    <ShieldAlert className="w-8 h-8 text-rose-500" />
                                    <p>{error}</p>
                                    <p className="text-slate-500 text-xs">Make sure the backend is running on port 8000.</p>
                                </div>
                            ) : result ? (
                                <div className="space-y-5 animate-in zoom-in-95 duration-500">

                                    {/* ── Severity + Risk Badge ── */}
                                    <div className={`text-center p-5 rounded-xl border border-white/5 ${severityStyle?.bg}`}>
                                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-1">Predicted Severity</p>
                                        <h2 className={`text-4xl font-black ${severityStyle?.text}`}>
                                            {result.severity}
                                        </h2>
                                        <div className="mt-3 flex justify-center">
                                            {riskBadge && (
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${riskBadge.color}`}>
                                                    {riskBadge.icon}
                                                    {result.risk_level} Risk
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* ── Probability Breakdown ── */}
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-300 mb-3">Severity Probability</h3>
                                        <div className="space-y-3">
                                            {Object.entries(result.all_probabilities).map(([label, pct]) => {
                                                const style = SEVERITY_COLORS[label] || SEVERITY_COLORS.Slight;
                                                const isMax = label === result.severity;
                                                return (
                                                    <div key={label}>
                                                        <div className="flex justify-between mb-1">
                                                            <span className={`text-xs font-medium ${isMax ? style.text : 'text-slate-400'}`}>
                                                                {label}
                                                            </span>
                                                            <span className={`text-xs font-bold ${isMax ? 'text-white' : 'text-slate-500'}`}>
                                                                {pct}%
                                                            </span>
                                                        </div>
                                                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-700 ease-out ${style.bar}`}
                                                                style={{ width: `${Math.max(pct, 2)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* ── Contributing Factors ── */}
                                    {result.contributing_factors && result.contributing_factors.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-semibold text-slate-300 mb-3">Contributing Factors</h3>
                                            <div className="space-y-2">
                                                {result.contributing_factors.map((f, i) => (
                                                    <div key={i} className="flex items-center justify-between bg-slate-800/40 px-3 py-2 rounded-lg border border-white/5">
                                                        <span className="text-xs text-slate-300">{f.name}</span>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-indigo-500 rounded-full"
                                                                    style={{ width: `${Math.min(f.impact * 3, 100)}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-xs text-indigo-400 font-mono w-10 text-right">{f.impact}%</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* ── Explanation ── */}
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-300 mb-2">Model Explanation</h3>
                                        <p className="text-xs text-slate-400 leading-relaxed bg-black/20 p-3 rounded-lg border border-white/5">
                                            {result.explanation}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-48 text-center text-slate-500 text-sm">
                                    Run a prediction to see AI severity analysis and explainability scores here.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}
