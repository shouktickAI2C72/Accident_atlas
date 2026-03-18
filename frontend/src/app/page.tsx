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
import { Activity, AlertTriangle, ShieldCheck, TrendingUp } from "lucide-react";

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
    <div className="space-y-8 animate-in fade-in zoom-in duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
            Accident Atlas Dashboard
          </h1>
          <p className="text-slate-400 mt-2">
            Real-time severity prediction and analytics engine powered by Machine Learning.
          </p>
        </div>
        <div className="flex items-center gap-3 glass px-4 py-2 rounded-full cursor-default">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-sm font-medium text-slate-300">Model Endpoint: Active</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

        <Card className="glass-card border-none bg-slate-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Total Predictions Made
            </CardTitle>
            <Activity className="h-4 w-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">12,345</div>
            <p className="text-xs text-emerald-400 flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" /> +20.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-none bg-slate-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              High Severity Alerts
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-rose-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">4,231</div>
            <p className="text-xs text-rose-400 flex items-center mt-1">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-none bg-slate-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Model Accuracy (RF)
            </CardTitle>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">94.2%</div>
            <p className="text-xs text-slate-400 mt-1">
              F1-Score: 0.93 | ROC-AUC: 0.96
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-none bg-slate-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Avg Processing Time
            </CardTitle>
            <Activity className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">120ms</div>
            <p className="text-xs text-slate-400 mt-1">
              Through FastAPI inference
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Area */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Feature Importance */}
        <Card className="glass-card border-none bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-slate-200">Feature Importance (Global)</CardTitle>
            <CardDescription className="text-slate-400">
              Relative magnitude of features used by the underlying Random Forest model.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureImportance} layout="vertical" margin={{ left: 30, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" tick={{ fill: '#cbd5e1' }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                />
                <Bar
                  dataKey="value"
                  fill="var(--chart-1)"
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Model Training Convergence */}
        <Card className="glass-card border-none bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-slate-200">Model Evaluation Trace</CardTitle>
            <CardDescription className="text-slate-400">
              Training accuracy improvement across iterations.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={accuracyData} margin={{ left: 0, right: 10, top: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="epoch" stroke="#94a3b8" />
                <YAxis domain={[80, 100]} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="var(--chart-2)"
                  strokeWidth={3}
                  dot={{ r: 6, fill: '#0f172a', stroke: 'var(--chart-2)', strokeWidth: 2 }}
                  activeDot={{ r: 8, fill: 'var(--chart-2)', stroke: '#fff' }}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
