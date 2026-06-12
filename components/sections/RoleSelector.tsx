"use client";

import { motion } from "framer-motion";
import { Cpu, Scale, Palette, ArrowRight, Zap, Gavel, Brush } from "lucide-react";

interface RoleCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    fxIcon: React.ReactNode;
    variant: "tech" | "legal" | "design";
    href: string;
    index: number;
}

const VARIANT_STYLES = {
    tech: {
        border: "neon-border-tech",
        glow: "text-glow-tech",
        iconColor: "text-cyan-400",
        accent: "from-cyan-500/20 via-cyan-500/5 to-transparent",
        chip: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
        bar: "bg-cyan-400",
    },
    legal: {
        border: "neon-border-legal",
        glow: "text-glow-legal",
        iconColor: "text-amber-400",
        accent: "from-amber-500/20 via-amber-500/5 to-transparent",
        chip: "bg-amber-500/10 border-amber-500/30 text-amber-400",
        bar: "bg-amber-400",
    },
    design: {
        border: "neon-border-design",
        glow: "text-glow-design",
        iconColor: "text-fuchsia-400",
        accent: "from-fuchsia-500/20 via-purple-500/5 to-transparent",
        chip: "bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-400",
        bar: "bg-gradient-to-r from-fuchsia-400 via-purple-400 to-cyan-400",
    },
} as const;

function RoleCard({ title, description, icon, fxIcon, variant, href, index }: RoleCardProps) {
    const s = VARIANT_STYLES[variant];
    const hoverTilt = [-0.4, 0, 0.4][index] ?? 0;

    return (
        <motion.a
            href={href}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: index * 0.12 }}
            whileHover={{ scale: 1.03, rotate: hoverTilt }}
            whileTap={{ scale: 0.97 }}
            className={`relative w-full text-left p-6 sm:p-8 rounded-2xl glass-card border-2 ${s.border} group overflow-hidden block cursor-pointer`}
        >
            {/* Glow de fondo por variante */}
            <div className={`absolute -top-16 -right-16 w-56 h-56 rounded-full bg-gradient-to-bl ${s.accent} blur-2xl opacity-60 group-hover:opacity-100 group-hover:scale-125 transition-all duration-700 pointer-events-none`} />

            {/* Icono gigante decorativo */}
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-25 group-hover:rotate-12 transition-all duration-500">
                {icon}
            </div>

            <div className="relative z-10">
                <div className={`mb-4 inline-flex items-center justify-center p-3 rounded-lg bg-white/5 border border-white/10 ${s.iconColor} group-hover:scale-110 group-hover:bg-white/10 transition-all duration-300`}>
                    {icon}
                </div>

                <h3 className={`text-xl sm:text-2xl font-bold mb-2 group-hover:translate-x-1 transition-transform duration-300 ${s.glow}`}>
                    {title}
                </h3>

                <p className="text-muted-foreground mb-6 text-sm sm:text-base leading-relaxed line-clamp-3">
                    {description}
                </p>

                <div className="flex items-center justify-between">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-mono uppercase tracking-widest ${s.chip}`}>
                        {fxIcon}
                        <span>Módulo Activo</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-mono uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white">
                        Entrar <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
            </div>

            {/* Barra de acento inferior animada */}
            <div className={`absolute bottom-0 left-0 h-[3px] w-0 group-hover:w-full transition-all duration-500 ${s.bar}`} />

            {/* Scanline interactivo en hover */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent h-1 opacity-0 group-hover:animate-scanline group-hover:opacity-100 pointer-events-none" />
        </motion.a>
    );
}

export function RoleSelector() {
    return (
        <section id="soluciones" className="container mx-auto px-4 py-16 sm:py-24">
            <div className="text-center mb-12 sm:mb-16">
                <motion.h2
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 tracking-tight"
                >
                    UN CV PARA CADA PROFESIÓN
                </motion.h2>
                <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base mb-6">
                    Elige tu módulo: cada industria tiene su propia vitrina interactiva,
                    su estética y sus efectos. Crea múltiples currículums y especialízate.
                </p>
                <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                <RoleCard
                    index={0}
                    variant="tech"
                    href="/showcase?industry=Tech"
                    icon={<Cpu size={32} />}
                    fxIcon={<Zap size={11} />}
                    title="Tecnología"
                    description="Vitrinas estilo terminal con efecto de electricidad. Stack, repos, arquitectura y proyectos que validan tu autoridad técnica."
                />
                <RoleCard
                    index={1}
                    variant="legal"
                    href="/showcase?industry=Legal"
                    icon={<Scale size={32} />}
                    fxIcon={<Gavel size={11} />}
                    title="Legal"
                    description="Elegancia editorial con el golpe del martillo legal. Casos, competencias jurídicas y credenciales académicas con autoridad."
                />
                <RoleCard
                    index={2}
                    variant="design"
                    href="/showcase?industry=Design"
                    icon={<Palette size={32} />}
                    fxIcon={<Brush size={11} />}
                    title="Creative Design"
                    description="Portafolios vivos con pincel mágico. Branding, UI/UX, ilustración y motion: tu trabajo visual en una galería interactiva."
                />
            </div>
        </section>
    );
}
