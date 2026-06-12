'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { updateClientProfile } from '@/lib/api'
import { X, Pencil, Server, Scale, Briefcase, Link2, ShieldAlert, Database, Smartphone, Users, Building, FolderGit2, Plus, Trash2, Image as ImageIcon, CheckCircle2, GraduationCap, Award, ChevronDown, ChevronUp, Globe, Gavel, FileText, GripVertical, Palette } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Reorder } from 'framer-motion'
import { getSpecialties, getStackCategories, getTagOptions, getStatsConfig, TECH_SPECIALTIES, LEGAL_SPECIALTIES, DESIGN_SPECIALTIES, TECH_STACK_CATEGORIES, LEGAL_STACK_CATEGORIES, DESIGN_STACK_CATEGORIES } from '@/data/profile-constants'

import { useToast } from '@/components/ui/toast'
import { TechIcon } from '@/components/ui/TechIcon'

export function EditProfileModal({ profile, onSuccess }: { profile: any, onSuccess?: () => void }) {
    const [isOpen, setIsOpen] = useState(false)
    const [step, setStep] = useState(1)
    const [isPending, setIsPending] = useState(false)
    const router = useRouter()
    const { showToast } = useToast()

    // --- STATE MANAGEMENT ---
    const [industry, setIndustry] = useState(profile.industry || 'Tech')

    // Collapsible States
    const [showEduList, setShowEduList] = useState(true)
    const [showCertList, setShowCertList] = useState(true)
    const [showProjList, setShowProjList] = useState(true)

    // Stats State (initialize from attributes)
    const [statsValues, setStatsValues] = useState<Record<string, string>>({})

    // Specialties State (initialize from experiences type 'Specialization')
    const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])

    // Tech Stack State
    const [selectedStack, setSelectedStack] = useState<Record<string, string[]>>(() => {
        const initialStack: Record<string, string[]> = {};
        // Initialize keys dynamically from constants to ensure exact match
        [...Object.keys(TECH_STACK_CATEGORIES), ...Object.keys(LEGAL_STACK_CATEGORIES), ...Object.keys(DESIGN_STACK_CATEGORIES)].forEach(key => {
            initialStack[key] = [];
        });
        return initialStack;
    })

    // Projects State
    const [projects, setProjects] = useState<any[]>([])
    const [currentProject, setCurrentProject] = useState({
        title: '',
        client: '',
        type: 'Laboral',
        desc: '',
        solution: '',
        outcome: '',
        tags: [] as string[],
        imageFile: null as File | null, // Deprecated but kept for type safety if ref exists
        imageFiles: [] as File[], // New multiple support
        existingImageUrl: null as string | null,
        images: [] as any[], // Existing gallery images
        url: '' as string // New URL field
    })

    // Work Experience State
    const [workExperiences, setWorkExperiences] = useState<any[]>([])
    const [currentWorkExp, setCurrentWorkExp] = useState({
        company: '',
        role: '',
        period: '',
        responsibilities: '',
        achievements: '',
        logoFile: null as File | null,
        existingLogoUrl: null as string | null,
        logoUrl: '',
        evidenceFiles: [] as File[],
        existingEvidence: [] as any[],
        _id: ''
    })
    const [showWorkList, setShowWorkList] = useState(true)

    // Education State
    const [education, setEducation] = useState<any[]>([])
    const [currentEdu, setCurrentEdu] = useState({
        institution: '',
        degree: '',
        period: '',
        status: 'Completed',
        logoUrl: '',
        existingLogoUrl: null as string | null,
        imageFile: null as File | null
    })

    // Certifications State
    const [certifications, setCertifications] = useState<any[]>([])
    const [currentCert, setCurrentCert] = useState({
        title: '',
        provider: '',
        date: '',
        url: ''
    })

    // Load initial data when modal opens
    useEffect(() => {
        if (isOpen && profile) {
            setIndustry(profile.industry || 'Tech')

            // Load Specialties
            if (profile.experiences) {
                const specs = profile.experiences
                    .filter((e: any) => e.type === 'Specialization')
                    .map((e: any) => {
                        const allSpecialties = [...TECH_SPECIALTIES, ...LEGAL_SPECIALTIES, ...DESIGN_SPECIALTIES]
                        const match = allSpecialties.find(t => t.title === e.title)
                        return match ? `${match.title}|${match.description}` : null
                    })
                    .filter(Boolean)
                setSelectedSpecialties(specs)
            }

            // Load Tech Stack from SkillCategories
            if (profile.skillCategories) {
                const stackData: Record<string, any> = {};
                // Initialize keys dynamically
                [...Object.keys(TECH_STACK_CATEGORIES), ...Object.keys(LEGAL_STACK_CATEGORIES), ...Object.keys(DESIGN_STACK_CATEGORIES)].forEach(key => {
                    stackData[key] = [];
                });
                profile.skillCategories.forEach((cat: any) => {
                    if (stackData[cat.name] !== undefined) {
                        const items = cat.items.map((i: any) => i.name)
                        stackData[cat.name] = items
                    }
                })
                setSelectedStack(prev => ({ ...prev, ...stackData }))
            }

            // Load Projects
            if (profile.projects) {
                const loadedProjects = profile.projects
                    .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
                    .map((p: any) => ({
                        _id: p.id || Math.random().toString(36).substr(2, 9),
                        title: p.title,
                        client: p.client,
                        type: p.type || 'Laboral',
                        desc: p.description,
                        solution: p.solution,
                        outcome: p.outcome,
                        tags: p.tags ? p.tags.map((t: any) => t.name) : [],
                        existingImageUrl: p.imageUrl,
                        // Load existing gallery images
                        images: p.images || [], // [{url: '...'}, ...]
                        url: p.url || ''
                    }))
                setProjects(loadedProjects)
            }

            // Load Work Experiences
            if (profile.workExperiences) {
                const loadedWork = profile.workExperiences
                    .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
                    .map((w: any) => ({
                        _id: w.id || Math.random().toString(36).substr(2, 9),
                        company: w.company,
                        role: w.role,
                        period: w.period,
                        responsibilities: w.responsibilities,
                        achievements: w.achievements,
                        existingLogoUrl: w.companyLogoUrl,
                        logoUrl: w.companyLogoUrl || '', // For display
                        existingEvidence: w.images || [],
                        evidenceFiles: []
                    }))
                setWorkExperiences(loadedWork)
            }

            // Load Work Experiences
            if (profile.workExperiences) {
                const loadedWork = profile.workExperiences
                    .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
                    .map((w: any) => ({
                        _id: w.id || Math.random().toString(36).substr(2, 9),
                        company: w.company,
                        role: w.role,
                        period: w.period,
                        responsibilities: w.responsibilities,
                        achievements: w.achievements,
                        existingLogoUrl: w.companyLogoUrl,
                        logoUrl: w.companyLogoUrl || '', // For display
                        existingEvidence: w.images || [],
                        evidenceFiles: []
                    }))
                setWorkExperiences(loadedWork)
            }

            // ... (rest of loading logic) ...

            // ... (Helpers unchanged) ...


            // Load Education
            if (profile.education) {
                const loadedEducation = profile.education
                    .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
                    .map((edu: any) => ({
                        _id: edu.id || Math.random().toString(36).substr(2, 9),
                        institution: edu.institution,
                        degree: edu.degree,
                        period: edu.period,
                        status: edu.status,
                        existingLogoUrl: edu.logoUrl
                    }))
                setEducation(loadedEducation)
            }

            // Load Certifications
            if (profile.certifications) {
                const loadedCertifications = profile.certifications
                    .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
                    .map((cert: any) => ({
                        _id: cert.id || Math.random().toString(36).substr(2, 9),
                        title: cert.title,
                        provider: cert.provider,
                        date: cert.date,
                        url: cert.url
                    }))
                setCertifications(loadedCertifications)
            }

            // Load Stats
            if (profile.attributes) {
                const initialStats: Record<string, string> = {}
                profile.attributes.forEach((attr: any) => {
                    // Map stored LABEL back to stat name key
                    if (attr.label === 'RANKING') initialStats['ranking'] = attr.value
                    if (attr.label === 'EXPERIENCIA') initialStats['experience'] = attr.value
                    if (attr.label === 'LEVEL') initialStats['level'] = attr.value
                    if (attr.label === 'STACK') initialStats['stack'] = attr.value
                    if (attr.label === 'REPOS') initialStats['repos'] = attr.value

                    if (attr.label === 'CICLO') initialStats['ciclo'] = attr.value
                    if (attr.label === 'MÉRITO') initialStats['merito'] = attr.value
                    if (attr.label === 'DISPONIBILIDAD') initialStats['disponibilidad'] = attr.value
                })
                setStatsValues(initialStats)
            }
        }
    }, [isOpen, profile])

    // --- HELPERS ---
    const getSocialUrl = (platform: string) => {
        const socialLink = profile.socials?.find((link: any) => link.platform === platform)
        return socialLink ? socialLink.url : ''
    }

    const getStatValue = (statName: string) => {
        return statsValues[statName] || profile.attributes?.find((attr: any) => attr.type === 'Stat' && attr.name === statName)?.value || ''
    }

    // Helper for stack selection safety
    const isItemSelected = (category: string, item: string) => {
        try {
            if (!selectedStack) return false;
            const catList = selectedStack[category];
            if (!Array.isArray(catList)) return false;
            return catList.includes(item);
        } catch (e) {
            console.error("Error checking item selection", e);
            return false;
        }
    }

    const handleSpecialtyChange = (val: string) => {
        setSelectedSpecialties(prev =>
            prev.includes(val) ? prev.filter(s => s !== val) : [...prev, val]
        )
    }

    const toggleStackItem = (category: string, item: string) => {
        console.log('Toggling:', category, item);
        setSelectedStack(prev => {
            if (!prev) return {};
            const currentItems = prev[category] || [];
            const newItems = currentItems.includes(item)
                ? currentItems.filter(i => i !== item)
                : [...currentItems, item];

            return {
                ...prev,
                [category]: newItems
            }
        })
    }

    // Project Logic
    const handleAddProject = () => {
        if (!currentProject.title) return;
        setProjects([...projects, { ...currentProject, _id: Math.random().toString(36).substr(2, 9) }])
        setCurrentProject({
            title: '', client: '', type: 'Laboral', desc: '', solution: '', outcome: '', tags: [], imageFile: null, imageFiles: [], existingImageUrl: null, images: [], url: ''
        })
        setShowProjList(true)
    }

    const removeProject = (index: number) => {
        setProjects(projects.filter((_, i) => i !== index))
    }

    const editProject = (index: number) => {
        const projectToEdit = projects[index]
        setCurrentProject({ ...projectToEdit, imageFiles: [], imageFile: null }) // Clear new files when editing existing
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

    // Work Experience Handlers
    const handleAddWorkExp = () => {
        if (!currentWorkExp.company || !currentWorkExp.role) return
        setWorkExperiences([...workExperiences, {
            ...currentWorkExp,
            _id: currentWorkExp._id || Math.random().toString(36).substr(2, 9)
        }])
        setCurrentWorkExp({
            company: '',
            role: '',
            period: '',
            responsibilities: '',
            achievements: '',
            logoFile: null,
            existingLogoUrl: null,
            logoUrl: '',
            evidenceFiles: [],
            existingEvidence: [],
            _id: ''
        })
    }

    const editWorkExp = (idx: number) => {
        const w = workExperiences[idx]
        setCurrentWorkExp({
            ...w,
            evidenceFiles: [], // Reset new files
            logoFile: null
        })
        const newWork = [...workExperiences]
        newWork.splice(idx, 1)
        setWorkExperiences(newWork)
    }

    // Education Logic
    const handleAddEducation = () => {
        if (!currentEdu.institution || !currentEdu.degree || !currentEdu.period) return;
        setEducation([...education, { ...currentEdu, _id: Math.random().toString(36).substr(2, 9) }])
        setCurrentEdu({ institution: '', degree: '', period: '', status: 'Completed', logoUrl: '', existingLogoUrl: null, imageFile: null })
        setShowEduList(true)
    }

    const removeEducation = (index: number) => {
        setEducation(education.filter((_, i) => i !== index))
    }

    const editEducation = (index: number) => {
        const eduToEdit = education[index]
        setCurrentEdu({
            ...eduToEdit,
            logoUrl: eduToEdit.logoUrl || '',
            existingLogoUrl: eduToEdit.existingLogoUrl || eduToEdit.logoUrl || null,
            imageFile: null
        })
        removeEducation(index)
    }

    // Certifications Logic
    const handleAddCertification = () => {
        if (!currentCert.title || !currentCert.provider || !currentCert.date) return;
        setCertifications([...certifications, { ...currentCert, _id: Math.random().toString(36).substr(2, 9) }])
        setCurrentCert({ title: '', provider: '', date: '', url: '' })
        setShowCertList(true)
    }

    const removeCertification = (index: number) => {
        setCertifications(certifications.filter((_, i) => i !== index))
    }

    const editCertification = (index: number) => {
        const certToEdit = certifications[index]
        setCurrentCert(certToEdit)
        removeCertification(index)
    }

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        const maxStep = 8;
        if (step < maxStep) setStep(step + 1);
    }

    async function onSubmit(event: any) {
        event.preventDefault()
        setIsPending(true)

        // Find the form element
        let formData: FormData;
        const formElement = document.getElementById('edit-profile-form') as HTMLFormElement;

        if (formElement) {
            formData = new FormData(formElement);
        } else {
            console.error("Form element 'edit-profile-form' not found.");
            // Panic fallback: try to create empty payload but this will likely fail validation
            formData = new FormData();
        }

        // Inject Specialties manually
        formData.delete('specialties')
        selectedSpecialties.forEach(s => formData.append('specialties', s))

        // Inject Tech Stack
        formData.append('tech_stack_data', JSON.stringify(selectedStack))

        // Inject Education
        let finalEducation = [...education]
        if (currentEdu.institution) {
            finalEducation.push({ ...currentEdu, _id: 'temp_new' })
        }
        formData.append('education_data', JSON.stringify(finalEducation.map((item, idx) => ({ ...item, order: idx }))))

        // Inject Certifications
        let finalCertifications = [...certifications]
        if (currentCert.title) {
            finalCertifications.push({ ...currentCert, _id: 'temp_new' })
        }
        formData.append('certifications_data', JSON.stringify(finalCertifications.map((item, idx) => ({ ...item, order: idx }))))

        // Inject Projects
        const finalProjects = [...projects]
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
            existingImageUrl: p.existingImageUrl,
            images: p.images,
            url: p.url,
            order: index
        }))))

        // Append Project Files
        finalProjects.forEach((p, index) => {
            if (p.imageFiles && p.imageFiles.length > 0) {
                p.imageFiles.forEach((file: File) => {
                    formData.append(`project_image_${index}`, file)
                })
            } else if (p.imageFile) {
                formData.append(`project_image_${index}`, p.imageFile)
            }
        })

        // Append Education Images
        finalEducation.forEach((edu, index) => {
            if (edu.imageFile) {
                formData.append(`education_image_${index}`, edu.imageFile)
            }
        })

        // Inject Work Experience
        let finalWork = [...workExperiences]
        if (currentWorkExp.company) {
            finalWork.push({ ...currentWorkExp, _id: 'temp_new' })
        }

        const workData = finalWork.map((w, idx) => ({
            company: w.company,
            role: w.role,
            period: w.period,
            responsibilities: w.responsibilities,
            achievements: w.achievements,
            existingLogoUrl: w.existingLogoUrl,
            existingEvidence: w.images || w.existingEvidence, // specific fix for loading legacy
            order: idx
        }))
        formData.append('work_experiences_data', JSON.stringify(workData))

        // Append Work Images
        finalWork.forEach((w, idx) => {
            // Company Logo
            if (w.logoFile) {
                formData.append(`work_logo_${idx}`, w.logoFile)
            }
            // Evidence Gallery
            if (w.evidenceFiles && w.evidenceFiles.length > 0) {
                w.evidenceFiles.forEach((file: File) => {
                    formData.append(`work_evidence_${idx}`, file)
                })
            }
        })

        try {
            const res = await updateClientProfile(profile.id, formData)

            setIsPending(false)
            if (res.success) {
                setIsOpen(false)
                showToast("Profile identity updated successfully. Synchronization complete.", "success")
                router.refresh()
            } else {
                showToast(res.error || "Failed to update profile. Please try again.", "error")
            }
        } catch (error) {
            setIsPending(false)
            showToast("Critical system error during update.", "error")
        }
    }

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        if (isOpen) setMounted(true);
    }, [isOpen]);

    const handleOpen = () => {
        setIsOpen(true);
        showToast("Secure Edit Mode Initialized", "info")
    }

    if (!isOpen) {
        return (
            <button
                onClick={handleOpen}
                className="w-full py-2.5 px-4 bg-slate-900 border border-white/10 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-slate-800 transition-all font-medium group shadow-[0_4px_10px_rgba(0,0,0,0.3)]"
            >
                <Pencil size={14} className="group-hover:rotate-12 transition-transform" />
                <span>Editar Perfil</span>
            </button>
        )
    }

    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setIsOpen(false)} />

            {/* Modal Container */}
            <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-5xl animate-in fade-in zoom-in-95 duration-300 h-[85vh] flex flex-col relative z-20">

                {/* Header */}
                <div className="bg-slate-950/60 px-8 py-6 border-b border-cyan-500/20 flex justify-between items-center sticky top-0 z-30 backdrop-blur-sm rounded-t-2xl">
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                            <Pencil size={20} className="text-cyan-500" />
                            {step === 1 && 'Editar Perfil'}
                            {step === 2 && 'Métricas de Excelencia'}
                            {step === 3 && (industry === 'Tech' ? 'Especialidades Técnicas' : 'Ã reas de EspecializaciÃ³n')}
                            {step === 4 && (industry === 'Tech' ? 'Arsenal Full Stack' : 'Competencias JurÃ­dicas')}
                            {step === 5 && 'Formación'}
                            {step === 6 && (industry === 'Tech' ? 'Cursos y Certificaciones' : 'FormaciÃ³n Continua')}
                            {step === 7 && (industry === 'Tech' ? 'Portafolio de Proyectos' : 'Experiencia & Casos')}
                        </h2>
                        <p className="text-[10px] text-cyan-500 font-mono uppercase tracking-[0.2em] mt-1 opacity-70">Configuration // Phase.{step < 10 ? `0${step}` : step} // Mode.Update</p>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
                        <X size={24} />
                    </button>
                </div>

                {/* MAIN CONTENT - FLEXIBLE HEIGHT */}
                <div className="flex-1 w-full overflow-y-auto px-10 py-8 custom-scrollbar bg-grid-pattern-subtle min-h-0">
                    <form id="edit-profile-form" className="space-y-10">


                        {/* STEP 1: BASIC INFO */}
                        <div className={step === 1 ? 'block space-y-8' : 'hidden'}>
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

                            <div className="space-y-4 text-slate-200">
                                <div className="grid grid-cols-2 gap-6">
                                    <div><label className="block text-xs font-bold text-cyan-500/60 uppercase tracking-widest mb-2">Nombre</label><input name="firstName" defaultValue={profile.firstName} placeholder="Ej: Unlocking" className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl outline-none focus:border-cyan-500 transition-all text-white placeholder:text-slate-600 text-sm" /></div>
                                    <div><label className="block text-xs font-bold text-cyan-500/60 uppercase tracking-widest mb-2">Apellido</label><input name="lastName" defaultValue={profile.lastName} placeholder="Ej: Digital Resilience" className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl outline-none focus:border-cyan-500 transition-all text-white placeholder:text-slate-600 text-sm" /></div>
                                </div>
                                <div><label className="block text-xs font-bold text-cyan-500/60 uppercase tracking-widest mb-2">Full Name</label><input name="name" defaultValue={profile.name} className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl outline-none focus:border-cyan-500 transition-all text-white placeholder:text-slate-600 text-sm" /></div>
                                <div><label className="block text-xs font-bold text-cyan-500/60 uppercase tracking-widest mb-2">Headline</label><input name="headline" defaultValue={profile.headline} className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl outline-none focus:border-cyan-500 transition-all text-white placeholder:text-slate-600 text-sm" /></div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div><label className="block text-xs font-bold text-cyan-500/60 uppercase tracking-widest mb-2">Email</label><input name="email" defaultValue={profile.email} className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl outline-none focus:border-cyan-500 transition-all text-white placeholder:text-slate-600 text-sm" /></div>
                                    <div><label className="block text-xs font-bold text-cyan-500/60 uppercase tracking-widest mb-2">Phone</label><input name="phone" defaultValue={profile.phone} className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl outline-none focus:border-cyan-500 transition-all text-white placeholder:text-slate-600 text-sm" /></div>
                                </div>
                                <div><label className="block text-xs font-bold text-cyan-500/60 uppercase tracking-widest mb-2">Location</label><input name="location" defaultValue={profile.location} className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl outline-none focus:border-cyan-500 transition-all text-white placeholder:text-slate-600 text-sm" /></div>
                                <div><label className="block text-xs font-bold text-cyan-500/60 uppercase tracking-widest mb-2">Bio</label><textarea name="bio" defaultValue={profile.bio} rows={4} className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl outline-none focus:border-cyan-500 transition-all resize-none text-white placeholder:text-slate-600 text-sm" /></div>
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
                                        <input name="social_linkedin" defaultValue={getSocialUrl('LinkedIn')} className="w-full px-4 py-2 bg-slate-950/50 border border-white/10 rounded-lg text-xs outline-none focus:border-cyan-500 text-white placeholder:text-slate-700" placeholder="https://linkedin.com/in/..." />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-bold text-cyan-500/40 uppercase tracking-widest">GitHub</label>
                                        <input name="social_github" defaultValue={getSocialUrl('GitHub')} className="w-full px-4 py-2 bg-slate-950/50 border border-white/10 rounded-lg text-xs outline-none focus:border-cyan-500 text-white placeholder:text-slate-700" placeholder="https://github.com/..." />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-bold text-cyan-500/40 uppercase tracking-widest">YouTube</label>
                                        <input name="social_youtube" defaultValue={getSocialUrl('YouTube')} className="w-full px-4 py-2 bg-slate-950/50 border border-white/10 rounded-lg text-xs outline-none focus:border-cyan-500 text-white placeholder:text-slate-700" placeholder="https://youtube.com/@..." />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-bold text-cyan-500/40 uppercase tracking-widest">Email (Social)</label>
                                        <input name="social_email" defaultValue={getSocialUrl('Email')} className="w-full px-4 py-2 bg-slate-950/50 border border-white/10 rounded-lg text-xs outline-none focus:border-cyan-500 text-white placeholder:text-slate-700" placeholder="ejemplo@correo.com" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-bold text-cyan-500/40 uppercase tracking-widest">TikTok</label>
                                        <input name="social_tiktok" defaultValue={getSocialUrl('TikTok')} className="w-full px-4 py-2 bg-slate-950/50 border border-white/10 rounded-lg text-xs outline-none focus:border-cyan-500 text-white placeholder:text-slate-700" placeholder="https://tiktok.com/@..." />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* STEP 2: STATS */}
                        <div className={step === 2 ? 'block space-y-6' : 'hidden'}>
                            <div className="grid grid-cols-2 gap-4">
                                {getStatsConfig(industry).map((stat) => (
                                    <div key={stat.name}>
                                        <label className="block text-xs font-bold text-cyan-500/60 uppercase tracking-widest mb-2">{stat.label}</label>
                                        <input
                                            name={`stat_${stat.name}`}
                                            defaultValue={getStatValue(stat.name)}
                                            className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl outline-none focus:border-cyan-500 transition-all text-white placeholder:text-slate-600 text-sm"
                                            placeholder={stat.placeholder}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* STEP 3: SPECIALTIES */}
                        <div className={step === 3 ? 'block' : 'hidden'}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {getSpecialties(industry).map((spec) => {
                                    const Icon = spec.icon
                                    const val = `${spec.title}|${spec.description}`
                                    const isChecked = selectedSpecialties.includes(val)
                                    return (
                                        <label key={spec.id} className="cursor-pointer relative group">
                                            <input
                                                type="checkbox"
                                                name="specialties_control"
                                                value={val}
                                                className="peer sr-only"
                                                checked={isChecked}
                                                onChange={() => handleSpecialtyChange(val)}
                                            />
                                            <div className={`h-full border rounded-lg p-4 transition-all ${isChecked ? 'bg-cyan-900 border-cyan-500 text-white' : 'border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/10'}`}>
                                                <div className="flex items-start gap-3">
                                                    <div className={`p-2 rounded ${isChecked ? 'bg-cyan-500 text-black' : 'bg-slate-100 text-slate-600'}`}>
                                                        <Icon size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-sm mb-1">{spec.title}</div>
                                                        <div className="text-xs opacity-70 leading-relaxed">{spec.description}</div>
                                                    </div>
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
                                        <h4 className="text-sm font-bold text-slate-200 uppercase tracking-widest border-l-4 border-cyan-500 pl-3 mb-4">{catName}</h4>
                                        <div className="space-y-2">
                                            {items.map(item => {
                                                const isSelected = isItemSelected(catName, item);
                                                return (
                                                    <label key={item} className="flex items-center gap-3 cursor-pointer group">
                                                        <div className={`w-5 h-5 rounded border border-slate-300 flex items-center justify-center transition-colors ${isSelected ? 'bg-cyan-500 border-cyan-500' : 'bg-slate-900 border-white/20 group-hover:border-cyan-400'}`}>
                                                            {isSelected && <CheckCircle2 size={14} className="text-white" />}
                                                        </div>
                                                        <input
                                                            type="checkbox"
                                                            className="sr-only"
                                                            checked={isSelected}
                                                            onChange={() => toggleStackItem(catName, item)}
                                                        />
                                                        {industry === 'Tech' && <TechIcon name={item} className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />}
                                                        <span className={`text-sm ${isSelected ? 'text-slate-200 font-medium' : 'text-slate-400 group-hover:text-slate-200'}`}>{item}</span>
                                                    </label>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* STEP 5: EDUCATION */}
                        <div className={step === 5 ? 'block space-y-6' : 'hidden'}>
                            {education.length > 0 ? (
                                <div className="space-y-3 mb-6">
                                    <div
                                        className="flex items-center justify-between cursor-pointer group"
                                        onClick={() => setShowEduList(!showEduList)}
                                    >
                                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Added Records ({education.length})</h4>
                                        {showEduList ? <ChevronUp size={16} className="text-cyan-500" /> : <ChevronDown size={16} className="text-cyan-500" />}
                                    </div>

                                    {showEduList && (
                                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
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
                                                            <button type="button" onClick={() => editEducation(idx)} className="text-slate-500 hover:text-cyan-400 p-2 hover:bg-white/5 rounded-lg transition-all" title="Editar">
                                                                <Pencil size={16} />
                                                            </button>
                                                            <button type="button" onClick={() => removeEducation(idx)} className="text-slate-500 hover:text-red-400 p-2 hover:bg-white/5 rounded-lg transition-all" title="Eliminar">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </Reorder.Item>
                                                ))}
                                            </Reorder.Group>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-slate-950/20 rounded-2xl border border-dashed border-white/10 mb-6">
                                    <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">No matching records found in local stack.</p>
                                </div>
                            )}

                            <div className="bg-slate-950/40 border border-white/10 rounded-2xl p-6 space-y-4">
                                <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                                    <GraduationCap size={18} className="text-cyan-500" />
                                    {education.length > 0 ? 'Agregar otra formaciÃ³n' : 'Registrar educaciÃ³n'}
                                </h3>

                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-cyan-500/60 uppercase tracking-widest mb-1">InstituciÃ³n <span className="text-red-500">*</span></label>
                                        <input
                                            value={currentEdu.institution}
                                            onChange={(e) => setCurrentEdu({ ...currentEdu, institution: e.target.value })}
                                            className={`w-full px-4 py-3 bg-slate-950/50 border rounded-xl outline-none text-sm text-white placeholder:text-slate-700 focus:border-cyan-500 transition-all ${!currentEdu.institution && isPending ? 'border-red-500/50 bg-red-500/5' : 'border-white/10'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-cyan-500/60 uppercase tracking-widest mb-1">TÃ­tulo/Grado <span className="text-red-500">*</span></label>
                                        <input
                                            value={currentEdu.degree}
                                            onChange={(e) => setCurrentEdu({ ...currentEdu, degree: e.target.value })}
                                            className={`w-full px-4 py-3 bg-slate-950/50 border rounded-xl outline-none text-sm text-white placeholder:text-slate-700 focus:border-cyan-500 transition-all ${!currentEdu.degree && isPending ? 'border-red-500/50 bg-red-500/5' : 'border-white/10'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-cyan-500/60 uppercase tracking-widest mb-1">PerÃ­odo (Ej: 2010-2014) <span className="text-red-500">*</span></label>
                                        <input
                                            value={currentEdu.period}
                                            onChange={(e) => setCurrentEdu({ ...currentEdu, period: e.target.value })}
                                            className={`w-full px-4 py-3 bg-slate-950/50 border rounded-xl outline-none text-sm text-white placeholder:text-slate-700 focus:border-cyan-500 transition-all ${!currentEdu.period && isPending ? 'border-red-500/50 bg-red-500/5' : 'border-white/10'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-cyan-500/60 uppercase tracking-widest mb-1">Logotipo (Opcional)</label>
                                        <div className="flex items-center gap-4">
                                            {currentEdu.existingLogoUrl && !currentEdu.imageFile && (
                                                <div className="w-12 h-12 relative rounded-lg overflow-hidden border border-white/10">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={currentEdu.existingLogoUrl} alt="Logo" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    if (e.target.files?.[0]) {
                                                        setCurrentEdu({ ...currentEdu, imageFile: e.target.files[0] })
                                                    }
                                                }}
                                                className="block w-full text-xs text-slate-400
                                                    file:mr-4 file:py-2 file:px-4
                                                    file:rounded-full file:border-0
                                                    file:text-xs file:font-semibold
                                                    file:bg-cyan-500/10 file:text-cyan-500
                                                    hover:file:bg-cyan-500/20"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-cyan-500/60 uppercase tracking-widest mb-1">Estado</label>
                                        <select
                                            value={currentEdu.status}
                                            onChange={(e) => setCurrentEdu({ ...currentEdu, status: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl outline-none text-sm text-white focus:border-cyan-500 transition-all"
                                        >
                                            <option value="Completed">Completado</option>
                                            <option value="In Progress">En Curso</option>
                                            <option value="Dropped Out">Abandonado</option>
                                        </select>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddEducation}
                                        className="w-full py-3 px-4 bg-cyan-600 text-white rounded-xl flex items-center justify-center gap-2 hover:bg-cyan-700 transition-all font-medium"
                                    >
                                        <Plus size={16} />
                                        <span>Agregar EducaciÃ³n</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* STEP 6: CERTIFICATIONS */}
                        <div className={step === 6 ? 'block space-y-6' : 'hidden'}>
                            {certifications.length > 0 ? (
                                <div className="space-y-3 mb-6">
                                    <div
                                        className="flex items-center justify-between cursor-pointer group"
                                        onClick={() => setShowCertList(!showCertList)}
                                    >
                                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Added Records ({certifications.length})</h4>
                                        {showCertList ? <ChevronUp size={16} className="text-cyan-500" /> : <ChevronDown size={16} className="text-cyan-500" />}
                                    </div>

                                    {showCertList && (
                                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
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
                                                            <button type="button" onClick={() => editCertification(idx)} className="text-slate-500 hover:text-cyan-400 p-2 hover:bg-white/5 rounded-lg transition-all" title="Editar">
                                                                <Pencil size={16} />
                                                            </button>
                                                            <button type="button" onClick={() => removeCertification(idx)} className="text-slate-500 hover:text-red-400 p-2 hover:bg-white/5 rounded-lg transition-all" title="Eliminar">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </Reorder.Item>
                                                ))}
                                            </Reorder.Group>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-slate-950/20 rounded-2xl border border-dashed border-white/10 mb-6">
                                    <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">No matching records found in local stack.</p>
                                </div>
                            )}

                            <div className="bg-slate-950/40 border border-white/10 rounded-2xl p-6 space-y-4">
                                <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                                    <Award size={18} className="text-cyan-500" />
                                    {certifications.length > 0 ? 'Agregar otra certificaciÃ³n' : 'Registrar certificaciÃ³n'}
                                </h3>

                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-cyan-500/60 uppercase tracking-widest mb-1">TÃ­tulo <span className="text-red-500">*</span></label>
                                        <input
                                            value={currentCert.title}
                                            onChange={(e) => setCurrentCert({ ...currentCert, title: e.target.value })}
                                            className={`w-full px-4 py-3 bg-slate-950/50 border rounded-xl outline-none text-sm text-white placeholder:text-slate-700 focus:border-cyan-500 transition-all ${!currentCert.title && isPending ? 'border-red-500/50 bg-red-500/5' : 'border-white/10'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-cyan-500/60 uppercase tracking-widest mb-1">Proveedor <span className="text-red-500">*</span></label>
                                        <input
                                            value={currentCert.provider}
                                            onChange={(e) => setCurrentCert({ ...currentCert, provider: e.target.value })}
                                            className={`w-full px-4 py-3 bg-slate-950/50 border rounded-xl outline-none text-sm text-white placeholder:text-slate-700 focus:border-cyan-500 transition-all ${!currentCert.provider && isPending ? 'border-red-500/50 bg-red-500/5' : 'border-white/10'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-cyan-500/60 uppercase tracking-widest mb-1">Fecha (Ej: Enero 2023) <span className="text-red-500">*</span></label>
                                        <input
                                            value={currentCert.date}
                                            onChange={(e) => setCurrentCert({ ...currentCert, date: e.target.value })}
                                            className={`w-full px-4 py-3 bg-slate-950/50 border rounded-xl outline-none text-sm text-white placeholder:text-slate-700 focus:border-cyan-500 transition-all ${!currentCert.date && isPending ? 'border-red-500/50 bg-red-500/5' : 'border-white/10'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-cyan-500/60 uppercase tracking-widest mb-1">URL (Opcional)</label>
                                        <input
                                            value={currentCert.url}
                                            onChange={(e) => setCurrentCert({ ...currentCert, url: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl outline-none text-sm text-white placeholder:text-slate-700 focus:border-cyan-500 transition-all"
                                            placeholder="https://..."
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddCertification}
                                        className="w-full py-3 px-4 bg-cyan-600 text-white rounded-xl flex items-center justify-center gap-2 hover:bg-cyan-700 transition-all font-medium"
                                    >
                                        <Plus size={16} />
                                        <span>Agregar CertificaciÃ³n</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* STEP 7: PROJECT LIST RENDER */}
                        <div className={step === 7 ? 'block space-y-6' : 'hidden'}>
                            {projects.length > 0 && (
                                <div className="space-y-3 mb-6">
                                    <div
                                        className="flex items-center justify-between cursor-pointer group"
                                        onClick={() => setShowProjList(!showProjList)}
                                    >
                                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">{industry === 'Tech' ? 'Active Operations' : 'Casos & Experiencia'} ({projects.length})</h4>
                                        {showProjList ? <ChevronUp size={16} className="text-cyan-500" /> : <ChevronDown size={16} className="text-cyan-500" />}
                                    </div>

                                    {showProjList && (
                                        <div className="max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
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
                                                            <button type="button" onClick={() => editProject(idx)} className="text-slate-500 hover:text-cyan-400 p-2 hover:bg-white/5 rounded-lg transition-all">
                                                                <Pencil size={16} />
                                                            </button>
                                                            <button type="button" onClick={() => removeProject(idx)} className="text-slate-500 hover:text-red-400 p-2 hover:bg-white/5 rounded-lg transition-all">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </Reorder.Item>
                                                ))}
                                            </Reorder.Group>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="bg-slate-950/40 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-8 relative overflow-hidden group/modal">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover/modal:bg-cyan-500/10 transition-colors" />

                                <h3 className="font-bold text-white mb-2 flex items-center gap-3 relative z-10">
                                    <Plus size={20} className="text-cyan-500" />
                                    <span className="tracking-tight">{industry === 'Tech' ? 'Add / Synchronize Project' : 'Agregar Caso / Experiencia'}</span>
                                </h3>

                                <div className="space-y-6 relative z-10">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-bold text-cyan-500/40 uppercase tracking-[0.2em] ml-1">{industry === 'Tech' ? 'Domain' : 'Tipo'}</label>
                                            <select
                                                className="w-full px-4 py-3 bg-slate-950/80 border border-white/10 rounded-xl outline-none text-sm text-white focus:border-cyan-500 transition-all cursor-pointer"
                                                value={currentProject.type}
                                                onChange={(e) => setCurrentProject({ ...currentProject, type: e.target.value })}
                                            >
                                                <option value="Laboral">{industry === 'Tech' ? 'Corporate Info' : 'Firma / Estudio'}</option>
                                                <option value="Personal">{industry === 'Tech' ? 'Personal Project' : 'Independiente'}</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-bold text-cyan-500/40 uppercase tracking-[0.2em] ml-1">{industry === 'Tech' ? 'Identity' : 'Caso / Proyecto'}</label>
                                            <input
                                                value={currentProject.title}
                                                onChange={(e) => setCurrentProject({ ...currentProject, title: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-950/80 border border-white/10 rounded-xl outline-none text-sm text-white placeholder:text-slate-700 focus:border-cyan-500 transition-all"
                                                placeholder={industry === 'Tech' ? "Project Title" : "Ej: Defensa Corporativa"}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-bold text-cyan-500/40 uppercase tracking-[0.2em] ml-1">{industry === 'Tech' ? 'Challenge Matrix' : 'Contexto del Caso'}</label>
                                        <textarea value={currentProject.desc} onChange={(e) => setCurrentProject({ ...currentProject, desc: e.target.value })} rows={2} className="w-full px-4 py-3 bg-slate-950/80 border border-white/10 rounded-xl outline-none resize-none text-sm text-white placeholder:text-slate-700 focus:border-cyan-500 transition-all font-light" placeholder={industry === 'Tech' ? "Describe the mission challenge..." : "Describa el conflicto o requerimiento legal..."} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-bold text-cyan-500/40 uppercase tracking-[0.2em] ml-1">{industry === 'Tech' ? 'Engineered Solution' : 'Estrategia Legal'}</label>
                                            <textarea value={currentProject.solution} onChange={(e) => setCurrentProject({ ...currentProject, solution: e.target.value })} rows={2} className="w-full px-4 py-3 bg-slate-950/80 border border-white/10 rounded-xl outline-none resize-none text-sm text-white placeholder:text-slate-700 focus:border-cyan-500 transition-all font-light" placeholder={industry === 'Tech' ? "Core architecture details..." : "ArgumentaciÃ³n y acciones tomadas..."} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-bold text-cyan-500/40 uppercase tracking-[0.2em] ml-1">{industry === 'Tech' ? 'Calculated Outcome' : 'Resultado / Sentencia'}</label>
                                            <textarea value={currentProject.outcome} onChange={(e) => setCurrentProject({ ...currentProject, outcome: e.target.value })} rows={2} className="w-full px-4 py-3 bg-slate-950/80 border border-white/10 rounded-xl outline-none resize-none text-sm text-white placeholder:text-slate-700 focus:border-cyan-500 transition-all font-light" placeholder={industry === 'Tech' ? "Impact and results..." : "Fallo, acuerdo, etc..."} />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-bold text-cyan-500/40 uppercase tracking-[0.2em] ml-1">{industry === 'Tech' ? 'Live Endpoint (Optional)' : 'Referencia / Link (Opcional)'}</label>
                                        <input value={currentProject.url} onChange={(e) => setCurrentProject({ ...currentProject, url: e.target.value })} className="w-full px-4 py-3 bg-slate-950/80 border border-white/10 rounded-xl outline-none text-sm text-white placeholder:text-slate-700 focus:border-cyan-500 transition-all" placeholder="https://..." />
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
                                                    {industry === 'Tech' && <TechIcon name={tech} className="w-3 h-3 text-slate-500 group-hover/item:text-cyan-400" />}
                                                    <span className={`text-[11px] uppercase tracking-tighter ${currentProject.tags.includes(tech) ? 'text-white font-bold' : 'text-slate-500 group-hover/item:text-slate-300'}`}>{tech}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="border border-white/10 border-dashed rounded-2xl p-6 text-center cursor-pointer relative hover:bg-white/5 hover:border-cyan-500/30 transition-all group/upload">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files.length > 0) {
                                                    const files = Array.from(e.target.files)
                                                    setCurrentProject({ ...currentProject, imageFiles: files })
                                                }
                                            }}
                                        />
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="p-3 bg-white/5 rounded-full group-hover/upload:scale-110 transition-transform">
                                                <ImageIcon size={24} className="text-slate-500 group-hover:text-cyan-400" />
                                            </div>
                                            {currentProject.imageFiles && currentProject.imageFiles.length > 0 ? (
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs text-cyan-400 font-mono flex items-center justify-center gap-2">
                                                        <CheckCircle2 size={14} /> {currentProject.imageFiles.length} file(s) selected
                                                    </span>
                                                    <div className="flex gap-1 flex-wrap justify-center mt-1">
                                                        {currentProject.imageFiles.map((f, i) => (
                                                            <span key={i} className="text-[10px] text-slate-500 bg-black/20 px-1 rounded truncate max-w-[100px]">{f.name}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-1">
                                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Upload Visual Evidence</p>
                                                    <p className="text-[10px] text-slate-500 font-mono">PNG, JPG up to 10MB (Multiple allowed)</p>
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



                        {/* STEP 8: Experience */}
                        <div className={step === 8 ? 'block' : 'hidden'}>


                            <div className="grid lg:grid-cols-2 gap-12">
                                {/* LEFT: List */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Career History</h3>
                                        <button type="button" onClick={() => setShowWorkList(!showWorkList)} className="text-slate-500 hover:text-white transition-colors">
                                            {showWorkList ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                        </button>
                                    </div>

                                    {showWorkList && (
                                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                            {workExperiences.length === 0 && (
                                                <div className="p-8 border border-white/5 border-dashed rounded-xl text-center text-slate-600 font-mono text-xs uppercase tracking-widest">
                                                    No career records found.
                                                </div>
                                            )}
                                            <Reorder.Group axis="y" values={workExperiences} onReorder={setWorkExperiences}>
                                                {workExperiences.map((work, idx) => (
                                                    <Reorder.Item key={work._id || idx} value={work}>
                                                        <div className="group p-4 bg-slate-900 border border-white/5 rounded-xl hover:border-cyan-500/30 transition-all flex items-start gap-4 mb-3">
                                                            <div className="cursor-grab text-slate-600 hover:text-slate-400 mt-1"><GripVertical size={16} /></div>
                                                            <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center shrink-0 overflow-hidden">
                                                                {(work.logoUrl || work.existingLogoUrl) ? (
                                                                    <img src={work.logoUrl || work.existingLogoUrl} alt="Logo" className="w-full h-full object-contain" />
                                                                ) : (
                                                                    <Briefcase className="text-slate-500" size={20} />
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-bold text-white truncate">{work.company}</h4>
                                                                <p className="text-xs text-cyan-400 font-mono mb-1">{work.role}</p>
                                                                <p className="text-[10px] text-slate-500">{work.period}</p>
                                                            </div>
                                                            <div className="flex flex-col gap-2">
                                                                <button type="button" onClick={() => editWorkExp(idx)} className="p-2 text-slate-500 hover:text-cyan-400 hover:bg-cyan-950/30 rounded-lg transition-all"><Pencil size={14} /></button>
                                                                <button type="button" onClick={() => {
                                                                    const newWork = [...workExperiences]
                                                                    newWork.splice(idx, 1)
                                                                    setWorkExperiences(newWork)
                                                                }} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-all"><Trash2 size={14} /></button>
                                                            </div>
                                                        </div>
                                                    </Reorder.Item>
                                                ))}
                                            </Reorder.Group>
                                        </div>
                                    )}
                                </div>

                                {/* RIGHT: Form */}
                                <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/10 space-y-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">Company *</label>
                                            <input
                                                type="text"
                                                value={currentWorkExp.company}
                                                onChange={(e) => setCurrentWorkExp({ ...currentWorkExp, company: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all font-bold placeholder:text-slate-700 font-mono"
                                                placeholder="LowCodeTool"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">Job Title *</label>
                                            <input
                                                type="text"
                                                value={currentWorkExp.role}
                                                onChange={(e) => setCurrentWorkExp({ ...currentWorkExp, role: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-700"
                                                placeholder="Senior Developer"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">Period *</label>
                                        <input
                                            type="text"
                                            value={currentWorkExp.period}
                                            onChange={(e) => setCurrentWorkExp({ ...currentWorkExp, period: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-700 font-mono"
                                            placeholder="2025 - Present"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">Responsibilities</label>
                                        <textarea
                                            rows={3}
                                            value={currentWorkExp.responsibilities}
                                            onChange={(e) => setCurrentWorkExp({ ...currentWorkExp, responsibilities: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-700 resize-none"
                                            placeholder="Describe your key responsibilities..."
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">Key Achievements</label>
                                        <textarea
                                            rows={3}
                                            value={currentWorkExp.achievements}
                                            onChange={(e) => setCurrentWorkExp({ ...currentWorkExp, achievements: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-700 resize-none"
                                            placeholder="- Increased performance by 20%&#10;- Led a team of 5 developers"
                                        />
                                    </div>

                                    {/* Logo Upload */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">Company Logo</label>
                                        <div className="flex items-center gap-4 p-3 bg-black/40 border border-white/10 rounded-lg">
                                            <div className="w-12 h-12 rounded bg-white/5 flex items-center justify-center overflow-hidden border border-white/10">
                                                {(currentWorkExp.logoUrl || currentWorkExp.existingLogoUrl) ? (
                                                    <img src={currentWorkExp.logoUrl || currentWorkExp.existingLogoUrl || ''} className="w-full h-full object-contain" />
                                                ) : <ImageIcon size={20} className="text-slate-600" />}
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-cyan-950 file:text-cyan-400 hover:file:bg-cyan-900 cursor-pointer"
                                                onChange={(e) => {
                                                    if (e.target.files && e.target.files[0]) {
                                                        const file = e.target.files[0]
                                                        setCurrentWorkExp({
                                                            ...currentWorkExp,
                                                            logoFile: file,
                                                            logoUrl: URL.createObjectURL(file)
                                                        })
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Gallery Upload */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">Work Evidence / Projects</label>
                                        <div className="border border-white/10 border-dashed rounded-xl p-4 text-center cursor-pointer relative hover:bg-white/5 transition-all group/upload">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                                onChange={(e) => {
                                                    if (e.target.files && e.target.files.length > 0) {
                                                        setCurrentWorkExp({ ...currentWorkExp, evidenceFiles: Array.from(e.target.files) })
                                                    }
                                                }}
                                            />
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="p-2 bg-white/5 rounded-full">
                                                    <ImageIcon size={18} className="text-slate-500 group-hover:text-cyan-400" />
                                                </div>
                                                {currentWorkExp.evidenceFiles.length > 0 ? (
                                                    <span className="text-xs text-cyan-400 font-mono">{currentWorkExp.evidenceFiles.length} file(s) selected</span>
                                                ) : (
                                                    <span className="text-[10px] text-slate-500">Upload evidence (Multiple)</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <button type="button" onClick={handleAddWorkExp} className="w-full py-4 bg-cyan-950/50 border border-cyan-500/30 text-cyan-400 font-bold uppercase tracking-widest rounded-xl hover:bg-cyan-500 hover:text-black transition-all">
                                        + Add Experience
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="shrink-0 pt-6 pb-6 px-10 flex justify-between gap-4 border-t border-cyan-500/20 bg-slate-950 z-40 rounded-b-2xl mt-auto">
                    {step > 1 ? (
                        <button type="button" onClick={() => setStep(step - 1)} className="px-6 py-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg font-medium transition-all">Anterior</button>
                    ) : (
                        <button type="button" onClick={() => setIsOpen(false)} className="px-6 py-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg font-medium transition-all">Cancelar</button>
                    )}

                    {step === 8 ? (
                        <button type="button" onClick={onSubmit} disabled={isPending} className="bg-cyan-500 text-black px-10 py-2.5 rounded-lg font-bold hover:bg-cyan-400 disabled:opacity-50 ml-auto shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all">
                            {isPending ? 'ACTUALIZANDO...' : 'ACTUALIZAR'}
                        </button>
                    ) : (
                        <button type="button" onClick={handleNext} className="bg-white text-black px-10 py-2.5 rounded-lg font-bold hover:bg-slate-200 ml-auto transition-all">
                            Siguiente
                        </button>
                    )}
                </div>
            </div>
        </div >,
        document.body
    )
}

