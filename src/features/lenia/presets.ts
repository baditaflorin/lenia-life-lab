import { createSpecies, type Species } from "./species";

// Canonical Lenia species drawn from Bert Chan's published work. The
// parameter quadruple (radius, mu, sigma, dt) is what defines a Lenia
// "creature" — these particular values yield well-known shapes that move,
// rotate, or pulse rather than dissolving into noise. Bundling them as
// presets lets a new user click and immediately see Lenia behaving like
// the published demos instead of starting from random-looking parameters.
//
// References:
//   Chan, B. "Lenia: Biology of Artificial Life", Complex Systems 28-3 (2019).
//   https://chakazul.github.io/lenia.html (parameter atlas).
export const starterSpecies: Species[] = [
  createSpecies({
    name: "Orbium",
    seed: 14_001,
    radius: 13,
    mu: 0.15,
    sigma: 0.014,
    dt: 0.1,
    growth: 1.0,
    colorway: "aurora",
    parents: [],
    notes: "The canonical Lenia glider. The first long-lived self-propelled creature Chan published."
  }),
  createSpecies({
    name: "Scutium",
    seed: 27_318,
    radius: 13,
    mu: 0.29,
    sigma: 0.039,
    dt: 0.1,
    growth: 1.0,
    colorway: "ember",
    parents: [],
    notes: "Hexagonal shield-shaped life form. Higher mu makes it more compact than Orbium."
  }),
  createSpecies({
    name: "Gyrorbium",
    seed: 51_877,
    radius: 18,
    mu: 0.156,
    sigma: 0.0224,
    dt: 0.1,
    growth: 1.0,
    colorway: "reef",
    parents: [],
    notes: "Slow rotating ring. Bigger kernel radius shifts the growth curve toward circular dynamics."
  }),
  createSpecies({
    name: "Hydrogeminium",
    seed: 88_142,
    radius: 18,
    mu: 0.26,
    sigma: 0.036,
    dt: 0.1,
    growth: 1.0,
    colorway: "violet",
    parents: [],
    notes: "Two-headed propagator. Travels in a stable formation rather than as a single blob."
  }),
  createSpecies({
    name: "Fish",
    seed: 96_311,
    radius: 16,
    mu: 0.182,
    sigma: 0.018,
    dt: 0.1,
    growth: 1.0,
    colorway: "solar",
    parents: [],
    notes: "Elongated swimmer with a tail-like trailing pattern. Often shown in Lenia introductions."
  }),
  createSpecies({
    name: "Volvox",
    seed: 12_044,
    radius: 12,
    mu: 0.21,
    sigma: 0.029,
    dt: 0.115,
    growth: 1.0,
    colorway: "aurora",
    parents: [],
    notes: "Stable colonial spheroid. Survives perturbation better than the gliders."
  }),
  createSpecies({
    name: "Blastula",
    seed: 73_551,
    radius: 10,
    mu: 0.205,
    sigma: 0.032,
    dt: 0.145,
    growth: 1.05,
    colorway: "ember",
    parents: [],
    notes: "Original Aster Bloom parameters — a vigorous splitter that fills the habitat in a few seconds."
  })
];

export function defaultSpecies(): Species {
  return starterSpecies[0];
}
