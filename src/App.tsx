import { useEffect, useRef, useState } from 'react';
import { useGameStore } from './store/gameStore';
import { fetchTracksByCategories } from './services/api';
import type { Difficulty } from './services/api';
import { PlayerSetup } from './components/PlayerSetup';
import { PassPhone } from './components/PassPhone';
import { PlayButton } from './components/PlayButton';
import { GuessForm } from './components/GuessForm';
import { TimelinePlacement } from './components/TimelinePlacement';
import { RevealCard } from './components/RevealCard';
import { Loader2, Heart, Volume2, Music, Crown, Pause, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

function App() {
  const {
    phase,
    timelines,
    currentTrack,
    roundNumber,
    lastResult,
    players,
    currentPlayerIndex,
    isOpenRound,
    setPlayers,
    setTracksLoaded,
    startGame,
    confirmPassPhone,
    pressPlay,
    goToGuessing,
    submitGuess,
    skipGuess,
    skipToPlacing,
    placeInTimeline,
    nextRound,
  } = useGameStore();

  // Die Timeline des aktiven Spielers
  const myTimeline = timelines[currentPlayerIndex] ?? [];

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const activePlayer = players[currentPlayerIndex];

  // ── Audio direkt im Click-Handler starten (User Gesture!) ──
  const startAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }

    if (!currentTrack?.previewUrl) {
      console.log('🔇 No preview URL for:', currentTrack?.title);
      return;
    }

    console.log('🔊 Starting audio (user gesture):', currentTrack.title);

    const audio = new Audio(currentTrack.previewUrl);
    audio.volume = 0.6;
    audio.loop = true;
    audioRef.current = audio;
    setIsPaused(false);

    audio.play()
      .then(() => console.log('🔊 Playing:', currentTrack.title))
      .catch((err) => console.error('🔊 Play error:', err.message));
  };

  // ── Pause / Resume ──
  const togglePause = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play().catch(() => {});
      setIsPaused(false);
    } else {
      audioRef.current.pause();
      setIsPaused(true);
    }
  };

  // ── Stoppe Audio bei Phasen wo kein Sound laufen soll ──
  useEffect(() => {
    const silentPhases = ['reveal', 'placing', 'gameover', 'pass-phone', 'setup', 'play-button'];
    if (silentPhases.includes(phase)) {
      if (audioRef.current) {
        const audio = audioRef.current;
        const fadeOut = setInterval(() => {
          if (audio.volume > 0.05) {
            audio.volume = Math.max(0, audio.volume - 0.1);
          } else {
            clearInterval(fadeOut);
            audio.pause();
            audio.src = '';
          }
        }, 50);
        audioRef.current = null;
        setIsPaused(false);
      }
    }
  }, [phase]);

  // ── Handlers ──────────────────────────────────────────

  const handlePlayerSetup = async (names: string[], categories: string[], difficulty: string) => {
    setPlayers(names);
    setIsLoading(true);

    const tracks = await fetchTracksByCategories(categories, difficulty as Difficulty);
    console.log(`📀 Loaded tracks (${difficulty}):`, tracks.length);
    setTracksLoaded(tracks);
    setIsLoading(false);
    startGame();
  };

  // ─── RENDER ───────────────────────────────────────────

  // Setup Phase
  if (phase === 'setup') {
    if (isLoading) {
      return (
        <div className="h-[100dvh] bg-background flex flex-col items-center justify-center text-primary gap-3">
          <Loader2 className="animate-spin w-8 h-8" />
          <p className="text-zinc-500 text-sm">Songs werden geladen...</p>
        </div>
      );
    }
    return <PlayerSetup onStart={handlePlayerSetup} />;
  }

  // Pass Phone Screen
  if (phase === 'pass-phone' && activePlayer) {
    return (
      <PassPhone
        playerName={activePlayer.name}
        roundNumber={roundNumber}
        isOpenRound={isOpenRound}
        onContinue={confirmPassPhone}
      />
    );
  }

  // Samsung-style Play Button
  if (phase === 'play-button') {
    return <PlayButton onPlay={() => {
      startAudio();
      pressPlay();
    }} />;
  }

  // Game Over
  if (phase === 'gameover') {
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

    return (
      <div className="h-[100dvh] bg-background flex flex-col items-center justify-center p-6 text-center space-y-6">
        <h1 className="text-4xl font-black text-white italic">GAME OVER</h1>

        <div className="w-full max-w-sm space-y-2">
          {sortedPlayers.map((player, i) => (
            <motion.div
              key={player.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              className={clsx(
                "flex items-center gap-3 p-3 rounded-xl border",
                i === 0 ? "bg-amber-500/10 border-amber-400/50" : "bg-white/5 border-white/5"
              )}
            >
              <div className={clsx(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-black",
                i === 0 ? "bg-amber-400 text-black" :
                i === 1 ? "bg-zinc-400 text-black" :
                i === 2 ? "bg-amber-700 text-white" :
                "bg-zinc-700 text-zinc-400"
              )}>
                {i === 0 ? <Crown className="w-4 h-4" /> : i + 1}
              </div>
              <span className="text-white font-bold flex-1 text-left">{player.name}</span>
              <div className="text-right">
                <span className={clsx(
                  "font-mono font-bold text-lg",
                  i === 0 ? "text-amber-400" : "text-primary"
                )}>
                  {player.score}
                </span>
                <span className="text-zinc-600 text-xs ml-1">Pkt</span>
              </div>
            </motion.div>
          ))}
        </div>

        <p className="text-zinc-500 text-sm">{roundNumber} Runden gespielt</p>

        <button
          onClick={() => window.location.reload()}
          className="bg-primary hover:bg-violet-600 text-white px-8 py-4 rounded-full font-bold text-lg transition-transform active:scale-95"
        >
          NOCHMAL SPIELEN
        </button>
      </div>
    );
  }

  // ─── MAIN GAME SCREEN ─────────────────────────────────
  return (
    <div className="h-[100dvh] flex flex-col bg-background overflow-hidden">

      {/* ── COMPACT HUD ── */}
      <div className="shrink-0 z-20">
        {/* Top Bar: Logo + Active Player */}
        <div className="px-4 pt-3 pb-1 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-black text-white/15 italic">HITSTACK</span>
            <span className="text-zinc-600 text-xs font-mono">Song {roundNumber}</span>
            {isOpenRound && (
              <span className="text-amber-400 text-[10px] font-black uppercase animate-pulse">⚡ OFFEN</span>
            )}
          </div>

          {/* Pause/Play Button – sichtbar wenn Audio läuft */}
          {(phase === 'listening' || phase === 'guessing') && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileTap={{ scale: 0.9 }}
              onClick={togglePause}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs transition-colors",
                isPaused
                  ? "bg-success/20 text-success border border-success/40"
                  : "bg-error/15 text-error border border-error/30"
              )}
            >
              {isPaused ? (
                <><Play className="w-3.5 h-3.5 fill-success" /> PLAY</>
              ) : (
                <><Pause className="w-3.5 h-3.5 fill-error" /> STOP</>
              )}
            </motion.button>
          )}
        </div>

        {/* Active Player Card */}
        {activePlayer && (
          <div className="px-4 pb-2">
            <div className="flex items-center justify-between bg-surface/60 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/20 text-primary text-xs font-black flex items-center justify-center">
                  {activePlayer.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-white font-bold text-sm">{activePlayer.name}</span>
              </div>
              <div className="flex items-center gap-3">
                {activePlayer.streak > 1 && (
                  <span className="text-xs font-bold text-primary animate-pulse">🔥{activePlayer.streak}</span>
                )}
                <span className="text-white font-mono font-bold text-lg tabular-nums">{activePlayer.score}</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Heart
                      key={i}
                      className={clsx(
                        'w-3.5 h-3.5',
                        i < activePlayer.lives ? 'text-error fill-error' : 'text-zinc-700'
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* All Players Mini-Bar */}
        {players.length > 1 && (
          <div className="px-4 pb-2 flex gap-1.5 overflow-x-auto scrollbar-hide">
            {players.map((p, i) => (
              <div
                key={p.name}
                className={clsx(
                  "flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] shrink-0 transition-colors",
                  i === currentPlayerIndex
                    ? "bg-primary/20 text-primary font-bold"
                    : p.lives <= 0
                    ? "bg-zinc-800/30 text-zinc-700 line-through"
                    : "bg-white/5 text-zinc-500"
                )}
              >
                <span className="truncate max-w-[50px]">{p.name}</span>
                <span className="font-mono">{p.score}</span>
                {p.lives <= 0 && <span className="text-[9px]">💀</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-4 pb-8">
        <AnimatePresence mode="wait">

          {/* ── LISTENING PHASE ── */}
          {phase === 'listening' && currentTrack && (
            <motion.div
              key="listening"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center gap-6 w-full"
            >
              {/* Klickbarer Visualizer – Tap zum Pause/Play */}
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={togglePause}
                className="relative w-36 h-36 rounded-2xl bg-surface border-2 border-primary/30 flex items-center justify-center overflow-hidden cursor-pointer group"
              >
                {currentTrack.coverUrl && (
                  <img src={currentTrack.coverUrl} alt="" className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-30" />
                )}
                <div className="relative flex flex-col items-center gap-2">
                  {isPaused ? (
                    <>
                      <Play className="w-12 h-12 text-success fill-success/30" />
                      <span className="text-success text-[10px] font-bold uppercase tracking-wider">Tap to Play</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-10 h-10 text-primary animate-pulse" />
                      <div className="flex gap-1">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <motion.div
                            key={i}
                            className="w-1 bg-primary rounded-full"
                            animate={{ height: [8, 24, 12, 28, 8] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
                          />
                        ))}
                      </div>
                      {/* Tap-Hinweis */}
                      <span className="text-zinc-500 text-[9px] mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Tap = Pause</span>
                    </>
                  )}
                </div>
              </motion.button>

              <p className="text-zinc-400 text-sm text-center">
                {isPaused ? 'Pausiert – tippe auf den Player ▶' : 'Hör genau hin...'}
              </p>

              {/* Großer Stop-Button */}
              {!isPaused && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={togglePause}
                  className="flex items-center gap-2 px-5 py-2 rounded-full bg-error/10 text-error border border-error/20 text-sm font-bold transition-colors hover:bg-error/20"
                >
                  <Pause className="w-4 h-4 fill-error" />
                  MUSIK STOPPEN
                </motion.button>
              )}

              {/* === 3 AUSWAHL-BUTTONS === */}
              <div className="flex flex-col gap-2 w-full max-w-xs mt-2">
                {/* Ich weiß alles → Bonus-Runde (Titel + Artist raten) */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => goToGuessing()}
                  className="bg-primary hover:bg-violet-600 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-transform shadow-lg shadow-primary/20"
                >
                  <span className="text-base">🧠</span>
                  ICH WEISS ES! (Bonus)
                </motion.button>

                {/* Nur einordnen → direkt zur Timeline */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={skipToPlacing}
                  className="bg-surface hover:bg-zinc-800 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors border border-white/10"
                >
                  <span className="text-base">📍</span>
                  NUR JAHR EINORDNEN
                </motion.button>

                {/* Keine Ahnung – nur wenn andere Spieler leben */}
                {players.filter(p => p.lives > 0).length > 1 && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={skipGuess}
                    className="py-2.5 rounded-xl border border-white/5 text-zinc-500 text-xs font-bold flex items-center justify-center gap-2 hover:border-amber-400/30 hover:text-amber-400 transition-colors"
                  >
                    <span>❌</span>
                    KEINE AHNUNG – ANDERES TEAM
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}

          {/* ── GUESSING PHASE ── */}
          {phase === 'guessing' && (
            <motion.div
              key="guessing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              <div className="flex items-center justify-center gap-1 mb-4">
                {!isPaused && [0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-0.5 bg-primary/50 rounded-full"
                    animate={{ height: [4, 12, 6, 14, 4] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
                <span className="text-zinc-500 text-xs ml-2 font-mono">
                  {isPaused ? '⏸ Pausiert' : 'Song spielt...'}
                </span>
              </div>

              <GuessForm
                onSubmit={submitGuess}
                onSkip={players.filter(p => p.lives > 0).length > 1 ? skipGuess : undefined}
              />

              {/* Musik stoppen/starten Button */}
              <div className="flex justify-center mt-4">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={togglePause}
                  className={clsx(
                    "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-colors",
                    isPaused
                      ? "bg-success/10 text-success border border-success/30 hover:bg-success/20"
                      : "bg-error/10 text-error border border-error/20 hover:bg-error/20"
                  )}
                >
                  {isPaused ? (
                    <><Play className="w-4 h-4 fill-success" /> MUSIK ABSPIELEN</>
                  ) : (
                    <><Pause className="w-4 h-4 fill-error" /> MUSIK STOPPEN</>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── PLACING PHASE ── */}
          {phase === 'placing' && currentTrack && (
            <motion.div
              key="placing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              <TimelinePlacement timeline={myTimeline} currentTrack={currentTrack} onPlace={placeInTimeline} />
            </motion.div>
          )}

          {/* ── REVEAL PHASE ── */}
          {phase === 'reveal' && currentTrack && lastResult && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              <RevealCard track={currentTrack} result={lastResult} roundNumber={roundNumber} onNext={nextRound} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* TIMELINE PREVIEW – zeigt die Timeline des aktiven Spielers */}
      {myTimeline.length > 0 && phase !== 'placing' && (
        <div className="shrink-0 border-t border-white/5 bg-background/80 backdrop-blur-md p-3">
          <div className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest mb-2 text-center">
            {activePlayer?.name ?? 'Timeline'} ({myTimeline.length})
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 justify-center">
            {myTimeline.map((t) => (
              <div key={t.id} className="flex flex-col items-center shrink-0">
                <img src={t.coverUrl} alt={t.title} className="w-10 h-10 rounded-lg object-cover border border-white/10" loading="lazy" />
                <span className="text-primary text-[10px] font-mono mt-0.5">{t.year}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
