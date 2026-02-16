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
        <Sparkles className="w-5 h-5" />
        <span className="text-sm font-bold uppercase tracking-widest">Bonusrunde!</span>
      </div>
      <p className="text-zinc-500 text-xs text-center -mt-2 mb-1">
        Titel & Interpret richtig = Bonuspunkte! Tippfehler sind kein Problem.
      </p>

      {/* Title Input */}
      <input
        type="text"
        placeholder="Song-Titel..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
        className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
      />

      {/* Artist Input */}
      <input
        type="text"
        placeholder="Interpret / Band..."
        value={artist}
        onChange={(e) => setArtist(e.target.value)}
        className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
      />

      {/* Submit */}
      <motion.button
        type="submit"
        whileTap={{ scale: 0.95 }}
        className="bg-primary hover:bg-violet-600 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors mt-1 shadow-lg shadow-primary/20"
      >
        <Send className="w-4 h-4" />
        ANTWORT ABGEBEN
      </motion.button>

      {/* Keine Ahnung / Skip */}
      {onSkip && (
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={onSkip}
          className="mt-1 py-2.5 rounded-xl border border-white/10 text-zinc-500 text-xs font-bold flex items-center justify-center gap-2 hover:border-amber-400/30 hover:text-amber-400 transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          KEINE AHNUNG – ANDERES TEAM DARF RATEN
        </motion.button>
      )}
    </motion.form>
  );
};
