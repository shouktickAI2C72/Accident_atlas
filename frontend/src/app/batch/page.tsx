"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileText, Download, Loader2, CheckCircle2, Server } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const mockResults = [
    { id: 1, age: 34, weather: 'Fine', road: 'Dry', speed: 30, severity: 'Slight', conf: '92%' },
    { id: 2, age: 45, weather: 'Raining', road: 'Wet', speed: 50, severity: 'Serious', conf: '78%' },
    { id: 3, age: 22, weather: 'Snow', road: 'Ice', speed: 70, severity: 'Fatal', conf: '88%' },
    { id: 4, age: 50, weather: 'Fog', road: 'Wet', speed: 40, severity: 'Serious', conf: '65%' },
    { id: 5, age: 29, weather: 'Fine', road: 'Dry', speed: 20, severity: 'Slight', conf: '95%' },
];

interface ResultRow {
    id: number;
    age: number;
    weather: string;
    road: string;
    speed: number;
    severity: string;
    conf: string;
}

export default function BatchPredictionPage() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<ResultRow[] | null>(null);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleUpload = () => {
        if (!file) return;
        setLoading(true);
        // Fake processing time
        setTimeout(() => {
            setResults(mockResults);
            setLoading(false);
        }, 2000);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-700 pb-10">

            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-bl from-indigo-500/10 via-blue-500/5 to-transparent pointer-events-none -z-10 rounded-tr-[5rem]" />

            <div className="pt-2 px-2 md:px-0">
                <h1 className="text-3xl md:text-5xl font-extrabold text-gradient-premium tracking-tight mb-2">
                    Batch Server Inference
                </h1>
                <p className="text-slate-400 text-sm md:text-base max-w-3xl">
                    Upload massive datasets of telemetry records to run bulk inferences through the Random Forest model simultaneously.
                </p>
            </div>

            <Card className="glass-card relative overflow-hidden group border-none">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-transparent rounded-3xl pointer-events-none" />
                <CardHeader className="p-6 md:p-8 border-b border-white/5 bg-white/[0.01]">
                    <CardTitle className="text-xl md:text-2xl text-slate-100 flex items-center gap-3 font-bold">
                        <Server className="w-6 h-6 text-indigo-400" /> Distributed Upload Node
                    </CardTitle>
                    <CardDescription className="text-slate-400 text-sm mt-1">
                        Drag and drop your CSV dataset directly into the processing pipeline.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6 md:p-10">
                    <div
                        className={cn(
                            "border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-500 group-hover:bg-white/[0.02]",
                            file ? 'border-indigo-500 bg-indigo-500/5 shadow-[0_0_30px_rgba(99,102,241,0.15)]' : 'border-slate-700/50 bg-slate-900/50 hover:border-indigo-500/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.1)]'
                        )}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                    >
                        {file ? (
                            <div className="flex flex-col items-center space-y-5 animate-in zoom-in duration-500">
                                <div className="w-20 h-20 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center relative">
                                    <div className="absolute inset-0 rounded-full border border-indigo-500 opacity-50 animate-ping" />
                                    <FileText className="w-10 h-10 text-indigo-400 relative z-10" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-white tracking-wide">{file.name}</h3>
                                    <p className="text-sm font-medium text-slate-400">{(file.size / 1024).toFixed(2)} KB • Vectorized CSV</p>
                                </div>
                                {!results && (
                                    <Button
                                        onClick={handleUpload}
                                        disabled={loading}
                                        className="bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white px-10 h-12 mt-6 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transition-all font-bold tracking-wider"
                                    >
                                        {loading ? (
                                            <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Transmitting...</>
                                        ) : (
                                            'Run Vector Inference'
                                        )}
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center space-y-6">
                                <div className="w-20 h-20 rounded-full bg-slate-800/80 border border-white/5 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                                    <UploadCloud className="w-10 h-10 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-200">Drag & drop dataset volume here</h3>
                                    <p className="text-sm font-medium text-slate-500 mt-2">Compatible formats: .CSV • Schema must match train set.</p>
                                </div>
                                <input
                                    type="file"
                                    accept=".csv"
                                    className="hidden"
                                    id="file-upload"
                                    onChange={(e) => e.target.files && setFile(e.target.files[0])}
                                />
                                <Button className="mt-6 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white rounded-xl h-12 px-8 font-semibold glass hover:border-indigo-500/30 transition-all duration-300" asChild>
                                    <label htmlFor="file-upload" className="cursor-pointer">Browse Explorer</label>
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Results Table */}
            {results && (
                <Card className="glass-card relative overflow-hidden group border-none animate-in slide-in-from-bottom-8 duration-700">
                    <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent rounded-3xl pointer-events-none" />
                    
                    <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 pt-8 px-6 md:px-8 border-b border-white/5">
                        <div className="mb-4 sm:mb-0">
                            <CardTitle className="text-xl md:text-2xl text-slate-100 flex items-center font-bold">
                                <CheckCircle2 className="w-6 h-6 text-emerald-400 mr-3" />
                                Matrix Classification Results
                            </CardTitle>
                            <CardDescription className="text-slate-400 mt-1 font-medium text-sm">
                                Pipeline successfully completed. Displaying {results.length} record inferences.
                            </CardDescription>
                        </div>
                        <Button className="bg-slate-800/80 hover:bg-slate-700 text-white border border-white/10 rounded-xl px-6 h-11 shadow-lg hover:border-indigo-500/50 transition-all">
                            <Download className="w-4 h-4 mr-2 text-cyan-400" /> Export Matrix
                        </Button>
                    </CardHeader>

                    <CardContent className="p-0 sm:p-6 md:p-8 pt-0 sm:pt-6">
                        <div className="border border-white/10 sm:rounded-2xl overflow-hidden bg-slate-900/60 shadow-2xl">
                            <Table>
                                <TableHeader className="bg-slate-950/80 border-b border-white/5">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="text-slate-300 font-semibold tracking-wider h-12">UID</TableHead>
                                        <TableHead className="text-slate-300 font-semibold tracking-wider">Age</TableHead>
                                        <TableHead className="text-slate-300 font-semibold tracking-wider">Atmosphere</TableHead>
                                        <TableHead className="text-slate-300 font-semibold tracking-wider">Velocity</TableHead>
                                        <TableHead className="text-slate-300 font-semibold tracking-wider">Classification</TableHead>
                                        <TableHead className="text-slate-300 font-semibold tracking-wider text-right pr-6">P(x)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {results.map((row) => (
                                        <TableRow key={row.id} className="border-b border-white/5 hover:bg-white/[0.04] transition-colors duration-200">
                                            <TableCell className="font-mono text-slate-500 font-medium pl-4 py-4">#{row.id}</TableCell>
                                            <TableCell className="text-slate-300 font-medium">{row.age}</TableCell>
                                            <TableCell className="text-slate-300 font-medium">{row.weather}</TableCell>
                                            <TableCell className="text-slate-300 font-mono text-sm">{row.speed} <span className="text-slate-500 font-sans">kph</span></TableCell>
                                            <TableCell>
                                                <span className={cn(
                                                    "px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider",
                                                    row.severity === 'Fatal' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.1)]' :
                                                    row.severity === 'Serious' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.1)]' :
                                                    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(52,211,153,0.1)]'
                                                )}>
                                                    {row.severity}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right pr-6 font-mono text-sm font-medium">
                                                <span className={cn(
                                                    "bg-slate-800/80 px-2.5 py-1 rounded-md border border-white/5",
                                                    parseInt(row.conf) > 90 ? "text-cyan-400" : "text-slate-400"
                                                )}>
                                                    {row.conf}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}

        </div>
    );
}
