"use client";

import { useState, useEffect } from "react";
import { getClientProfileById } from "@/lib/api";
import { notFound } from "next/navigation";
import { cn } from "@/lib/utils";
import { ArrowLeft, Building2, GraduationCap, ShieldAlert, Smartphone, Briefcase, Link2, Users, Loader2, MapPin, Mail, Phone, Award, Scale, Fingerprint, ShieldCheck, Lightbulb, Laptop, Landmark, FileText, Banknote, Stamp, Settings, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Projects as LandingProjects } from "@/components/sections/projects";
import { Experience } from "@/components/sections/experience";
import { LandingStack } from "@/components/sections/landing-stack";
import { Footer as LandingFooter } from "@/components/layout/footer";
import { DesignShowcase } from "@/components/sections/DesignShowcase";
import { CursorVariant } from "@/components/effects/CursorFX";

const THEMES = {
    Tech: {
        page: "bg-[#0B0F15] text-slate-300 font-mono selection:bg-cyan-500/30 min-h-screen",
        container: "max-w-7xl mx-auto px-6",
        headerWrapper: "relative border-b border-cyan-500/10 py-20 overflow-hidden",
        headerTitle: "text-6xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-6",
        headerSubtitle: "text-xl md:text-2xl text-slate-400 font-light max-w-2xl leading-relaxed",
        headerBadge: "inline-block px-3 py-1 mb-6 text-xs font-bold tracking-[0.2em] text-cyan-400 border border-cyan-500/30 bg-cyan-950/20 rounded uppercase",
        card: "group relative bg-slate-900/50 border border-slate-800 p-8 hover:border-cyan-500/50 transition-all duration-300 hover:bg-slate-900/80",
        cardTitle: "text-2xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors",
        cardIcon: "text-cyan-500 mb-4",
        sectionHeading: "text-3xl font-bold text-white mb-12 flex items-center gap-4 before:h-1 before:w-12 before:bg-cyan-500",
        tag: "px-2 py-1 text-xs font-medium text-cyan-300 bg-cyan-950/30 border border-cyan-900/50 rounded",
        buttonPrimary: "bg-cyan-400 text-black px-8 py-4 rounded font-bold hover:bg-cyan-300 transition-colors shadow-[0_0_20px_rgba(34,211,238,0.3)]",
        terminal: true
    },
    Legal: {
        page: "bg-[#F5F2EA] text-slate-700 font-serif selection:bg-slate-200 min-h-screen",
        container: "max-w-6xl mx-auto px-8 bg-white shadow-[0_0_50px_rgba(0,0,0,0.05)] min-h-screen border-x border-slate-200 my-8",
        headerWrapper: "py-24 text-center border-b border-slate-100 relative bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed",
        headerTitle: "text-5xl md:text-7xl font-serif text-slate-900 tracking-tight mb-6 relative z-10",
        headerSubtitle: "text-xl text-slate-500 italic font-medium max-w-2xl mx-auto leading-relaxed relative z-10",
        headerBadge: "inline-block px-4 py-1.5 mb-8 text-xs font-bold tracking-[0.2em] text-slate-800 border-y-2 border-slate-800 uppercase bg-white relative z-10",
        card: "bg-white border border-slate-200 p-8 shadow-sm hover:shadow-xl transition-all duration-300 relative group overflow-hidden mb-8",
        cardTitle: "text-2xl font-serif text-slate-900 mb-2 group-hover:text-[#B8860B] transition-colors",
        cardIcon: "text-slate-900 mb-2 opacity-0",
        sectionHeading: "text-xl font-bold text-slate-900 mb-10 border-b-2 border-slate-900 pb-4 uppercase tracking-[0.2em] flex items-center gap-3",
        tag: "px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 rounded-sm hover:bg-slate-800 hover:text-white transition-colors",
        buttonPrimary: "bg-slate-900 text-white px-8 py-4 rounded-sm font-medium hover:bg-slate-800 transition-colors border border-slate-900",
        terminal: false
    }
};

const getCompetencyIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('corporativo') || t.includes('corporate') || t.includes('negocios')) return Building2;
    if (t.includes('litigio') || t.includes('litigation') || t.includes('resolución') || t.includes('disputa')) return Scale;
    if (t.includes('penal') || t.includes('criminal') || t.includes('delito')) return Fingerprint;
    if (t.includes('compliance') || t.includes('riesgo') || t.includes('risk') || t.includes('auditoría')) return ShieldCheck;
    if (t.includes('intelectual') || t.includes('intellectual') || t.includes('marca') || t.includes('patente')) return Lightbulb;
    if (t.includes('digital') || t.includes('tecnolog') || t.includes('cyber') || t.includes('ciber') || t.includes('data')) return Laptop;

    // New categories
    if (t.includes('administrativo') || t.includes('pública') || t.includes('publica') || t.includes('gobierno')) return Landmark;
    if (t.includes('consumidor') || t.includes('cliente') || t.includes('usuarios')) return ShoppingBag;
    if (t.includes('procesal') || t.includes('documental') || t.includes('expediente') || t.includes('tramite')) return FileText;
    if (t.includes('cobranza') || t.includes('recuperación') || t.includes('financiero') || t.includes('bancario') || t.includes('bank')) return Banknote;
    if (t.includes('notarial') || t.includes('registral') || t.includes('fe pública') || t.includes('escritura')) return Stamp;
    if (t.includes('operaciones') || t.includes('logística') || t.includes('gestión') || t.includes('management')) return Settings;
    if (t.includes('humanos') || t.includes('rrhh') || t.includes('personal') || t.includes('laboral')) return Users;

    return Award;
};

export default function ProfileClientView({ id }: { id: string }) {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProfile() {
            setLoading(true);
            const data = await getClientProfileById(id);
            setProfile(data);
            setLoading(false);
        }
        fetchProfile();
    }, [id]);

    if (loading) {
        return (
            <div className="bg-[#0B0F15] min-h-screen flex flex-col items-center justify-center text-cyan-500 font-mono">
                <Loader2 className="w-12 h-12 animate-spin mb-4 opacity-50" />
                <div className="text-xs uppercase tracking-[0.3em] animate-pulse">
                    Accessing_Secure_Node...
                </div>
            </div>
        );
    }

    if (!profile) return notFound();

    // Módulo CREATIVE DESIGN: vitrina propia + cursor de pincel mágico
    if (profile.industry === 'Design') {
        return (
            <>
                <CursorVariant variant="brush" />
                <DesignShowcase profile={profile} />
            </>
        );
    }

    const isTech = profile.industry === 'Tech';
    const theme = THEMES[profile.industry as keyof typeof THEMES] || THEMES.Tech;
    const expAttr = profile.attributes?.find((a: any) => a.label === 'EXPERIENCIA');
    const yearsOfExp = expAttr ? expAttr.value : null;

    // Legal specific attributes
    const ciclo = profile.attributes?.find((a: any) => a.label === 'CICLO')?.value;
    const merito = profile.attributes?.find((a: any) => a.label === 'MÉRITO')?.value;
    const disponibilidad = profile.attributes?.find((a: any) => a.label === 'DISPONIBILIDAD')?.value;

    // Legal specific experiences (Specializations)
    const legalSpecialties = profile.experiences?.filter((e: any) => e.type === 'Specialization');

    if (isTech) {
        const specialties = profile.experiences?.filter((e: any) => e.type === 'Specialization').map((e: any) => ({
            title: e.title,
            description: e.highlights?.[0]?.text || e.organization || ''
        }));

        const stack = profile.skillCategories?.map((sc: any) => ({
            category: sc.name,
            items: sc.items.map((i: any) => i.name)
        }));

        return (
            <div className="bg-[#0B0F15] min-h-screen text-slate-300">
                <CursorVariant variant="electric" />
                <Hero profile={profile} />
                <About specialties={specialties?.length > 0 ? specialties : undefined} />
                <LandingStack
                    stack={stack}
                    repos={profile.attributes?.find((a: any) => a.label === 'REPOS')?.value || '50+'}
                />
                <LandingProjects
                    projects={profile.projects}
                    yearsOfExperience={yearsOfExp}
                    education={profile.education}
                    certifications={profile.certifications}
                />
                <Experience experiences={profile.workExperiences} />

                <LandingFooter profile={profile} />
            </div>
        );
    }

    return (
        <div className={theme.page}>
            <CursorVariant variant="gavel" />
            <main className={theme.container}>
                <header className={theme.headerWrapper}>
                    <div className="relative py-12 text-center">
                        <span className={theme.headerBadge}>{profile.headline}</span>
                        <h1 className={theme.headerTitle}>{profile.name}</h1>
                        <p className={theme.headerSubtitle}>{profile.headline}</p>

                        <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-slate-500 font-medium">
                            {profile.location && (
                                <div className="flex items-center gap-2">
                                    <MapPin size={16} />
                                    <span>{profile.location}</span>
                                </div>
                            )}
                            {profile.email && (
                                <div className="flex items-center gap-2">
                                    <Mail size={16} />
                                    <span>{profile.email}</span>
                                </div>
                            )}
                            {profile.phone && (
                                <div className="flex items-center gap-2">
                                    <Phone size={16} />
                                    <span>{profile.phone}</span>
                                </div>
                            )}
                        </div>

                        {(ciclo || merito || disponibilidad) && (
                            <div className="flex flex-wrap justify-center gap-8_ mt-10 pt-8 border-t border-slate-200/60 max-w-3xl mx-auto gap-x-12">
                                {ciclo && (
                                    <div className="text-center group">
                                        <div className="text-3xl font-serif text-slate-900 mb-1 group-hover:scale-105 transition-transform">{ciclo}</div>
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ciclo</div>
                                    </div>
                                )}
                                {merito && (
                                    <div className="text-center group">
                                        <div className="text-3xl font-serif text-slate-900 mb-1 group-hover:scale-105 transition-transform">{merito}</div>
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Orden de Mérito</div>
                                    </div>
                                )}
                                {disponibilidad && (
                                    <div className="text-center group">
                                        <div className="text-3xl font-serif text-slate-900 mb-1 group-hover:scale-105 transition-transform">{disponibilidad}</div>
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Disponibilidad</div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </header>

                <div className="px-8 py-16">
                    <section className="mb-24">
                        <h2 className={theme.sectionHeading}>Professional Summary</h2>
                        <p className="text-lg leading-relaxed text-slate-600 font-serif italic max-w-3xl mx-auto text-center">
                            &quot;{profile.bio}&quot;
                        </p>
                    </section>

                    {legalSpecialties?.length > 0 && (
                        <section className="mb-20">
                            <h2 className={theme.sectionHeading}>Competencias</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                {legalSpecialties.map((spec: any) => {
                                    const Icon = getCompetencyIcon(spec.title);
                                    return (
                                        <div key={spec.id} className="group bg-white p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all hover:border-slate-300">
                                            <div className="flex items-start gap-4">
                                                <div className="mt-1 p-2 bg-slate-50 rounded text-slate-700 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                                                    <Icon size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="font-serif font-bold text-slate-900 mb-2 text-lg">{spec.title}</h3>
                                                    <p className="text-sm text-slate-500 leading-relaxed">{spec.highlights?.[0]?.text}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    <div className="grid lg:grid-cols-12 gap-16">
                        <div className="lg:col-span-8">
                            <h2 className={theme.sectionHeading}>Experiencia & Casos</h2>
                            <div className="space-y-8">
                                {profile.projects?.map((project: any, index: number) => (
                                    <div key={project.id} className={theme.card}>
                                        <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl text-slate-300 pointer-events-none select-none">
                                            {index + 1 < 10 ? `0${index + 1}` : index + 1}
                                        </div>
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className="bg-slate-900 text-white text-[10px] uppercase font-bold px-2 py-1 tracking-widest">
                                                    {project.type || "Case File"}
                                                </span>
                                                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                                                    {project.client}
                                                </span>
                                            </div>

                                            <h3 className={theme.cardTitle}>{project.title}</h3>

                                            <div className="grid md:grid-cols-2 gap-6 my-6 text-sm text-slate-600 bg-slate-50 p-4 border border-slate-100 italic">
                                                <div>
                                                    <strong className="block text-xs font-sans not-italic font-bold text-slate-400 uppercase mb-1">Challenge / Context</strong>
                                                    {project.description}
                                                </div>
                                                {project.solution && (
                                                    <div>
                                                        <strong className="block text-xs font-sans not-italic font-bold text-slate-400 uppercase mb-1">Strategy / Resolution</strong>
                                                        {project.solution}
                                                        {project.outcome && (
                                                            <div className="mt-2 text-slate-900 font-bold not-italic">
                                                                Result: {project.outcome}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                                                {project.tags?.map((t: any) => (
                                                    <span key={t.id} className={theme.tag}>{t.name}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* LEGAL WORK EXPERIENCE */}
                            {profile.workExperiences && profile.workExperiences.length > 0 && (
                                <div className="mt-24 pt-12 border-t border-slate-200">
                                    <h2 className={theme.sectionHeading}>Trayectoria Profesional</h2>
                                    <div className="space-y-12 border-l-2 border-slate-200 ml-3 pl-8 relative py-2">
                                        {profile.workExperiences.map((work: any, i: number) => (
                                            <div key={i} className="relative group">
                                                {/* Timeline Node */}
                                                <div className="absolute -left-[43px] top-1.5 w-6 h-6 rounded-full bg-white border-4 border-slate-300 group-hover:border-[#B8860B] transition-colors shadow-sm" />

                                                <div className="mb-6">
                                                    <div className="flex flex-wrap justify-between items-baseline gap-4 mb-2">
                                                        <h3 className="text-xl font-serif font-bold text-slate-900 group-hover:text-[#B8860B] transition-colors">{work.role}</h3>
                                                        <span className="text-xs font-bold font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100 uppercase tracking-wider">{work.period}</span>
                                                    </div>
                                                    <div className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                                                        <Building2 size={14} />
                                                        {work.company}
                                                    </div>

                                                    <div className="prose prose-sm text-slate-600 font-serif leading-relaxed mb-6 max-w-none">
                                                        {work.responsibilities && <p className="mb-4">{work.responsibilities}</p>}
                                                        {work.achievements && (
                                                            <div className="bg-amber-50/50 p-5 border-l-2 border-[#B8860B]/50 italic text-slate-800 rounded-r-lg">
                                                                <strong className="text-[#B8860B] not-italic text-xs uppercase tracking-wider block mb-1">Key Achievement</strong>
                                                                {work.achievements}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Evidence Images */}
                                                    {work.images && work.images.length > 0 && (
                                                        <div className="flex gap-3 overflow-x-auto pb-2">
                                                            {work.images.map((img: any, idx: number) => (
                                                                <a key={idx} href={img.url} target="_blank" className="shrink-0 w-24 h-24 border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-all grayscale hover:grayscale-0 relative group/img">
                                                                    <img src={img.url} alt="Work Evidence" className="w-full h-full object-cover" />
                                                                    <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors" />
                                                                </a>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="lg:col-span-4 space-y-12">
                        <section>
                            <h2 className={theme.sectionHeading}>Area of Expertise</h2>
                            <div className="space-y-8">
                                {profile.skillCategories?.map((cat: any) => (
                                    <div key={cat.id}>
                                        <h4 className="text-xs font-bold uppercase tracking-widest mb-4 opacity-50 border-b border-slate-200 pb-2">{cat.name}</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {cat.items.map((item: any) => (
                                                <span key={item.id} className="inline-flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 text-sm text-slate-700 hover:bg-slate-900 hover:text-white transition-all cursor-default shadow-sm hover:shadow-md">
                                                    <Building2 size={12} className="opacity-50" />
                                                    {item.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h2 className={theme.sectionHeading}>Academic Credentials</h2>
                            <div className="space-y-4">
                                {profile.education?.map((edu: any, i: number) => (
                                    <div key={i} className="group bg-white p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-2 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                                            <GraduationCap size={64} />
                                        </div>
                                        <div className="relative z-10 flex gap-4">
                                            <div className="mt-1 shrink-0 p-2 bg-slate-50 rounded-full h-fit group-hover:bg-slate-900 group-hover:text-white transition-colors border border-slate-100">
                                                <GraduationCap size={18} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 text-sm leading-tight">{edu.institution}</h4>
                                                <p className="text-xs font-serif italic text-slate-600 my-2 pt-1 border-t border-slate-100">{edu.degree}</p>
                                                <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-sm border border-slate-100 tracking-wider">{edu.period}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {(profile.certifications?.length ?? 0) > 0 && (
                            <section>
                                <h2 className={theme.sectionHeading}>Certified Authority</h2>
                                <div className="bg-slate-50 p-6 border border-slate-200 relative">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-200 via-slate-400 to-slate-200" />
                                    <div className="space-y-4">
                                        {profile.certifications.map((cert: any) => (
                                            <div key={cert.id} className="flex items-start gap-4 p-3 hover:bg-white transition-colors rounded-lg border border-transparent hover:border-slate-100 group">
                                                <div className="shrink-0 mt-0.5">
                                                    <Award size={18} className="text-slate-400 group-hover:text-amber-600 transition-colors" />
                                                </div>
                                                <div className="w-full">
                                                    <div className="flex justify-between items-start gap-2">
                                                        <div className="font-bold text-sm text-slate-800 leading-tight group-hover:text-amber-900 transition-colors">
                                                            {cert.title}
                                                            {cert.url && (
                                                                <a href={cert.url} target="_blank" className="ml-2 inline-flex align-middle text-slate-400 hover:text-cyan-600">
                                                                    <Link2 size={12} />
                                                                </a>
                                                            )}
                                                        </div>
                                                        <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">{cert.date}</span>
                                                    </div>
                                                    <div className="text-xs text-slate-500 mt-1 uppercase tracking-wide">{cert.provider}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        )}
                        </div>
                    </div>
                </div>
            </main>
            <footer className="py-16 border-t border-slate-100 bg-slate-50 text-center">
                <div className="text-sm text-slate-400 uppercase tracking-widest font-bold mb-4">© {new Date().getFullYear()} {profile.name}</div>
                <div className="flex justify-center gap-6">
                    {profile.socials?.map((social: any) => (
                        <a key={social.id} href={social.url} className="text-slate-400 hover:text-slate-900 transition-colors">
                            {social.platform}
                        </a>
                    ))}
                </div>
            </footer>
        </div>
    );
}
