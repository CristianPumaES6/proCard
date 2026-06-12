"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { getClientShowcaseProfiles } from "@/lib/api";
import { ShowcaseCard } from "@/components/ui/ShowcaseCard";
import { Upload } from "lucide-react";
import { useToast } from "@/components/ui/toast";

import { CreateProfileModal } from "@/components/CreateProfileModal";
import { saveSearchQuery, importProfile } from "@/lib/actions";

const INDUSTRY_FILTERS = [
    { key: "", label: "Todos", chip: "border-white/10 text-slate-300" },
    { key: "Tech", label: "Tecnología", chip: "border-cyan-500/40 text-cyan-400" },
    { key: "Legal", label: "Legal", chip: "border-amber-500/40 text-amber-400" },
    { key: "Design", label: "Creative Design", chip: "border-fuchsia-500/40 text-fuchsia-400" },
];

export default function ShowcasePage() {
    const { data: session } = useSession();
    const { showToast } = useToast();
    const [profiles, setProfiles] = useState<any[]>([]);
    const [filteredProfiles, setFilteredProfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [industryFilter, setIndustryFilter] = useState("");
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [showRecent, setShowRecent] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchProfiles = async () => {
        const data = await getClientShowcaseProfiles();
        setProfiles(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchProfiles();
        const storedSearches = localStorage.getItem("proCard_recentSearches");
        if (storedSearches) {
            setRecentSearches(JSON.parse(storedSearches));
        }
        // Filtro inicial por módulo desde la URL: /showcase?industry=Design
        const params = new URLSearchParams(window.location.search);
        const industry = params.get("industry");
        if (industry && ["Tech", "Legal", "Design"].includes(industry)) {
            setIndustryFilter(industry);
        }
    }, []);

    // Filtro combinado: texto + industria
    useEffect(() => {
        const lowerQuery = searchQuery.toLowerCase();
        const filtered = profiles.filter(p => {
            const matchesIndustry = !industryFilter || p.industry === industryFilter;
            const matchesQuery = !searchQuery.trim() ||
                p.name?.toLowerCase().includes(lowerQuery) ||
                p.headline?.toLowerCase().includes(lowerQuery) ||
                p.industry?.toLowerCase().includes(lowerQuery) ||
                p.location?.toLowerCase().includes(lowerQuery);
            return matchesIndustry && matchesQuery;
        });
        setFilteredProfiles(filtered);
    }, [profiles, searchQuery, industryFilter]);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    const submitSearch = async () => {
        if (!searchQuery.trim()) return;

        // Add to history if unique
        const newHistory = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
        setRecentSearches(newHistory);
        localStorage.setItem("proCard_recentSearches", JSON.stringify(newHistory));

        // Save to DB
        await saveSearchQuery(searchQuery);

        setShowRecent(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            submitSearch();
        }
    };

    const selectRecent = (term: string) => {
        handleSearch(term);
        setShowRecent(false);
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const content = event.target?.result as string;
            try {
                // Basic check if it's JSON
                JSON.parse(content);
                const result = await importProfile(content);
                if (result.success) {
                    showToast("Profile imported successfully!", "success");
                    fetchProfiles(); // Refresh list
                } else {
                    showToast(`Import failed: ${result.error}`, "error");
                }
            } catch (err) {
                showToast("Invalid JSON file.", "error");
            }
        };
        reader.readAsText(file);
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white font-mono">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-primary animate-pulse uppercase tracking-[0.3em] text-xs">Inicializando_Sistema...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-cyan-500/30">
            {/* Background Decorative Elements */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-screen bg-cyan-500/5 blur-[120px] opacity-50" />
                <div className="absolute inset-0 bg-scanline opacity-[0.02] animate-scanline" />
            </div>

            <div className="relative z-10 p-4 md:p-8 lg:p-12 max-w-7xl mx-auto space-y-12">
                <header className="relative pt-8 sm:pt-12 pb-8 px-5 sm:px-8 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl overflow-visible group">
                    {/* Acciones: flujo normal en móvil, esquina en escritorio */}
                    <div className="relative sm:absolute sm:top-0 sm:right-0 sm:p-8 z-20 flex flex-wrap items-center gap-3 sm:gap-4 mb-6 sm:mb-0">
                        {session?.user && (
                            <>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept=".json"
                                    onChange={handleImport}
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-2 bg-slate-900/50 text-slate-300 px-4 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-all border border-white/10 font-bold group backdrop-blur-sm"
                                    title="Importar CV desde JSON (con imágenes incluidas)"
                                >
                                    <Upload size={18} className="group-hover:scale-110 transition-transform" />
                                    <span className="text-xs uppercase tracking-widest">Importar</span>
                                </button>
                                <CreateProfileModal onSuccess={fetchProfiles} />
                            </>
                        )}
                    </div>

                    <div className="max-w-3xl relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-mono uppercase tracking-[0.2em] mb-6">
                            <span className="w-1 h-1 rounded-full bg-cyan-500 animate-pulse" />
                            System active: Professional Hub
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
                            Mas allá de una simple <br />
                            <span className="text-cyan-400 italic font-serif">Tarjeta.</span>
                        </h1>

                        <p className="text-slate-400 text-lg md:text-xl leading-relaxed max-w-2xl mb-10">
                            Ingeniando tu identidad. El estándar de la excelencia. Una tarjeta, infinitas posibilidades.
                        </p>

                        {/* SEARCH BAR */}
                        <div className="relative max-w-xl group/search">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within/search:text-cyan-400 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                            </div>
                            <input
                                type="text"
                                className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono text-sm tracking-wide"
                                placeholder="Ingresa un nombre o empresa..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onFocus={() => setShowRecent(true)}
                                onBlur={() => setTimeout(() => setShowRecent(false), 200)}
                            />

                            {/* RECENT SEARCHES DROPDOWN */}
                            {showRecent && recentSearches.length > 0 && (
                                <div className="absolute top-full mt-2 w-full bg-slate-950 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-20 animate-in fade-in slide-in-from-top-2">
                                    <div className="px-4 py-2 border-b border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        Búsquedas Recientes
                                    </div>
                                    {recentSearches.map((term, i) => (
                                        <button
                                            key={i}
                                            className="w-full text-left px-4 py-3 text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-3"
                                            onClick={() => selectRecent(term)}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                            {term}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="absolute top-full mt-2 left-0 flex gap-4 text-[10px] font-mono text-cyan-500/50 uppercase tracking-widest">
                                <span>● Encriptación: Activa</span>
                                <span>● Latencia: 12ms</span>
                                <span>● Nodo: PRO_CORE_V1</span>
                            </div>
                        </div>
                    </div>

                    {/* Decorative header element */}
                    <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] group-hover:bg-cyan-500/20 transition-colors duration-700 pointer-events-none" />
                </header>

                <div className="space-y-8 sm:space-y-12">
                    {/* Filtros por módulo / industria */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        {INDUSTRY_FILTERS.map((f) => (
                            <button
                                key={f.key}
                                onClick={() => setIndustryFilter(f.key)}
                                className={`px-4 py-2 rounded-full border text-xs font-mono uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${f.chip} ${industryFilter === f.key
                                    ? "bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.08)] border-opacity-100"
                                    : "bg-transparent opacity-60 hover:opacity-100"
                                    }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-4">
                        <h2 className="text-xs sm:text-sm font-mono text-slate-500 uppercase tracking-widest">
                            {filteredProfiles.length} Perfiles Encontrados // Total: {profiles.length}
                        </h2>
                        <div className="flex gap-4 text-[10px] font-mono text-slate-600">
                            <span className={searchQuery || industryFilter ? "text-cyan-500" : ""}>
                                FILTRO: {industryFilter || (searchQuery ? "BÚSQUEDA" : "NINGUNO")}
                            </span>
                            <span className="hidden sm:inline">Orden: Fecha de Creación</span>
                        </div>
                    </div>

                    {filteredProfiles.length > 0 ? (
                        <div className="grid grid-cols-1 gap-12">
                            {filteredProfiles.map((profile) => (
                                <ShowcaseCard key={profile.id} profile={profile} onProfileUpdate={fetchProfiles} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 border border-dashed border-white/5 rounded-2xl">
                            <p className="text-slate-500 font-mono text-sm">NO_SE_ENCONTRARON_DATOS_COINCIDENTES</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
