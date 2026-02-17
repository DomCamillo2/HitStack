import { motion } from 'framer-motion';
import type { Track, GuessResult } from '../store/gameStore';
import { clsx } from 'clsx';
import { Check, X, ArrowRight, Sparkles } from 'lucide-react';

interface Props {
  track: Track;
  result: GuessResult;
  roundNumber: number;
  onNext: () => void;
}

export const RevealCard = ({ track, result, roundNumber, onNext }: Props) => {
  const hasBonus = result.titleCorrect || result.artistCorrect;
  const allCorrect = hasBonus && (roundNumber === 1 || result.placementCorrect);

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', damping: 18 }}
      className="w-full max-w-sm mx-auto flex flex-col items-center gap-4 px-4"
    >
      {/* Album Art + Song Info — focal point */}
      <div className="flex flex-col items-center gap-3">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 12, delay: 0.1 }}
          className={clsx(
            "w-24 h-24 rounded-xl overflow-hidden border-2",
            allCorrect ? "border-success shadow-[0_0_20px_rgba(16,185,129,0.2)]" : "border-white/10"
          )}
        >
          <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
        </motion.div>
        <div className="text-center">
          <h3 className="text-white font-bold text-lg leading-tight">{track.title}</h3>
          <p className="text-zinc-400 text-sm">{track.artist}</p>
          <p className="text-primary font-mono font-bold text-base mt-0.5">{track.year}</p>
        </div>
      </div>

      {/* Results */}
      <div className="flex flex-col gap-1.5 w-full">
        {(result.titleCorrect || result.artistCorrect || result.pointsEarned > 0) && (
          <>
            <ResultRow label="Titel" correct={result.titleCorrect} detail={result.titleCorrect ? '+50' : undefined} />
            <ResultRow label="Interpret" correct={result.artistCorrect} detail={result.artistCorrect ? '+50' : undefined} />
          </>
        )}
        {roundNumber > 1 && result.placementCorrect !== undefined && (
          <ResultRow
            label="Timeline"
            correct={result.placementCorrect}
            detail={result.placementCorrect ? '+75' : 'Falsch'}
          />
        )}
      </div>

      {/* Points */}
      <div className="text-center space-y-1.5">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className={clsx(
            "inline-block text-2xl font-black font-mono",
            result.pointsEarned > 100 ? "text-success" : result.pointsEarned > 0 ? "text-primary" : "text-error"
          )}
        >
          +{result.pointsEarned} Punkte
        </motion.div>
        {result.jokerEarned && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-1.5 text-amber-400 text-xs font-bold"
          >
            <Sparkles className="w-3.5 h-3.5" /> JOKER VERDIENT
          </motion.div>
        )}
      </div>

      {/* Next Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onNext}
        aria-label="Nächsten Song spielen"
        className="bg-primary hover:bg-violet-500 active:bg-violet-700 text-white px-6 min-h-[44px] py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all w-full focus-visible:ring-4 focus-visible:ring-primary/50"
      >
        NÄCHSTER SONG <ArrowRight className="w-4 h-4" aria-hidden="true" />
      </motion.button>
    </motion.div>
  );
};

function ResultRow({ label, correct, detail }: {
  label: string;
  correct: boolean;
  detail?: string;
}) {
  return (
    <div className={clsx(
      "flex items-center justify-between px-3 py-2 rounded-lg border",
      correct ? "bg-success/5 border-success/20" : "bg-error/5 border-error/20"
    )}>
      <span className="text-zinc-300 text-sm">{label}</span>
      <div className="flex items-center gap-2">
        {detail && <span className="text-zinc-500 text-xs font-mono">{detail}</span>}
        {correct ? (
          <Check className="w-4 h-4 text-success" />
        ) : (
          <X className="w-4 h-4 text-error" />
        )}
      </div>
    </div>
  );
}
