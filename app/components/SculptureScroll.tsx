"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring, MotionValue } from "framer-motion";
import { clsx } from "clsx";

// Configuration
const FRAME_COUNT = 104;
const IMAGE_PATH_PREFIX = "/sequence/ezgif-frame-";
const IMAGE_EXTENSION = ".jpg";

// Epic Narrative - Keywords Only
const NARRATIVE_POINTS = [
    { text: "SCHWERELOS", start: 0.0, end: 0.15 },
    { text: "AUFSTIEG", start: 0.2, end: 0.35 },
    { text: "IMPULS", start: 0.45, end: 0.6 },
    { text: "AUFLÖSUNG", start: 0.7, end: 0.85 },
];

export default function SculptureScroll() {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [images, setImages] = useState<HTMLImageElement[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    const smoothProgress = useSpring(scrollYProgress, {
        mass: 0.1,
        stiffness: 100,
        damping: 20,
        restDelta: 0.001
    });

    // Preload
    useEffect(() => {
        const loadImages = async () => {
            const loaded: HTMLImageElement[] = [];
            for (let i = 1; i <= FRAME_COUNT; i++) {
                const img = new Image();
                const paddedIndex = i.toString().padStart(3, "0");
                img.src = `${IMAGE_PATH_PREFIX}${paddedIndex}${IMAGE_EXTENSION}`;
                await new Promise<void>((resolve) => {
                    img.onload = () => resolve();
                    img.onerror = () => resolve();
                });
                loaded.push(img);
            }
            setImages(loaded);
            setIsLoading(false);
        };
        loadImages();
    }, []);

    // Canvas Draw
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const render = () => {
            const progress = smoothProgress.get();
            // Clear
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const frameIndex = Math.min(
                FRAME_COUNT - 1,
                Math.floor(progress * (FRAME_COUNT - 1))
            );

            if (images[frameIndex] && images[frameIndex].complete && images[frameIndex].naturalWidth !== 0) {
                const img = images[frameIndex];

                // Calculate "contain" but slightly zoomed for impact
                const hRatio = canvas.width / img.width;
                const vRatio = canvas.height / img.height;
                const ratio = Math.max(hRatio, vRatio) * 0.9; // 0.9 to give breathing room 

                const centerShift_x = (canvas.width - img.width * ratio) / 2;
                const centerShift_y = (canvas.height - img.height * ratio) / 2;

                ctx.drawImage(img, 0, 0, img.width, img.height, centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
            }
        };

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            render();
        };
        window.addEventListener("resize", handleResize);
        handleResize();

        const unsubscribe = smoothProgress.on("change", render);
        return () => {
            window.removeEventListener("resize", handleResize);
            unsubscribe();
        };
    }, [images, smoothProgress]);

    return (
        <div ref={containerRef} className="relative h-[600vh] bg-[#050505] w-full">
            <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">

                {/* Canvas Background */}
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-90" />

                {/* Loading State */}
                {isLoading && (
                    <div className="absolute bottom-8 left-8 text-white/50 animate-pulse font-mono text-xs">
                        INITIALIZING...
                    </div>
                )}

                {/* Massive Typography Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-difference z-20">
                    {NARRATIVE_POINTS.map((point, index) => (
                        <NarrativeText key={index} data={point} scrollYProgress={scrollYProgress} />
                    ))}
                </div>
            </div>
        </div>
    );
}

function NarrativeText({ data, scrollYProgress }: { data: any, scrollYProgress: MotionValue<number> }) {
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
        <motion.div style={{ opacity, scale, y }} className="absolute w-full text-center">
            <h1 className="font-display text-[15vw] font-black text-white leading-none tracking-tighter uppercase blur-sm md:blur-0 sm:text-[18vw] mix-blend-difference">
                {data.text}
            </h1>
        </motion.div>
    );
}
