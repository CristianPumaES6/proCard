"use client";

/**
 * Dashboard "Mis CVs" — gestión multi-currículum.
 * Un usuario puede tener varios CVs (ej: uno como especialista Frontend
 * y otro como especialista Backend) y desde aquí los administra:
 * crear, editar, exportar (JSON con imágenes / PDF), importar y eliminar.
 */

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileText, Download, Trash2, Eye, Upload, Plus, Loader2,
    Layers, FileDown, Cpu, Scale, Palette, AlertTriangle
} from "lucide-react";
import { getMyProfiles, deleteProfile, importProfile } from "@/lib/actions";
import { CreateProfileModal } from "@/components/CreateProfileModal";
import { EditProfileModal } from "@/components/EditProfileModal";
import { useToast } from "@/components/ui/toast";

const INDUSTRY_META: Record<string, { icon: any; color: string; chip: string; glow: string }> = {
    Tech: {
        icon: Cpu,
        color: "text-cyan-400",
        chip: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
        glow: "hover:border-cyan-500/50 hover:shadow-[0_0_25px_rgba(6,182,212,0.12)]",
    },
    Legal: {
        icon: Scale,
        color: "text-amber-400",
        chip: "bg-amber-500/10 border-amber-500/30 text-amber-400",
        glow: "hover:border-amber-500/50 hover:shadow-[0_0_25px_rgba(245,158,11,0.12)]",
    },
    Design: {
        icon: Palette,
        color: "text-fuchsia-400",
        chip: "bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-400",
        glow: "hover:border-fuchsia-500/50 hover:shadow-[0_0_25px_rgba(217,70,239,0.12)]",
    },
};

export default function DashboardPage() {
    const { showToast } = useToast();
    const [profiles, setProfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [exportingId, setExportingId] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchProfiles = useCallback(async () => {
        const data = await getMyProfiles();
        setProfiles(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchProfiles();
    }, [fetchProfiles]);

    const handleExportJson = async (profile: any) => {
        setExportingId(profile.id);
        try {
            const res = await fetch(`/api/profiles/${profile.id}/export`);
            if (!res.ok) throw new Error(`Export failed: ${res.status}`);
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${profile.slug || "cv"}-procard.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            showToast("CV exportado con imágenes incluidas ✓", "success");
        } catch (e) {
            console.error(e);
            showToast("No se pudo exportar el CV.", "error");
        } finally {
            setExportingId(null);
        }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const content = await file.text();
            JSON.parse(content); // validación rápida
            const result = await importProfile(content);
            if (result.success) {
                showToast("CV importado correctamente (imágenes restauradas) ✓", "success");
                fetchProfiles();
            } else {
                showToast(`Error al importar: ${result.error}`, "error");
            }
        } catch {
            showToast("Archivo JSON inválido.", "error");
        }
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleDelete = async (id: string) => {
        setDeleting(true);
        const result = await deleteProfile(id);
        setDeleting(false);
        setConfirmDeleteId(null);
        if (result.success) {
            showToast("CV eliminado.", "success");
            fetchProfiles();
        } else {
            showToast(`Error: ${result.error}`, "error");
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center font-mono">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <p className="text-primary animate-pulse uppercase tracking-[0.3em] text-xs">Cargando_Mis_CVs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-2 sm:px-4 py-8 space-y-10">
            {/* HEADER */}
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-mono uppercase tracking-[0.2em] mb-4">
                        <Layers size={12} />
                        Centro de Control
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter mb-2">
                        Mis <span className="text-primary">Currículums</span>
                    </h1>
                    <p className="text-muted-foreground text-sm sm:text-base max-w-xl">
                        Crea múltiples CVs especializados — uno como Frontend, otro como Backend,
                        otro creativo — y gestiona, exporta o importa cada uno.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImport} />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 bg-slate-900/50 text-slate-300 px-4 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-all border border-white/10 font-bold backdrop-blur-sm"
                        title="Importar CV desde JSON"
                    >
                        <Upload size={16} />
                        <span className="text-xs uppercase tracking-widest">Importar JSON</span>
                    </button>
                    <CreateProfileModal onSuccess={fetchProfiles} />
                </div>
            </header>

            {/* GRID DE CVs */}
            {profiles.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-24 border border-dashed border-white/10 rounded-3xl"
                >
                    <Plus className="mx-auto mb-4 text-slate-600" size={40} />
                    <h3 className="text-lg font-bold text-slate-300 mb-2">Aún no tienes ningún CV</h3>
                    <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
                        Crea tu primer currículum interactivo o importa uno desde un archivo JSON exportado.
                    </p>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AnimatePresence>
                        {profiles.map((profile, i) => {
                            const meta = INDUSTRY_META[profile.industry] || INDUSTRY_META.Tech;
                            const Icon = meta.icon;
                            return (
                                <motion.article
                                    key={profile.id}
                                    layout
                                    initial={{ opacity: 0, y: 24 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.96 }}
                                    transition={{ duration: 0.4, delay: i * 0.06 }}
                                    className={`relative p-6 rounded-2xl glass-card border border-white/10 transition-all group ${meta.glow}`}
                                >
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`p-2.5 rounded-xl bg-white/5 border border-white/10 ${meta.color} shrink-0`}>
                                                <Icon size={20} />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-white truncate">{profile.name}</h3>
                                                <p className="text-xs text-slate-400 truncate">{profile.headline}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full border text-[9px] font-mono uppercase tracking-widest shrink-0 ${meta.chip}`}>
                                            {profile.industry}
                                        </span>
                                    </div>

                                    {/* Mini-stats del CV */}
                                    <div className="grid grid-cols-3 gap-2 mb-5 text-center">
                                        <div className="p-2 rounded-lg bg-white/[0.03] border border-white/5">
                                            <div className="text-sm font-bold text-white">{profile.projects?.length || 0}</div>
                                            <div className="text-[9px] uppercase tracking-widest text-slate-500">Proyectos</div>
                                        </div>
                                        <div className="p-2 rounded-lg bg-white/[0.03] border border-white/5">
                                            <div className="text-sm font-bold text-white">{profile.workExperiences?.length || 0}</div>
                                            <div className="text-[9px] uppercase tracking-widest text-slate-500">Experiencias</div>
                                        </div>
                                        <div className="p-2 rounded-lg bg-white/[0.03] border border-white/5">
                                            <div className="text-sm font-bold text-white">{profile.certifications?.length || 0}</div>
                                            <div className="text-[9px] uppercase tracking-widest text-slate-500">Certificados</div>
                                        </div>
                                    </div>

                                    {/* Acciones */}
                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                        <a
                                            href={`/showcase/${profile.slug || profile.id}`}
                                            className="flex items-center justify-center gap-2 py-2 rounded-lg border border-white/10 text-xs font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-all"
                                        >
                                            <Eye size={14} /> Ver Vitrina
                                        </a>
                                        <a
                                            href={`/cv/${profile.slug || profile.id}`}
                                            target="_blank"
                                            className="flex items-center justify-center gap-2 py-2 rounded-lg border border-white/10 text-xs font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-all"
                                            title="Exportar como PDF (A4 con portafolio)"
                                        >
                                            <FileDown size={14} /> Exportar PDF
                                        </a>
                                        <button
                                            onClick={() => handleExportJson(profile)}
                                            disabled={exportingId === profile.id}
                                            className="flex items-center justify-center gap-2 py-2 rounded-lg border border-white/10 text-xs font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-all disabled:opacity-50"
                                            title="Exportar JSON con imágenes incluidas"
                                        >
                                            {exportingId === profile.id
                                                ? <Loader2 size={14} className="animate-spin" />
                                                : <Download size={14} />}
                                            Exportar JSON
                                        </button>
                                        <button
                                            onClick={() => setConfirmDeleteId(profile.id)}
                                            className="flex items-center justify-center gap-2 py-2 rounded-lg border border-red-500/20 text-xs font-medium text-red-400 hover:bg-red-950/30 hover:border-red-500/50 transition-all"
                                        >
                                            <Trash2 size={14} /> Eliminar
                                        </button>
                                    </div>

                                    <EditProfileModal profile={profile} onSuccess={fetchProfiles} />

                                    {/* Confirmación de borrado */}
                                    <AnimatePresence>
                                        {confirmDeleteId === profile.id && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute inset-0 z-20 rounded-2xl bg-slate-950/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center"
                                            >
                                                <AlertTriangle className="text-red-400 mb-3" size={32} />
                                                <p className="text-sm text-slate-200 font-bold mb-1">¿Eliminar “{profile.name}”?</p>
                                                <p className="text-xs text-slate-500 mb-5">Esta acción no se puede deshacer. Exporta el JSON antes si quieres un respaldo.</p>
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => setConfirmDeleteId(null)}
                                                        className="px-4 py-2 rounded-lg border border-white/10 text-xs text-slate-300 hover:bg-white/5"
                                                    >
                                                        Cancelar
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(profile.id)}
                                                        disabled={deleting}
                                                        className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-500 disabled:opacity-50 flex items-center gap-2"
                                                    >
                                                        {deleting && <Loader2 size={12} className="animate-spin" />}
                                                        Sí, eliminar
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.article>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            {/* TIP */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10 text-xs text-slate-400">
                <FileText size={16} className="text-primary shrink-0 mt-0.5" />
                <p>
                    <strong className="text-slate-300">Tip:</strong> El botón <em>Exportar JSON</em> genera un archivo portable
                    con <strong className="text-slate-300">todas las imágenes incluidas</strong> (base64). Puedes importarlo en otra
                    cuenta o instancia con <em>Importar JSON</em> y todo se restaura automáticamente. Para el PDF, usa
                    <em> Exportar PDF</em> y en el diálogo de impresión elige “Guardar como PDF”.
                </p>
            </div>
        </div>
    );
}
