"use client";

import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { MotionValue, useMotionValueEvent, motion } from 'framer-motion';

// --- HANS ZIMMER ENGINE (Short Version + Infinite Depth) ---
// Source: HansZimmer_Short.mp3
// Logic: 
// - Start: Deep/Muffled (Lowpass 100Hz).
// - Middle (Sculpture): Full Open (20kHz).
// - End: Deep/Muffled again (Lowpass 100Hz). -> "Am Ende auch dumpfes Hintergrundgeräusch".

interface AmbientSoundProps {
    scrollProgress: MotionValue<number>;
}

export default function AmbientSound({ scrollProgress }: AmbientSoundProps) {
    const [isMuted, setIsMuted] = useState(true);

    // Audio Graph
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioElementRef = useRef<HTMLAudioElement | null>(null);
    const filterNodeRef = useRef<BiquadFilterNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);

    // Initialization (Must be user-triggered)
    const initAudio = () => {
        if (audioContextRef.current) {
            if (audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume();
            }
            if (audioElementRef.current?.paused) {
                audioElementRef.current.play().catch(e => console.error("Playback failed:", e));
            }
            setIsMuted(false);
            return;
        }

        const Ctx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new Ctx();
        audioContextRef.current = ctx;

        // 1. Source (New Short File)
        const audio = new Audio("/HansZimmer_Short.mp3");
        audio.loop = true;
        audio.crossOrigin = "anonymous";
        audioElementRef.current = audio;

        const source = ctx.createMediaElementSource(audio);

        // 2. Filter (The "Depth" Effect)
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 100; // Start Deep
        filter.Q.value = 1;
        filterNodeRef.current = filter;

        // 3. Volume
        const gain = ctx.createGain();
        gain.gain.value = 0.5;
        gainNodeRef.current = gain;

        // Connect
        source.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        // Play
        audio.play().then(() => setIsMuted(false)).catch(e => console.error("Autoplay blocked:", e));
    };

    const toggleSound = () => {
        if (!audioContextRef.current) {
            initAudio();
        } else {
            if (isMuted) {
                audioContextRef.current.resume();
                audioElementRef.current?.play();
                setIsMuted(false);
            } else {
                audioContextRef.current.suspend();
                audioElementRef.current?.pause();
                setIsMuted(true);
            }
        }
    };

    // --- HINT LOGIC ---
    const [showHint, setShowHint] = useState(false);

    useMotionValueEvent(scrollProgress, "change", (latest) => {
        // Toggle hint based on scroll position (Top 5%)
        setShowHint(latest < 0.05);

        // ... existing audio logic ...
        if (!audioContextRef.current || !filterNodeRef.current || !gainNodeRef.current) return;
        const now = audioContextRef.current.currentTime;
        const dist = Math.abs(latest - 0.5) * 2;
        const intensity = 1.0 - dist;
        const targetFreq = 100 * Math.pow(200, intensity);
        const targetVol = 0.4 + (intensity * 0.6);
        const safeFreq = Math.max(20, Math.min(22000, targetFreq));
        filterNodeRef.current.frequency.setTargetAtTime(safeFreq, now, 0.1);
        gainNodeRef.current.gain.setTargetAtTime(targetVol, now, 0.1);
    });

    // Initial check on mount
    useEffect(() => {
        const checkScroll = () => {
            const current = scrollProgress.get();
            setShowHint(current < 0.05);
        };
        // Small delay to ensure motion value is initialized
        const timer = setTimeout(checkScroll, 100);
        return () => clearTimeout(timer);
    }, [scrollProgress]);

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-4">
            {/* HINT ARROW (Visible if Muted & Top of Page) */}
            {isMuted && showHint && (
                <div
                    className="flex items-center gap-3 pointer-events-none"
                    style={{ zIndex: 200 }}
                >
                    <span className="text-[10px] uppercase tracking-widest text-white/80 font-bold font-[family-name:var(--font-outfit)] whitespace-nowrap drop-shadow-md">Ton an für volles Erlebnis</span>
                    <motion.svg
                        width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                        className="text-white w-6 h-6"
                        animate={{ x: [-5, 0, -5] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    >
                        <path d="M12 5v14" />
                        <path d="M19 12l-7 7-7-7" />
                    </motion.svg>
                </div>
            )}

            <button
                onClick={toggleSound}
                className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center"
            >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
        </div>
    );
}
