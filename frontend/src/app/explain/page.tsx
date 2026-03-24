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
        colorscale: 'Portland', // using an attractive colorscale natively
        size: 12,
        showscale: true,
        colorbar: { 
            title: 'Feature Value', 
            font: { color: '#94a3b8' }, 
            tickfont: { color: '#64748b' },
            thickness: 15,
            bordercolor: 'rgba(255,255,255,0.1)'
        }
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
        color: ['rgba(99, 102, 241, 0.8)', 'rgba(99, 102, 241, 0.8)', 'rgba(244, 63, 94, 0.8)', 'rgba(99, 102, 241, 0.8)', 'rgba(244, 63, 94, 0.8)'],
        line: { width: 1, color: 'rgba(255,255,255,0.2)' }
    }
}];

export default function ExplainPage() {
    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-700 pb-10">

            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-bl from-purple-500/10 via-indigo-500/5 to-transparent pointer-events-none -z-10 rounded-tr-[5rem]" />

            <div className="pt-2 px-2 md:px-0">
                <h1 className="text-3xl md:text-5xl font-extrabold text-gradient-premium tracking-tight mb-2">
                    XAI Diagnostics
                </h1>
                <p className="text-slate-400 text-sm md:text-base max-w-3xl">
                    Deconstruct the neural inference mechanism using SHapley Additive exPlanations. Understand the weight of every parameter.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* SHAP Summary Plot (Full Width) */}
                <Card className="glass-card col-span-1 lg:col-span-12 relative group bg-gradient-to-tr from-slate-900/80 to-slate-950/90 border-t border-purple-500/20">
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 to-transparent rounded-3xl pointer-events-none" />
                    <CardHeader className="p-6 md:p-8 border-b border-white/5 bg-white/[0.01]">
                        <CardTitle className="text-xl md:text-2xl text-slate-100 flex items-center font-bold">
                            <Layers className="w-6 h-6 mr-3 text-purple-400" />
                            Global Model Explanation Matrix
                        </CardTitle>
                        <CardDescription className="text-slate-400 font-medium text-sm mt-1">
                            Macroscopic overview detailing vector importance across the entire evaluated dataset.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[450px] w-full relative p-4 md:p-6">
                        <div className="absolute inset-0 p-4">
                            <Plot
                                data={shapSummaryData}
                                layout={{
                                    autosize: true,
                                    margin: { l: 140, r: 40, t: 20, b: 60 },
                                    paper_bgcolor: 'rgba(0,0,0,0)',
                                    plot_bgcolor: 'rgba(0,0,0,0)',
                                    xaxis: { 
                                        title: { text: '+SHAP Value (Impact on Final Output Output)', font: { size: 12, color: '#94a3b8' } }, 
                                        color: '#cbd5e1', 
                                        gridcolor: 'rgba(255,255,255,0.05)',
                                        zerolinecolor: 'rgba(255,255,255,0.2)'
                                    },
                                    yaxis: { 
                                        color: '#e2e8f0', 
                                        gridcolor: 'rgba(255,255,255,0.05)',
                                        tickfont: { size: 12, weight: 'bold' } 
                                    },
                                    font: { family: 'inherit', color: '#cbd5e1' },
                                }}
                                config={{ responsive: true, displayModeBar: false }}
                                style={{ width: '100%', height: '100%' }}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Local Explanation (7/12 Width) */}
                <Card className="glass-card lg:col-span-7 relative bg-gradient-to-br from-slate-900/80 to-slate-950/90">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent rounded-3xl pointer-events-none" />
                    <CardHeader className="p-6 md:p-8 border-b border-white/5">
                        <CardTitle className="text-xl md:text-2xl text-slate-100 flex items-center font-bold">
                            <Lightbulb className="w-6 h-6 mr-3 text-indigo-400" />
                            Local Record Breakdown
                        </CardTitle>
                        <CardDescription className="text-slate-400 font-medium text-sm mt-1">
                            Force plot simulating feature vectors acting on the baseline risk score for the active inference.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[400px] relative p-4">
                        <div className="absolute inset-0 p-4">
                            <Plot
                                data={shapForceData}
                                layout={{
                                    autosize: true,
                                    margin: { l: 160, r: 40, t: 30, b: 60 },
                                    paper_bgcolor: 'rgba(0,0,0,0)',
                                    plot_bgcolor: 'rgba(0,0,0,0)',
                                    xaxis: { 
                                        title: { text: 'Directional Risk Vector', font: { size: 12, color: '#94a3b8' } }, 
                                        color: '#cbd5e1', 
                                        gridcolor: 'rgba(255,255,255,0.05)',
                                        zerolinecolor: 'rgba(255,255,255,0.2)'
                                    },
                                    yaxis: { 
                                        color: '#e2e8f0', 
                                        tickfont: { size: 12, weight: 'bold' }
                                    },
                                    showlegend: false,
                                    bargap: 0.3,
                                    font: { family: 'inherit', color: '#cbd5e1' },
                                }}
                                config={{ responsive: true, displayModeBar: false }}
                                style={{ width: '100%', height: '100%' }}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Textual Explanation (5/12 Width) */}
                <Card className="glass-card lg:col-span-5 border-purple-500/20 shadow-[0_0_40px_rgba(168,85,247,0.1)] relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent rounded-3xl pointer-events-none" />
                    <CardHeader className="p-6 md:p-8 border-b border-white/5 bg-white/[0.01]">
                        <CardTitle className="text-xl md:text-2xl text-slate-100 font-bold tracking-wide">Synthesized Insights</CardTitle>
                        <CardDescription className="text-slate-400 font-medium text-sm mt-1">
                            AI-extracted narrative of SHAP variable distributions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8 space-y-5">
                        <div className="bg-indigo-500/10 backdrop-blur-md p-5 rounded-2xl border border-indigo-400/20 shadow-inner group transition-all hover:bg-indigo-500/20 hover:border-indigo-400/40">
                            <div className="flex items-start gap-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                                <p className="text-sm font-medium text-slate-300 leading-relaxed">
                                    <strong className="text-white font-bold mr-1">Speed Limit</strong> 
                                    operates as the dominant high-risk predictor. Extremely high speed values drastically push the tree node classification toward <span className="text-rose-400 font-bold">Fatal</span>.
                                </p>
                            </div>
                        </div>

                        <div className="bg-rose-500/10 backdrop-blur-md p-5 rounded-2xl border border-rose-400/20 shadow-inner group transition-all hover:bg-rose-500/20 hover:border-rose-400/40">
                            <div className="flex items-start gap-4">
                                <div className="w-2.5 h-2.5 rounded-full bg-rose-400 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                                <p className="text-sm font-medium text-slate-300 leading-relaxed">
                                    Current Inference Alert: 
                                    <strong className="text-white mx-1">Raining Weather</strong> and 
                                    <strong className="text-white mx-1">Speed Limit (60)</strong> 
                                    combined to compound the risk scoring, although driver&apos;s moderate age negated a portion of the variance.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
