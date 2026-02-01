"use client";

export function SectionSeparator() {
    return (
        <div className="w-full relative py-12 flex flex-col items-center justify-center pointer-events-none z-40 gap-8">
            {/* White Energy Beam - Pure & Static */}
            <div className="relative w-full h-[2px] bg-white/10 overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                {/* Frozen Light - Complex Gradient for Depth */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-90" />

                {/* Intense Core Highlight */}
                <div className="absolute inset-0 bg-white mix-blend-overlay shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
            </div>

            {/* Subtle Ambient Glow */}
            <div className="relative w-full h-px opacity-20">
                <div className="absolute inset-0 bg-white blur-[2px]" />
            </div>
        </div>
    );
}
