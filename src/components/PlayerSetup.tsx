import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Users, Sparkles, ChevronRight } from 'lucide-react';
import { MUSIC_CATEGORIES, DIFFICULTY_LEVELS } from '../services/api';
import type { Difficulty } from '../services/api';

interface Props {
  onStart: (names: string[], categories: string[], difficulty: Difficulty) => void;
}

export const PlayerSetup = ({ onStart }: Props) => {
  const [step, setStep] = useState<'players' | 'categories' | 'difficulty'>('players');
  const [names, setNames] = useState<string[]>(['', '']);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['2000s']);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  const addPlayer = () => {
    if (names.length < 8) setNames([...names, '']);
  };

  const removePlayer = (index: number) => {
    if (names.length <= 2) return;
    setNames(names.filter((_, i) => i !== index));
  };

  const updateName = (index: number, value: string) => {
    const updated = [...names];
    updated[index] = value;
    setNames(updated);
  };

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev =>
      prev.includes(id)
        ? prev.filter(c => c !== id)
        : [...prev, id]
    );
  };

  const validNames = names.filter(n => n.trim().length > 0);
  const canContinue = validNames.length >= 2;
  const canStart = selectedCategories.length > 0;

  const handleStartGame = () => {
    if (canStart) {
      onStart(validNames.map(n => n.trim()), selectedCategories, difficulty);
    }
  };

  return (
    <div className="h-[100dvh] bg-background flex flex-col items-center justify-center p-6 overflow-y-auto">
      {/* Logo */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-6 shrink-0"
      >
        <h1 className="text-4xl font-black text-white italic">
          HIT<span className="text-primary">STACK</span>
        </h1>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ── STEP 1: Spieler ── */}
        {step === 'players' && (
          <motion.div
            key="players"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="w-full max-w-sm flex flex-col gap-3 px-2"
          >
            <div className="flex items-center justify-center gap-2 text-zinc-400 text-sm mb-2">
              <Users className="w-4 h-4" />
              <span>Wer spielt mit?</span>
            </div>

            {names.map((name, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </div>
                <input
                  type="text"
                  placeholder={`Spieler ${i + 1}`}
                  value={name}
                  onChange={(e) => updateName(i, e.target.value)}
                  autoFocus={i === 0}
                  maxLength={20}
                  className="flex-1 bg-surface border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
                />
                {names.length > 2 && (
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removePlayer(i)}
                    className="w-8 h-8 rounded-full bg-white/5 text-zinc-500 hover:text-error hover:bg-error/10 flex items-center justify-center transition-colors shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                )}
              </motion.div>
            ))}

            {names.length < 8 && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={addPlayer}
                className="w-full py-3 rounded-xl border-2 border-dashed border-white/10 text-zinc-500 text-sm font-mono hover:border-primary/30 hover:text-primary/60 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Spieler hinzufügen
              </motion.button>
            )}

            <motion.button
              whileTap={{ scale: 0.95 }}
              disabled={!canContinue}
              onClick={() => setStep('categories')}
              className="mt-4 bg-primary hover:bg-violet-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_40px_rgba(139,92,246,0.3)]"
            >
              WEITER
              <ChevronRight className="w-5 h-5" />
            </motion.button>

            {!canContinue && (
              <p className="text-zinc-600 text-xs text-center">
                Mindestens 2 Spieler benötigt
              </p>
            )}
          </motion.div>
        )}

        {/* ── STEP 2: Kategorien ── */}
        {step === 'categories' && (
          <motion.div
            key="categories"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            className="w-full max-w-sm flex flex-col gap-3 px-2"
          >
            <div className="text-center text-zinc-400 text-sm mb-2">
              🎵 Welche Musik?
            </div>

            <div className="grid grid-cols-2 gap-2">
              {MUSIC_CATEGORIES.map((cat) => {
                const isSelected = selectedCategories.includes(cat.id);
                return (
                  <motion.button
                    key={cat.id}
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleCategory(cat.id)}
                    className={`
                      p-3 rounded-xl border-2 text-left transition-all text-sm font-bold
                      ${isSelected
                        ? 'border-primary bg-primary/15 text-white shadow-[0_0_15px_rgba(139,92,246,0.2)]'
                        : 'border-white/10 bg-surface text-zinc-400 hover:border-white/20'
                      }
                    `}
                  >
                    <span className="text-lg mr-2">{cat.emoji}</span>
                    {cat.label}
                  </motion.button>
                );
              })}
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setStep('players')}
                className="flex-1 py-3 rounded-full border border-white/10 text-zinc-400 font-bold text-sm hover:border-white/20 transition-colors"
              >
                ← ZURÜCK
              </button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                disabled={!canStart}
                onClick={() => setStep('difficulty')}
                className="flex-[2] bg-primary hover:bg-violet-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_40px_rgba(139,92,246,0.3)]"
              >
                WEITER
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>

            {!canStart && (
              <p className="text-zinc-600 text-xs text-center">
                Mindestens 1 Kategorie wählen
              </p>
            )}
          </motion.div>
        )}

        {/* ── STEP 3: Schwierigkeitsgrad ── */}
        {step === 'difficulty' && (
          <motion.div
            key="difficulty"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            className="w-full max-w-sm flex flex-col gap-3 px-2"
          >
            <div className="text-center text-zinc-400 text-sm mb-2">
              💪 Wie schwer soll es sein?
            </div>

            <div className="flex flex-col gap-2">
              {DIFFICULTY_LEVELS.map((level) => {
                const isSelected = difficulty === level.id;
                return (
                  <motion.button
                    key={level.id}
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setDifficulty(level.id)}
                    className={`
                      p-4 rounded-xl border-2 text-left transition-all flex items-start gap-3
                      ${isSelected
                        ? 'border-primary bg-primary/15 shadow-[0_0_20px_rgba(139,92,246,0.15)]'
                        : 'border-white/10 bg-surface hover:border-white/20'
                      }
                    `}
                  >
                    <span className="text-2xl mt-0.5">{level.emoji}</span>
                    <div className="flex-1">
                      <div className={`font-bold text-sm ${
                        isSelected ? 'text-white' : 'text-zinc-400'
                      }`}>
                        {level.label}
                      </div>
                      <div className={`text-xs mt-0.5 ${
                        isSelected ? 'text-zinc-300' : 'text-zinc-600'
                      }`}>
                        {level.description}
                      </div>
                    </div>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1"
                      >
                        <span className="text-white text-xs">✓</span>
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setStep('categories')}
                className="flex-1 py-3 rounded-full border border-white/10 text-zinc-400 font-bold text-sm hover:border-white/20 transition-colors"
              >
                ← ZURÜCK
              </button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleStartGame}
                className="flex-[2] bg-primary hover:bg-violet-600 text-white py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_40px_rgba(139,92,246,0.3)]"
              >
                <Sparkles className="w-5 h-5" />
                LOS GEHT'S
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
