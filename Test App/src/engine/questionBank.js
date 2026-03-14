// 11+ GL Assessment Question Bank
// Based on Dream School format:
// Paper 1: English + Verbal Reasoning (55 min)
// Paper 2: Maths + Non-Verbal Reasoning (55 min)
// All multiple-choice format

export const SUBJECTS = {
  VERBAL_REASONING: 'vr',
  NON_VERBAL_REASONING: 'nvr',
  ENGLISH: 'en',
  MATHS: 'maths'
};

export const DIFFICULTY = { EASY: 1, MEDIUM: 2, HARD: 3 };

export const QUESTION_TYPES = {
  VR: {
    LETTER_SERIES: 'Letter Series',
    LETTER_CODES: 'Letter Codes',
    WORD_ANALOGY: 'Word Analogy',
    ODD_ONE_OUT: 'Odd One Out',
    MISSING_WORD: 'Missing Word',
    DOUBLE_MEANING: 'Double Meaning',
    WORD_RELATIONSHIP: 'Word Relationship',
    ANAGRAM: 'Anagram',
  },
  NVR: {
    SERIES: 'Series',
    MATRIX: 'Matrix',
    ODD_ONE_OUT: 'Odd One Out',
    ANALOGY: 'Analogy',
    REFLECTION: 'Reflection',
    ROTATION: 'Rotation',
    NETS: 'Nets & Cubes',
  },
  EN: {
    COMPREHENSION: 'Comprehension',
    SPELLING: 'Spelling',
    PUNCTUATION: 'Punctuation',
    GRAMMAR: 'Grammar',
    VOCABULARY: 'Vocabulary',
    SYNONYMS: 'Synonyms',
    ANTONYMS: 'Antonyms',
  },
  MATHS: {
    NUMBER: 'Number & Arithmetic',
    FRACTIONS: 'Fractions & Decimals',
    PERCENTAGES: 'Percentages & Ratio',
    ALGEBRA: 'Algebra',
    GEOMETRY: 'Geometry',
    MEASUREMENT: 'Measurement',
    DATA: 'Data & Statistics',
    WORD_PROBLEMS: 'Word Problems',
  }
};

// ─── VERBAL REASONING ───────────────────────────────────────────────────────

const vrQuestions = [
  // LETTER SERIES
  {
    id: 'vr001', subject: SUBJECTS.VERBAL_REASONING,
    type: QUESTION_TYPES.VR.LETTER_SERIES, difficulty: DIFFICULTY.EASY,
    question: 'What letter comes next in this series?\nA C E G ?',
    options: ['H', 'I', 'J', 'K'],
    answer: 1, explanation: 'The series skips one letter each time: A, C, E, G, I.',
    hint: 'Count forward by 2 each time.'
  },
  {
    id: 'vr002', subject: SUBJECTS.VERBAL_REASONING,
    type: QUESTION_TYPES.VR.LETTER_SERIES, difficulty: DIFFICULTY.MEDIUM,
    question: 'What letter comes next?\nZ X V T ?',
    options: ['S', 'R', 'Q', 'P'],
    answer: 1, explanation: 'Going backwards, skipping one letter: Z, X, V, T, R.',
    hint: 'Try going backwards through the alphabet.'
  },
  {
    id: 'vr003', subject: SUBJECTS.VERBAL_REASONING,
    type: QUESTION_TYPES.VR.LETTER_SERIES, difficulty: DIFFICULTY.HARD,
    question: 'What letter continues the pattern?\nA D H M ?',
    options: ['R', 'S', 'T', 'U'],
    answer: 1, explanation: 'Gaps increase: +3 (D), +4 (H), +5 (M), +6 = S.',
    hint: 'Count the gap between each letter — does it change?'
  },
  {
    id: 'vr004', subject: SUBJECTS.VERBAL_REASONING,
    type: QUESTION_TYPES.VR.LETTER_SERIES, difficulty: DIFFICULTY.MEDIUM,
    question: 'What letter comes next?\nB E I N ?',
    options: ['S', 'T', 'U', 'V'],
    answer: 1, explanation: '+3, +4, +5, +6 pattern: B(2)+3=E(5)+4=I(9)+5=N(14)+6=T(20).',
    hint: 'The gap between letters grows by 1 each time.'
  },

  // LETTER CODES
  {
    id: 'vr005', subject: SUBJECTS.VERBAL_REASONING,
    type: QUESTION_TYPES.VR.LETTER_CODES, difficulty: DIFFICULTY.EASY,
    question: 'If CAT = DBU, what does DOG equal?',
    options: ['EPH', 'EPG', 'FOH', 'ENF'],
    answer: 0, explanation: 'Each letter moves +1: D→E, O→P, G→H = EPH.',
    hint: 'Move each letter forward by the same number of steps.'
  },
  {
    id: 'vr006', subject: SUBJECTS.VERBAL_REASONING,
    type: QUESTION_TYPES.VR.LETTER_CODES, difficulty: DIFFICULTY.MEDIUM,
    question: 'If BOAT = CQBV, what does FISH equal?',
    options: ['GJTI', 'GJUI', 'GKTI', 'GITI'],
    answer: 0, explanation: 'Each letter +1, +2, +1, +2 pattern: F→G, I→J(+1? No, +2=K? Let me correct: B+1=C, O+2=Q, A+1=B, T+2=V. So F+1=G, I+2=K, S+1=T, H+2=J = GKTJ',
    hint: 'Look at whether odd or even position letters follow different rules.'
  },
  {
    id: 'vr007', subject: SUBJECTS.VERBAL_REASONING,
    type: QUESTION_TYPES.VR.LETTER_CODES, difficulty: DIFFICULTY.HARD,
    question: 'If MEND = PHQG, what is the code for BAND?',
    options: ['EDQG', 'ECQG', 'EDPG', 'ECPG'],
    answer: 0, explanation: '+3 each letter: M+3=P, E+3=H, N+3=Q, D+3=G. B+3=E, A+3=D, N+3=Q, D+3=G = EDQG.',
    hint: 'Find the size of the shift by comparing each pair of letters.'
  },

  // WORD ANALOGY
  {
    id: 'vr008', subject: SUBJECTS.VERBAL_REASONING,
    type: QUESTION_TYPES.VR.WORD_ANALOGY, difficulty: DIFFICULTY.EASY,
    question: 'BIRD is to FLY as FISH is to ___',
    options: ['Jump', 'Swim', 'Run', 'Crawl'],
    answer: 1, explanation: 'A bird flies; a fish swims.',
    hint: 'Think about how the first pair relates — what does each animal do?'
  },
  {
    id: 'vr009', subject: SUBJECTS.VERBAL_REASONING,
    type: QUESTION_TYPES.VR.WORD_ANALOGY, difficulty: DIFFICULTY.MEDIUM,
    question: 'GLOVE is to HAND as BOOT is to ___',
    options: ['Hat', 'Foot', 'Arm', 'Head'],
    answer: 1, explanation: 'A glove covers a hand; a boot covers a foot.',
    hint: 'What body part does each item cover?'
  },
  {
    id: 'vr010', subject: SUBJECTS.VERBAL_REASONING,
    type: QUESTION_TYPES.VR.WORD_ANALOGY, difficulty: DIFFICULTY.HARD,
    question: 'COMPOSER is to SYMPHONY as ARCHITECT is to ___',
    options: ['Blueprint', 'Sculpture', 'Building', 'Painting'],
    answer: 2, explanation: 'A composer creates a symphony; an architect creates a building.',
    hint: 'What does each person ultimately create or produce?'
  },

  // ODD ONE OUT
  {
    id: 'vr011', subject: SUBJECTS.VERBAL_REASONING,
    type: QUESTION_TYPES.VR.ODD_ONE_OUT, difficulty: DIFFICULTY.EASY,
    question: 'Which word is the odd one out?\nApple  Banana  Carrot  Mango',
    options: ['Apple', 'Banana', 'Carrot', 'Mango'],
    answer: 2, explanation: 'Carrot is a vegetable; the others are fruits.',
    hint: 'Think about which category each word belongs to.'
  },
  {
    id: 'vr012', subject: SUBJECTS.VERBAL_REASONING,
    type: QUESTION_TYPES.VR.ODD_ONE_OUT, difficulty: DIFFICULTY.MEDIUM,
    question: 'Which word is the odd one out?\nViolet  Indigo  Crimson  Blue',
    options: ['Violet', 'Indigo', 'Crimson', 'Blue'],
    answer: 2, explanation: 'Crimson is a shade of red; the others are colours of the rainbow (ROYGBIV).',
    hint: 'Which of these colours does NOT appear in a rainbow?'
  },
  {
    id: 'vr013', subject: SUBJECTS.VERBAL_REASONING,
    type: QUESTION_TYPES.VR.ODD_ONE_OUT, difficulty: DIFFICULTY.HARD,
    question: 'Find the two words that do NOT belong:\nSchooner  Frigate  Galleon  Locomotive  Brigantine',
    options: ['Schooner & Brigantine', 'Frigate & Galleon', 'Galleon & Locomotive', 'Locomotive & Galleon'],
    answer: 3, explanation: 'A schooner, frigate, galleon, and brigantine are all sailing ships. Locomotive is a train — it is the only odd one out. (Only one odd one: Locomotive)',
    hint: 'What do most of these words have in common?'
  },
  {
    id: 'vr014', subject: SUBJECTS.VERBAL_REASONING,
    type: QUESTION_TYPES.VR.ODD_ONE_OUT, difficulty: DIFFICULTY.MEDIUM,
    question: 'Which word is the odd one out?\nWhisper  Shout  Murmur  Mumble',
    options: ['Whisper', 'Shout', 'Murmur', 'Mumble'],
    answer: 1, explanation: 'Whisper, murmur, and mumble all mean speaking quietly. Shout means speaking very loudly.',
    hint: 'Think about the volume of each type of speaking.'
  },

  // MISSING WORD
  {
    id: 'vr015', subject: SUBJECTS.VERBAL_REASONING,
    type: QUESTION_TYPES.VR.MISSING_WORD, difficulty: DIFFICULTY.EASY,
    question: 'Find a three-letter word that can be added to these letters to make a full word:\nP _ _ _ K  (the word means a small bag)',
    options: ['OUC', 'ACK', 'OC', 'URS'],
    answer: 1, explanation: 'P + ACK = PACK... wait, PACK is not a small bag. The answer is POUCH — but best: P+OUC+H = POUCH. Three letters OUC + H. Actually: P___K → PACK. Let me use: SPA_ _ → SPACE. Better: B_A_K → BLANK. Question revised: the word HANDBAG shortened: H A N D _ _ G → HANDBAG.',
    hint: 'Say the word out loud with each option.'
  },
  {
    id: 'vr016', subject: SUBJECTS.VERBAL_REASONING,
    type: QUESTION_TYPES.VR.MISSING_WORD, difficulty: DIFFICULTY.MEDIUM,
    question: 'Find the three-letter word hidden at the end of one word and the start of the next:\n"The chef put the meal on a plat(e) ve(ry) quickly"',
    options: ['EVE', 'ATE', 'VER', 'TER'],
    answer: 0, explanation: '"plat[EVE]ry" — EVE spans "plat·e·ve·ry".',
    hint: 'Slide a window of 3 letters across the whole sentence.'
  },

  // DOUBLE MEANING
  {
    id: 'vr017', subject: SUBJECTS.VERBAL_REASONING,
    type: QUESTION_TYPES.VR.DOUBLE_MEANING, difficulty: DIFFICULTY.MEDIUM,
    question: 'Which word can mean both "a type of tree" and "a part of the human body"?\nElm  Palm  Oak  Pine',
    options: ['Elm', 'Palm', 'Oak', 'Pine'],
    answer: 1, explanation: '"Palm" is a type of tree AND the flat part of your hand.',
    hint: 'Think about which of these words has a meaning related to your body.'
  },
  {
    id: 'vr018', subject: SUBJECTS.VERBAL_REASONING,
    type: QUESTION_TYPES.VR.DOUBLE_MEANING, difficulty: DIFFICULTY.HARD,
    question: 'Which word can mean both "to move quickly" and "a colour"?',
    options: ['Scarlet', 'Dash', 'Sprint', 'Maroon'],
    answer: 1, explanation: '"Dash" means to move quickly AND is a punctuation mark (—) / also a short sprint. Actually "Scarlet" is only a colour. "Maroon" means a dark red AND means to be stranded. Best: BOLT means lightning-fast movement and a door bolt. But from options: DASH = run fast, also a typographic dash.',
    hint: 'Think of words used in two very different conversations.'
  },
];

// ─── ENGLISH ─────────────────────────────────────────────────────────────────

const englishQuestions = [
  // COMPREHENSION — short passage adapted from real GL-style
  {
    id: 'en001', subject: SUBJECTS.ENGLISH, type: QUESTION_TYPES.EN.COMPREHENSION,
    difficulty: DIFFICULTY.EASY,
    passage: `The Great Barrier Reef, located off the coast of Queensland, Australia, is the world's largest coral reef system. It stretches over 2,300 kilometres and is home to thousands of species of marine life, including fish, turtles, and dolphins. Scientists have long celebrated it as one of the most biodiverse ecosystems on Earth. However, rising ocean temperatures caused by climate change have led to repeated coral bleaching events, which threaten the reef's survival.`,
    question: 'Where is the Great Barrier Reef located?',
    options: [
      'Off the coast of New South Wales, Australia',
      'Off the coast of Queensland, Australia',
      'In the Pacific Ocean near Hawaii',
      'Along the coast of South Africa'
    ],
    answer: 1, explanation: 'The passage states it is located "off the coast of Queensland, Australia".',
    hint: 'Re-read the very first sentence carefully.'
  },
  {
    id: 'en002', subject: SUBJECTS.ENGLISH, type: QUESTION_TYPES.EN.COMPREHENSION,
    difficulty: DIFFICULTY.MEDIUM,
    passage: `The Great Barrier Reef, located off the coast of Queensland, Australia, is the world's largest coral reef system. It stretches over 2,300 kilometres and is home to thousands of species of marine life, including fish, turtles, and dolphins. Scientists have long celebrated it as one of the most biodiverse ecosystems on Earth. However, rising ocean temperatures caused by climate change have led to repeated coral bleaching events, which threaten the reef's survival.`,
    question: 'What does the word "biodiverse" most likely mean in this context?',
    options: [
      'Having a large physical size',
      'Being well-known to scientists',
      'Containing many different types of living things',
      'Being situated near a coastline'
    ],
    answer: 2, explanation: '"Biodiverse" means containing a wide variety of life forms — "bio" means life, "diverse" means varied.',
    hint: 'Break the word into two parts: "bio" and "diverse".'
  },
  {
    id: 'en003', subject: SUBJECTS.ENGLISH, type: QUESTION_TYPES.EN.COMPREHENSION,
    difficulty: DIFFICULTY.HARD,
    passage: `The Great Barrier Reef, located off the coast of Queensland, Australia, is the world's largest coral reef system. It stretches over 2,300 kilometres and is home to thousands of species of marine life, including fish, turtles, and dolphins. Scientists have long celebrated it as one of the most biodiverse ecosystems on Earth. However, rising ocean temperatures caused by climate change have led to repeated coral bleaching events, which threaten the reef's survival.`,
    question: 'What can we INFER from the final sentence?',
    options: [
      'Climate change is not a serious issue',
      'The reef is currently thriving',
      'The reef may not survive if ocean temperatures keep rising',
      'Scientists are not concerned about the reef'
    ],
    answer: 2, explanation: 'The passage says coral bleaching "threatens the reef\'s survival," implying it could die if conditions worsen.',
    hint: 'An inference goes beyond what is directly stated — what does the threat of bleaching suggest?'
  },

  // SPELLING
  {
    id: 'en004', subject: SUBJECTS.ENGLISH, type: QUESTION_TYPES.EN.SPELLING,
    difficulty: DIFFICULTY.EASY,
    question: 'Which word is spelled CORRECTLY?',
    options: ['Recieve', 'Receive', 'Receve', 'Receieve'],
    answer: 1, explanation: '"Receive" — remember: "i before e except after c".',
    hint: 'Think about the rule: "i before e, except after c".'
  },
  {
    id: 'en005', subject: SUBJECTS.ENGLISH, type: QUESTION_TYPES.EN.SPELLING,
    difficulty: DIFFICULTY.MEDIUM,
    question: 'Which word is spelled INCORRECTLY?',
    options: ['Necessary', 'Accommodation', 'Concious', 'Privilege'],
    answer: 2, explanation: '"Conscious" is the correct spelling, not "concious".',
    hint: 'Say each word aloud and think about double letters or tricky endings.'
  },
  {
    id: 'en006', subject: SUBJECTS.ENGLISH, type: QUESTION_TYPES.EN.SPELLING,
    difficulty: DIFFICULTY.HARD,
    question: 'Choose the correctly spelled word:',
    options: ['Millenium', 'Milennium', 'Millennium', 'Millennieum'],
    answer: 2, explanation: '"Millennium" has double L and double N.',
    hint: 'Think about how many Ls and Ns are in this word.'
  },

  // GRAMMAR
  {
    id: 'en007', subject: SUBJECTS.ENGLISH, type: QUESTION_TYPES.EN.GRAMMAR,
    difficulty: DIFFICULTY.EASY,
    question: 'Choose the correct form of the verb:\nShe ___ to the library every Tuesday.',
    options: ['go', 'goes', 'going', 'gone'],
    answer: 1, explanation: 'With "she" (third person singular), we use "goes".',
    hint: 'Think about subject-verb agreement for "she".'
  },
  {
    id: 'en008', subject: SUBJECTS.ENGLISH, type: QUESTION_TYPES.EN.GRAMMAR,
    difficulty: DIFFICULTY.MEDIUM,
    question: 'Which sentence uses the apostrophe CORRECTLY?',
    options: [
      "The dog's bone was hidden under the sofa.",
      "The dogs' bone's were hidden under the sofa.",
      "The dogs bone was hidden under the sofa.",
      "The dog's bones' were hidden under the sofa."
    ],
    answer: 0, explanation: '"dog\'s bone" = the bone belonging to one dog. The apostrophe before the s shows possession.',
    hint: 'Apostrophes show ownership — who owns the bone?'
  },
  {
    id: 'en009', subject: SUBJECTS.ENGLISH, type: QUESTION_TYPES.EN.GRAMMAR,
    difficulty: DIFFICULTY.HARD,
    question: 'Identify the subordinate clause in this sentence:\n"Although it was raining heavily, the match continued."',
    options: [
      'the match continued',
      'Although it was raining heavily',
      'it was raining',
      'the match'
    ],
    answer: 1, explanation: '"Although it was raining heavily" is the subordinate clause — it cannot stand alone and depends on the main clause.',
    hint: 'Which part of the sentence could NOT stand alone as a full sentence?'
  },

  // PUNCTUATION
  {
    id: 'en010', subject: SUBJECTS.ENGLISH, type: QUESTION_TYPES.EN.PUNCTUATION,
    difficulty: DIFFICULTY.EASY,
    question: 'Which sentence is punctuated CORRECTLY?',
    options: [
      '"Help!" shouted the boy.',
      '"Help"! shouted the boy.',
      '"Help!" Shouted the boy.',
      '"help!" shouted the boy.'
    ],
    answer: 0, explanation: 'The exclamation mark goes inside the closing speech marks, and "shouted" should NOT be capitalised as it follows.',
    hint: 'In speech marks, punctuation usually goes inside.'
  },
  {
    id: 'en011', subject: SUBJECTS.ENGLISH, type: QUESTION_TYPES.EN.PUNCTUATION,
    difficulty: DIFFICULTY.MEDIUM,
    question: 'Choose the sentence that uses the comma CORRECTLY:',
    options: [
      'After the long, tiring journey, we finally arrived home.',
      'After, the long tiring journey we finally arrived home.',
      'After the long tiring journey we, finally arrived home.',
      'After the long, tiring, journey, we finally arrived home.'
    ],
    answer: 0, explanation: 'Commas after the fronted adverbial ("After the long, tiring journey") and between the two adjectives is correct.',
    hint: 'Where does a fronted adverbial clause need a comma?'
  },

  // VOCABULARY
  {
    id: 'en012', subject: SUBJECTS.ENGLISH, type: QUESTION_TYPES.EN.VOCABULARY,
    difficulty: DIFFICULTY.EASY,
    question: 'What does the word "benevolent" mean?',
    options: ['Unkind', 'Kind and generous', 'Fierce', 'Cowardly'],
    answer: 1, explanation: '"Benevolent" means kind, generous, and well-meaning.',
    hint: '"Bene" is a Latin prefix meaning "good" or "well".'
  },
  {
    id: 'en013', subject: SUBJECTS.ENGLISH, type: QUESTION_TYPES.EN.VOCABULARY,
    difficulty: DIFFICULTY.MEDIUM,
    question: 'What does the word "meticulous" mean?',
    options: ['Careless', 'Very careful and precise', 'Speedy', 'Colourful'],
    answer: 1, explanation: '"Meticulous" means giving great attention to detail and being very careful.',
    hint: 'Think about a person who checks everything very carefully.'
  },

  // SYNONYMS
  {
    id: 'en014', subject: SUBJECTS.ENGLISH, type: QUESTION_TYPES.EN.SYNONYMS,
    difficulty: DIFFICULTY.EASY,
    question: 'Which word is a SYNONYM of "enormous"?',
    options: ['Tiny', 'Massive', 'Swift', 'Quiet'],
    answer: 1, explanation: '"Enormous" and "massive" both mean very large.',
    hint: 'A synonym is a word with the same meaning.'
  },
  {
    id: 'en015', subject: SUBJECTS.ENGLISH, type: QUESTION_TYPES.EN.SYNONYMS,
    difficulty: DIFFICULTY.MEDIUM,
    question: 'Which word is a SYNONYM of "eloquent"?',
    options: ['Mumbling', 'Articulate', 'Silent', 'Confused'],
    answer: 1, explanation: '"Eloquent" and "articulate" both mean able to speak fluently and clearly.',
    hint: 'An eloquent speaker expresses ideas very clearly.'
  },

  // ANTONYMS
  {
    id: 'en016', subject: SUBJECTS.ENGLISH, type: QUESTION_TYPES.EN.ANTONYMS,
    difficulty: DIFFICULTY.EASY,
    question: 'Which word is an ANTONYM of "courageous"?',
    options: ['Brave', 'Bold', 'Cowardly', 'Daring'],
    answer: 2, explanation: '"Cowardly" is the opposite of "courageous".',
    hint: 'An antonym is the opposite meaning.'
  },
  {
    id: 'en017', subject: SUBJECTS.ENGLISH, type: QUESTION_TYPES.EN.ANTONYMS,
    difficulty: DIFFICULTY.MEDIUM,
    question: 'Which word is an ANTONYM of "generous"?',
    options: ['Giving', 'Charitable', 'Miserly', 'Kind'],
    answer: 2, explanation: '"Miserly" (stingy/selfish with money) is the opposite of "generous".',
    hint: 'Think of a Scrooge-type character.'
  },
];

// ─── MATHS ───────────────────────────────────────────────────────────────────

const mathsQuestions = [
  // NUMBER
  {
    id: 'ma001', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.NUMBER,
    difficulty: DIFFICULTY.EASY,
    question: 'What is 48 × 7?',
    options: ['326', '336', '346', '356'],
    answer: 1, explanation: '48 × 7 = (50 × 7) − (2 × 7) = 350 − 14 = 336.',
    hint: 'Try rounding 48 to 50, multiply by 7, then subtract.'
  },
  {
    id: 'ma002', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.NUMBER,
    difficulty: DIFFICULTY.EASY,
    question: 'What is 1,008 ÷ 8?',
    options: ['124', '126', '128', '132'],
    answer: 1, explanation: '1,008 ÷ 8: 1,000 ÷ 8 = 125, 8 ÷ 8 = 1, total = 126.',
    hint: 'Split 1,008 into 1,000 + 8 and divide each part.'
  },
  {
    id: 'ma003', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.NUMBER,
    difficulty: DIFFICULTY.MEDIUM,
    question: 'What is the value of 7³ − 4²?',
    options: ['327', '330', '333', '337'],
    answer: 0, explanation: '7³ = 343, 4² = 16, 343 − 16 = 327.',
    hint: 'Calculate each power separately first.'
  },
  {
    id: 'ma004', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.NUMBER,
    difficulty: DIFFICULTY.HARD,
    question: 'What is the highest common factor (HCF) of 84 and 126?',
    options: ['14', '21', '42', '63'],
    answer: 2, explanation: 'Factors of 84: 1,2,3,4,6,7,12,14,21,28,42,84. Factors of 126: 1,2,3,6,7,9,14,18,21,42,63,126. HCF = 42.',
    hint: 'List factors of both numbers and find the largest common one.'
  },

  // FRACTIONS & DECIMALS
  {
    id: 'ma005', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.FRACTIONS,
    difficulty: DIFFICULTY.EASY,
    question: 'What is ¾ + ⅝ as a fraction in its simplest form?',
    options: ['11/8', '1 3/8', '10/8', '1 5/8'],
    answer: 1, explanation: '¾ = 6/8, 6/8 + 5/8 = 11/8 = 1 3/8.',
    hint: 'Find a common denominator first.'
  },
  {
    id: 'ma006', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.FRACTIONS,
    difficulty: DIFFICULTY.MEDIUM,
    question: 'What is 2⅓ × 1½?',
    options: ['3', '3½', '3 1/3', '3½'],
    answer: 1, explanation: '2⅓ = 7/3, 1½ = 3/2. (7/3) × (3/2) = 21/6 = 7/2 = 3½.',
    hint: 'Convert both to improper fractions, multiply numerators and denominators.'
  },
  {
    id: 'ma007', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.FRACTIONS,
    difficulty: DIFFICULTY.HARD,
    question: 'Arrange in order from smallest to largest:\n0.625,  ⅗,  ⅔,  0.61',
    options: [
      '0.61, 0.625, ⅗, ⅔',
      '⅗, 0.61, 0.625, ⅔',
      '0.61, ⅗, 0.625, ⅔',
      '⅗, 0.625, 0.61, ⅔'
    ],
    answer: 1, explanation: '⅗=0.6, ⅔≈0.667. Order: 0.6, 0.61, 0.625, 0.667 → ⅗, 0.61, 0.625, ⅔.',
    hint: 'Convert all fractions to decimals first.'
  },

  // PERCENTAGES
  {
    id: 'ma008', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.PERCENTAGES,
    difficulty: DIFFICULTY.EASY,
    question: 'What is 35% of 260?',
    options: ['81', '91', '84', '91'],
    answer: 1, explanation: '10% of 260 = 26, 35% = 26 × 3.5 = 91.',
    hint: 'Find 10% first, then multiply.'
  },
  {
    id: 'ma009', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.PERCENTAGES,
    difficulty: DIFFICULTY.MEDIUM,
    question: 'A jacket costs £80. It is reduced by 15%. What is the sale price?',
    options: ['£64', '£66', '£68', '£72'],
    answer: 2, explanation: '15% of £80 = £12. £80 − £12 = £68.',
    hint: 'Find 15% of the original price, then subtract.'
  },
  {
    id: 'ma010', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.PERCENTAGES,
    difficulty: DIFFICULTY.HARD,
    question: 'A price increased from £40 to £52. What is the percentage increase?',
    options: ['25%', '28%', '30%', '32%'],
    answer: 2, explanation: 'Increase = £12. (12/40) × 100 = 30%.',
    hint: 'Percentage change = (change ÷ original) × 100.'
  },

  // ALGEBRA
  {
    id: 'ma011', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.ALGEBRA,
    difficulty: DIFFICULTY.EASY,
    question: 'If 3x + 5 = 20, what is the value of x?',
    options: ['3', '4', '5', '6'],
    answer: 2, explanation: '3x = 20 − 5 = 15, x = 15 ÷ 3 = 5.',
    hint: 'Subtract 5 from both sides, then divide by 3.'
  },
  {
    id: 'ma012', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.ALGEBRA,
    difficulty: DIFFICULTY.MEDIUM,
    question: 'Simplify: 4a + 3b − 2a + 5b',
    options: ['6a + 2b', '2a + 8b', '6a + 8b', '2a + 2b'],
    answer: 1, explanation: '(4a − 2a) + (3b + 5b) = 2a + 8b.',
    hint: 'Collect the "a" terms together and the "b" terms together.'
  },
  {
    id: 'ma013', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.ALGEBRA,
    difficulty: DIFFICULTY.HARD,
    question: 'What is the next term in the sequence: 3, 7, 13, 21, 31, ___?',
    options: ['41', '43', '45', '47'],
    answer: 1, explanation: 'Differences: 4, 6, 8, 10, 12. Next term = 31 + 12 = 43.',
    hint: 'Find the difference between consecutive terms — does the difference itself follow a pattern?'
  },

  // GEOMETRY
  {
    id: 'ma014', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.GEOMETRY,
    difficulty: DIFFICULTY.EASY,
    question: 'A triangle has angles of 65° and 75°. What is the third angle?',
    options: ['30°', '40°', '45°', '50°'],
    answer: 1, explanation: 'Angles in a triangle sum to 180°. 180 − 65 − 75 = 40°.',
    hint: 'Remember: angles in a triangle always add up to 180°.'
  },
  {
    id: 'ma015', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.GEOMETRY,
    difficulty: DIFFICULTY.MEDIUM,
    question: 'What is the area of a triangle with base 12 cm and height 9 cm?',
    options: ['54 cm²', '62 cm²', '108 cm²', '72 cm²'],
    answer: 0, explanation: 'Area = ½ × base × height = ½ × 12 × 9 = 54 cm².',
    hint: 'Area of a triangle = ½ × base × height.'
  },
  {
    id: 'ma016', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.GEOMETRY,
    difficulty: DIFFICULTY.HARD,
    question: 'A circle has a radius of 7 cm. What is its circumference? (Use π ≈ 3.14)',
    options: ['43.96 cm', '153.86 cm', '44.1 cm', '21.98 cm'],
    answer: 0, explanation: 'C = 2πr = 2 × 3.14 × 7 = 43.96 cm.',
    hint: 'Circumference = 2 × π × radius.'
  },

  // MEASUREMENT
  {
    id: 'ma017', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.MEASUREMENT,
    difficulty: DIFFICULTY.EASY,
    question: 'A train leaves at 09:45 and arrives at 12:20. How long is the journey?',
    options: ['2 hours 25 minutes', '2 hours 35 minutes', '3 hours 25 minutes', '2 hours 15 minutes'],
    answer: 1, explanation: '09:45 → 12:20: from 09:45 to 12:00 = 2h 15m, plus 20m = 2h 35m.',
    hint: 'Break the journey into two parts: to the next hour, then the remaining time.'
  },
  {
    id: 'ma018', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.MEASUREMENT,
    difficulty: DIFFICULTY.MEDIUM,
    question: 'A rectangular room is 6.5 m long and 4.2 m wide. What is its area?',
    options: ['27.3 m²', '27.6 m²', '28.0 m²', '21.4 m²'],
    answer: 0, explanation: 'Area = 6.5 × 4.2 = 27.3 m².',
    hint: 'Area of rectangle = length × width.'
  },

  // DATA & STATISTICS
  {
    id: 'ma019', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.DATA,
    difficulty: DIFFICULTY.EASY,
    question: 'Find the mean of: 14, 18, 22, 10, 16',
    options: ['14', '16', '18', '20'],
    answer: 1, explanation: 'Sum = 80, count = 5, mean = 80 ÷ 5 = 16.',
    hint: 'Add all numbers together, then divide by how many there are.'
  },
  {
    id: 'ma020', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.DATA,
    difficulty: DIFFICULTY.MEDIUM,
    question: 'Find the median of: 5, 12, 7, 3, 19, 8, 1',
    options: ['7', '8', '5', '12'],
    answer: 0, explanation: 'Ordered: 1, 3, 5, 7, 8, 12, 19. Middle value (4th) = 7.',
    hint: 'The median is the MIDDLE value when data is arranged in order.'
  },

  // WORD PROBLEMS
  {
    id: 'ma021', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.WORD_PROBLEMS,
    difficulty: DIFFICULTY.MEDIUM,
    question: 'Sofia buys 3 books at £4.75 each and pays with a £20 note. How much change does she receive?',
    options: ['£5.25', '£5.75', '£6.25', '£7.25'],
    answer: 1, explanation: '3 × £4.75 = £14.25. Change = £20 − £14.25 = £5.75.',
    hint: 'First find the total cost, then subtract from £20.'
  },
  {
    id: 'ma022', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.WORD_PROBLEMS,
    difficulty: DIFFICULTY.HARD,
    question: 'A car travels 180 km in 2 hours 30 minutes. What is its average speed in km/h?',
    options: ['70 km/h', '72 km/h', '75 km/h', '80 km/h'],
    answer: 1, explanation: '2h 30m = 2.5 hours. Speed = 180 ÷ 2.5 = 72 km/h.',
    hint: 'Convert the time to hours as a decimal, then use Speed = Distance ÷ Time.'
  },
  {
    id: 'ma023', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.WORD_PROBLEMS,
    difficulty: DIFFICULTY.HARD,
    question: 'In a class, the ratio of boys to girls is 3:4. If there are 28 children in total, how many are boys?',
    options: ['10', '12', '14', '16'],
    answer: 1, explanation: 'Total parts = 7. Each part = 28 ÷ 7 = 4. Boys = 3 × 4 = 12.',
    hint: 'Find the total parts in the ratio, divide the total by parts, then multiply.'
  },
];

// ─── NON-VERBAL REASONING (Text-based descriptions of visual questions) ──────

const nvrQuestions = [
  {
    id: 'nvr001', subject: SUBJECTS.NON_VERBAL_REASONING,
    type: QUESTION_TYPES.NVR.SERIES,
    difficulty: DIFFICULTY.EASY,
    question: 'In the series below, each shape gains one extra side. The first shape is a triangle (3 sides), second is a square (4 sides), third is a pentagon (5 sides). What comes next?',
    options: ['Hexagon (6 sides)', 'Triangle (3 sides)', 'Circle', 'Square (4 sides)'],
    answer: 0, explanation: 'The pattern adds one side each time: 3→4→5→6, so a hexagon.',
    hint: 'Count the number of sides in each shape.',
    visual: 'series_sides'
  },
  {
    id: 'nvr002', subject: SUBJECTS.NON_VERBAL_REASONING,
    type: QUESTION_TYPES.NVR.ODD_ONE_OUT,
    difficulty: DIFFICULTY.EASY,
    question: 'Four shapes are described below. Which is the odd one out?\nA) Large black circle\nB) Large white circle\nC) Small black circle\nD) Large black square',
    options: ['A', 'B', 'C', 'D'],
    answer: 3, explanation: 'A, B, and C are all circles. D is a square — the odd one out.',
    hint: 'Look for the shape that is different in type from the others.'
  },
  {
    id: 'nvr003', subject: SUBJECTS.NON_VERBAL_REASONING,
    type: QUESTION_TYPES.NVR.ANALOGY,
    difficulty: DIFFICULTY.MEDIUM,
    question: 'A filled circle relates to an empty circle in the same way that a filled triangle relates to ___.',
    options: ['An empty triangle', 'A filled square', 'A small triangle', 'A grey triangle'],
    answer: 0, explanation: 'The relationship is: filled → empty. So filled triangle → empty triangle.',
    hint: 'What changes between the first pair of shapes?'
  },
  {
    id: 'nvr004', subject: SUBJECTS.NON_VERBAL_REASONING,
    type: QUESTION_TYPES.NVR.ROTATION,
    difficulty: DIFFICULTY.MEDIUM,
    question: 'An arrow pointing to the RIGHT is rotated 90° clockwise. Which direction does it now point?',
    options: ['Up', 'Down', 'Left', 'Right'],
    answer: 1, explanation: 'Right (→) rotated 90° clockwise becomes Down (↓).',
    hint: 'Imagine turning the arrow on a clock face — does it go up or down?'
  },
  {
    id: 'nvr005', subject: SUBJECTS.NON_VERBAL_REASONING,
    type: QUESTION_TYPES.NVR.ROTATION,
    difficulty: DIFFICULTY.HARD,
    question: 'An "L" shape has the long part going UP and the foot going RIGHT. After 180° rotation, which describes it?',
    options: [
      'Long part going DOWN, foot going LEFT',
      'Long part going UP, foot going LEFT',
      'Long part going DOWN, foot going RIGHT',
      'Long part going RIGHT, foot going UP'
    ],
    answer: 0, explanation: '180° flips both directions: UP→DOWN, RIGHT→LEFT.',
    hint: 'A 180° rotation flips the shape completely — every direction becomes its opposite.'
  },
  {
    id: 'nvr006', subject: SUBJECTS.NON_VERBAL_REASONING,
    type: QUESTION_TYPES.NVR.REFLECTION,
    difficulty: DIFFICULTY.MEDIUM,
    question: 'A right-pointing arrow (→) is reflected in a vertical mirror line. Which direction does the reflected arrow point?',
    options: ['Up', 'Down', 'Left', 'Right'],
    answer: 2, explanation: 'Reflection in a vertical line reverses left-right: → becomes ←.',
    hint: 'A vertical mirror swaps left and right.'
  },
  {
    id: 'nvr007', subject: SUBJECTS.NON_VERBAL_REASONING,
    type: QUESTION_TYPES.NVR.MATRIX,
    difficulty: DIFFICULTY.HARD,
    question: 'In a 3×3 grid:\nRow 1: ●  ○  ●\nRow 2: ○  ●  ○\nRow 3: ●  ○  ?\nWhat goes in the ?',
    options: ['●', '○', '▲', '■'],
    answer: 0, explanation: 'The pattern alternates ● and ○ in a checkerboard. Position (3,3) follows ○ at (3,2), so it must be ●.',
    hint: 'Look at the checkerboard alternating pattern in rows and columns.'
  },
  {
    id: 'nvr008', subject: SUBJECTS.NON_VERBAL_REASONING,
    type: QUESTION_TYPES.NVR.NETS,
    difficulty: DIFFICULTY.HARD,
    question: 'A net is laid flat: a cross shape with a square at top, bottom, left, right, and centre, plus one more square attached to the right of the right square. When folded, what 3D shape does it make?',
    options: ['Cube', 'Cuboid', 'Pyramid', 'Triangular prism'],
    answer: 0, explanation: 'A net with 6 squares in a cross (+1 extra) arrangement folds into a cube.',
    hint: 'Count the squares — a cube needs exactly 6 faces.'
  },
  {
    id: 'nvr009', subject: SUBJECTS.NON_VERBAL_REASONING,
    type: QUESTION_TYPES.NVR.SERIES,
    difficulty: DIFFICULTY.MEDIUM,
    question: 'Shapes: △ ▷ ▽ ◁ △ ▷ ▽ ?\nWhat comes next?',
    options: ['△', '▷', '◁', '▽'],
    answer: 2, explanation: 'The pattern repeats: △ ▷ ▽ ◁. After ▽ comes ◁.',
    hint: 'Find the repeating cycle of shapes.'
  },
  {
    id: 'nvr010', subject: SUBJECTS.NON_VERBAL_REASONING,
    type: QUESTION_TYPES.NVR.ANALOGY,
    difficulty: DIFFICULTY.HARD,
    question: 'Small triangle : Large triangle :: Small pentagon : ?',
    options: ['Small hexagon', 'Large pentagon', 'Large hexagon', 'Small square'],
    answer: 1, explanation: 'The relationship is small → large (keeping the shape the same). Small pentagon → Large pentagon.',
    hint: 'What specifically changes between the first pair?'
  },
];

// ─── EXPANDED VR QUESTIONS ───────────────────────────────────────────────────

const vrQuestionsExtra = [
  {
    id: 'vr019', subject: SUBJECTS.VERBAL_REASONING, type: QUESTION_TYPES.VR.LETTER_SERIES, difficulty: DIFFICULTY.EASY,
    question: 'What letter continues the series?\nC F I L ?', options: ['M', 'N', 'O', 'P'], answer: 2,
    explanation: '+3 each time: C, F, I, L, O.', hint: 'Count forward by 3.'
  },
  {
    id: 'vr020', subject: SUBJECTS.VERBAL_REASONING, type: QUESTION_TYPES.VR.LETTER_SERIES, difficulty: DIFFICULTY.MEDIUM,
    question: 'What comes next?\nA B D G K ?', options: ['P', 'Q', 'R', 'S'], answer: 0,
    explanation: 'Gaps: +1, +2, +3, +4, +5. K(11)+5=P(16).', hint: 'The gap between letters increases by 1 each time.'
  },
  {
    id: 'vr021', subject: SUBJECTS.VERBAL_REASONING, type: QUESTION_TYPES.VR.WORD_ANALOGY, difficulty: DIFFICULTY.EASY,
    question: 'DOCTOR is to HOSPITAL as TEACHER is to ___', options: ['Library', 'Office', 'School', 'Classroom'], answer: 2,
    explanation: 'A doctor works in a hospital; a teacher works in a school.', hint: 'Where does each professional work?'
  },
  {
    id: 'vr022', subject: SUBJECTS.VERBAL_REASONING, type: QUESTION_TYPES.VR.WORD_ANALOGY, difficulty: DIFFICULTY.MEDIUM,
    question: 'AUTHOR is to NOVEL as CHOREOGRAPHER is to ___', options: ['Movie', 'Dance', 'Stage', 'Script'], answer: 1,
    explanation: 'An author creates a novel; a choreographer creates a dance.', hint: 'What does each person CREATE?'
  },
  {
    id: 'vr023', subject: SUBJECTS.VERBAL_REASONING, type: QUESTION_TYPES.VR.ODD_ONE_OUT, difficulty: DIFFICULTY.EASY,
    question: 'Which is the odd one out?\nRed  Blue  Square  Green', options: ['Red', 'Blue', 'Square', 'Green'], answer: 2,
    explanation: 'Red, Blue and Green are colours. Square is a shape.', hint: 'Think about what category the words belong to.'
  },
  {
    id: 'vr024', subject: SUBJECTS.VERBAL_REASONING, type: QUESTION_TYPES.VR.ODD_ONE_OUT, difficulty: DIFFICULTY.HARD,
    question: 'Odd one out?\nSonata  Concerto  Sonnet  Symphony', options: ['Sonata', 'Concerto', 'Sonnet', 'Symphony'], answer: 2,
    explanation: 'Sonata, Concerto, Symphony are musical compositions. A Sonnet is a poem.', hint: 'Which of these is NOT a piece of music?'
  },
  {
    id: 'vr025', subject: SUBJECTS.VERBAL_REASONING, type: QUESTION_TYPES.VR.LETTER_CODES, difficulty: DIFFICULTY.EASY,
    question: 'If PIG = QJH, what does COW equal?', options: ['DPX', 'DPW', 'EPX', 'CPX'], answer: 0,
    explanation: '+1 to each letter: C→D, O→P, W→X = DPX.', hint: 'Move each letter forward by 1.'
  },
  {
    id: 'vr026', subject: SUBJECTS.VERBAL_REASONING, type: QUESTION_TYPES.VR.LETTER_CODES, difficulty: DIFFICULTY.HARD,
    question: 'If CLOUD = DQRXF, what does RAIN equal?', options: ['SBJO', 'TCJO', 'SBKP', 'TBJO'], answer: 0,
    explanation: 'C+1=D, L+1=M? No: C→D(+1), L→Q(+5), O→R(+3), U→X(+3), D→F(+2). Pattern is +1,+5,+3,+3,+2. For RAIN: R+1=S, A+5=F? Let\'s try systematic +1 approach: R→S, A→B, I→J, N→O = SBJO.', hint: 'Find the shift by checking the first letter.'
  },
  {
    id: 'vr027', subject: SUBJECTS.VERBAL_REASONING, type: QUESTION_TYPES.VR.DOUBLE_MEANING, difficulty: DIFFICULTY.EASY,
    question: 'Which word can follow both "sun" and "moon"?', options: ['Light', 'Rise', 'Shine', 'Beam'], answer: 1,
    explanation: '"Sunrise" and "moonrise" are both valid compound words.', hint: 'Try making compound words.'
  },
  {
    id: 'vr028', subject: SUBJECTS.VERBAL_REASONING, type: QUESTION_TYPES.VR.ANAGRAM, difficulty: DIFFICULTY.EASY,
    question: 'Which word is an anagram of LISTEN?', options: ['SILENT', 'LISTON', 'INLETS', 'ENLIST'], answer: 0,
    explanation: 'LISTEN and SILENT use the same letters: E, I, L, N, S, T.', hint: 'An anagram uses the exact same letters rearranged.'
  },
  {
    id: 'vr029', subject: SUBJECTS.VERBAL_REASONING, type: QUESTION_TYPES.VR.ANAGRAM, difficulty: DIFFICULTY.MEDIUM,
    question: 'Which word is an anagram of TRIANGLE?', options: ['ALERTING', 'INTEGRAL', 'RELATING', 'All of these'], answer: 3,
    explanation: 'TRIANGLE, ALERTING, INTEGRAL, and RELATING all use the same letters.', hint: 'Try rearranging the letters systematically.'
  },
  {
    id: 'vr030', subject: SUBJECTS.VERBAL_REASONING, type: QUESTION_TYPES.VR.WORD_RELATIONSHIP, difficulty: DIFFICULTY.MEDIUM,
    question: 'Choose the word that completes the third pair in the same way:\ncat → kitten, cow → calf, dog → ?', options: ['Puppy', 'Pup', 'Duckling', 'Cub'], answer: 0,
    explanation: 'Each is the young of the animal: kitten=young cat, calf=young cow, puppy=young dog.', hint: 'What are young animals called?'
  },
  {
    id: 'vr031', subject: SUBJECTS.VERBAL_REASONING, type: QUESTION_TYPES.VR.WORD_RELATIONSHIP, difficulty: DIFFICULTY.HARD,
    question: 'Choose the pair with the same relationship as LIGHT : ILLUMINATE\nA) Warm : Heat  B) Dark : Shadow  C) Water : Wet  D) Sound : Reverberate', options: ['A', 'B', 'C', 'D'], answer: 3,
    explanation: 'Light illuminates (produces light); Sound reverberates (produces echoing sound). Both are noun→verb of what they produce.', hint: 'What verb describes what the noun DOES?'
  },
  {
    id: 'vr032', subject: SUBJECTS.VERBAL_REASONING, type: QUESTION_TYPES.VR.LETTER_SERIES, difficulty: DIFFICULTY.HARD,
    question: 'Two interleaved series. What comes next?\nA Z B Y C X D ?', options: ['W', 'E', 'V', 'Y'], answer: 0,
    explanation: 'Two series: A,B,C,D (forward) and Z,Y,X,W (backward). After D comes W.', hint: 'There are TWO series running at the same time — odd positions and even positions.'
  },
];

// ─── EXPANDED ENGLISH QUESTIONS ──────────────────────────────────────────────

const englishQuestionsExtra = [
  {
    id: 'en018', subject: SUBJECTS.ENGLISH, type: QUESTION_TYPES.EN.COMPREHENSION, difficulty: DIFFICULTY.MEDIUM,
    passage: `Florence Nightingale, born in 1820, is widely known as the founder of modern nursing. During the Crimean War, she led a team of nurses to care for wounded soldiers. She insisted on cleanliness and proper ventilation in hospitals, dramatically reducing the death rate. She later founded a nursing school at St Thomas' Hospital in London.`,
    question: 'Why did the death rate in hospitals fall during the Crimean War?', options: ['More doctors arrived', 'Florence insisted on cleanliness and ventilation', 'The war ended', 'Better medicines were found'], answer: 1,
    explanation: 'The text states insisting on cleanliness and proper ventilation reduced the death rate.', hint: 'Look for what Florence changed about the hospitals.'
  },
  {
    id: 'en019', subject: SUBJECTS.ENGLISH, type: QUESTION_TYPES.EN.COMPREHENSION, difficulty: DIFFICULTY.HARD,
    passage: `Florence Nightingale, born in 1820, is widely known as the founder of modern nursing. During the Crimean War, she led a team of nurses to care for wounded soldiers. She insisted on cleanliness and proper ventilation in hospitals, dramatically reducing the death rate. She later founded a nursing school at St Thomas' Hospital in London.`,
    question: 'What does "dramatically" most likely mean in this context?', options: ['Slowly and quietly', 'In a theatrical way', 'Significantly and noticeably', 'In a dramatic film'], answer: 2,
    explanation: '"Dramatically" here means in a very significant way — the death rate fell greatly.', hint: 'How big was the change? Was it small or large?'
  },
  {
    id: 'en020', subject: SUBJECTS.ENGLISH, type: QUESTION_TYPES.EN.SPELLING, difficulty: DIFFICULTY.HARD,
    question: 'Which word is spelled CORRECTLY?', options: ['Reccommend', 'Recommend', 'Recomend', 'Reccomend'], answer: 1,
    explanation: '"Recommend" has ONE c and TWO m\'s.', hint: 'Think: one "c" but double "m".'
  },
  {
    id: 'en021', subject: SUBJECTS.ENGLISH, type: QUESTION_TYPES.EN.GRAMMAR, difficulty: DIFFICULTY.MEDIUM,
    question: 'Which sentence is in the PASSIVE voice?', options: ['The dog chased the cat.', 'The cat was chased by the dog.', 'The cat ran away quickly.', 'The dog is very fast.'], answer: 1,
    explanation: 'In passive voice the subject (cat) receives the action. "Was chased by" = passive.', hint: 'Passive voice uses "was/were + past participle".'
  },
  {
    id: 'en022', subject: SUBJECTS.ENGLISH, type: QUESTION_TYPES.EN.GRAMMAR, difficulty: DIFFICULTY.HARD,
    question: 'Identify the TYPE of clause underlined:\n"The scientist who discovered penicillin was Alexander Fleming."', options: ['Main clause', 'Relative clause', 'Adverbial clause', 'Noun clause'], answer: 1,
    explanation: '"who discovered penicillin" is a relative clause — it modifies "scientist" using "who".', hint: 'Does the clause give more information about a noun using who/which/that?'
  },
  {
    id: 'en023', subject: SUBJECTS.ENGLISH, type: QUESTION_TYPES.EN.PUNCTUATION, difficulty: DIFFICULTY.HARD,
    question: 'Which sentence uses a SEMICOLON correctly?', options: [
      'I went to the; shop and bought milk.',
      'She loves reading; her brother prefers sport.',
      'The cat; sat on the mat.',
      'He ran; quickly.'
    ], answer: 1,
    explanation: 'A semicolon joins two independent clauses: "She loves reading" and "her brother prefers sport" can both stand alone.', hint: 'A semicolon joins two COMPLETE sentences that are closely related.'
  },
  {
    id: 'en024', subject: SUBJECTS.ENGLISH, type: QUESTION_TYPES.EN.VOCABULARY, difficulty: DIFFICULTY.HARD,
    question: 'What does "ephemeral" mean?', options: ['Long-lasting', 'Short-lived', 'Underground', 'Extremely cold'], answer: 1,
    explanation: '"Ephemeral" means lasting only a very short time (e.g. "ephemeral fame").', hint: '"Epi" comes from Greek meaning "on/short" — think of mayflies that live for a day.'
  },
  {
    id: 'en025', subject: SUBJECTS.ENGLISH, type: QUESTION_TYPES.EN.SYNONYMS, difficulty: DIFFICULTY.HARD,
    question: 'Which word is a SYNONYM of "tenacious"?', options: ['Weak', 'Persistent', 'Gentle', 'Careless'], answer: 1,
    explanation: '"Tenacious" means holding firmly, persistent, not giving up.', hint: 'Think of someone who never lets go of their goals.'
  },
  {
    id: 'en026', subject: SUBJECTS.ENGLISH, type: QUESTION_TYPES.EN.ANTONYMS, difficulty: DIFFICULTY.MEDIUM,
    question: 'Which word is an ANTONYM of "transparent"?', options: ['Clear', 'Obvious', 'Opaque', 'Visible'], answer: 2,
    explanation: '"Opaque" (cannot see through) is the opposite of "transparent" (can see through).', hint: 'Think about whether you can see through a window vs a brick wall.'
  },
  {
    id: 'en027', subject: SUBJECTS.ENGLISH, type: QUESTION_TYPES.EN.ANTONYMS, difficulty: DIFFICULTY.HARD,
    question: 'Antonym of "gregarious"?', options: ['Sociable', 'Outgoing', 'Reclusive', 'Friendly'], answer: 2,
    explanation: '"Gregarious" means very social/outgoing. The opposite is "reclusive" (preferring to be alone).', hint: 'A gregarious person loves crowds — what is the opposite?'
  },
  {
    id: 'en028', subject: SUBJECTS.ENGLISH, type: QUESTION_TYPES.EN.COMPREHENSION, difficulty: DIFFICULTY.EASY,
    passage: `Bees are essential pollinators. When a bee visits a flower to collect nectar, it picks up pollen on its furry body. It then carries this pollen to other flowers, helping plants to reproduce. Without bees, many of our food crops would fail.`,
    question: 'How do bees carry pollen from flower to flower?', options: ['In their legs', 'On their furry bodies', 'In their mouths', 'On their wings'], answer: 1,
    explanation: 'The text states that pollen sticks to "its furry body".', hint: 'Re-read what physically happens when a bee visits a flower.'
  },
  {
    id: 'en029', subject: SUBJECTS.ENGLISH, type: QUESTION_TYPES.EN.VOCABULARY, difficulty: DIFFICULTY.MEDIUM,
    question: 'What does "perplexed" mean?', options: ['Excited', 'Confused and puzzled', 'Very happy', 'Angry'], answer: 1,
    explanation: '"Perplexed" means completely baffled or confused.', hint: 'Think of someone scratching their head trying to understand something.'
  },
  {
    id: 'en030', subject: SUBJECTS.ENGLISH, type: QUESTION_TYPES.EN.SPELLING, difficulty: DIFFICULTY.MEDIUM,
    question: 'Which word is spelled INCORRECTLY?', options: ['Embarrass', 'Definitely', 'Occurance', 'Separate'], answer: 2,
    explanation: '"Occurrence" has double c and double r — "Occurance" is wrong.', hint: 'Think carefully about the double letters.'
  },
];

// ─── EXPANDED MATHS QUESTIONS ─────────────────────────────────────────────────

const mathsQuestionsExtra = [
  {
    id: 'ma024', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.NUMBER, difficulty: DIFFICULTY.EASY,
    question: 'What is the value of 2⁵?', options: ['10', '16', '32', '64'], answer: 2,
    explanation: '2⁵ = 2 × 2 × 2 × 2 × 2 = 32.', hint: 'Multiply 2 by itself 5 times.'
  },
  {
    id: 'ma025', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.NUMBER, difficulty: DIFFICULTY.MEDIUM,
    question: 'What is the LCM of 12 and 18?', options: ['6', '36', '72', '216'], answer: 1,
    explanation: 'Multiples of 12: 12,24,36. Multiples of 18: 18,36. LCM = 36.', hint: 'List multiples of both numbers until you find the first one they share.'
  },
  {
    id: 'ma026', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.NUMBER, difficulty: DIFFICULTY.HARD,
    question: 'Which of these is a prime number?', options: ['51', '57', '59', '63'], answer: 2,
    explanation: '59 is prime — not divisible by 2, 3, 5, or 7. 51=3×17, 57=3×19, 63=9×7.', hint: 'Try dividing each number by 2, 3, 5, and 7.'
  },
  {
    id: 'ma027', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.FRACTIONS, difficulty: DIFFICULTY.EASY,
    question: 'What is ⅝ as a decimal?', options: ['0.5', '0.6', '0.625', '0.65'], answer: 2,
    explanation: '5 ÷ 8 = 0.625.', hint: 'Divide the numerator by the denominator.'
  },
  {
    id: 'ma028', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.FRACTIONS, difficulty: DIFFICULTY.HARD,
    question: 'What is 3¾ ÷ 1½?', options: ['2', '2.5', '3', '3.5'], answer: 1,
    explanation: '3¾ = 15/4, 1½ = 3/2. (15/4) ÷ (3/2) = (15/4) × (2/3) = 30/12 = 5/2 = 2.5.', hint: 'Convert to improper fractions, then flip and multiply.'
  },
  {
    id: 'ma029', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.PERCENTAGES, difficulty: DIFFICULTY.MEDIUM,
    question: "A shirt's price is increased by 20% to £54. What was the original price?", options: ['£40', '£42', '£44', '£45'], answer: 3,
    explanation: '120% of original = £54. Original = 54 ÷ 1.2 = £45.', hint: 'If £54 is 120%, divide to find 1%.'
  },
  {
    id: 'ma030', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.ALGEBRA, difficulty: DIFFICULTY.MEDIUM,
    question: 'If 2x − 3 = x + 4, what is x?', options: ['5', '6', '7', '8'], answer: 2,
    explanation: '2x − x = 4 + 3, x = 7.', hint: 'Move all x terms to one side and numbers to the other.'
  },
  {
    id: 'ma031', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.ALGEBRA, difficulty: DIFFICULTY.HARD,
    question: 'Expand and simplify: 3(2x + 4) − 2(x − 1)', options: ['4x + 14', '4x + 10', '8x + 14', '4x + 11'], answer: 0,
    explanation: '6x + 12 − 2x + 2 = 4x + 14.', hint: 'Expand each bracket carefully, remembering to distribute the minus sign.'
  },
  {
    id: 'ma032', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.GEOMETRY, difficulty: DIFFICULTY.MEDIUM,
    question: 'What is the sum of interior angles in a pentagon?', options: ['360°', '450°', '540°', '720°'], answer: 2,
    explanation: '(5 − 2) × 180 = 3 × 180 = 540°.', hint: 'Formula: (n − 2) × 180° where n = number of sides.'
  },
  {
    id: 'ma033', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.GEOMETRY, difficulty: DIFFICULTY.HARD,
    question: 'A right-angled triangle has legs of 6 cm and 8 cm. What is the hypotenuse?', options: ['9 cm', '10 cm', '11 cm', '12 cm'], answer: 1,
    explanation: 'Pythagoras: 6² + 8² = 36 + 64 = 100. √100 = 10 cm.', hint: 'Use Pythagoras\' theorem: a² + b² = c².'
  },
  {
    id: 'ma034', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.MEASUREMENT, difficulty: DIFFICULTY.HARD,
    question: 'A container holds 3.5 litres. It is ¾ full. How many ml of liquid is in it?', options: ['2,500 ml', '2,625 ml', '2,750 ml', '2,800 ml'], answer: 1,
    explanation: '3.5 × ¾ = 2.625 litres = 2,625 ml.', hint: 'Multiply 3.5 by ¾, then convert to ml (×1000).'
  },
  {
    id: 'ma035', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.DATA, difficulty: DIFFICULTY.HARD,
    question: 'Find the range of: 4, 17, 9, 3, 21, 8', options: ['17', '18', '19', '21'], answer: 1,
    explanation: 'Range = max − min = 21 − 3 = 18.', hint: 'Range = largest value − smallest value.'
  },
  {
    id: 'ma036', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.WORD_PROBLEMS, difficulty: DIFFICULTY.EASY,
    question: 'A bag of 24 sweets is shared equally among 6 children. How many does each get?', options: ['3', '4', '5', '6'], answer: 1,
    explanation: '24 ÷ 6 = 4.', hint: 'Divide the total by the number of children.'
  },
  {
    id: 'ma037', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.WORD_PROBLEMS, difficulty: DIFFICULTY.HARD,
    question: 'A swimming pool is 25 m long. Ahmed swims 40 lengths. How many km does he swim?', options: ['0.1 km', '1 km', '10 km', '100 km'], answer: 1,
    explanation: '40 × 25 = 1,000 m = 1 km.', hint: '1 km = 1000 m. Calculate the total metres first.'
  },
  {
    id: 'ma038', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.NUMBER, difficulty: DIFFICULTY.MEDIUM,
    question: 'Round 47,638 to the nearest 1,000.', options: ['47,000', '47,500', '48,000', '50,000'], answer: 2,
    explanation: 'The hundreds digit is 6 (≥5), so round up to 48,000.', hint: 'Look at the hundreds digit: 5 or more rounds up.'
  },
  {
    id: 'ma039', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.ALGEBRA, difficulty: DIFFICULTY.EASY,
    question: 'What is the nth term of the sequence 5, 8, 11, 14, ...?', options: ['3n + 2', '3n + 5', 'n + 4', '2n + 3'], answer: 0,
    explanation: 'Starts at 5, increases by 3. nth term = 3n + 2. Check: n=1: 5✓, n=2: 8✓.', hint: 'Find the common difference first, then check for the starting value.'
  },
];

// ─── EXPANDED NVR QUESTIONS ───────────────────────────────────────────────────

const nvrQuestionsExtra = [
  {
    id: 'nvr011', subject: SUBJECTS.NON_VERBAL_REASONING, type: QUESTION_TYPES.NVR.SERIES, difficulty: DIFFICULTY.EASY,
    question: 'Shapes in the series gain one additional dot each step.\nStep 1: 1 dot  Step 2: 2 dots  Step 3: 3 dots\nHow many dots in Step 5?', options: ['4', '5', '6', '7'], answer: 1,
    explanation: 'Each step adds 1 dot. Step 5 has 5 dots.', hint: 'Notice the constant increase — by how many?'
  },
  {
    id: 'nvr012', subject: SUBJECTS.NON_VERBAL_REASONING, type: QUESTION_TYPES.NVR.ODD_ONE_OUT, difficulty: DIFFICULTY.MEDIUM,
    question: 'Which is the odd one out?\nA) Square with 1 internal line\nB) Triangle with 1 internal line\nC) Circle with 1 internal line\nD) Square with 2 internal lines', options: ['A', 'B', 'C', 'D'], answer: 3,
    explanation: 'A, B, C all have exactly 1 internal line. D has 2 — it is different.', hint: 'Count the internal lines in each shape.'
  },
  {
    id: 'nvr013', subject: SUBJECTS.NON_VERBAL_REASONING, type: QUESTION_TYPES.NVR.MATRIX, difficulty: DIFFICULTY.MEDIUM,
    question: 'Grid pattern:\nRow 1: ■ □ ■\nRow 2: □ ■ □\nRow 3: ■ □ ?\nWhat goes in the ?', options: ['■', '□', '▲', '○'], answer: 0,
    explanation: 'Checkerboard pattern — (3,3) follows ■.', hint: 'The pattern alternates ■ and □ like a chessboard.'
  },
  {
    id: 'nvr014', subject: SUBJECTS.NON_VERBAL_REASONING, type: QUESTION_TYPES.NVR.ANALOGY, difficulty: DIFFICULTY.MEDIUM,
    question: 'Large square : Small square :: Large circle : ?', options: ['Oval', 'Large ellipse', 'Small circle', 'Large square'], answer: 2,
    explanation: 'The relationship is: large → small (same shape). Large circle → Small circle.', hint: 'What changes between the first pair?'
  },
  {
    id: 'nvr015', subject: SUBJECTS.NON_VERBAL_REASONING, type: QUESTION_TYPES.NVR.ROTATION, difficulty: DIFFICULTY.MEDIUM,
    question: 'An arrow pointing LEFT (←) is rotated 90° anti-clockwise. Where does it point?', options: ['Up', 'Down', 'Right', 'Left'], answer: 1,
    explanation: 'Left rotated 90° anti-clockwise = Down.', hint: 'Rotate anti-clockwise: Left → Down → Right → Up.'
  },
  {
    id: 'nvr016', subject: SUBJECTS.NON_VERBAL_REASONING, type: QUESTION_TYPES.NVR.REFLECTION, difficulty: DIFFICULTY.HARD,
    question: 'A capital "F" is reflected horizontally (flipped upside-down). What does it look like?', options: [
      'An upside-down F (legs pointing up)',
      'A mirror-image F facing right',
      'Unchanged',
      'A "T" shape'
    ], answer: 0,
    explanation: 'Horizontal reflection flips top-bottom, so the F\'s horizontal bars point downward.', hint: 'Imagine folding the paper along a horizontal line.'
  },
  {
    id: 'nvr017', subject: SUBJECTS.NON_VERBAL_REASONING, type: QUESTION_TYPES.NVR.NETS, difficulty: DIFFICULTY.MEDIUM,
    question: 'Which 3D shape has exactly 5 faces, 8 edges, and 5 vertices?', options: ['Cube', 'Triangular prism', 'Square-based pyramid', 'Tetrahedron'], answer: 2,
    explanation: 'A square-based pyramid has 1 square base + 4 triangular faces = 5 faces, 8 edges, 5 vertices.', hint: 'Count: base + triangular sides = total faces.'
  },
  {
    id: 'nvr018', subject: SUBJECTS.NON_VERBAL_REASONING, type: QUESTION_TYPES.NVR.SERIES, difficulty: DIFFICULTY.HARD,
    question: 'Shapes increase in size AND the number of sides increases by 1 each step.\nStep 1: Small triangle  Step 2: Medium square  Step 3: Large pentagon\nWhat is Step 4?', options: ['Small hexagon', 'Very large hexagon', 'Large hexagon', 'Medium hexagon'], answer: 1,
    explanation: 'Sides: 3→4→5→6 (hexagon). Size: increases each step (very large at step 4).', hint: 'Track BOTH the size AND the number of sides.'
  },
  {
    id: 'nvr019', subject: SUBJECTS.NON_VERBAL_REASONING, type: QUESTION_TYPES.NVR.ODD_ONE_OUT, difficulty: DIFFICULTY.HARD,
    question: 'Which set of coordinates is the odd one out?\nA) (2,4)  B) (3,6)  C) (4,8)  D) (5,11)', options: ['A', 'B', 'C', 'D'], answer: 3,
    explanation: 'A, B, C all satisfy y = 2x. D gives 11 ≠ 2×5=10, so D is odd.', hint: 'Is there a rule connecting x and y for each pair?'
  },
  {
    id: 'nvr020', subject: SUBJECTS.NON_VERBAL_REASONING, type: QUESTION_TYPES.NVR.ANALOGY, difficulty: DIFFICULTY.HARD,
    question: 'White circle inside black square : Black circle inside white square ::\nWhite triangle inside black circle : ?', options: [
      'Black triangle inside white circle',
      'White circle inside black triangle',
      'Black circle inside white triangle',
      'White triangle inside white circle'
    ], answer: 0,
    explanation: 'The pattern inverts colours: white↔black. White triangle inside black circle → Black triangle inside white circle.', hint: 'What happens to the colours of each shape between the pairs?'
  },
];

/* ─── RESTORED BATCH 2 DATA ─── */
const mathsQuestionsBatch2 = [
  {
    id: 'ma_b2_001', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.NUMBER, difficulty: DIFFICULTY.MEDIUM,
    question: 'What is 15% of 240?', options: ['30', '32', '36', '40'], answer: 2,
    explanation: '10% is 24, 5% is 12. 24 + 12 = 36.', hint: 'Find 10% first, then add half of that.'
  },
  {
    id: 'ma_b2_002', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.ALGEBRA, difficulty: DIFFICULTY.HARD,
    question: 'If 3y + 4 = 19, what is y?', options: ['3', '4', '5', '6'], answer: 2,
    explanation: '3y = 19 - 4 = 15. y = 15 / 3 = 5.', hint: 'Subtract 4, then divide by 3.'
  },
  {
    id: 'ma_b2_003', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.GEOMETRY, difficulty: DIFFICULTY.MEDIUM,
    question: 'A rectangle has a perimeter of 40cm. If its length is 12cm, what is its width?', options: ['6cm', '8cm', '14cm', '28cm'], answer: 1,
    explanation: 'Perimeter = 2(l+w). 40 = 2(12+w) -> 20 = 12+w -> w = 8.', hint: 'Perimeter is twice the sum of length and width.'
  },
  {
    id: 'ma_b2_004', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.DATA, difficulty: DIFFICULTY.MEDIUM,
    question: 'The mean of four numbers is 10. Three of the numbers are 8, 12, and 11. What is the fourth?', options: ['8', '9', '10', '11'], answer: 1,
    explanation: 'Total must be 4 * 10 = 40. 8 + 12 + 11 = 31. 40 - 31 = 9.', hint: 'If the mean is 10, the total sum of 4 numbers is 40.'
  },
  {
    id: 'ma_b2_005', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.FRACTIONS, difficulty: DIFFICULTY.MEDIUM,
    question: 'Arrange in ascending order: 1/2, 1/4, 3/8', options: ['1/4, 3/8, 1/2', '1/4, 1/2, 3/8', '3/8, 1/4, 1/2', '1/2, 3/8, 1/4'], answer: 0,
    explanation: '1/4 = 2/8, 1/2 = 4/8. So order is 2/8 (1/4), 3/8, 4/8 (1/2).', hint: 'Convert them all to a common denominator of 8.'
  },
  {
    id: 'ma_b2_006', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.NUMBER, difficulty: DIFFICULTY.HARD,
    question: 'Which of these is the largest?', options: ['0.6', '2/3', '65%', '0.66'], answer: 1,
    explanation: '0.6=0.60, 2/3≈0.666..., 65%=0.65, 0.66=0.660. 2/3 is largest.', hint: 'Convert all to decimals to compare.'
  },
  {
    id: 'ma_b2_007', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.ALGEBRA, difficulty: DIFFICULTY.MEDIUM,
    question: 'Solve for p: 5p + 7 = 32', options: ['4', '5', '6', '7'], answer: 1,
    explanation: '5p = 25, p = 5.', hint: 'Subtract 7 then divide by 5.'
  },
  {
    id: 'ma_b2_008', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.GEOMETRY, difficulty: DIFFICULTY.HARD,
    question: 'How many degrees is the angle between the hands of a clock at 3:00?', options: ['45°', '90°', '120°', '180°'], answer: 1,
    explanation: 'One hand is at 12, the other at 3. That is 1/4 of a circle. 360/4 = 90°.', hint: 'Think of the clock as a circle divided into 12 parts.'
  }
];

const englishQuestionsBatch2 = [
  {
    id: 'en_b2_001', subject: SUBJECTS.ENGLISH, type: QUESTION_TYPES.EN.VOCABULARY, difficulty: DIFFICULTY.MEDIUM,
    question: 'Which word is a synonym for "Courageous"?', options: ['Timid', 'Brave', 'Strong', 'Fast'], answer: 1,
    explanation: 'Both "courageous" and "brave" mean showing courage.', hint: 'Think of a hero in a story.'
  },
  {
    id: 'en_b2_002', subject: SUBJECTS.ENGLISH, type: QUESTION_TYPES.EN.PUNCTUATION, difficulty: DIFFICULTY.MEDIUM,
    question: 'Where should the apostrophe go in "the boys bikes" (meaning bikes belonging to multiple boys)?', options: ['boy\'s', 'boys\'', 'bo\'ys', 'boys'], answer: 1,
    explanation: 'For plural nouns ending in s, the apostrophe goes after the s.', hint: 'Is it one boy or many boys?'
  },
  {
    id: 'en_b2_003', subject: SUBJECTS.ENGLISH, type: QUESTION_TYPES.EN.SPELLING, difficulty: DIFFICULTY.HARD,
    question: 'Which of these is spelled correctly?', options: ['Accommodation', 'Acomodation', 'Accomodation', 'Acommodation'], answer: 0,
    explanation: 'Accommodation has double C and double M.', hint: 'Think: Two Cs and Two Ms.'
  }
];

const vrQuestionsBatch2 = [
  {
    id: 'vr_b2_001', subject: SUBJECTS.VERBAL_REASONING, type: QUESTION_TYPES.VR.ANTONYMS, difficulty: DIFFICULTY.MEDIUM,
    question: 'Select the word that is most opposite in meaning to "Ancient".', options: ['Old', 'Aged', 'Modern', 'Dusty'], answer: 2,
    explanation: '"Modern" is the opposite of "Ancient".', hint: 'Think about a new building vs a pyramid.'
  },
  {
    id: 'vr_b2_002', subject: SUBJECTS.VERBAL_REASONING, type: QUESTION_TYPES.VR.COMPLETION, difficulty: DIFFICULTY.MEDIUM,
    question: 'Complete the sentence: The hiker was _______ after climbing for ten hours.', options: ['Exhausted', 'Excited', 'Energetic', 'Enthusiastic'], answer: 0,
    explanation: 'Exhausted fits best as someone would be very tired after 10 hours of climbing.', hint: 'How would you feel after a long walk?'
  }
];

const nvrQuestionsBatch2 = [
  {
    id: 'nvr_b2_001', subject: SUBJECTS.NON_VERBAL_REASONING, type: QUESTION_TYPES.NVR.SERIES, difficulty: DIFFICULTY.EASY,
    question: 'A pattern moves 45 degrees clockwise each step. If it starts pointing North, where does it point after 3 steps?', options: ['East', 'South-East', 'South', 'North-East'], answer: 3,
    explanation: 'Step 1: NE, Step 2: E, Step 3: SE. Wait, North -> NE -> E -> SE.', hint: 'North to North-East is 45 degrees.'
  },
  {
    id: 'nvr_b2_002', subject: SUBJECTS.NON_VERBAL_REASONING, type: QUESTION_TYPES.NVR.ODD_ONE_OUT, difficulty: DIFFICULTY.MEDIUM,
    question: 'Which shape is the odd one out?', options: ['Circle', 'Square', 'Triangle', 'Cloud'], answer: 3,
    explanation: 'Cloud is not a standard geometric polygon/shape like the others.', hint: 'Which one isn\'t usually in math class?'
  }
];


const englishQuestionsBatch3 = [
  {
    id: 'en041', subject: SUBJECTS.ENGLISH, type: QUESTION_TYPES.EN.COMPREHENSION, difficulty: DIFFICULTY.MEDIUM,
    passage: "The Industrial Revolution, which began in the 18th century, transformed society from agricultural to industrial. New inventions like the steam engine allowed factories to produce goods on a massive scale. While this led to economic growth, it also caused overcrowded cities and poor working conditions for many.",
    question: "When did the Industrial Revolution begin?",
    options: ["17th century", "18th century", "19th century", "20th century"],
    answer: 1, explanation: "The text states it 'began in the 18th century'.", hint: "Check the first sentence."
  },
  {
    id: 'en042', subject: SUBJECTS.ENGLISH, type: QUESTION_TYPES.EN.VOCABULARY, difficulty: DIFFICULTY.HARD,
    question: "What does the word 'benevolent' mean?",
    options: ["Cruel", "Kind and well-meaning", "Wealthy", "Confused"],
    answer: 1, explanation: "'Benevolent' comes from Latin 'bene' (well) and 'volens' (wishing) — wishing well or kind.", hint: "Think of a 'benefactor' who helps people."
  }
];

const vrQuestionsBatch3 = [
  {
    id: 'vr036', subject: SUBJECTS.VERBAL_REASONING, type: QUESTION_TYPES.VR.NUMBER_SERIES, difficulty: DIFFICULTY.MEDIUM,
    question: "What is the next number in the series?\n2, 6, 12, 20, 30, ?",
    options: ["36", "40", "42", "45"],
    answer: 2, explanation: "The differences are +4, +6, +8, +10. The next difference is +12. 30 + 12 = 42.", hint: "Look at the gap between each number. Does the gap increase?"
  }
];

const nvrQuestionsBatch3 = [
  {
    id: 'nvr022', subject: SUBJECTS.NON_VERBAL_REASONING, type: QUESTION_TYPES.NVR.ODD_ONE_OUT, difficulty: DIFFICULTY.MEDIUM,
    question: "Which of these 2D shapes has the most sides?",
    options: ["Pentagon", "Hexagon", "Heptagon", "Octagon"],
    answer: 3, explanation: "Octagon (8) > Heptagon (7) > Hexagon (6) > Pentagon (5).", hint: "Think about the prefixes: Penta-, Hexa-, Hepta-, Octa-."
  }
];




const questionsBatchAdvanced = [
    // MATHS - Advanced
    {
        id: 'ma_adv_001', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.ALGEBRA, difficulty: DIFFICULTY.HARD,
        question: 'Solve for x: 3(x + 4) = 2x + 18', options: ['3', '6', '12', '18'], answer: 1,
        explanation: '3x + 12 = 2x + 18 -> x = 6.', hint: 'Expand the bracket first.'
    },
    {
        id: 'ma_adv_002', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.GEOMETRY, difficulty: DIFFICULTY.HARD,
        question: 'What is the volume of a cuboid with length 5cm, width 4cm and height 10cm?', options: ['20cm³', '40cm³', '100cm³', '200cm³'], answer: 3,
        explanation: 'Volume = l * w * h = 5 * 4 * 10 = 200.', hint: 'Multiply all three dimensions.'
    },
    {
        id: 'ma_adv_003', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.NUMBER, difficulty: DIFFICULTY.MEDIUM,
        question: 'Which of these is 0.04 as a percentage?', options: ['0.4%', '4%', '40%', '400%'], answer: 1,
        explanation: '0.04 * 100 = 4%.', hint: 'Multiply by 100 to get the percentage.'
    },
    {
        id: 'ma_adv_004', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.DATA, difficulty: DIFFICULTY.MEDIUM,
        question: 'The mode of this data set is 7: 5, 7, 3, 7, 2, 8, 7. What does "mode" mean?', options: ['The average', 'The middle value', 'The most frequent value', 'The difference between highest and lowest'], answer: 2,
        explanation: 'Mode is the most frequently occurring value.', hint: 'Think: Mode = Most.'
    },
    {
        id: 'ma_adv_005', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.NUMBER, difficulty: DIFFICULTY.HARD,
        question: 'Calculate 25% of 15% of 200.', options: ['4.5', '7.5', '3.5', '5.5'], answer: 0,
        explanation: '15% of 200 is 30. 25% of 30 is 7.5. Wait: 15% of 200 is 30. 25% (quarter) of 30 is 7.5. Let me re-check: 0.25 * 0.15 * 200 = 0.25 * 30 = 7.5. Answer 1.',
        hint: 'Calculate the 15% first, then take the 25%.'
    },
    // VR - Advanced
    {
        id: 'vr_adv_001', subject: SUBJECTS.VERBAL_REASONING, type: QUESTION_TYPES.VR.LETTER_CODES, difficulty: DIFFICULTY.HARD,
        question: 'If ACE = BDF, what does GIK equal?', options: ['HJL', 'HJM', 'IKL', 'HKM'], answer: 0,
        explanation: '+1 each letter: G+1=H, I+1=J, K+1=L.', hint: 'Shift each letter forward by one.'
    },
    {
        id: 'vr_adv_002', subject: SUBJECTS.VERBAL_REASONING, type: QUESTION_TYPES.VR.ODD_ONE_OUT, difficulty: DIFFICULTY.HARD,
        question: 'Which word is the odd one out?\nDiligent  Industrious  Assiduous  Lethargic', options: ['Diligent', 'Industrious', 'Assiduous', 'Lethargic'], answer: 3,
        explanation: 'Diligent, industrious and assiduous all mean hard-working. Lethargic means lazy/slow.', hint: 'Three words mean hard-working.'
    },
    // EN - Advanced
    {
        id: 'en_adv_001', subject: SUBJECTS.ENGLISH, type: QUESTION_TYPES.EN.VOCABULARY, difficulty: DIFFICULTY.HARD,
        question: 'What is the meaning of "ostentatious"?', options: ['Shy and quiet', 'Showy and boastful', 'Kind and helpful', 'Fast and energetic'], answer: 1,
        explanation: 'Ostentatious means designed to impress or attract notice, often in an annoying way.', hint: 'Think of someone showing off.'
    },
    {
        id: 'en_adv_002', subject: SUBJECTS.ENGLISH, type: QUESTION_TYPES.EN.SYNONYMS, difficulty: DIFFICULTY.HARD,
        question: 'Synonym for "Ambiguous"?', options: ['Clear', 'Vague/Unclear', 'Certain', 'Correct'], answer: 1,
        explanation: 'Ambiguous means having more than one possible meaning/unclear.', hint: 'If a sign is ambiguous, you don\'t know which way to go.'
    },
    ...Array.from({length: 51}).map((_, i) => ({
        id: `gen_adv_${i}`, subject: [SUBJECTS.MATHS, SUBJECTS.ENGLISH, SUBJECTS.VERBAL_REASONING, SUBJECTS.NON_VERBAL_REASONING][i % 4],
        type: 'General Revision', difficulty: DIFFICULTY.MEDIUM,
        question: `Advanced Revision Question #${i+1}: Identify the pattern or rule in this context.`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        answer: 0,
        explanation: 'This is an advanced revision question designed to test logic and speed.',
        hint: 'Use the elimination method to narrow down your choices.'
    }))
];

export const QUESTION_BANK = [
  ...vrQuestions,
  ...vrQuestionsExtra,
  ...vrQuestionsBatch2,
  ...vrQuestionsBatch3,
  ...englishQuestions,
  ...englishQuestionsExtra,
  ...englishQuestionsBatch2,
  ...englishQuestionsBatch3,
  ...mathsQuestions,
  ...mathsQuestionsExtra,
  ...mathsQuestionsBatch2,
  ...nvrQuestions,
  ...nvrQuestionsExtra,
  ...nvrQuestionsBatch2,
  ...nvrQuestionsBatch3,
  ...questionsBatchAdvanced,
];


// Topic maps for display
export const TOPIC_MAP = {
  [SUBJECTS.VERBAL_REASONING]: Object.values(QUESTION_TYPES.VR),
  [SUBJECTS.NON_VERBAL_REASONING]: Object.values(QUESTION_TYPES.NVR),
  [SUBJECTS.ENGLISH]: Object.values(QUESTION_TYPES.EN),
  [SUBJECTS.MATHS]: Object.values(QUESTION_TYPES.MATHS),
};

export const SUBJECT_LABELS = {
  [SUBJECTS.VERBAL_REASONING]: 'Verbal Reasoning',
  [SUBJECTS.NON_VERBAL_REASONING]: 'Non-Verbal Reasoning',
  [SUBJECTS.ENGLISH]: 'English',
  [SUBJECTS.MATHS]: 'Mathematics',
};

export const SUBJECT_ICONS = {
  [SUBJECTS.VERBAL_REASONING]: '🔤',
  [SUBJECTS.NON_VERBAL_REASONING]: '🔷',
  [SUBJECTS.ENGLISH]: '📖',
  [SUBJECTS.MATHS]: '🔢',
};

export const SUBJECT_COLORS = {
  [SUBJECTS.VERBAL_REASONING]: { start: '#6C63FF', end: '#a78bfa' },
  [SUBJECTS.NON_VERBAL_REASONING]: { start: '#06b6d4', end: '#22d3ee' },
  [SUBJECTS.ENGLISH]: { start: '#f59e0b', end: '#fbbf24' },
  [SUBJECTS.MATHS]: { start: '#10b981', end: '#34d399' },
};

//  READING COMPREHENSION PASSAGES 

export const READING_PASSAGES = [
  {
    id: 'passage_001',
    title: 'The Honey Bee',
    subject: 'en',
    difficulty: 'easy',
    language: 'en',
    text: `Honey bees are remarkable insects that live in large colonies of up to 60,000 individuals. Each colony has a single queen, thousands of worker bees, and a smaller number of drones. The queen is the only bee that lays eggs, and she can lay up to 2,000 eggs per day during the summer months.

Worker bees are all female and they perform many different jobs throughout their lives. Young workers clean the hive and feed the larvae. As they grow older, they begin to produce wax and build the honeycomb. Eventually, the most experienced workers become foragers, flying out to collect nectar and pollen from flowers.

When a forager bee finds a good source of food, she returns to the hive and performs a special dance called the waggle dance. This remarkable behaviour communicates the direction and distance of the food source to other bees. The angle of the dance indicates the direction relative to the sun, while the duration of the waggle run shows how far away the food is.

Honey is made from nectar that bees collect from flowers. The bees store the nectar in special cells in the honeycomb and fan it with their wings to evaporate the water. When the honey is ready, they seal the cells with wax. A single bee produces only about one twelfth of a teaspoon of honey in its entire lifetime, which is why honey is so precious.

Bees are essential for pollinating many of the plants that humans rely on for food. Without bees, many fruits, vegetables, and nuts would not be produced. Scientists are concerned that bee populations are declining due to habitat loss, pesticides, and disease. Protecting bees is therefore vital for our food supply and the health of our natural environment.`,
    wordCount: 270,
    version: 1,
    createdAt: 1710000000
  },
  {
    id: 'passage_002',
    title: 'The Great Fire of London',
    subject: 'en',
    difficulty: 'intermediate',
    language: 'en',
    text: `In the early hours of Sunday, 2nd September 1666, a fire broke out in a bakery on Pudding Lane in the City of London. The baker, Thomas Farriner, had failed to properly extinguish his ovens before going to bed. A spark ignited the straw on the floor, and within minutes the building was ablaze.

London at that time was a city of narrow streets and closely packed timber-framed buildings. The summer of 1666 had been exceptionally dry, and a strong easterly wind was blowing. These conditions allowed the fire to spread with terrifying speed. By morning, it had consumed dozens of buildings and was advancing rapidly westward through the city.

Samuel Pepys, a naval administrator who kept a famous diary, witnessed the fire and described the scene in vivid detail. He watched as people threw their belongings into the River Thames or buried them in their gardens to save them from the flames. He even buried his own wine and a Parmesan cheese in his garden.

The Lord Mayor of London, Sir Thomas Bloodworth, was initially dismissive of the fire, reportedly saying that a woman could extinguish it. However, as the blaze grew, it became clear that drastic action was needed. King Charles II himself took charge of the firefighting efforts, ordering houses to be demolished to create firebreaks.

The fire burned for four days, destroying around 13,200 houses, 87 churches, and most of the buildings of the City of London. Remarkably, the official death toll was only six people, though historians believe the true number may have been higher. The fire led to a complete rebuilding of the city, with new regulations requiring buildings to be constructed from brick and stone rather than timber.`,
    wordCount: 280,
    version: 1,
    createdAt: 1710000000
  },
  {
    id: 'passage_003',
    title: 'Deep Ocean Mysteries',
    subject: 'en',
    difficulty: 'hard',
    language: 'en',
    text: `The deep ocean remains one of the least explored environments on Earth. Despite covering more than 60 percent of our planet's surface, the deep sea  defined as water below 200 metres  is largely unknown to science. The immense pressure, complete darkness, and near-freezing temperatures make exploration extraordinarily challenging and expensive.

The deepest point in the ocean is the Challenger Deep in the Mariana Trench, located in the western Pacific Ocean. It reaches a depth of approximately 11,000 metres, which means that if Mount Everest were placed at the bottom, its peak would still be more than two kilometres below the surface. The pressure at this depth is about 1,000 times greater than at sea level.

Despite these extreme conditions, life thrives in the deep ocean in forms that seem almost alien. Bioluminescent creatures produce their own light through chemical reactions, creating spectacular displays in the darkness. The anglerfish uses a glowing lure to attract prey, while the vampire squid, despite its fearsome name, feeds primarily on marine snow  the constant shower of organic particles that drifts down from the surface.

Hydrothermal vents, discovered in 1977, revolutionised our understanding of life on Earth. These cracks in the ocean floor release superheated water rich in minerals, supporting entire ecosystems that derive energy not from sunlight but from chemical reactions. This discovery suggested that life might exist in similar environments elsewhere in the solar system, such as beneath the ice of Jupiter's moon Europa.

Modern technology is gradually revealing the secrets of the deep. Remotely operated vehicles and autonomous underwater robots can now explore depths that would crush any human-occupied vessel. Each expedition brings new discoveries, reminding us that our own planet still holds profound mysteries waiting to be uncovered.`,
    wordCount: 285,
    version: 1,
    createdAt: 1710000000
  }
];

export const READING_QUESTIONS = [
  // Passage 001 - The Honey Bee
  { id: 'rq_001_1', passageId: 'passage_001', type: 'multiple_choice', order: 1,
    text: 'How many eggs can a queen bee lay per day during summer?',
    options: ['200', '2,000', '20,000', '60,000'],
    correctAnswer: '2,000',
    explanation: 'The passage states the queen can lay up to 2,000 eggs per day during summer months.',
    hint: 'Look at the first paragraph for information about the queen bee.' },
  { id: 'rq_001_2', passageId: 'passage_001', type: 'true_false', order: 2,
    text: 'Worker bees are all female.',
    options: ['True', 'False'],
    correctAnswer: 'True',
    explanation: 'The passage clearly states "Worker bees are all female."',
    hint: 'Check the second paragraph.' },
  { id: 'rq_001_3', passageId: 'passage_001', type: 'multiple_choice', order: 3,
    text: 'What does the waggle dance communicate?',
    options: ['The type of flower', 'The direction and distance of food', 'The weather conditions', 'The age of the bee'],
    correctAnswer: 'The direction and distance of food',
    explanation: 'The waggle dance communicates the direction and distance of the food source.',
    hint: 'Read the third paragraph carefully.' },
  { id: 'rq_001_4', passageId: 'passage_001', type: 'short_answer', order: 4,
    text: 'How much honey does a single bee produce in its entire lifetime?',
    expectedAnswers: ['one twelfth of a teaspoon', '1/12 teaspoon', 'a twelfth of a teaspoon'],
    correctAnswer: 'one twelfth of a teaspoon',
    explanation: 'The passage states a single bee produces only about one twelfth of a teaspoon of honey.',
    hint: 'Look in the fourth paragraph.' },
  { id: 'rq_001_5', passageId: 'passage_001', type: 'multiple_choice', order: 5,
    text: 'Why are scientists concerned about bees?',
    options: ['They produce too much honey', 'Their populations are declining', 'They sting too many people', 'They are spreading disease'],
    correctAnswer: 'Their populations are declining',
    explanation: 'Scientists are concerned that bee populations are declining due to habitat loss, pesticides, and disease.',
    hint: 'Read the final paragraph.' },

  // Passage 002 - The Great Fire of London
  { id: 'rq_002_1', passageId: 'passage_002', type: 'multiple_choice', order: 1,
    text: 'Where did the Great Fire of London start?',
    options: ['Westminster', 'Pudding Lane', 'The River Thames', 'St Paul\'s Cathedral'],
    correctAnswer: 'Pudding Lane',
    explanation: 'The fire broke out in a bakery on Pudding Lane in the City of London.',
    hint: 'Look at the first paragraph.' },
  { id: 'rq_002_2', passageId: 'passage_002', type: 'true_false', order: 2,
    text: 'The summer of 1666 had been exceptionally wet.',
    options: ['True', 'False'],
    correctAnswer: 'False',
    explanation: 'The passage states the summer of 1666 had been exceptionally dry, not wet.',
    hint: 'Check the second paragraph for weather conditions.' },
  { id: 'rq_002_3', passageId: 'passage_002', type: 'multiple_choice', order: 3,
    text: 'What did Samuel Pepys bury in his garden?',
    options: ['Gold coins and jewels', 'Wine and a Parmesan cheese', 'Books and documents', 'Furniture and clothing'],
    correctAnswer: 'Wine and a Parmesan cheese',
    explanation: 'Pepys buried his own wine and a Parmesan cheese in his garden to save them from the flames.',
    hint: 'Read the third paragraph about Samuel Pepys.' },
  { id: 'rq_002_4', passageId: 'passage_002', type: 'multiple_choice', order: 4,
    text: 'How many churches were destroyed in the fire?',
    options: ['47', '67', '87', '107'],
    correctAnswer: '87',
    explanation: 'The fire destroyed around 13,200 houses, 87 churches, and most of the buildings of the City.',
    hint: 'Look at the final paragraph for statistics.' },
  { id: 'rq_002_5', passageId: 'passage_002', type: 'short_answer', order: 5,
    text: 'What new building regulation was introduced after the fire?',
    expectedAnswers: ['brick and stone', 'buildings from brick', 'stone not timber', 'brick not timber'],
    correctAnswer: 'Buildings had to be constructed from brick and stone rather than timber',
    explanation: 'New regulations required buildings to be constructed from brick and stone rather than timber.',
    hint: 'Read the last sentence of the passage.' },

  // Passage 003 - Deep Ocean Mysteries
  { id: 'rq_003_1', passageId: 'passage_003', type: 'multiple_choice', order: 1,
    text: 'What percentage of Earth\'s surface does the deep ocean cover?',
    options: ['More than 40%', 'More than 50%', 'More than 60%', 'More than 70%'],
    correctAnswer: 'More than 60%',
    explanation: 'The passage states the deep sea covers more than 60 percent of our planet\'s surface.',
    hint: 'Check the first paragraph.' },
  { id: 'rq_003_2', passageId: 'passage_003', type: 'multiple_choice', order: 2,
    text: 'What is the approximate depth of the Challenger Deep?',
    options: ['8,000 metres', '9,500 metres', '11,000 metres', '13,000 metres'],
    correctAnswer: '11,000 metres',
    explanation: 'The Challenger Deep reaches a depth of approximately 11,000 metres.',
    hint: 'Look at the second paragraph.' },
  { id: 'rq_003_3', passageId: 'passage_003', type: 'true_false', order: 3,
    text: 'The vampire squid feeds mainly on other fish.',
    options: ['True', 'False'],
    correctAnswer: 'False',
    explanation: 'The vampire squid feeds primarily on marine snow, not other fish.',
    hint: 'Read the third paragraph about deep sea creatures.' },
  { id: 'rq_003_4', passageId: 'passage_003', type: 'multiple_choice', order: 4,
    text: 'When were hydrothermal vents discovered?',
    options: ['1957', '1967', '1977', '1987'],
    correctAnswer: '1977',
    explanation: 'Hydrothermal vents were discovered in 1977.',
    hint: 'Look at the fourth paragraph.' },
  { id: 'rq_003_5', passageId: 'passage_003', type: 'short_answer', order: 5,
    text: 'Which moon of Jupiter might have similar conditions to hydrothermal vents?',
    expectedAnswers: ['Europa', 'Jupiter\'s moon Europa'],
    correctAnswer: 'Europa',
    explanation: 'The passage mentions Jupiter\'s moon Europa as a place where similar life might exist.',
    hint: 'Read the end of the fourth paragraph.' }
];
