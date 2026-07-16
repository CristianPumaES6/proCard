"use client";

/**
 * Vista compacta del módulo CREATIVE DESIGN dentro de la VITRINA DE PERFILES.
 * Comparte la firma de props de TechView / LegalView para que ProfileVitrina
 * pueda alternar entre las tres vistas sin casos especiales.
 * Estética: aurora mesh + gradiente creativo + mini-galería de portafolio.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Palette, Brush, Sparkles, ChevronLeft, ChevronRight,
    ExternalLink, Layers, ArrowUpRight
} from "lucide-react";

export function DesignView({ profile, onNext, onPrev, hasMultiple }: { profile: any; onNext: () => void; onPrev: () => void; hasMultiple: boolean }) {
    if (!profile) return (
        <div className="text-center py-20 border border-dashed border-fuchsia-500/20 rounded-2xl bg-aurora-mesh">
            <p className="text-muted-foreground font-mono">NO_DESIGN_PROFILES_FOUND</p>
        </div>
    );

    const projects = profile.projects || [];
    const skillCategories = profile.skillCategories || [];
    const attributes = profile.attributes || [];

    const [activeIndex, setActiveIndex] = useState(0);
    const activeProject = projects[activeIndex] || projects[0] || null;
    const cover = activeProject?.imageUrl || activeProject?.images?.[0]?.url;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
            {/* ============ Sidebar creativo: identidad + stats ============ */}
            <div className="lg:col-span-4 space-y-6">
                <div className="relative overflow-hidden rounded-2xl border border-fuchsia-500/20 bg-aurora-mesh p-8 shadow-2xl group">
                    <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-gradient-to-bl from-fuchsia-500/20 via-purple-500/5 to-transparent blur-2xl opacity-70 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/30 text-fuchsia-300 text-[10px] font-mono uppercase tracking-[0.25em] mb-6">
                            <Brush size={11} className="animate-pulse" />
                            Creative
                        </div>

                        <h3 className="text-3xl font-black tracking-tighter text-gradient-creative leading-none mb-2">
                            {profile.name}
                        </h3>
                        <p className="text-sm text-fuchsia-300/70 font-light mb-4">{profile.headline}</p>

                        {profile.bio && (
                            <p className="text-xs text-slate-400 leading-relaxed line-clamp-4 italic border-l-2 border-fuchsia-500/30 pl-3 mb-6">
                                “{profile.bio}”
                            </p>
                        )}

                        {attributes.length > 0 && (
                            <div className="grid grid-cols-2 gap-3">
                                {attributes.slice(0, 4).map((attr: any, i: number) => (
                                    <div key={i} className="px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-fuchsia-500/40 transition-colors">
                                        <div className="text-lg font-black text-gradient-creative">{attr.value}</div>
                                        <div className="text-[9px] font-mono uppercase tracking-[0.15em] text-slate-500 mt-0.5 truncate">{attr.label}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {hasMultiple && (
                    <div className="flex justify-between items-center rounded-xl border border-fuchsia-500/15 bg-white/[0.03] p-1 shadow-lg">
                        <button
                            onClick={onPrev}
                            className="group flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-fuchsia-300 hover:bg-fuchsia-500/5 transition-all w-full justify-start"
                        >
                            <div className="p-1.5 rounded-md bg-white/5 group-hover:bg-fuchsia-500/20 transition-colors">
                                <ChevronLeft size={16} />
                            </div>
                            <span className="text-[10px] font-mono uppercase tracking-wider">Anterior</span>
                        </button>
                        <div className="h-8 w-px bg-white/10 mx-2" />
                        <button
                            onClick={onNext}
                            className="group flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-fuchsia-300 hover:bg-fuchsia-500/5 transition-all w-full justify-end"
                        >
                            <span className="text-[10px] font-mono uppercase tracking-wider">Siguiente</span>
                            <div className="p-1.5 rounded-md bg-white/5 group-hover:bg-fuchsia-500/20 transition-colors">
                                <ChevronRight size={16} />
                            </div>
                        </button>
                    </div>
                )}
            </div>

            {/* ============ Centro/derecha: portafolio visual ============ */}
            <div className="lg:col-span-8 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-300">
                        <Palette size={20} className="text-fuchsia-400" />
                        <h3 className="text-lg font-bold uppercase tracking-widest text-gradient-creative">Portafolio</h3>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                        {projects.length} {projects.length === 1 ? "obra" : "obras"}
                    </span>
                </div>

                <div className="relative rounded-2xl border border-fuchsia-500/15 bg-white/[0.02] backdrop-blur-md overflow-hidden shadow-2xl min-h-[350px]">
                    {activeProject ? (
                        <div className="flex flex-col h-full">
                            {/* Obra destacada */}
                            <div className="relative h-[220px] w-full overflow-hidden bg-[#0c0612]">
                                {cover ? (
                                    <img
                                        src={cover}
                                        alt={activeProject.title}
                                        className="absolute inset-0 w-full h-full object-cover opacity-80 transition-transform duration-700 hover:scale-105"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-fuchsia-500/10 to-purple-500/5">
                                        <Layers size={48} className="text-fuchsia-500/30" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0612] via-[#0c0612]/40 to-transparent" />

                                {projects.length > 1 && (
                                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-3 z-20">
                                        <button
                                            onClick={() => setActiveIndex((p) => (p - 1 + projects.length) % projects.length)}
                                            className="p-2 rounded-full bg-black/50 backdrop-blur border border-fuchsia-500/20 hover:bg-fuchsia-500/20 transition text-white"
                                        >
                                            <ChevronLeft size={18} />
                                        </button>
                                        <button
                                            onClick={() => setActiveIndex((p) => (p + 1) % projects.length)}
                                            className="p-2 rounded-full bg-black/50 backdrop-blur border border-fuchsia-500/20 hover:bg-fuchsia-500/20 transition text-white"
                                        >
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                )}

                                <span className="absolute top-4 left-4 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest bg-fuchsia-500/20 border border-fuchsia-500/30 text-fuchsia-200 backdrop-blur z-20">
                                    {activeProject.type || "Proyecto"}
                                </span>
                            </div>

                            {/* Detalle de la obra */}
                            <div className="p-6 relative -mt-12 z-10">
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <h4 className="text-2xl font-bold text-white leading-tight flex items-center gap-2">
                                        {activeProject.title}
                                        {activeProject.url && (
                                            <a href={activeProject.url} target="_blank" rel="noreferrer" className="text-fuchsia-400/60 hover:text-fuchsia-300 transition-colors">
                                                <ExternalLink size={16} />
                                            </a>
                                        )}
                                    </h4>
                                    {activeProject.client && (
                                        <span className="text-xs text-slate-500 shrink-0 mt-1">{activeProject.client}</span>
                                    )}
                                </div>

                                {activeProject.description && (
                                    <p className="text-sm text-slate-400 leading-relaxed line-clamp-2 mb-4">
                                        {activeProject.description}
                                    </p>
                                )}

                                {activeProject.tags?.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {activeProject.tags.slice(0, 5).map((t: any, k: number) => (
                                            <span key={k} className="px-2 py-0.5 text-[10px] font-mono rounded bg-white/5 border border-white/10 text-slate-400">
                                                #{typeof t === "string" ? t : t.name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Tira de miniaturas */}
                            {projects.length > 1 && (
                                <div className="flex gap-2 px-6 pb-6 overflow-x-auto custom-scrollbar">
                                    {projects.map((p: any, i: number) => {
                                        const thumb = p.imageUrl || p.images?.[0]?.url;
                                        return (
                                            <button
                                                key={p.id || i}
                                                onClick={() => setActiveIndex(i)}
                                                className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border transition-all ${i === activeIndex ? "border-fuchsia-400 scale-105" : "border-white/10 opacity-60 hover:opacity-100"}`}
                                            >
                                                {thumb ? (
                                                    <img src={thumb} alt={p.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-fuchsia-500/10">
                                                        <Sparkles size={16} className="text-fuchsia-400/50" />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-12 text-slate-600 min-h-[350px]">
                            <Brush size={48} className="mb-4 opacity-40 text-fuchsia-500/40" />
                            <span className="font-mono text-sm uppercase tracking-widest">Sin obras en el portafolio</span>
                        </div>
                    )}
                </div>

                {/* Herramientas / skills en chips */}
                {skillCategories.length > 0 && (
                    <div className="rounded-2xl border border-fuchsia-500/15 bg-white/[0.02] p-5">
                        <div className="flex items-center gap-2 mb-3 text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">
                            <Layers size={12} className="text-fuchsia-400" />
                            Caja de herramientas
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {skillCategories.flatMap((cat: any) => cat.items || []).slice(0, 12).map((item: any, k: number) => (
                                <span key={k} className="px-3 py-1 rounded-full text-xs bg-white/[0.04] border border-white/10 text-slate-300 hover:border-fuchsia-400/60 hover:text-fuchsia-200 transition-all cursor-default">
                                    {typeof item === "string" ? item : item.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Enlace a la vitrina completa */}
                {(profile.slug || profile.id) && (
                    <a
                        href={`/showcase/${profile.slug || profile.id}`}
                        className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-fuchsia-300/70 hover:text-fuchsia-300 transition-colors"
                    >
                        Ver portafolio completo <ArrowUpRight size={14} />
                    </a>
                )}
            </div>
        </motion.div>
    );
}
