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
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', damping: 15 }}
      className="w-full max-w-sm mx-auto flex flex-col gap-4 px-4"
    >
      {/* Song Info */}
      <div className={clsx(
        "flex items-center p-3 rounded-xl gap-4 border-2",
        allCorrect ? "bg-emerald-900/20 border-success" : "bg-surface border-white/10"
      )}>
        <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-zinc-800">
          <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <h3 className="text-white font-black text-base leading-tight">{track.title}</h3>
          <p className="text-zinc-400 text-sm">{track.artist}</p>
          <p className="text-primary font-mono font-bold text-lg">{track.year}</p>
        </div>
      </div>

      {/* Results */}
      <div className="flex flex-col gap-2">
        {/* Bonus-Felder nur zeigen wenn Spieler geraten hat */}
        {(result.titleCorrect || result.artistCorrect || result.pointsEarned > 0) && (
          <>
            <ResultRow label="Titel" correct={result.titleCorrect} detail={result.titleCorrect ? '+50 Bonus' : undefined} />
            <ResultRow label="Interpret" correct={result.artistCorrect} detail={result.artistCorrect ? '+50 Bonus' : undefined} />
          </>
        )}
        {roundNumber > 1 && result.placementCorrect !== undefined && (
          <ResultRow
            label="Timeline-Einordnung"
            correct={result.placementCorrect}
            detail={result.placementCorrect ? '+75 Punkte' : 'Falsch eingeordnet'}
          />
        )}
      </div>

      {/* Points */}
      <div className="text-center space-y-1">
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
            className="flex items-center justify-center gap-1.5 text-amber-400 text-sm font-bold"
          >
            <Sparkles className="w-4 h-4" /> JOKER VERDIENT!
          </motion.div>
        )}
      </div>

      {/* Next Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onNext}
        aria-label="Nächsten Song spielen"
        className="bg-primary hover:bg-violet-500 active:bg-violet-700 text-white px-6 min-h-[48px] py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 focus-visible:ring-4 focus-visible:ring-primary/50"
      >
        NÄCHSTER SONG <ArrowRight className="w-4 h-4" aria-hidden="true" />
      </motion.button>
    </motion.div>
  );
};

function ResultRow({ label, correct, detail, partial }: {
  label: string;
  correct: boolean;
  detail?: string;
  partial?: boolean;
}) {
  return (
    <div className={clsx(
      "flex items-center justify-between p-2.5 rounded-lg",
      correct ? "bg-emerald-900/20" : partial ? "bg-yellow-900/20" : "bg-red-900/20"
    )}>
      <span className="text-zinc-300 text-sm">{label}</span>
      <div className="flex items-center gap-2">
        {detail && <span className="text-zinc-500 text-xs">{detail}</span>}
        {correct ? (
          <Check className="w-5 h-5 text-success" />
        ) : (
          <X className="w-5 h-5 text-error" />
        )}
      </div>
    </div>
  );
}
