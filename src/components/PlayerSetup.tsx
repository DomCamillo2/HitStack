import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ChevronRight, Info, Check, Music, Zap } from 'lucide-react';
import { MUSIC_CATEGORIES, DIFFICULTY_LEVELS } from '../services/api';
import type { Difficulty } from '../services/api';

interface Props {
  onStart: (names: string[], categories: string[], difficulty: Difficulty) => void;
  onShowHowToPlay?: () => void;
}

// Lokale Präferenzen laden/speichern
function loadPreferences() {
  try {
    const raw = localStorage.getItem('hitstack-prefs');
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}

function savePreferences(names: string[], categories: string[], difficulty: Difficulty) {
  try {
    localStorage.setItem('hitstack-prefs', JSON.stringify({ names, categories, difficulty }));
  } catch { /* ignore */ }
}

// Kategorie-Beschreibungen
const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  '2000er': 'Die größten Hits aus den 2000ern',
  '2010er': 'Chart-Hits & Streaming-Klassiker der 2010er',
  'pop': 'Pop-Hits von den 80ern bis heute',
  'deutsch': 'Deutsche Musik – von NDW bis Deutschrap',
  'rnb': 'R&B & Soul von den 90ern bis heute',
  'rock': 'Rock-Klassiker von Queen bis Måneskin',
};

// Step progress bar (compact, only shown from step 2+)
function StepBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-1.5 w-full max-w-[120px] mx-auto mb-5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1 rounded-full flex-1 transition-colors duration-300 ${
            i <= current ? 'bg-primary' : 'bg-white/10'
          }`}
        />
      ))}
    </div>
  );
}

export const PlayerSetup = ({ onStart, onShowHowToPlay }: Props) => {
  const [step, setStep] = useState<'players' | 'categories' | 'difficulty'>('players');
  const [names, setNames] = useState<string[]>(['', '']);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['2000er']);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [hasSavedPrefs, setHasSavedPrefs] = useState(false);

  // Gespeicherte Präferenzen laden
  useEffect(() => {
    const prefs = loadPreferences();
    if (prefs) {
      setHasSavedPrefs(true);
      if (prefs.names?.length >= 2) setNames(prefs.names);
      if (prefs.categories?.length > 0) setSelectedCategories(prefs.categories);
      if (prefs.difficulty) setDifficulty(prefs.difficulty);
    }
  }, []);

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
      const trimmedNames = validNames.map(n => n.trim());
      savePreferences(trimmedNames, selectedCategories, difficulty);
      onStart(trimmedNames, selectedCategories, difficulty);
    }
  };

  // Schnellstart mit gespeicherten Präferenzen
  const handleQuickStart = () => {
    const prefs = loadPreferences();
    if (prefs && prefs.names?.length >= 2) {
      onStart(prefs.names, prefs.categories, prefs.difficulty);
    }
  };

  const stepIndex = step === 'players' ? 0 : step === 'categories' ? 1 : 2;

  return (
    <div className="h-[100dvh] bg-background flex flex-col items-center justify-center p-6 overflow-y-auto" role="main">

      <AnimatePresence mode="wait">
        {/* ── STEP 1: HERO LANDING + PLAYERS ── */}
        {step === 'players' && (
          <motion.div
            key="players"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -40 }}
            className="w-full max-w-sm flex flex-col items-center px-2"
          >
            {/* Hero Section */}
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', damping: 20 }}
              className="text-center mb-6"
            >
              {/* Decorative icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 10, delay: 0.1 }}
                className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4"
              >
                <Music className="w-7 h-7 text-primary" />
              </motion.div>

              <h1 className="text-4xl font-black text-white italic tracking-tight">
                HIT<span className="text-primary">STACK</span>
              </h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-zinc-500 text-sm mt-2 max-w-[240px] mx-auto leading-relaxed"
              >
                Erkennt den Song, ratet den Titel und baut eure Timeline!
              </motion.p>

              {/* How-to-play link */}
              {onShowHowToPlay && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  onClick={onShowHowToPlay}
                  className="mt-3 inline-flex items-center gap-1 text-zinc-600 hover:text-zinc-400 text-xs transition-colors focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
                  aria-label="Spielanleitung anzeigen"
                >
                  <Info className="w-3 h-3" aria-hidden="true" />
                  Wie funktioniert's?
                </motion.button>
              )}
            </motion.div>

            {/* Quick Start for returning users */}
            {hasSavedPrefs && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleQuickStart}
                className="w-full mb-4 bg-primary hover:bg-violet-500 active:bg-violet-700 text-white min-h-[48px] py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all focus-visible:ring-4 focus-visible:ring-primary/50"
                aria-label="Sofort mit letzten Einstellungen starten"
              >
                <Zap className="w-4 h-4" aria-hidden="true" />
                WEITER SPIELEN
              </motion.button>
            )}

            {/* Divider for returning users */}
            {hasSavedPrefs && (
              <div className="w-full flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-zinc-600 text-[10px] uppercase tracking-wider">oder neues Spiel</span>
                <div className="flex-1 h-px bg-white/5" />
              </div>
            )}

            {/* Player Inputs */}
            <div className="w-full flex flex-col gap-2.5" role="group" aria-label="Spieler:innen eingeben">
              {names.map((name, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  className="flex items-center gap-2"
                >
                  <div className="flex-1">
                    <label htmlFor={`player-${i}`} className="sr-only">Spieler:in {i + 1}</label>
                    <input
                      id={`player-${i}`}
                      type="text"
                      placeholder={`Spieler:in ${i + 1}`}
                      value={name}
                      onChange={(e) => updateName(i, e.target.value)}
                      autoFocus={i === 0 && !hasSavedPrefs}
                      maxLength={20}
                      aria-required={i < 2 ? true : undefined}
                      className="w-full bg-surface border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-colors text-sm"
                    />
                  </div>
                  {names.length > 2 && (
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removePlayer(i)}
                      aria-label={`Spieler:in ${i + 1} entfernen`}
                      className="w-8 h-8 rounded-full bg-white/5 text-zinc-600 hover:text-error hover:bg-error/10 flex items-center justify-center transition-colors shrink-0"
                    >
                      <X className="w-3.5 h-3.5" aria-hidden="true" />
                    </motion.button>
                  )}
                </motion.div>
              ))}

              {names.length < 8 && (
                <button
                  type="button"
                  onClick={addPlayer}
                  aria-label="Weitere:n Spieler:in hinzufügen"
                  className="w-full min-h-[40px] py-2 rounded-lg border border-dashed border-white/10 text-zinc-600 text-xs font-medium hover:border-primary/30 hover:text-primary/70 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  Hinzufügen
                </button>
              )}
            </div>

            {/* Continue */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              whileTap={{ scale: 0.95 }}
              disabled={!canContinue}
              onClick={() => setStep('categories')}
              aria-label="Weiter zur Musikauswahl"
              className={`w-full mt-4 min-h-[48px] py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 transition-all focus-visible:ring-4 focus-visible:ring-primary/50 ${
                hasSavedPrefs
                  ? 'bg-surface border border-white/10 text-zinc-300 hover:bg-zinc-800 disabled:text-zinc-700 disabled:cursor-not-allowed'
                  : 'bg-primary hover:bg-violet-500 active:bg-violet-700 text-white disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed'
              }`}
            >
              {hasSavedPrefs ? 'NEUES SPIEL EINRICHTEN' : 'WEITER'}
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </motion.button>

            {!canContinue && !hasSavedPrefs && (
              <p className="text-zinc-600 text-xs text-center mt-2" role="status" aria-live="polite">
                Mindestens 2 Namen eingeben
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
            className="w-full max-w-sm flex flex-col px-2"
            role="group"
            aria-labelledby="step-categories-heading"
          >
            <StepBar current={stepIndex} total={3} />

            <h2 className="text-white font-bold text-lg text-center mb-1" id="step-categories-heading">
              Welche Musik?
            </h2>
            <p className="text-zinc-500 text-xs text-center mb-4">Wähle eine oder mehrere Kategorien</p>

            <div className="grid grid-cols-2 gap-1.5" role="group" aria-label="Musik-Kategorien auswählen">
              {MUSIC_CATEGORIES.map((cat) => {
                const isSelected = selectedCategories.includes(cat.id);
                const description = CATEGORY_DESCRIPTIONS[cat.id] || '';
                return (
                  <motion.button
                    key={cat.id}
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleCategory(cat.id)}
                    role="checkbox"
                    aria-checked={isSelected}
                    aria-label={`${cat.label}: ${description}`}
                    className={`
                      min-h-[56px] p-3 rounded-xl border text-left transition-all text-sm font-bold
                      focus-visible:ring-2 focus-visible:ring-primary/50
                      ${isSelected
                        ? 'border-primary/40 bg-primary/10 text-white'
                        : 'border-white/5 bg-surface text-zinc-400 hover:border-white/10 hover:text-zinc-300'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span>{cat.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-primary" aria-hidden="true" />}
                    </div>
                    <p className="text-[10px] font-normal text-zinc-600 mt-1 leading-tight">
                      {description}
                    </p>
                  </motion.button>
                );
              })}
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setStep('players')}
                aria-label="Zurück"
                className="flex-1 min-h-[44px] py-2.5 rounded-xl border border-white/10 text-zinc-400 font-bold text-sm hover:border-white/20 hover:text-zinc-300 transition-colors"
              >
                ZURÜCK
              </button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                disabled={!canStart}
                onClick={() => setStep('difficulty')}
                aria-label="Weiter zur Schwierigkeitswahl"
                className="flex-[2] bg-primary hover:bg-violet-500 active:bg-violet-700 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-white min-h-[44px] py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 transition-all focus-visible:ring-4 focus-visible:ring-primary/50"
              >
                WEITER
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 3: Schwierigkeitsgrad ── */}
        {step === 'difficulty' && (
          <motion.div
            key="difficulty"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            className="w-full max-w-sm flex flex-col px-2"
            role="radiogroup"
            aria-labelledby="step-difficulty-heading"
          >
            <StepBar current={stepIndex} total={3} />

            <h2 className="text-white font-bold text-lg text-center mb-1" id="step-difficulty-heading">
              Schwierigkeit
            </h2>
            <p className="text-zinc-500 text-xs text-center mb-4">Wie viel Hörzeit bekommt ihr?</p>

            <div className="flex flex-col gap-1.5">
              {DIFFICULTY_LEVELS.map((level) => {
                const isSelected = difficulty === level.id;
                return (
                  <motion.button
                    key={level.id}
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setDifficulty(level.id)}
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={`${level.label}: ${level.description}`}
                    className={`
                      min-h-[56px] p-4 rounded-xl border text-left transition-all flex items-center gap-3
                      focus-visible:ring-2 focus-visible:ring-primary/50
                      ${isSelected
                        ? 'border-primary/40 bg-primary/10'
                        : 'border-white/5 bg-surface hover:border-white/10'
                      }
                    `}
                  >
                    <div className="flex-1">
                      <div className={`font-bold text-sm ${
                        isSelected ? 'text-white' : 'text-zinc-400'
                      }`}>
                        {level.label}
                      </div>
                      <div className={`text-xs mt-0.5 ${
                        isSelected ? 'text-zinc-400' : 'text-zinc-600'
                      }`}>
                        {level.description}
                      </div>
                    </div>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0"
                        aria-hidden="true"
                      >
                        <Check className="w-3 h-3 text-primary" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setStep('categories')}
                aria-label="Zurück zur Musikauswahl"
                className="flex-1 min-h-[44px] py-2.5 rounded-xl border border-white/10 text-zinc-400 font-bold text-sm hover:border-white/20 hover:text-zinc-300 transition-colors"
              >
                ZURÜCK
              </button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleStartGame}
                aria-label="Spiel starten"
                className="flex-[2] bg-primary hover:bg-violet-500 active:bg-violet-700 text-white min-h-[48px] py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all focus-visible:ring-4 focus-visible:ring-primary/50"
              >
                SPIEL STARTEN
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
