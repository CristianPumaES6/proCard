import { JobResult } from "./types";
import { clean, truncate, fetchWithRetry } from "./html";

/**
 * Bumeran Perú (plataforma Navent, SPA React — SITE_ID=BMPE).
 * El HTML de la SPA NO contiene datos de avisos (sin __NEXT_DATA__, sin JSON-LD),
 * así que la ÚNICA vía viable es su API JSON interna, verificada en vivo:
 *   POST /api/avisos/searchV2?page=0&pageSize=20   (preferida)
 *   POST /api/avisos/searchNormalizado?...         (fallback, ruta legacy)
 * Cloudflare bloquea rutas equivocadas (p.ej. la antigua searchNormal).
 */
const ORIGIN = "https://www.bumeran.com.pe";

const HEADERS = {
    "Content-Type": "application/json",
    Accept: "application/json, text/plain, */*",
    "x-site-id": "BMPE",
    Origin: ORIGIN,
    Referer: `${ORIGIN}/empleos.html`,
};

// slug equivalente a su formatNameToStringId (para armar la URL pública).
function slug(s: string): string {
    return (s || "")
        .toLowerCase()
        .trim()
        .replace(/\//g, " ")
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[!#$%&'‘()*+,/:;=?@[\]]/g, "")
        .replace(/\s+/g, " ")
        .replace(/\s/g, "-")
        .replace(/-+/g, "-")
        .replace(/(?![\x00-\x7F])./g, "");
}

function buildJobUrl(item: any): string {
    const id = item?.id ?? item?.idAviso;
    if (!id) return `${ORIGIN}/empleos.html`;
    const titleSlug = slug(item?.titulo || "");
    const companySlug = item?.confidencial ? "" : "-" + slug(item?.empresa || "");
    return `${ORIGIN}/empleos/${titleSlug}${companySlug}-${id}.html`;
}

function mapItems(items: any[]): JobResult[] {
    return items
        .map((item) => ({
            source: "Bumeran" as const,
            title: clean(item?.titulo || ""),
            company: clean(item?.empresa || (item?.confidencial ? "Confidencial" : "")),
            location: clean(item?.localizacion || ""),
            description: truncate(clean(item?.detalle || "")),
            url: buildJobUrl(item),
            postedAt: item?.fechaPublicacion || undefined,
            employmentType: item?.tipoTrabajo ? clean(item.tipoTrabajo) : undefined,
            modality: item?.modalidadTrabajo ? clean(item.modalidadTrabajo) : undefined,
        }))
        .filter((j) => j.title && j.url);
}

async function callApi(path: string, body: Record<string, unknown>): Promise<JobResult[]> {
    const res = await fetchWithRetry(`${ORIGIN}${path}`, {
        method: "POST",
        timeoutMs: 8000,
        headers: HEADERS,
        body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Bumeran HTTP ${res.status}`);
    const json: any = await res.json();
    const items: any[] = json?.content || json?.avisos || [];
    if (!Array.isArray(items)) throw new Error("Bumeran: forma de respuesta inesperada");
    return mapItems(items);
}

export async function searchBumeran(query: string, page = 0): Promise<JobResult[]> {
    const p = Math.max(0, page); // API 0-based
    // 1) searchV2 (feature-flag activo para BMPE)
    try {
        return await callApi(`/api/avisos/searchV2?page=${p}&pageSize=20`, {
            filtros: [],
            query,
            internacional: false,
        });
    } catch {
        /* cae al endpoint legacy */
    }
    // 2) searchNormalizado (ruta legacy que la app aún incluye)
    return callApi(`/api/avisos/searchNormalizado?pageSize=20&page=${p}`, {
        filtros: [],
        busquedaExtendida: false,
        query,
        tipoDetalle: "full",
        withHome: false,
        internacional: false,
    });
}
