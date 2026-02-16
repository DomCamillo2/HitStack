import { create } from 'zustand';

export interface Track {
  id: string;
  artist: string;
  title: string;
  year: number;
  coverUrl: string;
  previewUrl: string;
}

// Punkte pro richtig geratenem Feld
export interface GuessResult {
  titleCorrect: boolean;
  artistCorrect: boolean;
  yearCorrect: boolean;
  yearDiff: number;
  placementCorrect?: boolean;
  pointsEarned: number;
}

// Spielphasen – erweitert für Multiplayer
export type GamePhase =
  | 'setup'        // Spieler-Setup (Namen eingeben)
  | 'start'        // Startscreen (tracks geladen, bereit)
  | 'pass-phone'   // "Gib das Handy an X"
  | 'play-button'  // Samsung-style großer Play-Button
  | 'listening'    // Song spielt
  | 'guessing'     // Titel/Artist/Jahr eingeben
  | 'placing'      // Ab Song 2: Timeline einordnen
  | 'reveal'       // Ergebnis zeigen
  | 'gameover';    // Spiel vorbei

// Spieler-Daten
export interface Player {
  name: string;
  score: number;
  streak: number;
  lives: number;
}

interface GameState {
  // Core
  phase: GamePhase;
  timelines: Track[][];  // Pro Spieler eine eigene Timeline
  currentTrack: Track | null;
  pool: Track[];
  roundNumber: number;
  tracksLoaded: boolean;

  // Multiplayer
  players: Player[];
  currentPlayerIndex: number;
  isOpenRound: boolean;
  openRoundGuesses: Map<number, GuessResult>; // playerIndex → result

  // Scoring (aktiver Spieler)
  lastResult: GuessResult | null;
  skippedBy: number[];  // Spieler-Indizes die geskippt haben (für Steal-Logik)

  // Actions – Setup
  setPlayers: (names: string[]) => void;
  startGame: () => void;
  setTracksLoaded: (tracks: Track[]) => void;

  // Actions – Game Flow
  confirmPassPhone: () => void;
  pressPlay: () => void;
  goToGuessing: () => void;
  skipToPlacing: () => void; // "Nur einordnen" → direkt zur Timeline
  submitGuess: (title: string, artist: string) => void; // Nur Titel + Artist (Bonus)
  skipGuess: () => void;  // "Keine Ahnung" → nächster Spieler darf stehlen
  placeInTimeline: (insertIndex: number) => void;
  nextRound: () => void;
  reset: () => void;
}

// ── Fuzzy String Matching (Levenshtein-basiert, sehr tolerant) ──
function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[()\[\]{}]/g, '')       // Klammern entfernen
    .replace(/feat\.?\s*.*/i, '')     // "feat. XY" abschneiden
    .replace(/ft\.?\s*.*/i, '')       // "ft. XY" abschneiden
    .replace(/[^a-z0-9äöüßéèêàáâ]/g, '') // Nur Buchstaben+Zahlen
    .trim();
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[m][n];
}

function fuzzyMatch(guess: string, correct: string): boolean {
  const g = normalize(guess);
  const c = normalize(correct);
  if (!g) return false;
  // Exakt oder enthalten
  if (g === c || c.includes(g) || g.includes(c)) return true;
  // Levenshtein: erlaube ~30% Fehler (sehr tolerant für Tippfehler)
  const maxDist = Math.max(2, Math.floor(Math.max(g.length, c.length) * 0.35));
  if (levenshtein(g, c) <= maxDist) return true;
  // Auch Wort-Reihenfolge egal: alle Wörter des Guess im Correct?
  const guessWords = guess.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const correctLower = correct.toLowerCase();
  if (guessWords.length >= 1 && guessWords.every(w => correctLower.includes(w))) return true;
  return false;
}

// ── Hilfsfunktion: Open Round zufällig auslösen ──
// Ab Runde 3, ~20% Chance
function shouldTriggerOpenRound(roundNumber: number): boolean {
  if (roundNumber < 3) return false;
  return Math.random() < 0.2;
}

export const useGameStore = create<GameState>((set, get) => ({
  phase: 'setup',
  timelines: [],
  currentTrack: null,
  pool: [],
  roundNumber: 0,
  tracksLoaded: false,

  players: [],
  currentPlayerIndex: 0,
  isOpenRound: false,
  openRoundGuesses: new Map(),

  lastResult: null,
  skippedBy: [],

  // ── SETUP ──────────────────────────────────────────────

  setPlayers: (names) => {
    const players: Player[] = names.map(name => ({
      name,
      score: 0,
      streak: 0,
      lives: 3,
    }));
    set({ players });
  },

  setTracksLoaded: (tracks) => {
    const shuffled = [...tracks].sort(() => Math.random() - 0.5);
    set({
      pool: shuffled.slice(1),
      currentTrack: shuffled[0],
      timelines: [],  // wird in startGame basierend auf Spieleranzahl erstellt
      roundNumber: 1,
      tracksLoaded: true,
    });
  },

  startGame: () => {
    const { tracksLoaded, players } = get();
    if (!tracksLoaded) return;
    // Pro Spieler eine leere Timeline erstellen
    set({
      timelines: players.map(() => []),
      currentPlayerIndex: 0,
      isOpenRound: false,
      phase: 'pass-phone',
    });
  },

  // ── GAME FLOW ──────────────────────────────────────────

  confirmPassPhone: () => {
    // Spieler hat Handy → Samsung Play-Button zeigen
    set({ phase: 'play-button' });
  },

  pressPlay: () => {
    // Großer Play-Button gedrückt → Audio starten
    set({ phase: 'listening' });
  },

  goToGuessing: () => {
    set({ phase: 'guessing' });
  },

  skipToPlacing: () => {
    const { currentTrack, timelines, currentPlayerIndex } = get();
    const myTimeline = timelines[currentPlayerIndex] || [];
    // Kein Bonus – direkt zur Timeline (oder bei erstem Song direkt reveal)
    const result: GuessResult = {
      titleCorrect: false,
      artistCorrect: false,
      yearCorrect: false,
      yearDiff: 99,
      pointsEarned: 0,
    };
    set({ lastResult: result });

    if (myTimeline.length === 0) {
      // Erster Song für diesen Spieler → direkt rein
      const newTimelines = [...timelines];
      newTimelines[currentPlayerIndex] = [currentTrack!];
      set({ timelines: newTimelines, phase: 'reveal' });
    } else {
      set({ phase: 'placing' });
    }
  },

  skipGuess: () => {
    const { players, currentPlayerIndex, skippedBy } = get();
    const newSkipped = [...skippedBy, currentPlayerIndex];

    // Spieler verliert 1 Leben und Streak wird zurückgesetzt
    const updatedPlayers = [...players];
    const player = { ...updatedPlayers[currentPlayerIndex] };
    player.lives = Math.max(0, player.lives - 1);
    player.streak = 0;
    updatedPlayers[currentPlayerIndex] = player;

    // Nächsten lebenden Spieler finden der NICHT schon geskippt hat
    let nextIndex = -1;
    for (let i = 1; i < players.length; i++) {
      const idx = (currentPlayerIndex + i) % players.length;
      if (updatedPlayers[idx].lives > 0 && !newSkipped.includes(idx)) {
        nextIndex = idx;
        break;
      }
    }

    if (nextIndex === -1) {
      // Niemand mehr übrig → Song wird aufgelöst ohne Punkte
      const result: GuessResult = {
        titleCorrect: false,
        artistCorrect: false,
        yearCorrect: false,
        yearDiff: 99,
        pointsEarned: 0,
      };

      // Song NICHT in eine Timeline einfügen (keiner hat's geschafft)
      set({
        players: updatedPlayers,
        skippedBy: newSkipped,
        lastResult: result,
        phase: 'reveal',
      });
    } else {
      // Nächster Spieler darf "stehlen" → pass-phone zu dem Spieler
      set({
        players: updatedPlayers,
        skippedBy: newSkipped,
        currentPlayerIndex: nextIndex,
        phase: 'pass-phone',
      });
    }
  },

  submitGuess: (title, artist) => {
    const { currentTrack, players, currentPlayerIndex } = get();
    if (!currentTrack) return;

    const titleCorrect = title.trim() ? fuzzyMatch(title, currentTrack.title) : false;
    const artistCorrect = artist.trim() ? fuzzyMatch(artist, currentTrack.artist) : false;

    // ── BONUS-PUNKTE für Titel & Artist ──
    // Titel richtig  = 50 Bonuspunkte
    // Artist richtig = 50 Bonuspunkte
    // (Das Jahr wird über die Timeline-Einordnung geraten!)
    let points = 0;
    if (titleCorrect) points += 50;
    if (artistCorrect) points += 50;

    const result: GuessResult = {
      titleCorrect,
      artistCorrect,
      yearCorrect: false,  // wird nicht mehr hier bewertet
      yearDiff: 99,
      pointsEarned: points,
    };

    // Bonuspunkte dem aktiven Spieler zuschreiben
    const updatedPlayers = [...players];
    const player = { ...updatedPlayers[currentPlayerIndex] };
    player.score += points;
    if (titleCorrect || artistCorrect) {
      player.streak += 1;
    }
    updatedPlayers[currentPlayerIndex] = player;

    set({ lastResult: result, players: updatedPlayers });

    // Erster Song für diesen Spieler → direkt in seine Timeline
    const { timelines } = get();
    const myTimeline = timelines[currentPlayerIndex] || [];
    if (myTimeline.length === 0) {
      const newTimelines = [...timelines];
      newTimelines[currentPlayerIndex] = [currentTrack];
      set({
        timelines: newTimelines,
        phase: 'reveal',
      });
    } else {
      // Ab Song 2 → Placing Phase (= Jahr raten!)
      set({ phase: 'placing' });
    }
  },

  placeInTimeline: (insertIndex) => {
    const { timelines, currentTrack, lastResult, players, currentPlayerIndex } = get();
    if (!currentTrack || !lastResult) return;

    const myTimeline = [...(timelines[currentPlayerIndex] || [])];

    const prevYear = insertIndex > 0 ? myTimeline[insertIndex - 1].year : -Infinity;
    const nextYear = insertIndex < myTimeline.length ? myTimeline[insertIndex].year : Infinity;
    const placementCorrect = currentTrack.year >= prevYear && currentTrack.year <= nextYear;

    if (placementCorrect) {
      myTimeline.splice(insertIndex, 0, currentTrack);
    } else {
      let correctIndex = myTimeline.findIndex(t => t.year > currentTrack.year);
      if (correctIndex === -1) correctIndex = myTimeline.length;
      myTimeline.splice(correctIndex, 0, currentTrack);
    }

    const bonusPoints = placementCorrect ? 75 : 0;

    // Spieler updaten
    const updatedPlayers = [...players];
    const player = { ...updatedPlayers[currentPlayerIndex] };
    player.score += bonusPoints;
    if (!placementCorrect) {
      player.lives = Math.max(0, player.lives - 1);
      player.streak = 0;
    }
    updatedPlayers[currentPlayerIndex] = player;

    const updatedResult: GuessResult = {
      ...lastResult,
      placementCorrect,
      pointsEarned: lastResult.pointsEarned + bonusPoints,
    };

    const newTimelines = [...timelines];
    newTimelines[currentPlayerIndex] = myTimeline;

    set({
      timelines: newTimelines,
      players: updatedPlayers,
      lastResult: updatedResult,
      phase: 'reveal',
    });
  },

  nextRound: () => {
    const { pool, players, currentPlayerIndex } = get();

    // Nächster Spieler (skip Spieler mit 0 Lives)
    let nextIndex = (currentPlayerIndex + 1) % players.length;
    let attempts = 0;
    while (players[nextIndex].lives <= 0 && attempts < players.length) {
      nextIndex = (nextIndex + 1) % players.length;
      attempts++;
    }

    // Alle Spieler tot? → Game Over
    const anyAlive = players.some(p => p.lives > 0);
    if (!anyAlive || pool.length === 0) {
      set({ phase: 'gameover', currentTrack: null });
      return;
    }

    // Open Round prüfen
    const newRound = get().roundNumber + 1;
    const isOpen = shouldTriggerOpenRound(newRound);

    set({
      currentTrack: pool[0],
      pool: pool.slice(1),
      roundNumber: newRound,
      lastResult: null,
      currentPlayerIndex: nextIndex,
      isOpenRound: isOpen,
      openRoundGuesses: new Map(),
      skippedBy: [],
      phase: 'pass-phone',
    });
  },

  reset: () => set({
    phase: 'setup',
    timelines: [],
    currentTrack: null,
    pool: [],
    roundNumber: 0,
    tracksLoaded: false,
    players: [],
    currentPlayerIndex: 0,
    isOpenRound: false,
    openRoundGuesses: new Map(),
    lastResult: null,
    skippedBy: [],
  }),
}));
