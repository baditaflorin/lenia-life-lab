import { createSpecies, type Species } from "./species";

export const starterSpecies: Species[] = [
  createSpecies({
    name: "Aster bloom 41",
    seed: 840219,
    radius: 10.8,
    mu: 0.205,
    sigma: 0.032,
    dt: 0.145,
    growth: 1.05,
    colorway: "aurora",
    parents: []
  }),
  createSpecies({
    name: "Cinder coil 73",
    seed: 1902771,
    radius: 8.4,
    mu: 0.285,
    sigma: 0.047,
    dt: 0.12,
    growth: 1.18,
    colorway: "ember",
    parents: []
  }),
  createSpecies({
    name: "Jade tide 28",
    seed: 670143,
    radius: 13.5,
    mu: 0.16,
    sigma: 0.025,
    dt: 0.09,
    growth: 0.94,
    colorway: "reef",
    parents: []
  }),
  createSpecies({
    name: "Halo veil 62",
    seed: 991701,
    radius: 15.2,
    mu: 0.34,
    sigma: 0.058,
    dt: 0.105,
    growth: 1.28,
    colorway: "violet",
    parents: []
  })
];

export function defaultSpecies(): Species {
  return starterSpecies[0];
}
