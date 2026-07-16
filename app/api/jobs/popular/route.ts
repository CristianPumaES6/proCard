import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Devuelve las búsquedas de empleo más frecuentes registradas en SearchLog. */
export async function GET() {
    try {
        const rows = await db.searchLog.groupBy({
            by: ["query"],
            _count: { query: true },
            orderBy: { _count: { query: "desc" } },
            take: 8,
        });

        const popular = rows
            .map((r) => ({ query: r.query, count: r._count.query }))
            .filter((r) => r.query && r.query.trim().length >= 2);

        return NextResponse.json({ popular });
    } catch (error) {
        console.warn("[jobs/popular] error:", error);
        return NextResponse.json({ popular: [] });
    }
}
