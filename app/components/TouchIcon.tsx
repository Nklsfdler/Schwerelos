import { motion } from 'framer-motion';

export const TouchIcon = () => (
    <div className="absolute z-20 flex items-center justify-center opacity-40 group-hover:opacity-0 transition-opacity duration-500 pointer-events-none bottom-6 right-6">
        <div className="relative">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-white relative z-10">
                <path d="M12 10a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2 2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2z" />
                <path d="M9.5 7.5a4.5 4.5 0 0 1 5 0" />
                <path d="M7 5a7 7 0 0 1 10 0" />
            </svg>
            <motion.div className="absolute inset-0 bg-white/20 rounded-full" animate={{ scale: [1, 2.5], opacity: [0.4, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }} />
            <motion.div className="absolute inset-0 bg-white/10 rounded-full" animate={{ scale: [1, 3], opacity: [0.3, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }} />
        </div>
    </div>
);
