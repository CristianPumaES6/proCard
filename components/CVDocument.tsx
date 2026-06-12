import React from 'react';
import {
    MapPin,
    Mail,
    Phone,
    Globe,
    Briefcase,
    Star,
    Award,
    Github,
    Linkedin,
    Images,
    Building2
} from 'lucide-react';
import {
    SiPython, SiJavascript, SiTypescript, SiReact, SiNodedotjs, SiHtml5, SiCss3,
    SiGit, SiDocker, SiMysql, SiPostgresql, SiMongodb, SiPhp,
    SiAngular, SiVuedotjs, SiNextdotjs, SiTailwindcss, SiBootstrap, SiLaravel, SiSpring,
    SiDotnet, SiAmazon, SiGooglecloud, SiLinux, SiFigma, SiAdobephotoshop, SiAdobeillustrator,
    SiAdobeaftereffects, SiBlender, SiSketch, SiWebflow
} from "react-icons/si";
import { FaJava } from "react-icons/fa";
import { VscAzure } from "react-icons/vsc";

// Helper to get icon
const getTechIcon = (name: string) => {
    if (!name) return null;
    const n = name.toLowerCase().replace(/\s+/g, '');
    if (n.includes('python')) return SiPython;
    if (n.includes('java') && !n.includes('script')) return FaJava;
    if (n.includes('typescript') || n === 'ts') return SiTypescript;
    if (n.includes('js') || n.includes('javascript')) return SiJavascript;
    if (n.includes('react')) return SiReact;
    if (n.includes('node')) return SiNodedotjs;
    if (n.includes('html')) return SiHtml5;
    if (n.includes('css')) return SiCss3;
    if (n.includes('git')) return SiGit;
    if (n.includes('docker')) return SiDocker;
    if (n.includes('mysql') || n.includes('sql')) return SiMysql;
    if (n.includes('postgres')) return SiPostgresql;
    if (n.includes('mongo')) return SiMongodb;
    if (n.includes('php')) return SiPhp;
    if (n.includes('c#') || n.includes('csharp') || n.includes('.net')) return SiDotnet;
    if (n.includes('angular')) return SiAngular;
    if (n.includes('vue')) return SiVuedotjs;
    if (n.includes('next')) return SiNextdotjs;
    if (n.includes('tailwind')) return SiTailwindcss;
    if (n.includes('bootstrap')) return SiBootstrap;
    if (n.includes('laravel')) return SiLaravel;
    if (n.includes('spring')) return SiSpring;
    if (n.includes('aws')) return SiAmazon;
    if (n.includes('azure')) return VscAzure;
    if (n.includes('googlecloud') || n.includes('gcp')) return SiGooglecloud;
    if (n.includes('linux')) return SiLinux;
    // Design tools
    if (n.includes('figma')) return SiFigma;
    if (n.includes('photoshop')) return SiAdobephotoshop;
    if (n.includes('illustrator')) return SiAdobeillustrator;
    if (n.includes('aftereffects')) return SiAdobeaftereffects;
    if (n.includes('blender')) return SiBlender;
    if (n.includes('sketch')) return SiSketch;
    if (n.includes('webflow')) return SiWebflow;

    return null;
};

// Acento visual por industria (para impresión usa colores sólidos)
const ACCENTS: Record<string, { dot: string; text: string; soft: string }> = {
    Tech: { dot: 'bg-cyan-600', text: 'text-cyan-700', soft: 'bg-cyan-50' },
    Legal: { dot: 'bg-amber-600', text: 'text-amber-700', soft: 'bg-amber-50' },
    Design: { dot: 'bg-fuchsia-600', text: 'text-fuchsia-700', soft: 'bg-fuchsia-50' },
};

interface CVProps {
    profile: any;
}

export const CVDocument: React.FC<CVProps> = ({ profile }) => {
    const projects = profile.projects || [];
    const skillCategories = profile.skillCategories || [];
    const education = profile.education || [];
    const certifications = profile.certifications || [];
    const workExperiences = profile.workExperiences || [];
    const accent = ACCENTS[profile.industry] || { dot: 'bg-red-500', text: 'text-red-600', soft: 'bg-red-50' };

    // Imágenes de portafolio: cover + galería de cada proyecto y evidencias laborales
    const portfolioImages: { url: string; caption: string }[] = [];
    projects.forEach((p: any) => {
        const urls = new Set<string>();
        if (p.imageUrl) urls.add(p.imageUrl);
        p.images?.forEach((img: any) => urls.add(img.url));
        urls.forEach(url => portfolioImages.push({ url, caption: p.title }));
    });
    workExperiences.forEach((w: any) => {
        w.images?.forEach((img: any) =>
            portfolioImages.push({ url: img.url, caption: `${w.role} — ${w.company}` })
        );
    });

    const SectionTitle = ({ children }: { children: React.ReactNode }) => (
        <h3 className="flex items-center gap-3 font-black text-lg uppercase tracking-widest mb-4 text-slate-900 border-b border-slate-200 pb-2">
            <span className={`w-2 h-2 ${accent.dot} rounded-full`}></span>
            {children}
        </h3>
    );

    return (
        <div className="w-full max-w-[210mm] min-h-[297mm] mx-auto bg-white text-slate-900 p-6 sm:p-[12mm] shadow-2xl print:shadow-none print:w-full print:p-0 print:m-0 font-sans leading-relaxed">

            {/* --- HEADER --- */}
            <header className="border-b-[3px] border-slate-900 pb-8 mb-10 flex flex-col sm:flex-row justify-between items-start gap-6 relative print-avoid-break">
                <div className="space-y-4 sm:max-w-[65%]">
                    <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter text-slate-900 leading-[0.9]">
                        {profile.name}
                    </h1>
                    <h2 className="text-lg sm:text-xl font-bold uppercase tracking-widest text-slate-500">
                        {profile.headline}
                    </h2>
                    <span className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white ${accent.dot} rounded`}>
                        {profile.industry} Professional
                    </span>
                </div>

                <div className="sm:text-right space-y-2 text-sm font-medium text-slate-600">
                    {profile.location && (
                        <div className="flex items-center sm:justify-end gap-2">
                            <span>{profile.location}</span>
                            <MapPin size={14} className="text-slate-400" />
                        </div>
                    )}
                    <div className="flex items-center sm:justify-end gap-2">
                        <span>{profile.email}</span>
                        <Mail size={14} className="text-slate-400" />
                    </div>
                    {profile.phone && (
                        <div className="flex items-center sm:justify-end gap-2">
                            <span>{profile.phone}</span>
                            <Phone size={14} className="text-slate-400" />
                        </div>
                    )}

                    <div className="flex gap-3 sm:justify-end pt-2">
                        {profile.socials?.map((social: any, idx: number) => (
                            <a key={idx} href={social.url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-black transition-colors">
                                {social.platform === 'LinkedIn' ? <Linkedin size={18} /> :
                                    social.platform === 'GitHub' ? <Github size={18} /> :
                                        <Globe size={18} />}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Decorative asterisk */}
                <div className="absolute -bottom-[21px] left-0 bg-white pr-4 hidden sm:block">
                    <Star size={36} className="fill-slate-900 text-slate-900" />
                </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-[3fr_5fr] gap-10 sm:gap-12">

                {/* --- LEFT COLUMN --- */}
                <div className="space-y-10">

                    {/* ABOUT */}
                    {profile.bio && (
                        <section className="print-avoid-break">
                            <SectionTitle>Sobre Mí</SectionTitle>
                            <p className="text-sm text-slate-600 font-medium text-justify leading-relaxed">
                                {profile.bio}
                            </p>
                        </section>
                    )}

                    {/* STATS */}
                    {profile.attributes?.length > 0 && (
                        <section className="print-avoid-break">
                            <SectionTitle>Datos Clave</SectionTitle>
                            <div className="grid grid-cols-2 gap-3">
                                {profile.attributes.map((attr: any, i: number) => (
                                    <div key={i} className={`p-3 rounded-lg border border-slate-200 ${accent.soft}`}>
                                        <div className="text-base font-black text-slate-900">{attr.value}</div>
                                        <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{attr.label}</div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* EDUCATION */}
                    {education.length > 0 && (
                        <section className="print-avoid-break">
                            <SectionTitle>Educación</SectionTitle>
                            <div className="space-y-6 border-l-2 border-slate-100 ml-1 pl-5 relative">
                                {education.map((edu: any, i: number) => (
                                    <div key={i} className="relative print-avoid-break">
                                        <div className="absolute -left-[26px] top-1.5 w-2.5 h-2.5 bg-slate-200 rounded-full border-2 border-white"></div>
                                        <div className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">
                                            {edu.period}
                                        </div>
                                        <h4 className="font-bold text-slate-900 leading-tight mb-1">
                                            {edu.institution}
                                        </h4>
                                        <div className="text-sm text-slate-600 font-medium italic">
                                            {edu.degree}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* SKILLS */}
                    {skillCategories.length > 0 && (
                        <section>
                            <SectionTitle>Skills</SectionTitle>
                            <div className="space-y-6">
                                {skillCategories.map((cat: any, i: number) => (
                                    <div key={i} className="print-avoid-break">
                                        <h4 className={`font-bold text-xs text-slate-400 mb-3 uppercase tracking-widest border-b-2 ${accent.soft} inline-block pb-0.5`}>
                                            {cat.name}
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {cat.items?.map((item: any, j: number) => {
                                                const Icon = getTechIcon(item.name);
                                                return (
                                                    <div key={j} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs font-bold text-slate-700">
                                                        {Icon ? <Icon className="text-slate-800" size={14} /> : <div className={`w-2 h-2 ${accent.dot} opacity-30 rounded-full`}></div>}
                                                        <span>{item.name}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* --- RIGHT COLUMN --- */}
                <div className="space-y-10">

                    {/* WORK EXPERIENCE */}
                    {workExperiences.length > 0 && (
                        <section>
                            <h3 className="flex items-center gap-3 font-black text-2xl uppercase tracking-widest mb-8 text-slate-900">
                                <Briefcase className="text-slate-900" strokeWidth={2.5} size={24} />
                                Experiencia Laboral
                            </h3>
                            <div className="space-y-8 relative border-l-[3px] border-slate-900/10 ml-3 pl-8">
                                {workExperiences.map((work: any, idx: number) => (
                                    <div key={idx} className="relative print-avoid-break">
                                        <div className="absolute -left-[45px] top-0 bg-white p-1">
                                            <Star size={20} className="fill-slate-900 text-slate-900" />
                                        </div>
                                        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                                            <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">{work.role}</h4>
                                            {work.period && (
                                                <span className="text-xs font-bold bg-slate-900 text-white px-2 py-1 rounded">{work.period}</span>
                                            )}
                                        </div>
                                        <div className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wider mb-3 ${accent.text}`}>
                                            <Building2 size={14} />
                                            {work.company}
                                        </div>
                                        {work.responsibilities && (
                                            <p className="text-sm text-slate-600 leading-relaxed text-justify mb-2">{work.responsibilities}</p>
                                        )}
                                        {work.achievements && (
                                            <div className={`text-sm text-slate-700 ${accent.soft} border border-slate-100 rounded-lg p-3`}>
                                                <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block mb-1">Logro clave</span>
                                                {work.achievements}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* PROJECTS */}
                    {projects.length > 0 && (
                        <section>
                            <h3 className="flex items-center gap-3 font-black text-2xl uppercase tracking-widest mb-8 text-slate-900">
                                <Star className="text-slate-900 fill-slate-900" size={22} />
                                Proyectos Destacados
                            </h3>

                            <div className="space-y-8 relative border-l-[3px] border-slate-900/10 ml-3 pl-8 pb-2">
                                {projects.map((item: any, idx: number) => (
                                    <div key={idx} className="relative print-avoid-break">
                                        <div className="absolute -left-[42px] top-1 bg-white py-1">
                                            <span className={`block w-3 h-3 rounded-full ${accent.dot}`} />
                                        </div>

                                        <div className="mb-3">
                                            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                                                <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                                                    {item.title}
                                                </h4>
                                                {item.period && (
                                                    <span className="text-xs font-bold bg-slate-900 text-white px-2 py-1 rounded">{item.period}</span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                <span className={accent.text}>{item.client || "Personal Project"}</span>
                                                {item.type && (
                                                    <>
                                                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                        <span>{item.type}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="text-sm text-slate-600 leading-relaxed text-justify bg-slate-50 p-4 rounded-xl border border-slate-100 flex gap-4">
                                            {/* Miniatura del proyecto */}
                                            {(item.imageUrl || item.images?.[0]?.url) && (
                                                <img
                                                    src={item.imageUrl || item.images[0].url}
                                                    alt={item.title}
                                                    className="w-20 h-20 object-cover rounded-lg border border-slate-200 shrink-0"
                                                />
                                            )}
                                            <div className="min-w-0">
                                                {item.description && <p className="mb-2">{item.description}</p>}
                                                {(item.solution || item.outcome) && (
                                                    <div className="space-y-1 pt-2 border-t border-slate-200/60 text-xs">
                                                        {item.solution && (
                                                            <div><span className="font-bold text-slate-800">Solución: </span>{item.solution}</div>
                                                        )}
                                                        {item.outcome && (
                                                            <div><span className="font-bold text-slate-800">Impacto: </span>{item.outcome}</div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {item.tags?.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {item.tags.map((t: any, k: number) => (
                                                    <span key={k} className="text-[10px] font-mono text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
                                                        #{t.name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* CERTIFICATES */}
                    {certifications.length > 0 && (
                        <section className="pt-6 border-t border-slate-200 print-avoid-break">
                            <h3 className="flex items-center gap-2 font-black text-lg uppercase tracking-widest mb-6 text-slate-900">
                                <Award size={20} />
                                Certificaciones
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {certifications.map((cert: any, i: number) => (
                                    <div key={i} className="flex items-start gap-3 p-3 border border-slate-100 rounded bg-white print-avoid-break">
                                        <Award size={16} className={`mt-1 ${accent.text}`} />
                                        <div>
                                            <div className="font-bold text-sm text-slate-900">{cert.title}</div>
                                            <div className="text-xs text-slate-500 uppercase tracking-wide mt-0.5">{cert.provider} &bull; {cert.date}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>

            {/* --- PORTAFOLIO VISUAL (página propia en PDF) --- */}
            {portfolioImages.length > 0 && (
                <section className="mt-12 pt-8 border-t-[3px] border-slate-900 print-break-before">
                    <h3 className="flex items-center gap-3 font-black text-2xl uppercase tracking-widest mb-2 text-slate-900">
                        <Images size={24} strokeWidth={2.5} />
                        Portafolio Visual
                    </h3>
                    <p className="text-xs text-slate-400 uppercase tracking-widest mb-8">
                        Evidencia gráfica de proyectos y trabajos &bull; {portfolioImages.length} piezas
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {portfolioImages.map((img, i) => (
                            <figure key={i} className="print-avoid-break rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                                <img
                                    src={img.url}
                                    alt={img.caption}
                                    className="w-full aspect-[4/3] object-cover"
                                />
                                <figcaption className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate flex items-center gap-1.5">
                                    <span className={`w-1.5 h-1.5 rounded-full ${accent.dot} shrink-0`} />
                                    {img.caption}
                                </figcaption>
                            </figure>
                        ))}
                    </div>
                </section>
            )}

            <div className="mt-12 text-center border-t-2 border-slate-900 pt-6">
                <p className="font-mono text-[10px] text-slate-400 uppercase tracking-[0.2em] flex flex-wrap items-center justify-center gap-2 sm:gap-4">
                    <span>Generated by ProCard</span>
                    <span>&bull;</span>
                    <span>{new Date().toISOString().split('T')[0]}</span>
                    <span>&bull;</span>
                    <span>{profile.slug || profile.id}</span>
                </p>
            </div>
        </div>
    );
};
