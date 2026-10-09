export interface StarInfo {
  /** spectral type as catalogued */
  spectral: string
  /** distance in light-years */
  distance: number
  /** short classification, shown with a glossary tooltip when it matches a term */
  kind: string
  /** typical age */
  age: string
  /** luminosity relative to the Sun */
  luminosity: string
  fact: string
  wiki?: string
}

/** Keyed by the catalogue name used in starnames.json. Distances and ages are rounded literature values. */
export const STAR_INFO: Record<string, StarInfo> = {
  Sirius: { spectral: 'A1V (+ DA2 white dwarf)', distance: 8.6, kind: 'Main-sequence star with a white-dwarf companion', age: '~240 million years', luminosity: '25×', fact: 'The brightest star in the night sky (mag −1.46). Its companion Sirius B was the first white dwarf ever found; it is about as massive as the Sun but only as large as the Earth.' },
  Canopus: { spectral: 'A9II', distance: 310, kind: 'Bright giant', age: '~25–30 million years', luminosity: '~10,000×', fact: 'The second-brightest star in the night sky. Spacecraft use it as a navigation reference because it is so bright and so far from the ecliptic.' },
  Arcturus: { spectral: 'K0III', distance: 37, kind: 'Red giant (orange giant)', age: '~7 billion years', luminosity: '~170×', fact: 'An old star from the Galactic halo that is passing through the disc at about 120 km/s. Its light was used to open the 1933 Chicago World\'s Fair.' },
  'Rigil Kentaurus': { spectral: 'G2V', distance: 4.37, kind: 'Sun-like star (Alpha Centauri A)', age: '~5–6 billion years', luminosity: '1.5×', fact: 'Part of the Alpha Centauri system, the closest star system to the Sun, together with Alpha Centauri B and Proxima Centauri (4.24 ly).' , wiki: 'Alpha Centauri' },
  Vega: { spectral: 'A0Va', distance: 25, kind: 'Main-sequence star', age: '~0.4–0.7 billion years', luminosity: '~40×', fact: 'Was the northern pole star around 12,000 BCE and will be again about 13,700 CE. It spins so fast that its equator bulges and is cooler than its poles, and it is surrounded by a dusty debris disc.' },
  Capella: { spectral: 'G8III + G0III', distance: 43, kind: 'Quadruple system of two yellow giants and two red dwarfs', age: '~600 million years', luminosity: '~80× (primary)', fact: 'Looks like a single star but is two pairs. The two giants orbit each other every 104 days.' },
  Rigel: { spectral: 'B8Ia', distance: 860, kind: 'Blue supergiant', age: '~8 million years', luminosity: '~120,000×', fact: 'Brighter than Betelgeuse in visible light despite being farther away. It will end its life as a Type II supernova.' },
  Procyon: { spectral: 'F5IV–V', distance: 11.5, kind: 'Subgiant with a white-dwarf companion', age: '~2 billion years', luminosity: '~7×', fact: 'One of the Sun\'s nearest neighbours; part of the Winter Triangle with Betelgeuse and Sirius.' },
  Betelgeuse: { spectral: 'M1–M2 Ia–Iab', distance: 550, kind: 'Red supergiant', age: '~8–10 million years', luminosity: '~100,000×', fact: 'Large enough to fill the orbit of Mars if placed at the Sun. In 2019–2020 it dimmed dramatically — the "Great Dimming" — as a cloud of dust formed. It will explode as a supernova within about 100,000 years, shining as bright as a half Moon.' },
  Achernar: { spectral: 'B6Vep', distance: 139, kind: 'Fast-rotating blue-white star', age: '~100 million years', luminosity: '~3,000×', fact: 'One of the flattest stars known: its equatorial diameter is about 56 % bigger than its polar diameter because it spins so fast.' },
  Hadar: { spectral: 'B1III', distance: 390, kind: 'Blue giant (multiple system)', age: '~14 million years', luminosity: '~40,000×', fact: 'Beta Centauri, one of the two "Pointers" that lead to the Southern Cross.' },
  Altair: { spectral: 'A7V', distance: 16.7, kind: 'Main-sequence star', age: '~1 billion years', luminosity: '~10×', fact: 'Rotates once in about 9 hours, so its shape is clearly flattened. In East Asia, it is the Herdsman star of the Tanabata / Chilseok festival.' },
  Acrux: { spectral: 'B0.5IV + B1V', distance: 320, kind: 'Blue sub-giant (multiple system)', age: '~10–15 million years', luminosity: '~25,000× (combined)', fact: 'Alpha Crucis, the brightest star of the Southern Cross, is a triple star system.' },
  Aldebaran: { spectral: 'K5III', distance: 65, kind: 'Red giant (orange giant)', age: '~6 billion years', luminosity: '~440×', fact: 'About 44 times the Sun\'s diameter. The Pioneer 10 probe is heading roughly toward it and would pass in about 2 million years.' },
  Antares: { spectral: 'M1.5Iab–Ib', distance: 550, kind: 'Red supergiant', age: '~12 million years', luminosity: '~75,000×', fact: 'If placed at the Sun it would extend beyond the orbit of Mars. Its name means "rival of Mars", because they share a reddish colour.' },
  Spica: { spectral: 'B1III–IV + B2V', distance: 250, kind: 'Blue giant binary', age: '~12 million years', luminosity: '~12,000×', fact: 'Two stars orbiting each other every four days, so close that their shapes are distorted. Hipparchus used its position to discover the precession of the equinoxes around 127 BCE.' },
  Pollux: { spectral: 'K0III', distance: 34, kind: 'Red giant (orange giant)', age: '~700 million years', luminosity: '~43×', fact: 'The closest giant star to the Sun, with a confirmed planet, Pollux b ("Thestias"), at least 2.3 times Jupiter\'s mass.' },
  Fomalhaut: { spectral: 'A3V', distance: 25, kind: 'Main-sequence star with a debris disc', age: '~440 million years', luminosity: '~16×', fact: 'Surrounded by a dusty ring, imaged directly by Hubble in 2008. Sometimes called the "Loneliest Star" because it is the only bright star in its patch of autumn sky.' },
  Deneb: { spectral: 'A2Ia', distance: 2600, kind: 'Blue-white supergiant', age: '~10–20 million years', luminosity: '~200,000×', fact: 'One of the farthest stars visible to the naked eye — its light left in the time of the Roman Empire\'s ancestors some 2,600 years ago.' },
  Regulus: { spectral: 'B8IVn', distance: 79, kind: 'Four-star system; fast-spinning blue-white star', age: '~1 billion years', luminosity: '~140×', fact: 'Spins once in about 16 hours, at about 96 % of the speed that would tear it apart, giving it a markedly oblate shape.' },
  Castor: { spectral: 'A1V', distance: 51, kind: 'Sextuple star system', age: '~300 million years', luminosity: '~50× (Aa)', fact: 'Six stars orbiting in three pairs. Visually it looks like a single bright star.' },
  Bellatrix: { spectral: 'B2III', distance: 250, kind: 'Blue giant', age: '~25 million years', luminosity: '~9,000×', fact: 'Marks Orion\'s left shoulder; its name means "female warrior".' },
  Alnilam: { spectral: 'B0Ia', distance: 2000, kind: 'Blue supergiant', age: '~4–6 million years', luminosity: '~375,000×', fact: 'The middle star of Orion\'s Belt and one of the most luminous stars visible to the naked eye.' },
  Alnitak: { spectral: 'O9.5Ib (+ others)', distance: 1260, kind: 'Blue supergiant (triple system)', age: '~6 million years', luminosity: '~100,000×', fact: 'Next to the Flame Nebula and the dark Horsehead Nebula.' },
  Mintaka: { spectral: 'O9.5II (+ others)', distance: 1200, kind: 'Blue giant (multiple system)', age: '~6 million years', luminosity: '~90,000×', fact: 'Sits almost exactly on the celestial equator, so it rises almost due east and sets almost due west for observers anywhere.' },
  Saiph: { spectral: 'B0.5Ia', distance: 650, kind: 'Blue supergiant', age: '~15 million years', luminosity: '~60,000×', fact: 'The star in Orion\'s right knee.' },
  Dubhe: { spectral: 'K0III + F0V', distance: 123, kind: 'Red giant (orange giant) binary', age: '~300 million years', luminosity: '~300×', fact: 'One of the two pointer stars in the Big Dipper\'s bowl that lead to Polaris.' },
  Merak: { spectral: 'A1V', distance: 80, kind: 'Main-sequence star', age: '~500 million years', luminosity: '~60×', fact: 'The other pointer star of the Big Dipper. It is part of the Ursa Major Moving Group.' },
  Alioth: { spectral: 'A1III–IVp', distance: 82, kind: 'Chemically peculiar star', age: '~300 million years', luminosity: '~100×', fact: 'The brightest star of the Big Dipper, with an unusually strong magnetic field.' },
  Mizar: { spectral: 'A2V', distance: 83, kind: 'Quadruple system', age: '~500 million years', luminosity: '~70×', fact: 'Mizar and its neighbour Alcor are a classic naked-eye double. In 1650 Mizar became the first binary found with a telescope, and in 1889 the first spectroscopic binary.' },
  Alkaid: { spectral: 'B3V', distance: 104, kind: 'Blue-white star', age: '~60 million years', luminosity: '~600×', fact: 'The end of the Big Dipper\'s handle.' },
  Polaris: { spectral: 'F7Ib', distance: 430, kind: 'Cepheid variable (supergiant)', age: '~70 million years', luminosity: '~2,500×', fact: 'Sits within 0.7° of the north celestial pole, so it hardly moves. Its altitude above the horizon equals the observer\'s latitude (roughly, for the northern hemisphere).' },
  Algol: { spectral: 'B8V + K0IV + A', distance: 90, kind: 'Eclipsing binary', age: '~300 million years', luminosity: '~100× (primary)', fact: 'The "Demon Star": every 2.87 days the dimmer star passes in front of the brighter, and Algol drops from magnitude 2.1 to 3.4 for a few hours.' },
  Mirfak: { spectral: 'F5Ib', distance: 590, kind: 'Yellow-white supergiant', age: '~50 million years', luminosity: '~5,000×', fact: 'The brightest star of Perseus, at the centre of the Alpha Persei Cluster.' },
  Mira: { spectral: 'M7IIIe', distance: 300, kind: 'Red giant (long-period variable)', age: '~6 billion years', luminosity: '~8,400× (varies)', fact: 'Pulses between magnitude 2 and 10 every 332 days. It is shedding material at a rate that leaves a 13-light-year tail, and was the first variable star recognised (1596).' },
  Thuban: { spectral: 'A0III', distance: 300, kind: 'White giant', age: '~300 million years', luminosity: '~200×', fact: 'The northern pole star in the era of the Egyptian pyramids, about 2,700 BCE.' },
  Alphard: { spectral: 'K3II–III', distance: 177, kind: 'Orange giant', age: '~800 million years', luminosity: '~780×', fact: 'Its name means "the solitary one": there are no other bright stars near it in the sky.' },
  Nunki: { spectral: 'B2.5V', distance: 228, kind: 'Blue-white star', age: '~30 million years', luminosity: '~500×', fact: 'One of the stars of the Teapot in Sagittarius. The name is Babylonian and may be one of the oldest known star names.' },
  Alpheratz: { spectral: 'B8IVpHgMn', distance: 97, kind: 'Chemically peculiar binary', age: '~120 million years', luminosity: '~200×', fact: 'Shared between Andromeda (Alpha) and Pegasus (formerly Delta Pegasi), forming one corner of the Great Square.' },
  Mimosa: { spectral: 'B0.5III', distance: 280, kind: 'Blue giant', age: '~10 million years', luminosity: '~34,000×', fact: 'Beta Crucis; a Beta Cephei variable that pulsates slightly.' },
  Gacrux: { spectral: 'M3.5III', distance: 88, kind: 'Red giant', age: '~1 billion years', luminosity: '~1,500×', fact: 'The red star at the top of the Southern Cross, and the closest red giant to the Sun.' },
  Shaula: { spectral: 'B2IV + B', distance: 570, kind: 'Blue sub-giant (multiple system)', age: '~15 million years', luminosity: '~36,000×', fact: 'The "stinger" of Scorpius; its name comes from the Arabic for "raised tail".' },
  Elnath: { spectral: 'B7III', distance: 134, kind: 'Blue-white giant', age: '~100 million years', luminosity: '~700×', fact: 'Marks the tip of one horn of Taurus.' },
  Adhara: { spectral: 'B2II', distance: 430, kind: 'Blue giant', age: '~15 million years', luminosity: '~38,700×', fact: 'The brightest source of extreme-ultraviolet light in the sky, at ~ 430 ly.' },
  Wezen: { spectral: 'F8Ia', distance: 1600, kind: 'Yellow supergiant', age: '~10 million years', luminosity: '~50,000×', fact: 'The star Delta Canis Majoris, one of the largest yellow supergiants.' },
  Hamal: { spectral: 'K2III', distance: 66, kind: 'Orange giant', age: '~ 1 billion years', luminosity: '~91×', fact: 'The brightest star in Aries.' },
  Algieba: { spectral: 'K0III + G7III', distance: 130, kind: 'Binary of two gold giants', age: '~ 1 billion years', luminosity: '~ 320×', fact: 'A beautiful double star for small telescopes; the pair orbit each other once every 500 years or so.' },
  Denebola: { spectral: 'A3V', distance: 36, kind: 'Main-sequence star with a debris disc', age: '~ 400 million years', luminosity: '~15×', fact: 'The "tail of the lion"; with Regulus and Arcturus, forms part of the Spring Triangle.' },
  Albireo: { spectral: 'K3II + B8V', distance: 430, kind: 'Double star', age: '~ 100 million years', luminosity: '~950×', fact: 'The beak of the Swan, a lovely pair of gold and blue stars visible through binoculars or a small telescope.' },
  Sadr: { spectral: 'F8Ib', distance: 1800, kind: 'Yellow supergiant', age: '~12 million years', luminosity: '~33,000×', fact: 'The centre of the Northern Cross, surrounded by the glowing nebulae of the Gamma Cygni region.' },
  Kochab: { spectral: 'K4III', distance: 130, kind: 'Orange giant', age: '~ 2 billion years', luminosity: '~ 390×', fact: 'Beta Ursae Minoris; Kochab and Pherkad are the "Guardians of the Pole", and Kochab was closer to the pole than Polaris around 1500 BCE.' },
  Rasalhague: { spectral: 'A5III', distance: 49, kind: 'White giant', age: '~ 800 million years', luminosity: '~25×', fact: 'The head of Ophiuchus; its Arabic name means "head of the serpent charmer".' },
  Rasalgethi: { spectral: 'M5Ib–II + G5III', distance: 360, kind: 'Red giant binary (semi-regular variable)', age: '~ 10 million years', luminosity: '~ 1,700×', fact: 'Alpha Herculis — one of the largest known stars visible by eye; swells to about 400 times the Sun\'s diameter.' },
  Alcor: { spectral: 'A5V', distance: 82, kind: 'Main-sequence binary', age: '~ 500 million years', luminosity: '~ 12×', fact: 'The faint companion of Mizar — an ancient test of eyesight.' },
  Eltanin: { spectral: 'K5III', distance: 154, kind: 'Orange giant', age: '~ 1.5 billion years', luminosity: '~ 470×', fact: 'Gamma Draconis, whose position James Bradley measured in 1725 and used to discover the aberration of light. In about 1.5 million years it will pass within roughly 28 light-years of the Sun and briefly outshine Sirius.' },
  Menkalinan: { spectral: 'A2IV + A2IV', distance: 82, kind: 'Eclipsing binary', age: '~ 600 million years', luminosity: '~ 50×', fact: 'Two nearly identical white stars that eclipse each other every four days.' },
  Alhena: { spectral: 'A1.5IV', distance: 109, kind: 'White subgiant', age: '~ 300 million years', luminosity: '~ 160×', fact: 'Marks the foot of one of the Twins.' },
  Scheat: { spectral: 'M2.5II–III', distance: 200, kind: 'Red giant (semi-regular variable)', age: '~ 200 million years', luminosity: '~ 1,500×', fact: 'Beta Pegasi, at the north-west corner of the Great Square.' },
  Enif: { spectral: 'K2Ib', distance: 690, kind: 'Orange supergiant', age: '~ 12 million years', luminosity: '~ 12,000×', fact: 'The nose of Pegasus; its name is Arabic for "nose".' },
  Sargas: { spectral: 'F1II', distance: 270, kind: 'Yellow-white bright giant', age: '~ 20 million years', luminosity: '~ 1,000×', fact: 'Theta Scorpii, a bright star in the curving tail of the Scorpion.' },
  Diphda: { spectral: 'K0III', distance: 96, kind: 'Orange giant', age: '~ 5 billion years', luminosity: '~ 150×', fact: 'Beta Ceti, the brightest star in Cetus. The name is Arabic for "the second frog" (Fomalhaut being the first).' },
  Peacock: { spectral: 'B2IV', distance: 180, kind: 'Blue sub-giant (binary)', age: '~ 50 million years', luminosity: '~ 2,100×', fact: 'Alpha Pavonis. The constellation dates from the 1590s, but the name "Peacock" was only coined in the 1930s for the British Air Almanac.' },
}
