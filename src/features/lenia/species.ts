import { z } from "zod";
import type { LeniaMath } from "../../wasm/leniaWasm";
import { choice, clamp, hashString, mulberry32, randomInt, roundTo } from "../../lib/random";

export const colorways = ["aurora", "ember", "reef", "violet", "solar"] as const;

export const SpeciesSchema = z.object({
  v: z.literal(1),
  id: z.string().min(4),
  name: z.string().min(1).max(48),
  seed: z.number().int().nonnegative(),
  radius: z.number().min(5).max(20),
  mu: z.number().min(0.05).max(0.55),
  sigma: z.number().min(0.008).max(0.12),
  dt: z.number().min(0.025).max(0.28),
  growth: z.number().min(0.5).max(1.8),
  colorway: z.enum(colorways),
  createdAt: z.string().datetime(),
  parents: z.array(z.string()).max(4).default([]),
  notes: z.string().max(240).optional()
});

export type Species = z.infer<typeof SpeciesSchema>;
export type Colorway = Species["colorway"];

const namePrefixes = ["Aster", "Brine", "Cinder", "Drift", "Eon", "Ferro", "Glint", "Halo", "Ion", "Jade"];
const nameSuffixes = ["bloom", "coil", "veil", "mote", "spore", "tide", "flare", "lace", "nova", "pulse"];

export function createSpecies(
  input: Omit<Species, "v" | "id" | "createdAt"> & Partial<Pick<Species, "id" | "createdAt">>
): Species {
  const candidate = {
    v: 1 as const,
    ...input,
    id: input.id ?? "pending",
    createdAt: input.createdAt ?? new Date().toISOString()
  };

  const id = input.id ?? speciesId(candidate);
  return SpeciesSchema.parse({ ...candidate, id });
}

export function speciesId(species: Omit<Species, "id"> | Species): string {
  const canonical = JSON.stringify({
    seed: species.seed,
    radius: roundTo(species.radius, 4),
    mu: roundTo(species.mu, 4),
    sigma: roundTo(species.sigma, 4),
    dt: roundTo(species.dt, 4),
    growth: roundTo(species.growth, 4),
    colorway: species.colorway,
    parents: species.parents
  });
  return `ln-${hashString(canonical).toString(36).padStart(7, "0")}`;
}

export function renameFromSeed(seed: number): string {
  const random = mulberry32(seed);
  return `${choice(random, namePrefixes)} ${choice(random, nameSuffixes)} ${randomInt(random, 10, 99)}`;
}

export function mutateSpecies(parent: Species, math?: LeniaMath): Species {
  const random = mulberry32(hashString(`${parent.id}:${Date.now()}:${parent.seed}`));
  const seed = randomInt(random, 1, 2_147_483_647);
  const mutationSeed = hashString(`${parent.id}:${seed}`);
  const mutate = (value: number, minimum: number, maximum: number, amount: number, salt: number) =>
    roundTo(
      math?.mutateFloat(value, minimum, maximum, amount, mutationSeed ^ salt) ??
        jitter(value, minimum, maximum, amount, random),
      4
    );

  return createSpecies({
    name: renameFromSeed(seed),
    seed,
    radius: mutate(parent.radius, 5, 20, 0.16, 11),
    mu: mutate(parent.mu, 0.05, 0.55, 0.12, 23),
    sigma: mutate(parent.sigma, 0.008, 0.12, 0.2, 37),
    dt: mutate(parent.dt, 0.025, 0.28, 0.18, 41),
    growth: mutate(parent.growth, 0.5, 1.8, 0.14, 53),
    colorway: random() > 0.7 ? choice(random, colorways) : parent.colorway,
    parents: [parent.id]
  });
}

export function crossBreedSpecies(left: Species, right: Species, math?: LeniaMath): Species {
  const seed = math?.mixSeed(left.seed, right.seed) ?? hashString(`${left.seed}:${right.seed}`);
  const random = mulberry32(seed);
  const blend = (a: number, b: number, minimum: number, maximum: number, amount: number, salt: number) => {
    const base = random() > 0.5 ? a * 0.65 + b * 0.35 : a * 0.35 + b * 0.65;
    return roundTo(
      math?.mutateFloat(base, minimum, maximum, amount, seed ^ salt) ??
        jitter(base, minimum, maximum, amount, random),
      4
    );
  };

  return createSpecies({
    name: renameFromSeed(seed),
    seed,
    radius: blend(left.radius, right.radius, 5, 20, 0.1, 101),
    mu: blend(left.mu, right.mu, 0.05, 0.55, 0.08, 103),
    sigma: blend(left.sigma, right.sigma, 0.008, 0.12, 0.12, 107),
    dt: blend(left.dt, right.dt, 0.025, 0.28, 0.1, 109),
    growth: blend(left.growth, right.growth, 0.5, 1.8, 0.1, 113),
    colorway: random() > 0.5 ? left.colorway : right.colorway,
    parents: [left.id, right.id]
  });
}

export function updateSpeciesParameter(
  species: Species,
  key: "radius" | "mu" | "sigma" | "dt" | "growth",
  value: number
): Species {
  return createSpecies({
    ...species,
    [key]: value,
    parents: species.parents.includes(species.id)
      ? species.parents
      : [species.id, ...species.parents].slice(0, 4)
  });
}

function jitter(
  value: number,
  minimum: number,
  maximum: number,
  amount: number,
  random: () => number
): number {
  return clamp(value + (random() * 2 - 1) * (maximum - minimum) * amount, minimum, maximum);
}
