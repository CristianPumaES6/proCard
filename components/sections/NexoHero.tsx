"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, Terminal as TerminalIcon, Loader2, ExternalLink,
    MapPin, Building2, AlertTriangle, ArrowUpRight, Wallet, Clock, Wifi, TrendingUp
} from "lucide-react";
import type { JobSearchResponse, JobResult, JobSource } from "@/lib/scrapers/types";

const ALL_SOURCES: JobSource[] = ["LinkedIn", "Computrabajo", "Bumeran"];

const SOURCE_STYLE: Record<JobSource, { chip: string; dot: string; active: string }> = {
    LinkedIn: { chip: "bg-[#0a66c2]/15 border-[#0a66c2]/40 text-[#4aa3ff]", dot: "bg-[#4aa3ff]", active: "bg-[#0a66c2] text-white border-[#0a66c2]" },
    Computrabajo: { chip: "bg-emerald-500/15 border-emerald-500/40 text-emerald-300", dot: "bg-emerald-400", active: "bg-emerald-500 text-black border-emerald-500" },
    Bumeran: { chip: "bg-orange-500/15 border-orange-500/40 text-orange-300", dot: "bg-orange-400", active: "bg-orange-500 text-black border-orange-500" },
};

const DEFAULT_SUGGESTIONS = ["Desarrollador", "Contador", "Ventas", "Marketing", "Enfermería", "Administración"];

type Meta = Omit<JobSearchResponse, "results">;

const dedupeKey = (j: JobResult) => `${j.source}|${j.title.toLowerCase()}|${j.company.toLowerCase()}`;

export function NexoHero() {
    // Placeholder tipo terminal (solo cuando el input está vacío y sin foco)
    const placeholder = "Ingresa un puesto o palabra clave...";
    const [typed, setTyped] = useState("");
    const [typeIndex, setTypeIndex] = useState(0);

    // Estado del buscador
    const [query, setQuery] = useState("");
    const [focused, setFocused] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [results, setResults] = useState<JobResult[]>([]);
    const [meta, setMeta] = useState<Meta | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [searched, setSearched] = useState(false);
    const [activeSources, setActiveSources] = useState<Set<JobSource>>(new Set(ALL_SOURCES));
    const [popular, setPopular] = useState<{ query: string; count: number }[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const lastQuery = useRef("");

    useEffect(() => {
        if (typeIndex < placeholder.length) {
            const t = setTimeout(() => {
                setTyped((prev) => prev + placeholder[typeIndex]);
                setTypeIndex((prev) => prev + 1);
            }, 50);
            return () => clearTimeout(t);
        }
    }, [typeIndex, placeholder]);

    useEffect(() => {
        fetch("/api/jobs/popular")
            .then((r) => r.json())
            .then((d) => setPopular(d.popular || []))
            .catch(() => { });
    }, []);

    const showPlaceholder = query.length === 0 && !focused;

    async function runSearch(rawTerm: string, page: number) {
        const term = rawTerm.trim();
        if (term.length < 2) {
            setError("Escribe al menos 2 caracteres.");
            return;
        }
        const isFirst = page === 0;
        if (isFirst) {
            setLoading(true);
            lastQuery.current = term;
        } else {
            setLoadingMore(true);
        }
        setError(null);
        setSearched(true);

        try {
            const res = await fetch(`/api/jobs/search?q=${encodeURIComponent(term)}&page=${page}`);
            const json = (await res.json()) as JobSearchResponse & { error?: string };
            if (!res.ok) {
                setError(json.error || "No se pudo completar la búsqueda.");
                if (isFirst) { setResults([]); setMeta(null); }
                return;
            }
            setMeta({
                query: json.query, location: json.location, page: json.page,
                hasMore: json.hasMore, sources: json.sources, cached: json.cached,
            });
            setResults((prev) => {
                const base = isFirst ? [] : prev;
                const seen = new Set(base.map(dedupeKey));
                const merged = [...base];
                for (const j of json.results || []) {
                    const k = dedupeKey(j);
                    if (!seen.has(k)) { seen.add(k); merged.push(j); }
                }
                return merged;
            });
            if (json.error) setError(json.error);
        } catch {
            setError("Error de red al consultar las fuentes de empleo.");
            if (isFirst) { setResults([]); setMeta(null); }
        } finally {
            if (isFirst) setLoading(false);
            else setLoadingMore(false);
        }
    }

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        runSearch(query, 0);
    }

    function selectSuggestion(term: string) {
        setQuery(term);
        runSearch(term, 0);
    }

    function toggleSource(s: JobSource) {
        setActiveSources((prev) => {
            const next = new Set(prev);
            if (next.has(s)) next.delete(s);
            else next.add(s);
            return next;
        });
    }

    const countBySource = (s: JobSource) => results.filter((r) => r.source === s).length;
    const filtered = results.filter((r) => activeSources.has(r.source));
    const suggestions = popular.length > 0 ? popular.map((p) => p.query) : DEFAULT_SUGGESTIONS;

    return (
        <section id="hero" className="relative min-h-[70vh] flex flex-col items-center justify-center pt-20 pb-16 overflow-hidden">
            {/* Fondo decorativo */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse-subtle" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] animate-pulse-subtle" />
                <div className="absolute inset-0 bg-scanline opacity-[0.03] pointer-events-none animate-scanline" />
            </div>

            <div className="container relative z-10 px-4 mx-auto text-center">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
                        Más allá de una simple tarjeta
                    </h1>
                    <ul className="flex flex-wrap justify-center gap-x-8 gap-y-2 mb-8 text-sm font-mono text-primary/80 uppercase tracking-widest list-none">
                        <li>Ingeniando tu identidad</li>
                        <li>El estándar de la excelencia</li>
                        <li>Una tarjeta</li>
                        <li>Infinitas posibilidades</li>
                    </ul>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
                        No busques, deja que las oportunidades aparezcan. Escribe un puesto y ProCard rastrea
                        vacantes reales en <span className="text-[#4aa3ff]">LinkedIn</span>,{" "}
                        <span className="text-emerald-300">Computrabajo</span> y{" "}
                        <span className="text-orange-300">Bumeran</span> en un solo lugar.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="max-w-3xl mx-auto w-full"
                >
                    <form onSubmit={onSubmit} className="terminal-box rounded-lg p-1 group">
                        <div className="flex items-center gap-2 px-4 py-2 bg-black/60 rounded-t-md border-b border-primary/20">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                            </div>
                            <div className="flex items-center gap-2 ml-4 text-[10px] font-mono text-primary/60 uppercase tracking-widest">
                                <TerminalIcon size={12} />
                                Buscar empleo por puesto o palabra clave
                            </div>
                        </div>

                        <div className="relative flex items-center bg-black/40 p-4 rounded-b-md">
                            <Search className="absolute left-6 z-10 text-primary/50 group-focus-within:text-primary transition-colors duration-300" size={20} />

                            {showPlaceholder && (
                                <div className="absolute inset-0 flex items-center pl-10 pr-4 pointer-events-none text-primary/70 font-mono text-lg md:text-xl select-none">
                                    {typed}
                                    <span className="w-2.5 h-6 bg-primary ml-1 inline-block animate-blink align-middle" />
                                </div>
                            )}

                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onFocus={() => setFocused(true)}
                                onBlur={() => setFocused(false)}
                                aria-label="Buscar empleo"
                                enterKeyHint="search"
                                className="w-full bg-transparent border-none outline-none text-primary caret-primary font-mono text-lg md:text-xl pl-10 pr-28 py-2"
                            />

                            <button
                                type="submit"
                                disabled={loading}
                                className="absolute right-4 flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-black text-sm font-bold uppercase tracking-wider hover:bg-primary/80 disabled:opacity-50 transition-colors"
                            >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                                <span className="hidden sm:inline">{loading ? "Rastreando" : "Buscar"}</span>
                            </button>
                        </div>
                    </form>

                    {/* Barra de estado */}
                    <div className="mt-4 flex flex-wrap justify-center gap-4 text-[10px] font-mono text-muted-foreground">
                        {meta?.sources && meta.sources.length > 0 ? (
                            meta.sources.map((s) => (
                                <span key={s.source} className="flex items-center gap-1">
                                    <span className={`w-1.5 h-1.5 rounded-full ${s.ok ? SOURCE_STYLE[s.source].dot : "bg-red-500"}`} />
                                    {s.source.toUpperCase()}: {s.ok ? `${countBySource(s.source)} RESULTADOS` : "SIN RESPUESTA"}
                                </span>
                            ))
                        ) : (
                            <>
                                <span className="flex items-center gap-1"><span className="w-1 h-1 bg-green-500 rounded-full" /> ENCRYPTION: ACTIVE</span>
                                <span className="flex items-center gap-1"><span className="w-1 h-1 bg-blue-500 rounded-full" /> LATENCY: 12ms</span>
                                <span className="flex items-center gap-1"><span className="w-1 h-1 bg-primary rounded-full" /> NODE: PRO_CORE_V1</span>
                            </>
                        )}
                    </div>

                    {/* Sugerencias / búsquedas populares (antes de buscar) */}
                    {!searched && (
                        <div className="mt-6 flex flex-wrap justify-center items-center gap-2">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 flex items-center gap-1">
                                <TrendingUp size={11} /> {popular.length > 0 ? "Populares" : "Prueba"}:
                            </span>
                            {suggestions.slice(0, 6).map((term) => (
                                <button
                                    key={term}
                                    onClick={() => selectSuggestion(term)}
                                    className="px-3 py-1 rounded-full text-xs bg-white/[0.04] border border-white/10 text-zinc-400 hover:border-primary/40 hover:text-primary transition-all"
                                >
                                    {term}
                                </button>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Resultados */}
                {searched && (
                    <div className="max-w-4xl mx-auto w-full mt-12 text-left">
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="flex flex-col items-center justify-center py-16 text-primary/70 font-mono">
                                    <Loader2 className="w-8 h-8 animate-spin mb-4" />
                                    <span className="text-xs uppercase tracking-[0.3em] animate-pulse">
                                        Rastreando LinkedIn · Computrabajo · Bumeran...
                                    </span>
                                </motion.div>
                            ) : (
                                <motion.div key="results" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                    {error && (
                                        <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-red-500/5 border border-red-500/20 text-red-300/90 text-sm">
                                            <AlertTriangle size={18} className="shrink-0" />
                                            <span>{error}</span>
                                        </div>
                                    )}

                                    {results.length > 0 ? (
                                        <>
                                            {/* Cabecera + filtros por fuente */}
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                                <h3 className="text-sm font-mono uppercase tracking-widest text-primary/80">
                                                    {filtered.length} vacantes para “{meta?.query}”
                                                    {meta?.cached && <span className="ml-2 text-zinc-600 normal-case">· caché</span>}
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {ALL_SOURCES.map((s) => {
                                                        const on = activeSources.has(s);
                                                        const st = SOURCE_STYLE[s];
                                                        return (
                                                            <button
                                                                key={s}
                                                                onClick={() => toggleSource(s)}
                                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-mono uppercase tracking-widest transition-all ${on ? st.active : "bg-transparent border-white/10 text-zinc-600"}`}
                                                            >
                                                                <span className={`w-1 h-1 rounded-full ${on ? "bg-current" : st.dot}`} />
                                                                {s} ({countBySource(s)})
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {filtered.length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {filtered.map((job, i) => (
                                                        <JobCard key={dedupeKey(job)} job={job} index={i} />
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-center py-12 text-zinc-600 font-mono text-xs uppercase tracking-widest">
                                                    Selecciona al menos una fuente
                                                </p>
                                            )}

                                            {/* Cargar más */}
                                            {meta?.hasMore && (
                                                <div className="flex justify-center mt-8">
                                                    <button
                                                        onClick={() => meta && runSearch(lastQuery.current, meta.page + 1)}
                                                        disabled={loadingMore}
                                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-primary/30 text-primary text-xs font-mono uppercase tracking-widest hover:bg-primary/10 disabled:opacity-50 transition-all"
                                                    >
                                                        {loadingMore ? <Loader2 size={14} className="animate-spin" /> : <ArrowUpRight size={14} />}
                                                        {loadingMore ? "Cargando..." : "Cargar más resultados"}
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        !error && (
                                            <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl">
                                                <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest">
                                                    NO_JOBS_FOUND :: “{meta?.query || query}”
                                                </p>
                                                <p className="text-zinc-600 text-xs mt-3 max-w-md mx-auto">
                                                    Las fuentes pueden estar bloqueando el rastreo desde el servidor.
                                                    Prueba con otro término o inténtalo de nuevo en unos segundos.
                                                </p>
                                            </div>
                                        )
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </section>
    );
}

function MetaChip({ icon, text, className }: { icon: React.ReactNode; text: string; className?: string }) {
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono ${className || "bg-white/5 border border-white/10 text-zinc-400"}`}>
            {icon}{text}
        </span>
    );
}

function JobCard({ job, index }: { job: JobResult; index: number }) {
    const style = SOURCE_STYLE[job.source];
    return (
        <motion.a
            href={job.url}
            target="_blank"
            rel="noreferrer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.4) }}
            className="group relative flex flex-col p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-primary/40 hover:bg-white/[0.04] transition-all overflow-hidden"
        >
            <div className="flex items-start justify-between gap-3 mb-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-mono uppercase tracking-widest ${style.chip}`}>
                    <span className={`w-1 h-1 rounded-full ${style.dot}`} />
                    {job.source}
                </span>
                <ArrowUpRight size={16} className="text-zinc-600 group-hover:text-primary transition-colors shrink-0" />
            </div>

            <h4 className="text-base font-bold text-white leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                {job.title}
            </h4>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400 mb-3">
                {job.company && (
                    <span className="flex items-center gap-1.5 truncate max-w-[60%]">
                        <Building2 size={12} className="text-zinc-500 shrink-0" />
                        <span className="truncate">{job.company}</span>
                    </span>
                )}
                {job.location && (
                    <span className="flex items-center gap-1.5 truncate">
                        <MapPin size={12} className="text-zinc-500 shrink-0" />
                        <span className="truncate">{job.location}</span>
                    </span>
                )}
            </div>

            {(job.salary || job.employmentType || job.modality) && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {job.salary && <MetaChip icon={<Wallet size={10} />} text={job.salary} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300" />}
                    {job.employmentType && <MetaChip icon={<Clock size={10} />} text={job.employmentType} />}
                    {job.modality && <MetaChip icon={<Wifi size={10} />} text={job.modality} />}
                </div>
            )}

            {job.description && (
                <p className="text-xs text-zinc-500 leading-relaxed line-clamp-3 mb-3">
                    {job.description}
                </p>
            )}

            <div className="mt-auto flex items-center justify-between pt-2 border-t border-white/5">
                <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider">
                    {job.postedAt || "Ver referencia"}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-mono text-primary/70 uppercase tracking-wider group-hover:text-primary transition-colors">
                    Ver oferta <ExternalLink size={11} />
                </span>
            </div>
        </motion.a>
    );
}
