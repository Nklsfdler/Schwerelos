"use client";

import React, { useRef, useEffect, useState, MouseEvent } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionTemplate, useMotionValue, useMotionValueEvent } from 'framer-motion';
import { Wind, Sparkles, MousePointer2, Volume2, VolumeX } from 'lucide-react';
import AmbientSound from './components/AmbientSound';

const FRAME_COUNT = 104;
const IMAGE_PATH_PREFIX = "/sequence/ezgif-frame-";
const IMAGE_EXTENSION = ".jpg";

// --- HAWAII TRAIL (Ethereal Glow) ---
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

    return (
        <motion.div
            style={{ x: springX, y: springY }}
            className="fixed top-0 left-0 w-64 h-64 bg-white/5 blur-[80px] rounded-full pointer-events-none z-[999] mix-blend-screen -translate-x-1/2 -translate-y-1/2"
        />
    );
}

// --- LIVING CRYSTAL LETTER (True Liquid) ---
// "Liquid Glass somehow" -> Organic breathing + Liquid Gradient
const LivingCrystalLetter = ({ letter, index }: { letter: string, index: number }) => {
    return (
        <div className="relative inline-block cursor-default select-none px-[0.1vw] py-4 group">

            {/* 1. Base Text (Breathing Liquid Form) */}
            <motion.span
                className="
                    relative z-10 block text-[14vw] md:text-[13vw] font-[family-name:var(--font-outfit)] font-black tracking-[-0.05em] leading-[0.8]
                    text-transparent bg-clip-text
                "
                style={{
                    // Liquid: A gradient that looks like water surface
                    backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(200,220,255,0.8) 50%, rgba(255,255,255,0.9) 100%)',
                }}
                animate={{
                    // The "Liquid" Form Change: Scales Y slightly to look like a droplet or breathing matter
                    scaleY: [1, 1.08, 1],
                    y: [0, -2, 0],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.15
                }}
            >
                {letter}

                {/* SHEEN (The 'Glass' Reflection) */}
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

            {/* 2. GLOW (Atmosphere) */}
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

export default function Home() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [images, setImages] = useState<HTMLImageElement[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // --- SCROLL LOGIC ---
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const ySlow = useTransform(scrollYProgress, [0, 1], [0, -200]);
    const opacityHero = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

    // Image Preloader
    useEffect(() => {
        const loadImages = async () => {
            const loaded: HTMLImageElement[] = [];
            const promises = [];

            for (let i = 1; i <= FRAME_COUNT; i++) {
                const promise = new Promise<void>((resolve) => {
                    const img = new Image();
                    const paddedIndex = i.toString().padStart(3, "0");
                    img.src = `${IMAGE_PATH_PREFIX}${paddedIndex}${IMAGE_EXTENSION}`;
                    img.onload = () => resolve();
                    img.onerror = () => resolve();
                    loaded[i - 1] = img;
                });
                promises.push(promise);
            }

            await Promise.all(promises);
            setImages(loaded.filter(Boolean));
            setIsLoaded(true);
        };
        loadImages();
    }, []);

    // Canvas Renderer
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sculptureSectionRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress: stickyProgress } = useScroll({ target: sculptureSectionRef, offset: ["start start", "end end"] });

    // --- SCROLL PHYSICS (Rutschiger/Fast Glide) ---
    // Lower damping = 'Oilier' / Faster glide. From 20 to 12.
    const smoothProgress = useSpring(stickyProgress, { mass: 0.1, stiffness: 100, damping: 12, restDelta: 0.001 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !isLoaded || images.length === 0) return;
        const ctx = canvas.getContext("2d", { alpha: true });
        if (!ctx) return;
        const dpr = window.devicePixelRatio || 1;
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
        <div ref={containerRef} className="bg-[#030303] text-slate-200 font-sans selection:bg-white/20 overflow-x-hidden relative cursor-none">

            {/* ETHEREAL MOUSE TRAIL */}
            <MouseTrail />

            {/* FIXED CANVAS LAYER */}
            <motion.div style={{ opacity: canvasOpacity }} className="fixed inset-0 w-full h-full z-[15] pointer-events-none">
                <canvas ref={canvasRef} className="w-full h-full object-cover" />
            </motion.div>

            {/* LOADING (Soft Fade) */}
            <div className={`fixed inset-0 z-[200] bg-[#030303] flex flex-col items-center justify-center transition-opacity duration-[2000ms] pointer-events-none ${isLoaded ? 'opacity-0' : 'opacity-100'}`}>
                <div className="w-px h-16 bg-gradient-to-b from-transparent via-white/50 to-transparent animate-pulse" />
            </div>

            {/* BACKGROUND ATMOSPHERE (Pure Light) */}
            <div className="fixed inset-0 pointer-events-none z-[1]">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
                <div className="absolute inset-0 bg-radial-gradient from-transparent to-[#030303] opacity-80" />
            </div>

            {/* NAV - STUDIO NF */}
            <nav className="fixed top-0 w-full z-[100] flex justify-between items-center p-8 md:p-12">
                <span className="font-[family-name:var(--font-outfit)] font-light text-xs uppercase tracking-[0.2em] text-white/50">Studio NF</span>
                <div className="hidden md:flex gap-12 font-[family-name:var(--font-dm)] text-xs uppercase tracking-[0.2em] text-white/30">
                    <a href="#skulptur" className="cursor-pointer hover:text-white transition-colors duration-500">Skulptur</a>
                    <a href="#aesthetik" className="cursor-pointer hover:text-white transition-colors duration-500">Ästhetik</a>
                    <a href="#kontakt" className="cursor-pointer hover:text-white transition-colors duration-500">Kontakt</a>
                </div>
            </nav>

            {/* 1. HERO SECTION (LIVING CRYSTAL) */}
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
                        Studio NF — 2026
                    </motion.span>

                    {/* HERO TITLE: LIVING CRYSTAL (NO BOXES, PERMANENT LOOP) */}
                    <motion.div
                        initial={{ opacity: 0, filter: "blur(20px)" }}
                        animate={{
                            opacity: 1,
                            filter: "blur(0px)",
                            y: [0, -20, 0], // The "True Weightless" Levitation
                        }}
                        transition={{
                            opacity: { duration: 2, ease: "easeOut" },
                            filter: { duration: 2, ease: "easeOut" },
                            y: {
                                duration: 8,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }
                        }}
                        className="w-full flex justify-center flex-wrap px-8 py-10"
                    >
                        {['S', 'c', 'h', 'w', 'e', 'r', 'e', 'l', 'o', 's'].map((char, i) => (
                            <LivingCrystalLetter key={i} letter={char} index={i} />
                        ))}
                    </motion.div>

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
                        <div className="max-w-[1600px] mx-auto w-full px-8 relative h-full">
                            <motion.div style={{ opacity: useTransform(stickyProgress, [0.1, 0.2], [0, 1]) }} className="absolute top-[20%] left-4 md:left-24 max-w-sm">
                                <span className="text-xs font-[family-name:var(--font-outfit)] uppercase tracking-[0.2em] text-white/30 mb-2 block">Phase 1</span>
                                <h2 className="text-5xl md:text-7xl font-[family-name:var(--font-outfit)] font-thin tracking-tighter text-white mb-4">Ursprung</h2>
                                <p className="font-[family-name:var(--font-dm)] text-lg text-white/40 border-l border-white/10 pl-6">Ein Gedanke manifestiert sich.<br /> Ohne Gewicht, ohne Zeit.</p>
                            </motion.div>
                            <motion.div style={{ opacity: useTransform(stickyProgress, [0.4, 0.5], [0, 1]) }} className="absolute top-[45%] right-4 md:right-24 max-w-sm text-right">
                                <span className="text-xs font-[family-name:var(--font-outfit)] uppercase tracking-[0.2em] text-white/30 mb-2 block">Phase 2</span>
                                <h2 className="text-5xl md:text-7xl font-[family-name:var(--font-outfit)] font-thin tracking-tighter text-white mb-4">Struktur</h2>
                                <p className="font-[family-name:var(--font-dm)] text-lg text-white/40 border-r border-white/10 pr-6 ml-auto">Parametrische Präzision.<br /> Jede Linie hat ihren Zweck.</p>
                            </motion.div>
                            <motion.div style={{ opacity: useTransform(stickyProgress, [0.75, 0.85], [0, 1]) }} className="absolute bottom-[20%] left-4 md:left-24 max-w-sm">
                                <span className="text-xs font-[family-name:var(--font-outfit)] uppercase tracking-[0.2em] text-white/30 mb-2 block">Phase 3</span>
                                <h2 className="text-5xl md:text-7xl font-[family-name:var(--font-outfit)] font-thin tracking-tighter text-white mb-4">Finale</h2>
                                <p className="font-[family-name:var(--font-dm)] text-lg text-white/40 border-l border-white/10 pl-6">Das Objekt ist vollendet.<br /> Bereit für die Ewigkeit.</p>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. BENTO GRID */}
            <section id="aesthetik" className="snap-section relative z-30 bg-[#030303] py-32 px-4 md:px-8 min-h-screen flex items-center">
                <div className="max-w-[1800px] mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-6">

                    {/* TILE 1: DESIGN DETAIL (Form Aesthetics) */}
                    <SpotlightCard colSpan="md:col-span-8" rowSpan="md:row-span-2" className="min-h-[600px] md:min-h-[800px]">
                        <div className="absolute inset-0 z-0">
                            <img src="/sequence/schwerelos/Whisk_48428d02bced16aba50421a4775f0ffedr.jpeg" alt="Design Detail" className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-1000 pointer-events-none" />
                            <div className="absolute inset-0 bg-gradient-to-r from-[#030303] via-transparent to-[#030303]" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-transparent" />
                        </div>
                        <div className="absolute top-0 left-0 p-8 md:p-12 w-full md:w-2/3 z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/5 bg-white/5 backdrop-blur-sm mb-6">
                                <Sparkles className="w-3 h-3 text-white/60" />
                                <span className="text-[9px] uppercase tracking-widest text-white/60">Ästhetik</span>
                            </div>
                            <h3 className="text-5xl md:text-8xl font-[family-name:var(--font-outfit)] font-bold text-white mb-8 leading-none">Organische <br /> Geometrie.</h3>
                            <div className="max-h-0 opacity-0 group-hover:max-h-[500px] group-hover:opacity-100 transition-all duration-1000 overflow-hidden">
                                <p className="font-[family-name:var(--font-dm)] text-lg text-white/50 leading-relaxed max-w-xl pb-6">
                                    Meine Formsprache folgt dem Instinkt des Aufstiegs. Dynamische, organische Windungen und hauchdünne Verbindungen bilden eine Geometrie, die atmet. Inspiriert von der Sanftheit des Kosmos und der flüchtigen Eleganz von Rauch, entsteht eine Form, die den Geist zur Ruhe kommen lässt.
                                </p>
                            </div>
                        </div>
                    </SpotlightCard>

                    {/* TILE 2: PHILOSOPHY */}
                    <SpotlightCard colSpan="md:col-span-4" rowSpan="md:row-span-1" className="min-h-[400px]">
                        <div className="p-10 flex flex-col justify-between h-full relative z-10">
                            <Wind className="w-12 h-12 text-white/5 absolute top-10 right-10" />
                            <div>
                                <span className="text-[9px] uppercase tracking-widest text-white/30 mb-4 block">Psychologie</span>
                                <h4 className="text-3xl font-[family-name:var(--font-outfit)] text-white font-light leading-snug">"Schwerelosigkeit ist kein Ort, <br /> sondern ein <span className="italic text-white/50">Zustand</span>."</h4>
                            </div>
                            <div className="max-h-0 opacity-0 group-hover:max-h-[200px] group-hover:opacity-100 transition-all duration-700 overflow-hidden text-sm font-[family-name:var(--font-dm)] text-white/40 leading-relaxed">
                                <p>Schwerelosigkeit beginnt im Geist. Es ist der Moment, in dem die Schwere des Alltags einer inneren Leichtigkeit weicht. Meine Arbeit ist die Übersetzung dieses mentalen Loslassens in eine sichtbare Form – ein Aufstieg, der keine Kraft benötigt.</p>
                            </div>
                        </div>
                    </SpotlightCard>

                    {/* TILE 3: ARTIST */}
                    <SpotlightCard colSpan="md:col-span-4" rowSpan="md:row-span-2" className="min-h-[600px]">
                        <img src="/sequence/Niklas/image.png" alt="Niklas Fiedler" className="absolute inset-0 w-full h-full object-cover object-top filter grayscale opacity-80 group-hover:opacity-100 transition-all duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-transparent opacity-90" />
                        <div className="absolute bottom-0 left-0 p-10 w-full">
                            <div className="h-px w-12 bg-white/20 mb-6" />
                            <h3 className="text-4xl font-[family-name:var(--font-outfit)] font-bold text-white mb-2">Niklas Fiedler</h3>
                            <p className="text-sm font-[family-name:var(--font-dm)] text-white/40 mb-6">Creator & Designer</p>
                            <div className="max-h-0 opacity-0 group-hover:max-h-[200px] group-hover:opacity-100 transition-all duration-700 overflow-hidden">
                                <p className="text-sm font-[family-name:var(--font-dm)] text-white/60 leading-relaxed border-l border-white/10 pl-4">Für mich bedeutet Gestalten, Barrieren im Kopf abzubauen. Ich lasse meinen Impulsen freien Lauf, um das Unmögliche sichtbar zu machen: das Gefühl von absoluter Schwerelosigkeit.</p>
                            </div>
                        </div>
                    </SpotlightCard>

                    {/* TILE 4: CONTEXT */}
                    <SpotlightCard colSpan="md:col-span-4" rowSpan="md:row-span-1" className="min-h-[300px] bg-white text-black border-none">
                        <div className="bg-white absolute inset-0 text-black p-10 flex flex-col justify-between transition-colors hover:bg-neutral-100">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <span className="text-[9px] uppercase tracking-widest font-bold opacity-30">Context</span>
                                    <h5 className="text-2xl font-[family-name:var(--font-outfit)] font-bold">B.Sc. Technisches<br /> Design</h5>
                                </div>
                                <div className="w-1.5 h-1.5 bg-black rounded-full" />
                            </div>
                            <div className="border-t border-black/5 pt-4 mt-4">
                                <p className="text-xs font-[family-name:var(--font-dm)] opacity-50">🇩🇪 TH Ingolstadt<br /> Semesterprojekt 2026</p>
                            </div>
                        </div>
                    </SpotlightCard>

                    {/* TILE 5: CONTACT */}
                    <SpotlightCard id="kontakt" colSpan="md:col-span-4" rowSpan="md:row-span-1" className="min-h-[300px]">
                        <div className="p-10 flex flex-col justify-center h-full items-center text-center relative z-10">
                            <MousePointer2 className="w-6 h-6 text-white/80 mb-6" />
                            <h3 className="text-2xl font-[family-name:var(--font-outfit)] text-white mb-2">Projekt anfragen</h3>
                            <a href="mailto:niklas@studio-nf.com" className="px-8 py-3 rounded-full border border-white/10 text-[10px] text-white uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all mt-6 inline-block">Contact</a>
                        </div>
                    </SpotlightCard>
                </div>
            </section>

            <footer className="py-24 border-t border-white/5 bg-[#030303] text-center relative z-20">
                <span className="font-[family-name:var(--font-outfit)] font-bold text-2xl text-white/10 tracking-tighter">SCHWERELOS</span>
                <p className="text-[10px] text-white/20 mt-4 font-[family-name:var(--font-dm)] uppercase tracking-widest">© 2026 Studio NF</p>
            </footer>

            {/* GENERATIVE AUDIO SYSTEM */}
            <AmbientSound scrollProgress={smoothProgress} />
        </div>
    );
}
