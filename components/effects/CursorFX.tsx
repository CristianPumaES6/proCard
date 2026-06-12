"use client";

/**
 * CursorFX — Sistema de efectos de cursor por módulo.
 *
 *  - aurora    : aurora boreal que sigue al cursor (global / home)
 *  - electric  : rayos y chispas eléctricas (módulo Tech)
 *  - gavel     : polvo dorado + martillazo legal al hacer click (módulo Legal)
 *  - brush     : pincel mágico arcoíris + salpicaduras (módulo Creative Design)
 *
 * Singleton: se monta una vez en el layout. Las páginas cambian la variante
 * renderizando <CursorVariant variant="..." />.
 * Se desactiva automáticamente en pantallas táctiles y con
 * `prefers-reduced-motion`.
 */

import { useEffect, useRef } from "react";

export type CursorVariantName = "aurora" | "electric" | "gavel" | "brush";

// --- mini store global (evita prop-drilling/context) ---
let currentVariant: CursorVariantName = "aurora";
const listeners = new Set<(v: CursorVariantName) => void>();

export function setCursorVariant(v: CursorVariantName) {
    currentVariant = v;
    listeners.forEach((l) => l(v));
}

/** Helper declarativo: fija la variante mientras el componente esté montado. */
export function CursorVariant({ variant }: { variant: CursorVariantName }) {
    useEffect(() => {
        setCursorVariant(variant);
        return () => setCursorVariant("aurora");
    }, [variant]);
    return null;
}

// --- tipos internos ---
interface Particle {
    x: number; y: number;
    vx: number; vy: number;
    life: number; maxLife: number;
    size: number; hue: number;
    kind: "glow" | "spark" | "splat" | "dust";
}

interface TrailPoint { x: number; y: number; t: number; }

interface Strike { x: number; y: number; t: number; }   // martillazo legal

const MAX_PARTICLES = 420;

export function CursorFX() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Desactivar en táctiles y con reduced-motion
        const coarse = window.matchMedia("(pointer: coarse)").matches;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (coarse || reduced) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let variant = currentVariant;
        const onVariant = (v: CursorVariantName) => { variant = v; };
        listeners.add(onVariant);

        let dpr = Math.min(window.devicePixelRatio || 1, 2);
        const resize = () => {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();
        window.addEventListener("resize", resize);

        const particles: Particle[] = [];
        const trail: TrailPoint[] = [];
        const strikes: Strike[] = [];
        let mouseX = -100, mouseY = -100;
        let lastX = -100, lastY = -100;
        let hueShift = 0;
        let raf = 0;

        const push = (p: Particle) => {
            if (particles.length >= MAX_PARTICLES) particles.shift();
            particles.push(p);
        };

        const spawnForMove = (speed: number) => {
            const count = Math.min(1 + Math.floor(speed / 14), 4);
            for (let i = 0; i < count; i++) {
                switch (variant) {
                    case "aurora":
                        push({
                            x: mouseX + (Math.random() - 0.5) * 26,
                            y: mouseY + (Math.random() - 0.5) * 26,
                            vx: (Math.random() - 0.5) * 0.4,
                            vy: -0.35 - Math.random() * 0.55,           // sube como aurora
                            life: 1, maxLife: 60 + Math.random() * 50,
                            size: 22 + Math.random() * 30,
                            hue: 140 + ((hueShift + Math.random() * 90) % 180), // verde→cian→violeta
                            kind: "glow",
                        });
                        break;
                    case "electric":
                        push({
                            x: mouseX + (Math.random() - 0.5) * 10,
                            y: mouseY + (Math.random() - 0.5) * 10,
                            vx: (Math.random() - 0.5) * 3.2,
                            vy: (Math.random() - 0.5) * 3.2,
                            life: 1, maxLife: 18 + Math.random() * 14,
                            size: 1 + Math.random() * 2,
                            hue: 185 + Math.random() * 30,              // cian eléctrico
                            kind: "spark",
                        });
                        break;
                    case "gavel":
                        push({
                            x: mouseX + (Math.random() - 0.5) * 14,
                            y: mouseY + (Math.random() - 0.5) * 14,
                            vx: (Math.random() - 0.5) * 0.5,
                            vy: 0.25 + Math.random() * 0.5,             // cae como polvo
                            life: 1, maxLife: 45 + Math.random() * 35,
                            size: 1.5 + Math.random() * 2.5,
                            hue: 42 + Math.random() * 12,               // dorado
                            kind: "dust",
                        });
                        break;
                    case "brush":
                        // el trazo lo dibuja el trail; aquí van motas de magia
                        if (Math.random() < 0.5) {
                            push({
                                x: mouseX + (Math.random() - 0.5) * 18,
                                y: mouseY + (Math.random() - 0.5) * 18,
                                vx: (Math.random() - 0.5) * 0.8,
                                vy: -0.2 - Math.random() * 0.6,
                                life: 1, maxLife: 35 + Math.random() * 25,
                                size: 1.5 + Math.random() * 2,
                                hue: (hueShift * 3) % 360,
                                kind: "spark",
                            });
                        }
                        break;
                }
            }
        };

        const onMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            const speed = Math.hypot(mouseX - lastX, mouseY - lastY);
            trail.push({ x: mouseX, y: mouseY, t: performance.now() });
            if (trail.length > 24) trail.shift();
            spawnForMove(speed);
            lastX = mouseX;
            lastY = mouseY;
        };

        const onClick = (e: MouseEvent) => {
            const x = e.clientX, y = e.clientY;
            switch (variant) {
                case "gavel":
                    strikes.push({ x, y, t: performance.now() });
                    for (let i = 0; i < 18; i++) {
                        const a = (Math.PI * 2 * i) / 18;
                        push({
                            x, y,
                            vx: Math.cos(a) * (1.5 + Math.random() * 2.5),
                            vy: Math.sin(a) * (1.5 + Math.random() * 2.5),
                            life: 1, maxLife: 30 + Math.random() * 20,
                            size: 1.5 + Math.random() * 2,
                            hue: 45, kind: "dust",
                        });
                    }
                    break;
                case "electric":
                    for (let i = 0; i < 24; i++) {
                        const a = Math.random() * Math.PI * 2;
                        const v = 2 + Math.random() * 5;
                        push({
                            x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
                            life: 1, maxLife: 20 + Math.random() * 16,
                            size: 1 + Math.random() * 2,
                            hue: 190 + Math.random() * 40, kind: "spark",
                        });
                    }
                    break;
                case "brush":
                    for (let i = 0; i < 16; i++) {
                        const a = Math.random() * Math.PI * 2;
                        const v = 0.8 + Math.random() * 3;
                        push({
                            x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 0.5,
                            life: 1, maxLife: 35 + Math.random() * 25,
                            size: 2.5 + Math.random() * 4,
                            hue: Math.random() * 360, kind: "splat",
                        });
                    }
                    break;
                case "aurora":
                    for (let i = 0; i < 6; i++) {
                        push({
                            x: x + (Math.random() - 0.5) * 30,
                            y: y + (Math.random() - 0.5) * 30,
                            vx: (Math.random() - 0.5) * 0.6,
                            vy: -0.5 - Math.random() * 0.8,
                            life: 1, maxLife: 70,
                            size: 34 + Math.random() * 30,
                            hue: 150 + Math.random() * 140, kind: "glow",
                        });
                    }
                    break;
            }
        };

        window.addEventListener("mousemove", onMove, { passive: true });
        window.addEventListener("click", onClick, { passive: true });

        // --- dibujo de rayo entre dos puntos con jitter ---
        const drawLightning = (x1: number, y1: number, x2: number, y2: number, alpha: number) => {
            const segments = 6;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            for (let i = 1; i < segments; i++) {
                const t = i / segments;
                const nx = x1 + (x2 - x1) * t + (Math.random() - 0.5) * 14;
                const ny = y1 + (y2 - y1) * t + (Math.random() - 0.5) * 14;
                ctx.lineTo(nx, ny);
            }
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = `hsla(195, 100%, 75%, ${alpha})`;
            ctx.lineWidth = 1.2;
            ctx.shadowColor = "rgba(34,211,238,0.9)";
            ctx.shadowBlur = 8;
            ctx.stroke();
            ctx.shadowBlur = 0;
        };

        const loop = () => {
            raf = requestAnimationFrame(loop);
            hueShift = (hueShift + 0.6) % 360;
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            const now = performance.now();

            ctx.globalCompositeOperation = "lighter";

            // ---- trail-based: pincel arcoíris / rayo eléctrico ----
            if (variant === "brush" && trail.length > 2) {
                for (let i = 1; i < trail.length; i++) {
                    const p0 = trail[i - 1], p1 = trail[i];
                    const age = (now - p1.t) / 600;             // se desvanece en 600ms
                    if (age > 1) continue;
                    const alpha = (1 - age) * 0.85;
                    const width = Math.max(1, 10 * (i / trail.length)) * (1 - age);
                    ctx.beginPath();
                    ctx.moveTo(p0.x, p0.y);
                    ctx.lineTo(p1.x, p1.y);
                    ctx.strokeStyle = `hsla(${(hueShift * 3 + i * 14) % 360}, 95%, 65%, ${alpha})`;
                    ctx.lineWidth = width;
                    ctx.lineCap = "round";
                    ctx.shadowColor = `hsla(${(hueShift * 3 + i * 14) % 360}, 95%, 65%, 0.7)`;
                    ctx.shadowBlur = 10;
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                }
            }

            if (variant === "electric" && trail.length > 4) {
                // un rayo serpenteante sobre los últimos puntos del trail
                for (let i = Math.max(1, trail.length - 6); i < trail.length; i++) {
                    const p0 = trail[i - 1], p1 = trail[i];
                    const age = (now - p1.t) / 280;             // vida corta = chispazo
                    if (age > 1) continue;
                    drawLightning(p0.x, p0.y, p1.x, p1.y, (1 - age) * 0.9);
                }
            }

            // ---- partículas ----
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.life -= 1 / p.maxLife;
                if (p.life <= 0) { particles.splice(i, 1); continue; }
                p.x += p.vx;
                p.y += p.vy;
                if (p.kind === "dust") p.vy += 0.02;            // gravedad ligera
                if (p.kind === "splat") { p.vy += 0.05; p.vx *= 0.98; }

                const alpha = Math.max(0, p.life);
                if (p.kind === "glow") {
                    // aurora: blobs degradados grandes y suaves
                    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
                    g.addColorStop(0, `hsla(${p.hue}, 90%, 65%, ${alpha * 0.16})`);
                    g.addColorStop(1, "hsla(0, 0%, 0%, 0)");
                    ctx.fillStyle = g;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * alpha + 0.3, 0, Math.PI * 2);
                    ctx.fillStyle = `hsla(${p.hue}, 95%, ${p.kind === "dust" ? 58 : 68}%, ${alpha * 0.9})`;
                    ctx.shadowColor = `hsla(${p.hue}, 95%, 60%, 0.8)`;
                    ctx.shadowBlur = p.kind === "splat" ? 4 : 8;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }
            }

            // ---- martillazos legales (emoji 🔨 + onda expansiva) ----
            ctx.globalCompositeOperation = "source-over";
            for (let i = strikes.length - 1; i >= 0; i--) {
                const s = strikes[i];
                const age = (now - s.t) / 650;                  // 650ms de animación
                if (age > 1) { strikes.splice(i, 1); continue; }

                // Onda expansiva dorada
                const ringR = 8 + age * 56;
                ctx.beginPath();
                ctx.arc(s.x, s.y, ringR, 0, Math.PI * 2);
                ctx.strokeStyle = `hsla(45, 90%, 55%, ${(1 - age) * 0.7})`;
                ctx.lineWidth = 2.5 * (1 - age);
                ctx.stroke();

                // Martillo que golpea: rota de -70° a 15° con easing y se desvanece
                const swing = Math.min(age / 0.35, 1);          // el golpe dura 35% del tiempo
                const angle = (-70 + 85 * (1 - Math.pow(1 - swing, 3))) * (Math.PI / 180);
                ctx.save();
                ctx.translate(s.x + 14, s.y - 16);
                ctx.rotate(angle);
                ctx.globalAlpha = age < 0.7 ? 1 : (1 - age) / 0.3;
                ctx.font = "26px serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText("🔨", 0, 0);
                ctx.restore();
                ctx.globalAlpha = 1;
            }
        };
        raf = requestAnimationFrame(loop);

        return () => {
            cancelAnimationFrame(raf);
            listeners.delete(onVariant);
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("click", onClick);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="fixed inset-0 z-[9990] pointer-events-none print:hidden"
        />
    );
}
