"use client";

import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { MotionValue, useMotionValueEvent } from 'framer-motion';

// --- PURE CINEMATIC ENGINE (Volume Dynamics Only) ---
// No Filters. Just the raw, high-quality Hans Zimmer style track.
// Logic: Volume swells to 100% during the Sculpture, fades out elsewhere.

interface AmbientSoundProps {
    scrollProgress: MotionValue<number>;
}

export default function AmbientSound({ scrollProgress }: AmbientSoundProps) {
    const [isMuted, setIsMuted] = useState(true);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const audio = new Audio("/soundscape.mp3");
        audio.loop = true;
        audio.volume = 0; // Start silent
        audioRef.current = audio;
    }, []);

    const toggleSound = () => {
        if (!audioRef.current) return;

        if (isMuted) {
            audioRef.current.play()
                .then(() => setIsMuted(false))
                .catch(e => console.error("Play failed", e));
        } else {
            audioRef.current.pause();
            setIsMuted(true);
        }
    };

    // --- SCROLL VOLUME LOGIC ---
    useMotionValueEvent(scrollProgress, "change", (latest) => {
        if (isMuted || !audioRef.current) return;
        const audio = audioRef.current;

        // MAPPING (Pure Volume):
        // 0.0 - 0.2: INTRO (Low Volume: 20%) -> Whisper level
        // 0.2 - 0.5: CRESCENDO (Ramp to 60%)
        // 0.5 - 0.8: CLIMAX (Max Volume: 100%) -> Sculpture is full power
        // 0.8 - 1.0: DIMINUENDO (Fade to 0%) -> Footer silence

        let targetVol = 0;

        if (latest < 0.2) {
            targetVol = 0.2; // Ambient background
        } else if (latest < 0.8) {
            // BUILD UP to 1.0
            // Map 0.2->0.8 to 0.2->1.0
            const p = (latest - 0.2) / 0.6;
            targetVol = 0.2 + (p * 0.8);
        } else {
            // FADE OUT at absolute bottom
            // Map 0.8->1.0 to 1.0->0.0
            const p = (latest - 0.8) / 0.2;
            targetVol = 1.0 - p;
        }

        // Safety Clamp
        targetVol = Math.max(0, Math.min(1.0, targetVol));

        // Smooth Fade (0.1s interpolation)
        const diff = targetVol - audio.volume;
        if (Math.abs(diff) > 0.01) {
            audio.volume += diff * 0.1;
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
