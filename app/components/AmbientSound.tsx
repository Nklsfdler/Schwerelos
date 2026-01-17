"use client";

import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { MotionValue, useMotionValueEvent } from 'framer-motion';

// --- GENERATIVE AUDIO ENGINE ---
// No MP3s. Pure mathematics and sound waves.
// Creates an "Ethereal Drone" that reacts to the sculpture's completion.

interface AmbientSoundProps {
    scrollProgress: MotionValue<number>; // Connected to the sculpture scroll
}

export default function AmbientSound({ scrollProgress }: AmbientSoundProps) {
    const [isMuted, setIsMuted] = useState(true);
    const audioContextRef = useRef<AudioContext | null>(null);
    const masterGainRef = useRef<GainNode | null>(null);
    const filterRef = useRef<BiquadFilterNode | null>(null);
    const oscillatorsRef = useRef<OscillatorNode[]>([]);

    // 1. Initialize Audio Engine (On User Click)
    const initAudio = () => {
        if (audioContextRef.current) return;

        const Ctx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new Ctx();
        audioContextRef.current = ctx;

        // Master Chain
        const masterGain = ctx.createGain();
        masterGain.gain.value = 0.4; // Base volume
        masterGain.connect(ctx.destination);
        masterGainRef.current = masterGain;

        // Filter (The "Muffle" effect)
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 200; // Start dark/muffled
        filter.Q.value = 1;
        filter.connect(masterGain);
        filterRef.current = filter;

        // CHORD: E Major 9 + Add 11 (The "Heavenly" Chord)
        // A rich, detuned "Super-Pad" sound.
        // Frequencies: E2, B2, E3, G#3, B3, D#4, F#4
        const baseFrequencies = [82.41, 123.47, 164.81, 207.65, 246.94, 311.13, 369.99];

        baseFrequencies.forEach((freq, i) => {
            // Create 3 oscillators per note for "Unison" effect (Thick, wide sound)
            for (let j = 0; j < 2; j++) {
                const osc = ctx.createOscillator();
                osc.type = "triangle"; // Softer than sine, richer than saw

                // Slight detuning for "beautiful" chorusing
                const detune = (Math.random() - 0.5) * 12; // +/- 6 cents
                osc.frequency.value = freq;
                osc.detune.value = detune;

                // Individual LFO for "Movement" (Breathing volume)
                const gainNode = ctx.createGain();
                gainNode.gain.value = 0.0; // Start silent, fade in

                // Attack/Release envelope simulation via LFO
                const lfo = ctx.createOscillator();
                lfo.type = "sine";
                lfo.frequency.value = 0.05 + Math.random() * 0.1; // Very slow breathing (10-20s)

                const lfoGain = ctx.createGain();
                lfoGain.gain.value = 0.3; // Modulation depth

                lfo.connect(lfoGain);
                lfoGain.connect(gainNode.gain);
                lfo.start();

                // Initial fade in
                gainNode.gain.setTargetAtTime(0.15 - (i * 0.01), ctx.currentTime, 2);

                osc.connect(gainNode);
                gainNode.connect(filter);
                osc.start();
                oscillatorsRef.current.push(osc);
            }
        });

        setIsMuted(false);
    };

    const toggleSound = () => {
        if (!audioContextRef.current) {
            initAudio();
        } else {
            if (audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume();
                setIsMuted(false);
            } else if (audioContextRef.current.state === 'running') {
                audioContextRef.current.suspend();
                setIsMuted(true);
            }
        }
    };

    // 2. Sync to Sculpture Animation
    useMotionValueEvent(scrollProgress, "change", (latest) => {
        if (!audioContextRef.current || !filterRef.current || !masterGainRef.current) return;

        // As sculpture completes (0 -> 1):
        // 1. Filter opens up (Sound becomes "Brighter" / "Clearer") -> 200Hz to 3000Hz
        // 2. Volume swirls slightly

        const frequency = 200 + (latest * 4000); // Dramatic opening
        filterRef.current.frequency.setTargetAtTime(frequency, audioContextRef.current.currentTime, 0.1);
    });

    return (
        <button
            onClick={toggleSound}
            className="fixed bottom-8 right-8 z-[100] p-4 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all group"
        >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {isMuted ? "Initialize Audio" : "Atmosphere Active"}
            </span>
        </button>
    );
}
