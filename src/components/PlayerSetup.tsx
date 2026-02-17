import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Users, Sparkles, ChevronRight, Info } from 'lucide-react';
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

// Fortschrittsanzeige
const STEPS = [
  { key: 'players', label: 'Spielende' },
  { key: 'categories', label: 'Musik' },
  { key: 'difficulty', label: 'Level' },
] as const;

function ProgressIndicator({ currentStep }: { currentStep: string }) {
  const currentIndex = STEPS.findIndex(s => s.key === currentStep);

  return (
    <nav aria-label="Fortschritt im Setup" className="flex items-center justify-center gap-2 mb-4">
      {STEPS.map((step, i) => (
        <div key={step.key} className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                i < currentIndex
                  ? 'bg-success text-white'
                  : i === currentIndex
                  ? 'bg-primary text-white'
                  : 'bg-zinc-700 text-zinc-400'
              }`}
              aria-current={i === currentIndex ? 'step' : undefined}
            >
              {i < currentIndex ? '✓' : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:inline ${
              i <= currentIndex ? 'text-white' : 'text-zinc-500'
            }`}>
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-8 h-0.5 rounded ${
              i < currentIndex ? 'bg-success' : 'bg-zinc-700'
            }`} />
          )}
        </div>
      ))}
      <span className="sr-only">Schritt {currentIndex + 1} von {STEPS.length}</span>
    </nav>
  );
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

export const PlayerSetup = ({ onStart, onShowHowToPlay }: Props) => {
  const [step, setStep] = useState<'players' | 'categories' | 'difficulty'>('players');
  const [names, setNames] = useState<string[]>(['', '']);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['2000er']);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [showIntro, setShowIntro] = useState(true);
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

  return (
    <div className="h-[100dvh] bg-background flex flex-col items-center justify-center p-6 overflow-y-auto" role="main">
      {/* Logo + Info Button */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-4 shrink-0"
      >
        <h1 className="text-4xl font-black text-white italic">
          HIT<span className="text-primary">STACK</span>
        </h1>
        {onShowHowToPlay && (
          <button
            onClick={onShowHowToPlay}
            className="mt-2 inline-flex items-center gap-1.5 px-4 min-h-[36px] py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-primary/50"
            aria-label="Spielanleitung anzeigen"
          >
            <Info className="w-3.5 h-3.5" aria-hidden="true" />
            Wie geht's?
          </button>
        )}
      </motion.div>

      {/* Spielanleitung (Intro) */}
      <AnimatePresence>
        {showIntro && step === 'players' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="w-full max-w-sm overflow-hidden mb-4"
          >
            <div className="bg-surface border border-white/10 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-primary mb-2">
                <Info className="w-4 h-4" aria-hidden="true" />
                <span className="text-sm font-bold">So funktioniert's</span>
              </div>
              <p className="text-zinc-300 text-xs leading-relaxed">
                Hört euch Songs an, ratet Titel &amp; Interpret und ordnet sie chronologisch in eure Timeline ein. 
                Je besser ihr ratet und einordnet, desto mehr Punkte gibt es!
              </p>
              <button
                onClick={() => setShowIntro(false)}
                className="mt-3 text-zinc-500 text-xs hover:text-zinc-300 transition-colors underline underline-offset-2 min-h-[36px]"
                aria-label="Spielanleitung ausblenden"
              >
                Verstanden
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fortschrittsanzeige */}
      <ProgressIndicator currentStep={step} />

      <AnimatePresence mode="wait">
        {/* ── STEP 1: Spielende ── */}
        {step === 'players' && (
          <motion.div
            key="players"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="w-full max-w-sm flex flex-col gap-3 px-2"
            role="group"
            aria-labelledby="step-players-heading"
          >
            <div className="flex items-center justify-center gap-2 text-zinc-300 text-sm mb-2" id="step-players-heading">
              <Users className="w-4 h-4" aria-hidden="true" />
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
                <div
                  className="w-8 h-8 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0"
                  aria-hidden="true"
                >
                  {i + 1}
                </div>
                <div className="flex-1">
                  <label
                    htmlFor={`player-${i}`}
                    className="block text-xs font-medium text-zinc-400 mb-1"
                  >
                    Spieler:in {i + 1}
                  </label>
                  <input
                    id={`player-${i}`}
                    type="text"
                    placeholder="Name eingeben…"
                    value={name}
                    onChange={(e) => updateName(i, e.target.value)}
                    autoFocus={i === 0}
                    maxLength={20}
                    aria-required={i < 2 ? true : undefined}
                    className="w-full bg-surface border-2 border-zinc-600 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/40 transition-colors text-sm"
                  />
                </div>
                {names.length > 2 && (
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removePlayer(i)}
                    aria-label={`Spieler:in ${i + 1} entfernen`}
                    className="w-10 h-10 rounded-full bg-white/5 text-zinc-400 hover:text-error hover:bg-error/10 focus-visible:text-error flex items-center justify-center transition-colors shrink-0"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </motion.button>
                )}
              </motion.div>
            ))}

            {names.length < 8 && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={addPlayer}
                aria-label="Weitere:n Spieler:in hinzufügen"
                className="w-full min-h-[48px] py-3 rounded-xl border-2 border-dashed border-zinc-600 text-zinc-400 text-sm font-mono hover:border-primary/50 hover:text-primary/80 focus-visible:border-primary focus-visible:text-primary transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                Spieler:in hinzufügen
              </motion.button>
            )}

            <motion.button
              whileTap={{ scale: 0.95 }}
              disabled={!canContinue}
              onClick={() => setStep('categories')}
              aria-label="Weiter zur Musikauswahl"
              className="mt-4 bg-primary hover:bg-violet-500 active:bg-violet-700 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed text-white px-8 min-h-[52px] py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_40px_rgba(139,92,246,0.3)] focus-visible:ring-4 focus-visible:ring-primary/50"
            >
              WEITER
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            </motion.button>

            {!canContinue && (
              <p className="text-zinc-500 text-xs text-center" role="status" aria-live="polite">
                Mindestens 2 Namen eingeben
              </p>
            )}

            {/* Schnellstart für wiederkehrende Nutzende */}
            {hasSavedPrefs && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={handleQuickStart}
                className="mt-2 py-2 text-zinc-500 text-xs hover:text-primary transition-colors underline underline-offset-2 min-h-[40px]"
                aria-label="Setup überspringen und mit letzten Einstellungen starten"
              >
                ⚡ Mit letzten Einstellungen starten
              </motion.button>
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
            role="group"
            aria-labelledby="step-categories-heading"
          >
            <div className="text-center text-zinc-300 text-sm mb-2" id="step-categories-heading">
              <span role="img" aria-label="Musik-Note">🎵</span> Welche Musik-Dekaden?
              <p className="text-zinc-500 text-xs mt-1">Mehrfachauswahl möglich</p>
            </div>

            <div className="grid grid-cols-2 gap-2" role="group" aria-label="Musik-Dekaden auswählen">
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
                    title={description}
                    className={`
                      min-h-[56px] p-3 rounded-xl border-2 text-left transition-all text-sm font-bold
                      focus-visible:ring-2 focus-visible:ring-primary/50
                      ${isSelected
                        ? 'border-primary bg-primary/15 text-white shadow-[0_0_15px_rgba(139,92,246,0.2)]'
                        : 'border-zinc-600 bg-surface text-zinc-300 hover:border-zinc-400 hover:text-white'
                      }
                    `}
                  >
                    <span className="text-lg mr-2" aria-hidden="true">{cat.emoji}</span>
                    {cat.label}
                    {isSelected && <span className="ml-1 text-primary" aria-hidden="true">✓</span>}
                    <p className="text-[10px] font-normal text-zinc-500 mt-1 leading-tight">
                      {description}
                    </p>
                  </motion.button>
                );
              })}
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setStep('players')}
                aria-label="Zurück zur Spieler:innen-Eingabe"
                className="flex-1 min-h-[48px] py-3 rounded-full border-2 border-zinc-600 text-zinc-300 font-bold text-sm hover:border-zinc-400 hover:text-white focus-visible:border-primary transition-colors"
              >
                ← ZURÜCK
              </button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                disabled={!canStart}
                onClick={() => setStep('difficulty')}
                aria-label="Weiter zur Schwierigkeitswahl"
                className="flex-[2] bg-primary hover:bg-violet-500 active:bg-violet-700 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed text-white min-h-[52px] py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_40px_rgba(139,92,246,0.3)] focus-visible:ring-4 focus-visible:ring-primary/50"
              >
                WEITER
                <ChevronRight className="w-5 h-5" aria-hidden="true" />
              </motion.button>
            </div>

            {!canStart && (
              <p className="text-zinc-500 text-xs text-center" role="status" aria-live="polite">
                Mindestens 1 Dekade wählen
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
            role="radiogroup"
            aria-labelledby="step-difficulty-heading"
          >
            <div className="text-center text-zinc-300 text-sm mb-2" id="step-difficulty-heading">
              <span role="img" aria-label="Muskel">💪</span> Wie schwer soll es sein?
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
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={`${level.label}: ${level.description}`}
                    className={`
                      min-h-[56px] p-4 rounded-xl border-2 text-left transition-all flex items-start gap-3
                      focus-visible:ring-2 focus-visible:ring-primary/50
                      ${isSelected
                        ? 'border-primary bg-primary/15 shadow-[0_0_20px_rgba(139,92,246,0.15)]'
                        : 'border-zinc-600 bg-surface hover:border-zinc-400'
                      }
                    `}
                  >
                    <span className="text-2xl mt-0.5" aria-hidden="true">{level.emoji}</span>
                    <div className="flex-1">
                      <div className={`font-bold text-sm ${
                        isSelected ? 'text-white' : 'text-zinc-300'
                      }`}>
                        {level.label}
                      </div>
                      <div className={`text-xs mt-0.5 ${
                        isSelected ? 'text-zinc-300' : 'text-zinc-500'
                      }`}>
                        {level.description}
                      </div>
                    </div>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1"
                        aria-hidden="true"
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
                aria-label="Zurück zur Musikauswahl"
                className="flex-1 min-h-[48px] py-3 rounded-full border-2 border-zinc-600 text-zinc-300 font-bold text-sm hover:border-zinc-400 hover:text-white focus-visible:border-primary transition-colors"
              >
                ← ZURÜCK
              </button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleStartGame}
                aria-label="Spiel starten"
                className="flex-[2] bg-primary hover:bg-violet-500 active:bg-violet-700 text-white min-h-[52px] py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_40px_rgba(139,92,246,0.3)] focus-visible:ring-4 focus-visible:ring-primary/50"
              >
                <Sparkles className="w-5 h-5" aria-hidden="true" />
                LOS GEHT'S
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
