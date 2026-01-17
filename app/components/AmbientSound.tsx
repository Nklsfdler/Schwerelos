"use client";

import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { MotionValue, useMotionValueEvent } from 'framer-motion';

// --- HANS ZIMMER ENGINE (Filter Modulation) ---
// Source: User provided recording (ScreenRecording... -> HansZimmer_Final.mp3)
// Logic: Starts deep/muffled (Lowpass), Opens up to full brightness at sculpture.
// Default: OFF.

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

        // 1. Source
        const audio = new Audio("/HansZimmer_Final.mp3");
        audio.loop = true;
        audio.crossOrigin = "anonymous";
        audioElementRef.current = audio;

        const source = ctx.createMediaElementSource(audio);

        // 2. Filter (The "Depth" Effect)
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 100; // Start Deep/Underwater
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
        audio.play().then(() => setIsMuted(false)).catch(e => console.error("Autoplay blocked (normal):", e));
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

    // --- LIVE MODULATION ---
    useMotionValueEvent(scrollProgress, "change", (latest) => {
        if (!audioContextRef.current || !filterNodeRef.current || !gainNodeRef.current) return;
        const now = audioContextRef.current.currentTime;

        // MAPPING:
        // 0.0 - 0.2: DEEP (Freq: 150Hz, Vol: 0.3) -> Background Drone feel
        // 0.2 - 0.8: CLIMAX (Freq: 20kHz, Vol: 1.0) -> Full Emotion
        // 0.8 - 1.0: FADE OUT (Freq: 500Hz, Vol: 0.0)

        let targetFreq = 150;
        let targetVol = 0.3;

        if (latest < 0.2) {
            targetFreq = 150;
            targetVol = 0.3;
        } else if (latest < 0.8) {
            // BUILD UP
            const p = (latest - 0.2) / 0.6;
            // Exponential opening of filter matches human hearing better
            targetFreq = 150 * Math.pow(100, p);
            targetVol = 0.3 + (p * 0.7);
        } else {
            // FADE OUT
            targetVol = 0;
        }

        // Clamp
        targetFreq = Math.max(20, Math.min(22000, targetFreq));
        targetVol = Math.max(0, Math.min(1, targetVol));

        // Smooth Ramp (Avoid clicking)
        filterNodeRef.current.frequency.setTargetAtTime(targetFreq, now, 0.1);
        gainNodeRef.current.gain.setTargetAtTime(targetVol, now, 0.1);
    });

    return (
        <button
            onClick={toggleSound}
            className="fixed bottom-8 right-8 z-[100] p-4 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all group flex items-center gap-3"
        >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            <span className="text-[10px] uppercase tracking-[0.2em] font-[family-name:var(--font-outfit)]">
                {isMuted ? "Ton an" : "Ton aus"}
            </span>
        </button>
    );
}
