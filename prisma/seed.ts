import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding data...')
    console.log('DB URL:', process.env.DATABASE_URL)

    // Clean existing data
    await prisma.profile.deleteMany()
    await prisma.user.deleteMany()

    const adminName = process.env.ADMIN_NAME || "Cristian Puma";
    const adminEmail = process.env.ADMIN_EMAIL || "cristian.puma.es6@gmail.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "AdminPassword123!";

    // --- CRISTIAN PUMA / ADMIN (TECH) ---
    const userCristian = await prisma.user.create({
        data: {
            name: adminName,
            email: adminEmail,
            password: await import('bcryptjs').then(bcrypt => bcrypt.hash(adminPassword, 10))
        }
    })

    const cristian = await prisma.profile.create({
        data: {
            userId: userCristian.id,
            slug: "cristian-puma",
            industry: "Tech",
            name: adminName === "Cristian Puma" ? "Cristian Angel Puma Villalva" : adminName,
            headline: "Desarrollador OutSystems & Full Stack",
            location: "Lima, Perú",
            bio: "Desarrollador con más de 7 años de experiencia en arquitectura, integraciones API/REST, optimización de bases de datos y desarrollo web/móvil.",
            email: adminEmail,
            phone: "+51 976 873 362",
            goal: "Aspirante a OutSystems MVP",
            attributes: {
                create: [
                    { label: "Ranking", value: "#339" },
                    { label: "Experiencia", value: "+7 Años" }
                ]
            },
            socials: {
                create: [
                    { platform: "LinkedIn", url: "https://www.linkedin.com/in/cpv01/", iconName: "Linkedin" },
                    { platform: "GitHub", url: "https://github.com/cristianPumaEs6", iconName: "Github" },
                    { platform: "YouTube", url: "https://www.youtube.com/@cristianPumaEs6", iconName: "Youtube" },
                    { platform: "Email", url: `mailto:${adminEmail}`, iconName: "Mail" }
                ]
            },
            experiences: {
                create: [
                    {
                        title: "Outsystems Developer / Scrum Master",
                        organization: "Consultor Independiente",
                        period: "2020 - Actualidad",
                        type: "Job",
                        highlights: {
                            create: [
                                { text: "Desarrollo de soluciones escalables web/móviles con OutSystems." },
                                { text: "Liderazgo técnico como Scrum Master." },
                                { text: "Integración de sistemas corporativos mediante APIs REST/SOAP." }
                            ]
                        }
                    },
                    {
                        title: "Information Manager",
                        organization: "LowCodeTool",
                        period: "2020 - Julio 2025",
                        type: "Job",
                        highlights: {
                            create: [
                                { text: "Análisis de mantenimiento y creación de KPIs en Power BI." },
                                { text: "Migración de la plataforma de control de consumo." },
                                { text: "Depuración de +100k códigos IMPA." }
                            ]
                        }
                    }
                ]
            },
            skillCategories: {
                create: [
                    {
                        name: "Backend & Arquitectura",
                        items: {
                            create: [
                                { name: "Node.js" }, { name: "NestJS" }, { name: "OutSystems" }
                            ]
                        }
                    },
                    {
                        name: "Frontend & Diseño",
                        items: {
                            create: [
                                { name: "Next.js" }, { name: "Tailwind" }, { name: "React" }
                            ]
                        }
                    }
                ]
            },
            projects: {
                create: [
                    {
                        title: "Plataforma de Control de Combustible",
                        description: "Gestión ineficiente de consumo de combustible en flota marítima.",
                        outcome: "Optimización operativa y reducción de pérdidas.",
                        solution: "Migración completa a plataforma digital.",
                        highlight: true,
                        tags: {
                            create: [{ name: "OutSystems" }, { name: "Power BI" }, { name: "SQL Server" }]
                        }
                    }
                ]
            },
            education: {
                create: [
                    {
                        institution: "UMA - Universidad María Auxiliadora",
                        degree: "Ingeniería de Inteligencia Artificial",
                        period: "2024 - Actualidad",
                        status: "En curso"
                    }
                ]
            }
        }
    })

    // --- NAYELI CABALLA (LEGAL) ---
    const userNayeli = await prisma.user.create({
        data: {
            name: "Nayeli Caballa",
            email: "CABALLAARIANA4@GMAIL.COM",
            // Password optional
        }
    })

    const nayeli = await prisma.profile.create({
        data: {
            userId: userNayeli.id,
            slug: "nayeli-caballa",
            industry: "Legal",
            name: "Nayeli Ariana Caballa Rejas",
            headline: "Estudiante de Derecho",
            location: "Santa Anita, Lima",
            bio: "Estudiante de Derecho en la USMP perteneciente al tercio superior. Proactiva y responsable con experiencia en labores administrativas y legales.",
            email: "CABALLAARIANA4@GMAIL.COM",
            phone: "901 267 796",
            attributes: {
                create: [
                    { label: "Ciclo", value: "Noveno" },
                    { label: "Mérito", value: "Tercio Superior" },
                    { label: "Disponibilidad", value: "Inmediata" }
                ]
            },
            education: {
                create: [
                    {
                        institution: "Universidad San Martin de Porres",
                        degree: "Derecho",
                        period: "2020 - Actualidad",
                        status: "En curso"
                    }
                ]
            },
            experiences: {
                create: [
                    {
                        title: "Asistente del Área de SUCAMEC",
                        organization: "Guardia Civil Company",
                        period: "Feb 2025 - Jul 2025",
                        type: "Job",
                        highlights: {
                            create: [
                                { text: "Elaboración de expedientes para licencias de armas de fuego." },
                                { text: "Redacción de oficios e impulsos a entidades públicas." }
                            ]
                        }
                    },
                    {
                        title: "Prácticas Ad Honorem",
                        organization: "Poder Judicial Sede Lima Este",
                        period: "Dato no especificado",
                        type: "Practice",
                        highlights: {
                            create: [
                                { text: "Foliación y organización de expedientes judiciales." },
                                { text: "Asistencia virtual a audiencias orales." }
                            ]
                        }
                    }
                ]
            },
            skillCategories: {
                create: [
                    {
                        name: "Informáticas",
                        items: { create: [{ name: "MS Word Avanzado" }, { name: "Excel" }] }
                    },
                    {
                        name: "Blandas",
                        items: { create: [{ name: "Análisis jurídico" }, { name: "Comunicación efectiva" }] }
                    }
                ]
            },
            // Legal projects could be added here if defined in UNIFIED_PROFILE_SCHEMA or inferred
        }
    })

    console.log({ cristian, nayeli })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
