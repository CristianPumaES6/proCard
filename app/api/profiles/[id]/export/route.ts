import { NextRequest, NextResponse } from 'next/server';
import { getProfileById } from '@/lib/actions';
import { auth } from '@/lib/auth';
import path from 'path';
import fs from 'fs/promises';

const MIME_BY_EXT: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
};

/**
 * GET /api/profiles/[id]/export
 * Exporta el currículum completo como JSON portable:
 *   { version, exportedAt, profile, _assets }
 * donde _assets embebe cada imagen de /uploads como data-URI base64,
 * para que el archivo se pueda importar en otra instancia con todo incluido.
 */
export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;

    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await getProfileById(params.id);
    if (!profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    if (profile.userId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden: you can only export your own profiles' }, { status: 403 });
    }

    // 1. Recolectar todas las URLs de imágenes locales (/uploads/...)
    const urls = new Set<string>();
    const collect = (url?: string | null) => {
        if (url && url.startsWith('/uploads/')) urls.add(url);
    };

    profile.projects?.forEach((p: any) => {
        collect(p.imageUrl);
        p.images?.forEach((img: any) => collect(img.url));
    });
    profile.education?.forEach((e: any) => collect(e.logoUrl));
    profile.workExperiences?.forEach((w: any) => {
        collect(w.companyLogoUrl);
        w.images?.forEach((img: any) => collect(img.url));
    });

    // 2. Leer cada archivo y embeberlo como data-URI base64
    const assets: Record<string, string> = {};
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    for (const url of urls) {
        try {
            const filename = path.basename(url); // evita path traversal
            const filePath = path.join(uploadDir, filename);
            const buffer = await fs.readFile(filePath);
            const ext = path.extname(filename).toLowerCase();
            const mime = MIME_BY_EXT[ext] || 'application/octet-stream';
            assets[url] = `data:${mime};base64,${buffer.toString('base64')}`;
        } catch {
            // El archivo ya no existe en disco: se exporta sin ese asset.
            console.warn(`Export: asset not found on disk, skipping: ${url}`);
        }
    }

    const payload = {
        version: 2,
        exportedAt: new Date().toISOString(),
        profile,
        _assets: assets,
    };

    const filename = `${profile.slug || profile.id}-procard.json`;
    return new NextResponse(JSON.stringify(payload, null, 2), {
        headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Cache-Control': 'no-store',
        },
    });
}
