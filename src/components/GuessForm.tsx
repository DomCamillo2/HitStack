import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles, HelpCircle } from 'lucide-react';

interface Props {
  onSubmit: (title: string, artist: string) => void;
  onSkip?: () => void;
}

export const GuessForm = ({ onSubmit, onSkip }: Props) => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !artist.trim()) return;
    onSubmit(title.trim(), artist.trim());
  };

  return (
    <motion.form
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 20 }}
      onSubmit={handleSubmit}
      className="w-full max-w-sm mx-auto flex flex-col gap-3 px-4"
    >
      {/* Hint */}
      <div className="flex items-center justify-center gap-2 text-primary mb-1">
        <Sparkles className="w-5 h-5" aria-hidden="true" />
        <span className="text-sm font-bold uppercase tracking-widest">Bonusrunde!</span>
      </div>
      <p className="text-zinc-400 text-xs text-center -mt-2 mb-1">
        Titel &amp; Interpret richtig = Bonuspunkte! Tippfehler sind kein Problem.
      </p>

      {/* Title Input */}
      <div>
        <label htmlFor="guess-title" className="block text-xs font-medium text-zinc-400 mb-1">
          Song-Titel
        </label>
        <input
          id="guess-title"
          type="text"
          placeholder="z. B. Bohemian Rhapsody"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          className="w-full bg-surface border-2 border-zinc-600 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/40 transition-colors text-sm"
        />
      </div>

      {/* Artist Input */}
      <div>
        <label htmlFor="guess-artist" className="block text-xs font-medium text-zinc-400 mb-1">
          Interpret / Band
        </label>
        <input
          id="guess-artist"
          type="text"
          placeholder="z. B. Queen"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          className="w-full bg-surface border-2 border-zinc-600 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/40 transition-colors text-sm"
        />
      </div>

      {/* Submit */}
      <motion.button
        type="submit"
        whileTap={{ scale: 0.95 }}
        aria-label="Antwort abgeben"
        className="bg-primary hover:bg-violet-500 active:bg-violet-700 text-white px-6 min-h-[48px] py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all mt-1 shadow-lg shadow-primary/20 focus-visible:ring-4 focus-visible:ring-primary/50"
      >
        <Send className="w-4 h-4" aria-hidden="true" />
        ANTWORT ABGEBEN
      </motion.button>

      {/* Keine Ahnung / Skip */}
      {onSkip && (
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={onSkip}
          aria-label="Keine Ahnung – anderes Team darf raten"
          className="mt-1 min-h-[48px] py-2.5 rounded-xl border-2 border-zinc-600 text-zinc-400 text-xs font-bold flex items-center justify-center gap-2 hover:border-amber-400/50 hover:text-amber-400 focus-visible:border-amber-400 transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
          KEINE AHNUNG – ANDERES TEAM DARF RATEN
        </motion.button>
      )}
    </motion.form>
  );
};
