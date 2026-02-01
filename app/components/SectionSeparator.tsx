"use client";

export function SectionSeparator() {
    return (
        <div className="w-full relative py-12 flex flex-col items-center justify-center pointer-events-none z-40 gap-8">
            {/* Dark Expensive Modern Blue - Static Dynamic Look */}
            <div className="relative w-full h-[2px] bg-[#0f172a] overflow-hidden shadow-[0_0_30px_rgba(30,64,175,0.5)]">
                {/* Frozen Energy Beam - Complex Gradient for 'Dynamic' Look without Motion */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-blue-500 to-blue-900/20 opacity-90" />

                {/* Intense Core Highlight */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent mix-blend-overlay" />
            </div>

            {/* Subtle Deep Glow */}
            <div className="relative w-full h-px opacity-40">
                <div className="absolute inset-0 bg-blue-900 blur-[2px]" />
            </div>
        </div>
    );
}
