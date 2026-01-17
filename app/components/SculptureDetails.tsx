import React from "react";
import { clsx } from "clsx";

export default function SculptureDetails() {
    return (
        <section className="relative z-10 w-full bg-[#050505] min-h-screen py-24 px-4 md:px-12 border-t border-white/10">
            <div className="max-w-7xl mx-auto">
                <header className="mb-24">
                    <h2 className="font-display text-[10vw] leading-[0.8] font-black uppercase tracking-tighter text-white mix-blend-difference">
                        Daten<span className="text-white/20">blatt</span>
                    </h2>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[minmax(200px,auto)]">
                    {/* Main Stat */}
                    <div className="col-span-1 md:col-span-2 row-span-2 p-8 border border-white/10 bg-white/5 bg-grid-white/[0.05] flex flex-col justify-end group hover:bg-white/10 transition-colors">
                        <h3 className="text-sm font-sans font-bold text-white/50 mb-2 uppercase tracking-widest">Objekt</h3>
                        <p className="font-display text-6xl md:text-8xl font-black text-white tracking-tight">
                            SCHWERELOS
                            <br />
                            <span className="text-white/30">MK-1</span>
                        </p>
                    </div>

                    {/* Dimension */}
                    <div className="p-8 border border-white/10 flex flex-col justify-between hover:border-white/30 transition-colors">
                        <div className="w-full h-[1px] bg-white/20 mb-4" />
                        <div>
                            <h3 className="text-xs font-sans font-bold text-white/50 uppercase">Höhe</h3>
                            <p className="font-display text-4xl font-light text-white">4.20m</p>
                        </div>
                    </div>

                    {/* Weight */}
                    <div className="p-8 border border-white/10 flex flex-col justify-between hover:border-white/30 transition-colors">
                        <div className="w-full h-[1px] bg-white/20 mb-4" />
                        <div>
                            <h3 className="text-xs font-sans font-bold text-white/50 uppercase">Masse</h3>
                            <p className="font-display text-4xl font-light text-white">12.5kg</p>
                        </div>
                    </div>

                    {/* Grid Item - Material */}
                    <div className="col-span-1 md:col-span-2 p-8 border border-white/10 bg-white/5 flex flex-col justify-center">
                        <h3 className="text-xs font-sans font-bold text-white/50 uppercase mb-4">Materialität</h3>
                        <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1 bg-white/10 rounded-full text-sm font-sans text-white border border-white/10">Voxel-PLA</span>
                            <span className="px-3 py-1 bg-white/10 rounded-full text-sm font-sans text-white border border-white/10">Carbon Fiber Core</span>
                            <span className="px-3 py-1 bg-white/10 rounded-full text-sm font-sans text-white border border-white/10">Epoxy Finish</span>
                        </div>
                    </div>

                    {/* Quote / Philosophy */}
                    <div className="col-span-1 lg:col-span-3 p-12 border border-white/10 bg-gradient-to-br from-white/5 to-transparent mt-8">
                        <p className="font-display text-2xl md:text-4xl font-light leading-relaxed text-white/80 max-w-4xl">
                            "Die primäre Aufgabe der Skulptur ist nicht die Besetzung von Raum, sondern die <span className="text-white font-bold">Inszenierung der Leere</span>."
                        </p>
                        <p className="mt-6 text-sm font-sans font-bold text-white/40">— Dr. Aris K., Lead Architect</p>
                    </div>
                </div>

                {/* Footer info */}
                <div className="mt-24 flex justify-between items-end border-t border-white/10 pt-8">
                    <div className="text-xs font-sans font-bold text-white/30">
                        PROJEKT ID: #8821-X<br />
                        LOCATION: BERLIN
                    </div>
                    <div className="text-right">
                        <button className="text-sm font-bold uppercase tracking-widest text-white hover:text-white/70 transition-colors">
                            Download PDF ↗
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
