import { motion } from 'framer-motion';

export const TouchIcon = () => (
    <div className="absolute z-20 flex items-center justify-center opacity-70 group-hover:opacity-0 transition-opacity duration-500 pointer-events-none top-8 right-8 md:top-10 md:right-10">
        <div className="relative">
            {/* Pulsing Circle */}
            <motion.div
                className="absolute inset-0 bg-white/20 rounded-full"
                animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Plus Icon */}
            <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/80">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            </div>
        </div>
    </div>
);
