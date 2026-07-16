import { JobResult } from "./types";
import { clean, fetchWithRetry } from "./html";

const LOCATION = "Perú";
const PAGE_SIZE = 25; // el endpoint pagina de 25 en 25 vía "start"

/**
 * LinkedIn — endpoint "guest" (sin autenticación) que devuelve un fragmento
 * HTML con tarjetas de empleo. Es el mismo que usa el buscador público de
 * LinkedIn al hacer scroll. Trae título, empresa, ubicación y link; la
 * descripción completa vive en la página de detalle, así que aquí queda vacía.
 *
 * Nota de fiabilidad: desde IPs de datacenter LinkedIn suele responder 429.
 * Por eso todo va envuelto en try/catch y el orquestador degrada con elegancia.
 */
const GUEST_ENDPOINT =
    "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search";

// geoId numérico de LinkedIn por país. Mejora el filtrado geográfico.
const GEO_IDS: Record<string, string> = {
    "peru": "102927786",
    "perú": "102927786",
};

function pick(block: string, ...res: RegExp[]): string {
    for (const re of res) {
        const m = re.exec(block);
        if (m && m[1]) return clean(m[1]);
    }
    return "";
}

export async function searchLinkedIn(query: string, page = 0): Promise<JobResult[]> {
    const geoId = GEO_IDS[LOCATION.toLowerCase()];
    const start = Math.max(0, page) * PAGE_SIZE;
    const url =
        `${GUEST_ENDPOINT}?keywords=${encodeURIComponent(query)}` +
        `&location=${encodeURIComponent(LOCATION)}` +
        (geoId ? `&geoId=${geoId}` : "") +
        `&start=${start}`;

    const res = await fetchWithRetry(url, {
        timeoutMs: 8000,
        headers: {
            Accept: "text/html,application/xhtml+xml",
            "X-Requested-With": "XMLHttpRequest",
            Referer: "https://www.linkedin.com/jobs",
        },
    });
    if (!res.ok) throw new Error(`LinkedIn HTTP ${res.status}`);

    const html = await res.text();

    // El fragmento es una lista de <li>...</li>, una por vacante.
    const blocks = html.split(/<li[\s>]/i).slice(1);
    const results: JobResult[] = [];

    for (const block of blocks) {
        const title = pick(
            block,
            /class="[^"]*base-search-card__title[^"]*"[^>]*>([\s\S]*?)<\/h3>/i,
            /class="[^"]*base-search-card__title[^"]*"[^>]*>([\s\S]*?)<\//i
        );

        const company = pick(
            block,
            /class="[^"]*base-search-card__subtitle[^"]*"[^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i,
            /class="[^"]*base-search-card__subtitle[^"]*"[^>]*>([\s\S]*?)<\/h4>/i
        );

        const jobLocation = pick(
            block,
            /class="[^"]*job-search-card__location[^"]*"[^>]*>([\s\S]*?)<\/span>/i
        );

        const hrefMatch =
            /<a[^>]+class="[^"]*base-card__full-link[^"]*"[^>]+href="([^"]+)"/i.exec(block) ||
            /<a[^>]+href="(https:\/\/[a-z.]*linkedin\.com\/jobs\/view\/[^"]+)"/i.exec(block);
        const rawHref = hrefMatch ? hrefMatch[1] : "";
        const jobUrl = rawHref ? rawHref.split("?")[0].replace(/&amp;/g, "&") : "";

        const postedAt = pick(block, /<time[^>]*>([\s\S]*?)<\/time>/i);

        if (title && jobUrl) {
            results.push({
                source: "LinkedIn",
                title,
                company,
                location: jobLocation,
                description: "",
                url: jobUrl,
                postedAt: postedAt || undefined,
            });
        }
    }

    return results;
}
