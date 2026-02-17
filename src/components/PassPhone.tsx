import { motion } from 'framer-motion';
import { ArrowRight, Users, Zap } from 'lucide-react';

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
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="mb-6 bg-amber-500/10 border border-amber-400/30 text-amber-400 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2"
          role="status"
        >
          <Zap className="w-3.5 h-3.5" aria-hidden="true" />
          OFFENE RUNDE
        </motion.div>
      )}

      {/* Player Initial Avatar */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 12, delay: 0.1 }}
        className="mb-6"
      >
        <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
          <span className="text-primary text-3xl font-black">
            {playerName.charAt(0).toUpperCase()}
          </span>
        </div>
      </motion.div>

      {/* Instructions */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-zinc-500 text-xs uppercase tracking-[0.2em] mb-2 font-medium">
          Song {roundNumber}
        </p>
        <p className="text-zinc-400 text-sm mb-1">Reiche das Gerät weiter an</p>
        <h2 className="text-3xl font-black text-white">
          {playerName}
        </h2>
        {isOpenRound && (
          <p className="text-amber-400/80 text-xs flex items-center justify-center gap-1 mt-2">
            <Users className="w-3.5 h-3.5" aria-hidden="true" />
            Alle dürfen mitraten
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
        className="mt-10 bg-primary hover:bg-violet-500 active:bg-violet-700 text-white px-8 min-h-[48px] py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all focus-visible:ring-4 focus-visible:ring-primary/50"
      >
        BIN BEREIT
        <ArrowRight className="w-4 h-4" aria-hidden="true" />
      </motion.button>
    </div>
  );
};
