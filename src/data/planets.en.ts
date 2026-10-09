import type { BodyId } from '../astro/bodies'

export interface BodyInfo {
  title: string
  tagline: string
  type: string
  /** key physical facts as label → value rows */
  facts: [string, string][]
  fun: string[]
  /** Wikipedia article title for the polaroid photo */
  wiki: string
}

export const BODY_INFO: Record<BodyId, BodyInfo> = {
  Sun: {
    title: 'The Sun', tagline: 'Our star', type: 'G2V main-sequence star',
    facts: [
      ['Diameter', '1,391,000 km (109 × Earth)'],
      ['Surface temperature', '≈ 5,500 °C (5,772 K)'],
      ['Core temperature', '≈ 15 million °C'],
      ['Age', '4.6 billion years'],
      ['Light travel time', '≈ 8 min 20 s'],
    ],
    fun: [
      'The Sun holds 99.86 % of all the mass in the Solar System.',
      'The sunlight that reaches you today left the Sun’s surface eight minutes ago — but the energy was made in the core tens of thousands of years earlier.',
      'In about 5 billion years it will swell into a red giant, then shrink into a white dwarf.',
      'Safety: never look at the Sun directly or through binoculars/telescopes without a certified solar filter.',
    ],
    wiki: 'Sun',
  },
  Moon: {
    title: 'The Moon', tagline: 'Earth’s only natural satellite', type: 'Natural satellite',
    facts: [
      ['Diameter', '3,474 km (27 % of Earth)'],
      ['Orbital period', '27.32 days (29.53 days between new moons)'],
      ['Average distance', '384,400 km'],
      ['Gravity', '1/6 of Earth’s'],
      ['Surface temperature', '−173 °C to 127 °C'],
    ],
    fun: [
      'The Moon is drifting away from Earth at about 3.8 cm a year.',
      'It always shows us the same face because it is tidally locked.',
      'Moonlight is surprisingly dark rock: the Moon reflects only about 12 % of the sunlight it receives, similar to worn asphalt.',
      'Twelve people walked on the Moon, between 1969 and 1972 (Apollo 11–17).',
    ],
    wiki: 'Moon',
  },
  Mercury: {
    title: 'Mercury', tagline: 'The swift messenger', type: 'Terrestrial planet',
    facts: [
      ['Diameter', '4,879 km (0.38 × Earth)'],
      ['Year', '88 Earth days'],
      ['Solar day', '176 Earth days'],
      ['Moons', 'None'],
      ['Surface temperature', '−180 °C to 430 °C'],
    ],
    fun: [
      'It is the smallest planet and the closest to the Sun, yet not the hottest: Venus is.',
      'Mercury rotates exactly three times for every two orbits (a 3:2 spin–orbit resonance), so one solar day lasts two Mercury years.',
      'Water ice survives in permanently shadowed craters at its poles, as revealed by NASA’s MESSENGER spacecraft (orbit 2011–2015).',
      'It is hard to spot because it never strays more than about 28° from the Sun.',
    ],
    wiki: 'Mercury (planet)',
  },
  Venus: {
    title: 'Venus', tagline: 'The morning and evening star', type: 'Terrestrial planet',
    facts: [
      ['Diameter', '12,104 km (0.95 × Earth)'],
      ['Year', '224.7 Earth days'],
      ['Day (sidereal)', '243 Earth days, retrograde'],
      ['Moons', 'None'],
      ['Surface temperature', '≈ 465 °C'],
      ['Surface pressure', '≈ 92 × Earth’s'],
    ],
    fun: [
      'A day on Venus (243 Earth days) is longer than its year (225 days).',
      'It is the hottest planet — a runaway greenhouse effect under thick carbon-dioxide clouds, hotter than the melting point of lead.',
      'It spins backward: the Sun rises in the west.',
      'The Soviet lander Venera 13 transmitted from the surface for 127 minutes in 1982.',
      'Venus shows phases like the Moon when viewed through a small telescope; Galileo’s observation of them in 1610 helped confirm that planets orbit the Sun.',
    ],
    wiki: 'Venus',
  },
  Mars: {
    title: 'Mars', tagline: 'The red planet', type: 'Terrestrial planet',
    facts: [
      ['Diameter', '6,779 km (0.53 × Earth)'],
      ['Year', '687 Earth days'],
      ['Day', '24 h 37 min'],
      ['Moons', '2 (Phobos, Deimos)'],
      ['Surface temperature', '−125 °C to 20 °C'],
    ],
    fun: [
      'Its colour comes from iron oxide — rust — on the surface.',
      'Olympus Mons, the tallest volcano in the Solar System, is about 22 km high — roughly 2.5 times the height of Mount Everest.',
      'Valles Marineris is a canyon system about 4,000 km long, as long as the United States is wide.',
      'Rovers such as Curiosity and Perseverance have found clear evidence that liquid water once flowed there.',
    ],
    wiki: 'Mars',
  },
  Jupiter: {
    title: 'Jupiter', tagline: 'The king of the planets', type: 'Gas giant',
    facts: [
      ['Diameter', '139,820 km (11 × Earth)'],
      ['Year', '11.86 Earth years'],
      ['Day', '9 h 56 min'],
      ['Moons', 'More than 95 known'],
      ['Mass', '318 × Earth'],
    ],
    fun: [
      'Jupiter is more than twice as massive as all the other planets combined.',
      'The Great Red Spot is a storm wider than Earth that has been observed for well over 150 years — and is slowly shrinking.',
      'Galileo discovered its four large moons — Io, Europa, Ganymede and Callisto — in January 1610, the first bodies seen orbiting something other than Earth.',
      'Europa hides a salty ocean beneath its ice shell, a prime target in the search for life.',
    ],
    wiki: 'Jupiter',
  },
  Saturn: {
    title: 'Saturn', tagline: 'The ringed planet', type: 'Gas giant',
    facts: [
      ['Diameter', '116,460 km (9.5 × Earth)'],
      ['Year', '29.4 Earth years'],
      ['Day', '≈ 10 h 33 min'],
      ['Moons', 'More than 270 known'],
      ['Density', '0.69 g/cm³'],
    ],
    fun: [
      'Saturn is the only planet less dense than water — in a big enough bathtub it would float.',
      'The rings span about 280,000 km yet are typically only around 10 metres thick, made mostly of water-ice particles.',
      'Titan, its largest moon, has a thick nitrogen atmosphere and lakes of liquid methane; Enceladus sprays icy geysers from a hidden ocean.',
      'Whether the rings are billions of years old or relatively young is still debated.',
    ],
    wiki: 'Saturn',
  },
  Uranus: {
    title: 'Uranus', tagline: 'The sideways planet', type: 'Ice giant',
    facts: [
      ['Diameter', '50,724 km (4 × Earth)'],
      ['Year', '84 Earth years'],
      ['Day', '17 h 14 min, retrograde'],
      ['Axial tilt', '97.8°'],
      ['Moons', 'At least 28'],
    ],
    fun: [
      'Uranus rolls around the Sun on its side, tilted nearly 98°, so each pole gets 42 years of sunlight followed by 42 years of darkness.',
      'William Herschel discovered it in 1781 — the first planet found with a telescope.',
      'It has the coldest planetary atmosphere in the Solar System, reaching about −224 °C.',
      'It is just visible to the naked eye under very dark skies (magnitude ≈ 5.7).',
    ],
    wiki: 'Uranus',
  },
  Neptune: {
    title: 'Neptune', tagline: 'The distant blue world', type: 'Ice giant',
    facts: [
      ['Diameter', '49,244 km (3.9 × Earth)'],
      ['Year', '164.8 Earth years'],
      ['Day', '16 h 6 min'],
      ['Moons', '16 known'],
      ['Wind speed', 'Up to ≈ 2,000 km/h'],
    ],
    fun: [
      'Neptune was found by mathematics before it was ever seen: Urbain Le Verrier and John Couch Adams predicted its position from irregularities in Uranus’s orbit, and Johann Galle spotted it in 1846.',
      'It completed its first full orbit since discovery in 2011.',
      'Its winds are the fastest in the Solar System, at supersonic speeds.',
      'Its largest moon, Triton, orbits backward and is probably a captured Kuiper-belt object.',
      'Too faint for the naked eye (magnitude ≈ 7.8); you need binoculars or a telescope.',
    ],
    wiki: 'Neptune',
  },
}
