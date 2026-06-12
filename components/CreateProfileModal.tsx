'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { createClientProfile } from '@/lib/api'
import { X, UserPlus, Briefcase, Scale, Server, Link2, ShieldAlert, Database, Smartphone, Users, Globe, Building, FolderGit2, Image as ImageIcon, Plus, Trash2, CheckCircle2, GraduationCap, Award, Pencil, Gavel, FileText, GripVertical, Palette } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Reorder } from 'framer-motion'
import { getSpecialties, getStackCategories, getTagOptions, getStatsConfig } from '@/data/profile-constants'


export function CreateProfileModal({ onSuccess, trigger }: { onSuccess?: () => void, trigger?: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)
    const [step, setStep] = useState(1)
    const [isPending, setIsPending] = useState(false)
    const [industry, setIndustry] = useState('Tech')

    // Tech Stack State
    const [selectedStack, setSelectedStack] = useState<Record<string, string[]>>({
        "Backend & Arquitectura": [],
        "Bases de Datos": [],
        "DevOps & Infra": [],
        "Frontend & UI": [],
        "IA & Automation": [],
        "Design & Multimedia": [],
        "Areas de Practica": [],
        "Herramientas LegalTech": [],
        "Habilidades Profesionales": [],
        "Idiomas & Jurisdiccion": []
    })

    // Project State
    const [projects, setProjects] = useState<any[]>([])
    const [currentProject, setCurrentProject] = useState({
        title: '',
        client: '',
        type: 'Laboral',
        desc: '',
        solution: '',
        outcome: '',
        tags: [] as string[],
        imageFile: null as File | null
    })

    // Education State
    const [education, setEducation] = useState<any[]>([])
    const [currentEdu, setCurrentEdu] = useState({
        institution: '',
        degree: '',
        period: '',
        status: 'Completed'
    })

    // Certifications State
    const [certifications, setCertifications] = useState<any[]>([])
    const [currentCert, setCurrentCert] = useState({
        title: '',
        provider: '',
        date: ''
    })

    const router = useRouter()

    const handleAddProject = () => {
        if (!currentProject.title || !currentProject.desc) return; // Basic validation
        setProjects([...projects, { ...currentProject, _id: Math.random().toString(36).substr(2, 9) }])
        setCurrentProject({
            title: '', client: '', type: 'Laboral', desc: '', solution: '', outcome: '', tags: [], imageFile: null
        })
    }

    const removeProject = (index: number) => {
        setProjects(projects.filter((_, i) => i !== index))
    }

    const editProject = (index: number) => {
        const itemToEdit = projects[index]
        setCurrentProject(itemToEdit)
        removeProject(index)
    }

    const toggleTech = (tech: string) => {
        setCurrentProject(prev => {
            const tags = prev.tags.includes(tech)
                ? prev.tags.filter(t => t !== tech)
                : [...prev.tags, tech]
            return { ...prev, tags }
        })
    }

    const handleAddEducation = () => {
        if (!currentEdu.institution || !currentEdu.degree) return;
        setEducation([...education, { ...currentEdu, _id: Math.random().toString(36).substr(2, 9) }])
        setCurrentEdu({ institution: '', degree: '', period: '', status: 'Completed' })
    }

    const removeEducation = (index: number) => {
        setEducation(education.filter((_, i) => i !== index))
    }

    const editEducation = (index: number) => {
        const itemToEdit = education[index]
        setCurrentEdu(itemToEdit)
        removeEducation(index)
    }

    const handleAddCertification = () => {
        if (!currentCert.title || !currentCert.provider) return;
        setCertifications([...certifications, { ...currentCert, _id: Math.random().toString(36).substr(2, 9) }])
        setCurrentCert({ title: '', provider: '', date: '' })
    }

    const removeCertification = (index: number) => {
        setCertifications(certifications.filter((_, i) => i !== index))
    }

    const editCertification = (index: number) => {
        const itemToEdit = certifications[index]
        setCurrentCert(itemToEdit)
        removeCertification(index)
    }

    const toggleStackItem = (category: string, item: string) => {
        setSelectedStack(prev => {
            const currentItems = prev[category] || []
            const newItems = currentItems.includes(item)
                ? currentItems.filter(i => i !== item)
                : [...currentItems, item]
            return { ...prev, [category]: newItems }
        })
    }

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsPending(true)
        const formData = new FormData(event.currentTarget)

        // Append Tech Stack
        formData.append('tech_stack_data', JSON.stringify(selectedStack))

        // Append Education
        let finalEducation = [...education]
        if (currentEdu.institution) {
            finalEducation.push({ ...currentEdu, _id: 'temp_new' })
        }
        formData.append('education_data', JSON.stringify(finalEducation.map((item, idx) => ({ ...item, order: idx }))))

        // Append Certifications
        let finalCertifications = [...certifications]
        if (currentCert.title) {
            finalCertifications.push({ ...currentCert, _id: 'temp_new' })
        }
        formData.append('certifications_data', JSON.stringify(finalCertifications.map((item, idx) => ({ ...item, order: idx }))))


        // Append Projects
        let finalProjects = [...projects]
        if (currentProject.title) {
            finalProjects.push({ ...currentProject, _id: 'temp_new' })
        }

        formData.append('projects_data', JSON.stringify(finalProjects.map((p, index) => ({
            title: p.title,
            client: p.client,
            type: p.type,
            desc: p.desc,
            solution: p.solution,
            outcome: p.outcome,
            tags: p.tags,
            order: index
        }))))

        finalProjects.forEach((p, index) => {
            if (p.imageFile) {
                formData.append(`project_image_${index}`, p.imageFile)
            }
        })

        const res = await createClientProfile(formData)

        setIsPending(false)
        if (res.success) {
            setIsOpen(false)
            setStep(1)
            setProjects([])
            setEducation([])
            setCertifications([])
            setSelectedStack({
                "Backend & Arquitectura": [],
                "Bases de Datos": [],
                "DevOps & Infra": [],
                "Frontend & UI": [],
                "IA & Automatización": [],
                "Diseño & Multimedia": [],
                "Áreas de Práctica": [],
                "Herramientas LegalTech": [],
                "Habilidades Profesionales": [],
                "Idiomas & Jurisdicción": []
            })
            setCurrentProject({
                title: '', client: '', type: 'Laboral', desc: '', solution: '', outcome: '', tags: [], imageFile: null
            })
            setCurrentEdu({ institution: '', degree: '', period: '', status: 'Completed' })
            setCurrentCert({ title: '', provider: '', date: '' })
            router.refresh()
            onSuccess?.()
        }
    }

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        if (step < 7) {
            setStep(step + 1);
        }
    }

    const isLastStep = step === 7;

    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!isOpen) {
        if (trigger) {
            return <div onClick={() => setIsOpen(true)}>{trigger}</div>
        }
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 bg-cyan-500 text-black px-6 py-2.5 rounded-lg hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] font-bold group"
            >
                <UserPlus size={18} className="group-hover:scale-110 transition-transform" />
                <span>Registrar Perfil</span>
            </button>
        )
    }

    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
            {/* Overlay */}
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setIsOpen(false)} />

            {/* Modal Container */}
            <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 h-auto max-h-[95vh] flex flex-col relative z-20">

                {/* Header */}
                <div className="bg-slate-950/60 px-8 py-6 border-b border-cyan-500/20 flex justify-between items-center sticky top-0 z-30 backdrop-blur-sm">
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                            <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_10px_#06b6d4]" />
                            {step === 1 && 'New Profile Identity'}
                            {step === 2 && 'Excellence Metrics'}
                            {step === 3 && (industry === 'Tech' ? 'Technical Specialties' : 'Áreas de Especialización')}
                            {step === 4 && (industry === 'Tech' ? 'Arsenal Tecnológico' : 'Competencias Jurídicas')}
                            {step === 5 && 'Historial Académico'}
                            {step === 6 && (industry === 'Tech' ? 'Cursos y Certificaciones' : 'Formación Continua')}
                            {step === 7 && (industry === 'Tech' ? 'Project Portfolio' : 'Experiencia & Casos')}
                        </h2>
                        <p className="text-[10px] text-cyan-500 font-mono uppercase tracking-[0.2em] mt-1 opacity-70">Module // Phase.{step < 10 ? `0${step}` : step} // Architecture</p>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar bg-grid-pattern-subtle">
                    <form id="create-profile-form" onSubmit={onSubmit} className="space-y-10">

                        {/* STEP 1: BASIC INFO */}
                        <div className={step === 1 ? 'block space-y-6' : 'hidden'}>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                                <label className="cursor-pointer group">
                                    <input type="radio" name="industry" value="Tech" className="peer sr-only" checked={industry === 'Tech'} onChange={() => setIndustry('Tech')} />
                                    <div className="border border-white/10 group-hover:border-cyan-500/50 peer-checked:border-cyan-500 peer-checked:bg-cyan-500/10 rounded-2xl p-6 text-center transition-all bg-slate-950/40 backdrop-blur-sm">
                                        <Server size={32} className="mx-auto mb-3 text-slate-500 peer-checked:text-cyan-400 group-hover:scale-110 transition-transform" />
                                        <span className="block font-bold text-slate-400 peer-checked:text-white uppercase tracking-widest text-xs">Technology</span>
                                    </div>
                                </label>
                                <label className="cursor-pointer group">
                                    <input type="radio" name="industry" value="Legal" className="peer sr-only" checked={industry === 'Legal'} onChange={() => setIndustry('Legal')} />
                                    <div className="border border-white/10 group-hover:border-indigo-500/50 peer-checked:border-indigo-500 peer-checked:bg-indigo-500/10 rounded-2xl p-6 text-center transition-all bg-slate-950/40 backdrop-blur-sm">
                                        <Scale size={32} className="mx-auto mb-3 text-slate-500 peer-checked:text-indigo-400 group-hover:scale-110 transition-transform" />
                                        <span className="block font-bold text-slate-400 peer-checked:text-white uppercase tracking-widest text-xs">Legal Services</span>
                                    </div>
                                </label>
                                <label className="cursor-pointer group">
                                    <input type="radio" name="industry" value="Design" className="peer sr-only" checked={industry === 'Design'} onChange={() => setIndustry('Design')} />
                                    <div className="border border-white/10 group-hover:border-fuchsia-500/50 peer-checked:border-fuchsia-500 peer-checked:bg-fuchsia-500/10 rounded-2xl p-6 text-center transition-all bg-slate-950/40 backdrop-blur-sm">
                                        <Palette size={32} className="mx-auto mb-3 text-slate-500 peer-checked:text-fuchsia-400 group-hover:scale-110 transition-transform" />
                                        <span className="block font-bold text-slate-400 peer-checked:text-white uppercase tracking-widest text-xs">Creative Design</span>
                                    </div>
                                </label>
                            </div>
                            <div className="space-y-4 text-slate-900">
                                <div className="grid grid-cols-2 gap-6">
                                    <div><label className="block text-xs font-bold text-cyan-500/60 uppercase tracking-widest mb-2">Nombre</label><input name="firstName" placeholder="Ej: Unlocking" className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl outline-none focus:border-cyan-500 transition-all text-white placeholder:text-slate-600" /></div>
                                    <div><label className="block text-xs font-bold text-cyan-500/60 uppercase tracking-widest mb-2">Apellido</label><input name="lastName" placeholder="Ej: Digital Resilience" className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl outline-none focus:border-cyan-500 transition-all text-white placeholder:text-slate-600" /></div>
                                </div>
                                <div><label className="block text-xs font-bold text-cyan-500/60 uppercase tracking-widest mb-2">Full Name</label><input name="name" className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl outline-none focus:border-cyan-500 transition-all text-white placeholder:text-slate-600" placeholder="e.g. Cristian Puma" /></div>
                                <div><label className="block text-xs font-bold text-cyan-500/60 uppercase tracking-widest mb-2">Headline</label><input name="headline" className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl outline-none focus:border-cyan-500 transition-all text-white placeholder:text-slate-600" placeholder="e.g. Senior Software Architect" /></div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div><label className="block text-xs font-bold text-cyan-500/60 uppercase tracking-widest mb-2">Email</label><input name="email" type="email" className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl outline-none focus:border-cyan-500 transition-all text-white placeholder:text-slate-600" /></div>
                                    <div><label className="block text-xs font-bold text-cyan-500/60 uppercase tracking-widest mb-2">Phone</label><input name="phone" className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl outline-none focus:border-cyan-500 transition-all text-white placeholder:text-slate-600" /></div>
                                </div>
                                <div><label className="block text-xs font-bold text-cyan-500/60 uppercase tracking-widest mb-2">Location</label><input name="location" className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl outline-none focus:border-cyan-500 transition-all text-white placeholder:text-slate-600" /></div>
                                <div><label className="block text-xs font-bold text-cyan-500/60 uppercase tracking-widest mb-2">Bio</label><textarea name="bio" rows={4} className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl outline-none focus:border-cyan-500 transition-all resize-none text-white placeholder:text-slate-600" /></div>
                            </div>

                            {/* Social Links Sub-section */}
                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                    <Link2 size={16} className="text-cyan-500" />
                                    Redes Sociales
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-bold text-cyan-500/40 uppercase tracking-widest">LinkedIn</label>
                                        <input name="social_linkedin" className="w-full px-4 py-2 bg-slate-950/50 border border-white/10 rounded-lg text-xs outline-none focus:border-cyan-500 text-white placeholder:text-slate-700" placeholder="https://linkedin.com/in/..." />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-bold text-cyan-500/40 uppercase tracking-widest">GitHub</label>
                                        <input name="social_github" className="w-full px-4 py-2 bg-slate-950/50 border border-white/10 rounded-lg text-xs outline-none focus:border-cyan-500 text-white placeholder:text-slate-700" placeholder="https://github.com/..." />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-bold text-cyan-500/40 uppercase tracking-widest">YouTube</label>
                                        <input name="social_youtube" className="w-full px-4 py-2 bg-slate-950/50 border border-white/10 rounded-lg text-xs outline-none focus:border-cyan-500 text-white placeholder:text-slate-700" placeholder="https://youtube.com/@..." />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-bold text-cyan-500/40 uppercase tracking-widest">Email (Social)</label>
                                        <input name="social_email" className="w-full px-4 py-2 bg-slate-950/50 border border-white/10 rounded-lg text-xs outline-none focus:border-cyan-500 text-white placeholder:text-slate-700" placeholder="ejemplo@correo.com" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-bold text-cyan-500/40 uppercase tracking-widest">TikTok</label>
                                        <input name="social_tiktok" className="w-full px-4 py-2 bg-slate-950/50 border border-white/10 rounded-lg text-xs outline-none focus:border-cyan-500 text-white placeholder:text-slate-700" placeholder="https://tiktok.com/@..." />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* STEP 2: STATS */}
                        <div className={step === 2 ? 'block space-y-6' : 'hidden'}>
                            <div className="grid grid-cols-2 gap-6">
                                {getStatsConfig(industry).map((stat) => (
                                    <div key={stat.name}>
                                        <label className="block text-xs font-bold text-cyan-500/60 uppercase tracking-widest mb-2">{stat.label}</label>
                                        <input
                                            name={`stat_${stat.name}`}
                                            className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl outline-none focus:border-cyan-500 transition-all text-white placeholder:text-slate-600 text-sm"
                                            placeholder={stat.placeholder}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* STEP 3: TECH SPECIALTIES (Grid) */}
                        <div className={step === 3 ? 'block' : 'hidden'}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {getSpecialties(industry).map((spec) => {
                                    const Icon = spec.icon
                                    return (
                                        <label key={spec.id} className="cursor-pointer relative group">
                                            <input type="checkbox" name="specialties" value={`${spec.title}|${spec.description}`} className="peer sr-only" />
                                            <div className="h-full border border-white/10 rounded-2xl p-6 transition-all bg-slate-950/40 backdrop-blur-sm group-hover:border-cyan-500/50 peer-checked:bg-cyan-500/10 peer-checked:border-cyan-500">
                                                <div className="flex items-start gap-4">
                                                    <div className="p-3 bg-slate-900 rounded-xl text-slate-500 group-hover:text-cyan-400 peer-checked:bg-cyan-500 peer-checked:text-black transition-all shadow-inner">
                                                        <Icon size={24} />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-sm mb-1 text-slate-300 peer-checked:text-white uppercase tracking-wider">{spec.title}</div>
                                                        <div className="text-[11px] text-slate-500 leading-relaxed font-light">{spec.description}</div>
                                                    </div>
                                                </div>
                                                <div className="absolute top-4 right-4 opacity-0 peer-checked:opacity-100 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
                                                    <CheckCircle2 size={18} />
                                                </div>
                                            </div>
                                        </label>
                                    )
                                })}
                            </div>
                        </div>

                        {/* STEP 4: TECH STACK (New) */}
                        <div className={step === 4 ? 'block' : 'hidden'}>
                            <div className="grid grid-cols-2 gap-6">
                                {Object.entries(getStackCategories(industry)).map(([catName, items]) => (
                                    <div key={catName} className="bg-slate-950 p-5 rounded-2xl border border-white/10 shadow-lg">
                                        <h4 className="text-[10px] font-bold text-cyan-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                            <div className="w-1 h-3 bg-cyan-500 rounded-full" />
                                            {catName}
                                        </h4>
                                        <div className="space-y-3">
                                            {items.map(item => (
                                                <label key={item} className="flex items-center gap-3 cursor-pointer group/item">
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${selectedStack[catName]?.includes(item) ? 'bg-cyan-500 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.4)]' : 'border-white/20 bg-slate-900 group-hover/item:border-cyan-500/50'}`}>
                                                        {selectedStack[catName]?.includes(item) && <CheckCircle2 size={10} className="text-black" />}
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only"
                                                        checked={selectedStack[catName]?.includes(item)}
                                                        onChange={() => toggleStackItem(catName, item)}
                                                    />
                                                    <span className={`text-xs uppercase tracking-tighter transition-colors ${selectedStack[catName]?.includes(item) ? 'text-white font-bold' : 'text-slate-400 group-hover/item:text-slate-200'}`}>{item}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>


                        {/* STEP 5: EDUCATION */}
                        <div className={step === 5 ? 'block space-y-6' : 'hidden'}>
                            {education.length > 0 && (
                                <div className="space-y-3 mb-6">
                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Added Records ({education.length})</h4>
                                    <Reorder.Group axis="y" values={education} onReorder={setEducation} className="space-y-3">
                                        {education.map((edu, idx) => (
                                            <Reorder.Item key={edu._id} value={edu} className="flex items-center justify-between bg-slate-950/40 p-4 rounded-xl border border-white/5 backdrop-blur-sm cursor-grab active:cursor-grabbing">
                                                <div className="flex items-center gap-3">
                                                    <GripVertical size={16} className="text-slate-600" />
                                                    <div>
                                                        <div className="font-bold text-white text-sm">{edu.institution}</div>
                                                        <div className="text-xs text-slate-500 font-mono">{edu.degree} • {edu.period}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button type="button" onClick={() => editEducation(idx)} className="text-slate-500 hover:text-cyan-400 p-2 hover:bg-white/5 rounded-lg transition-all"><Pencil size={16} /></button>
                                                    <button type="button" onClick={() => removeEducation(idx)} className="text-slate-500 hover:text-red-400 p-2 hover:bg-white/5 rounded-lg transition-all"><Trash2 size={16} /></button>
                                                </div>
                                            </Reorder.Item>
                                        ))}
                                    </Reorder.Group>
                                </div>
                            )}

                            <div className="bg-slate-950/40 border border-white/10 rounded-2xl p-6 space-y-6">
                                <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                                    <GraduationCap size={18} className="text-cyan-500" />
                                    {education.length > 0 ? 'Inject Another Record' : 'Initialize Education'}
                                </h3>

                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-cyan-500/60 uppercase tracking-widest mb-1">Institución</label>
                                        <input value={currentEdu.institution} onChange={(e) => setCurrentEdu({ ...currentEdu, institution: e.target.value })} className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl outline-none focus:border-cyan-500 text-white placeholder:text-slate-600 text-sm" placeholder="Ej: UMA - Universidad María Auxiliadora" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-cyan-500/60 uppercase tracking-widest mb-1">Título / Especialidad</label>
                                        <input value={currentEdu.degree} onChange={(e) => setCurrentEdu({ ...currentEdu, degree: e.target.value })} className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl outline-none focus:border-cyan-500 text-white placeholder:text-slate-600 text-sm" placeholder="Ej: Ingeniería de Inteligencia Artificial" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-cyan-500/60 uppercase tracking-widest mb-1">Periodo</label>
                                            <input value={currentEdu.period} onChange={(e) => setCurrentEdu({ ...currentEdu, period: e.target.value })} className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl outline-none focus:border-cyan-500 text-white placeholder:text-slate-600 text-sm" placeholder="Ej: 2024 - Actualidad" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-cyan-500/60 uppercase tracking-widest mb-1">Estado</label>
                                            <select value={currentEdu.status} onChange={(e) => setCurrentEdu({ ...currentEdu, status: e.target.value })} className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl outline-none focus:border-cyan-500 text-white bg-slate-950 text-sm">
                                                <option value="Completed">Completado</option>
                                                <option value="In Progress">En Curso</option>
                                                <option value="Truncated">Técnico/Otros</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddEducation}
                                    className="w-full py-3 bg-cyan-500/10 text-cyan-400 font-bold rounded-xl hover:bg-cyan-500/20 transition-all text-sm border border-cyan-500/30"
                                >
                                    + Inject into Stack
                                </button>
                            </div>
                        </div>


                        {/* STEP 6: CERTIFICATIONS (New) */}
                        <div className={step === 6 ? 'block space-y-6' : 'hidden'}>
                            {certifications.length > 0 && (
                                <div className="space-y-3 mb-6">
                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Added Knowledge ({certifications.length})</h4>
                                    <Reorder.Group axis="y" values={certifications} onReorder={setCertifications} className="space-y-3">
                                        {certifications.map((cert, idx) => (
                                            <Reorder.Item key={cert._id} value={cert} className="flex items-center justify-between bg-slate-950/40 p-4 rounded-xl border border-white/5 backdrop-blur-sm cursor-grab active:cursor-grabbing">
                                                <div className="flex items-center gap-3">
                                                    <GripVertical size={16} className="text-slate-600" />
                                                    <div>
                                                        <div className="font-bold text-white text-sm">{cert.title}</div>
                                                        <div className="text-xs text-slate-500 font-mono">{cert.provider} • {cert.date}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button type="button" onClick={() => editCertification(idx)} className="text-slate-500 hover:text-cyan-400 p-2 hover:bg-white/5 rounded-lg transition-all"><Pencil size={16} /></button>
                                                    <button type="button" onClick={() => removeCertification(idx)} className="text-slate-500 hover:text-red-400 p-2 hover:bg-white/5 rounded-lg transition-all"><Trash2 size={16} /></button>
                                                </div>
                                            </Reorder.Item>
                                        ))}
                                    </Reorder.Group>
                                </div>
                            )}

                            <div className="bg-slate-950/40 border border-white/10 rounded-2xl p-6 space-y-6">
                                <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                                    <Award size={18} className="text-cyan-500" />
                                    {certifications.length > 0 ? 'Inject Another Node' : 'Initialize Certification'}
                                </h3>

                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-cyan-500/60 uppercase tracking-widest mb-2">Nombre del Curso</label>
                                        <input
                                            value={currentCert.title}
                                            onChange={(e) => setCurrentCert({ ...currentCert, title: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl outline-none text-sm text-white placeholder:text-slate-700 focus:border-cyan-500 transition-all"
                                            placeholder="Ej: How to Build a Full Stack Application"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-cyan-500/60 uppercase tracking-widest mb-2">Proveedor</label>
                                            <input
                                                value={currentCert.provider}
                                                onChange={(e) => setCurrentCert({ ...currentCert, provider: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl outline-none text-sm text-white placeholder:text-slate-700 focus:border-cyan-500 transition-all"
                                                placeholder="Ej: freecodecamp"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-cyan-500/60 uppercase tracking-widest mb-2">Fecha</label>
                                            <input
                                                value={currentCert.date}
                                                onChange={(e) => setCurrentCert({ ...currentCert, date: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl outline-none text-sm text-white placeholder:text-slate-700 focus:border-cyan-500 transition-all"
                                                placeholder="Ej: 09/02/2025"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddCertification}
                                    className="w-full py-3 bg-cyan-500/10 text-cyan-400 font-bold rounded-xl hover:bg-cyan-500/20 transition-all text-sm border border-cyan-500/30"
                                >
                                    + Inject into Stack
                                </button>
                            </div>
                        </div>

                        {/* STEP 7: PROJECTS */}
                        <div className={step === 7 ? 'block space-y-6' : 'hidden'}>
                            {projects.length > 0 && (
                                <div className="space-y-3 mb-6">
                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">{industry === 'Tech' ? 'Active Operations' : 'Casos & Experiencia'} ({projects.length})</h4>
                                    <Reorder.Group axis="y" values={projects} onReorder={setProjects} className="space-y-3">
                                        {projects.map((p, idx) => (
                                            <Reorder.Item key={p._id} value={p} className="flex items-center justify-between bg-slate-950/40 p-4 rounded-xl border border-white/5 backdrop-blur-sm cursor-grab active:cursor-grabbing">
                                                <div className="flex items-center gap-3">
                                                    <GripVertical size={16} className="text-slate-600" />
                                                    <div>
                                                        <div className="font-bold text-white text-sm">{p.title}</div>
                                                        <div className="text-xs text-slate-500 font-mono tracking-tight">{p.client || 'Internal Core'} • {p.tags.length} {industry === 'Tech' ? 'active technologies' : 'competencias'}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button type="button" onClick={() => editProject(idx)} className="text-slate-500 hover:text-cyan-400 p-2 hover:bg-white/5 rounded-lg transition-all"><Pencil size={16} /></button>
                                                    <button type="button" onClick={() => removeProject(idx)} className="text-slate-500 hover:text-red-400 p-2 hover:bg-white/5 rounded-lg transition-all"><Trash2 size={16} /></button>
                                                </div>
                                            </Reorder.Item>
                                        ))}
                                    </Reorder.Group>
                                </div>
                            )}

                            <div className="bg-slate-950/40 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-8 relative overflow-hidden group/modal">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover/modal:bg-cyan-500/10 transition-colors" />

                                <h3 className="font-bold text-white mb-2 flex items-center gap-3 relative z-10">
                                    {projects.length > 0 ? <Plus size={20} className="text-cyan-500" /> : <Briefcase size={20} className="text-cyan-500" />}
                                    <span className="tracking-tight">{projects.length > 0 ? (industry === 'Tech' ? 'Add Another Project' : 'Agregar Otro Caso') : (industry === 'Tech' ? 'Add First Project' : 'Agregar Primer Caso')}</span>
                                </h3>

                                <div className="grid grid-cols-2 gap-4 mb-4 relative z-10">
                                    <label className="cursor-pointer group/type">
                                        <input type="radio" name="current_project_type" value="Laboral" className="peer sr-only" checked={currentProject.type === 'Laboral'} onChange={() => setCurrentProject({ ...currentProject, type: 'Laboral' })} />
                                        <div className="border border-white/10 group-hover/type:border-cyan-500/30 peer-checked:border-cyan-500 peer-checked:bg-cyan-500/10 rounded-xl p-4 flex items-center gap-3 transition-all bg-slate-950/40">
                                            <Building size={16} className="text-slate-500 peer-checked:text-cyan-400" />
                                            <span className="font-bold text-xs text-slate-400 peer-checked:text-white uppercase tracking-widest">{industry === 'Tech' ? 'Corporate' : 'Firma / Estudio'}</span>
                                        </div>
                                    </label>
                                    <label className="cursor-pointer group/type">
                                        <input type="radio" name="current_project_type" value="Personal" className="peer sr-only" checked={currentProject.type === 'Personal'} onChange={() => setCurrentProject({ ...currentProject, type: 'Personal' })} />
                                        <div className="border border-white/10 group-hover/type:border-purple-500/30 peer-checked:border-purple-500 peer-checked:bg-purple-500/10 rounded-xl p-4 flex items-center gap-3 transition-all bg-slate-950/40">
                                            <FolderGit2 size={16} className="text-slate-500 peer-checked:text-purple-400" />
                                            <span className="font-bold text-xs text-slate-400 peer-checked:text-white uppercase tracking-widest">{industry === 'Tech' ? 'Personal' : 'Independiente'}</span>
                                        </div>
                                    </label>
                                </div>

                                <div className="space-y-6 relative z-10">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-bold text-cyan-500/40 uppercase tracking-[0.2em] ml-1">{industry === 'Tech' ? 'Identity' : 'Caso / Proyecto'}</label>
                                            <input
                                                value={currentProject.title}
                                                onChange={(e) => setCurrentProject({ ...currentProject, title: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-950/80 border border-white/10 rounded-xl outline-none text-sm text-white placeholder:text-slate-700 focus:border-cyan-500 transition-all font-light"
                                                placeholder={industry === 'Tech' ? "Project Title" : "Ej: Defensa Corporativa vs. Estado"}
                                            />
                                        </div>
                                        {currentProject.type === 'Laboral' && (
                                            <div className="space-y-2 animate-in slide-in-from-right-2 duration-300">
                                                <label className="block text-[10px] font-bold text-cyan-500/40 uppercase tracking-[0.2em] ml-1">{industry === 'Tech' ? 'Client / Company' : 'Cliente / Firma'}</label>
                                                <input
                                                    value={currentProject.client}
                                                    onChange={(e) => setCurrentProject({ ...currentProject, client: e.target.value })}
                                                    className="w-full px-4 py-3 bg-slate-950/80 border border-white/10 rounded-xl outline-none text-sm text-white placeholder:text-slate-700 focus:border-cyan-500 transition-all font-light"
                                                    placeholder={industry === 'Tech' ? "Who you worked for" : "Empresa o Cliente"}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-bold text-cyan-500/40 uppercase tracking-[0.2em] ml-1">{industry === 'Tech' ? 'Challenge Matrix' : 'Contexto del Caso'}</label>
                                        <textarea value={currentProject.desc} onChange={(e) => setCurrentProject({ ...currentProject, desc: e.target.value })} rows={2} className="w-full px-4 py-3 bg-slate-950/80 border border-white/10 rounded-xl outline-none resize-none text-sm text-white placeholder:text-slate-700 focus:border-cyan-500 transition-all font-light" placeholder={industry === 'Tech' ? "Describe the mission challenge..." : "Describa el conflicto o requerimiento legal..."} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-bold text-cyan-500/40 uppercase tracking-[0.2em] ml-1">{industry === 'Tech' ? 'Engineered Solution' : 'Estrategia Legal'}</label>
                                            <textarea value={currentProject.solution} onChange={(e) => setCurrentProject({ ...currentProject, solution: e.target.value })} rows={2} className="w-full px-4 py-3 bg-slate-950/80 border border-white/10 rounded-xl outline-none resize-none text-sm text-white placeholder:text-slate-700 focus:border-cyan-500 transition-all font-light" placeholder={industry === 'Tech' ? "Core architecture details..." : "Argumentación y acciones tomadas..."} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-bold text-cyan-500/40 uppercase tracking-[0.2em] ml-1">{industry === 'Tech' ? 'Calculated Outcome' : 'Resultado / Sentencia'}</label>
                                            <textarea value={currentProject.outcome} onChange={(e) => setCurrentProject({ ...currentProject, outcome: e.target.value })} rows={2} className="w-full px-4 py-3 bg-slate-950/80 border border-white/10 rounded-xl outline-none resize-none text-sm text-white placeholder:text-slate-700 focus:border-cyan-500 transition-all font-light" placeholder={industry === 'Tech' ? "Impact and results..." : "Fallo favorale, acuerdo, etc..."} />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="block text-xs font-bold text-cyan-500/60 uppercase tracking-widest ml-1">{industry === 'Tech' ? 'Tech Substack' : 'Materias Relacionadas'}</label>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 h-40 overflow-y-auto border border-white/5 rounded-2xl p-4 bg-slate-950/40 custom-scrollbar shadow-inner">
                                            {getTagOptions(industry).map(tech => (
                                                <label key={tech} className="flex items-center gap-3 cursor-pointer group/item">
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${currentProject.tags.includes(tech) ? 'bg-cyan-500 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.4)]' : 'border-white/20 group-hover/item:border-cyan-500/50'}`}>
                                                        {currentProject.tags.includes(tech) && <CheckCircle2 size={10} className="text-black" />}
                                                    </div>
                                                    <input type="checkbox" checked={currentProject.tags.includes(tech)} onChange={() => toggleTech(tech)} className="sr-only" />
                                                    <span className={`text-[11px] uppercase tracking-tighter ${currentProject.tags.includes(tech) ? 'text-white font-bold' : 'text-slate-500 group-hover/item:text-slate-300'}`}>{tech}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="border border-white/10 border-dashed rounded-2xl p-6 text-center cursor-pointer relative hover:bg-white/5 hover:border-cyan-500/30 transition-all group/upload">
                                        <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" onChange={(e) => { if (e.target.files?.[0]) { setCurrentProject({ ...currentProject, imageFile: e.target.files[0] }) } }} />
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="p-3 bg-white/5 rounded-full group-hover/upload:scale-110 transition-transform">
                                                <ImageIcon size={24} className="text-slate-500 group-hover:text-cyan-400" />
                                            </div>
                                            {currentProject.imageFile ? (
                                                <span className="text-xs text-cyan-400 font-mono flex items-center gap-2"><CheckCircle2 size={14} /> {currentProject.imageFile.name}</span>
                                            ) : (
                                                <div className="space-y-1">
                                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Upload Visual Evidence</p>
                                                    <p className="text-[10px] text-slate-500 font-mono">PNG, JPG up to 10MB</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleAddProject}
                                        className="w-full py-4 bg-white text-black font-black uppercase tracking-[0.2em] rounded-xl hover:bg-cyan-400 transition-all shadow-xl active:scale-95"
                                    >
                                        {industry === 'Tech' ? '+ Deploy to Project List' : '+ Archivar en Expediente'}
                                    </button>
                                </div>
                            </div>
                        </div>

                    </form>
                </div>

                <div className="shrink-0 pt-6 pb-6 px-10 flex justify-between gap-4 border-t border-cyan-500/20 bg-slate-950 z-40">
                    {step > 1 ? (
                        <button type="button" onClick={() => setStep(step - 1)} className="px-6 py-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg font-medium transition-all">Anterior</button>
                    ) : (
                        <button type="button" onClick={() => setIsOpen(false)} className="px-6 py-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg font-medium transition-all">Cancelar</button>
                    )}
                    {isLastStep ? (
                        <button type="submit" form="create-profile-form" disabled={isPending} className="bg-cyan-500 text-black px-10 py-2.5 rounded-lg font-bold hover:bg-cyan-400 disabled:opacity-50 ml-auto shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all">{isPending ? 'DEPLOYING...' : 'FINALIZE_PROFILE'}</button>
                    ) : (
                        <button type="button" onClick={handleNext} className="bg-white text-black px-10 py-2.5 rounded-lg font-bold hover:bg-slate-200 ml-auto transition-all">Siguiente</button>
                    )}
                </div>
            </div>
        </div>,
        document.body
    )
}
