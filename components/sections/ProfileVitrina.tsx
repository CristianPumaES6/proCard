"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { TechView } from "@/components/sections/vitrina-tech";
import { LegalView } from "@/components/sections/vitrina-legal";
import { DesignView } from "@/components/sections/vitrina-design";

type ViewMode = "tech" | "legal" | "design";

export function ProfileVitrina({ profiles }: { profiles: any[] }) {
    const [view, setView] = useState<ViewMode>("tech");

    // Filter profiles by industry
    const techProfiles = profiles?.filter(p => p.industry === "Tech") || [];
    const legalProfiles = profiles?.filter(p => p.industry === "Legal") || [];
    const designProfiles = profiles?.filter(p => p.industry === "Design") || [];

    const [techIndex, setTechIndex] = useState(0);
    const [legalIndex, setLegalIndex] = useState(0);
    const [designIndex, setDesignIndex] = useState(0);

    const currentTechProfile = techProfiles[techIndex];
    const currentLegalProfile = legalProfiles[legalIndex];
    const currentDesignProfile = designProfiles[designIndex];

    const content =
        view === "tech" ? (
            <TechView
                key="tech"
                profile={currentTechProfile}
                onNext={() => setTechIndex((prev) => (prev + 1) % techProfiles.length)}
                onPrev={() => setTechIndex((prev) => (prev - 1 + techProfiles.length) % techProfiles.length)}
                hasMultiple={techProfiles.length > 1}
            />
        ) : view === "legal" ? (
            <LegalView
                key="legal"
                profile={currentLegalProfile}
                onNext={() => setLegalIndex((prev) => (prev + 1) % legalProfiles.length)}
                onPrev={() => setLegalIndex((prev) => (prev - 1 + legalProfiles.length) % legalProfiles.length)}
                hasMultiple={legalProfiles.length > 1}
            />
        ) : (
            <DesignView
                key="design"
                profile={currentDesignProfile}
                onNext={() => setDesignIndex((prev) => (prev + 1) % designProfiles.length)}
                onPrev={() => setDesignIndex((prev) => (prev - 1 + designProfiles.length) % designProfiles.length)}
                hasMultiple={designProfiles.length > 1}
            />
        );

    return (
        <section id="vitrina" className="container mx-auto px-4 py-24 border-t border-white/5">
            <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">VITRINA DE PERFILES</h2>
                    <p className="text-muted-foreground mt-2">Adaptación inteligente según industria.</p>
                </div>

                <div className="flex bg-white/5 p-1 rounded-full border border-white/10">
                    <button
                        onClick={() => setView("tech")}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${view === 'tech' ? 'bg-primary text-black' : 'text-zinc-400 hover:text-white'}`}
                    >
                        Vista Tech
                    </button>
                    <button
                        onClick={() => setView("legal")}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${view === 'legal' ? 'bg-yellow-500 text-black' : 'text-zinc-400 hover:text-white'}`}
                    >
                        Vista Legal
                    </button>
                    <button
                        onClick={() => setView("design")}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${view === 'design' ? 'bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white' : 'text-zinc-400 hover:text-white'}`}
                    >
                        Vista Design
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {content}
            </AnimatePresence>
        </section>
    );
}
