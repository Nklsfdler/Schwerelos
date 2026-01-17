"use client";

import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { MotionValue, useMotionValueEvent } from 'framer-motion';

// --- CINEMATIC AUDIO CONTROLLER ---
// Plays specific MP3. 
// Logic:
// 1. Climax at 70-80% scroll (Sculpture).
// 2. Volume fades out when scrolling UP (Directional).

interface AmbientSoundProps {
    scrollProgress: MotionValue<number>;
}

export default function AmbientSound({ scrollProgress }: AmbientSoundProps) {
    const [isMuted, setIsMuted] = useState(true);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const lastScrollY = useRef(0);
    const fadeInterval = useRef<NodeJS.Timeout | null>(null);

    // Init Audio Element
    useEffect(() => {
        const audio = new Audio("/soundscape.mp3");
        audio.loop = true;
        audio.volume = 0; // Start silent
        audioRef.current = audio;

        // Try auto-play muted? No, user wants control.
        // We wait for button click.
    }, []);

    const toggleSound = () => {
        if (!audioRef.current) return;

        if (isMuted) {
            // UNMUTE
            audioRef.current.play().then(() => {
                setIsMuted(false);
                // Ramp volume up slightly
                audioRef.current!.volume = 0.2;
            }).catch(e => console.log("Audio play failed", e));
        } else {
            // MUTE
            audioRef.current.pause();
            setIsMuted(true);
        }
    };

    // --- SCROLL AUDIO LOGIC ---
    useMotionValueEvent(scrollProgress, "change", (latest) => {
        if (isMuted || !audioRef.current) return;

        // 1. Detect Direction
        const currentScrollY = window.scrollY;
        const isScrollingDown = currentScrollY > lastScrollY.current;
        lastScrollY.current = currentScrollY;

        const audio = audioRef.current;

        if (!isScrollingDown) {
            // SCROLLING UP -> FAST FADE OUT (User request: "Beim rückwärts drehen hört man die Musik nicht")
            // We smoothly duck the volume
            audio.volume = Math.max(0, audio.volume - 0.05);
            return;
        }

        // 2. SCROLLING DOWN -> MAP VOLUME CURVE
        // 0.0 - 0.2: Start (Quiet)
        // 0.2 - 0.8: Build to Climax (Sculpture)
        // 0.8 - 1.0: Fade Out (Footer)

        let targetVol = 0;

        if (latest < 0.2) {
            targetVol = latest * 2; // 0 -> 0.4
        } else if (latest < 0.7) {
            // BUILD UP
            targetVol = 0.4 + ((latest - 0.2) * 1.2); // Ends at 1.0
        } else if (latest < 0.9) {
            // CLIMAX PLATEAU
            targetVol = 1.0;
        } else {
            // FADE OUT
            targetVol = Math.max(0, 1.0 - ((latest - 0.9) * 10)); // FAST fade
        }

        // Limit to 1.0
        targetVol = Math.min(1.0, Math.max(0, targetVol));

        // Smooth Ramp
        const diff = targetVol - audio.volume;
        audio.volume += diff * 0.1; // Smooth interpolation
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
