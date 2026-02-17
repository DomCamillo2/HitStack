import { useEffect, useRef, useState, useCallback } from 'react';
import { useGameStore } from './store/gameStore';
import { fetchTracksByCategories, LISTEN_SECONDS, JOKER_BONUS_SECONDS } from './services/api';
import type { Difficulty } from './services/api';
import { PlayerSetup } from './components/PlayerSetup';
import { PassPhone } from './components/PassPhone';
import { PlayButton } from './components/PlayButton';
import { GuessForm } from './components/GuessForm';
import { TimelinePlacement } from './components/TimelinePlacement';
import { RevealCard } from './components/RevealCard';
import { Loader2, Heart, Crown, Pause, Play, Sparkles, X } from 'lucide-react';
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
    difficulty,
    setPlayers,
    setTracksLoaded,
    setDifficulty,
    startGame,
    confirmPassPhone,
    pressPlay,
    goToGuessing,
    submitGuess,
    skipGuess,
    skipToPlacing,
    placeInTimeline,
    nextRound,
    useJoker,
    reset,
  } = useGameStore();

  // Die Timeline des aktiven Spielers
  const myTimeline = timelines[currentPlayerIndex] ?? [];

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timeExpired, setTimeExpired] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [showHowToPlay, setShowHowToPlay] = useState(false);

  const activePlayer = players[currentPlayerIndex];

  // ── Zentraler Audio-Stopp (verhindert Overlap) ──
  const stopAudio = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current.load(); // Browser-Puffer freigeben
      } catch (_) { /* ignore */ }
      audioRef.current = null;
    }
    setTimerActive(false);
    setIsPaused(false);
  }, []);

  // ── Zurück zum Startbildschirm ──
  const handleGoHome = useCallback(() => {
    stopAudio();
    setTimeExpired(false);
    reset();
  }, [stopAudio, reset]);

  // ── Audio direkt im Click-Handler starten (User Gesture!) ──
  const startAudio = () => {
    // Altes Audio sofort stoppen (verhindert Overlap)
    stopAudio();

    if (!currentTrack?.previewUrl) {
      console.log('🔇 No preview URL for:', currentTrack?.title);
      return;
    }

    console.log('🔊 Starting audio (user gesture):', currentTrack.title);

    const audio = new Audio(currentTrack.previewUrl);
    audio.volume = 0.6;
    audio.loop = false; // Kein Loop – Timer bestimmt die Dauer
    audioRef.current = audio;
    setIsPaused(false);
    setTimeExpired(false);

    // Timer starten
    const seconds = LISTEN_SECONDS[difficulty] ?? 30;
    setTimeLeft(seconds);
    setTimerActive(true);

    audio.play()
      .then(() => console.log('🔊 Playing:', currentTrack.title))
      .catch((err) => console.error('🔊 Play error:', err.message));
  };

  // ── Countdown-Timer ──
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (!timerActive || isPaused) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Timer abgelaufen → Audio sofort stoppen & aufräumen
          stopAudio();
          setTimeExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive, isPaused, stopAudio]);

  // ── Joker einsetzen → +15 Sekunden ──
  const handleUseJoker = useCallback(() => {
    const success = useJoker();
    if (success) {
      setTimeLeft((prev) => prev + JOKER_BONUS_SECONDS);
      // Timer wieder starten wenn abgelaufen
      if (timeExpired && audioRef.current) {
        setTimeExpired(false);
        setTimerActive(true);
        audioRef.current.play().catch(() => {});
        setIsPaused(false);
      }
    }
  }, [useJoker, timeExpired]);

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

  // ── Stoppe Audio sofort bei Phasen wo kein Sound laufen soll ──
  useEffect(() => {
    const silentPhases = ['reveal', 'placing', 'gameover', 'pass-phone', 'setup', 'play-button'];
    if (silentPhases.includes(phase)) {
      stopAudio();
      setTimeExpired(false);
    }
  }, [phase, stopAudio]);

  // ── Audio aufräumen beim Unmount ──
  useEffect(() => {
    return () => { stopAudio(); };
  }, [stopAudio]);

  // ── Handlers ──────────────────────────────────────────

  const handlePlayerSetup = async (names: string[], categories: string[], difficulty: string) => {
    const diff = difficulty as Difficulty;
    setPlayers(names);
    setDifficulty(diff);
    setIsLoading(true);
    setLoadError(null);

    try {
      const tracks = await fetchTracksByCategories(categories, diff);
      console.log(`📀 Loaded tracks (${difficulty}):`, tracks.length);
      if (tracks.length === 0) {
        setLoadError('Keine Songs gefunden. Bitte andere Kategorien wählen.');
        setIsLoading(false);
        return;
      }
      setTracksLoaded(tracks);
      setIsLoading(false);
      startGame();
    } catch (err) {
      console.error('Track loading failed:', err);
      setLoadError('Songs konnten nicht geladen werden. Prüfe deine Internetverbindung.');
      setIsLoading(false);
    }
  };

  // ─── RENDER ───────────────────────────────────────────

  // Setup Phase
  if (phase === 'setup') {
    if (isLoading) {
      return (
        <div className="h-[100dvh] bg-background flex flex-col items-center justify-center gap-4 relative overflow-hidden" role="status" aria-live="polite" aria-label="Songs werden geladen">
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/4 rounded-full blur-3xl" />
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="relative w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center"
          >
            <Loader2 className="animate-spin w-6 h-6 text-primary" />
          </motion.div>
          <div className="relative text-center">
            <h1 className="text-xl font-black text-white italic mb-1">
              HIT<span className="text-primary">STACK</span>
            </h1>
            <p className="text-zinc-500 text-xs">Songs werden geladen…</p>
          </div>
        </div>
      );
    }
    if (loadError) {
      return (
        <div className="h-[100dvh] bg-background flex flex-col items-center justify-center p-6 text-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-error/10 border border-error/20 flex items-center justify-center">
            <X className="w-6 h-6 text-error" />
          </div>
          <div>
            <p className="text-white text-sm font-bold mb-1">Etwas ist schiefgelaufen</p>
            <p className="text-zinc-500 text-xs max-w-[260px]">{loadError}</p>
          </div>
          <button
            onClick={() => { setLoadError(null); }}
            aria-label="Erneut versuchen, Songs zu laden"
            className="bg-primary hover:bg-violet-500 active:bg-violet-700 text-white px-8 min-h-[44px] py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 focus-visible:ring-4 focus-visible:ring-primary/50 shadow-lg shadow-primary/20"
          >
            NOCHMAL VERSUCHEN
          </button>
        </div>
      );
    }
    return (
      <>
        <PlayerSetup onStart={handlePlayerSetup} onShowHowToPlay={() => setShowHowToPlay(true)} />
        <HowToPlayModal open={showHowToPlay} onClose={() => setShowHowToPlay(false)} />
      </>
    );
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

  // Play Button with player context
  if (phase === 'play-button') {
    return <PlayButton
      onPlay={() => {
        stopAudio(); // sicherstellen kein Audio läuft
        startAudio();
        pressPlay();
      }}
      playerName={activePlayer?.name}
      roundNumber={roundNumber}
    />;
  }

  // Game Over
  if (phase === 'gameover') {
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    const winner = sortedPlayers[0];

    return (
      <div className="h-[100dvh] bg-background flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        {/* Ambient celebration glow */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-400/5 rounded-full blur-3xl" />
        </div>

        {/* Winner celebration */}
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 12 }}
          className="relative flex flex-col items-center gap-3 mb-6"
        >
          <div className="w-16 h-16 rounded-full bg-amber-400/10 border-2 border-amber-400/30 flex items-center justify-center shadow-lg shadow-amber-400/10">
            <Crown className="w-7 h-7 text-amber-400" />
          </div>
          <div>
            <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em] font-mono">Gewinner</p>
            <h2 className="text-2xl font-black text-white mt-0.5">{winner.name}</h2>
            <p className="text-amber-400 font-mono font-bold text-lg">{winner.score} Punkte</p>
          </div>
        </motion.div>

        {/* Leaderboard */}
        <div className="w-full max-w-sm space-y-1.5 relative mb-5">
          {sortedPlayers.map((player, i) => (
            <motion.div
              key={player.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className={clsx(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl border",
                i === 0 ? "bg-amber-500/5 border-amber-400/20" : "bg-surface border-white/5"
              )}
            >
              <div className={clsx(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0",
                i === 0 ? "bg-amber-400 text-black" :
                i === 1 ? "bg-zinc-400 text-black" :
                i === 2 ? "bg-amber-700 text-white" :
                "bg-zinc-700 text-zinc-400"
              )}>
                {i + 1}
              </div>
              <span className="text-white font-bold text-sm flex-1 text-left">{player.name}</span>
              <span className={clsx(
                "font-mono font-bold text-base tabular-nums",
                i === 0 ? "text-amber-400" : "text-primary"
              )}>
                {player.score}
              </span>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-zinc-600 text-xs relative mb-5"
        >
          {roundNumber} Songs gespielt
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGoHome}
          aria-label="Neues Spiel starten"
          className="relative bg-primary hover:bg-violet-500 active:bg-violet-700 text-white px-10 min-h-[48px] py-3 rounded-xl font-bold text-sm transition-all focus-visible:ring-4 focus-visible:ring-primary/50 shadow-lg shadow-primary/20"
        >
          NOCHMAL SPIELEN
        </motion.button>
      </div>
    );
  }

  // ─── MAIN GAME SCREEN ─────────────────────────────────
  return (
    <div className="h-[100dvh] flex flex-col bg-background overflow-hidden relative" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>

      {/* ── Ambient Background ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <div
          className="absolute -top-32 -right-16 w-[400px] h-[400px] rounded-full opacity-[0.035] animate-float-slow"
          style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-20 -left-16 w-[350px] h-[350px] rounded-full opacity-[0.025] animate-float-slower"
          style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-[0.015]"
          style={{ background: 'radial-gradient(circle, #6d28d9 0%, transparent 55%)' }}
        />
      </div>

      {/* ── HUD ── */}
      <div className="shrink-0 z-20">
        {/* Glass HUD Card */}
        <div className="mx-2.5 mt-2 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] shadow-lg shadow-black/10 overflow-hidden">
          {/* Top Row: Logo + Round + Pause */}
          <div className="px-3.5 pt-2.5 pb-1.5 flex items-center justify-between">
            {/* Left: HITSTACK Logo */}
            <button
              onClick={handleGoHome}
              aria-label="Zurück zum Startbildschirm"
              className="flex items-center group focus-visible:ring-2 focus-visible:ring-primary/50 rounded-lg px-1 py-0.5 transition-colors hover:bg-white/5 active:bg-white/10"
            >
              <span className="text-sm font-black text-white italic tracking-tight group-hover:text-primary/90 transition-colors">
                HIT<span className="text-primary">STACK</span>
              </span>
            </button>

            {/* Center: Round info */}
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 text-xs font-mono tracking-wide">Song {roundNumber}</span>
              {isOpenRound && (
                <span className="px-1.5 py-0.5 rounded-md bg-amber-400/10 text-amber-400 text-[10px] font-bold uppercase border border-amber-400/20">OFFEN</span>
              )}
            </div>

            {/* Right: Pause/Play or spacer */}
            <div className="min-w-[44px] flex justify-end">
              {(phase === 'listening' || phase === 'guessing') && (
                <motion.button
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={togglePause}
                  aria-label={isPaused ? 'Musik abspielen' : 'Musik pausieren'}
                  className="flex items-center gap-1.5 px-2.5 min-h-[36px] py-1 rounded-full text-xs font-bold transition-colors focus-visible:ring-2 bg-white/[0.06] border border-white/[0.08] text-zinc-400 hover:text-zinc-200 hover:bg-white/10 focus-visible:ring-primary/50"
                >
                  {isPaused ? (
                    <><Play className="w-3.5 h-3.5" aria-hidden="true" /> Play</>
                  ) : (
                    <><Pause className="w-3.5 h-3.5" aria-hidden="true" /> Pause</>
                  )}
                </motion.button>
              )}
            </div>
          </div>

          {/* Active Player Row */}
          {activePlayer && (
            <div className="px-3.5 pb-2.5 flex items-center justify-between border-t border-white/[0.04] pt-2">
              {/* Left: Avatar + Name + Streak */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center ring-2 ring-primary/20">
                  {activePlayer.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-bold text-sm leading-tight">{activePlayer.name}</span>
                  {activePlayer.streak > 1 && (
                    <span className="text-[10px] font-bold text-primary/70">{activePlayer.streak}× Streak</span>
                  )}
                </div>
              </div>

              {/* Right: Stats */}
              <div className="flex items-center gap-3">
                {activePlayer.jokers > 0 && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/15" title={`${activePlayer.jokers} Joker`}>
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span className="text-xs font-bold text-amber-400">{activePlayer.jokers}</span>
                  </div>
                )}
                <span className="text-white font-mono font-black text-lg tabular-nums tracking-tight">{activePlayer.score}</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Heart
                      key={i}
                      className={clsx(
                        'w-3.5 h-3.5 transition-colors',
                        i < activePlayer.lives ? 'text-error fill-error' : 'text-zinc-700/40'
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* All Players Strip */}
        {players.length > 1 && (
          <div className="px-3 pt-2 pb-1 flex gap-1.5 overflow-x-auto scrollbar-hide">
            {players.map((p, i) => (
              <div
                key={p.name}
                className={clsx(
                  "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs shrink-0 transition-all",
                  i === currentPlayerIndex
                    ? "bg-primary/15 text-primary font-bold ring-1 ring-primary/25"
                    : p.lives <= 0
                    ? "bg-zinc-800/30 text-zinc-600 line-through"
                    : "bg-white/[0.04] text-zinc-500"
                )}
              >
                <span className="truncate max-w-[56px]">{p.name}</span>
                <span className="font-mono font-bold">{p.score}</span>
                {p.lives <= 0 && <span className="text-[10px] text-zinc-600 ml-0.5">OUT</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center px-3 py-2 pb-4 relative z-10">
        <AnimatePresence mode="wait">

          {/* ── LISTENING PHASE ── */}
          {phase === 'listening' && currentTrack && (() => {
            const totalSeconds = LISTEN_SECONDS[difficulty] ?? 30;
            const progress = timeExpired ? 0 : timeLeft / totalSeconds;
            const radius = 58;
            const circumference = 2 * Math.PI * radius;
            const strokeDashoffset = circumference * (1 - progress);

            return (
            <motion.div
              key="listening"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center gap-4 w-full max-w-xs mx-auto"
            >
              {/* ── CIRCULAR PROGRESS PLAYER ── */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={togglePause}
                aria-label={isPaused ? 'Musik abspielen' : 'Musik pausieren'}
                className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full focus-visible:ring-4 focus-visible:ring-primary/50 focus:outline-none group"
              >
                {/* Album Art Background */}
                <div className="absolute inset-[6px] rounded-full overflow-hidden bg-surface">
                  {currentTrack.coverUrl ? (
                    <img
                      src={currentTrack.coverUrl}
                      alt=""
                      className={clsx(
                        "w-full h-full object-cover transition-all duration-300",
                        isPaused ? "brightness-50 scale-100 blur-2xl" : "brightness-75 scale-110 blur-2xl"
                      )}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/30 to-violet-900/50" />
                  )}
                </div>

                {/* SVG Progress Ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 128 128">
                  {/* Background ring */}
                  <circle
                    cx="64" cy="64" r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-white/10"
                  />
                  {/* Progress ring */}
                  <circle
                    cx="64" cy="64" r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className={clsx(
                      "transition-all duration-1000 ease-linear",
                      timeExpired ? "text-error" : timeLeft <= 5 ? "text-error" : timeLeft <= 10 ? "text-amber-400" : "text-primary"
                    )}
                  />
                </svg>

                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {isPaused ? (
                    <Play className="w-10 h-10 sm:w-12 sm:h-12 text-white drop-shadow-lg" fill="white" strokeWidth={0} />
                  ) : (
                    <>
                      {/* Audio visualizer bars */}
                      <div className="flex gap-[3px] items-end h-8 mb-1">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <motion.div
                            key={i}
                            className={clsx(
                              "w-[3px] rounded-full",
                              timeExpired ? "bg-error/60" : "bg-white/80"
                            )}
                            animate={timeExpired ? { height: 4 } : { height: [6, 20, 10, 24, 6] }}
                            transition={timeExpired ? {} : { duration: 0.7, repeat: Infinity, delay: i * 0.12, ease: 'easeInOut' }}
                          />
                        ))}
                      </div>
                    </>
                  )}

                  {/* Timer */}
                  <span className={clsx(
                    "font-mono text-xl sm:text-2xl font-black tabular-nums drop-shadow-lg",
                    timeExpired ? "text-error" : timeLeft <= 5 ? "text-error" : timeLeft <= 10 ? "text-amber-400" : "text-white"
                  )}>
                    {timeExpired ? '0:00' : `0:${timeLeft.toString().padStart(2, '0')}`}
                  </span>

                  {/* Subtle label */}
                  <span className="text-white/50 text-[9px] font-medium mt-0.5 uppercase tracking-widest">
                    {timeExpired ? 'Abgelaufen' : isPaused ? 'Pausiert' : 'Läuft'}
                  </span>
                </div>
              </motion.button>

              {/* Status text */}
              <p className="text-zinc-400 text-xs text-center" aria-live="polite">
                {timeExpired
                  ? 'Die Zeit ist um – entscheide dich!'
                  : isPaused
                  ? 'Tippe auf den Player zum Fortsetzen'
                  : 'Hör genau hin…'}
              </p>

              {/* Joker (compact, inline) */}
              {activePlayer && activePlayer.jokers > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileTap={{ scale: 0.93 }}
                  onClick={handleUseJoker}
                  aria-label={`Joker einsetzen: ${JOKER_BONUS_SECONDS} Sekunden extra`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-400/30 text-xs font-bold transition-colors hover:bg-amber-500/20 focus-visible:ring-2 focus-visible:ring-amber-400/50"
                >
                  <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                  Joker (+{JOKER_BONUS_SECONDS}s) · {activePlayer.jokers}×
                </motion.button>
              )}

              {/* ── ACTION BUTTONS ── */}
              <div className="flex flex-col gap-2 w-full mt-1">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => goToGuessing()}
                  aria-label="Song erraten und Bonuspunkte sammeln"
                  className="bg-primary hover:bg-violet-500 active:bg-violet-700 text-white min-h-[44px] py-2.5 rounded-xl font-bold text-sm flex items-center justify-center transition-all shadow-lg shadow-primary/20 focus-visible:ring-4 focus-visible:ring-primary/50"
                >
                  ICH WEISS ES! (Bonus)
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { stopAudio(); skipToPlacing(); }}
                  aria-label={myTimeline.length === 0 ? "Song überspringen" : "Song nur in der Timeline einordnen"}
                  className="bg-surface hover:bg-zinc-700 active:bg-zinc-600 text-white min-h-[44px] py-2.5 rounded-xl font-bold text-sm flex items-center justify-center transition-all border border-zinc-700 hover:border-zinc-500 focus-visible:ring-4 focus-visible:ring-primary/50"
                >
                  {myTimeline.length === 0 ? 'ÜBERSPRINGEN' : 'NUR EINORDNEN'}
                </motion.button>

                {players.filter(p => p.lives > 0).length > 1 && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { stopAudio(); skipGuess(); }}
                    aria-label="Keine Ahnung – anderes Team darf raten"
                    className="min-h-[40px] py-2 rounded-xl text-zinc-500 text-xs font-bold flex items-center justify-center hover:text-zinc-300 transition-colors focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    PASSEN
                  </motion.button>
                )}
              </div>
            </motion.div>
            );
          })()}

          {/* ── GUESSING PHASE ── */}
          {phase === 'guessing' && (() => {
            const totalSeconds = LISTEN_SECONDS[difficulty] ?? 30;
            const progress = timeExpired ? 0 : timeLeft / totalSeconds;

            return (
            <motion.div
              key="guessing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              {/* Compact timer bar */}
              <div className="flex items-center justify-center gap-3 mb-3 px-4">
                <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className={clsx(
                      "h-full rounded-full transition-colors duration-300",
                      timeExpired ? "bg-error" : timeLeft <= 5 ? "bg-error" : timeLeft <= 10 ? "bg-amber-400" : "bg-primary"
                    )}
                    style={{ width: `${progress * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <span className={clsx(
                  "font-mono text-xs font-bold tabular-nums",
                  timeExpired ? "text-error" : timeLeft <= 5 ? "text-error" : timeLeft <= 10 ? "text-amber-400" : "text-zinc-400"
                )}>
                  {timeExpired ? '0:00' : `0:${timeLeft.toString().padStart(2, '0')}`}
                </span>
                {activePlayer && activePlayer.jokers > 0 && (
                  <motion.button
                    whileTap={{ scale: 0.93 }}
                    onClick={handleUseJoker}
                    aria-label={`Joker einsetzen: ${JOKER_BONUS_SECONDS}s extra`}
                    className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-400/30 text-[10px] font-bold hover:bg-amber-500/20 focus-visible:ring-2 focus-visible:ring-amber-400/50"
                  >
                    <Sparkles className="w-3 h-3" aria-hidden="true" />
                    +{JOKER_BONUS_SECONDS}s
                  </motion.button>
                )}
              </div>

              <GuessForm
                onSubmit={(title, artist) => { stopAudio(); submitGuess(title, artist); }}
                onSkip={players.filter(p => p.lives > 0).length > 1 ? () => { stopAudio(); skipGuess(); } : undefined}
              />

              {/* Pause/Play toggle */}
              {!timeExpired && (
              <div className="flex justify-center mt-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={togglePause}
                  aria-label={isPaused ? 'Musik abspielen' : 'Musik stoppen'}
                  className={clsx(
                    "flex items-center gap-1.5 px-3.5 min-h-[36px] py-1.5 rounded-full text-xs font-bold transition-colors focus-visible:ring-2",
                    isPaused
                      ? "bg-white/5 text-zinc-300 border border-white/10 hover:bg-white/10"
                      : "bg-white/5 text-zinc-400 border border-white/10 hover:bg-white/10"
                  )}
                >
                  {isPaused ? (
                    <><Play className="w-3.5 h-3.5" aria-hidden="true" /> Weiter</>
                  ) : (
                    <><Pause className="w-3.5 h-3.5" aria-hidden="true" /> Pause</>
                  )}
                </motion.button>
              </div>
              )}
            </motion.div>
            );
          })()}

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
        <div className="shrink-0 border-t border-white/[0.06] bg-white/[0.02] backdrop-blur-sm px-2 py-1.5 relative z-10">
          <div className="text-zinc-500 text-[10px] font-mono uppercase tracking-wider mb-1 text-center">
            {activePlayer?.name ?? 'Timeline'} · {myTimeline.length}
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 justify-center scrollbar-hide">
            {myTimeline.map((t) => (
              <div key={t.id} className="flex flex-col items-center shrink-0">
                <img src={t.coverUrl} alt={t.title} className="w-8 h-8 rounded-md object-cover border border-white/[0.06] shadow-sm" loading="lazy" />
                <span className="text-primary/80 text-[9px] font-mono mt-0.5">{t.year}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

// ── How to Play Modal ──
function HowToPlayModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-surface border border-white/10 rounded-2xl p-5 w-full max-w-md max-h-[80dvh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-white italic">
              HIT<span className="text-primary">STACK</span>
            </h2>
            <button
              onClick={onClose}
              aria-label="Schließen"
              className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
            >
              <span className="text-xs">✕</span>
            </button>
          </div>

          <div className="space-y-3 text-sm text-zinc-400 leading-relaxed">
            <section className="bg-white/5 rounded-lg p-3">
              <h3 className="text-white font-bold text-xs mb-1 flex items-center gap-2">
                <span className="text-primary text-xs font-mono">01</span> Song anhören
              </h3>
              <p className="text-xs">
                Ein Song wird abgespielt. Je nach Level hast du <span className="text-white">20–30 Sekunden</span> zum Zuhören.
              </p>
            </section>

            <section className="bg-white/5 rounded-lg p-3">
              <h3 className="text-white font-bold text-xs mb-1 flex items-center gap-2">
                <span className="text-primary text-xs font-mono">02</span> Raten (Bonus)
              </h3>
              <p className="text-xs">
                Erkennst du den Song? Rate <span className="text-white">Titel</span> und/oder <span className="text-white">Interpret</span> für 
                je <span className="text-primary">+50 Bonuspunkte</span>.
              </p>
            </section>

            <section className="bg-white/5 rounded-lg p-3">
              <h3 className="text-white font-bold text-xs mb-1 flex items-center gap-2">
                <span className="text-primary text-xs font-mono">03</span> Timeline einordnen
              </h3>
              <p className="text-xs">
                Ordne den Song chronologisch ein. 
                Richtig = <span className="text-primary">+75 Punkte</span>. 
                Falsch = <span className="text-error">-1 Leben</span>.
              </p>
            </section>

            <section className="bg-white/5 rounded-lg p-3">
              <h3 className="text-white font-bold text-xs mb-1 flex items-center gap-2">
                <span className="text-amber-400 text-xs font-mono">04</span> Joker
              </h3>
              <p className="text-xs">
                Titel UND Interpret richtig = <span className="text-amber-400">Joker</span>. 
                Damit bekommst du <span className="text-white">+15 Sekunden</span> Extra-Hörzeit.
              </p>
            </section>

            <section className="bg-white/5 rounded-lg p-3">
              <h3 className="text-white font-bold text-xs mb-1 flex items-center gap-2">
                <span className="text-zinc-500 text-xs font-mono">05</span> Spielende
              </h3>
              <p className="text-xs">
                Keine Leben mehr oder keine Songs? Wer die meisten Punkte hat, gewinnt.
              </p>
            </section>
          </div>

          <button
            onClick={onClose}
            className="mt-4 w-full bg-primary hover:bg-violet-500 active:bg-violet-700 text-white min-h-[44px] py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 focus-visible:ring-4 focus-visible:ring-primary/50"
          >
            VERSTANDEN
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
