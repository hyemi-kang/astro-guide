export interface ConstellationInfo {
  /** English meaning of the Latin name */
  meaning: string
  /** area on the celestial sphere, square degrees (IAU boundaries) */
  area: number
  origin: string
  zodiac?: boolean
  /** Wikipedia article title, when it differs from "<Name> (constellation)" */
  wiki?: string
  story?: string
  fact?: string
  find?: string
}

const PTOLEMY = 'Ptolemy, 2nd century (Almagest)'
const KEYSER = 'Keyser & de Houtman, c. 1595–97'
const PLANCIUS = 'Petrus Plancius, c. 1592–1612'
const HEVELIUS = 'Johannes Hevelius, 1690'
const LACAILLE = 'Nicolas-Louis de Lacaille, 1756'

export const CONSTELLATION_INFO: Record<string, ConstellationInfo> = {
  And: {
    meaning: 'The Chained Princess', area: 722, origin: PTOLEMY,
    story: 'Andromeda was the daughter of King Cepheus and Queen Cassiopeia of Ethiopia. When her mother boasted that she was more beautiful than the sea nymphs, Poseidon sent the sea monster Cetus to ravage the coast, and Andromeda was chained to a rock as a sacrifice. The hero Perseus, returning from slaying Medusa, rescued her and married her.',
    fact: 'The Andromeda Galaxy (M31), about 2.5 million light-years away, is the most distant object most people can see with the naked eye. It is blueshifted: it is moving toward us at roughly 110 km/s. Older models predicted a collision with the Milky Way in 4–5 billion years; newer analyses put the odds of a merger within 10 billion years at about 50 %.',
    find: 'Start from the Great Square of Pegasus and follow the two long chains of stars that stream away from its corner at Alpheratz.',
  },
  Ant: { meaning: 'The Air Pump', area: 239, origin: LACAILLE },
  Aps: { meaning: 'The Bird of Paradise', area: 206, origin: KEYSER },
  Aqr: {
    meaning: 'The Water Bearer', area: 980, origin: PTOLEMY, zodiac: true,
    story: 'Aquarius is usually identified with Ganymede, the Trojan prince whom Zeus carried to Olympus to serve as cupbearer to the gods. The stream of water pouring from the jar flows down toward the Southern Fish, Piscis Austrinus. The constellation is far older than the Greeks: Babylonian astronomers already saw a figure pouring water here.',
    fact: 'The TRAPPIST-1 system — a small red dwarf 40 light-years away with seven Earth-sized planets, three of them in the habitable zone — lies in Aquarius. The Eta Aquariids (May) and Delta Aquariids (July) are meteor showers; the Eta Aquariids are debris from Halley\'s Comet.',
  },
  Aql: {
    meaning: 'The Eagle', area: 652, origin: PTOLEMY,
    story: 'In Greek myth the eagle carried Zeus\'s thunderbolts and swept the youth Ganymede up to Olympus. In East Asia the bright star Altair is the Herdsman (Gyeonwoo / Hikoboshi) who can meet the Weaver Girl Vega (Jingnyeo / Orihime) across the Milky Way only once a year, on the 7th night of the 7th month — the festival of Chilseok and Tanabata.',
    fact: 'Altair is only 16.7 light-years away and spins once in about 9 hours — so fast that it is visibly flattened. Altair, Vega and Deneb form the Summer Triangle.',
    find: 'Look for the bright star Altair flanked by two fainter stars in a short row, south of the Summer Triangle\'s centre.',
  },
  Ara: { meaning: 'The Altar', area: 237, origin: PTOLEMY },
  Ari: {
    meaning: 'The Ram', area: 441, origin: PTOLEMY, zodiac: true,
    story: 'Aries is the golden-fleeced ram that rescued Phrixus and Helle from their stepmother. Phrixus sacrificed the ram to Zeus and hung the golden fleece in a grove, from which Jason and the Argonauts later fetched it.',
    fact: 'About 2,000 years ago the Sun crossed the celestial equator at the March equinox in Aries, which is why astronomers still call that point "the First Point of Aries" — even though, because of precession, it now lies in Pisces.',
  },
  Aur: {
    meaning: 'The Charioteer', area: 657, origin: PTOLEMY,
    story: 'Auriga is often identified with Erichthonius, a lame king of Athens who is said to have invented the four-horse chariot. The small triangle of stars near Capella, "the Kids", represents the young goats the charioteer carries.',
    fact: 'Capella is not one star but two pairs: two yellow giants orbiting each other every 104 days, plus a distant pair of red dwarfs. The eclipsing binary Epsilon Aurigae dims for nearly two years every 27 years.',
    find: 'Capella is the bright yellowish star high in the northern winter sky; the rest of Auriga makes a lopsided pentagon next to it.',
  },
  Boo: {
    meaning: 'The Herdsman', area: 907, origin: PTOLEMY,
    story: 'Boötes drives the Great Bear around the pole, which is why it is sometimes called the Bear Driver. Some stories identify him as Arcas, son of Callisto, who was placed in the sky near his transformed mother.',
    fact: 'Arcturus is the fourth-brightest star in the night sky, an orange giant 37 light-years away. It belongs to the old "halo" population and is moving through the Galactic disc at about 120 km/s.',
    find: '"Follow the arc to Arcturus, then speed on to Spica": extend the curve of the Big Dipper\'s handle.',
  },
  Cae: { meaning: 'The Chisel', area: 125, origin: LACAILLE },
  Cam: { meaning: 'The Giraffe', area: 757, origin: PLANCIUS },
  Cnc: {
    meaning: 'The Crab', area: 506, origin: PTOLEMY, zodiac: true,
    story: 'Cancer is the crab that Hera sent to distract Heracles while he fought the Hydra. Heracles crushed it under his foot, and Hera placed it in the sky in gratitude for its service.',
    fact: 'Cancer is the faintest of the zodiac constellations, but it holds the Beehive Cluster (M44, Praesepe), about 590 light-years away — Galileo was the first to resolve it into stars in 1609.',
  },
  CVn: { meaning: 'The Hunting Dogs', area: 465, origin: HEVELIUS },
  CMa: {
    meaning: 'The Greater Dog', area: 380, origin: PTOLEMY,
    story: 'Canis Major is the faithful hound of Orion the Hunter, following at his heels across the winter sky. Sirius, its brightest star, was so important to the Egyptians that its first dawn appearance each year signalled the flooding of the Nile.',
    fact: 'Sirius, the brightest star in the night sky, is only 8.6 light-years away. Its companion Sirius B was the first white dwarf ever found (1862) — a star as massive as the Sun squeezed to the size of the Earth. The "dog days" of summer are named after Sirius.',
    find: 'Follow the line of Orion\'s Belt down and to the left; the first very bright star you meet is Sirius.',
  },
  CMi: {
    meaning: 'The Lesser Dog', area: 183, origin: PTOLEMY,
    story: 'Canis Minor is the smaller dog accompanying Orion. Procyon\'s name comes from the Greek for "before the dog", because it rises just before Sirius.',
    fact: 'Procyon, 11.5 light-years away, forms the Winter Triangle with Sirius and Betelgeuse. Like Sirius it has a white-dwarf companion.',
  },
  Cap: {
    meaning: 'The Sea-Goat', area: 414, origin: PTOLEMY, zodiac: true,
    story: 'Capricornus is a goat with the tail of a fish. In one myth the god Pan, fleeing the monster Typhon, jumped into the Nile — the half of him in the water turned into a fish. The Babylonians pictured the same goat-fish more than 3,000 years ago.',
    fact: 'Around 2,000 years ago the Sun was in Capricornus at the December solstice, which is why the latitude of the southern tropic is still called the Tropic of Capricorn.',
  },
  Car: { meaning: 'The Keel', area: 494, origin: 'Lacaille, 1756 (split from Argo Navis)', fact: 'Canopus, the second-brightest star in the night sky, lies here, as does the Carina Nebula, a vast star-forming region around the unstable star Eta Carinae.' },
  Cas: {
    meaning: 'The Queen', area: 598, origin: PTOLEMY,
    story: 'Queen Cassiopeia of Ethiopia boasted that she and her daughter Andromeda were more beautiful than the Nereids. As punishment Poseidon sent a sea monster, and Cassiopeia was set among the stars in her throne, circling the pole — spending part of each night upside-down as a lesson in humility.',
    fact: 'Tycho Brahe observed the supernova of 1572 here (SN 1572), proof that the heavens were not unchanging. Cassiopeia A, the remnant of another supernova about 11,000 light-years away, is one of the brightest radio sources in the sky.',
    find: 'A bold "W" or "M" opposite the Big Dipper across Polaris.',
  },
  Cen: {
    meaning: 'The Centaur', area: 1060, origin: PTOLEMY,
    story: 'Centaurus is usually identified with the wise centaur Chiron, tutor of Achilles, Jason and Asclepius, who gave up his immortality to end his suffering after being wounded by a poisoned arrow.',
    fact: 'Alpha Centauri, the nearest star system to the Sun at 4.37 light-years, is here, with Proxima Centauri (4.24 ly) as its closest member. Omega Centauri is the largest globular cluster in the Milky Way, holding roughly 10 million stars.',
    find: 'Visible from the southern hemisphere and low in the sky for the tropics; the two bright "Pointers" Alpha and Beta Centauri point to the Southern Cross.',
  },
  Cep: {
    meaning: 'The King', area: 588, origin: PTOLEMY,
    story: 'King Cepheus ruled Ethiopia, husband of Cassiopeia and father of Andromeda. He agreed to chain his daughter to the rock to save his kingdom, and Perseus rescued her.',
    fact: 'Delta Cephei is the prototype of the Cepheid variables, whose pulsation period reveals their true brightness — the "standard candles" Henrietta Leavitt and Edwin Hubble used to measure the scale of the Universe. Mu Cephei, the Garnet Star, is a red supergiant.',
    find: 'A house shape — a square with a pointed roof — sitting between Cassiopeia and Polaris.',
  },
  Cet: {
    meaning: 'The Sea Monster (Whale)', area: 1231, origin: PTOLEMY,
    story: 'Cetus is the sea monster sent by Poseidon to punish Cassiopeia\'s boast. It was about to devour the chained Andromeda when Perseus turned it to stone with Medusa\'s head.',
    fact: 'Mira (Omicron Ceti) was the first variable star discovered (1596, David Fabricius). It swells and fades over about 332 days, from magnitude 2 to 10 — easily visible to the naked eye at its brightest, then gone.',
  },
  Cha: { meaning: 'The Chameleon', area: 132, origin: KEYSER },
  Cir: { meaning: 'The Compasses', area: 93, origin: LACAILLE },
  Col: { meaning: 'The Dove', area: 270, origin: PLANCIUS },
  Com: { meaning: 'Berenice\'s Hair', area: 386, origin: 'Tycho Brahe / Caspar Vopel, 16th century', fact: 'Named for the hair that Queen Berenice II of Egypt cut off and offered to the gods. It contains the north pole of our Galaxy and a rich cluster of thousands of galaxies.' },
  CrA: { meaning: 'The Southern Crown', area: 128, origin: PTOLEMY },
  CrB: {
    meaning: 'The Northern Crown', area: 179, origin: PTOLEMY,
    story: 'The crown that the god Dionysus gave to Ariadne, daughter of King Minos, after she was abandoned by Theseus; he threw it into the sky, where its jewels became stars.',
    fact: 'T Coronae Borealis is a recurrent nova that erupted in 1866 and 1946, and astronomers have been waiting for its next outburst, when it should briefly rise to around magnitude 2.',
    find: 'A small, neat semicircle of stars near Arcturus and Vega.',
  },
  Crv: {
    meaning: 'The Crow', area: 184, origin: PTOLEMY,
    story: 'Apollo sent the crow to fetch water, but it lingered to eat figs while waiting for them to ripen, then blamed the water snake Hydra. Apollo placed all three in the sky: the crow and cup are forever just out of reach of the snake.',
    fact: 'A small kite-shaped group of four stars riding on the tail of Hydra, near Spica.',
  },
  Crt: { meaning: 'The Cup', area: 282, origin: PTOLEMY },
  Cru: {
    meaning: 'The Southern Cross', area: 68, origin: 'Plancius, 1598 (formerly part of Centaurus)',
    story: 'Ancient Greeks saw Crux as part of Centaurus; precession later carried it below the horizon of Europe. Navigators of the age of exploration rediscovered it, and Crux has become a symbol of the southern hemisphere.',
    fact: 'Crux is the smallest of all 88 constellations. It appears on the flags of Australia, New Zealand, Brazil, Papua New Guinea and Samoa. The long axis, extended about 4.5 times, points toward the south celestial pole. The dark Coalsack Nebula sits beside it.',
  },
  Cyg: {
    meaning: 'The Swan', area: 804, origin: PTOLEMY,
    story: 'Cygnus is associated with several swans of Greek myth: Zeus in disguise visiting Leda, and the musician Orpheus, transformed into a swan and placed near his lyre. The swan flies down the Milky Way, which was seen as the river of the sky.',
    fact: 'Deneb is among the most luminous stars visible — about 200,000 times the Sun, roughly 2,600 light-years away. Albireo, the swan\'s head, is a beautiful double of gold and blue stars. Cygnus X-1 was among the first strong black-hole candidates. NASA\'s Kepler telescope stared at this region to find exoplanets.',
    find: 'The Northern Cross: Deneb at the top, Albireo at the base, flying along the Milky Way in summer.',
  },
  Del: {
    meaning: 'The Dolphin', area: 189, origin: PTOLEMY,
    story: 'A dolphin helped Poseidon win the hand of the sea nymph Amphitrite and was rewarded with a place among the stars.',
    fact: 'The stars Sualocin and Rotanev are named with a hidden joke: read backward they spell "Nicolaus Venator", the Latinised name of Niccolò Cacciatore, an assistant at the Palermo observatory who published the names in 1814.',
  },
  Dor: { meaning: 'The Dolphinfish', area: 179, origin: KEYSER, fact: 'Most of the Large Magellanic Cloud, our largest satellite galaxy at about 160,000 light-years, lies in Dorado, along with the Tarantula Nebula.' },
  Dra: {
    meaning: 'The Dragon', area: 1083, origin: PTOLEMY,
    story: 'Draco is Ladon, the hundred-headed dragon that guarded the golden apples of the Hesperides until Heracles killed it. It coils around the north celestial pole, never setting for mid-northern observers.',
    fact: 'Thuban (Alpha Draconis) was the pole star about 4,700 years ago, in the age of the Egyptian pyramids. Because of precession the pole traces a circle in the sky once every 26,000 years.',
  },
  Equ: { meaning: 'The Little Horse', area: 72, origin: PTOLEMY },
  Eri: { meaning: 'The River Eridanus', area: 1138, origin: PTOLEMY, fact: 'The winding river ends at Achernar ("end of the river"), one of the flattest stars known because it spins so fast.' },
  For: { meaning: 'The Furnace', area: 398, origin: LACAILLE },
  Gem: {
    meaning: 'The Twins', area: 514, origin: PTOLEMY, zodiac: true,
    story: 'Castor and Pollux were inseparable twin brothers; Castor was mortal, Pollux the immortal son of Zeus. When Castor died, Pollux begged Zeus to let them share their fate, so they alternate between the underworld and Olympus — or, in the sky, stay together forever.',
    fact: 'Castor is actually a system of six stars. Pollux, 34 light-years away, has a confirmed giant planet. The Geminid meteor shower in December is debris from the asteroid 3200 Phaethon, and Clyde Tombaugh discovered Pluto in Gemini in 1930.',
    find: 'Two bright stars side by side, Castor and Pollux, to the upper left of Orion.',
  },
  Gru: { meaning: 'The Crane', area: 366, origin: KEYSER },
  Her: {
    meaning: 'Hercules', area: 1225, origin: PTOLEMY,
    story: 'The strongest of Greek heroes, Heracles performed twelve labours to atone for killing his family in a fit of madness induced by Hera. In the sky he kneels with his club, one foot on the head of the dragon Draco.',
    fact: 'M13, the Great Globular Cluster in Hercules, holds several hundred thousand stars about 22,000 light-years away. In 1974 humanity beamed the Arecibo message toward it. The Sun is moving toward a point near the border of Hercules and Lyra at about 20 km/s relative to nearby stars.',
    find: 'Find the "Keystone", a trapezoid of four stars between Vega and Arcturus.',
  },
  Hor: { meaning: 'The Pendulum Clock', area: 249, origin: LACAILLE },
  Hya: { meaning: 'The Water Snake', area: 1303, origin: PTOLEMY, fact: 'The largest of the 88 constellations by area; stretching over 100° of sky, it takes more than six hours to rise completely. Its brightest star, Alphard, is called "the solitary one".' },
  Hyi: { meaning: 'The Male Water Snake', area: 243, origin: KEYSER },
  Ind: { meaning: 'The Indian', area: 294, origin: KEYSER },
  Lac: { meaning: 'The Lizard', area: 201, origin: HEVELIUS },
  Leo: {
    meaning: 'The Lion', area: 947, origin: PTOLEMY, zodiac: true,
    story: 'Leo is the Nemean Lion, whose hide no weapon could pierce. Heracles strangled it as the first of his twelve labours and wore its skin as armour; Zeus placed the lion among the stars.',
    fact: 'Regulus, 79 light-years away, spins once in about 16 hours — near its breakup speed. The Leonid meteor shower in November, from Comet Tempel–Tuttle, produced spectacular storms in 1833 and 1966.',
    find: 'The "Sickle" — a backward question mark — marks the lion\'s head, with Regulus at its base.',
  },
  LMi: { meaning: 'The Little Lion', area: 232, origin: HEVELIUS },
  Lep: {
    meaning: 'The Hare', area: 290, origin: PTOLEMY,
    story: 'The hare lies at the feet of Orion, the hunter, perpetually chased by the hounds Canis Major and Canis Minor.',
    fact: 'Hind\'s Crimson Star (R Leporis) is one of the reddest stars visible in a small telescope — a carbon star whose atmosphere is thick with soot.',
  },
  Lib: {
    meaning: 'The Scales', area: 538, origin: PTOLEMY, zodiac: true,
    story: 'The Greeks saw this region as the claws of the neighbouring Scorpion. Romans reinterpreted it as the scales of justice held by Virgo (Astraea), and it is the only zodiac sign that depicts an inanimate object.',
    fact: 'Zubenelgenubi and Zubeneschamali mean "the southern claw" and "the northern claw" in Arabic — an echo of the older scorpion claws.',
  },
  Lup: { meaning: 'The Wolf', area: 334, origin: PTOLEMY },
  Lyn: { meaning: 'The Lynx', area: 545, origin: HEVELIUS },
  Lyr: {
    meaning: 'The Lyre', area: 286, origin: PTOLEMY,
    story: 'This is the lyre of Orpheus, made by Hermes from a tortoise shell. Orpheus\'s music was so beautiful that rocks and rivers wept; after his death Zeus set his instrument among the stars.',
    fact: 'Vega is the fifth-brightest star in the night sky, 25 light-years away. It was the pole star around 12,000 BCE and will be again about 13,700 CE. It was the first star other than the Sun to be photographed (1850) and have its spectrum recorded (1872). The Ring Nebula (M57) is a dying star\'s shell of gas.',
    find: 'Vega is the brilliant blue-white star almost overhead on summer evenings from mid-northern latitudes, with a small parallelogram of stars beside it.',
  },
  Men: { meaning: 'The Table Mountain', area: 153, origin: LACAILLE, fact: 'The only constellation named after a geographic feature — Table Mountain in South Africa, where Lacaille observed. It contains part of the Large Magellanic Cloud.' },
  Mic: { meaning: 'The Microscope', area: 210, origin: LACAILLE },
  Mon: { meaning: 'The Unicorn', area: 482, origin: PLANCIUS, fact: 'A faint constellation on the Milky Way holding the Rosette Nebula and Christmas Tree Cluster.' },
  Mus: { meaning: 'The Fly', area: 138, origin: KEYSER },
  Nor: { meaning: 'The Carpenter\'s Square', area: 165, origin: LACAILLE },
  Oct: { meaning: 'The Octant', area: 291, origin: LACAILLE, fact: 'Contains the south celestial pole, but the nearest naked-eye star, Sigma Octantis, is only magnitude 5.4 — the southern hemisphere has no bright "South Star".' },
  Oph: {
    meaning: 'The Serpent Bearer', area: 948, origin: PTOLEMY,
    story: 'Ophiuchus is Asclepius, the Greek god of medicine, who learned the secrets of healing — and even of raising the dead — from a serpent. Zeus killed him with a thunderbolt to protect the natural order, and later placed him in the sky.',
    fact: 'The Sun passes through Ophiuchus from about 30 November to 17 December, but it is not one of the 12 astrological signs. Kepler\'s Supernova of 1604 — the last supernova seen with the naked eye in our Galaxy — appeared here. Barnard\'s Star, the second-closest star system at 6 light-years, is also here.',
  },
  Ori: {
    meaning: 'The Hunter', area: 594, origin: PTOLEMY,
    story: 'Orion was a giant hunter in Greek myth who boasted he could kill every animal on Earth. In one version Gaia sent a scorpion that stung him; Zeus set Orion and the scorpion in the sky on opposite sides, so Orion sets as Scorpius rises and the two are never seen together.',
    fact: 'Betelgeuse is a red supergiant and will end as a supernova — within the next 100,000 years or so. Rigel is a blue supergiant about 120,000 times more luminous than the Sun. Just below the Belt the Orion Nebula (M42), 1,340 light-years away, is a stellar nursery visible to the naked eye as a faint fuzzy "star".',
    find: 'Three stars in a short straight row form Orion\'s Belt, flanked by bright red Betelgeuse above-left and blue-white Rigel below-right. The Belt points toward Sirius.',
  },
  Pav: { meaning: 'The Peacock', area: 378, origin: KEYSER },
  Peg: {
    meaning: 'The Winged Horse', area: 1121, origin: PTOLEMY,
    story: 'Pegasus sprang from the blood of Medusa when Perseus beheaded her. The winged horse later carried Bellerophon, who tried to fly to Olympus and was thrown to Earth, while Zeus kept Pegasus to carry his thunderbolts.',
    fact: 'The star 51 Pegasi hosts 51 Peg b, the first planet found orbiting a Sun-like star (1995, Michel Mayor and Didier Queloz — Nobel Prize in Physics 2019).',
    find: 'The Great Square of Pegasus — a huge square of four medium-bright stars that dominates the autumn sky. Its upper-left corner, Alpheratz, officially belongs to Andromeda.',
  },
  Per: {
    meaning: 'The Hero Perseus', area: 615, origin: PTOLEMY,
    story: 'Perseus, son of Zeus and Danaë, beheaded the snake-haired Medusa using a mirrored shield, then rescued Andromeda from the sea monster Cetus on the way home.',
    fact: 'Algol, the "Demon Star", is an eclipsing binary that dims noticeably every 2 days 21 hours — probably noticed since antiquity. The Perseid meteor shower in August is debris from Comet Swift–Tuttle, and the Double Cluster (h and χ Persei) is a splendid sight in binoculars.',
  },
  Phe: { meaning: 'The Phoenix', area: 469, origin: KEYSER },
  Pic: { meaning: 'The Painter\'s Easel', area: 247, origin: LACAILLE },
  Psc: {
    meaning: 'The Fishes', area: 889, origin: PTOLEMY, zodiac: true,
    story: 'Aphrodite and her son Eros, fleeing the monster Typhon, leapt into a river and turned into two fish — tied together with a cord so they would not lose one another.',
    fact: 'Because of precession, the March equinox point — the "First Point of Aries" — has been in Pisces since about 68 BCE and will move into Aquarius in the 27th century.',
  },
  PsA: { meaning: 'The Southern Fish', area: 245, origin: PTOLEMY, fact: 'Fomalhaut, "the mouth of the fish", is only 25 light-years away and has a dusty debris disc; it is often called the "Loneliest Star" because no other bright star is nearby in the autumn sky.' },
  Pup: { meaning: 'The Stern', area: 673, origin: 'Lacaille, 1756 (split from Argo Navis)' },
  Pyx: { meaning: 'The Compass', area: 221, origin: LACAILLE },
  Ret: { meaning: 'The Reticle', area: 114, origin: LACAILLE },
  Sge: { meaning: 'The Arrow', area: 80, origin: PTOLEMY },
  Sgr: {
    meaning: 'The Archer', area: 867, origin: PTOLEMY, zodiac: true,
    story: 'Sagittarius is a centaur drawing his bow, often identified with Chiron, or with Crotus, the satyr who invented archery. The bow is aimed at the heart of neighbouring Scorpius.',
    fact: 'The centre of the Milky Way lies in this direction, about 26,000 light-years away, where the radio source Sagittarius A* marks a supermassive black hole of about 4 million solar masses (Nobel Prize in Physics 2020 for Reinhard Genzel and Andrea Ghez). The constellation is rich in nebulae: Lagoon (M8), Trifid (M20) and Omega (M17).',
    find: 'The "Teapot" asterism sits in the brightest part of the summer Milky Way, low in the south from mid-northern latitudes.',
  },
  Sco: {
    meaning: 'The Scorpion', area: 497, origin: PTOLEMY, zodiac: true,
    story: 'The scorpion that stung Orion, according to one myth; the two are placed on opposite sides of the sky so they can never meet. In some versions Artemis sent the scorpion because Orion boasted that he could kill any animal.',
    fact: 'Antares, the heart of the scorpion, is a red supergiant about 550 light-years away. Its name means "rival of Mars" for its similar colour. The Sun\'s path crosses the Galactic plane close to Scorpius and Sagittarius.',
    find: 'The only constellation that really looks like its name: a long curve of stars ending in the "stinger" Shaula, with red Antares at the centre.',
  },
  Scl: { meaning: 'The Sculptor', area: 475, origin: LACAILLE, fact: 'Contains the south galactic pole and the Sculptor Galaxy (NGC 253).' },
  Sct: { meaning: 'The Shield', area: 109, origin: HEVELIUS },
  Ser: { meaning: 'The Serpent', area: 637, origin: PTOLEMY, wiki: 'Serpens', fact: 'The only constellation split into two separate parts: Serpens Caput (head) and Serpens Cauda (tail), either side of Ophiuchus. The Eagle Nebula (M16) with its "Pillars of Creation" lies in Serpens Cauda.' },
  Sex: { meaning: 'The Sextant', area: 314, origin: HEVELIUS },
  Tau: {
    meaning: 'The Bull', area: 797, origin: PTOLEMY, zodiac: true,
    story: 'Taurus is the white bull into which Zeus transformed himself to carry the Phoenician princess Europa across the sea to Crete — which is how the continent got its name. Only the front half of the bull is drawn, emerging from the waves.',
    fact: 'Aldebaran, the red eye of the bull, lies 65 light-years away and is not part of the Hyades cluster behind it (153 ly). The Pleiades (M45), about 444 light-years away, hold more than 1,000 stars about 100 million years old. The Crab Nebula (M1) is the remnant of the supernova of 1054, recorded by Chinese and Japanese astronomers.',
    find: 'A V-shaped face made by the Hyades with orange Aldebaran, with the tiny dipper-like Pleiades above-right.',
  },
  Tel: { meaning: 'The Telescope', area: 252, origin: LACAILLE },
  Tri: { meaning: 'The Triangle', area: 132, origin: PTOLEMY, fact: 'Contains the Triangulum Galaxy (M33), the third-largest galaxy of the Local Group, about 2.7 million light-years away.' },
  TrA: { meaning: 'The Southern Triangle', area: 110, origin: KEYSER },
  Tuc: { meaning: 'The Toucan', area: 295, origin: KEYSER, fact: 'Hosts the Small Magellanic Cloud and 47 Tucanae, the second-brightest globular cluster in the sky.' },
  UMa: {
    meaning: 'The Great Bear', area: 1280, origin: PTOLEMY,
    story: 'The nymph Callisto was turned into a bear — by Hera in anger, or by Artemis in some versions — and nearly killed by her own son, Arcas, while hunting. Zeus placed them both in the sky, as the Great Bear and the Little Bear (or Boötes).',
    fact: 'The Big Dipper is an asterism within Ursa Major. Five of its seven stars are moving together as the Ursa Major Moving Group, about 80 light-years away. Mizar and Alcor form a naked-eye double used as an eyesight test since antiquity, and the galaxies M81 and M82 lie a few degrees away.',
    find: 'The Big Dipper (the Plough). The two stars at the end of its bowl, Dubhe and Merak, point to Polaris.',
  },
  UMi: {
    meaning: 'The Little Bear', area: 256, origin: PTOLEMY,
    story: 'The Little Bear is Arcas, or sometimes one of the nymphs who nursed the infant Zeus. The Phoenicians navigated by it, while the Greeks used the Great Bear — leading some to call it the "Phoenician guide".',
    fact: 'Polaris, the North Star, is a Cepheid variable about 430 light-years away. It is about 0.7° from the true celestial pole today and will come closest (≈0.45°) around 2100. It is not the brightest star: it ranks around 50th.',
    find: 'Follow the pointer stars of the Big Dipper, or extend the line from the Cassiopeia "W".',
  },
  Vel: { meaning: 'The Sails', area: 500, origin: 'Lacaille, 1756 (split from Argo Navis)', fact: 'Its centre holds the Vela Pulsar, left over from a supernova about 11,000 years ago that was probably visible to early humans.' },
  Vir: {
    meaning: 'The Maiden', area: 1294, origin: PTOLEMY, zodiac: true,
    story: 'Virgo is linked to harvest goddesses: Demeter, whose grief over Persephone brought the seasons, or Astraea, the goddess of justice who left Earth during the Iron Age. Her star Spica marks the ear of grain in her hand.',
    fact: 'Virgo is the second-largest constellation. The Virgo Cluster of about 1,300 galaxies, 54 million light-years away, lies partly here; its central giant elliptical, M87, was the first black hole ever imaged (Event Horizon Telescope, 2019). Hipparchus used Spica to discover precession of the equinoxes around 127 BCE.',
    find: 'Spica is the bright blue-white star you reach by "speeding on" from Arcturus along the Big Dipper\'s arc.',
  },
  Vol: { meaning: 'The Flying Fish', area: 141, origin: KEYSER },
  Vul: { meaning: 'The Little Fox', area: 268, origin: HEVELIUS, fact: 'Contains the Dumbbell Nebula (M27), the first planetary nebula ever found (Charles Messier, 1764), and the Coathanger asterism.' },
}
