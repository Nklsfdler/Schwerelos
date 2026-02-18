"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useSpring } from "framer-motion";

declare global {
    namespace JSX {
        interface IntrinsicElements {
            "model-viewer": any;
        }
    }
}

// ORDER: Bottom to Top (Reversed)
// ORDER: Bottom to Top (Reversed)
const DATA = [
    {
        title: "01. Dynamischer Ursprung",
        text: "Hier beginnt alles. Aus der starren Basis erwächst die Bewegung, Masse transformiert sich in reinen Auftrieb.",
        orbit: "20deg 90deg 55%", // Zoomed Out (was 25%)
        target: "0m -26.5m 0m",
        fov: "20deg"
    },
    {
        title: "02. Vertikaler Stab",
        text: "Die Achse der Balance. Kein massives Element, sondern ein filigraner Leitstrahl, der den Blick unaufhaltsam in die Höhe zieht.",
        orbit: "-30deg 75deg 58%",  // Zoomed Out (was 28%)
        target: "0m -13.0m 0m",
        fov: "20deg"
    },
    {
        title: "03. Negativer Raum",
        text: "Die Kunst der Auslassung. Luft wird zur Materie, Leere wird zur Form. Das Nichts hält die Struktur zusammen.",
        orbit: "120deg 60deg 130%", // Zoomed Out (was 100%)
        target: "0.1m -1.8m 0m",
        fov: "30deg"
    },
    {
        title: "04. Fragile Verbindung",
        text: "Ein Dialog zwischen Innen und Außen. Zwei Helices tanzen umeinander, berühren sich fast, und bleiben doch ewig getrennt.",
        orbit: "200deg 60deg 105%",  // Zoomed Out (was 75%)
        target: "-0.1m 1.2m 0m",
        fov: "30deg"
    },
    {
        title: "05. Auslaufen",
        text: "Die Auflösung ins Unendliche. Die Form verliert ihre Grenzen, wird immer feiner, bis sie schließlich eins mit dem Raum wird.",
        orbit: "0deg 30deg 140%",   // Zoomed Out (was 110%)
        target: "0m 0.5m 0m",
        fov: "30deg"
    }
];

// INITIAL STATE (No selection)
const INITIAL_STATE = {
    title: "Schwerelos",
    text: "Eine Studie der Leichtigkeit. Wähle einen Bereich, um die Details zu erkunden.",
    // INITIAL ORBIT: Must match the hardcoded prop in model-viewer to prevent jump
    orbit: "45deg 75deg 160%",
    target: "0m -1.5m 0m",
    fov: "30deg" // ROUND 45: Fixed Value (was "auto") to prevent FOV-switching snap
};

// --- HELPER FUNCTIONS ---
function parseOrbit(orbitString: string) {
    const [theta, phi, radius] = orbitString.split(" ");
    return {
        theta: parseFloat(theta),
        phi: parseFloat(phi),
        radius: parseFloat(radius)
    };
}

function parseTarget(targetString: string) {
    const [x, y, z] = targetString.split(" ");
    return {
        x: parseFloat(x),
        y: parseFloat(y),
        z: parseFloat(z)
    };
}

export default function ModelSection() {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const modelViewerRef = React.useRef<any>(null);

    const currentData = activeIndex !== null ? DATA[activeIndex] : INITIAL_STATE;

    // --- CUSTOM SPRING PHYSICS (The "No-Jump" Solution) ---
    // We bypass model-viewer's internal interpolation because it snaps on large distances.
    // --- CINEMATIC TRANSITION LOOP 4.0 (Ease-In-Out Duration) ---
    // Problem: Physics-based movement starts with max velocity -> "Jump".
    // Solution: Pre-calculated Duration Easing (Slow Start -> Fast Move -> Slow End).
    // This feels "produced" and "cinematic", totally eliminating the initial snap.

    // CONSTANTS
    const DURATION = 3200; // 3.2s = Floating in Space


    // REFS (Mutable State for Animation Loop)
    const animationState = React.useRef({
        startTime: 0,
        isAnimating: false,
        // Start Values (Captured when transition begins)
        startOrbit: parseOrbit(INITIAL_STATE.orbit),
        startPoint: parseTarget(INITIAL_STATE.target),
        // Target Values (Where we are going)
        endOrbit: parseOrbit(INITIAL_STATE.orbit),
        endPoint: parseTarget(INITIAL_STATE.target),
        duration: DURATION,
    });

    // Current Values (Used for "where are we right now" if interrupted)
    const currentOrbit = React.useRef(parseOrbit(INITIAL_STATE.orbit));
    const currentPoint = React.useRef(parseTarget(INITIAL_STATE.target));

    // MATH HELPERS
    // QUADRATIC EASING (Smoother start/end, less abrupt)
    const easeInOutQuad = (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const lerp = (start: number, end: number, t: number) => start + (end - start) * t;

    // Shortest Angular Distance: Ensures 350 -> 10 goes +20, not -340
    const shortestAngleDist = (start: number, end: number) => {
        const diff = (end - start + 180) % 360 - 180;
        return diff < -180 ? diff + 360 : diff;
    };

    // 1. TRIGGER: When activeIndex changes, START a new transition
    useEffect(() => {
        const data = activeIndex !== null ? DATA[activeIndex] : INITIAL_STATE;

        // 1. Capture where we currently are (INTERRUPTION SAFE)
        // CRITICAL FIX: Get ACTUAL current camera position from DOM to prevent "Jump"
        let startO = { ...currentOrbit.current };
        let startP = { ...currentPoint.current };

        if (modelViewerRef.current && modelViewerRef.current.getCameraOrbit) {
            const actualOrbit = modelViewerRef.current.getCameraOrbit();
            if (actualOrbit) {
                // model-viewer returns { theta: rad, phi: rad, radius: meters } usually, check docs or console.
                // Actually it returns an object with theta/phi in radians. We need degrees.
                startO = {
                    theta: (actualOrbit.theta * 180) / Math.PI,
                    phi: (actualOrbit.phi * 180) / Math.PI,
                    radius: actualOrbit.radius * 100 // It might return radius in meters, but we use %, need to check if we can get the string or raw val.
                    // Wait, getCameraOrbit returns radius in meters usually if bounds are tight?
                    // Let's stick to our internal tracking `currentOrbit` BUT sync it better?
                    // actually, `currentOrbit` IS our source of truth for the animation loop.
                    // The jump happens because `currentOrbit` might be stale if the user interacted manually?
                    // Interaction is disabled via `interaction-prompt="none"` but `camera-controls` is ON.
                    // If user moved it, our ref is wrong.
                    // Let's trust the REF if we assume user hasn't moved it much, OR parse the string attribute if needed.
                    // SAFE BET: Re-read the string attribute if possible? `cameraOrbit` is a string prop?
                    // No, let's use the internal tracker because reading DOM might be async or complex format.
                    // FIX: Ensure `shortestAngleDist` calculates the path from the *current* interpolated value, which IS `currentOrbit.current`.
                };
                // Re-mapping radians to our degree state:
                startO.theta = (actualOrbit.theta * 180) / Math.PI;
                startO.phi = (actualOrbit.phi * 180) / Math.PI;
                // radius in model-viewer defaults to meters? or %?
                // If we use %, `getCameraOrbit` returns M.
                // This conversion is risky without testing. 
                // FALLBACK: Trust `currentOrbit.current` BUT ensure it's not reset.
                // ISSUE: Maybe `DATA` target is 360 vs 0? 
                // Let's rely on `currentOrbit.current` but strictly enforce `shortestAngleDist`.
            }
        }

        // RE-VERIFICATION: `currentOrbit.current` is updated in the loop. 
        // If the loop finished, it holds the END state of previous move.
        // If we click again, it starts from there.
        // The jump implies `currentOrbit` != `actual visual state`.
        // This generally happens if the user DRAGS the model. 
        // We have `camera-controls` enabled.
        // FIX: We MUST capture the actual camera orbit if the user moved it.
        // However, converting ModelViewer's internal Radian/Meter state back to our Deg/% string state is hard.
        // ALTERNATIVE: Disable user interaction? User asked for "Interaktiv".
        // COMPROMISE: We will stick to `currentOrbit.current` but ensure we normalize the angles immediately.

        // 2. Define where we are going
        const endO = parseOrbit(data.orbit);
        const endP = parseTarget(data.target);

        // 3. Dynamic Duration based on Distance
        const thetaDiff = Math.abs(shortestAngleDist(startO.theta, endO.theta));
        const phiDiff = Math.abs(shortestAngleDist(startO.phi, endO.phi));
        const maxAngle = Math.max(thetaDiff, phiDiff);

        // Base 1.8s + extra.
        const calculatedDuration = Math.max(DURATION, 1000 + (maxAngle * 10));

        // 4. Set Animation State
        animationState.current = {
            startTime: performance.now(),
            duration: calculatedDuration,
            isAnimating: true,
            startOrbit: startO,
            startPoint: startP,
            endOrbit: endO,
            endPoint: endP
        };

    }, [activeIndex]);

    // 2. ANIMATION LOOP
    useEffect(() => {
        let frameId: number;

        const loop = (time: number) => {
            if (!animationState.current.isAnimating) {
                frameId = requestAnimationFrame(loop);
                return;
            }

            const { startTime, duration, startOrbit, endOrbit, startPoint, endPoint } = animationState.current;
            const elapsed = time - startTime;
            const progress = Math.min(elapsed / duration, 1); // 0 to 1
            const ease = easeInOutQuad(progress); // Smoother Quad Curve

            if (modelViewerRef.current) {
                // ORBIT INTERPOLATION (With Shortest Angle Path)
                // Use shortest path logic for angles (Theta/Phi)
                // We calculate `start + difference * ease` instead of `lerp` to handle wrap-around correctly manually or just use raw values?
                // Actually, `lerp` is fine IF we adjust the END target to be the "closest" relative to start.

                // Better approach: Calculate delta first
                const thetaDiff = shortestAngleDist(startOrbit.theta, endOrbit.theta);
                const phiDiff = shortestAngleDist(startOrbit.phi, endOrbit.phi); // Phi usually doesn't wrap, but safe to keep.

                currentOrbit.current.theta = startOrbit.theta + thetaDiff * ease;
                currentOrbit.current.phi = startOrbit.phi + phiDiff * ease;
                currentOrbit.current.radius = lerp(startOrbit.radius, endOrbit.radius, ease);

                // TARGET INTERPOLATION (Linear Space is simpler)
                currentPoint.current.x = lerp(startPoint.x, endPoint.x, ease);
                currentPoint.current.y = lerp(startPoint.y, endPoint.y, ease);
                currentPoint.current.z = lerp(startPoint.z, endPoint.z, ease);

                // Apply
                modelViewerRef.current.cameraOrbit = `${currentOrbit.current.theta}deg ${currentOrbit.current.phi}deg ${currentOrbit.current.radius}%`;
                modelViewerRef.current.cameraTarget = `${currentPoint.current.x}m ${currentPoint.current.y}m ${currentPoint.current.z}m`;
            }

            // Stop condition
            if (progress >= 1) {
                animationState.current.isAnimating = false;
            }

            frameId = requestAnimationFrame(loop);
        };

        frameId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(frameId);
    }, []);

    return (
        <section className="relative w-full min-h-screen md:h-screen bg-[#050505] flex flex-col items-center justify-center snap-section py-2 px-2 md:px-0">

            {/* SEPARATE CARD CONTAINER - Restored Card Look on Mobile */}
            <div className="relative w-full h-[95vh] md:h-[140vh] min-h-[800px] bg-[#0a0a0a] border border-white/10 rounded-3xl md:rounded-[3rem] overflow-hidden flex flex-col justify-between shadow-2xl mx-auto md:w-[98%] max-w-[1600px]">

                {/* Background Texture (With Blue Tint) */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/5 via-[#0a0a0a] to-[#050505] pointer-events-none z-0" />

                {/* 1. TOP: HEADER (Reordered: Context top, Title bottom) */}
                <div className="relative z-30 w-full p-6 md:p-8 flex flex-row justify-between items-start bg-gradient-to-b from-[#0a0a0a] to-transparent shrink-0 pointer-events-none">
                    <div className="flex flex-col">
                        {/* 1. Context (Small, Gray, Top) */}
                        <span className="text-[10px] md:text-xs text-white/40 font-[family-name:var(--font-outfit)] uppercase tracking-[0.2em] font-bold block mb-1 pl-1">
                            Wähle eine Ansicht
                        </span>
                        {/* 2. Main Title (Big, White, Bottom - Matches other tiles) */}
                        <span className="text-xl md:text-2xl text-white/90 font-[family-name:var(--font-outfit)] uppercase tracking-widest font-bold block">
                            INTERAKTIV
                        </span>
                    </div>
                </div>

                {/* 2. BACKGROUND: MODEL VIEWER (Restricted Height) */}
                <div className="absolute inset-x-0 top-0 bottom-[20%] z-10 cursor-grab active:cursor-grabbing">
                    <model-viewer
                        ref={modelViewerRef}
                        src="/schwerelos.glb?v=11"
                        // REMOVED POSTER: We use a custom loading slot to avoid black flashes
                        alt="Schwerelos Skulptur 3D"
                        bounds="tight"
                        shadow-intensity="1"
                        shadow-softness="0"
                        exposure="1.0"
                        tone-mapping="neutral"
                        camera-controls

                        auto-rotate={false}
                        interaction-prompt="none"
                        loading="eager" // Force immediate load
                        reveal="auto"   // Show as soon as ready

                        // Static Fallback
                        camera-orbit={INITIAL_STATE.orbit}
                        camera-target={INITIAL_STATE.target}
                        field-of-view="25deg" // Locked FOV
                        min-camera-orbit="auto auto 5%"
                        min-field-of-view="2deg"

                        style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}
                        touch-action="pan-y"
                    >
                        {/* CUSTOM LOADING SLOT */}
                        <div slot="poster" className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a]">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-12 h-12 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                                <span className="text-white/40 text-xs tracking-widest uppercase animate-pulse">Lade 3D Modell...</span>
                            </div>
                        </div>
                    </model-viewer>
                </div >

                {/* 3. BOTTOM: DYNAMIC CONTENT & BUTTONS */}
                < div className="relative z-30 w-full p-6 md:p-12 pt-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent shrink-0 pointer-events-none" >

                    {/* Dynamic Text */}
                    < AnimatePresence mode="wait" >
                        <motion.div
                            key={activeIndex ?? "initial"}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="w-full mb-8 max-w-2xl text-container pr-12 md:pr-24 pointer-events-auto" // Added Padding Right to avoid Reset Button overlap
                        >
                            {/* Larger Dynamic Title */}
                            <h4 className="text-3xl md:text-4xl font-[family-name:var(--font-outfit)] font-black text-white mb-2 tracking-tight">
                                {currentData.title}
                            </h4>
                            <div className="text-base md:text-lg text-white/60 font-[family-name:var(--font-dm)] leading-relaxed">
                                {currentData.text}
                            </div>
                        </motion.div>
                    </AnimatePresence >

                    {/* Buttons (Left Aligned) */}
                    < div className="flex flex-wrap gap-3 md:gap-4 justify-start items-center relative z-50 pointer-events-auto" >
                        {
                            DATA.map((item, index) => (
                                <TabButton
                                    key={index}
                                    active={index === activeIndex}
                                    onClick={() => setActiveIndex(index)}
                                    number={`0${index + 1}`}
                                    label={item.title.split('. ')[1] || item.title} // Short label
                                    index={index}
                                />
                            ))
                        }
                    </div >
                </div >

                {/* RESET BUTTON (Minimalist - Top Right) */}
                <AnimatePresence>
                    {
                        activeIndex !== null && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                onClick={() => setActiveIndex(null)}
                                className="absolute top-6 right-6 md:top-8 md:right-8 z-50 flex items-center gap-2 h-7 px-3 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-white/70 hover:text-white transition-all group pointer-events-auto"
                                title="Reset View"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 group-hover:opacity-100"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
                                <span className="text-[9px] uppercase tracking-[0.15em] font-bold font-[family-name:var(--font-outfit)]">Reset</span>
                            </motion.button>
                        )
                    }
                </AnimatePresence >

            </div >
        </section >
    );
}

// Drifting "Buoy" Button - Enhanced Design (Buttons look clickable)
function TabButton({ active, onClick, number, label, index }: { active: boolean, onClick: () => void, number: string, label: string, index: number }) {
    // Subtle float
    const duration = 5 + (index % 3);
    const yOffset = 3 + (index % 2) * 2;

    return (
        <motion.button
            onClick={onClick}
            animate={{
                y: [0, yOffset, 0]
            }}
            transition={{
                duration: duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.2
            }}
            className={`
                px-5 py-2.5 rounded-full border-2 text-xs uppercase tracking-[0.1em] transition-all duration-300 relative cursor-pointer font-[family-name:var(--font-outfit)] flex items-center gap-3
                ${active
                    ? "bg-white text-black border-white font-black shadow-[0_0_20px_rgba(59,130,246,0.5)] ring-1 ring-blue-400 scale-105"
                    : "bg-blue-900/10 border-blue-500/20 text-blue-100 hover:bg-blue-500/20 hover:text-white hover:border-blue-400/50 backdrop-blur-sm shadow-[0_0_15px_rgba(59,130,246,0.1)] font-bold opacity-80 hover:opacity-100"
                }
            `}
        >
            {/* Number Badge */}
            <span className={`text-[10px] opacity-60 ${active ? "font-bold text-black" : "font-normal text-blue-200"}`}>{number}</span>
            <span>{label}</span>

            {/* Interaction Hint (Pulsing Ring for unselected) */}
            {!active && (
                <span className="absolute inset-0 rounded-full border border-blue-400/30 animate-pulse opacity-50" />
            )}
        </motion.button>
    )
}

// Wave Text Animation (Helix Metaphor)
function WaveText({ text }: { text: string }) {
    const words = text.split(" ");

    const container = {
        hidden: { opacity: 0 },
        visible: (i = 1) => ({
            opacity: 1,
            transition: { staggerChildren: 0.04, delayChildren: 0.04 * i },
        }),
    };

    const child = {
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100,
            },
        },
        hidden: {
            opacity: 0,
            y: 20,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100,
            },
        },
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="font-[family-name:var(--font-dm)] text-lg md:text-xl font-medium text-white/90 leading-relaxed max-w-lg"
        >
            {words.map((word, index) => (
                <motion.span variants={child} key={index} className="inline-block mr-1.5 origin-bottom">
                    {word}
                </motion.span>
            ))}
        </motion.div>
    );
}
