/**
 * Single source of truth for every string on the site, in EN and FR.
 *
 * Shape is mirrored exactly between locales so `useLang()` can swap the whole
 * tree at once. Anything that is not language-dependent (slugs, hrefs, dates)
 * lives in `shared` below.
 */

export const shared = {
  name: "Sasha Sutton",
  email: "sashasuttons3@gmail.com",
  links: {
    // Corrected against sashasutton.dev — the old slug here was `sasha-sutton`,
    // which is not the profile that site links to.
    linkedin: "https://www.linkedin.com/in/sashasutton4",
    github: "https://github.com/sashsutton",
    // TODO: drop your real PDF at public/cv/sasha-sutton-cv.pdf
    cv: "/cv/sasha-sutton-cv.pdf",
  },
  /**
   * The "programs" on the CRT screen. Both have a page of their own; `href`
   * is what makes clicking navigate. An entry with `href: null` would scroll
   * to the matching block on the landing page instead.
   */
  programs: [
    { id: "science", file: "SCIENCE.EXE", href: "/science", accent: "green" },
    { id: "music", file: "MUSIC.EXE", href: "/music", accent: "amber" },
  ],

  /**
   * Portrait for the About section.
   *
   * TODO: drop a photo at public/portrait.jpg and set `src` to "/portrait.jpg".
   * Until then the slot renders a marked placeholder rather than an empty gap,
   * so the layout you are looking at is the layout you will get.
   *
   * Shoot or crop it 4:5 (portrait). `width`/`height` are the intrinsic pixel
   * size — next/image needs them to reserve space before the file loads, so
   * update them to match whatever you actually drop in. ~1000px on the long
   * edge is plenty; the slot is never wider than 300 CSS px.
   */
  portrait: { src: "/portrait.jpg", width: 2963, height: 3951 },

  /**
   * The three sets on /music, embedded from where each one actually lives.
   *  - `soundcloud` — profile/playlist URL, wrapped in the SoundCloud widget.
   *  - the YouTube video, as id + start seconds (the ?t=10s from the share link).
   *  - `liveSet` — a self-hosted file. null renders a marked placeholder; set it
   *    to "/audio/live-set.mp3" once the file is dropped in public/audio/.
   *    Keep it short: a full DJ set is large and licence-bound, so self-host
   *    only your own recordings and link long third-party sets from SoundCloud.
   */
  media: {
    soundcloud: "https://soundcloud.com/sasha-sutton-974644697",
    youtubeId: "bTA1Srxxnmc",
    youtubeStart: 10,
    // Self-hosted Amplitudes Radio set. null renders a marked placeholder; set
    // to "/audio/amplitudes-radio.mp3" once the file is in public/audio/.
    radioSet: null,
  },

  /* ========================================================================
   * /science
   *
   * Projects are taken from the public repos on github.com/sashsutton, and
   * every `repo` / `demo` URL below has been checked to resolve.
   *
   * TWO THINGS STILL NEED CONFIRMING (marked CHECK: at the line):
   *   - the Paris-Saclay and Aix-Marseille year ranges
   *   - whether Point Blank belongs on this timeline as well as on /music
   *
   * Prose for every id lives under `science` in BOTH the en and fr trees
   * below — an id missing from one locale renders blank there.
   * ===================================================================== */

  research: {
    projects: [
      {
        id: "nn3d",
        no: "01",
        year: "2026",
        stack: ["TypeScript", "Python", "MNIST"],
        repo: "https://github.com/sashsutton/neural-network-numbers",
        demo: "https://neural-network-numbers.vercel.app",
      },
      {
        id: "harp",
        no: "02",
        year: "2025",
        stack: ["Python", "MediaPipe", "OpenCV", "pygame"],
        repo: "https://github.com/sashsutton/computer_vision_air_harp",
        demo: null,
      },
      {
        id: "mlc",
        no: "03",
        year: "2026",
        stack: ["C", "CMake", "no deps"],
        repo: "https://github.com/sashsutton/ML_library",
        demo: null,
      },
      {
        id: "vec",
        no: "04",
        year: "2025",
        stack: ["Python", "FastAPI", "BERT", "NumPy"],
        repo: "https://github.com/sashsutton/vector-search-engine",
        demo: "https://vector-search-engine-frontend.vercel.app/",
      },
      {
        id: "paper",
        no: "05",
        year: "2026",
        stack: ["LaTeX", "EN + FR"],
        repo: "https://github.com/sashsutton/MLP-article-en",
        demo: null,
      },
      {
        id: "agent",
        no: "06",
        year: "2026",
        stack: ["Python", "Mistral AI", "Pandas"],
        repo: "https://github.com/sashsutton/omni-analyst",
        demo: null,
      },
    ],

    /**
     * Newest first. `url` links the entry's title to the official programme
     * page; every one below was checked to resolve except the Point Blank link,
     * which returns 403 to automated requests but is fine in a browser.
     *
     * CHECK: saclay and amuMaths are both 2026-2027. If the master's actually
     * starts after the maths bachelor finishes, saclay wants moving to 2027.
     */
    education: [
      {
        id: "saclay",
        from: "2026",
        to: "2027",
        url: "https://www.universite-paris-saclay.fr/en/education/masters-degree/computer-science/m1-data-knowledge-and-hybrid-artificial-intelligence-dkai",
      },
      {
        id: "amuMaths",
        from: "2026",
        to: "2027",
        url: "https://sciences.univ-amu.fr/fr/formation/licences/licence-mathematiques/parcours-mathematiques",
      },
      {
        id: "amu",
        from: "2023",
        to: "2026",
        url: "https://sciences.univ-amu.fr/fr/formation/licences/licence-informatique/parcours-mathematiques-informatique",
      },
      {
        id: "middlesex",
        from: "2021",
        to: "2023",
        url: "https://www.pointblankmusicschool.com/courses/london/he/ba-hons-music-production-and-sound-engineering-degree-3-years-reval/",
      },
    ],

    /** The three threads the research section is organised around. */
    focus: ["research", "applied", "curious"],
  },
};

const en = {
  locale: "en",
  nav: {
    about: "About",
    work: "What I do",
    next: "What's next",
    contact: "Contact",
    cv: "CV",
  },
  loader: {
    booting: "Initialising",
    ready: "Press any key",
  },
  /**
   * What the CRT types out: a one-line power-on, then who you are. The program
   * list sits underneath it on the same screen.
   *
   * Line COUNT is load-bearing, not just the wording — screen.module.css
   * reserves a fixed height for this block so the menu below never shifts while
   * the text types in. Eight lines at 14px x 1.5 = 168px. Add a line and you
   * must raise `.boot { height }` to match, and there are only ~44px of slack
   * left in the 480px screen before the scroll hint gets clipped.
   *
   * Width budget: ~70 characters at the full size.
   */
  intro: [
    "SASHA-OS v1.0",
    "",
    "> whoami",
    "SASHA SUTTON",
    "M1 · Data, Knowledge & Hybrid AI",
    "Université Paris-Saclay",
    "Data science & AI",
    "Music producer_",
  ],
  // Narrow screens author the terminal at ~380px instead of 640px so the type
  // stays legible. Six lines at 12px x 1.4 = 101px; ~49 characters wide.
  introCompact: [
    "SASHA-OS v1.0",
    "> whoami",
    "SASHA SUTTON",
    "M1 DKAI — Paris-Saclay",
    "Data science & AI",
    "Music producer_",
  ],
  hero: {
    title: "Sasha Sutton",
    tagline: "Data science & AI",
    hint: "scroll to explore",
    pick: "select a program",
  },
  programs: {
    science: {
      label: "Science & AI",
      blurb:
        "M1 in Data, Knowledge & Hybrid AI at Paris-Saclay. Research, Data Science & AI projects.",
    },
    music: {
      label: "Music & Sound",
      blurb:
        "Middlesex University & Fabric London. Sound engineer, DJ & producer.",
    },
  },
  about: {
    title: "About",
    lead: "I'm doing a master's in AI. Before that I spent four years working in sound in London.",
    body: [
      "I was born in Udon Thani, in Thailand, and grew up between Laos, the French countryside, Senegal and Bordeaux. I live in Paris now.",
      "Music came first. Two years at Point Blank training as a sound engineer, two years on the sound team at Fabric, and a two year accelerated degree at Middlesex. I was happy doing it. What kept nagging at me was that I knew how to use the tools and not how any of them worked.",
      "So I went back and studied maths and computer science to find out. That is the pattern, honestly. I get curious about something, start taking it apart, and end up doing a whole degree in it. It is the reason I have collected as many as I have.",
      "Now I'm in the first year of a master's in Data, Knowledge and Hybrid AI at Paris-Saclay, working on NLP and computer vision. I still DJ and produce.",
    ],
    quote:
      "If I use something, I want to know why it works. Otherwise I'm just trusting it.",
    portraitAlt: "Sasha Sutton",
  },
  work: {
    title: "What I do",
    lenses: [
      { tag: "technical / precise", key: "science" },
      { tag: "sonic / expressive", key: "music" },
    ],
  },
  next: {
    title: "What I want to do",
    body: [
      "Research. I want to work on AI itself, not only use the tools other people build.",
      "Then apply it somewhere that matters. Medicine, music, or a field I haven't run into yet. I don't know which one, and I would rather say that than invent a five year plan.",
      "Keep building things from scratch while I work it out. A matrix library in C, a search engine down to the dot product, a network you can watch think. If I can't rebuild it, I don't understand it.",
    ],
  },
  contact: {
    title: "Let's talk",
    subtitle: "where sound meets code.",
    cta: { linkedin: "LinkedIn", github: "GitHub", email: "Email", cv: "Download CV" },
  },
  music: {
    title: "Music & Sound",
    lead: "I worked in sound for four years before I wrote any code.",
    hint: "scroll to spin",
    sets: {
      title: "Sets",
      dj: "DJ set",
      radio: "Radio set",
      radioStation: "Amplitudes Radio · Bordeaux",
      video: "Video",
      // Shown until a file lands at public/audio/amplitudes-radio.mp3.
      radioPlaceholder: "Amplitudes Radio set goes here",
    },
    // Floating deck control (spins the record; does not drive real audio).
    spin: "spin the deck",
    spinning: "spinning",
    play: "Spin",
    pause: "Stop",
    credits: {
      title: "Credentials",
      items: [
        { place: "Fabric London", role: "Sound-engineering team", detail: "2 yrs · live sound, a new room and a new crowd every night" },
        { place: "Point Blank", role: "Sound engineering training", detail: "2 yrs · DJing and producing alongside it" },
        { place: "Middlesex University", role: "Music Production & Sound Engineering", detail: "2 yrs · accelerated degree, London" },
      ],
    },
    outro: {
      title: "The ear came first",
      body: "Mixing taught me to listen for what is actually there instead of what I expected to hear. That is the same habit I use now when a model does something I didn't predict.",
      cta: "Back to the machine",
    },
  },
  science: {
    title: "Science & AI",
    lead: "What I'm studying, what I've built, and what I'm still working out.",
    hint: "scroll to reorganise",


    projects: {
      title: "Projects",
      repo: "Repo",
      demo: "Live",
      entries: {
        nn3d: {
          title: "neural-network-numbers",
          blurb: "A neural network built from scratch that reads hand drawn digits, wired to a 3D visualisation. You draw a number and watch the activations move through the layers.",
        },
        harp: {
          title: "air-harp",
          blurb: "An instrument you play in the air. MediaPipe tracks your fingertip through the webcam, virtual strings hang in the frame, and crossing one plucks it. Multi channel audio, so notes overlap properly.",
        },
        mlc: {
          title: "ML_library",
          blurb: "A machine learning and matrix library in pure C. Matrix operations, ReLU and sigmoid, dense layers, forward propagation and MSE loss, with nothing underneath it but the language.",
        },
        vec: {
          title: "vector-search-engine",
          blurb: "A semantic search engine written from the linear algebra up. 384 dimensional BERT embeddings, normalised so that retrieval is one matrix multiply, behind a FastAPI service.",
        },
        paper: {
          title: "MLP-article",
          blurb: "An academic paper in LaTeX on multilayer networks. The perceptron and the XOR limit, universal approximation, the chain rule, SGD and Adam, then overfitting and how to fight it. Written in English and French.",
        },
        agent: {
          title: "omni-analyst",
          blurb: "An agentic analyst built on the Mistral SDK. It takes a question, searches the live web, writes and runs its own Python to chart what it finds, then writes the report.",
        },
      },
    },

    education: {
      title: "Education",
      coursework: "Coursework",
      entries: {
        saclay: {
          place: "Université Paris-Saclay",
          location: "Paris · FR",
          programme: "M1 — Data, Knowledge & Hybrid AI (DKAI)",
          // Written from the official programme page (linked on the entry).
          detail:
            "A two year programme combining data science and artificial intelligence, taught entirely in English. It covers machine learning and big data alongside the different paradigms of AI, from symbolic and agent-based through to hybrid and generative, with projects, challenges and internships in research labs or industry.",
          coursework:
            "Foundations of knowledge graphs, mathematics for data science, machine learning, deep learning, large-scale data management and data quality, distributed query processing, constraint programming, algorithmic foundations of data mining, agent-based systems, interactive information visualisation, trustworthy AI.",
        },
        amuMaths: {
          place: "Aix-Marseille Université",
          location: "Marseille · FR",
          programme: "Bachelor of Science — Mathematics",
          coursework:
            "Euclidean spaces & geometry, group theory, multivariable calculus & differential equations, topology, Fourier & power series, Markov chains, inferential statistics, numerical analysis.",
        },
        amu: {
          place: "Aix-Marseille Université",
          location: "Marseille · FR",
          programme: "Bachelor of Science — Mathematics & Computer Science",
          detail:
            "I went back to the fundamentals because I wanted to know how a computer actually works. I stayed for the whole degree.",
          coursework:
            "Mathematical logic, real analysis (sequences, series, Riemann integration), linear algebra & endomorphism reduction, probability theory, algorithms & data structures, automata & formal languages, databases, compilation, computability theory, operating systems, Bash scripting, natural language processing.",
        },
        middlesex: {
          place: "Middlesex University",
          location: "London · UK",
          programme: "BA (Hons) Music Production & Sound Engineering",
          detail: "A two year accelerated degree at Point Blank, validated by Middlesex.",
        },
      },
    },

    focus: {
      title: "What I'm working toward",
      entries: {
        research: {
          title: "Research",
          body: "I want to work on AI itself, not only use the tools other people build. That means going deep enough to add something rather than assembling what already exists.",
        },
        applied: {
          title: "Applied to something real",
          body: "Medicine, music, or a field I haven't run into yet. I genuinely don't know which one yet and I'm still figuring it out. I would rather say that than pretend I have had a plan since I was twelve.",
        },
        curious: {
          title: "Curiosity, mostly",
          body: "This is the real reason for the pile of degrees. I get interested in something, start taking it apart, and end up studying it properly. Sound engineering went that way, then maths, then AI. I expect the next one will too.",
        },
      },
    },

    outro: {
      title: "No black boxes",
      body: "If I use something I want to know why it works, and I want to be able to show you. That is most of what I am doing here.",
      cta: "Back to the machine",
    },
  },
};

const fr = {
  locale: "fr",
  nav: {
    about: "À propos",
    work: "Ce que je fais",
    next: "La suite",
    contact: "Contact",
    cv: "CV",
  },
  loader: {
    booting: "Initialisation",
    ready: "Appuyez sur une touche",
  },
  intro: [
    "SASHA-OS v1.0",
    "",
    "> whoami",
    "SASHA SUTTON",
    "M1 · Data, Knowledge & Hybrid AI",
    "Université Paris-Saclay",
    "Data science & IA",
    "Producteur de musique_",
  ],
  introCompact: [
    "SASHA-OS v1.0",
    "> whoami",
    "SASHA SUTTON",
    "M1 DKAI — Paris-Saclay",
    "Data science & IA",
    "Producteur de musique_",
  ],
  hero: {
    title: "Sasha Sutton",
    tagline: "Data science & IA",
    hint: "faites défiler pour explorer",
    pick: "choisissez un programme",
  },
  programs: {
    science: {
      label: "Science & IA",
      blurb:
        "M1 Data, Knowledge & Hybrid AI à Paris-Saclay. Recherche, data science et projets d'IA.",
    },
    music: {
      label: "Musique & Son",
      blurb:
        "Middlesex University & Fabric London. Ingénieur du son, DJ et producteur.",
    },
  },
  about: {
    title: "À propos",
    lead: "Je fais un master en IA. Avant ça, j'ai passé quatre ans dans le son à Londres.",
    body: [
      "Je suis né à Udon Thani, en Thaïlande, et j'ai grandi entre le Laos, la campagne française, le Sénégal et Bordeaux. Je vis à Paris aujourd'hui.",
      "La musique est venue en premier. Deux ans à Point Blank pour me former à l'ingénierie du son, deux ans dans l'équipe son de Fabric, et un cursus accéléré de deux ans à Middlesex. J'étais bien là-dedans. Ce qui me gênait, c'est que je savais me servir des outils sans savoir comment ils marchaient.",
      "Je suis donc retourné étudier les maths et l'informatique pour le comprendre. C'est le schéma, en fait. Quelque chose m'intrigue, je commence à le démonter, et je finis par en faire un diplôme entier. C'est la raison pour laquelle j'en ai accumulé autant.",
      "Je suis maintenant en première année de master Data, Knowledge and Hybrid AI à Paris-Saclay, sur le TAL et la vision par ordinateur. Je mixe et je produis toujours.",
    ],
    quote:
      "Si je me sers de quelque chose, je veux savoir pourquoi ça marche. Sinon je ne fais que lui faire confiance.",
    portraitAlt: "Sasha Sutton",
  },
  work: {
    title: "Ce que je fais",
    lenses: [
      { tag: "technique / précis", key: "science" },
      { tag: "sonore / expressif", key: "music" },
    ],
  },
  next: {
    title: "Ce que je veux faire",
    body: [
      "La recherche. Je veux travailler sur l'IA elle-même, pas seulement utiliser les outils que d'autres construisent.",
      "Puis l'appliquer à quelque chose d'utile. La médecine, la musique, ou un domaine que je n'ai pas encore croisé. Je ne sais pas encore lequel, et je préfère le dire plutôt que d'inventer un plan sur cinq ans.",
      "Continuer à construire depuis les fondations en attendant. Une bibliothèque matricielle en C, un moteur de recherche jusqu'au produit scalaire, un réseau qu'on peut regarder penser. Si je ne peux pas le reconstruire, je ne le comprends pas.",
    ],
  },
  contact: {
    title: "On en parle",
    subtitle: "là où le son rencontre le code.",
    cta: { linkedin: "LinkedIn", github: "GitHub", email: "Email", cv: "Télécharger le CV" },
  },
  music: {
    title: "Musique & Son",
    lead: "J'ai travaillé dans le son pendant quatre ans avant d'écrire la moindre ligne de code.",
    hint: "faites défiler pour faire tourner",
    sets: {
      title: "Sets",
      dj: "DJ set",
      radio: "Radio set",
      radioStation: "Amplitudes Radio · Bordeaux",
      video: "Vidéo",
      radioPlaceholder: "le set Amplitudes Radio ira ici",
    },
    spin: "faire tourner",
    spinning: "en rotation",
    play: "Tourner",
    pause: "Arrêter",
    credits: {
      title: "Parcours",
      items: [
        { place: "Fabric London", role: "Équipe son", detail: "2 ans · son live, une nouvelle salle et un nouveau public chaque soir" },
        { place: "Point Blank", role: "Formation ingénierie du son", detail: "2 ans · DJing et production en parallèle" },
        { place: "Middlesex University", role: "Production musicale & ingénierie du son", detail: "2 ans · cursus accéléré, Londres" },
      ],
    },
    outro: {
      title: "L'oreille d'abord",
      body: "Le mixage m'a appris à écouter ce qui est vraiment là plutôt que ce que je m'attendais à entendre. C'est le même réflexe que j'utilise maintenant quand un modèle fait quelque chose que je n'avais pas prévu.",
      cta: "Retour à la machine",
    },
  },
  science: {
    title: "Science & IA",
    lead: "Ce que j'étudie, ce que j'ai construit, et ce que je cherche encore.",
    hint: "faites défiler pour réorganiser",


    projects: {
      title: "Projets",
      repo: "Dépôt",
      demo: "En ligne",
      entries: {
        nn3d: {
          title: "neural-network-numbers",
          blurb: "Un réseau de neurones construit de zéro qui lit des chiffres manuscrits, relié à une visualisation 3D. Vous dessinez un chiffre et vous regardez les activations traverser les couches.",
        },
        harp: {
          title: "air-harp",
          blurb: "Un instrument qui se joue en l'air. MediaPipe suit le bout du doigt via la webcam, des cordes virtuelles flottent dans l'image, et les franchir les pince. Audio multicanal, pour que les notes se superposent correctement.",
        },
        mlc: {
          title: "ML_library",
          blurb: "Une bibliothèque d'apprentissage automatique et de calcul matriciel en C pur. Opérations sur les matrices, ReLU et sigmoïde, couches denses, propagation avant et erreur quadratique, sans rien d'autre que le langage en dessous.",
        },
        vec: {
          title: "vector-search-engine",
          blurb: "Un moteur de recherche sémantique écrit à partir de l'algèbre linéaire. Des embeddings BERT en 384 dimensions, normalisés pour que la recherche tienne en un produit matriciel, derrière un service FastAPI.",
        },
        paper: {
          title: "MLP-article",
          blurb: "Un article académique en LaTeX sur les réseaux multicouches. Le perceptron et la limite du XOR, l'approximation universelle, la règle de la chaîne, SGD et Adam, puis le surapprentissage et comment le combattre. Écrit en anglais et en français.",
        },
        agent: {
          title: "omni-analyst",
          blurb: "Un analyste agentique construit sur le SDK Mistral. Il prend une question, cherche sur le web en direct, écrit et exécute son propre code Python pour représenter ce qu'il trouve, puis rédige le rapport.",
        },
      },
    },

    education: {
      title: "Formation",
      coursework: "Enseignements",
      entries: {
        saclay: {
          place: "Université Paris-Saclay",
          location: "Paris · FR",
          programme: "M1 — Data, Knowledge & Hybrid AI (DKAI)",
          detail:
            "Un programme sur deux ans qui associe science des données et intelligence artificielle, entièrement enseigné en anglais. Il couvre l'apprentissage automatique et le big data ainsi que les différents paradigmes de l'IA, du symbolique et des systèmes multi-agents jusqu'à l'IA hybride et générative, avec des projets, des challenges et des stages en laboratoire ou en entreprise.",
          coursework:
            "Graphes de connaissances, mathématiques pour la science des données, apprentissage automatique, apprentissage profond, gestion de données à grande échelle et qualité des données, traitement distribué de requêtes, programmation par contraintes, fondements algorithmiques de la fouille de données, systèmes multi-agents, visualisation interactive, IA de confiance.",
        },
        amuMaths: {
          place: "Aix-Marseille Université",
          location: "Marseille · FR",
          programme: "Licence — Mathématiques",
          coursework:
            "Espaces euclidiens & géométrie, théorie des groupes, calcul différentiel à plusieurs variables & équations différentielles, topologie, séries de Fourier & séries entières, chaînes de Markov, statistique inférentielle, analyse numérique.",
        },
        amu: {
          place: "Aix-Marseille Université",
          location: "Marseille · FR",
          programme: "Licence — Mathématiques & Informatique",
          detail:
            "Je suis revenu aux fondamentaux parce que je voulais savoir comment fonctionne vraiment un ordinateur. J'y suis resté pour toute la licence.",
          coursework:
            "Logique mathématique, analyse réelle (suites, séries, intégration de Riemann), algèbre linéaire & réduction des endomorphismes, probabilités, algorithmique & structures de données, automates & langages formels, bases de données, compilation, calculabilité, systèmes d'exploitation, scripting Bash, traitement automatique du langage.",
        },
        middlesex: {
          place: "Middlesex University",
          location: "Londres · UK",
          programme: "BA (Hons) Music Production & Sound Engineering",
          detail: "Un cursus accéléré de deux ans à Point Blank, validé par Middlesex.",
        },
      },
    },

    focus: {
      title: "Ce vers quoi je travaille",
      entries: {
        research: {
          title: "La recherche",
          body: "Je veux travailler sur l'IA elle-même, pas seulement utiliser les outils que d'autres construisent. Ça veut dire aller assez loin pour apporter quelque chose plutôt que d'assembler ce qui existe déjà.",
        },
        applied: {
          title: "Appliquée à quelque chose de réel",
          body: "La médecine, la musique, ou un domaine que je n'ai pas encore croisé. Je ne sais sincèrement pas encore lequel et je suis toujours en train d'y réfléchir. Je préfère le dire plutôt que de faire croire que j'ai un plan depuis mes douze ans.",
        },
        curious: {
          title: "La curiosité, surtout",
          body: "C'est la vraie raison de la pile de diplômes. Quelque chose m'intrigue, je commence à le démonter, et je finis par l'étudier pour de bon. L'ingénierie du son s'est passée comme ça, puis les maths, puis l'IA. Je pense que la prochaine fois aussi.",
        },
      },
    },

    outro: {
      title: "Pas de boîtes noires",
      body: "Si je me sers de quelque chose, je veux savoir pourquoi ça marche, et pouvoir vous le montrer. C'est l'essentiel de ce que je fais ici.",
      cta: "Retour à la machine",
    },
  },
};

export const content = { en, fr };
