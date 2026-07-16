import { NextResponse } from "next/server";
import { searchAllJobs } from "@/lib/scrapers";
import { db } from "@/lib/db";

// El scraping usa APIs de Node (fetch/AbortController) y no debe cachearse.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();
    const page = parseInt(searchParams.get("page") || "0", 10) || 0;

    if (q.length < 2) {
        return NextResponse.json(
            { query: q, location: "Perú", page, hasMore: false, results: [], sources: [], cached: false, error: "Escribe al menos 2 caracteres." },
            { status: 400 }
        );
    }

    // Registrar solo la primera página de cada búsqueda (no bloqueante).
    if (page === 0) {
        try {
            await db.searchLog.create({ data: { query: q } });
        } catch (e) {
            console.warn("[jobs/search] no se pudo registrar SearchLog:", e);
        }
    }

    try {
        const data = await searchAllJobs(q, page);
        return NextResponse.json(data);
    } catch (error) {
        console.error("[jobs/search] error:", error);
        return NextResponse.json(
            { query: q, location: "Perú", page, hasMore: false, results: [], sources: [], cached: false, error: String(error) },
            { status: 500 }
        );
    }
}
