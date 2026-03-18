"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileText, Download, Loader2, CheckCircle2 } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";

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
        }, 2500);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">

            <div>
                <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                    Batch CSV Prediction
                </h1>
                <p className="text-slate-400 mt-2">
                    Upload a dataset of accident records to run bulk inference.
                </p>
            </div>

            <Card className="glass-card border-none bg-slate-900/40">
                <CardContent className="p-8">
                    <div
                        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${file ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-700 bg-slate-800/30 hover:border-indigo-500/50 hover:bg-slate-800/50'}`}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                    >
                        {file ? (
                            <div className="flex flex-col items-center space-y-4 animate-in zoom-in duration-300">
                                <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                    <FileText className="w-8 h-8 text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-white">{file.name}</h3>
                                    <p className="text-sm text-slate-400">{(file.size / 1024).toFixed(2)} KB</p>
                                </div>
                                {!results && (
                                    <Button
                                        onClick={handleUpload}
                                        disabled={loading}
                                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 mt-4"
                                    >
                                        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</> : 'Run Predictions'}
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center space-y-4">
                                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                                    <UploadCloud className="w-8 h-8 text-slate-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-slate-200">Drag & drop your CSV file here</h3>
                                    <p className="text-sm text-slate-500 mt-1">Must contain same feature columns as training data.</p>
                                </div>
                                <input
                                    type="file"
                                    accept=".csv"
                                    className="hidden"
                                    id="file-upload"
                                    onChange={(e) => e.target.files && setFile(e.target.files[0])}
                                />
                                <Button variant="outline" className="mt-4 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white" asChild>
                                    <label htmlFor="file-upload" className="cursor-pointer">Browse Files</label>
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Results Table */}
            {results && (
                <Card className="glass-card border-none bg-slate-900/40 animate-in slide-in-from-bottom-8 duration-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle className="text-xl text-slate-200 flex items-center">
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 mr-2" />
                                Prediction Results
                            </CardTitle>
                            <CardDescription className="text-slate-400 mt-1">
                                Successfully classified {results.length} accident records.
                            </CardDescription>
                        </div>
                        <Button className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700">
                            <Download className="w-4 h-4 mr-2 text-indigo-400" /> Export CSV
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border border-slate-800 mt-4 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-slate-900/80">
                                    <TableRow className="border-slate-800 hover:bg-transparent">
                                        <TableHead className="text-slate-400 font-medium">Record ID</TableHead>
                                        <TableHead className="text-slate-400 font-medium">Age</TableHead>
                                        <TableHead className="text-slate-400 font-medium">Weather</TableHead>
                                        <TableHead className="text-slate-400 font-medium">Speed Limit</TableHead>
                                        <TableHead className="text-slate-400 font-medium">Predicted Severity</TableHead>
                                        <TableHead className="text-slate-400 font-medium text-right">Confidence</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {results.map((row) => (
                                        <TableRow key={row.id} className="border-slate-800/50 hover:bg-white/[0.02]">
                                            <TableCell className="font-mono text-slate-500">#{row.id}</TableCell>
                                            <TableCell className="text-slate-300">{row.age}</TableCell>
                                            <TableCell className="text-slate-300">{row.weather}</TableCell>
                                            <TableCell className="text-slate-300">{row.speed} mph</TableCell>
                                            <TableCell>
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${row.severity === 'Fatal' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                                    row.severity === 'Serious' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                                                        'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                    }`}>
                                                    {row.severity}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right text-slate-400 font-mono">{row.conf}</TableCell>
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
