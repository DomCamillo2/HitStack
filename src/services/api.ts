import type { Track } from '../store/gameStore';

// ──────────────────────────────────────────────────────────────
// Deezer API  –  kostenlos, kein API-Key nötig
//
// WICHTIG: Die /search Endpoint liefert KEIN release_date!
// Deshalb: Erst suchen → dann für jeden Track /track/{id} abfragen.
//
// Vite Dev-Server leitet /api/deezer/* an api.deezer.com weiter
// und /api/audio/* an cdnt-preview.dzcdn.net (Preview MP3s)
// ──────────────────────────────────────────────────────────────

const DEEZER_BASE = '/api/deezer';

// ── Schwierigkeitsgrade ──
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface DifficultyLevel {
  id: Difficulty;
  label: string;
  emoji: string;
  description: string;
}

export const DIFFICULTY_LEVELS: DifficultyLevel[] = [
  { id: 'easy',   label: 'Leicht',  emoji: '😎', description: 'Mega-bekannte Hits, die jeder kennt' },
  { id: 'medium', label: 'Mittel',  emoji: '🤔', description: 'Bekannte Songs für Musikfans' },
  { id: 'hard',   label: 'Schwer',  emoji: '🧠', description: 'Deep Cuts & weniger bekannte Tracks' },
];

// ── Musik-Kategorien ──
export interface MusicCategory {
  id: string;
  label: string;
  emoji: string;
  queries: Record<Difficulty, string>;
  // Handverlesene Deezer-Track-IDs für "Leicht" – nur mega-bekannte Originale
  easyTrackIds: number[];
}

export const MUSIC_CATEGORIES: MusicCategory[] = [
  {
    id: '90s', label: '90er', emoji: '💿',
    queries: { easy: '', medium: '90s hits', hard: '90s album tracks' },
    easyTrackIds: [
      3135556,   // Smells Like Teen Spirit – Nirvana
      1109731,   // Wonderwall – Oasis
      3157975,   // Bitter Sweet Symphony – The Verve
      1608912,   // Losing My Religion – R.E.M.
      916424,    // Creep – Radiohead
      904006,    // No Scrubs – TLC
      2485410,   // I Want It That Way – Backstreet Boys
      735282,    // ...Baby One More Time – Britney Spears
      2300282,   // Wannabe – Spice Girls
      540568,    // Ice Ice Baby – Vanilla Ice
      2893902,   // Gangsta's Paradise – Coolio
      1342522,   // Everybody – Backstreet Boys
      133360,    // MMMBop – Hanson
      397226,    // Under The Bridge – Red Hot Chili Peppers
      6822028,   // My Heart Will Go On – Celine Dion
      3128861,   // Nothing Else Matters – Metallica
      4271911,   // Iris – Goo Goo Dolls
      904714,    // Zombie – The Cranberries
      68919990,  // Return of the Mack – Mark Morrison
      557283,    // I Will Always Love You – Whitney Houston
    ],
  },
  {
    id: '2000s', label: '2000er', emoji: '📀',
    queries: { easy: '', medium: '2000s hits', hard: '2000s album tracks' },
    easyTrackIds: [
      2306727,   // Crazy In Love – Beyoncé ft. Jay-Z
      1565538,   // In Da Club – 50 Cent
      1231330,   // Hey Ya! – OutKast
      3612440,   // Mr. Brightside – The Killers
      67238735,  // Umbrella – Rihanna
      1261844,   // Since U Been Gone – Kelly Clarkson
      985710,    // Lose Yourself – Eminem
      661789,    // Toxic – Britney Spears
      3104502,   // Boulevard of Broken Dreams – Green Day
      2531560,   // Complicated – Avril Lavigne
      60043,     // Hips Don't Lie – Shakira
      2375553,   // In The End – Linkin Park
      113412636, // Rehab – Amy Winehouse
      908604572, // Poker Face – Lady Gaga
      1463889,   // Beautiful Day – U2
      3153563,   // Clocks – Coldplay
      3122298,   // Yeah! – Usher
      71430024,  // SOS – Rihanna
      5804226,   // Hung Up – Madonna
      2299400,   // Can't Get You Out of My Head – Kylie Minogue
    ],
  },
  {
    id: '2010s', label: '2010er', emoji: '🎧',
    queries: { easy: '', medium: '2010s hits', hard: '2010s indie' },
    easyTrackIds: [
      644082022, // Blinding Lights – The Weeknd
      424471,    // Rolling in the Deep – Adele
      350171271, // Shape of You – Ed Sheeran
      503426912, // Old Town Road – Lil Nas X
      757718682, // Dance Monkey – Tones and I
      138544007, // Uptown Funk – Bruno Mars
      108936810, // Happy – Pharrell Williams
      908604572, // Poker Face – Lady Gaga
      67238735,  // Umbrella – Rihanna
      444943547, // Despacito – Luis Fonsi
      1024968962,// Shallow – Lady Gaga, Bradley Cooper
      900534892, // Havana – Camila Cabello
      548108962, // Rockstar – Post Malone
      73666528,  // Somebody That I Used to Know – Gotye
      133465216, // Get Lucky – Daft Punk
      390949072, // Closer – The Chainsmokers
      562484692, // God's Plan – Drake
      119264718, // Royals – Lorde
      110210724, // Wrecking Ball – Miley Cyrus
      462913552, // Señorita – Shawn Mendes & Camila Cabello
    ],
  },
  {
    id: 'pop', label: 'Pop', emoji: '🎤',
    queries: { easy: '', medium: 'pop hits', hard: 'pop album tracks' },
    easyTrackIds: [
      3135556,   // Smells Like Teen Spirit – Nirvana
      6822028,   // My Heart Will Go On – Celine Dion
      557283,    // I Will Always Love You – Whitney Houston
      350171271, // Shape of You – Ed Sheeran
      644082022, // Blinding Lights – The Weeknd
      424471,    // Rolling in the Deep – Adele
      138544007, // Uptown Funk – Bruno Mars
      2306727,   // Crazy In Love – Beyoncé
      908604572, // Poker Face – Lady Gaga
      735282,    // ...Baby One More Time – Britney Spears
      2531560,   // Complicated – Avril Lavigne
      1109731,   // Wonderwall – Oasis
      108936810, // Happy – Pharrell Williams
      757718682, // Dance Monkey – Tones and I
      444943547, // Despacito – Luis Fonsi
      390949072, // Closer – The Chainsmokers
      462913552, // Señorita – Shawn Mendes
      110210724, // Wrecking Ball – Miley Cyrus
      5804226,   // Hung Up – Madonna
      3153563,   // Clocks – Coldplay
    ],
  },
  {
    id: 'rock', label: 'Rock', emoji: '🎸',
    queries: { easy: '', medium: 'rock classics', hard: 'rock deep cuts' },
    easyTrackIds: [
      3135556,   // Smells Like Teen Spirit – Nirvana
      3128861,   // Nothing Else Matters – Metallica
      397226,    // Under The Bridge – RHCP
      904714,    // Zombie – The Cranberries
      3104502,   // Boulevard of Broken Dreams – Green Day
      2375553,   // In The End – Linkin Park
      1109731,   // Wonderwall – Oasis
      3157975,   // Bitter Sweet Symphony – The Verve
      3612440,   // Mr. Brightside – The Killers
      1608912,   // Losing My Religion – R.E.M.
      916424,    // Creep – Radiohead
      4271911,   // Iris – Goo Goo Dolls
      680089,    // Bohemian Rhapsody – Queen
      560399,    // Highway to Hell – AC/DC
      1263261,   // Sweet Child O' Mine – Guns N' Roses
      1050868,   // Livin' on a Prayer – Bon Jovi
      235720,    // Seven Nation Army – White Stripes
      695594,    // With or Without You – U2
      117259,    // Don't Stop Believin' – Journey
      1463889,   // Beautiful Day – U2
    ],
  },
  {
    id: 'hiphop', label: 'HipHop', emoji: '🎙️',
    queries: { easy: '', medium: 'hip hop hits', hard: 'underground hip hop' },
    easyTrackIds: [
      985710,    // Lose Yourself – Eminem
      1565538,   // In Da Club – 50 Cent
      1231330,   // Hey Ya! – OutKast
      2893902,   // Gangsta's Paradise – Coolio
      540568,    // Ice Ice Baby – Vanilla Ice
      503426912, // Old Town Road – Lil Nas X
      562484692, // God's Plan – Drake
      548108962, // Rockstar – Post Malone
      3122298,   // Yeah! – Usher
      12415942,  // Juicy – The Notorious B.I.G.
      2306727,   // Crazy In Love – Beyoncé ft. Jay-Z
      916575,    // Stan – Eminem
      1350005,   // The Real Slim Shady – Eminem
      370218,    // California Love – 2Pac
      1233779,   // Gold Digger – Kanye West
      1016711,   // Stronger – Kanye West
      1313346,   // Drop It Like It's Hot – Snoop Dogg
      916569,    // Without Me – Eminem
      445210,    // Ms. Jackson – OutKast
      1024968962,// Sicko Mode – Travis Scott
    ],
  },
  {
    id: 'rnb', label: 'R&B', emoji: '🎹',
    queries: { easy: '', medium: 'rnb hits', hard: 'rnb soul album tracks' },
    easyTrackIds: [
      557283,    // I Will Always Love You – Whitney Houston
      2306727,   // Crazy In Love – Beyoncé
      904006,    // No Scrubs – TLC
      3122298,   // Yeah! – Usher
      68919990,  // Return of the Mack – Mark Morrison
      644082022, // Blinding Lights – The Weeknd
      73666528,  // Somebody That I Used to Know – Gotye
      138544007, // Uptown Funk – Bruno Mars
      424471,    // Rolling in the Deep – Adele
      1565538,   // In Da Club – 50 Cent
      2485410,   // I Want It That Way – Backstreet Boys
      108936810, // Happy – Pharrell Williams
      133465216, // Get Lucky – Daft Punk
      900534892, // Havana – Camila Cabello
      462913552, // Señorita – Shawn Mendes & Camila Cabello
      1024968962,// Shallow – Lady Gaga
      350171271, // Shape of You – Ed Sheeran
      113412636, // Rehab – Amy Winehouse
      2300282,   // Wannabe – Spice Girls
      735282,    // ...Baby One More Time – Britney Spears
    ],
  },
  {
    id: 'deutsch', label: 'Deutsch', emoji: '🇩🇪',
    queries: { easy: '', medium: 'deutsche hits', hard: 'deutsche indie musik' },
    easyTrackIds: [
      1722498,   // 99 Luftballons – Nena
      68341022,  // Atemlos durch die Nacht – Helene Fischer
      86448330,  // Auf uns – Andreas Bourani
      8362883,   // Durch den Monsun – Tokio Hotel
      66896480,  // Lieblingsmensch – Namika
      5620005,   // Über den Wolken – Reinhard Mey
      14444498,  // Irgendwie Irgendwo Irgendwann – Nena
      3161854,   // Du hast – Rammstein
      63570252,  // An Wunder – Wincent Weiss
      545377,    // Rock Me Amadeus – Falco
      1079832,   // Da Da Da – Trio
      65510632,  // Chöre – Mark Forster
      664920,    // Major Tom – Peter Schilling
      544769,    // Der Kommissar – Falco
      135178556, // Roller – Apache 207
      1087657,   // Nur geträumt – Nena
      61756310,  // Auf anderen Wegen – Andreas Bourani
      126290990, // 80 Millionen – Max Giesinger
      14350478,  // Ich & Du – Rammstein
      138447076, // Cherry Lady – Capital Bra
    ],
  },
];

// Deezer API Response Types
interface DeezerSearchTrack {
  id: number;
  title: string;
  preview: string;
  artist: { name: string };
  album: {
    title: string;
    cover_medium: string;
  };
}

interface DeezerSearchResponse {
  data: DeezerSearchTrack[];
  total: number;
}

// /track/{id} endpoint – hat release_date!
interface DeezerTrackDetail {
  id: number;
  title: string;
  preview: string;
  release_date: string;  // "YYYY-MM-DD"
  artist: { name: string };
  album: {
    title: string;
    cover_medium: string;
    release_date?: string;
  };
}

// ── Preview-URL über Proxy leiten (CORS) ──
function proxyPreviewUrl(originalUrl: string): string {
  if (!originalUrl) return '';
  try {
    const url = new URL(originalUrl);
    if (url.hostname.includes('dzcdn.net')) {
      return `/api/audio${url.pathname}${url.search}`;
    }
  } catch {
    // URL-Parsing fehlgeschlagen
  }
  return originalUrl;
}

// ── Einzelnen Track mit release_date laden ──
async function fetchTrackDetail(id: number): Promise<Track | null> {
  try {
    const res = await fetch(`${DEEZER_BASE}/track/${id}`);
    if (!res.ok) return null;

    const dt: DeezerTrackDetail = await res.json();

    if (!dt.preview) return null;

    const dateStr = dt.release_date || dt.album?.release_date;
    const year = dateStr ? new Date(dateStr).getFullYear() : 0;
    if (year < 1950 || isNaN(year)) return null;

    return {
      id: String(dt.id),
      artist: dt.artist.name,
      title: dt.title,
      year,
      coverUrl: dt.album.cover_medium,
      previewUrl: proxyPreviewUrl(dt.preview),
    };
  } catch {
    return null;
  }
}

// ── Remix-/Version-Filter ──
const REMIX_PATTERNS = /\b(remix|remaster(ed)?|live|acoustic|version|edit|mix|cover|karaoke|instrumental|radio\s*edit|club\s*mix|extended|deluxe|demo|stripped|unplugged)\b/i;

function isRemixOrVersion(title: string): boolean {
  return REMIX_PATTERNS.test(title);
}

// ──────────────────────────────────────────────────────────────
// Tracks laden – mit Kategorie-Support
// Mehrere Kategorien → mehrere Suchen → zusammenmischen
// ──────────────────────────────────────────────────────────────
export async function fetchTracksByCategories(categoryIds: string[], difficulty: Difficulty = 'medium'): Promise<Track[]> {
  const cats = categoryIds
    .map(id => MUSIC_CATEGORIES.find(c => c.id === id))
    .filter((c): c is MusicCategory => c !== undefined);

  if (cats.length === 0) {
    return fetchTracks('hits');
  }

  // ── LEICHT: Handverlesene Track-IDs laden (nur Originale!) ──
  if (difficulty === 'easy') {
    const allIds = cats.flatMap(cat => cat.easyTrackIds);
    // Deduplizieren
    const uniqueIds = [...new Set(allIds)];
    // Zufällig mischen
    const shuffled = uniqueIds.sort(() => Math.random() - 0.5);
    const toLoad = shuffled.slice(0, 25);

    console.log(`😎 Leicht: Lade ${toLoad.length} handverlesene Chart-Hits...`);
    const details = await Promise.all(toLoad.map(id => fetchTrackDetail(id)));
    const tracks = details.filter((t): t is Track => t !== null);
    console.log(`✅ ${tracks.length} bekannte Hits geladen`);
    return tracks.length >= 5 ? tracks : loadFallbackTracks();
  }

  // ── MITTEL / SCHWER: Suche verwenden ──
  const allResults = await Promise.all(
    cats.map(cat => fetchTracks(cat.queries[difficulty]))
  );

  // Zusammenmischen + deduplizieren + Remixe rausfiltern
  const seen = new Set<string>();
  const merged: Track[] = [];
  for (const tracks of allResults) {
    for (const t of tracks) {
      if (isRemixOrVersion(t.title)) continue;
      const key = `${t.artist}-${t.title}`.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(t);
      }
    }
  }

  console.log(`🎵 ${merged.length} Tracks aus ${cats.length} Kategorie(n) geladen`);
  return merged.length >= 5 ? merged : loadFallbackTracks();
}

export async function fetchTracks(query: string): Promise<Track[]> {
  try {
    const url = `${DEEZER_BASE}/search?q=${encodeURIComponent(query)}&limit=30`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Deezer API error: ${res.status}`);

    const data: DeezerSearchResponse = await res.json();
    console.log(`🔍 Deezer search "${query}": ${data.data.length} Ergebnisse`);

    // Nur Originale mit Preview (keine Remixe, Remaster etc.)
    const withPreview = data.data.filter(t => t.preview && !isRemixOrVersion(t.title));

    const seen = new Set<string>();
    const unique = withPreview.filter(t => {
      const key = `${t.artist.name}-${t.title}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const toFetch = unique.slice(0, 20);
    console.log(`📡 Lade Details für ${toFetch.length} Tracks...`);

    const details = await Promise.all(
      toFetch.map(t => fetchTrackDetail(t.id))
    );

    const tracks = details.filter((t): t is Track => t !== null);
    console.log(`✅ ${tracks.length} Tracks mit Jahr + Preview geladen`);

    if (tracks.length < 5) {
      console.warn('⚠️ Zu wenige Tracks aus Suche, nutze Fallback');
      return loadFallbackTracks();
    }

    return tracks;
  } catch (err) {
    console.error('❌ Deezer API Fehler:', err);
    return loadFallbackTracks();
  }
}

// ──────────────────────────────────────────────────────────────
// Fallback: Bekannte Deezer Track-IDs
// ──────────────────────────────────────────────────────────────
const FALLBACK_IDS = [
  3135556, 1109731, 3157975, 1608912, 2485410,
  12415942, 67238735, 908604572, 644082022,
  757718682, 680089, 560399,
];

async function loadFallbackTracks(): Promise<Track[]> {
  console.log('🔄 Lade Fallback-Tracks von Deezer (per Track-ID)...');
  const details = await Promise.all(
    FALLBACK_IDS.map(id => fetchTrackDetail(id))
  );
  const tracks = details.filter((t): t is Track => t !== null);
  console.log(`✅ ${tracks.length} Fallback-Tracks geladen`);
  return tracks;
}
