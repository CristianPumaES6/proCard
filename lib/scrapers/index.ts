import { JobResult, JobSearchResponse, JobSource } from "./types";
import { searchLinkedIn } from "./linkedin";
import { searchComputrabajo } from "./computrabajo";
import { searchBumeran } from "./bumeran";

type Adapter = (query: string, page: number) => Promise<JobResult[]>;

const ADAPTERS: { source: JobSource; fn: Adapter }[] = [
    { source: "LinkedIn", fn: searchLinkedIn },
    { source: "Computrabajo", fn: searchComputrabajo },
    { source: "Bumeran", fn: searchBumeran },
];

const LOCATION = "Perú";

// Caché en memoria para no golpear las fuentes en cada tecleo/reintento.
const cache = new Map<string, { at: number; data: JobSearchResponse }>();
const TTL_MS = 1000 * 60 * 10; // 10 minutos
const MAX_PER_SOURCE = 15;

/** Intercala arrays para que la lista final alterne entre fuentes. */
function interleave(lists: JobResult[][]): JobResult[] {
    const out: JobResult[] = [];
    const max = Math.max(0, ...lists.map((l) => l.length));
    for (let i = 0; i < max; i++) {
        for (const list of lists) {
            if (i < list.length) out.push(list[i]);
        }
    }
    return out;
}

function dedupe(results: JobResult[]): JobResult[] {
    const seen = new Set<string>();
    return results.filter((r) => {
        const key = `${r.source}::${(r.title || "").toLowerCase()}::${(r.company || "").toLowerCase()}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

export async function searchAllJobs(rawQuery: string, page = 0): Promise<JobSearchResponse> {
    const query = rawQuery.trim();
    const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 0;
    const cacheKey = `${query.toLowerCase()}|${safePage}`;

    const hit = cache.get(cacheKey);
    if (hit && Date.now() - hit.at < TTL_MS) {
        return { ...hit.data, cached: true };
    }

    const settled = await Promise.allSettled(ADAPTERS.map((a) => a.fn(query, safePage)));

    const perSource: JobResult[][] = [];
    const sources = ADAPTERS.map((a, i) => {
        const res = settled[i];
        if (res.status === "fulfilled") {
            const list = (res.value || []).slice(0, MAX_PER_SOURCE);
            perSource.push(list);
            return { source: a.source, count: list.length, ok: true };
        }
        perSource.push([]);
        const reason = res.reason;
        return {
            source: a.source,
            count: 0,
            ok: false,
            error: reason instanceof Error ? reason.message : String(reason),
        };
    });

    const results = dedupe(interleave(perSource));
    const hasMore = perSource.some((l) => l.length >= 5); // alguna fuente aún trae bastante

    const data: JobSearchResponse = {
        query,
        location: LOCATION,
        page: safePage,
        hasMore,
        results,
        sources,
        cached: false,
    };

    // Solo cachear si hubo algún resultado (evita fijar un fallo transitorio).
    if (results.length > 0) cache.set(cacheKey, { at: Date.now(), data });

    return data;
}
