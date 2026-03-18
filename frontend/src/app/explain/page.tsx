"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Lightbulb, Layers } from "lucide-react";
import dynamic from 'next/dynamic';

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

// Mock SHAP data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const shapSummaryData: any = [{
    type: 'scatter',
    x: [-0.4, 0.2, 0.8, -0.6, 0.5, 0.1, -0.2, 0.4, -0.1, 0.3],
    y: ['Speed_Limit', 'Speed_Limit', 'Speed_Limit', 'Age', 'Age', 'Age', 'Weather_Rain', 'Weather_Rain', 'Surface_Wet', 'Surface_Wet'],
    mode: 'markers',
    marker: {
        color: [10, 80, 20, 90, 40, 60, 30, 70, 50, 65],
        colorscale: 'Portland',
        size: 10,
        showscale: true,
        colorbar: { title: 'Feature Value', font: { color: '#94a3b8' } }
    },
    hoverinfo: 'x+y'
}];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const shapForceData: any = [{
    type: 'bar',
    x: [0.12, 0.25, -0.05, 0.08, -0.1],
    y: ['Speed Limit (60)', 'Weather (Raining)', 'Age (35)', 'Lighting (Dark)', 'Road (Wet)'],
    orientation: 'h',
    marker: {
        color: ['#4f46e5', '#4f46e5', '#e11d48', '#4f46e5', '#e11d48']
    }
}];

export default function ExplainPage() {
    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">

            <div>
                <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
                    Explainable AI (SHAP)
                </h1>
                <p className="text-slate-400 mt-2">
                    Understand why the ML model makes specific predictions using SHapley Additive exPlanations.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* SHAP Summary Plot */}
                <Card className="glass-card border-none bg-slate-900/40 col-span-1 lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-xl text-slate-200 flex items-center">
                            <Layers className="w-5 h-5 mr-2 text-indigo-400" />
                            Global Model Explanation (SHAP Summary Plot)
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            Overview of which features are most important for the model across all predictions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[400px] w-full relative">
                        <div className="absolute inset-0 p-4">
                            <Plot
                                data={shapSummaryData}
                                layout={{
                                    autosize: true,
                                    margin: { l: 120, r: 20, t: 20, b: 40 },
                                    paper_bgcolor: 'rgba(0,0,0,0)',
                                    plot_bgcolor: 'rgba(0,0,0,0)',
                                    xaxis: { title: { text: 'SHAP value (Impact on Output)' }, color: '#94a3b8', gridcolor: '#1e293b' },
                                    yaxis: { color: '#cbd5e1', gridcolor: '#1e293b' },
                                    font: { color: '#cbd5e1' },
                                }}
                                config={{ responsive: true, displayModeBar: false }}
                                style={{ width: '100%', height: '100%' }}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Local Explanation */}
                <Card className="glass-card border-none bg-slate-900/40 md:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-xl text-slate-200 flex items-center">
                            <Lightbulb className="w-5 h-5 mr-2 text-indigo-400" />
                            Local Explanation
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            Force plot equivalent showing feature contributions for the latest predicted record.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px] relative">
                        <div className="absolute inset-0 p-4">
                            <Plot
                                data={shapForceData}
                                layout={{
                                    autosize: true,
                                    margin: { l: 140, r: 20, t: 20, b: 40 },
                                    paper_bgcolor: 'rgba(0,0,0,0)',
                                    plot_bgcolor: 'rgba(0,0,0,0)',
                                    xaxis: { title: { text: 'Contribution to Risk Score' }, color: '#94a3b8', gridcolor: '#1e293b' },
                                    yaxis: { color: '#cbd5e1', gridcolor: '#1e293b' },
                                    showlegend: false,
                                    bargap: 0.2
                                }}
                                config={{ responsive: true, displayModeBar: false }}
                                style={{ width: '100%', height: '100%' }}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Textual Explanation */}
                <Card className="glass-card border-none bg-slate-900/40 md:col-span-1 border-indigo-500/20">
                    <CardHeader>
                        <CardTitle className="text-xl text-slate-200">Insights</CardTitle>
                        <CardDescription className="text-slate-400">
                            AI-generated summary of the SHAP charts
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 text-slate-300">
                            <div className="flex items-start gap-3 bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/20">
                                <div className="w-2 h-2 rounded-full bg-indigo-400 mt-2 shrink-0" />
                                <p className="text-sm">
                                    <strong className="text-white">Speed Limit</strong> is universally the strongest predictor of accident severity across the dataset, heavily pushing predictions towards &apos;Fatal&apos; when high.
                                </p>
                            </div>
                            <div className="flex items-start gap-3 bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/20">
                                <div className="w-2 h-2 rounded-full bg-rose-400 mt-2 shrink-0" />
                                <p className="text-sm">
                                    In the latest prediction, <strong className="text-white">Weather (Raining)</strong> and <strong className="text-white">Speed Limit (60)</strong> contributed to increasing the risk, while the driver&apos;s age reduced the risk slightly.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
