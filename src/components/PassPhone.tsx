import { motion } from 'framer-motion';
import { Smartphone, ArrowRight, Users, Zap } from 'lucide-react';

interface Props {
  playerName: string;
  roundNumber: number;
  isOpenRound: boolean;
  onContinue: () => void;
}

export const PassPhone = ({ playerName, roundNumber, isOpenRound, onContinue }: Props) => {
  return (
    <div className="h-[100dvh] bg-background flex flex-col items-center justify-center p-6 text-center">
      {/* Open Round Badge */}
      {isOpenRound && (
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 12 }}
          className="mb-6 bg-amber-500/20 border-2 border-amber-400 text-amber-300 px-6 py-2 rounded-full text-sm font-black uppercase tracking-widest flex items-center gap-2"
        >
          <Zap className="w-4 h-4 fill-amber-300" />
          OFFENE RUNDE – ALLE RATEN!
          <Zap className="w-4 h-4 fill-amber-300" />
        </motion.div>
      )}

      {/* Phone Icon */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Smartphone className="w-12 h-12 text-primary" />
          </motion.div>
        </div>
      </motion.div>

      {/* Instructions */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-zinc-500 text-sm uppercase tracking-widest mb-2">
          Song {roundNumber}
        </p>
        <p className="text-zinc-400 text-lg mb-1">Gib das Handy an</p>
        <h2 className="text-4xl font-black text-white mb-2">
          {playerName}
        </h2>
        {isOpenRound && (
          <p className="text-amber-300/80 text-sm flex items-center justify-center gap-1 mt-1">
            <Users className="w-4 h-4" />
            Alle dürfen mitraten!
          </p>
        )}
      </motion.div>

      {/* Continue Button */}
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        whileTap={{ scale: 0.95 }}
        onClick={onContinue}
        className="mt-10 bg-primary hover:bg-violet-600 text-white px-10 py-4 rounded-full font-bold text-lg flex items-center gap-3 transition-transform shadow-[0_0_40px_rgba(139,92,246,0.3)]"
      >
        BIN BEREIT
        <ArrowRight className="w-5 h-5" />
      </motion.button>
    </div>
  );
};
