import { motion } from 'framer-motion';
import { Play, Volume2 } from 'lucide-react';

interface Props {
  onPlay: () => void;
  playerName?: string;
  roundNumber?: number;
}

export const PlayButton = ({ onPlay, playerName, roundNumber }: Props) => {
  return (
    <div className="h-[100dvh] bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden" role="main" aria-label="Song abspielen">
      {/* Subtle ambient gradient blobs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/3 w-64 h-64 bg-violet-500/3 rounded-full blur-3xl" />
      </div>

      {/* Top context: Round + Player */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative text-center mb-8"
      >
        {roundNumber && (
          <p className="text-zinc-600 text-[10px] uppercase tracking-[0.3em] font-mono mb-2">
            Song {roundNumber}
          </p>
        )}
        {playerName && (
          <div className="flex flex-col items-center gap-2">
            <div className="w-11 h-11 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <span className="text-primary text-lg font-black">{playerName.charAt(0).toUpperCase()}</span>
            </div>
            <p className="text-white font-bold text-sm">{playerName}</p>
          </div>
        )}
      </motion.div>

      {/* Main play button area */}
      <div className="relative flex items-center justify-center">
        {/* Breathing pulse rings */}
        <motion.div
          className="absolute w-52 h-52 rounded-full border border-primary/10"
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden="true"
        />
        <motion.div
          className="absolute w-48 h-48 rounded-full border border-primary/8"
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0, 0.2] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          aria-hidden="true"
        />

        {/* SVG ring decoration */}
        <svg className="absolute w-44 h-44" viewBox="0 0 128 128" aria-hidden="true">
          <circle cx="64" cy="64" r="60" fill="none" stroke="currentColor" strokeWidth="1" className="text-white/8" />
          <circle cx="64" cy="64" r="60" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="377" strokeDashoffset="94" className="text-primary/40 -rotate-90 origin-center" />
        </svg>

        {/* Main Button */}
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15, delay: 0.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={onPlay}
          aria-label="Song abspielen"
          className="relative w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 flex items-center justify-center transition-all hover:from-primary/30 hover:to-primary/20 hover:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/50 focus:outline-none shadow-lg shadow-primary/10"
        >
          <Play
            className="w-14 h-14 text-primary relative ml-1.5"
            fill="currentColor"
            strokeWidth={0}
            aria-hidden="true"
          />
        </motion.button>
      </div>

      {/* Bottom hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="relative text-center mt-8 flex items-center gap-1.5 text-zinc-500"
      >
        <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
        <p className="text-xs font-medium">Ton an &amp; Tippe zum Starten</p>
      </motion.div>
    </div>
  );
};
