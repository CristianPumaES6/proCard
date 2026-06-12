"use client";

/**
 * Vitrina del módulo CREATIVE DESIGN.
 * Estética: aurora mesh + gradientes animados + galería de portafolio visual.
 */

import { motion } from "framer-motion";
import {
    MapPin, Mail, Phone, Sparkles, Palette, ExternalLink,
    GraduationCap, Award, Briefcase, Brush, Link2
} from "lucide-react";

const fadeUp = {
    initial: { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: 0.55 },
};

export function DesignShowcase({ profile }: { profile: any }) {
    const specialties = profile.experiences?.filter((e: any) => e.type === "Specialization") || [];
    const projects = profile.projects || [];
    const skillCategories = profile.skillCategories || [];
    const education = profile.education || [];
    const certifications = profile.certifications || [];
    const workExperiences = profile.workExperiences || [];

    return (
        <div className="min-h-screen bg-aurora-mesh text-slate-200 selection:bg-fuchsia-500/30 -mx-4 sm:-mx-6 lg:-mx-8 -my-8">

            {/* ============ HERO ============ */}
            <header className="relative overflow-hidden">
                <div className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center relative z-10">
                    <motion.div {...fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/30 text-fuchsia-300 text-[11px] font-mono uppercase tracking-[0.25em] mb-8">
                        <Brush size={12} className="animate-pulse" />
                        Creative Portfolio
                    </motion.div>

                    <motion.h1
                        {...fadeUp}
                        className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter mb-6 text-gradient-creative leading-[0.95]"
                    >
                        {profile.name}
                    </motion.h1>

                    <motion.p {...fadeUp} className="text-lg sm:text-2xl text-slate-300/90 font-light max-w-2xl mx-auto mb-8">
                        {profile.headline}
                    </motion.p>

                    {profile.bio && (
                        <motion.p {...fadeUp} className="text-sm sm:text-base text-slate-400 max-w-3xl mx-auto leading-relaxed mb-10 italic">
                            “{profile.bio}”
                        </motion.p>
                    )}

                    {/* Contacto */}
                    <motion.div {...fadeUp} className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-slate-400 mb-12">
                        {profile.location && <span className="flex items-center gap-2"><MapPin size={15} className="text-fuchsia-400" />{profile.location}</span>}
                        {profile.email && <span className="flex items-center gap-2"><Mail size={15} className="text-fuchsia-400" />{profile.email}</span>}
                        {profile.phone && <span className="flex items-center gap-2"><Phone size={15} className="text-fuchsia-400" />{profile.phone}</span>}
                    </motion.div>

                    {/* Stats */}
                    {profile.attributes?.length > 0 && (
                        <motion.div {...fadeUp} className="flex flex-wrap justify-center gap-4 sm:gap-6">
                            {profile.attributes.map((attr: any, i: number) => (
                                <div key={i} className="px-6 py-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md hover:border-fuchsia-500/40 hover:bg-white/[0.07] transition-all group min-w-[120px]">
                                    <div className="text-2xl sm:text-3xl font-black text-gradient-creative group-hover:scale-105 transition-transform">{attr.value}</div>
                                    <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 mt-1">{attr.label}</div>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 pb-24 space-y-28">

                {/* ============ ESPECIALIDADES ============ */}
                {specialties.length > 0 && (
                    <section>
                        <motion.h2 {...fadeUp} className="text-2xl sm:text-3xl font-bold mb-10 flex items-center gap-3">
                            <Sparkles className="text-fuchsia-400" />
                            <span className="text-gradient-creative">Superpoderes Creativos</span>
                        </motion.h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {specialties.map((spec: any, i: number) => (
                                <motion.div
                                    key={spec.id || i}
                                    {...fadeUp}
                                    transition={{ duration: 0.5, delay: i * 0.08 }}
                                    whileHover={{ y: -6, rotate: i % 2 === 0 ? -0.6 : 0.6 }}
                                    className="p-6 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-fuchsia-500/50 backdrop-blur-md transition-colors group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500/30 to-purple-500/20 border border-fuchsia-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Palette size={18} className="text-fuchsia-300" />
                                    </div>
                                    <h3 className="font-bold text-white mb-2">{spec.title}</h3>
                                    <p className="text-sm text-slate-400 leading-relaxed">{spec.highlights?.[0]?.text}</p>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ============ PORTAFOLIO (galería visual) ============ */}
                {projects.length > 0 && (
                    <section>
                        <motion.h2 {...fadeUp} className="text-2xl sm:text-3xl font-bold mb-10 flex items-center gap-3">
                            <Brush className="text-fuchsia-400" />
                            <span className="text-gradient-creative">Portafolio</span>
                        </motion.h2>

                        <div className="grid sm:grid-cols-2 gap-6">
                            {projects.map((project: any, i: number) => {
                                const cover = project.imageUrl || project.images?.[0]?.url;
                                const wide = i % 3 === 0; // ritmo visual tipo masonry
                                return (
                                    <motion.article
                                        key={project.id || i}
                                        {...fadeUp}
                                        transition={{ duration: 0.5, delay: (i % 4) * 0.07 }}
                                        className={`group relative rounded-3xl overflow-hidden border border-white/10 bg-white/[0.03] backdrop-blur-md hover:border-fuchsia-500/50 transition-all ${wide ? "sm:col-span-2" : ""}`}
                                    >
                                        {cover && (
                                            <div className={`relative overflow-hidden ${wide ? "aspect-[21/9]" : "aspect-[4/3]"}`}>
                                                <img
                                                    src={cover}
                                                    alt={project.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0612] via-transparent to-transparent opacity-90" />
                                            </div>
                                        )}

                                        <div className={`p-6 ${cover ? "-mt-14 relative z-10" : ""}`}>
                                            <div className="flex items-center gap-3 mb-3 flex-wrap">
                                                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-300">
                                                    {project.type || "Proyecto"}
                                                </span>
                                                {project.client && <span className="text-xs text-slate-500">{project.client}</span>}
                                            </div>

                                            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-fuchsia-300 transition-colors flex items-center gap-2">
                                                {project.title}
                                                {project.url && (
                                                    <a href={project.url} target="_blank" rel="noreferrer" className="opacity-50 hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                                                        <ExternalLink size={16} />
                                                    </a>
                                                )}
                                            </h3>

                                            {project.description && (
                                                <p className="text-sm text-slate-400 leading-relaxed mb-4 line-clamp-3">{project.description}</p>
                                            )}

                                            {/* Galería secundaria */}
                                            {project.images?.length > 1 && (
                                                <div className="flex gap-2 mb-4 overflow-x-auto custom-scrollbar pb-1">
                                                    {project.images.slice(0, 6).map((img: any, k: number) => (
                                                        <a key={k} href={img.url} target="_blank" rel="noreferrer" className="shrink-0 w-16 h-16 rounded-xl overflow-hidden border border-white/10 hover:border-fuchsia-400 transition-colors">
                                                            <img src={img.url} alt={`${project.title} ${k + 1}`} className="w-full h-full object-cover" />
                                                        </a>
                                                    ))}
                                                </div>
                                            )}

                                            {project.tags?.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {project.tags.map((t: any, k: number) => (
                                                        <span key={k} className="px-2 py-0.5 text-[10px] font-mono rounded bg-white/5 border border-white/10 text-slate-400">
                                                            #{t.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </motion.article>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* ============ HERRAMIENTAS / SKILLS ============ */}
                {skillCategories.length > 0 && (
                    <section>
                        <motion.h2 {...fadeUp} className="text-2xl sm:text-3xl font-bold mb-10 flex items-center gap-3">
                            <Palette className="text-fuchsia-400" />
                            <span className="text-gradient-creative">Caja de Herramientas</span>
                        </motion.h2>
                        <div className="grid sm:grid-cols-2 gap-8">
                            {skillCategories.map((cat: any, i: number) => (
                                <motion.div key={cat.id || i} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.06 }}>
                                    <h4 className="text-xs font-mono uppercase tracking-[0.25em] text-slate-500 mb-4 border-b border-white/10 pb-2">{cat.name}</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {cat.items?.map((item: any, k: number) => (
                                            <span
                                                key={k}
                                                className="px-3 py-1.5 rounded-full text-sm bg-white/[0.04] border border-white/10 text-slate-300 hover:border-fuchsia-400/60 hover:text-fuchsia-200 hover:-translate-y-0.5 transition-all cursor-default"
                                            >
                                                {item.name}
                                            </span>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ============ TRAYECTORIA ============ */}
                {workExperiences.length > 0 && (
                    <section>
                        <motion.h2 {...fadeUp} className="text-2xl sm:text-3xl font-bold mb-10 flex items-center gap-3">
                            <Briefcase className="text-fuchsia-400" />
                            <span className="text-gradient-creative">Trayectoria</span>
                        </motion.h2>
                        <div className="space-y-8 border-l-2 border-fuchsia-500/20 ml-2 pl-6 sm:pl-8">
                            {workExperiences.map((work: any, i: number) => (
                                <motion.div key={i} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.05 }} className="relative group">
                                    <div className="absolute -left-[31px] sm:-left-[39px] top-1 w-4 h-4 rounded-full bg-[#0c0612] border-2 border-fuchsia-500/50 group-hover:border-fuchsia-400 group-hover:scale-125 transition-all" />
                                    <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                                        <h3 className="text-lg font-bold text-white group-hover:text-fuchsia-300 transition-colors">{work.role}</h3>
                                        <span className="text-[11px] font-mono text-slate-500 bg-white/5 px-2 py-0.5 rounded border border-white/10">{work.period}</span>
                                    </div>
                                    <div className="text-sm text-fuchsia-300/70 mb-3">{work.company}</div>
                                    {work.responsibilities && <p className="text-sm text-slate-400 leading-relaxed mb-3">{work.responsibilities}</p>}
                                    {work.achievements && (
                                        <div className="text-sm text-slate-300 bg-fuchsia-500/5 border-l-2 border-fuchsia-500/40 rounded-r-lg p-4 italic">
                                            {work.achievements}
                                        </div>
                                    )}
                                    {work.images?.length > 0 && (
                                        <div className="flex gap-2 mt-4 overflow-x-auto custom-scrollbar pb-1">
                                            {work.images.map((img: any, k: number) => (
                                                <a key={k} href={img.url} target="_blank" rel="noreferrer" className="shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-white/10 hover:border-fuchsia-400 transition-colors">
                                                    <img src={img.url} alt="Evidencia" className="w-full h-full object-cover" />
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ============ FORMACIÓN + CERTIFICACIONES ============ */}
                {(education.length > 0 || certifications.length > 0) && (
                    <section className="grid md:grid-cols-2 gap-12">
                        {education.length > 0 && (
                            <div>
                                <motion.h2 {...fadeUp} className="text-xl sm:text-2xl font-bold mb-8 flex items-center gap-3">
                                    <GraduationCap className="text-fuchsia-400" />
                                    <span className="text-gradient-creative">Formación</span>
                                </motion.h2>
                                <div className="space-y-4">
                                    {education.map((edu: any, i: number) => (
                                        <motion.div key={i} {...fadeUp} transition={{ duration: 0.4, delay: i * 0.05 }} className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-fuchsia-500/40 transition-colors">
                                            <h4 className="font-bold text-white text-sm">{edu.institution}</h4>
                                            <p className="text-sm text-slate-400 mt-1">{edu.degree}</p>
                                            <span className="inline-block mt-2 text-[10px] font-mono uppercase tracking-widest text-slate-500 bg-white/5 px-2 py-0.5 rounded">{edu.period}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {certifications.length > 0 && (
                            <div>
                                <motion.h2 {...fadeUp} className="text-xl sm:text-2xl font-bold mb-8 flex items-center gap-3">
                                    <Award className="text-fuchsia-400" />
                                    <span className="text-gradient-creative">Certificaciones</span>
                                </motion.h2>
                                <div className="space-y-3">
                                    {certifications.map((cert: any, i: number) => (
                                        <motion.div key={i} {...fadeUp} transition={{ duration: 0.4, delay: i * 0.04 }} className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-fuchsia-500/40 transition-colors group">
                                            <Award size={16} className="text-fuchsia-400 mt-0.5 shrink-0" />
                                            <div className="min-w-0">
                                                <div className="font-semibold text-sm text-white flex items-center gap-2">
                                                    <span className="truncate">{cert.title}</span>
                                                    {cert.url && (
                                                        <a href={cert.url} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-fuchsia-300 shrink-0">
                                                            <Link2 size={12} />
                                                        </a>
                                                    )}
                                                </div>
                                                <div className="text-xs text-slate-500 mt-0.5">{cert.provider} • {cert.date}</div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>
                )}
            </main>

            {/* ============ FOOTER ============ */}
            <footer className="border-t border-white/10 py-14 text-center">
                <div className="text-gradient-creative font-black text-xl mb-4">{profile.name}</div>
                <div className="flex justify-center gap-6 mb-6">
                    {profile.socials?.map((social: any, i: number) => (
                        <a key={i} href={social.url} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-fuchsia-300 transition-colors text-sm">
                            {social.platform}
                        </a>
                    ))}
                </div>
                <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-600">Diseñado con ProCard ✦ Creative Module</p>
            </footer>
        </div>
    );
}
