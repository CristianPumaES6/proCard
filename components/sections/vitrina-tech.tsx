"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Code, Shield, Cpu, Terminal as TerminalIcon, ChevronRight, ChevronLeft, Lock, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export function TechView({ profile, onNext, onPrev, hasMultiple }: { profile: any; onNext: () => void; onPrev: () => void; hasMultiple: boolean }) {
    if (!profile) return (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
            <p className="text-muted-foreground font-mono">NO_TECH_PROFILES_FOUND</p>
        </div>
    );

    const [projectFilter, setProjectFilter] = useState<'public' | 'private'>('public');
    const [projectIndex, setProjectIndex] = useState(0);

    const ranking = profile.attributes?.find((a: any) => a.label === "RANKING")?.value || "#339";
    const skillCategories = profile.skillCategories || [];

    // Filter projects
    const allProjects = profile.projects || [];
    const publicProjects = allProjects.filter((p: any) => p.client !== 'Confidential');
    const privateProjects = allProjects.filter((p: any) => p.client === 'Confidential');

    const displayProjects = projectFilter === 'public' ? publicProjects : privateProjects;
    const activeProject = displayProjects[projectIndex] || displayProjects[0] || null;

    // Reset index when filter changes & Auto-switch if empty
    useEffect(() => {
        setProjectIndex(0);
        if (projectFilter === 'public' && publicProjects.length === 0 && privateProjects.length > 0) {
            setProjectFilter('private');
        } else if (projectFilter === 'private' && privateProjects.length === 0 && publicProjects.length > 0) {
            setProjectFilter('public');
        }
    }, [projectFilter, publicProjects.length, privateProjects.length]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
            {/* Sidebar: Bio & Console Badge */}
            <div className="lg:col-span-3 space-y-6">
                <div className="terminal-box rounded-xl p-0 relative overflow-hidden flex flex-col h-full bg-[#0a0b10] border border-white/10 shadow-2xl">
                    {/* Header */}
                    <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                            </div>
                            <span>user_bio.sh</span>
                        </div>
                        <div className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] uppercase font-bold tracking-wider">
                            Verified
                        </div>
                    </div>

                    {/* Console Content */}
                    <div className="p-5 flex-1 font-mono text-sm relative">
                        <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />

                        <div className="space-y-4 relative z-10">
                            <div className="text-zinc-500 mb-4">
                                $ whoami <br />
                                <span className="text-primary font-bold text-lg block mt-1">{profile.name}</span>
                                <span className="text-zinc-400 text-xs uppercase tracking-widest">{profile.headline}</span>
                            </div>

                            <div className="text-zinc-400 text-xs leading-relaxed border-l-2 border-white/10 pl-3">
                                <span className="text-zinc-600 block mb-1"># Biography</span>
                                <Typewriter text={profile.bio || "System architect focused on scalable solutions..."} speed={30} />
                            </div>

                            <div className="pt-4 mt-auto border-t border-white/5 flex items-center justify-between">
                                <div>
                                    <div className="text-[10px] text-zinc-600 uppercase">System Rank</div>
                                    <div className="text-2xl font-bold text-white">{ranking}</div>
                                </div>
                                <Cpu size={32} className="text-primary/20" />
                            </div>
                        </div>
                    </div>
                </div>

                {hasMultiple && (
                    <div className="flex justify-between items-center bg-[#0a0b10] border border-white/10 rounded-xl p-1 shadow-lg">
                        <button
                            onClick={onPrev}
                            className="group flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all w-full justify-start"
                        >
                            <div className="p-1.5 rounded-md bg-white/5 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                <ChevronLeft size={16} />
                            </div>
                            <span className="text-[10px] font-mono uppercase tracking-wider">Anterior</span>
                        </button>

                        <div className="h-8 w-[1px] bg-white/10 mx-2" />

                        <button
                            onClick={onNext}
                            className="group flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all w-full justify-end"
                        >
                            <span className="text-[10px] font-mono uppercase tracking-wider">Siguiente</span>
                            <div className="p-1.5 rounded-md bg-white/5 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                <ChevronRight size={16} />
                            </div>
                        </button>
                    </div>
                )}
            </div>

            {/* Center: Interactive Project Viewer */}
            <div className="lg:col-span-6">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex bg-black/40 rounded-lg p-1 border border-white/10">
                            <button
                                onClick={() => setProjectFilter('public')}
                                className={cn("px-4 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2",
                                    projectFilter === 'public' ? "bg-primary/20 text-primary border border-primary/20" : "text-zinc-500 hover:text-white"
                                )}
                            >
                                <Globe size={12} /> Public ({publicProjects.length})
                            </button>
                            <button
                                onClick={() => setProjectFilter('private')}
                                className={cn("px-4 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2",
                                    projectFilter === 'private' ? "bg-purple-500/20 text-purple-400 border border-purple-500/20" : "text-zinc-500 hover:text-white"
                                )}
                            >
                                <Lock size={12} /> Private ({privateProjects.length})
                            </button>
                        </div>
                        <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                            {displayProjects.length} Projects Found
                        </div>
                    </div>

                    <div className="relative group rounded-2xl bg-[#0a0b10] border border-white/10 overflow-hidden shadow-2xl min-h-[350px]">
                        {activeProject ? (
                            <div className="relative h-full flex flex-col">
                                {/* Image Viewer area */}
                                <div className="relative h-[240px] w-full overflow-hidden bg-zinc-900 group-inner aspect-video">
                                {activeProject.imageUrl ? (
                                    <img
                                        src={activeProject.imageUrl}
                                        alt={activeProject.title}
                                        className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).src = '/placeholder-project.jpg';
                                        }}
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-zinc-900 via-slate-900 to-zinc-950 p-6 text-center">
                                        <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-2 text-cyan-400">
                                            <Code size={26} />
                                        </div>
                                        <span className="font-mono text-sm text-zinc-300 font-semibold">{activeProject.title}</span>
                                        <span className="text-xs text-zinc-500 mt-0.5">{activeProject.client || 'System Architecture'}</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b10] via-transparent to-transparent pointer-events-none" />

                                    {/* Navigation Overlay */}
                                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                        <button
                                            onClick={() => setProjectIndex(prev => (prev - 1 + displayProjects.length) % displayProjects.length)}
                                            className="p-2 rounded-full bg-black/50 backdrop-blur border border-white/10 hover:bg-black/80 transition text-white"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        <button
                                            onClick={() => setProjectIndex(prev => (prev + 1) % displayProjects.length)}
                                            className="p-2 rounded-full bg-black/50 backdrop-blur border border-white/10 hover:bg-black/80 transition text-white"
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>

                                    {/* Images Counter */}
                                    {activeProject.images && activeProject.images.length > 0 && (
                                        <div className="absolute top-4 right-4 px-2 py-1 bg-black/60 rounded text-[10px] font-mono text-white border border-white/10 z-20">
                                            +{activeProject.images.length} imgs
                                        </div>
                                    )}
                                </div>

                                {/* Project Details Panel */}
                                <div className="p-6 relative -mt-12 z-10">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-2xl font-bold text-white leading-none">{activeProject.title}</h3>
                                        <div className="flex gap-2">
                                            {activeProject.tags?.slice(0, 3).map((t: any) => (
                                                <span key={typeof t === 'string' ? t : t.name} className="px-2 py-0.5 rounded text-[10px] bg-white/5 border border-white/10 text-zinc-400">
                                                    {typeof t === 'string' ? t : t.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <div>
                                            <span className="text-[10px] font-mono text-primary uppercase tracking-wider mb-1 block">The Challenge</span>
                                            <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                                                {activeProject.description || activeProject.context || "Architectural challenge description unavailable."}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-mono text-green-400 uppercase tracking-wider mb-1 block">The Outcome</span>
                                            <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                                                {activeProject.outcome || activeProject.result || "Successful deployment and optimization."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center p-12 text-zinc-600 min-h-[350px]">
                                <Code size={48} className="mb-4 opacity-50" />
                                <span className="font-mono text-sm uppercase tracking-widest">No Projects in Query</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right: Tech Stack Console */}
            <div className="lg:col-span-3">
                <div className="terminal-box rounded-xl h-full flex flex-col bg-[#0a0b10] border border-white/10 overflow-hidden shadow-xl">
                    <div className="p-3 border-b border-white/5 bg-white/5 flex items-center gap-2 font-mono text-[10px] text-zinc-400">
                        <TerminalIcon size={12} className="text-primary" />
                        <span className="uppercase tracking-wider">Arsenal_Log.txt</span>
                    </div>
                    <div className="p-4 flex-1 font-mono text-xs space-y-3 overflow-y-auto max-h-[400px]">
                        <div className="text-zinc-600 mb-2">// System Capabilities Loaded</div>

                        {skillCategories.length > 0 ? skillCategories.map((cat: any, idx: number) => (
                            <div key={idx} className="space-y-1">
                                <div className="text-primary/80 font-bold flex items-center gap-2">
                                    <ChevronRight size={10} />
                                    {cat.name}
                                </div>
                                <div className="pl-4 border-l border-white/5 ml-1 space-y-1">
                                    {cat.items?.slice(0, 4).map((item: any) => (
                                        <div key={typeof item === 'string' ? item : item.name} className="flex justify-between text-zinc-500 hover:text-zinc-300 transition-colors cursor-default">
                                            <span>{typeof item === 'string' ? item : item.name}</span>
                                            <span className="opacity-20">v.1.0</span>
                                        </div>
                                    ))}
                                    {cat.items?.length > 4 && (
                                        <div className="text-[10px] text-zinc-700 italic">... +{cat.items.length - 4} more</div>
                                    )}
                                </div>
                            </div>
                        )) : (
                            <div className="text-red-500/50 italic">Error: No Tech Stack Data Found</div>
                        )}

                        <div className="mt-4 pt-4 border-t border-white/5 animate-pulse flex gap-2 items-center text-primary">
                            <span>_</span>
                            <span className="text-[10px] uppercase tracking-widest opacity-50">System Monitoring</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function Typewriter({ text, speed = 30 }: { text: string, speed?: number }) {
    const [displayedText, setDisplayedText] = useState("");

    useEffect(() => {
        let i = 0;
        setDisplayedText("");
        const interval = setInterval(() => {
            if (i < text.length) {
                setDisplayedText((prev) => prev + text.charAt(i));
                i++;
            } else {
                clearInterval(interval);
            }
        }, speed);
        return () => clearInterval(interval);
    }, [text, speed]);

    return <span>{displayedText}<span className="animate-pulse">|</span></span>;
}
