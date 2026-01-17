"use client";

import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { MotionValue, useMotionValueEvent } from 'framer-motion';

// --- CINEMATIC FILTER ENGINE ---
// Uses the real MP3 but processes it live.
// Top: Deep/Lowpass (Underwater/Space feel).
// Sculpture: Full Frequency (Epic).
// Bottom: Fades back.

interface AmbientSoundProps {
    scrollProgress: MotionValue<number>;
}

export default function AmbientSound({ scrollProgress }: AmbientSoundProps) {
    const [isMuted, setIsMuted] = useState(true);

    // Audio Graph Refs
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioElementRef = useRef<HTMLAudioElement | null>(null);
    const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
    const filterNodeRef = useRef<BiquadFilterNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);

    // Init Audio Context (Must be user triggered)
    const initAudio = () => {
        if (audioContextRef.current) {
            // Already inited, just checking state
            if (audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume();
            }
            if (audioElementRef.current?.paused) {
                audioElementRef.current.play().catch(e => console.error(e));
            }
            setIsMuted(false);
            return;
        }

        const Ctx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new Ctx();
        audioContextRef.current = ctx;

        // 1. Create Source from HTML5 Audio Element
        const audio = new Audio("/soundscape.mp3");
        audio.loop = true;
        audio.crossOrigin = "anonymous"; // Essential for Web Audio
        audioElementRef.current = audio;

        const source = ctx.createMediaElementSource(audio);
        sourceNodeRef.current = source;

        // 2. Create BIQUAD FILTER (The "Depth" Effect)
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 100; // Start VERY muffled/deep
        filter.Q.value = 1; // Slight resonance
        filterNodeRef.current = filter;

        // 3. Gain Node
        const gain = ctx.createGain();
        gain.gain.value = 1.0;
        gainNodeRef.current = gain;

        // 4. Connect Graph: Source -> Filter -> Gain -> Dest
        source.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        // Start
        audio.play().then(() => setIsMuted(false)).catch(e => console.error("Play prevented", e));
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

        // MAPPING LOGIC:
        // 0.0 - 0.2: DEEP SPACE (Freq: 200Hz, Vol: 0.5)
        // 0.2 - 0.5: RISING (Freq: 200 -> 2000Hz, Vol: 0.8)
        // 0.5 - 0.8: CLIMAX (Freq: 20000Hz - Full Open, Vol: 1.0)
        // 0.8 - 1.0: FADE OUT (Freq: 500Hz, Vol: 0.0)

        let targetFreq = 200;
        let targetVol = 0.5;

        if (latest < 0.2) {
            targetFreq = 200;
            targetVol = 0.4;
        } else if (latest < 0.8) {
            // The BUILD UP to SCULPTURE
            // Map 0.2->0.8 range to 200 -> 20000 Hz
            const p = (latest - 0.2) / 0.6; // 0 to 1
            // Exponential curve for frequency sounds more natural
            targetFreq = 200 * Math.pow(100, p);
            targetVol = 0.4 + (p * 0.6);
        } else {
            // ENDING
            targetFreq = 400;
            targetVol = 0; // Fade out completely at bottom
        }

        // Clamp frequency to safety limits (20Hz - 22kHz)
        targetFreq = Math.max(20, Math.min(22000, targetFreq));
        targetVol = Math.max(0, Math.min(1, targetVol));

        // Smooth Ramp (removes clicking/stepping)
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
