require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const adminName = process.env.ADMIN_NAME || "Cristian Puma";
    const adminEmail = process.env.ADMIN_EMAIL || "cristian.puma.es6@gmail.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "AdminPassword123!";

    console.log("==========================================");
    console.log(" [ProCard] Configuración de Usuario Admin");
    console.log("==========================================");
    console.log(`Email objetivo: ${adminEmail}`);
    console.log(`Nombre:         ${adminName}`);

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const existingUser = await prisma.user.findUnique({
        where: { email: adminEmail }
    });

    let adminUserId = "";

    if (existingUser) {
        const updated = await prisma.user.update({
            where: { email: adminEmail },
            data: {
                name: adminName,
                password: hashedPassword
            }
        });
        adminUserId = updated.id;
        console.log(`✓ Usuario admin actualizado exitosamente (ID: ${updated.id})`);
    } else {
        const created = await prisma.user.create({
            data: {
                name: adminName,
                email: adminEmail,
                password: hashedPassword
            }
        });
        adminUserId = created.id;
        console.log(`✓ Nuevo usuario admin creado exitosamente (ID: ${created.id})`);
    }

    // Vincular perfiles con el mismo email o slug al usuario admin si no coinciden
    const profiles = await prisma.profile.findMany({
        where: {
            OR: [
                { email: adminEmail },
                { slug: "cristian-puma" }
            ]
        }
    });

    for (const p of profiles) {
        if (p.userId !== adminUserId) {
            await prisma.profile.update({
                where: { id: p.id },
                data: { userId: adminUserId }
            });
            console.log(`✓ Perfil "${p.name}" (${p.slug}) vinculado al usuario admin.`);
        }
    }

    console.log("==========================================");
    console.log("Credenciales activas:");
    console.log(`- Email:    ${adminEmail}`);
    console.log(`- Password: ${adminPassword}`);
    console.log("==========================================");
}

main()
    .catch((e) => {
        console.error("Error al configurar usuario admin:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
