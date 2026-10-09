export interface GlossaryEntry {
  term: string
  /** regex source that matches the term in running text */
  match: string
  text: string
}

export const GLOSSARY: GlossaryEntry[] = [
  { term: 'Red supergiant', match: 'red supergiant', text: 'A huge, cool star in the last millions of years of its life. Red supergiants are hundreds of times wider than the Sun and end as supernovae.' },
  { term: 'Red giant', match: 'red giant|orange giant', text: 'A star that has run out of hydrogen in its core and swollen up, cooling and reddening. The Sun will become one in about 5 billion years.' },
  { term: 'Blue supergiant', match: 'blue supergiant|blue giant', text: 'A very hot, massive, luminous star that burns through its fuel in only a few million years.' },
  { term: 'White dwarf', match: 'white dwarf', text: 'The dense, cooling core left behind by a Sun-like star — about the size of Earth but with the mass of a star.' },
  { term: 'Main sequence', match: 'main-sequence|main sequence', text: 'The long, stable phase when a star fuses hydrogen into helium in its core. The Sun is halfway through its main-sequence life.' },
  { term: 'Cepheid variable', match: 'cepheid', text: 'A star that pulses regularly. The longer the period, the brighter the star really is, making Cepheids "standard candles" for measuring distance.' },
  { term: 'Eclipsing binary', match: 'eclipsing', text: 'Two stars orbiting so that one passes in front of the other from our viewpoint, making the combined brightness dip regularly.' },
  { term: 'Redshift', match: 'redshift', text: 'Light from a receding object is stretched to longer, redder wavelengths. The expansion of the Universe gives distant galaxies a redshift; nearby approaching objects show blueshift.' },
  { term: 'Blueshift', match: 'blueshift', text: 'Light from an approaching object is compressed to shorter, bluer wavelengths — the Andromeda Galaxy shows blueshift.' },
  { term: 'Light-year', match: 'light-years?', text: 'The distance light travels in one year: about 9.46 trillion kilometres.' },
  { term: 'Magnitude', match: 'magnitude|mag ', text: 'A scale of apparent brightness. Lower numbers are brighter: the faintest naked-eye stars are about +6, Sirius is −1.46, and the Sun is −26.7. Each step is a factor of ≈ 2.5.' },
  { term: 'Spectral type', match: 'spectral', text: 'A classification of stars by temperature, from hot to cool: O B A F G K M. The Sun is G2.' },
  { term: 'Asterism', match: 'asterism', text: 'A recognisable pattern of stars that is not itself one of the 88 official constellations, such as the Big Dipper or the Summer Triangle.' },
  { term: 'Open cluster', match: 'open cluster', text: 'A loose group of up to a few thousand young stars that formed together.' },
  { term: 'Globular cluster', match: 'globular', text: 'A dense, spherical ball of hundreds of thousands of old stars orbiting a galaxy.' },
  { term: 'Precession', match: 'precession|precess', text: 'The slow wobble of Earth\'s axis, completing a circle every ~26,000 years, which gradually shifts the pole star and the equinox points.' },
  { term: 'Supernova', match: 'supernova|supernovae', text: 'The explosion of a massive star at the end of its life, briefly outshining an entire galaxy.' },
]

export function findGlossary(text: string): GlossaryEntry[] {
  return GLOSSARY.filter((g) => new RegExp(g.match, 'i').test(text))
}
