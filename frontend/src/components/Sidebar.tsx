"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    BarChart3,
    Map as MapIcon,
    CarFront,
    UploadCloud,
    Lightbulb,
    Menu,
    X,
    Gauge
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navigation = [
    { name: "Dashboard", href: "/", icon: BarChart3 },
    { name: "Speed Monitor", href: "/speed-monitor", icon: Gauge },
    { name: "Predict Accident", href: "/predict", icon: CarFront },
    { name: "Batch Prediction", href: "/batch", icon: UploadCloud },
    { name: "Explainable AI", href: "/explain", icon: Lightbulb },
    { name: "Accident Heatmap", href: "/map", icon: MapIcon },
];

export function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile Toggle */}
            <div className="lg:hidden fixed top-0 w-full h-16 glass z-50 flex items-center px-4 justify-between border-b border-white/10">
                <div className="font-bold text-lg text-gradient flex items-center gap-2">
                    <MapIcon className="w-6 h-6 text-indigo-400" /> Accident Atlas
                </div>
                <button onClick={() => setIsOpen(!isOpen)} className="text-gray-300">
                    {isOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Sidebar Desktop & Mobile */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-40 w-64 glass transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col pt-20 lg:pt-0 border-r border-white/10",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="hidden lg:flex h-20 items-center justify-center border-b border-indigo-500/20 px-6">
                    <div className="font-extrabold text-xl text-gradient flex items-center gap-2">
                        <MapIcon className="w-6 h-6 text-indigo-400" /> Accident Atlas
                    </div>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium",
                                    isActive
                                        ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                                        : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                                )}
                            >
                                <item.icon className={cn(
                                    "w-5 h-5 transition-colors",
                                    isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"
                                )} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <div className="glass-card rounded-xl p-4 text-center">
                        <div className="text-xs text-slate-400 mb-2">Developed with</div>
                        <div className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                            Next.js + FastAPI
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
