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
    <div className="h-[100dvh] bg-background flex flex-col items-center justify-center p-6 text-center" role="main" aria-label={`Gerät an ${playerName} weiterreichen`}>
      {/* Open Round Badge */}
      {isOpenRound && (
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 12 }}
          className="mb-6 bg-amber-500/20 border-2 border-amber-400 text-amber-300 px-6 py-2 rounded-full text-sm font-black uppercase tracking-widest flex items-center gap-2"
          role="status"
        >
          <Zap className="w-4 h-4 fill-amber-300" aria-hidden="true" />
          OFFENE RUNDE – ALLE RATEN!
          <Zap className="w-4 h-4 fill-amber-300" aria-hidden="true" />
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
            <Smartphone className="w-12 h-12 text-primary" aria-hidden="true" />
          </motion.div>
        </div>
      </motion.div>

      {/* Instructions */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-zinc-400 text-sm uppercase tracking-widest mb-2">
          Song {roundNumber}
        </p>
        <p className="text-zinc-300 text-lg mb-1">Reiche das Gerät weiter an</p>
        <h2 className="text-4xl font-black text-white mb-2">
          {playerName}
        </h2>
        {isOpenRound && (
          <p className="text-amber-300 text-sm flex items-center justify-center gap-1 mt-1">
            <Users className="w-4 h-4" aria-hidden="true" />
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
        aria-label={`${playerName} ist bereit – Song abspielen`}
        className="mt-10 bg-primary hover:bg-violet-500 active:bg-violet-700 text-white px-10 min-h-[52px] py-4 rounded-full font-bold text-lg flex items-center gap-3 transition-all shadow-[0_0_40px_rgba(139,92,246,0.3)] focus-visible:ring-4 focus-visible:ring-primary/50"
      >
        BIN BEREIT
        <ArrowRight className="w-5 h-5" aria-hidden="true" />
      </motion.button>
    </div>
  );
};
