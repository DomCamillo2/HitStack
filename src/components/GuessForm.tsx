import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, HelpCircle } from 'lucide-react';

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
      <div className="text-center mb-1">
        <span className="text-primary text-xs font-bold uppercase tracking-wider">Bonusrunde</span>
      </div>
      <p className="text-zinc-500 text-xs text-center -mt-2 mb-1">
        Titel &amp; Interpret richtig = Bonuspunkte
      </p>

      {/* Title Input */}
      <div>
        <label htmlFor="guess-title" className="block text-xs font-medium text-zinc-500 mb-1.5">
          Song-Titel
        </label>
        <input
          id="guess-title"
          type="text"
          placeholder="z. B. Bohemian Rhapsody"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          className="w-full bg-surface border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-colors text-sm"
        />
      </div>

      {/* Artist Input */}
      <div>
        <label htmlFor="guess-artist" className="block text-xs font-medium text-zinc-500 mb-1.5">
          Interpret / Band
        </label>
        <input
          id="guess-artist"
          type="text"
          placeholder="z. B. Queen"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          className="w-full bg-surface border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-colors text-sm"
        />
      </div>

      {/* Submit */}
      <motion.button
        type="submit"
        whileTap={{ scale: 0.95 }}
        aria-label="Antwort abgeben"
        className="bg-primary hover:bg-violet-500 active:bg-violet-700 text-white px-6 min-h-[44px] py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all mt-1 focus-visible:ring-4 focus-visible:ring-primary/50"
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
          className="min-h-[40px] py-2 rounded-xl text-zinc-500 text-xs font-bold flex items-center justify-center gap-1.5 hover:text-zinc-300 transition-colors focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
          KEINE AHNUNG
        </motion.button>
      )}
    </motion.form>
  );
};
