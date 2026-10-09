export interface DsoInfo {
  distance: string
  size: string
  age?: string
  note: string
  wiki?: string
}

/** Notable named deep-sky objects, keyed by catalogue id as used in dsos.6.json. */
export const DSO_INFO: Record<string, DsoInfo> = {
  'NGC 224': {
    distance: '≈ 2.5 million light-years', size: '≈ 220,000 light-years across',
    age: 'Roughly as old as the Milky Way (> 10 billion years)',
    note: 'The Andromeda Galaxy (M31) is the nearest large spiral galaxy and the most distant object most people can see with the naked eye. It holds about a trillion stars. Its light is blueshifted — it is approaching the Milky Way at about 110 km/s — whereas almost all other galaxies show redshift as the Universe expands.',
    wiki: 'Andromeda Galaxy',
  },
  'NGC 598': {
    distance: '≈ 2.7 million light-years', size: '≈ 60,000 light-years across',
    note: 'The Triangulum Galaxy (M33) is the third-largest member of the Local Group, after Andromeda and the Milky Way. It is a faint, face-on spiral that is a test of dark skies for the naked eye.',
    wiki: 'Triangulum Galaxy',
  },
  'PGC 17223': {
    distance: '≈ 160,000 light-years', size: '≈ 14,000 light-years across',
    note: 'The Large Magellanic Cloud is a satellite galaxy of the Milky Way. It hosted Supernova 1987A, the closest supernova seen in modern times, and the Tarantula Nebula, the most active star-forming region in the Local Group.',
    wiki: 'Large Magellanic Cloud',
  },
  'NGC 292': {
    distance: '≈ 200,000 light-years', size: '≈ 7,000 light-years across',
    note: 'The Small Magellanic Cloud is a dwarf galaxy orbiting the Milky Way. Henrietta Leavitt found the period–luminosity relation of Cepheid variables in its stars in 1912, which led to measurement of cosmic distances.',
    wiki: 'Small Magellanic Cloud',
  },
  'M 45': {
    distance: '≈ 444 light-years', size: '≈ 2° across (four times the full Moon)', age: '≈ 100 million years',
    note: 'The Pleiades (Subaru in Japan; Seven Sisters elsewhere) is an open cluster of more than 1,000 young, hot, blue stars. The blue haze seen in photographs is dust reflecting starlight. The cluster will disperse in a few hundred million years.',
    wiki: 'Pleiades',
  },
  'C 41': {
    distance: '≈ 153 light-years', size: '≈ 5° across', age: '≈ 625 million years',
    note: 'The Hyades is the nearest open cluster to the Sun and forms the V-shaped head of Taurus. Orange Aldebaran appears to be part of it but is a foreground star at less than half the distance.',
    wiki: 'Hyades (star cluster)',
  },
  'NGC 1976': {
    distance: '≈ 1,340 light-years', size: '≈ 24 light-years across', age: 'Central stars ≈ 2–3 million years',
    note: 'The Orion Nebula (M42) is the nearest massive star-forming region. Four hot young stars called the Trapezium light up the glowing hydrogen gas; hundreds of protoplanetary discs have been seen forming there.',
    wiki: 'Orion Nebula',
  },
  'NGC 2632': {
    distance: '≈ 590 light-years', size: '≈ 1.5° across', age: '≈ 600–700 million years',
    note: 'The Beehive Cluster (M44, Praesepe) is an open cluster of about 1,000 stars in Cancer, visible to the naked eye as a hazy patch. Galileo first resolved it into stars in 1609.',
    wiki: 'Beehive Cluster',
  },
  'NGC 5139': {
    distance: '≈ 17,000 light-years', size: '≈ 150 light-years across', age: '≈ 12 billion years',
    note: 'Omega Centauri is the largest and brightest globular cluster of the Milky Way, with about 10 million stars. It is probably the stripped core of a dwarf galaxy swallowed long ago.',
    wiki: 'Omega Centauri',
  },
  'NGC 6205': {
    distance: '≈ 22,000 light-years', size: '≈ 145 light-years across', age: '≈ 12 billion years',
    note: 'The Great Globular Cluster in Hercules (M13) holds several hundred thousand stars. In 1974 the Arecibo message was beamed toward it as a symbolic gesture — the cluster will have moved out of the way long before it arrives.',
    wiki: 'Messier 13',
  },
  'NGC 6121': {
    distance: '≈ 7,200 light-years', size: '≈ 75 light-years across', age: '≈ 12 billion years',
    note: 'M4 is the closest globular cluster to Earth, just west of Antares.',
    wiki: 'Messier 4',
  },
  'NGC 3372': {
    distance: '≈ 7,500 light-years', size: '≈ 300 light-years across',
    note: 'The Carina Nebula is four times larger and brighter than the Orion Nebula. It surrounds Eta Carinae, an unstable star that will eventually explode as a supernova.',
    wiki: 'Carina Nebula',
  },
  'NGC 7000': {
    distance: '≈ 2,600 light-years', size: '≈ 120 light-years across',
    note: 'The North America Nebula in Cygnus, whose outline resembles the continent, is lit by an unseen hot star near Deneb.',
    wiki: 'North America Nebula',
  },
  'NGC 6611': {
    distance: '≈ 5,700 light-years', size: '≈ 70 light-years across', age: '≈ 1–2 million years',
    note: 'The Eagle Nebula (M16) contains the "Pillars of Creation", columns of gas and dust in which new stars are being born, made famous by a 1995 Hubble image.',
    wiki: 'Eagle Nebula',
  },
  'NGC 6523': {
    distance: '≈ 4,000–5,000 light-years', size: '≈ 100 light-years across',
    note: 'The Lagoon Nebula (M8) is a giant star-forming cloud in Sagittarius, visible to the naked eye from dark sites.',
    wiki: 'Lagoon Nebula',
  },
  'NGC 2244': {
    distance: '≈ 5,200 light-years', size: '≈ 130 light-years across',
    note: 'The Rosette Nebula in Monoceros is a round cloud of glowing hydrogen powered by the young open cluster NGC 2244 at its centre.',
    wiki: 'Rosette Nebula',
  },
  'NGC 869': {
    distance: '≈ 7,500 light-years', size: '≈ 60 light-years across', age: '≈ 13 million years',
    note: 'h Persei forms the Double Cluster with its neighbour χ Persei (NGC 884), a splendid pair of young open clusters in Perseus, visible to the naked eye and known since antiquity.',
    wiki: 'Double Cluster',
  },
  'NGC 4755': {
    distance: '≈ 6,400 light-years', size: '≈ 20 light-years across', age: '≈ 14 million years',
    note: 'The Jewel Box is a small, young cluster beside Mimosa in the Southern Cross, with stars of contrasting colours.',
    wiki: 'Jewel Box (star cluster)',
  },
  'NGC 104': {
    distance: '≈ 16,700 light-years', size: '≈ 120 light-years across', age: '≈ 13 billion years',
    note: '47 Tucanae is the second-brightest globular cluster in the sky and lies near the Small Magellanic Cloud.',
    wiki: '47 Tucanae',
  },
  'C 99': {
    distance: '≈ 600 light-years', size: '≈ 7° across',
    note: 'The Coalsack Nebula is a dark cloud of dust beside the Southern Cross, visible as a hole in the Milky Way. It was known to the Indigenous peoples of Australia as the head of the "Emu in the Sky".',
    wiki: 'Coalsack Nebula',
  },
  'B 33': {
    distance: '≈ 1,375 light-years', size: '≈ 3.5 light-years',
    note: 'The Horsehead Nebula in Orion is a dark nebula silhouetted against the glowing gas of IC 434.',
    wiki: 'Horsehead Nebula',
  },
}

export const DSO_KIND_BLURB: Record<string, string> = {
  Galaxy: 'A galaxy is a gravitationally bound system of billions of stars, gas, dust and dark matter.',
  Nebula: 'A nebula is a cloud of interstellar gas and dust, often a birthplace of stars.',
  'Dark nebula': 'A dark nebula is a dense cloud of dust that blocks the light from stars behind it.',
  'Open cluster': 'An open cluster is a loose group of up to a few thousand young stars born from the same cloud.',
  'Globular cluster': 'A globular cluster is a tight, ancient ball of hundreds of thousands of stars bound by gravity.',
  'Star-forming region': 'A star-forming region is a nebula where gas is collapsing into new stars.',
  'Supernova remnant': 'A supernova remnant is the expanding shell of gas thrown off by an exploding star.',
  'Planetary nebula': 'A planetary nebula is the glowing shell shed by a dying Sun-like star.',
  Object: 'A deep-sky object beyond our Solar System.',
}
