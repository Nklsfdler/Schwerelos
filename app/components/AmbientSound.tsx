"use client";

import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { MotionValue, useMotionValueEvent } from 'framer-motion';

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

    // --- LIVE MODULATION ---
    useMotionValueEvent(scrollProgress, "change", (latest) => {
        if (!audioContextRef.current || !filterNodeRef.current || !gainNodeRef.current) return;
        const now = audioContextRef.current.currentTime;

        // MAPPING:
        // Parabolic Curve for Filter:
        // 0.0 -> 100 Hz (Muffled)
        // 0.5 -> 20,000 Hz (Bright - Animation Climax)
        // 1.0 -> 100 Hz (Muffled)

        // Volume: Keeps constant presence, maybe louder at peak.
        // 0.0 -> 0.4
        // 0.5 -> 1.0
        // 1.0 -> 0.4

        // Distance from center (0.5)
        const dist = Math.abs(latest - 0.5) * 2; // 0 (at center) to 1 (at edges)

        // Invert for "Intensity at Center"
        const intensity = 1.0 - dist;

        // Exponential Frequency Map
        // Low: 100Hz, High: 20000Hz
        const targetFreq = 100 * Math.pow(200, intensity);

        const targetVol = 0.4 + (intensity * 0.6);

        // Safety Clamp
        const safeFreq = Math.max(20, Math.min(22000, targetFreq));

        // Smooth Ramp
        filterNodeRef.current.frequency.setTargetAtTime(safeFreq, now, 0.1);
        gainNodeRef.current.gain.setTargetAtTime(targetVol, now, 0.1);
    });

    return (
        <button
            onClick={toggleSound}
            // Button: Icon Only, Clean, Bottom Right
            // Increased tap target for mobile
            className="fixed bottom-6 right-6 z-[100] w-12 h-12 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center"
        >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
    );
}
