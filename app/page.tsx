"use client";

import React, { useRef, useEffect, useState, MouseEvent } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionTemplate, useMotionValue } from 'framer-motion';
import { Wind, MousePointer2 } from 'lucide-react';
import AmbientSound from './components/AmbientSound';
import { CartProvider } from './context/CartContext';
import dynamic from 'next/dynamic';


// LOADER COMPONENT (Extracted for Stability)
const ModelLoader = () => (
    <div className="h-screen bg-[#111] flex items-center justify-center">
        <span className="text-white/30 text-xs uppercase tracking-widest animate-pulse">Loading Model...</span>
    </div>
);

const ModelSection = dynamic(() => import('./components/ModelSection'), {
    loading: ModelLoader,
    ssr: false
});
const ProductSection = dynamic(() => import('./components/ProductSection'), { ssr: false });
const CartOverlay = dynamic(() => import('./components/CheckoutOverlay').then(mod => mod.CartOverlay), { ssr: false });
const CheckoutOverlay = dynamic(() => import('./components/CheckoutOverlay').then(mod => mod.CheckoutOverlay), { ssr: false });

const FRAME_COUNT = 200;
const IMAGE_PATH_PREFIX = "/sequence/schwerelos/Design_ohne_Titel_";
const IMAGE_EXTENSION = ".jpg";

// Epic Narrative - Keywords Only (Restored)
const NARRATIVE_POINTS = [
    { text: "SCHWERELOS", start: 0.1, end: 0.25 }, // Starts earlier, overlaps with hero fade
    { text: "AUFSTIEG", start: 0.3, end: 0.45 },
    { text: "IMPULS", start: 0.55, end: 0.7 },
    { text: "AUFLÖSUNG", start: 0.8, end: 0.95 },
];

// --- HAWAII TRAIL (Desktop Only) ---
function MouseTrail() {
    const mouseX = useMotionValue(-100);
    const mouseY = useMotionValue(-100);

    const springX = useSpring(mouseX, { stiffness: 100, damping: 25 });
    const springY = useSpring(mouseY, { stiffness: 100, damping: 25 });

    useEffect(() => {
        const handleMouseMove = (e: globalThis.MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    // Hidden on mobile (block -> md:block)
    return (
        <motion.div
            style={{ x: springX, y: springY }}
            className="hidden md:block fixed top-0 left-0 w-64 h-64 bg-white/5 blur-[80px] rounded-full pointer-events-none z-[999] mix-blend-screen -translate-x-1/2 -translate-y-1/2"
        />
    );
}

// --- LIVING CRYSTAL LETTER ---
const LivingCrystalLetter = ({ letter, index }: { letter: string, index: number }) => {
    return (
        <div className="relative inline-block cursor-default select-none px-[0.1vw] py-4 group">

            {/* Base Text */}
            <motion.span
                className="
                    relative z-10 block text-[14vw] md:text-[13vw] font-[family-name:var(--font-outfit)] font-black tracking-[-0.05em] leading-[0.8]
                    text-transparent bg-clip-text
                "
                style={{
                    backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(200,220,255,0.8) 50%, rgba(255,255,255,0.9) 100%)',
                }}
                animate={{
                    scaleY: [1, 1.15, 1], // More stretch
                    y: [0, -15, 0], // Deeper float (was -2)
                }}
                transition={{
                    duration: 6, // Much slower (was 3)
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.2 // Slower ripple
                }}
            >
                {letter}

                {/* Sheen */}
                <motion.span
                    className="absolute inset-0 block bg-clip-text text-transparent mix-blend-overlay"
                    style={{
                        backgroundImage: 'linear-gradient(120deg, transparent 30%, white 50%, transparent 70%)',
                        backgroundSize: '200% 100%'
                    }}
                    animate={{
                        backgroundPosition: ['100% 0%', '-100% 0%']
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.1
                    }}
                >
                    {letter}
                </motion.span>
            </motion.span>

            {/* Glow */}
            <motion.span
                className="
                    absolute inset-0 z-[-1]
                    block text-[14vw] md:text-[13vw] font-[family-name:var(--font-outfit)] font-black tracking-[-0.05em] leading-[0.8]
                    text-white/30 blur-[20px]
                "
                animate={{
                    opacity: [0.3, 0.6, 0.3],
                    scale: [0.95, 1.05, 0.95],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.15
                }}
            >
                {letter}
            </motion.span>
        </div>
    );
};

// --- SPOTLIGHT CARD ---
function SpotlightCard({ children, className = "", colSpan = "col-span-1", rowSpan = "row-span-1", id = "" }: { children: React.ReactNode; className?: string; colSpan?: string; rowSpan?: string; id?: string }) {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <div
            id={id}
            className={`relative border border-white/5 bg-neutral-900/50 backdrop-blur-sm overflow-hidden rounded-[2rem] group ${colSpan} ${rowSpan} ${className}`}
            onMouseMove={handleMouseMove}
        >
            {/* REMOVED: Old centralized Touch Icon (Now per-tile) */}

            {/* Spotlight only visible on hover (Desktop) */}
            <motion.div
                className="pointer-events-none absolute -inset-px opacity-0 transition duration-500 group-hover:opacity-100"
                style={{
                    background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(255,255,255,0.05),
              transparent 80%
            )
          `,
                }}
            />
            <div className="relative h-full">{children}</div>
        </div>
    );
}

// --- RESTORED: Narrative Text Component ---
function NarrativeText({ data, scrollYProgress }: { data: any, scrollYProgress: any }) {
    const opacity = useTransform(
        scrollYProgress,
        [data.start, data.start + 0.05, data.end - 0.05, data.end],
        [0, 1, 1, 0]
    );

    const scale = useTransform(
        scrollYProgress,
        [data.start, data.end],
        [0.8, 1.2]
    );

    const y = useTransform(
        scrollYProgress,
        [data.start, data.end],
        [100, -100]
    );

    return (
        <motion.div style={{ opacity, scale, y }} className="absolute w-full text-center flex justify-center items-center">
            <h1 className="font-[family-name:var(--font-outfit)] text-[12vw] font-black text-white leading-none tracking-tighter uppercase blur-sm md:blur-0 mix-blend-difference">
                {data.text}
            </h1>
        </motion.div>
    );
}

export default function Home() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [images, setImages] = useState<HTMLImageElement[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // --- SCROLL LOGIC ---
    // Header Visibility: Hide when leaving Hero Section (approx 800px)
    const { scrollY } = useScroll();
    // Opacity: 1 -> 0 between 80vh and 100vh
    const headerOpacity = useTransform(scrollY, [600, 800], [1, 0]);
    const headerPointerEvents = useTransform(scrollY, (y) => y > 800 ? "none" : "auto");

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const ySlow = useTransform(scrollYProgress, [0, 1], [0, -200]);
    const opacityHero = useTransform(scrollYProgress, [0, 0.4], [1, 0]); // Fade out later for overlap

    // Image Preloader - Batched Strategy for Speed
    useEffect(() => {
        const loadBatch = async (start: number, end: number) => {
            const promises = [];
            for (let i = start; i <= end; i++) {
                if (i > FRAME_COUNT) break;
                const promise = new Promise<void>((resolve) => {
                    const img = new Image();
                    const paddedIndex = i.toString().padStart(3, "0");
                    img.src = `${IMAGE_PATH_PREFIX}${paddedIndex}${IMAGE_EXTENSION}`;
                    img.onload = () => {
                        setImages(prev => {
                            const newImages = [...prev];
                            newImages[i - 1] = img;
                            return newImages;
                        });
                        resolve();
                    };
                    img.onerror = () => resolve();
                });
                promises.push(promise);
            }
            await Promise.all(promises);
        };

        const initLoad = async () => {
            // SAFETY TIMEOUT: Ensure site always opens after 4s (prevent infinite loading)
            const safetyTimer = setTimeout(() => {
                console.warn("Preloader timeout - Forcing entry");
                setIsLoaded(true);
            }, 4000);

            // 1. Priority Batch: First 30 frames (Immediate interaction)
            await loadBatch(1, 30);

            clearTimeout(safetyTimer); // Cancel safety timer if fast enough
            setIsLoaded(true);

            // 2. Background Batch: Rest of the sequence
            // Using requestIdleCallback if available, or setTimeout to yield to main thread
            const loadRest = () => loadBatch(31, FRAME_COUNT);
            if ('requestIdleCallback' in window) {
                (window as any).requestIdleCallback(loadRest);
            } else {
                setTimeout(loadRest, 100);
            }
        };

        initLoad();
    }, []);

    // Canvas Renderer
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sculptureSectionRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress: stickyProgress } = useScroll({ target: sculptureSectionRef, offset: ["start start", "end end"] });

    // --- SCROLL PHYSICS ---
    // User requested "Slippery/Fast" (Rutschig). Low damping helps.
    const smoothProgress = useSpring(stickyProgress, { mass: 0.1, stiffness: 100, damping: 12, restDelta: 0.001 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !isLoaded || images.length === 0) return;
        const ctx = canvas.getContext("2d", { alpha: true });
        if (!ctx) return;
        // OPTIMIZATION: Cap DPR at 2. Higher values (3x, 4x) kill performance on mobile with negligible visual gain.
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const render = () => {
            const p = smoothProgress.get();
            const clamped = Math.max(0, Math.min(1, p));
            const frameIndex = Math.min(FRAME_COUNT - 1, Math.floor(clamped * (FRAME_COUNT - 1)));
            const img = images[frameIndex];
            if (img) {
                canvas.width = window.innerWidth * dpr;
                canvas.height = window.innerHeight * dpr;
                ctx.scale(dpr, dpr);
                canvas.style.width = `${window.innerWidth}px`;
                canvas.style.height = `${window.innerHeight}px`;
                ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
                const scale = Math.max(window.innerWidth / img.width, window.innerHeight / img.height); // Cover
                const w = img.width * scale;
                const h = img.height * scale;
                const x = (window.innerWidth - w) / 2;
                const y = (window.innerHeight - h) / 2;
                ctx.drawImage(img, x, y, w, h);
            }
        };
        const unsubscribe = smoothProgress.on("change", render);
        const handleResize = () => render();
        window.addEventListener("resize", handleResize);
        render(); // Force initial draw
        return () => { unsubscribe(); window.removeEventListener("resize", handleResize); };
    }, [isLoaded, images, smoothProgress]);

    const canvasOpacity = useTransform(stickyProgress, [0, 0.05, 0.95, 1], [0, 1, 1, 0]);

    return (
        // MOBILE FIX: Cursor-none only on md+ screens. Touch devices need normal cursor/feedback.
        <CartProvider>
            <div ref={containerRef} className="bg-[#030303] text-slate-200 font-sans selection:bg-white/20 overflow-x-hidden relative md:cursor-none cursor-auto">

                {/* ETHEREAL MOUSE TRAIL (Desktop Only) */}
                <MouseTrail />

                {/* FIXED CANVAS LAYER */}
                <motion.div style={{ opacity: canvasOpacity }} className="fixed inset-0 w-full h-full z-[15] pointer-events-none">
                    <canvas ref={canvasRef} className="w-full h-full object-cover" />
                </motion.div>

                {/* LOADING (Soft Fade) */}
                <div className={`fixed inset-0 z-[200] bg-[#030303] flex flex-col items-center justify-center transition-opacity duration-[2000ms] pointer-events-none ${isLoaded ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="w-px h-16 bg-gradient-to-b from-transparent via-white/50 to-transparent animate-pulse" />
                </div>

                {/* BACKGROUND ATMOSPHERE */}
                <div className="fixed inset-0 pointer-events-none z-[1]">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
                    <div className="absolute inset-0 bg-radial-gradient from-transparent to-[#030303] opacity-80" />
                </div>

                {/* NAV - TEXT BRANDING (HIDES ON SCROLL) */}
                <motion.nav
                    style={{ opacity: headerOpacity, pointerEvents: headerPointerEvents }}
                    className="fixed top-0 w-full z-[100] flex justify-between items-center p-8 md:p-12 transition-none"
                >
                    <div className="font-[family-name:var(--font-outfit)] text-white tracking-widest uppercase flex items-baseline gap-1.5 cursor-default select-none">
                        <span className="font-bold text-xl md:text-2xl leading-none translate-y-[1px]">©</span>
                        <div className="flex items-baseline">
                            <span className="font-bold text-base md:text-lg">NF</span>
                            <span className="font-light text-base md:text-lg ml-1">DESIGN</span>
                        </div>
                    </div>
                    <div className="hidden md:flex gap-12 font-[family-name:var(--font-dm)] text-xs uppercase tracking-[0.2em] text-white/30">
                        <a href="#skulptur" className="cursor-pointer hover:text-white transition-colors duration-500">Skulptur</a>
                        <a href="#aesthetik" className="cursor-pointer hover:text-white transition-colors duration-500">Ästhetik</a>
                        <a href="#kontakt" className="cursor-pointer hover:text-white transition-colors duration-500">Kontakt</a>
                    </div>
                </motion.nav>

                {/* 1. HERO SECTION */}
                <header className="snap-section relative h-screen flex flex-col items-center justify-center z-20 w-full overflow-hidden bg-transparent perspective-[1000px]">
                    <motion.div
                        style={{ opacity: opacityHero, y: ySlow }}
                        className="text-center relative flex flex-col items-center w-full px-4"
                    >
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.4 }}
                            transition={{ delay: 1, duration: 3 }}
                            className="text-[10px] md:text-xs font-[family-name:var(--font-outfit)] uppercase tracking-[0.8em] text-white/40 mb-16 block"
                        >
                            NFD — 2026
                        </motion.span>

                        <div className="w-full flex justify-center flex-wrap px-8 py-10">
                            {['S', 'c', 'h', 'w', 'e', 'r', 'e', 'l', 'o', 's'].map((char, i) => (
                                <LivingCrystalLetter key={i} letter={char} index={i} />
                            ))}
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3, duration: 2 }}
                            className="mt-24 flex flex-col items-center"
                        >
                            <p className="text-sm font-[family-name:var(--font-dm)] text-white/40 tracking-widest uppercase">
                                Wenn Materie zu atmen beginnt
                            </p>
                            <div className="w-px h-12 bg-gradient-to-b from-white/20 to-transparent mt-8" />
                        </motion.div>
                    </motion.div>
                </header>

                {/* 2. SCROLL SECTION */}
                <section ref={sculptureSectionRef} id="skulptur" className="snap-section relative h-[1000vh] z-20 pointer-events-none">
                    <div className="sticky top-0 h-screen w-full flex items-center justify-center">
                        <div className="absolute inset-0 flex flex-col justify-center">
                            <div className="max-w-[1600px] mx-auto w-full px-8 relative h-full flex items-center justify-center mix-blend-difference z-30">
                                {/* RESTORED: Narrative Text Overlay (Glass Effect) */}
                                {NARRATIVE_POINTS.map((point, index) => (
                                    <NarrativeText key={index} data={point} scrollYProgress={stickyProgress} />
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. BENTO GRID */}
                <section id="aesthetik" className="snap-section relative z-30 bg-[#030303] py-8 px-2 md:px-6 min-h-screen flex items-center">
                    <div className="max-w-[1800px] mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-1.5 md:gap-3">



                        {/* TILE 2: PHILOSOPHY */}
                        <SpotlightCard colSpan="md:col-span-4" rowSpan="md:row-span-1" className="min-h-[400px]">
                            {/* Blue Theme Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-transparent pointer-events-none" />
                            <div className="p-10 flex flex-col justify-between h-full relative z-10">
                                <Wind className="w-12 h-12 text-white/5 absolute top-10 right-10" />
                                <div>
                                    <span className="text-xs uppercase tracking-widest text-white/30 mb-4 block">Psychologie</span>
                                    <h4 className="text-4xl md:text-5xl font-[family-name:var(--font-outfit)] text-white font-light leading-snug">"Schwerelosigkeit ist kein Ort, <br /> sondern ein <span className="italic text-white/50">Zustand</span>."</h4>
                                </div>
                                <div className="max-h-0 opacity-0 group-hover:max-h-[200px] group-hover:opacity-100 transition-all duration-700 overflow-hidden text-lg font-[family-name:var(--font-dm)] text-white/60 leading-relaxed font-medium">
                                    <p className="text-lg">Schwerelosigkeit beginnt im Geist. Es ist der Moment, in dem die Schwere des Alltags einer inneren Leichtigkeit weicht. Meine Arbeit ist die Übersetzung dieses mentalen Loslassens in eine sichtbare Form – ein Aufstieg, der keine Kraft benötigt.</p>
                                </div>
                            </div>
                            {/* TOUCH ICON: Bottom Right */}
                            <div className="absolute z-20 flex items-center justify-center opacity-40 group-hover:opacity-0 transition-opacity duration-500 pointer-events-none bottom-6 right-6">
                                <div className="relative">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-white relative z-10">
                                        <path d="M12 10a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2 2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2z" />
                                        <path d="M9.5 7.5a4.5 4.5 0 0 1 5 0" />
                                        <path d="M7 5a7 7 0 0 1 10 0" />
                                    </svg>
                                    <motion.div className="absolute inset-0 bg-white/20 rounded-full" animate={{ scale: [1, 2.5], opacity: [0.4, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }} />
                                    <motion.div className="absolute inset-0 bg-white/10 rounded-full" animate={{ scale: [1, 3], opacity: [0.3, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }} />
                                </div>
                            </div>
                        </SpotlightCard>

                        {/* TILE 3: ARTIST */}
                        <SpotlightCard colSpan="md:col-span-4" rowSpan="md:row-span-2" className="min-h-[500px] md:min-h-[600px]">
                            {/* ROUND 12: FORCE CENTER */}
                            <img src="/sequence/Niklas/image.png" alt="Niklas Fiedler" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover object-center filter grayscale opacity-80 group-hover:opacity-100 transition-all duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-transparent opacity-90" />
                            {/* Blue Theme Overlay */}
                            <div className="absolute inset-0 bg-blue-900/5 mix-blend-overlay pointer-events-none" />
                            <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full">
                                <div className="h-px w-12 bg-white/20 mb-4" />
                                <h3 className="text-3xl md:text-5xl font-[family-name:var(--font-outfit)] font-black text-white mb-2 tracking-tight group-hover:text-white text-white/70 transition-colors duration-500">Niklas Fiedler</h3>
                                <p className="text-base md:text-lg font-[family-name:var(--font-dm)] text-white/60 mb-6 font-medium group-hover:opacity-100 opacity-60 transition-opacity duration-500">Creator & Designer</p>
                                <div className="max-h-0 opacity-0 group-hover:max-h-[500px] group-hover:opacity-100 transition-all duration-500 overflow-hidden">
                                    <p className="text-lg font-[family-name:var(--font-dm)] text-white/80 leading-relaxed border-l border-white/10 pl-4">Für mich bedeutet Gestalten, Barrieren im Kopf abzubauen. Ich lasse meinen Impulsen freien Lauf, um das Unmögliche sichtbar zu machen: das Gefühl von absoluter Schwerelosigkeit.</p>
                                </div>
                            </div>
                            {/* TOUCH ICON: Bottom Right */}
                            <div className="absolute z-20 flex items-center justify-center opacity-40 group-hover:opacity-0 transition-opacity duration-500 pointer-events-none bottom-6 right-6">
                                <div className="relative">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-white relative z-10">
                                        <path d="M12 10a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2 2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2z" />
                                        <path d="M9.5 7.5a4.5 4.5 0 0 1 5 0" />
                                        <path d="M7 5a7 7 0 0 1 10 0" />
                                    </svg>
                                    <motion.div className="absolute inset-0 bg-white/20 rounded-full" animate={{ scale: [1, 2.5], opacity: [0.4, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }} />
                                    <motion.div className="absolute inset-0 bg-white/10 rounded-full" animate={{ scale: [1, 3], opacity: [0.3, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }} />
                                </div>
                            </div>
                        </SpotlightCard>

                        {/* TILE 4: CONTEXT (Dark Mode, Tight Spacing, Color Hint) */}
                        <SpotlightCard colSpan="md:col-span-4" rowSpan="md:row-span-1" className="min-h-[300px] border border-white/10 relative bg-[#080808] overflow-hidden">
                            {/* Subtle Color Hint Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-transparent pointer-events-none" />

                            <div className="p-8 flex flex-col h-full relative z-10">

                                {/* Header Group - Tighter Spacing */}
                                <div className="mb-2">
                                    <div className="flex justify-between items-start mb-2 group-hover:opacity-100 opacity-60 transition-opacity duration-500">
                                        <span className="text-[10px] md:text-xs uppercase tracking-widest font-bold text-white/40">Studium & Kontext</span>
                                    </div>
                                    {/* Spacing Fix: Adjusted Higher (Round 27) */}
                                    <h5 className="text-3xl md:text-5xl font-[family-name:var(--font-outfit)] font-black leading-none text-white mt-auto pt-4 md:pt-6 mb-4 tracking-tight relative z-10 group-hover:text-white text-white/70 transition-colors duration-500">
                                        B.Sc. Technisches<br /> Design
                                    </h5>
                                </div>

                                {/* LOGOS - Moved up to avoid overlap */}
                                <div className="absolute top-6 right-6 flex items-center gap-4 flex-wrap justify-end max-w-[50%]">
                                    {/* THI: Pure White Invert */}
                                    <img src="/logos/thi.png" alt="THI Logo" loading="lazy" decoding="async" className="h-8 md:h-10 w-auto object-contain invert opacity-90" />

                                    <div className="h-6 w-px bg-white/20 hidden md:block" />

                                    {/* Audi: FINAL PNG (No Filters) */}
                                    <img
                                        src="/logos/Audie Akademie.png"
                                        alt="Audi Academy"
                                        loading="lazy" decoding="async"
                                        className="h-10 md:h-12 w-auto object-contain transition-all duration-500 hover:scale-105"
                                    />
                                </div>

                                {/* Text Content */}
                                <div className="mt-4 pt-4 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                    <p className="text-lg font-[family-name:var(--font-dm)] text-white/80 leading-relaxed font-medium">
                                        Projektarbeit von Niklas Fiedler an der technischen Hochschule Ingolstadt und Audi Akademie.
                                    </p>
                                </div>
                            </div>
                            {/* TOUCH ICON: Bottom Right */}
                            <div className="absolute z-20 flex items-center justify-center opacity-40 group-hover:opacity-0 transition-opacity duration-500 pointer-events-none bottom-6 right-6">
                                <div className="relative">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-white relative z-10">
                                        <path d="M12 10a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2 2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2z" />
                                        <path d="M9.5 7.5a4.5 4.5 0 0 1 5 0" />
                                        <path d="M7 5a7 7 0 0 1 10 0" />
                                    </svg>
                                    <motion.div className="absolute inset-0 bg-white/20 rounded-full" animate={{ scale: [1, 2.5], opacity: [0.4, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }} />
                                    <motion.div className="absolute inset-0 bg-white/10 rounded-full" animate={{ scale: [1, 3], opacity: [0.3, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }} />
                                </div>
                            </div>
                        </SpotlightCard>
                    </div>
                </section>



                {/* 4. 3D ANTIGRAVITY SECTION */}
                {/* Negative Top Margin for Tighter Connection */}
                <div className="md:-mt-12 py-0 relative z-20">
                    <ModelSection />
                </div>



                {/* 5. PRODUCT ORDER SECTION */}
                <div className="mb-2 w-full max-w-[1400px]">
                    <ProductSection />
                </div>
                {/* 6. CONTACT SECTION - Tighter Layout (gap-2 equivalent) */}
                <section id="kontakt" className="py-2 px-2 md:px-12 bg-[#020205] flex justify-center -mt-4">
                    <div className="max-w-[1200px] w-full relative border border-white/10 rounded-[3rem] overflow-hidden bg-[#0a0a0a] min-h-[200px] flex items-center shadow-2xl">
                        {/* Enhanced Blue Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-transparent to-purple-900/10 opacity-80" />
                        <div className="p-8 md:p-12 flex flex-col md:flex-row justify-between items-center h-full relative z-10 w-full">
                            <div className="text-center md:text-left mb-8 md:mb-0">
                                <div className="flex items-center justify-center md:justify-start gap-6 mb-4">
                                    <MousePointer2 className="w-8 h-8 text-white" />
                                    <h3 className="text-5xl md:text-7xl font-[family-name:var(--font-outfit)] font-black text-white tracking-tighter">Projekt<br />anfragen</h3>
                                </div>
                                <p className="text-white/50 font-[family-name:var(--font-dm)] text-base max-w-md">Lass uns gemeinsam etwas Großartiges erschaffen. Der nächste Schritt ist nur einen Klick entfernt.</p>
                            </div>

                            <a href="mailto:nif3527@thi.de" className="px-12 py-6 rounded-full bg-white text-black text-sm font-black uppercase tracking-[0.2em] hover:scale-105 transition-transform shadow-[0_0_50px_rgba(255,255,255,0.4)] hover:shadow-[0_0_80px_rgba(255,255,255,0.6)]">
                                Contact Studio
                            </a>
                        </div>
                    </div>
                </section>

                <CartOverlay />
                <CheckoutOverlay />

                <footer className="py-24 border-t border-white/5 bg-[#050505] text-center relative z-20 flex flex-col items-center">
                    {/* NFD Logo in Footer (White Asset, No Filters) */}
                    <img src="/logos/NFD SW.png" alt="NFD Logo" className="h-24 w-auto object-contain mb-8" />

                    <span className="font-[family-name:var(--font-outfit)] font-bold text-2xl text-white/10 tracking-tighter">SCHWERELOS</span>
                    <p className="text-[10px] text-white/20 mt-4 font-[family-name:var(--font-dm)] uppercase tracking-widest">© 2026 NFD Niklas Fiedler Design</p>
                    <div className="flex justify-center gap-6 mt-6">
                        <a href="/impressum" className="text-[10px] text-white/20 hover:text-white font-[family-name:var(--font-dm)] uppercase tracking-widest transition-colors">Impressum</a>
                        <a href="/datenschutz" className="text-[10px] text-white/20 hover:text-white font-[family-name:var(--font-dm)] uppercase tracking-widest transition-colors">Datenschutz</a>
                    </div>
                </footer>

                {/* GENERATIVE AUDIO SYSTEM */}
                <AmbientSound scrollProgress={smoothProgress} />

                {/* DEBUG: Version Badge (To confirm deployment) */}
                <div className="fixed bottom-2 right-2 z-50 text-[10px] text-white/20 font-mono pointer-events-none">
                    v0.1.7-header-big
                </div>
            </div >
        </CartProvider >
    );
}
