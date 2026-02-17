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
        className="text-zinc-400 text-sm uppercase tracking-[0.3em] mb-12"
      >
        Bereit?
      </motion.p>

      {/* Outer glow rings */}
      <div className="relative flex items-center justify-center">
        {/* Pulse ring 1 */}
        <motion.div
          className="absolute w-48 h-48 rounded-full border-2 border-primary/20"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          aria-hidden="true"
        />

        {/* Pulse ring 2 */}
        <motion.div
          className="absolute w-48 h-48 rounded-full border-2 border-primary/15"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.2, 0, 0.2],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.8,
          }}
          aria-hidden="true"
        />

        {/* Glow background */}
        <motion.div
          className="absolute w-36 h-36 rounded-full bg-primary/20 blur-2xl"
          animate={{
            scale: [0.9, 1.1, 0.9],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          aria-hidden="true"
        />

        {/* Main Button */}
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 12, delay: 0.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onPlay}
          aria-label="Song abspielen"
          className="relative w-32 h-32 rounded-full bg-gradient-to-br from-primary via-violet-500 to-purple-700 flex items-center justify-center shadow-[0_0_60px_rgba(139,92,246,0.5)] active:shadow-[0_0_80px_rgba(139,92,246,0.7)] transition-shadow focus-visible:ring-4 focus-visible:ring-white/50"
        >
          {/* Inner shine */}
          <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/20 to-transparent" aria-hidden="true" />

          {/* Play icon – slightly offset right for visual centering */}
          <Play
            className="w-14 h-14 text-white relative ml-1.5"
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
        className="text-zinc-400 text-xs mt-12 text-center"
      >
        Drücke Play, um den Song zu starten
      </motion.p>
    </div>
  );
};
