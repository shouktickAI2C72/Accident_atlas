"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Activity, AlertTriangle, ShieldCheck, TrendingUp, Cpu } from "lucide-react";

// Mock data until ML API is connected
const accuracyData = [
  { epoch: 'Model 1', accuracy: 82 },
  { epoch: 'Model 2', accuracy: 85 },
  { epoch: 'Model 3', accuracy: 89 },
  { epoch: 'Model 4', accuracy: 91 },
  { epoch: 'Final RF', accuracy: 94 },
];

const featureImportance = [
  { name: 'Speed Limit', value: 0.35 },
  { name: 'Driver Age', value: 0.22 },
  { name: 'Weather', value: 0.18 },
  { name: 'Road Condition', value: 0.15 },
  { name: 'Lighting', value: 0.10 },
];

export default function Dashboard() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">

      {/* Decorative Header Background */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none -z-10 rounded-t-3xl" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pt-2 px-2 md:px-0">
        <div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-gradient-premium tracking-tight mb-2">
            Analytics Overview
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl">
            Real-time severity prediction and deep-learning telemetry powered by Accident Atlas.
          </p>
        </div>
        <div className="flex items-center gap-3 glass px-5 py-2.5 rounded-2xl cursor-default shadow-lg border-emerald-500/20 bg-emerald-500/5">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
          </span>
          <span className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">FastAPI Target: Active</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-4">

        <Card className="glass-card relative overflow-hidden group">
          <div className="absolute -top-4 -right-4 p-8 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500">
            <Activity className="w-24 h-24 text-indigo-400" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Predictions
            </CardTitle>
            <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
              <Activity className="h-4 w-4 text-indigo-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-black text-white font-mono mt-2 mb-1">12,345</div>
            <p className="text-xs font-medium text-emerald-400 flex items-center bg-emerald-500/10 w-fit px-2 py-1 rounded-md border border-emerald-500/20">
              <TrendingUp className="w-3 h-3 mr-1.5" /> +20.1% vs last month
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card relative overflow-hidden group">
          <div className="absolute -top-4 -right-4 p-8 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500">
            <AlertTriangle className="w-24 h-24 text-rose-400" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              High Severity Alerts
            </CardTitle>
            <div className="p-2 bg-rose-500/10 rounded-lg border border-rose-500/20">
              <AlertTriangle className="h-4 w-4 text-rose-400 animate-pulse" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-black text-white font-mono mt-2 mb-1">4,231</div>
            <p className="text-xs font-medium text-rose-400 bg-rose-500/10 w-fit px-2 py-1 rounded-md border border-rose-500/20">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card relative overflow-hidden group">
          <div className="absolute -top-4 -right-4 p-8 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500">
            <ShieldCheck className="w-24 h-24 text-emerald-400" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Model Accuracy (RF)
            </CardTitle>
            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-black text-white font-mono mt-2 mb-1 text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">94.2%</div>
            <p className="text-xs font-medium text-slate-400 bg-white/5 w-fit px-2 py-1 rounded-md border border-white/10">
              F1-Score: 0.93 • ROC-AUC: 0.96
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card relative overflow-hidden group">
          <div className="absolute -top-4 -right-4 p-8 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500">
            <Cpu className="w-24 h-24 text-cyan-400" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Avg Processing Time
            </CardTitle>
            <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
              <Cpu className="h-4 w-4 text-cyan-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-black text-white font-mono mt-2 mb-1">120<span className="text-xl text-slate-500 ml-1">ms</span></div>
            <p className="text-xs font-medium text-cyan-400 bg-cyan-500/10 w-fit px-2 py-1 rounded-md border border-cyan-500/20">
              P99 Response Time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Area */}
      <div className="grid gap-6 lg:grid-cols-2 mt-8">
        
        {/* Feature Importance */}
        <Card className="glass-card border-none bg-slate-900/40 relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-transparent rounded-3xl pointer-events-none" />
          <CardHeader className="p-6 md:p-8">
            <CardTitle className="text-xl font-bold flex items-center gap-2 text-slate-100">
              <Activity className="w-5 h-5 text-indigo-400" /> Feature Importance (Global)
            </CardTitle>
            <CardDescription className="text-slate-400">
              Relative magnitude of features utilized by the underlying Random Forest model telemetry.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] px-2 md:px-8 pb-8">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureImportance} layout="vertical" margin={{ left: 30, right: 10 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#64748b" tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" tick={{ fill: '#e2e8f0', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} width={100} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                  itemStyle={{ color: '#00d9ff', fontWeight: 'bold' }}
                />
                <Bar
                  dataKey="value"
                  fill="url(#barGradient)"
                  radius={[0, 6, 6, 0]}
                  barSize={16}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Model Training Convergence */}
        <Card className="glass-card border-none bg-slate-900/40 relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 to-transparent rounded-3xl pointer-events-none" />
          <CardHeader className="p-6 md:p-8">
            <CardTitle className="text-xl font-bold flex items-center gap-2 text-slate-100">
              <TrendingUp className="w-5 h-5 text-cyan-400" /> Model Evaluation Trace
            </CardTitle>
            <CardDescription className="text-slate-400">
              Training accuracy improvement and stabilization across pipeline iterations.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] px-2 md:px-8 pb-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={accuracyData} margin={{ left: 0, right: 10, top: 20 }}>
                <defs>
                   <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge>
                         <feMergeNode in="coloredBlur"/>
                         <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                   </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="epoch" stroke="#64748b" tick={{ fill: '#e2e8f0', fontSize: 12 }} tickMargin={10} />
                <YAxis domain={[80, 100]} stroke="#64748b" tick={{ fill: '#94a3b8' }} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#00d9ff"
                  strokeWidth={4}
                  dot={{ r: 6, fill: '#0f172a', stroke: '#00d9ff', strokeWidth: 3 }}
                  activeDot={{ r: 8, fill: '#00d9ff', stroke: '#fff', strokeWidth: 2 }}
                  animationDuration={1500}
                  filter="url(#glow)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
