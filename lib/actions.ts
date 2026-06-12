'use server'

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { auth } from '@/lib/auth'; // Import auth to get session

// Utility import specific for server actions
import { slugify } from '@/lib/utils';



export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn('credentials', formData);
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}

export async function registerUser(prevState: any, formData: FormData) {
    const rawData = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const parsed = z
        .object({
            name: z.string().min(2),
            email: z.string().email(),
            password: z.string().min(6)
        })
        .safeParse(rawData);

    if (!parsed.success) {
        return { message: 'Invalid data. Please check your inputs.' };
    }

    const { name, email, password } = parsed.data;

    try {
        const existingUser = await db.user.findUnique({ where: { email } });
        if (existingUser) {
            return { message: 'User already exists with this email.' };
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });
    } catch (error) {
        console.error('Registration error:', error);
        return { message: 'Database Error: Failed to Create User.' };
    }

    // Attempt to log the user in immediately after registration? Or redirect to login.
    // For simplicity, let's redirect to login for now (or handling auto-login via signIn might be tricky in pure server action without redirect loop if not careful)
    // Actually, calling signIn here would work.
    try {
        await signIn('credentials', formData);
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return { message: 'Registration successful but auto-login failed.' };
                default:
                    return { message: 'Something went wrong.' };
            }
        }
        throw error;
    }
}


export async function getShowcaseProfiles() {
    try {
        const profiles = await db.profile.findMany({
            include: {
                attributes: true,
                socials: true,
                experiences: true,
                projects: {
                    include: {
                        tags: true,
                        images: true
                    },
                    orderBy: { order: 'asc' }
                },
                skillCategories: {
                    include: { items: true }
                },
                education: {
                    orderBy: { order: 'asc' }
                },
                certifications: {
                    orderBy: { order: 'asc' }
                },
                workExperiences: {
                    include: { images: true },
                    orderBy: { order: 'asc' }
                }
            }
        })
        return profiles
    } catch (error) {
        console.error("Failed to fetch profiles:", error)
        return []
    }
}

export async function getProfileById(identifier: string) {
    try {
        const profile = await db.profile.findFirst({
            where: {
                OR: [
                    { id: identifier },
                    { slug: identifier }
                ]
            },
            include: {
                attributes: true,
                socials: true,
                experiences: {
                    include: { highlights: true }
                },
                projects: {
                    include: {
                        tags: true,
                        images: true
                    },
                    orderBy: { order: 'asc' }
                },
                skillCategories: {
                    include: { items: true }
                },
                education: {
                    orderBy: { order: 'asc' }
                },
                certifications: {
                    orderBy: { order: 'asc' }
                },
                workExperiences: {
                    include: { images: true },
                    orderBy: { order: 'asc' }
                }
            }
        })
        return profile
    } catch (error) {
        console.error("Failed to fetch profile:", error)
        return null
    }
}

export async function createProfile(formData: FormData) {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
        throw new Error('Unauthorized');
    }
    const userId = session.user.id; // Get userId from session

    const rawData = {
        name: formData.get('name') as string,
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        industry: formData.get('industry') as string,
        headline: formData.get('headline') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        location: formData.get('location') as string,
        bio: formData.get('bio') as string,
    }

    try {
        // Extract Specialties (Step 3)
        const specialties = formData.getAll('specialties') as string[]

        // Extract Tech Stack (Step 4)
        const techStackJson = formData.get('tech_stack_data') as string
        const techStackData = techStackJson ? JSON.parse(techStackJson) : {}

        const skillCategoriesCreate = Object.entries(techStackData).map(([category, items]: [string, any]) => {
            // items is string[]
            if (!items || items.length === 0) return null
            return {
                name: category,
                items: {
                    create: items.map((itemName: string) => ({ name: itemName }))
                }
            }
        }).filter(Boolean) as any[]

        // Extract Dynamic Stats (Step 2)
        const stats: any[] = []

        // Helper to push if exists
        const pushStat = (key: string, label: string) => {
            const value = formData.get(key) as string
            if (value) stats.push({ label, value })
        }

        if (rawData.industry === 'Tech') {
            pushStat('stat_ranking', 'RANKING')
            pushStat('stat_experience', 'EXPERIENCIA')
            pushStat('stat_level', 'LEVEL')
            pushStat('stat_stack', 'STACK')
            pushStat('stat_repos', 'REPOS')
        } else if (rawData.industry === 'Design') {
            pushStat('stat_experience', 'EXPERIENCIA')
            pushStat('stat_proyectos', 'PROYECTOS')
            pushStat('stat_clientes', 'CLIENTES')
            pushStat('stat_especialidad', 'ESPECIALIDAD')
        } else {
            pushStat('stat_ciclo', 'CICLO')
            pushStat('stat_merito', 'MÉRITO')
            pushStat('stat_disponibilidad', 'DISPONIBILIDAD')
        }

        // Extract Social Links
        const socialLinks: any[] = []
        const extractSocial = (platform: string, iconName: string) => {
            const url = formData.get(`social_${platform.toLowerCase()}`) as string
            if (url) {
                socialLinks.push({ platform, url, iconName })
            }
        }
        extractSocial('LinkedIn', 'Linkedin')
        extractSocial('GitHub', 'Github')
        extractSocial('YouTube', 'Youtube')
        extractSocial('Email', 'Mail')
        extractSocial('TikTok', 'Tiktok')

        // Prepare experiences (create Specialization items)
        const experienceCreates = specialties.map(spec => {
            const [title, desc] = spec.split('|');
            return {
                title: title,
                organization: 'Core Competency',
                period: 'Continuous',
                type: 'Specialization',
                highlights: {
                    create: [{ text: desc }]
                }
            }
        })

        // Handles Multiple Projects
        const projectsJson = formData.get('projects_data') as string
        const projectsData = projectsJson ? JSON.parse(projectsJson) : []
        const projectsCreate = []

        for (let i = 0; i < projectsData.length; i++) {
            const p = projectsData[i]
            let mainImageUrl: string | null = null
            const projectImagesCreate = []

            // Check for uploaded files (multiple)
            const projectFiles = formData.getAll(`project_image_${i}`) as File[]

            for (const file of projectFiles) {
                if (file && file.size > 0 && file.name !== 'undefined') {
                    const bytes = await file.arrayBuffer()
                    const buffer = Buffer.from(bytes)
                    const uploadDir = join(process.cwd(), 'public', 'uploads')
                    await mkdir(uploadDir, { recursive: true })
                    const filename = `${Date.now()}-${i}-${Math.random().toString(36).substring(7)}-${file.name.replace(/\s/g, '_')}`
                    const filepath = join(uploadDir, filename)
                    await writeFile(filepath, buffer)
                    const url = `/uploads/${filename}`

                    projectImagesCreate.push({ url })
                    if (!mainImageUrl) mainImageUrl = url // First one is cover
                }
            }

            projectsCreate.push({
                title: p.title,
                client: p.client || (p.type === 'Personal' ? 'Personal Project' : 'Confidential'),
                type: p.type || 'Laboral',
                description: p.desc || 'No challenge provided.',
                solution: p.solution || 'No solution details.',
                outcome: p.outcome || 'Successful deployment.',
                imageUrl: mainImageUrl, // Fallback cover
                url: p.url || '',
                highlight: true,
                order: p.order || 0,
                tags: {
                    create: p.tags ? p.tags.map((tag: string) => ({ name: tag })) : []
                },
                images: {
                    create: projectImagesCreate
                }
            })
        }

        // Handle Education (New)
        const educationJson = formData.get('education_data') as string
        const educationData = educationJson ? JSON.parse(educationJson) : []
        const educationCreate = educationData.map((edu: any) => ({
            institution: edu.institution,
            degree: edu.degree,
            period: edu.period,
            status: edu.status || 'Completed',
            order: edu.order || 0 // Save Order
        }))

        await db.profile.create({
            data: {
                ...rawData,
                slug: slugify(rawData.name),
                userId: userId, // Link to user
                attributes: {
                    create: stats
                },
                experiences: {
                    create: experienceCreates
                },
                projects: {
                    create: projectsCreate
                },
                skillCategories: {
                    create: skillCategoriesCreate
                },
                education: {
                    create: educationCreate
                },
                certifications: {
                    create: (function () {
                        const certsJson = formData.get('certifications_data') as string;
                        const certsData = certsJson ? JSON.parse(certsJson) : [];
                        return certsData.map((c: any) => ({
                            title: c.title,
                            provider: c.provider,
                            date: c.date,
                            url: c.url || '',
                            order: c.order || 0 // Save Order
                        }));
                    })()
                },
                socials: {
                    create: socialLinks
                }
            }
        })
        revalidatePath('/showcase')
        return { success: true }
    } catch (e) {
        console.error(e)
        return { success: false }
    }
}

// ... updateProfile changes below

export async function updateProfile(id: string, formData: FormData) {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
        throw new Error('Unauthorized');
    }

    // Verify ownership
    const existingProfile = await db.profile.findUnique({ where: { id } });
    if (!existingProfile || existingProfile.userId !== session.user.id) {
        throw new Error('Forbidden: You can only edit your own profile.');
    }

    const rawData = {
        name: formData.get('name') as string,
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        industry: formData.get('industry') as string,
        headline: formData.get('headline') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        location: formData.get('location') as string,
        bio: formData.get('bio') as string,
    }

    try {
        await db.$transaction(async (tx: any) => {
            // 1. Update Basic Info
            await tx.profile.update({
                where: { id },
                data: {
                    ...rawData
                }
            })

            // 2. Update Attributes (Stats)
            await tx.attribute.deleteMany({ where: { profileId: id } })

            const stats: any[] = []
            const pushStat = (key: string, label: string) => {
                const value = formData.get(key) as string
                if (value) stats.push({ label, value, profileId: id })
            }

            // Update Socials
            await tx.social.deleteMany({ where: { profileId: id } })
            const socialLinks: any[] = []
            const extractSocial = (platform: string, iconName: string) => {
                const url = formData.get(`social_${platform.toLowerCase()}`) as string
                if (url) {
                    socialLinks.push({ platform, url, iconName, profileId: id })
                }
            }
            extractSocial('LinkedIn', 'Linkedin')
            extractSocial('GitHub', 'Github')
            extractSocial('YouTube', 'Youtube')
            extractSocial('Email', 'Mail')
            extractSocial('TikTok', 'Tiktok')

            if (socialLinks.length > 0) {
                await tx.social.createMany({ data: socialLinks })
            }

            if (rawData.industry === 'Tech') {
                pushStat('stat_ranking', 'RANKING')
                pushStat('stat_experience', 'EXPERIENCIA')
                pushStat('stat_level', 'LEVEL')
                pushStat('stat_stack', 'STACK')
                pushStat('stat_repos', 'REPOS')
            } else if (rawData.industry === 'Design') {
                pushStat('stat_experience', 'EXPERIENCIA')
                pushStat('stat_proyectos', 'PROYECTOS')
                pushStat('stat_clientes', 'CLIENTES')
                pushStat('stat_especialidad', 'ESPECIALIDAD')
            } else {
                pushStat('stat_ciclo', 'CICLO')
                pushStat('stat_merito', 'MÉRITO')
                pushStat('stat_disponibilidad', 'DISPONIBILIDAD')
            }

            if (stats.length > 0) {
                await tx.attribute.createMany({ data: stats })
            }

            // 3. Update Specialties
            await tx.experience.deleteMany({
                where: {
                    profileId: id,
                    type: 'Specialization'
                }
            })

            const specialties = formData.getAll('specialties') as string[]
            for (const spec of specialties) {
                const [title, desc] = spec.split('|')
                await tx.experience.create({
                    data: {
                        profileId: id,
                        title,
                        organization: 'Core Competency',
                        period: 'Continuous',
                        type: 'Specialization',
                        highlights: {
                            create: [{ text: desc }]
                        }
                    }
                })
            }

            // 4. Update Tech Stack
            await tx.skillCategory.deleteMany({ where: { profileId: id } }) // Cascade deletes items

            const techStackJson = formData.get('tech_stack_data') as string
            const techStackData = techStackJson ? JSON.parse(techStackJson) : {}

            const skillCategoriesCreate = Object.entries(techStackData).map(([category, items]: [string, any]) => {
                if (!items || items.length === 0) return null
                return {
                    profileId: id,
                    name: category,
                    items: {
                        create: items.map((itemName: string) => ({ name: itemName }))
                    }
                }
            }).filter(Boolean) as any[]

            for (const cat of skillCategoriesCreate) {
                await tx.skillCategory.create({
                    data: cat
                })
            }

            // 5. Update Projects
            await tx.project.deleteMany({ where: { profileId: id } })

            const projectsJson = formData.get('projects_data') as string
            const projectsData = projectsJson ? JSON.parse(projectsJson) : []

            for (let i = 0; i < projectsData.length; i++) {
                const p = projectsData[i]
                let imageUrl = p.existingImageUrl // Start with existing

                // Collect all images (Existing + New)
                const allImagesToCreate = []

                // A. Keep existing images (passed back from frontend)
                if (p.images && Array.isArray(p.images)) {
                    p.images.forEach((img: any) => {
                        allImagesToCreate.push({ url: img.url })
                    })
                }

                // B. Process NEW uploaded files (Multiple)
                const newFiles = formData.getAll(`project_image_${i}`) as File[]
                let newCoverUrl: string | null = null

                for (const file of newFiles) {
                    if (file && file.size > 0 && file.name !== 'undefined') {
                        const bytes = await file.arrayBuffer()
                        const buffer = Buffer.from(bytes)
                        const uploadDir = join(process.cwd(), 'public', 'uploads')
                        await mkdir(uploadDir, { recursive: true })
                        const filename = `${Date.now()}-${i}-${Math.random().toString(36).substring(7)}-${file.name.replace(/\s/g, '_')}`
                        const filepath = join(uploadDir, filename)
                        await writeFile(filepath, buffer)
                        const url = `/uploads/${filename}`

                        allImagesToCreate.push({ url })
                        if (!newCoverUrl) newCoverUrl = url // Pick first new one as potential cover
                    }
                }

                // Determine final cover image (New > Existing > Fallback)
                if (newCoverUrl) {
                    imageUrl = newCoverUrl
                }

                await tx.project.create({
                    data: {
                        profileId: id,
                        title: p.title,
                        client: p.client || (p.type === 'Personal' ? 'Personal Project' : 'Confidential'),
                        type: p.type || 'Laboral',
                        description: p.desc || 'No challenge provided.',
                        solution: p.solution || 'No solution details.',
                        outcome: p.outcome || 'Successful deployment.',
                        imageUrl: imageUrl,
                        url: p.url || '',
                        highlight: true,
                        order: p.order || 0, // Save order
                        tags: {
                            create: p.tags ? p.tags.map((tag: string) => ({ name: tag })) : []
                        },
                        images: {
                            create: allImagesToCreate
                        }
                    }
                })
            }

            // 6. Update Education (New)
            await tx.education.deleteMany({ where: { profileId: id } })
            const educationJson = formData.get('education_data') as string
            const educationData = educationJson ? JSON.parse(educationJson) : []

            const educationCreate = []
            for (let i = 0; i < educationData.length; i++) {
                const edu = educationData[i]
                let logoUrl = edu.existingLogoUrl // Start with existing

                // Check for NEW uploaded file
                const eduImage = formData.get(`education_image_${i}`) as File | null

                if (eduImage && eduImage.size > 0 && eduImage.name !== 'undefined') {
                    const bytes = await eduImage.arrayBuffer()
                    const buffer = Buffer.from(bytes)
                    const uploadDir = join(process.cwd(), 'public', 'uploads')
                    await mkdir(uploadDir, { recursive: true })
                    const filename = `${Date.now()}-edu-${i}-${eduImage.name.replace(/\s/g, '_')}`
                    const filepath = join(uploadDir, filename)
                    await writeFile(filepath, buffer)
                    logoUrl = `/uploads/${filename}`
                }

                educationCreate.push({
                    profileId: id,
                    institution: edu.institution,
                    degree: edu.degree,
                    period: edu.period,
                    status: edu.status || 'Completed',
                    logoUrl: logoUrl,
                    order: edu.order || 0
                })
            }

            if (educationCreate.length > 0) {
                await tx.education.createMany({ data: educationCreate })
            }

            // 7. Update Certifications (New)
            await tx.certification.deleteMany({ where: { profileId: id } })
            const certificationsJson = formData.get('certifications_data') as string
            const certificationsData = certificationsJson ? JSON.parse(certificationsJson) : []
            const certificationsCreate = certificationsData.map((cert: any) => ({
                profileId: id,
                title: cert.title,
                provider: cert.provider,
                date: cert.date,
                url: cert.url || '',
                order: cert.order || 0 // Save order
            }))

            if (certificationsCreate.length > 0) {
                await tx.certification.createMany({ data: certificationsCreate })
            }

            // 8. Update Work Experiences (New)
            await tx.workExperience.deleteMany({ where: { profileId: id } })

            const workJson = formData.get('work_experiences_data') as string
            const workData = workJson ? JSON.parse(workJson) : []

            for (let i = 0; i < workData.length; i++) {
                const w = workData[i]
                let logoUrl = w.existingLogoUrl

                // Handle Logo Upload
                const logoFile = formData.get(`work_logo_${i}`) as File | null
                if (logoFile && logoFile.size > 0 && logoFile.name !== 'undefined') {
                    const bytes = await logoFile.arrayBuffer()
                    const buffer = Buffer.from(bytes)
                    const uploadDir = join(process.cwd(), 'public', 'uploads')
                    await mkdir(uploadDir, { recursive: true })
                    const filename = `${Date.now()}-work-logo-${i}-${logoFile.name.replace(/\\s/g, '_')}`
                    const filepath = join(uploadDir, filename)
                    await writeFile(filepath, buffer)
                    logoUrl = `/uploads/${filename}`
                }

                // Handle Evidence Images
                const evidenceCreate = []
                // A. Existing
                if (w.existingEvidence && Array.isArray(w.existingEvidence)) {
                    w.existingEvidence.forEach((img: any) => evidenceCreate.push({ url: img.url }))
                }
                // B. New Files
                const newEvidenceFiles = formData.getAll(`work_evidence_${i}`) as File[]
                for (const file of newEvidenceFiles) {
                    if (file && file.size > 0 && file.name !== 'undefined') {
                        const bytes = await file.arrayBuffer()
                        const buffer = Buffer.from(bytes)
                        const uploadDir = join(process.cwd(), 'public', 'uploads')
                        await mkdir(uploadDir, { recursive: true })
                        const filename = `${Date.now()}-work-evidence-${i}-${Math.random().toString(36).substring(7)}-${file.name.replace(/\\s/g, '_')}`
                        const filepath = join(uploadDir, filename)
                        await writeFile(filepath, buffer)
                        evidenceCreate.push({ url: `/uploads/${filename}` })
                    }
                }

                await tx.workExperience.create({
                    data: {
                        profileId: id,
                        company: w.company,
                        role: w.role,
                        period: w.period,
                        responsibilities: w.responsibilities,
                        achievements: w.achievements,
                        companyLogoUrl: logoUrl,
                        order: w.order || 0,
                        images: {
                            create: evidenceCreate
                        }
                    }
                })
            }
        })

        revalidatePath('/showcase')
        return { success: true }
    } catch (e) {
        console.error(e)
        return { success: false }
    }
}

/**
 * Devuelve todos los currículums del usuario logueado (multi-CV).
 * Permite tener, por ejemplo, un CV como especialista Frontend y otro Backend.
 */
export async function getMyProfiles() {
    const session = await auth();
    if (!session?.user?.id) return [];

    try {
        return await db.profile.findMany({
            where: { userId: session.user.id },
            include: {
                attributes: true,
                socials: true,
                experiences: { include: { highlights: true } },
                projects: { include: { tags: true, images: true }, orderBy: { order: 'asc' } },
                skillCategories: { include: { items: true } },
                education: { orderBy: { order: 'asc' } },
                certifications: { orderBy: { order: 'asc' } },
                workExperiences: { include: { images: true }, orderBy: { order: 'asc' } }
            }
        });
    } catch (error) {
        console.error("Failed to fetch my profiles:", error);
        return [];
    }
}

export async function deleteProfile(id: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        const profile = await db.profile.findUnique({ where: { id } });
        if (!profile) return { success: false, error: 'Profile not found' };
        if (profile.userId !== session.user.id) {
            return { success: false, error: 'Forbidden: You can only delete your own profiles.' };
        }

        // Las relaciones se eliminan en cascada (onDelete: Cascade en el schema)
        await db.profile.delete({ where: { id } });
        revalidatePath('/showcase');
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error("Delete profile error:", error);
        return { success: false, error: 'Database error while deleting profile.' };
    }
}

export async function saveSearchQuery(query: string) {
    if (!query.trim()) return;
    try {
        await db.searchLog.create({
            data: {
                query: query
            }
        })
    } catch (e) {
        console.error("Failed to save search log:", e)
    }
}

/**
 * Restaura los assets embebidos (base64) de un export JSON al disco
 * y devuelve un mapa { urlOriginal -> urlNueva } para re-vincular imágenes.
 * Formato esperado: data._assets = { "/uploads/foo.png": "data:image/png;base64,..." }
 */
async function restoreEmbeddedAssets(assets: Record<string, string> | undefined): Promise<Map<string, string>> {
    const urlMap = new Map<string, string>();
    if (!assets || typeof assets !== 'object') return urlMap;

    const uploadDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    for (const [originalUrl, dataUri] of Object.entries(assets)) {
        try {
            if (typeof dataUri !== 'string') continue;
            const match = /^data:([a-zA-Z0-9/+.-]+);base64,(.+)$/.exec(dataUri);
            if (!match) continue;

            const buffer = Buffer.from(match[2], 'base64');
            // Conservar la extensión original; nombre nuevo para evitar colisiones
            const originalName = originalUrl.split('/').pop() || 'asset';
            const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
            const filename = `${Date.now()}-import-${Math.random().toString(36).substring(7)}-${safeName}`;
            await writeFile(join(uploadDir, filename), buffer);
            urlMap.set(originalUrl, `/uploads/${filename}`);
        } catch (e) {
            console.error(`Failed to restore asset ${originalUrl}:`, e);
        }
    }
    return urlMap;
}

export async function importProfile(jsonContent: string) {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
        return { success: false, error: 'Unauthorized: Please login to import profiles.' }
    }

    try {
        console.log("Importing profile, content length:", jsonContent?.length);
        const parsed = JSON.parse(jsonContent);
        // Soportar tanto el formato nuevo { profile, _assets } como el JSON plano del perfil
        const data = parsed.profile || parsed;
        const assets: Record<string, string> | undefined = parsed._assets || data._assets;
        console.log("Parsed data keys:", Object.keys(data));

        // Basic validation with specific error messages
        if (!data.name) return { success: false, error: 'Invalid Structure: Missing field "name".' };
        if (!data.email) return { success: false, error: 'Invalid Structure: Missing field "email".' };
        if (!data.industry) return { success: false, error: 'Invalid Structure: Missing field "industry".' };

        // Restaurar imágenes embebidas y preparar el re-mapeo de URLs
        const urlMap = await restoreEmbeddedAssets(assets);
        const remap = (url: string | null | undefined): string | null =>
            url ? (urlMap.get(url) || url) : null;

        // Clean up data for Prisma creation
        // We remove IDs to create new records
        // We remove userId to assign to current user
        const {
            id, userId, createdAt, updatedAt, slug, _assets,
            attributes, socials, experiences, projects, skillCategories, education, certifications, workExperiences,
            ...primitiveFields
        } = data;

        // Generate a new slug just in case (unique constraint)
        let newSlug = data.slug || slugify(data.name);
        const existingSlug = await db.profile.findUnique({ where: { slug: newSlug } });
        if (existingSlug) {
            newSlug = `${newSlug}-${Date.now()}`;
        }

        console.log("Creating profile with slug:", newSlug);

        await db.profile.create({
            data: {
                ...primitiveFields,
                slug: newSlug,
                userId: session.user.id,
                attributes: {
                    create: attributes?.map((x: any) => ({ label: x.label, value: x.value })) || []
                },
                socials: {
                    create: socials?.map((x: any) => ({ platform: x.platform, url: x.url, iconName: x.iconName })) || []
                },
                experiences: {
                    create: experiences?.map((x: any) => ({
                        title: x.title,
                        organization: x.organization,
                        period: x.period,
                        type: x.type,
                        highlights: {
                            create: x.highlights?.map((h: any) => ({ text: h.text })) || []
                        }
                    })) || []
                },
                projects: {
                    create: projects?.map((x: any) => ({
                        title: x.title,
                        client: x.client,
                        type: x.type,
                        description: x.description,
                        solution: x.solution,
                        outcome: x.outcome,
                        imageUrl: remap(x.imageUrl),
                        url: x.url,
                        highlight: x.highlight,
                        order: x.order || 0,
                        tags: {
                            create: x.tags?.map((t: any) => ({ name: t.name })) || []
                        },
                        images: {
                            create: x.images?.map((img: any) => ({ url: remap(img.url) })) || []
                        }
                    })) || []
                },
                skillCategories: {
                    create: skillCategories?.map((x: any) => ({
                        name: x.name,
                        items: {
                            create: x.items?.map((i: any) => ({ name: i.name })) || []
                        }
                    })) || []
                },
                education: {
                    create: education?.map((x: any) => ({
                        institution: x.institution,
                        degree: x.degree,
                        period: x.period,
                        status: x.status,
                        logoUrl: remap(x.logoUrl),
                        order: x.order || 0
                    })) || []
                },
                certifications: {
                    create: certifications?.map((x: any) => ({
                        title: x.title,
                        provider: x.provider,
                        date: x.date,
                        url: x.url,
                        order: x.order || 0
                    })) || []
                },
                workExperiences: {
                    create: workExperiences?.map((x: any) => ({
                        company: x.company,
                        role: x.role,
                        period: x.period,
                        responsibilities: x.responsibilities,
                        achievements: x.achievements,
                        companyLogoUrl: remap(x.companyLogoUrl),
                        order: x.order || 0,
                        images: {
                            create: x.images?.map((img: any) => ({ url: remap(img.url) })) || []
                        }
                    })) || []
                }
            }
        });


        revalidatePath('/showcase');
        return { success: true };

    } catch (error) {
        console.error("Import error:", error);
        return { success: false, error: 'Failed to import profile. Invalid JSON or database error.' };
    }
}
