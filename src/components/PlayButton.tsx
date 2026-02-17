import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

interface Props {
  onPlay: () => void;
}

export const PlayButton = ({ onPlay }: Props) => {
  return (
    <div className="h-[100dvh] bg-background flex flex-col items-center justify-center p-6" role="main" aria-label="Song abspielen">
      {/* Subtle hint text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-zinc-500 text-xs uppercase tracking-[0.3em] mb-10 font-medium"
      >
        Bereit?
      </motion.p>

      {/* Minimal play button with SVG ring */}
      <div className="relative flex items-center justify-center">
        {/* Single subtle pulse ring */}
        <motion.div
          className="absolute w-44 h-44 rounded-full border border-primary/15"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0, 0.4],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          aria-hidden="true"
        />

        {/* SVG ring decoration */}
        <svg className="absolute w-40 h-40" viewBox="0 0 128 128" aria-hidden="true">
          <circle
            cx="64" cy="64" r="60"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-white/10"
          />
          <circle
            cx="64" cy="64" r="60"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="377"
            strokeDashoffset="94"
            className="text-primary/50 -rotate-90 origin-center"
          />
        </svg>

        {/* Main Button */}
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15, delay: 0.1 }}
          whileTap={{ scale: 0.92 }}
          onClick={onPlay}
          aria-label="Song abspielen"
          className="relative w-28 h-28 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center transition-all hover:bg-primary/15 hover:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/50 focus:outline-none"
        >
          {/* Play icon – slightly offset right for visual centering */}
          <Play
            className="w-12 h-12 text-primary relative ml-1"
            fill="currentColor"
            strokeWidth={0}
            aria-hidden="true"
          />
        </motion.button>
      </div>

      {/* Bottom text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-zinc-500 text-xs mt-10 text-center"
      >
        Tippe zum Starten
      </motion.p>
    </div>
  );
};
