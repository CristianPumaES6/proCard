/**
 * This service replaces the direct Prisma calls in lib/actions.ts.
 * Since GitHub Pages is a static host, we must fetch data from 
 * an external backend API at runtime.
 */

// Helper to check if we are in browser
const isBrowser = typeof window !== 'undefined';
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

function getEndpoint(path: string): string {
    // In browser, always use relative path against the current host to prevent DNS/CORS issues
    if (isBrowser) {
        return path;
    }
    return API_BASE ? `${API_BASE}${path}` : path;
}

export async function getClientShowcaseProfiles() {
    const targetUrl = getEndpoint('/api/profiles');
    try {
        const res = await fetch(targetUrl);
        if (!res.ok) throw new Error("Network response was not ok");
        return await res.json();
    } catch (error) {
        console.warn(`Fetch profiles error (target: ${targetUrl}):`, error);
        // Fallback to relative path if external API_BASE was provided and failed
        if (targetUrl !== '/api/profiles') {
            try {
                console.log("Attempting fallback to relative path: /api/profiles");
                const res = await fetch('/api/profiles');
                if (res.ok) return await res.json();
            } catch (e) {
                console.error("Fallback fetch failed:", e);
            }
        }
        return [];
    }
}

export async function getClientProfileById(id: string) {
    const targetUrl = getEndpoint(`/api/profiles/${id}`);
    try {
        const res = await fetch(targetUrl);
        if (!res.ok) throw new Error("Network response was not ok");
        return await res.json();
    } catch (error) {
        console.warn(`Fetch profile error (target: ${targetUrl}):`, error);
        if (targetUrl !== `/api/profiles/${id}`) {
            try {
                const res = await fetch(`/api/profiles/${id}`);
                if (res.ok) return await res.json();
            } catch (e) { /* ignore */ }
        }
        return null;
    }
}

export async function createClientProfile(formData: FormData) {
    const targetUrl = getEndpoint('/api/profiles');
    console.log(`[API] Creating profile at: ${targetUrl}`);
    try {
        const res = await fetch(targetUrl, {
            method: 'POST',
            body: formData,
        });
        if (!res.ok) {
            const err = await res.text();
            throw new Error(`Post failed: ${res.status} - ${err}`);
        }
        return await res.json();
    } catch (error) {
        console.error("Create profile error:", error);
        return { success: false, error: String(error) };
    }
}

export async function updateClientProfile(id: string, formData: FormData) {
    if (!id) {
        console.error("updateClientProfile: ID is missing!");
        return { success: false, error: "Missing ID" };
    }
    const targetUrl = getEndpoint(`/api/profiles/${id}`);
    console.log(`[API] Updating profile ${id} at: ${targetUrl}`);

    try {
        const res = await fetch(targetUrl, {
            method: 'PUT',
            body: formData,
        });
        if (!res.ok) {
            const err = await res.text();
            throw new Error(`Update failed: ${res.status} - ${err}`);
        }
        return await res.json();
    } catch (error) {
        console.error("Update profile error, retrying fallback...", error);
        // Fallback mainly useful if isBrowser check failed or we are in a weird env
        try {
            const fallbackUrl = `/api/profiles/${id}`;
            if (targetUrl !== fallbackUrl) {
                const res = await fetch(fallbackUrl, { method: 'PUT', body: formData });
                if (res.ok) return await res.json();
            }
        } catch (e) {
            console.error("Fallback failed:", e);
        }
        return { success: false, error: String(error) };
    }
}
