"use client";

import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { MotionValue, useMotionValueEvent } from 'framer-motion';

// --- HANS ZIMMER ENGINE (Cinematic / Orchestral) ---
// Deep Sub-Bass + Slow Moving String Texture.
// Autoplays on first interaction.

interface AmbientSoundProps {
    scrollProgress: MotionValue<number>;
}

export default function AmbientSound({ scrollProgress }: AmbientSoundProps) {
    const [isMuted, setIsMuted] = useState(true);
    const audioContextRef = useRef<AudioContext | null>(null);
    const masterGainRef = useRef<GainNode | null>(null);
    const busRef = useRef<GainNode | null>(null);

    // 1. "Hans Zimmer" Sound Design
    const initAudio = () => {
        if (audioContextRef.current) {
            // If already init, just resume
            if (audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume();
            }
            setIsMuted(false);
            return;
        }

        const Ctx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new Ctx();
        audioContextRef.current = ctx;

        // Master Bus
        const masterGain = ctx.createGain();
        masterGain.gain.value = 0.5;
        masterGain.connect(ctx.destination);
        masterGainRef.current = masterGain;

        // Dynamic Bus (Controlled by Scroll)
        const bus = ctx.createGain();
        bus.gain.value = 0.2; // Start quiet (Intro)
        bus.connect(masterGain);
        busRef.current = bus;

        // LAYER A: THE SUB (The "Anchor")
        // Deep, steady bass (C2/E2)
        const createSub = (freq: number) => {
            const osc = ctx.createOscillator();
            osc.type = "sine"; // Pure sub
            osc.frequency.value = freq;
            const g = ctx.createGain();
            g.gain.value = 0.4; // Heavy weight
            osc.connect(g);
            g.connect(bus);
            osc.start();
        };
        createSub(41.20); // E1 (Deep Rumbles)
        createSub(82.41); // E2

        // LAYER B: THE STRINGS (The "Emotion")
        // Sawtooths with heavy filtering and slow attack
        const frequencies = [164.81, 246.94, 329.63, 392.00, 493.88]; // E Major / E Minor ambiguous

        frequencies.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            osc.type = "sawtooth"; // Rich harmonics

            // Filter each string (Low pass to make it soft/warm)
            const filter = ctx.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.value = 400 + (Math.random() * 200);

            // Detune for "Orchestra" feel
            osc.frequency.value = freq;
            osc.detune.value = (Math.random() - 0.5) * 15;

            // Envelope / Breathing
            const gain = ctx.createGain();
            gain.gain.value = 0.05; // Mix low

            // connect
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(bus);
            osc.start();
        });

        setIsMuted(false);
    };

    // 2. Global "Autoplay" Listener
    // Browsers block audio until user interaction. We catch the FIRST interaction.
    useEffect(() => {
        const handleInteraction = () => {
            if (isMuted) {
                initAudio();
            }
        };

        window.addEventListener('click', handleInteraction);
        window.addEventListener('scroll', handleInteraction);
        window.addEventListener('keydown', handleInteraction);

        return () => {
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('scroll', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
        };
    }, [isMuted]);

    // 3. Cinematic Swell (Scroll control)
    useMotionValueEvent(scrollProgress, "change", (latest) => {
        if (!audioContextRef.current || !busRef.current) return;

        // As you scroll (Sculpture builds), the music swells.
        // It gets Louder and Brighter (Hans Zimmer Crescendo).
        const volume = 0.2 + (latest * 0.6); // 0.2 -> 0.8
        busRef.current.gain.setTargetAtTime(volume, audioContextRef.current.currentTime, 0.5);
    });

    // Manual Toggle (Still needed if user wants silence)
    const toggleSound = () => {
        if (!audioContextRef.current) {
            initAudio();
        } else {
            if (audioContextRef.current.state === 'running') {
                audioContextRef.current.suspend();
                setIsMuted(true);
            } else {
                audioContextRef.current.resume();
                setIsMuted(false);
            }
        }
    };

    return (
        <button
            onClick={toggleSound}
            className="fixed bottom-8 right-8 z-[100] p-4 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all group"
        >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {isMuted ? "Audio Paused" : "Hans Zimmer Mode"}
            </span>
        </button>
    );
}
