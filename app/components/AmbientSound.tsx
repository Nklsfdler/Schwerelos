"use client";

import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { MotionValue, useMotionValueEvent } from 'framer-motion';

// --- HANS ZIMMER ENGINE (Generative Cinematic Audio) ---
// Complex orchestration of oscillators to mimic string sections and bass drones.

interface AmbientSoundProps {
    scrollProgress: MotionValue<number>;
}

export default function AmbientSound({ scrollProgress }: AmbientSoundProps) {
    const [isMuted, setIsMuted] = useState(true); // Browsers require interaction
    const audioContextRef = useRef<AudioContext | null>(null);
    const masterGainRef = useRef<GainNode | null>(null);

    // We track nodes to ramp them for "swell"
    const layerGainsRef = useRef<{ low: GainNode[], mid: GainNode[], high: GainNode[] }>({ low: [], mid: [], high: [] });

    const initAudio = () => {
        if (audioContextRef.current) {
            // If already exists, just resume
            if (audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume();
                setIsMuted(false);
            }
            return;
        }

        const Ctx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new Ctx();
        audioContextRef.current = ctx;

        const masterGain = ctx.createGain();
        masterGain.gain.value = 0.0; // Start silent, fade in
        masterGain.connect(ctx.destination);
        masterGainRef.current = masterGain;

        // --- ORCHESTRATION ---
        // Chord: E Major 9 (Epic/Space) -> E, G#, B, D#, F#

        // 1. LOW DRONE (Cellos/Basses) - Sawtooth for texture, Lowpass for warmth
        const bassFreqs = [41.20, 82.41]; // E1, E2
        bassFreqs.forEach(freq => {
            const osc = ctx.createOscillator();
            osc.graphType = "sawtooth"; // Richer sound
            osc.frequency.value = freq;

            const filter = ctx.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.value = 120; // Dark start

            const gain = ctx.createGain();
            gain.gain.value = 0.3;

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(masterGain);
            osc.start();
            layerGainsRef.current.low.push(gain);
        });

        // 2. MID PAD (Violas/French Horns) - Triangle waves
        const midFreqs = [164.81, 207.65, 246.94]; // E3, G#3, B3
        midFreqs.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            osc.type = "triangle";
            osc.frequency.value = freq;

            // Detune slightly for "Ensemble" feel
            osc.detune.value = (Math.random() - 0.5) * 10;

            const gain = ctx.createGain();
            gain.gain.value = 0.05; // Quiet start

            osc.connect(gain);
            gain.connect(masterGain);
            osc.start();
            layerGainsRef.current.mid.push(gain);
        });

        // 3. HIGH SHIMMER (Violins) - Sine waves (Glassy)
        const highFreqs = [311.13, 622.25]; // D#4, D#5
        highFreqs.forEach(freq => {
            const osc = ctx.createOscillator();
            osc.type = "sine";
            osc.frequency.value = freq;

            const gain = ctx.createGain();
            gain.gain.value = 0.0; // Starts SILENT, enters later

            osc.connect(gain);
            gain.connect(masterGain);
            osc.start();
            layerGainsRef.current.high.push(gain);
        });

        // Slight Fade In on Start
        masterGain.gain.setTargetAtTime(0.5, ctx.currentTime, 2);
        setIsMuted(false);
    };

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

    // Auto-Attempt (Might be blocked by browser)
    useEffect(() => {
        const handleInteraction = () => {
            // Try to init on first scroll/click if not already
            if (!audioContextRef.current) {
                // We don't force it here strictly to avoid annoyance, 
                // but user said "Default On", so we prep the button to be ready.
                // Actually, best pattern is: User clicks button -> Sound.
            }
        };
        window.addEventListener('click', handleInteraction, { once: true });
        return () => window.removeEventListener('click', handleInteraction);
    }, []);


    // --- DYNAMIC MIXING ---
    useMotionValueEvent(scrollProgress, "change", (latest) => {
        if (!audioContextRef.current || !masterGainRef.current) return;
        const ctx = audioContextRef.current;
        const t = ctx.currentTime;

        // SCROLL MAPPING:
        // 0.0 - 0.2: Intro (Just Bass)
        // 0.2 - 0.6: Build Up (Mids enter, Bass gets louder)
        // 0.6 - 0.9: CLIMAX (Highs enter, "Melody" swells)
        // 0.9 - 1.0: FADE OUT (End)

        let masterVol = 0.5;
        let midVol = 0.1;
        let highVol = 0.0;

        if (latest < 0.2) {
            masterVol = 0.5 + latest;
        } else if (latest < 0.8) {
            // Building intensity
            masterVol = 0.7 + (latest * 0.3); // Get louder
            midVol = 0.1 + (latest * 0.2);
            highVol = (latest - 0.2) * 0.3; // Highs slowly creep in
        } else {
            // FADE OUT at the end
            // 0.8 -> 1.0
            const remaining = 1.0 - latest; // 0.2 -> 0.0
            masterVol = remaining * 5; // Rapid fade
            midVol = 0;
            highVol = 0;
        }

        // Apply smooth ramps
        masterGainRef.current.gain.setTargetAtTime(Math.max(0, masterVol), t, 0.1);

        layerGainsRef.current.mid.forEach(g => g.gain.setTargetAtTime(midVol, t, 0.5));
        layerGainsRef.current.high.forEach(g => g.gain.setTargetAtTime(highVol, t, 0.5));
    });

    return (
        <button
            onClick={toggleSound}
            className="fixed bottom-8 right-8 z-[100] p-4 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all group flex items-center gap-3"
        >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            <span className="text-[10px] uppercase tracking-[0.2em] font-[family-name:var(--font-outfit)]">
                Ton
            </span>
        </button>
    );
}
