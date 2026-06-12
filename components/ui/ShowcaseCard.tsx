"use client";

import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { LucideIcon, Github, Linkedin, Mail, Youtube, FileText, CheckCircle2, Video, Download, Loader2, FileDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { EditProfileModal } from "@/components/EditProfileModal";
import { useToast } from "@/components/ui/toast";

// --- Types (Matched to Prisma Schema roughly) ---
interface Attribute {
    label: string;
    value: string;
}

interface ShowcaseProfile {
    id: string;
    userId: string;
    slug?: string;
    industry: string;
    name: string;
    headline: string;
    bio: string;
    location: string;
    attributes: Attribute[];
    socials?: { platform: string; url: string; iconName: string }[];
    workExperiences?: any[];
    education?: any[];
    certifications?: any[];
    projects?: any[];
    skillCategories?: any[];
    experiences?: any[];
}

// --- Variants ---
const VARIANTS = {
    Tech: {
        container: "bg-slate-950 border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.1)] font-mono text-slate-300",
        name: "text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 font-bold tracking-tighter",
        badge: "border-cyan-500/50 text-cyan-400 bg-cyan-950/30",
        icon: "text-cyan-400 hover:text-cyan-200 transition-colors",
        metricValue: "text-cyan-300 font-bold",
        button: "border-cyan-500/20 text-cyan-400 hover:border-cyan-500 hover:bg-cyan-950/30",
        decoration: (
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[50px] pointer-events-none" />
        )
    },
    Legal: {
        container: "bg-white border-slate-200 shadow-xl font-sans text-slate-600",
        name: "text-slate-900 font-serif tracking-tight",
        badge: "border-slate-300 text-slate-700 bg-slate-50 font-medium",
        icon: "text-slate-600 hover:text-slate-900 transition-colors",
        metricValue: "text-slate-900 font-semibold italic",
        button: "border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900",
        decoration: (
            <div className="absolute inset-0 border-[3px] border-double border-slate-100 pointer-events-none m-2" />
        )
    },
    Design: {
        container: "bg-[#120a18] border-fuchsia-500/30 shadow-[0_0_30px_rgba(217,70,239,0.12)] font-sans text-slate-300",
        name: "text-gradient-creative font-black tracking-tighter",
        badge: "border-fuchsia-500/50 text-fuchsia-300 bg-fuchsia-950/30",
        icon: "text-fuchsia-400 hover:text-fuchsia-200 transition-colors",
        metricValue: "text-fuchsia-300 font-bold",
        button: "border-fuchsia-500/20 text-fuchsia-300 hover:border-fuchsia-500 hover:bg-fuchsia-950/30",
        decoration: (
            <>
                <div className="absolute top-0 right-0 w-40 h-40 bg-fuchsia-500/10 blur-[60px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/10 blur-[50px] pointer-events-none" />
            </>
        )
    }
};

const SocialIcon = ({ name, url, className }: { name: string, url: string, className?: string }) => {
    const Icons: Record<string, LucideIcon> = {
        LinkedIn: Linkedin,
        GitHub: Github,
        Mail: Mail,
        Youtube: Youtube,
        TikTok: Video,
    };

    const Icon = Icons[name] || FileText;

    return (
        <a href={url} target="_blank" rel="noopener noreferrer" className={className}>
            <Icon size={20} />
        </a>
    );
}

export const ShowcaseCard = ({ profile, onProfileUpdate }: { profile: ShowcaseProfile, onProfileUpdate?: () => void }) => {
    const { data: session } = useSession();
    const { showToast } = useToast();
    const [exporting, setExporting] = useState(false);
    const flavor = VARIANTS[profile.industry as keyof typeof VARIANTS] || VARIANTS.Tech;
    const isOwner = session?.user?.id === profile.userId;

    /**
     * Exporta el CV como JSON portable INCLUYENDO las imágenes (base64)
     * usando el endpoint del servidor. Listo para importar en otra cuenta/instancia.
     */
    const handleExportJson = async () => {
        setExporting(true);
        try {
            const res = await fetch(`/api/profiles/${profile.id}/export`);
            if (!res.ok) throw new Error(`Export failed: ${res.status}`);
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${profile.slug || "profile"}-procard.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            showToast("CV exportado con imágenes incluidas ✓", "success");
        } catch (e) {
            console.error(e);
            showToast("No se pudo exportar el CV.", "error");
        } finally {
            setExporting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -3 }}
            className={cn(
                "relative w-full max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl border overflow-hidden transition-shadow",
                flavor.container
            )}
        >
            {flavor.decoration}

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                {/* Left Column: Identity */}
                <div className="col-span-1 md:col-span-2 space-y-6">
                    <div>
                        <div className={cn("inline-flex items-center px-3 py-1 rounded-full text-xs uppercase tracking-widest mb-4 border", flavor.badge)}>
                            {profile.industry} PROFESIONAL
                        </div>
                        <h1 className={cn("text-3xl sm:text-4xl md:text-5xl mb-2 tracking-tighter break-words", flavor.name)}>
                            {profile.name}
                        </h1>
                        <p className="text-base sm:text-lg opacity-80">{profile.headline}</p>
                    </div>

                    <div className={cn(
                        "prose prose-sm max-w-none text-inherit opacity-70",
                        { Tech: 'font-mono', Legal: 'font-serif italic', Design: 'font-sans' }[profile.industry] || 'font-sans'
                    )}>
                        <p>{profile.bio}</p>
                    </div>

                    {/* Attributes Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 pt-4 border-t border-current/10">
                        {profile.attributes.map((attr, idx) => (
                            <div key={idx} className="space-y-1">
                                <span className="text-[10px] uppercase opacity-40 block tracking-widest">{attr.label}</span>
                                <span className={cn("text-base sm:text-lg", flavor.metricValue)}>{attr.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Actions / Stats / Contact */}
                <div className="flex flex-col justify-between border-t md:border-t-0 md:border-l border-current/10 pt-6 md:pt-0 md:pl-8 space-y-6 md:space-y-8">
                    <div className="space-y-2">
                        <span className="text-[10px] uppercase opacity-40 tracking-widest">Ubicación</span>
                        <div className="font-medium text-sm">{profile.location}</div>
                    </div>

                    <div className="space-y-4">
                        <span className="text-[10px] uppercase opacity-40 tracking-widest">Estado de Verificación</span>
                        <div className="flex items-center gap-2 text-xs">
                            <CheckCircle2 size={14} className="text-green-500" />
                            <span className="text-green-500/80 font-mono">VALIDADO</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <span className="text-[10px] uppercase opacity-40 tracking-widest">Conectar</span>
                        <div className="flex gap-4">
                            {profile.socials?.map((social, idx) => (
                                <SocialIcon
                                    key={idx}
                                    name={social.platform}
                                    url={social.url}
                                    className={flavor.icon}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="mt-auto pt-6 md:pt-8 flex flex-col gap-3">
                        {isOwner && (
                            <>
                                <EditProfileModal profile={profile} onSuccess={onProfileUpdate} />
                                <button
                                    onClick={handleExportJson}
                                    disabled={exporting}
                                    className={cn(
                                        "w-full py-2.5 px-4 rounded-lg text-sm font-medium text-center transition-all border flex items-center justify-center gap-2 disabled:opacity-50",
                                        flavor.button
                                    )}
                                    title="Exportar CV como JSON (incluye imágenes)"
                                >
                                    {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                                    {exporting ? "Exportando..." : "Exportar JSON"}
                                </button>
                            </>
                        )}

                        <a href={`/showcase/${profile.slug || profile.id}`} className={cn(
                            "w-full py-2.5 px-4 rounded-lg text-sm font-medium text-center transition-all border flex items-center justify-center",
                            flavor.button
                        )}>
                            Ver Perfil
                        </a>
                        <a
                            href={`/cv/${profile.slug || profile.id}`}
                            target="_blank"
                            className={cn(
                                "w-full py-2.5 px-4 rounded-lg text-sm font-medium text-center transition-all border flex items-center justify-center gap-2",
                                flavor.button
                            )}
                            title="Exportar Currículum como PDF (A4 con portafolio)"
                        >
                            <FileDown size={16} />
                            <span>Exportar PDF</span>
                        </a>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
