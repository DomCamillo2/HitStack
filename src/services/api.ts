import type { Track } from '../store/gameStore';

// ──────────────────────────────────────────────────────────────
// Deezer API  –  kostenlos, kein API-Key nötig
//
// NEUER ANSATZ: Nur vorkuratierte Track-IDs verwenden!
// Keine Suche mehr → Genre stimmen immer.
// Pro Track: /track/{id} abfragen für Preview + release_date.
//
// Dev: Vite-Proxy leitet /api/deezer/* an api.deezer.com
// Prod: Vercel Function /api/deezer?path=... als CORS-Proxy
// ──────────────────────────────────────────────────────────────

const IS_DEV = import.meta.env.DEV;

function deezerUrl(path: string, params?: Record<string, string>): string {
  if (IS_DEV) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return `/api/deezer/${path}${qs}`;
  }
  const allParams = { path, ...params };
  return `/api/deezer?${new URLSearchParams(allParams).toString()}`;
}

// ── Schwierigkeitsgrade ──
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface DifficultyLevel {
  id: Difficulty;
  label: string;
  emoji: string;
  description: string;
}

export const DIFFICULTY_LEVELS: DifficultyLevel[] = [
  { id: 'easy',   label: 'Leicht',  emoji: '😎', description: 'Mega-bekannte Hits – 30 s hören' },
  { id: 'medium', label: 'Mittel',  emoji: '🤔', description: 'Bekannte Songs – 25 s hören' },
  { id: 'hard',   label: 'Schwer',  emoji: '🧠', description: 'Bunt gemischt – nur 20 s hören' },
];

/** Wie viele Sekunden Hörzeit pro Schwierigkeitsgrad */
export const LISTEN_SECONDS: Record<Difficulty, number> = {
  easy: 30,
  medium: 25,
  hard: 20,
};

/** Sekunden die ein Joker dazu gibt */
export const JOKER_BONUS_SECONDS = 15;

// ── Musik-Kategorien (nur kuratierte IDs!) ──
export interface MusicCategory {
  id: string;
  label: string;
  emoji: string;
  /** Deezer Track-IDs – handverlesen, Genre-sicher */
  trackIds: number[];
}

export const MUSIC_CATEGORIES: MusicCategory[] = [
  {
    id: '2000er', label: '2000er', emoji: '📀',
    trackIds: [
      577487252,   // Bon Jovi – It's My Life
      13142617,    // Britney Spears – Oops!... I Did It Again
      1109737,     // Eminem – The Real Slim Shady
      3389258,     // Baha Men – Who Let The Dogs Out
      3102419,     // Robbie Williams – Rock DJ
      963042,      // OutKast – Ms. Jackson
      870041,      // Wheatus – Teenage Dirtbag
      2162742,     // U2 – Beautiful Day
      632447,      // *NSYNC – Bye Bye Bye
      104011168,   // Limp Bizkit – Rollin'
      959183,      // Alicia Keys – Fallin'
      3098100,     // Kylie Minogue – Can't Get You Out of My Head
      676183,      // Linkin Park – In the End
      15211178,    // Shakira – Whenever, Wherever
      71828723,    // Nickelback – How You Remind Me
      655356162,   // P!nk – Get the Party Started
      2122528,     // Shaggy – Angel
      859699,      // System of a Down – Chop Suey!
      1109731,     // Eminem – Lose Yourself
      15587465,    // Avril Lavigne – Complicated
      2447436,     // Nelly – Hot in Herre
      476739462,   // Las Ketchup – The Ketchup Song
      884756,      // t.A.T.u. – All The Things She Said
      725929,      // Red Hot Chili Peppers – By the Way
      969494,      // Justin Timberlake – Cry Me a River
      983832,      // Vanessa Carlton – A Thousand Miles
      1153182282,  // The White Stripes – Seven Nation Army
      13138698,    // Beyoncé – Crazy in Love
      1141668,     // 50 Cent – In Da Club
      628266,      // OutKast – Hey Ya!
      1697351967,  // The Black Eyed Peas – Where Is The Love?
      80274512,    // Evanescence – Bring Me To Life
      2654326,     // Dido – White Flag
      364292561,   // Sean Paul – Get Busy
      13783449,    // Usher – Yeah!
      953097,      // The Killers – Mr. Brightside
      773367,      // Green Day – American Idiot
      15391618,    // Britney Spears – Toxic
      1165301,     // Maroon 5 – This Love
      429125352,   // Snoop Dogg – Drop It Like It's Hot
      1411240392,  // O-Zone – Dragostea Din Tei
      4315684,     // Franz Ferdinand – Take Me Out
      983450,      // Gwen Stefani – Hollaback Girl
      3106505,     // Coldplay – Fix You
      679217,      // Madonna – Hung Up
      3129407,     // Gorillaz – Feel Good Inc.
      2659940,     // James Blunt – You're Beautiful
      1184309,     // Kanye West – Gold Digger
      1161005,     // The Pussycat Dolls – Don't Cha
      2953166,     // Rihanna – Pon de Replay
      6611231,     // Green Day – Boulevard of Broken Dreams
      2176852,     // Amy Winehouse – Rehab
      2794160,     // Gnarls Barkley – Crazy
      15489383,    // Justin Timberlake – SexyBack
      1576190,     // Snow Patrol – Chasing Cars
      2430338,     // Nelly Furtado – Promiscuous
      88897841,    // Shakira – Hips Don't Lie
      3158004,     // The Kooks – Naive
      925106,      // Rihanna – Umbrella
      916841,      // Timbaland – Apologize
      365067,      // Leona Lewis – Bleeding Love
      953602,      // Mika – Grace Kelly
      26608051,    // Kaiser Chiefs – Ruby
      921959412,   // Plain White T's – Hey There Delilah
      3135556,     // Daft Punk – Harder Better Faster Stronger
      2603558,     // Lady Gaga – Poker Face
      15531170,    // Kings of Leon – Sex on Fire
      3169161,     // Katy Perry – I Kissed a Girl
      13444256,    // Coldplay – Viva La Vida
      2485118,     // Beyoncé – Single Ladies
      2686140,     // Jason Mraz – I'm Yours
      2281107,     // P!nk – So What
      71955252,    // The Killers – Human
      4619466,     // The Black Eyed Peas – I Gotta Feeling
      4601933,     // Lady Gaga – Bad Romance
      3445820,     // David Guetta – When Love Takes Over
      4286051,     // Empire of the Sun – Walking On A Dream
      90533119,    // Jay-Z – Empire State of Mind
      7561772,     // Florence + The Machine – Dog Days Are Over
      4764905,     // Kesha – Tik Tok
    ],
  },
  {
    id: '2010er', label: '2010er', emoji: '🎧',
    trackIds: [
      68473089,    // Shakira – Waka Waka
      13529563,    // Rihanna – Only Girl
      8011850,     // Bruno Mars – Just the Way You Are
      17135111,    // Katy Perry – Firework
      8086126,     // Adele – Rolling in the Deep
      12565420,    // LMFAO – Party Rock Anthem
      10308117,    // Pitbull – Give Me Everything
      12724819,    // Maroon 5 – Moves Like Jagger
      8930372,     // Jennifer Lopez – On The Floor
      60726278,    // PSY – Gangnam Style
      60726419,    // Carly Rae Jepsen – Call Me Maybe
      61424045,    // Macklemore – Thrift Shop
      63510358,    // Imagine Dragons – Radioactive
      14539929,    // Gotye – Somebody That I Used to Know
      1550966342,  // Taylor Swift – I Knew You Were Trouble
      70266756,    // Avicii – Wake Me Up
      66609426,    // Daft Punk – Get Lucky
      701326562,   // Pharrell Williams – Happy
      71137166,    // Miley Cyrus – Wrecking Ball
      70403437,    // Lorde – Royals
      65444691,    // Robin Thicke – Blurred Lines
      78527795,    // OneRepublic – Counting Stars
      63034985,    // Bastille – Pompeii
      79875064,    // Ed Sheeran – Thinking Out Loud
      89077555,    // Taylor Swift – Shake It Off
      79587580,    // Sia – Chandelier
      92734438,    // Mark Ronson – Uptown Funk
      113420702,   // Meghan Trainor – All About That Bass
      84791735,    // Hozier – Take Me to Church
      138545995,   // Adele – Hello
      112662366,   // Justin Bieber – Sorry
      124603286,   // Drake – Hotline Bling
      106506516,   // The Weeknd – Can't Feel My Face
      113876568,   // Major Lazer – Lean On
      124237488,   // Justin Timberlake – Can't Stop the Feeling!
      129310248,   // The Chainsmokers – Closer
      118195184,   // Sia – Cheap Thrills
      139470659,   // Ed Sheeran – Shape of You
      623698142,   // Luis Fonsi – Despacito
      528330441,   // Imagine Dragons – Believer
      447098092,   // Camila Cabello – Havana
      561856742,   // Lady Gaga – Shallow
      655095912,   // Billie Eilish – Bad Guy
      699056262,   // Lil Nas X – Old Town Road
      739870792,   // Tones and I – Dance Monkey
      908604612,   // The Weeknd – Blinding Lights
    ],
  },
  {
    id: 'pop', label: 'Pop', emoji: '🎤',
    trackIds: [
      2891799832,  // Kim Wilde – Kids in America
      4603408,     // Michael Jackson – Billie Jean
      555639,      // Michael Jackson – Thriller
      72194071,    // Cyndi Lauper – Girls Just Want to Have Fun
      561836,      // Eurythmics – Sweet Dreams
      3786035302,  // Nena – 99 Luftballons
      15194531,    // Wham! – Wake Me Up Before You Go-Go
      678336,      // Madonna – Like a Virgin
      698274,      // Alphaville – Forever Young
      664107,      // a-ha – Take on Me
      542016,      // Falco – Rock Me Amadeus
      14408104,    // Rick Astley – Never Gonna Give You Up
      75981528,    // Whitney Houston – I Wanna Dance with Somebody
      664507,      // Madonna – Like a Prayer
      3098301,     // Roxette – It Must Have Been Love
      68515055,    // Depeche Mode – Enjoy the Silence
      94676692,    // Ace of Base – All That She Wants
      99360002,    // Scatman John – Scatman
      3133738,     // Spice Girls – Wannabe
      789250,      // Alanis Morissette – Ironic
      88685889,    // Hanson – MMMBop
      1115044,     // Aqua – Barbie Girl
      786717,      // Cher – Believe
      540175,      // Britney Spears – Baby One More Time
      778704,      // Madonna – Ray of Light
      13141170,    // Backstreet Boys – I Want It That Way
      15627386,    // Christina Aguilera – Genie in a Bottle
      13704591,    // Ricky Martin – Livin' la Vida Loca
      434625962,   // Lou Bega – Mambo No. 5
      3098217,     // Robbie Williams – Feel
      13142617,    // Britney Spears – Oops!... I Did It Again
      3098100,     // Kylie Minogue – Can't Get You Out of My Head
      655356162,   // P!nk – Get the Party Started
      15211178,    // Shakira – Whenever, Wherever
      15597819,    // Pink – Just Like a Pill
      476739462,   // Las Ketchup – The Ketchup Song
      884756,      // t.A.T.u. – All The Things She Said
      970410,      // Justin Timberlake – Rock Your Body
      2654326,     // Dido – White Flag
      983450,      // Gwen Stefani – Hollaback Girl
      1165301,     // Maroon 5 – This Love
      679217,      // Madonna – Hung Up
      2659940,     // James Blunt – You're Beautiful
      2794160,     // Gnarls Barkley – Crazy
      1151141,     // Nelly Furtado – Maneater
      953602,      // Mika – Grace Kelly
      365067,      // Leona Lewis – Bleeding Love
      2603558,     // Lady Gaga – Poker Face
      3160142,     // Katy Perry – Hot N Cold
      3169161,     // Katy Perry – I Kissed a Girl
      2281107,     // Pink – So What
      4601933,     // Lady Gaga – Bad Romance
      4619466,     // The Black Eyed Peas – I Gotta Feeling
      8011849,     // Bruno Mars – Grenade
      68473089,    // Shakira – Waka Waka
      12724819,    // Maroon 5 – Moves Like Jagger
      8086126,     // Adele – Rolling in the Deep
      12565420,    // LMFAO – Party Rock Anthem
      60726419,    // Carly Rae Jepsen – Call Me Maybe
      60726278,    // PSY – Gangnam Style
      67466760,    // Loreen – Euphoria
      71137166,    // Miley Cyrus – Wrecking Ball
      70266756,    // Avicii – Wake Me Up
      70403437,    // Lorde – Royals
      89077555,    // Taylor Swift – Shake It Off
      79587580,    // Sia – Chandelier
      79875064,    // Ed Sheeran – Thinking Out Loud
      112662366,   // Justin Bieber – Sorry
      138545995,   // Adele – Hello
      124237488,   // Justin Timberlake – Can't Stop the Feeling!
      118195184,   // Sia – Cheap Thrills
      139470659,   // Ed Sheeran – Shape of You
      623698142,   // Luis Fonsi – Despacito
      447098092,   // Camila Cabello – Havana
      655095912,   // Billie Eilish – Bad Guy
      788708262,   // Dua Lipa – Don't Start Now
      739870792,   // Tones and I – Dance Monkey
      908604612,   // The Weeknd – Blinding Lights
      1409072752,  // Ed Sheeran – Bad Habits
      1703487577,  // Harry Styles – As It Was
    ],
  },
  {
    id: 'deutsch', label: 'Deutsch', emoji: '🇩🇪',
    trackIds: [
      3786035302,  // Nena – 99 Luftballons
      3123329,     // Spider Murphy Gang – Skandal im Sperrbezirk
      122357172,   // Peter Schilling – Major Tom
      3159913,     // Herbert Grönemeyer – Männer
      542016,      // Falco – Rock Me Amadeus
      630374,      // Münchener Freiheit – Ohne Dich
      4300806,     // Die Fantastischen Vier – Die da
      1006163552,  // Die Ärzte – Schrei nach Liebe
      3558361541,  // Fettes Brot – Jein
      4300847,     // Die Fantastischen Vier – Sie ist weg
      142393497,   // Die Toten Hosen – Zehn kleine Jägermeister
      62382294,    // Tic Tac Toe – Ich find dich scheiße
      1006092782,  // Die Ärzte – Männer sind Schweine
      13569299,    // Falco – Out of the Dark
      15644778,    // Freundeskreis – A-N-N-A
      111844700,   // Die Fantastischen Vier – MfG
      2176668,     // Absolute Beginner – Liebes Lied
      1095340122,  // Die Ärzte – Westerland
      14381638,    // Rammstein – Sonne
      740677,      // Seeed – Dickes B
      3159895,     // Herbert Grönemeyer – Mensch
      1791078487,  // Sportfreunde Stiller – Ein Kompliment
      3090905,     // Wir sind Helden – Denkmal
      132193536,   // Beginner – Gustav Gans
      121926890,   // Juli – Perfekte Welle
      3786045422,  // Sido – Mein Block
      15539388,    // Silbermond – Symphonie
      3434774,     // De Randfichten – Lebt denn dr alte Holzmichl noch
      7718640,     // Tokio Hotel – Durch den Monsun
      3558285081,  // Fettes Brot – Emanuela
      2443031,     // Jan Delay – Klar
      1791079027,  // Sportfreunde Stiller – '54, '74, '90, 2006
      80098104,    // Deichkind – Remmidemmi
      1139093,     // DJ Ötzi – Ein Stern
      580534,      // Die Fantastischen Vier – Ernten was wir säen
      1543796712,  // Culcha Candela – Hamma!
      1278137272,  // Ich + Ich – Vom selben Stern
      2200206,     // Peter Fox – Haus am See
      2160808,     // Polarkreis 18 – Allein Allein
      2200204,     // Peter Fox – Alles Neu
      3145741661,  // Frauenarzt & Manny Marc – Das geht ab
      2862734,     // Silbermond – Irgendwas bleibt
      75486189,    // Unheilig – Geboren um zu leben
      6447685,     // Lena – Satellite
      12000049,    // Tim Bendzko – Nur noch kurz die Welt retten
      12601520,    // Casper – So perfekt
      3782842542,  // Cro – Easy
      142393383,   // Die Toten Hosen – Tage wie diese
      3321969951,  // Marteria – Lila Wolken
      70697237,    // Helene Fischer – Atemlos durch die Nacht
      62418971,    // Sido – Bilder im Kopf
      77834654,    // Mark Forster – Au Revoir
      77045434,    // Andreas Bourani – Auf uns
      102972232,   // Namika – Lieblingsmensch
      98348314,    // Sarah Connor – Wie schön du bist
      105710536,   // Sido – Astronaut
      138394771,   // Bonez MC & RAF Camora – Palmen aus Plastik
      426347072,   // Mark Forster – Chöre
      406824682,   // Bausa – Was du Liebe nennst
      735495312,   // Apache 207 – Roller
    ],
  },
  {
    id: 'rnb', label: 'R&B', emoji: '🎹',
    trackIds: [
      59509541,    // Michael Jackson – The Way You Make Me Feel
      7675403,     // Whitney Houston – I Will Always Love You
      2426056,     // Boyz II Men – End of the Road
      4086654,     // All-4-One – I Swear
      1043894,     // TLC – Waterfalls
      629312,      // R. Kelly – Bump N' Grind
      1013792,     // Mariah Carey – Fantasy
      2522953,     // Montell Jordan – This Is How We Do It
      869548,      // Fugees – Killing Me Softly
      629335,      // R. Kelly – I Believe I Can Fly
      916496,      // Blackstreet – No Diggity
      82524066,    // Ginuwine – Pony
      67163992,    // Toni Braxton – Un-Break My Heart
      1909711527,  // Usher – You Make Me Wanna
      662355,      // Brandy & Monica – The Boy Is Mine
      400418902,   // Lauryn Hill – Doo Wop
      580936,      // Destiny's Child – Say My Name
      1075781,     // TLC – No Scrubs
      15475926,    // Jennifer Lopez – If You Had My Love
      962260,      // Whitney Houston – My Love Is Your Love
      5817089,     // Destiny's Child – Survivor
      2548870,     // Sisqo – Thong Song
      959183,      // Alicia Keys – Fallin'
      1161679,     // Mary J. Blige – Family Affair
      969347,      // Usher – U Remind Me
      13146847,    // Blu Cantrell – Hit 'Em Up Style
      2447443,     // Nelly – Dilemma
      1125953,     // Ashanti – Foolish
      969494,      // Justin Timberlake – Cry Me a River
      13138698,    // Beyoncé – Crazy in Love
      13138700,    // Beyoncé – Baby Boy
      1697351967,  // Black Eyed Peas – Where Is The Love
      13783453,    // Usher – Burn
      607684,      // Mario – Let Me Love You
      2511970,     // Mariah Carey – We Belong Together
      1161008,     // Pussycat Dolls – Stickwitu
      13140203,    // Chris Brown – Run It!
      15489385,    // Justin Timberlake – My Love
      979041,      // Akon – Smack That
      2169153,     // Beyoncé – Irreplaceable
      925106,      // Rihanna – Umbrella
      4685514,     // Timbaland – The Way I Are
      2466262,     // Alicia Keys – No One
      2124367,     // Ne-Yo – Closer
      2553265,     // Beyoncé – Halo
      1855507607,  // Estelle – American Boy
      5420471,     // Jason Derulo – Whatcha Say
      8011850,     // Bruno Mars – Just the Way You Are
      4670273,     // Rihanna – Rude Boy
      70079770,    // John Legend – All of Me
      65444691,    // Robin Thicke – Blurred Lines
      701326562,   // Pharrell Williams – Happy
      106506516,   // The Weeknd – Can't Feel My Face
      136889400,   // The Weeknd – Starboy
      124603270,   // Drake – One Dance
      666286232,   // Lizzo – Juice
    ],
  },
  {
    id: 'rock', label: 'Rock', emoji: '🎸',
    trackIds: [
      12206933,    // Queen – We Will Rock You
      67503808,    // Queen – We Are The Champions
      92719900,    // AC/DC – Highway to Hell
      92720046,    // AC/DC – Back in Black
      555257532,   // Joan Jett – I Love Rock 'n Roll
      576431,      // Survivor – Eye of the Tiger
      88902741,    // Bryan Adams – Summer of '69
      3807039752,  // Scorpions – Rock You Like a Hurricane
      538660022,   // Bon Jovi – Livin' on a Prayer
      619310,      // Europe – The Final Countdown
      518458172,   // Guns N' Roses – Sweet Child O' Mine
      518458142,   // Guns N' Roses – Paradise City
      674958,      // Alannah Myles – Black Velvet
      92720102,    // AC/DC – Thunderstruck
      13791930,    // Nirvana – Smells Like Teen Spirit
      13791932,    // Nirvana – Come As You Are
      1483825212,  // Metallica – Enter Sandman
      1483825282,  // Metallica – Nothing Else Matters
      136334560,   // R.E.M. – Losing My Religion
      785176,      // Red Hot Chili Peppers – Under the Bridge
      62082829,    // Rage Against the Machine – Killing in the Name
      2184743,     // 4 Non Blondes – What's Up?
      3107395,     // Lenny Kravitz – Are You Gonna Go My Way
      1057312,     // Soul Asylum – Runaway Train
      2246520677,  // Aerosmith – Cryin'
      678044,      // Green Day – Basket Case
      378299601,   // The Offspring – Self Esteem
      78631539,    // Soundgarden – Black Hole Sun
      952788,      // The Cranberries – Zombie
      985745702,   // Oasis – Wonderwall
      3102130,     // Blur – Song 2
      432946922,   // The Verve – Bitter Sweet Symphony
      137233982,   // The Offspring – Pretty Fly
      725274,      // Red Hot Chili Peppers – Californication
      127354207,   // Blink-182 – All The Small Things
      4311599,     // Foo Fighters – Learn to Fly
      94613610,    // Limp Bizkit – Nookie
      577487252,   // Bon Jovi – It's My Life
      676183,      // Linkin Park – In the End
      6435662,     // Papa Roach – Last Resort
      104011168,   // Limp Bizkit – Rollin'
      2511224,     // 3 Doors Down – Kryptonite
      870041,      // Wheatus – Teenage Dirtbag
      859699,      // System of a Down – Chop Suey!
      1108061,     // Alien Ant Farm – Smooth Criminal
      71828723,    // Nickelback – How You Remind Me
      1125079,     // Sum 41 – Fat Lip
      15587466,    // Avril Lavigne – Sk8er Boi
      725929,      // Red Hot Chili Peppers – By the Way
      1153182282,  // The White Stripes – Seven Nation Army
      80274512,    // Evanescence – Bring Me To Life
      677232,      // Linkin Park – Numb
      61914316,    // The Rasmus – In the Shadows
      811880,      // Jet – Are You Gonna Be My Girl
      773367,      // Green Day – American Idiot
      953097,      // The Killers – Mr. Brightside
      4315684,     // Franz Ferdinand – Take Me Out
      2315240,     // U2 – Vertigo
      4311595,     // Foo Fighters – Best of You
      88485737,    // Billy Talent – Red Flag
      1576190,     // Snow Patrol – Chasing Cars
      3158004,     // The Kooks – Naive
      15531170,    // Kings of Leon – Sex on Fire
      921959412,   // Plain White T's – Hey There Delilah
      4087608,     // Kid Rock – All Summer Long
      14932098,    // The Black Keys – Lonely Boy
      63510358,    // Imagine Dragons – Radioactive
      63034985,    // Bastille – Pompeii
      99976952,    // Twenty One Pilots – Stressed Out
      528330441,   // Imagine Dragons – Believer
      437046332,   // Måneskin – Beggin'
    ],
  },
];

// ── Deezer API Types ──

interface DeezerTrackDetail {
  id: number;
  title: string;
  preview: string;
  release_date: string;
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
      const audioPath = url.pathname.slice(1) + url.search;
      if (IS_DEV) {
        return `/api/audio/${audioPath}`;
      }
      return `/api/audio?path=${encodeURIComponent(audioPath)}`;
    }
  } catch {
    // URL-Parsing fehlgeschlagen
  }
  return originalUrl;
}

// ── Einzelnen Track laden ──
async function fetchTrackDetail(id: number): Promise<Track | null> {
  try {
    const res = await fetch(deezerUrl(`track/${id}`));
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

// ──────────────────────────────────────────────────────────────
// Tracks laden – NUR aus kuratierten Listen
// Mehrere Kategorien → IDs zusammenmischen → deduplizieren
// ──────────────────────────────────────────────────────────────
export async function fetchTracksByCategories(categoryIds: string[], _difficulty: Difficulty = 'medium'): Promise<Track[]> {
  const cats = categoryIds
    .map(id => MUSIC_CATEGORIES.find(c => c.id === id))
    .filter((c): c is MusicCategory => c !== undefined);

  if (cats.length === 0) {
    console.warn('⚠️ Keine Kategorien ausgewählt, nutze Fallback');
    return loadFallbackTracks();
  }

  // Alle Track-IDs sammeln und deduplizieren
  const allIds = cats.flatMap(cat => cat.trackIds);
  const uniqueIds = [...new Set(allIds)];

  // Zufällig mischen und max. 25 laden (für Geschwindigkeit)
  const shuffled = uniqueIds.sort(() => Math.random() - 0.5);
  const toLoad = shuffled.slice(0, 25);

  console.log(`🎵 Lade ${toLoad.length} kuratierte Songs aus ${cats.map(c => c.label).join(', ')}…`);

  const details = await Promise.all(toLoad.map(id => fetchTrackDetail(id)));
  const tracks = details.filter((t): t is Track => t !== null);

  console.log(`✅ ${tracks.length} Songs geladen`);

  if (tracks.length < 5) {
    console.warn('⚠️ Zu wenige Tracks, nutze Fallback');
    return loadFallbackTracks();
  }

  return tracks;
}

// ── Fallback ──
const FALLBACK_IDS = [
  3135556, 1109731, 3157975, 1608912, 2485410,
  12415942, 67238735, 908604572, 644082022,
  757718682, 680089, 560399,
];

async function loadFallbackTracks(): Promise<Track[]> {
  console.log('🔄 Lade Fallback-Tracks…');
  const details = await Promise.all(
    FALLBACK_IDS.map(id => fetchTrackDetail(id))
  );
  const tracks = details.filter((t): t is Track => t !== null);
  console.log(`✅ ${tracks.length} Fallback-Tracks geladen`);
  return tracks;
}
