import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ChevronRight, Info, Check, Music, Zap, Headphones } from 'lucide-react';
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

const EXAMPLE_NAMES = ['z. B. Alex', 'z. B. Sam', 'z. B. Mia', 'z. B. Leo', 'z. B. Pia', 'z. B. Jo', 'z. B. Kim', 'z. B. Max'];

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

// Animated background with subtle music-themed visuals
function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Gradient orbs */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full opacity-[0.04]"
        style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)', top: '-10%', right: '-20%' }}
        animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full opacity-[0.03]"
        style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)', bottom: '-5%', left: '-15%' }}
        animate={{ x: [0, -20, 0], y: [0, -15, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Subtle floating music notes */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute text-primary/[0.06]"
          style={{ left: `${20 + i * 30}%`, top: `${30 + i * 15}%` }}
          animate={{ y: [0, -30, 0], rotate: [0, 10, -10, 0], opacity: [0.04, 0.08, 0.04] }}
          transition={{ duration: 8 + i * 2, repeat: Infinity, ease: 'easeInOut', delay: i * 2 }}
        >
          <Music className="w-8 h-8" />
        </motion.div>
      ))}
      {/* Horizontal wave line */}
      <svg className="absolute bottom-[15%] left-0 w-full h-16 opacity-[0.04]" viewBox="0 0 1200 100" preserveAspectRatio="none">
        <motion.path
          d="M0,50 C200,20 400,80 600,50 C800,20 1000,80 1200,50"
          fill="none"
          stroke="#8b5cf6"
          strokeWidth="2"
          animate={{ d: [
            'M0,50 C200,20 400,80 600,50 C800,20 1000,80 1200,50',
            'M0,50 C200,80 400,20 600,50 C800,80 1000,20 1200,50',
            'M0,50 C200,20 400,80 600,50 C800,20 1000,80 1200,50',
          ] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>
    </div>
  );
}

export const PlayerSetup = ({ onStart, onShowHowToPlay }: Props) => {
  const [step, setStep] = useState<'players' | 'categories' | 'difficulty'>('players');
  const [names, setNames] = useState<string[]>(['', '']);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['2000er']);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [hasSavedPrefs, setHasSavedPrefs] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

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
    if (showValidation) setShowValidation(false);
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

  const handleContinue = () => {
    if (canContinue) {
      setStep('categories');
    } else {
      setShowValidation(true);
    }
  };

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
    <div className="h-[100dvh] bg-background flex flex-col items-center justify-center p-6 overflow-y-auto relative" role="main">
      <AnimatedBackground />

      <AnimatePresence mode="wait">
        {/* ── STEP 1: HERO LANDING + PLAYERS ── */}
        {step === 'players' && (
          <motion.div
            key="players"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -40 }}
            className="w-full max-w-sm flex flex-col items-center px-2 relative z-10"
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
                className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/10"
              >
                <Headphones className="w-7 h-7 text-primary" />
              </motion.div>

              <h1 className="text-4xl font-black text-white italic tracking-tight">
                HIT<span className="text-primary">STACK</span>
              </h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-zinc-400 text-sm mt-2.5 max-w-[280px] mx-auto leading-relaxed"
              >
                Hört einen Song-Ausschnitt, erkennt den Titel und ordnet ihn zeitlich ein!
              </motion.p>

              {/* How-to-play link — made more visible */}
              {onShowHowToPlay && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  onClick={onShowHowToPlay}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/8 text-zinc-400 hover:text-zinc-200 hover:bg-white/10 text-xs font-medium transition-all focus-visible:ring-2 focus-visible:ring-primary/50"
                  aria-label="Spielanleitung anzeigen"
                >
                  <Info className="w-3.5 h-3.5" aria-hidden="true" />
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
                className="w-full mb-4 bg-primary hover:bg-violet-500 active:bg-violet-700 text-white min-h-[52px] py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all focus-visible:ring-4 focus-visible:ring-primary/50 shadow-lg shadow-primary/20"
                aria-label="Sofort mit letzten Einstellungen starten"
              >
                <Zap className="w-4 h-4" aria-hidden="true" />
                WEITER SPIELEN
              </motion.button>
            )}

            {/* Divider for returning users */}
            {hasSavedPrefs && (
              <div className="w-full flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-white/8" />
                <span className="text-zinc-500 text-[10px] uppercase tracking-wider">oder neues Spiel</span>
                <div className="flex-1 h-px bg-white/8" />
              </div>
            )}

            {/* Player Inputs with visible labels */}
            <div className="w-full flex flex-col gap-3" role="group" aria-label="Spieler:innen eingeben">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-zinc-300 text-xs font-bold">Wer spielt mit?</span>
                <span className="text-zinc-600 text-[10px]">{validNames.length}/{names.length} eingetragen</span>
              </div>

              {names.map((name, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  className="flex flex-col gap-1"
                >
                  <label htmlFor={`player-${i}`} className="text-zinc-500 text-[11px] font-medium pl-1">
                    Spieler:in {i + 1} {i < 2 && <span className="text-primary/60">*</span>}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id={`player-${i}`}
                      type="text"
                      placeholder={EXAMPLE_NAMES[i] || `z. B. Spieler ${i + 1}`}
                      value={name}
                      onChange={(e) => updateName(i, e.target.value)}
                      autoFocus={i === 0 && !hasSavedPrefs}
                      maxLength={20}
                      aria-required={i < 2 ? true : undefined}
                      aria-invalid={showValidation && i < 2 && !name.trim() ? true : undefined}
                      className={`flex-1 bg-surface border rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-colors text-sm ${
                        showValidation && i < 2 && !name.trim()
                          ? 'border-error/50 bg-error/5'
                          : 'border-white/10'
                      }`}
                    />
                    {names.length > 2 && (
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removePlayer(i)}
                        aria-label={`Spieler:in ${i + 1} entfernen`}
                        className="w-9 h-9 rounded-full bg-white/5 text-zinc-500 hover:text-error hover:bg-error/10 flex items-center justify-center transition-colors shrink-0"
                      >
                        <X className="w-3.5 h-3.5" aria-hidden="true" />
                      </motion.button>
                    )}
                  </div>
                  {showValidation && i < 2 && !name.trim() && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-error text-[11px] pl-1"
                      role="alert"
                    >
                      Bitte einen Namen eingeben
                    </motion.p>
                  )}
                </motion.div>
              ))}

              {names.length < 8 && (
                <button
                  type="button"
                  onClick={addPlayer}
                  aria-label="Weitere:n Spieler:in hinzufügen"
                  className="w-full min-h-[44px] py-2.5 rounded-lg border border-dashed border-white/10 text-zinc-500 text-xs font-medium hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  Spieler:in hinzufügen
                </button>
              )}
            </div>

            {/* Continue CTA */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: canContinue ? 1 : 0.7 }}
              transition={{ delay: 0.4 }}
              whileTap={canContinue ? { scale: 0.95 } : undefined}
              onClick={handleContinue}
              aria-label="Weiter zur Musikauswahl"
              className={`w-full mt-5 min-h-[52px] py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 transition-all focus-visible:ring-4 focus-visible:ring-primary/50 ${
                hasSavedPrefs
                  ? 'bg-surface border border-white/10 text-zinc-300 hover:bg-zinc-800'
                  : canContinue
                    ? 'bg-primary hover:bg-violet-500 active:bg-violet-700 text-white shadow-lg shadow-primary/20'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              {hasSavedPrefs ? 'NEUES SPIEL EINRICHTEN' : 'SPIEL EINRICHTEN'}
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </motion.button>
          </motion.div>
        )}

        {/* ── STEP 2: Kategorien ── */}
        {step === 'categories' && (
          <motion.div
            key="categories"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            className="w-full max-w-sm flex flex-col px-2 relative z-10"
            role="group"
            aria-labelledby="step-categories-heading"
          >
            <StepBar current={stepIndex} total={3} />

            <h2 className="text-white font-bold text-lg text-center mb-1" id="step-categories-heading">
              Welche Musik?
            </h2>
            <p className="text-zinc-400 text-xs text-center mb-4">Wähle eine oder mehrere Kategorien</p>

            <div className="grid grid-cols-2 gap-2" role="group" aria-label="Musik-Kategorien auswählen">
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
                      min-h-[60px] p-3 rounded-xl border text-left transition-all text-sm font-bold
                      focus-visible:ring-2 focus-visible:ring-primary/50
                      ${isSelected
                        ? 'border-primary/40 bg-primary/10 text-white shadow-sm shadow-primary/10'
                        : 'border-white/8 bg-surface text-zinc-400 hover:border-white/15 hover:text-zinc-300'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span>{cat.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-primary" aria-hidden="true" />}
                    </div>
                    <p className="text-[10px] font-normal text-zinc-500 mt-1 leading-tight">
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
                className="flex-1 min-h-[48px] py-2.5 rounded-xl border border-white/10 text-zinc-400 font-bold text-sm hover:border-white/20 hover:text-zinc-300 transition-colors"
              >
                ZURÜCK
              </button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                disabled={!canStart}
                onClick={() => setStep('difficulty')}
                aria-label="Weiter zur Schwierigkeitswahl"
                className="flex-[2] bg-primary hover:bg-violet-500 active:bg-violet-700 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-white min-h-[48px] py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 transition-all focus-visible:ring-4 focus-visible:ring-primary/50 shadow-lg shadow-primary/20"
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
            className="w-full max-w-sm flex flex-col px-2 relative z-10"
            role="radiogroup"
            aria-labelledby="step-difficulty-heading"
          >
            <StepBar current={stepIndex} total={3} />

            <h2 className="text-white font-bold text-lg text-center mb-1" id="step-difficulty-heading">
              Schwierigkeit
            </h2>
            <p className="text-zinc-400 text-xs text-center mb-4">Wie viel Hörzeit bekommt ihr?</p>

            <div className="flex flex-col gap-2">
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
                      min-h-[60px] p-4 rounded-xl border text-left transition-all flex items-center gap-3
                      focus-visible:ring-2 focus-visible:ring-primary/50
                      ${isSelected
                        ? 'border-primary/40 bg-primary/10 shadow-sm shadow-primary/10'
                        : 'border-white/8 bg-surface hover:border-white/15'
                      }
                    `}
                  >
                    <div className="flex-1">
                      <div className={`font-bold text-sm ${
                        isSelected ? 'text-white' : 'text-zinc-300'
                      }`}>
                        {level.label}
                      </div>
                      <div className={`text-xs mt-0.5 ${
                        isSelected ? 'text-zinc-400' : 'text-zinc-500'
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
                className="flex-1 min-h-[48px] py-2.5 rounded-xl border border-white/10 text-zinc-400 font-bold text-sm hover:border-white/20 hover:text-zinc-300 transition-colors"
              >
                ZURÜCK
              </button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleStartGame}
                aria-label="Spiel starten"
                className="flex-[2] bg-primary hover:bg-violet-500 active:bg-violet-700 text-white min-h-[52px] py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all focus-visible:ring-4 focus-visible:ring-primary/50 shadow-lg shadow-primary/20"
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
