"use client";

import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { MotionValue, useMotionValueEvent } from 'framer-motion';

// --- DUAL MODE AUDIO ENGINE ---
// 1. GLOBAL: Procedural "Space Drone" (Subtle, always on).
// 2. HIGHLIGHT: "Hans Zimmer" MP3 (Only active during sculpture scroll).
// Cross-fades between them.

interface AmbientSoundProps {
    scrollProgress: MotionValue<number>;
}

export default function AmbientSound({ scrollProgress }: AmbientSoundProps) {
    const [isMuted, setIsMuted] = useState(true);

    // REFS
    const mp3Ref = useRef<HTMLAudioElement | null>(null); // The Zimmer Track
    const audioContextRef = useRef<AudioContext | null>(null); // The Drone Engine
    const droneGainRef = useRef<GainNode | null>(null);

    // 1. SETUP AUDIO SYSTEMS
    useEffect(() => {
        // A. Setup MP3
        const audio = new Audio("/soundscape.mp3");
        audio.loop = true;
        audio.volume = 0;
        mp3Ref.current = audio;

        // B. Setup Drone (Web Audio API) - Init on first click to avoid policy block
        // We'll init context in toggleSound
    }, []);

    const initDrone = () => {
        if (audioContextRef.current) return;

        const Ctx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new Ctx();
        audioContextRef.current = ctx;

        const masterGain = ctx.createGain();
        masterGain.gain.value = 0.0; // Start silent
        masterGain.connect(ctx.destination);
        droneGainRef.current = masterGain;

        // Create "Space Wind" (Pink Noise-ish via multiple Oscillators)
        const freqs = [55, 110, 165]; // A1, A2, E3 (Open 5ths)
        freqs.forEach(f => {
            const osc = ctx.createOscillator();
            osc.type = "sine";
            osc.frequency.value = f;

            const oscGain = ctx.createGain();
            oscGain.gain.value = 0.1;

            // LFO for movement
            const lfo = ctx.createOscillator();
            lfo.frequency.value = 0.05 + Math.random() * 0.1;
            lfo.connect(oscGain.gain);
            lfo.start();

            osc.connect(oscGain);
            oscGain.connect(masterGain);
            osc.start();
        });
    };

    const toggleSound = () => {
        // Init procedural drone if needed
        initDrone();

        if (isMuted) {
            // UNMUTE
            if (audioContextRef.current?.state === 'suspended') audioContextRef.current.resume();
            mp3Ref.current?.play().catch(e => console.log("MP3 play failed", e));
            setIsMuted(false);
        } else {
            // MUTE
            if (audioContextRef.current) audioContextRef.current.suspend();
            mp3Ref.current?.pause();
            setIsMuted(true);
        }
    };

    // 2. MIXER LOGIC (Scroll Controlled Crossfade)
    useMotionValueEvent(scrollProgress, "change", (latest) => {
        if (isMuted) return;

        // ZONES:
        // 0.0 - 0.1: Hero (Drone: 100%, Zimmer: 0%)
        // 0.1 - 0.2: Transition (Drone: Fades, Zimmer: Starts)
        // 0.2 - 0.8: SCULPTURE (Drone: 20%, Zimmer: CLIMAX)
        // 0.8 - 0.9: Transition Out (Drone: Returns, Zimmer: Fades)
        // 0.9 - 1.0: Footer (Drone: 100%, Zimmer: 0%)

        let droneVol = 0.0;
        let mp3Vol = 0.0;

        if (latest < 0.15) {
            // HERO
            droneVol = 0.4; // Base drone volume
            mp3Vol = 0;
        } else if (latest < 0.85) {
            // SCULPTURE (The Main Event)
            // Normalized progress within this section (0 to 1)
            const p = (latest - 0.15) / 0.7;

            // Climax Logic: Peak at p=0.8 (approx scroll 0.7)
            if (p < 0.8) {
                mp3Vol = p * 1.25; // Ramp up to 1.0
            } else {
                // Sustain/Slight dip
                mp3Vol = 1.0;
            }

            droneVol = 0.1; // Dip drone to background
        } else {
            // FOOTER / END
            mp3Vol = 0; // Quick cut or fade
            droneVol = 0.4; // Drone takes over
        }

        // Apply Volumes
        if (mp3Ref.current) {
            // Smooth ramp for MP3
            const diff = Math.min(1, Math.max(0, mp3Vol)) - mp3Ref.current.volume;
            mp3Ref.current.volume += diff * 0.1;
        }

        if (droneGainRef.current && audioContextRef.current) {
            droneGainRef.current.gain.setTargetAtTime(droneVol, audioContextRef.current.currentTime, 0.1);
        }
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
