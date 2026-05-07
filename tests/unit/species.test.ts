import { describe, expect, it } from "vitest";
import { starterSpecies } from "../../src/features/lenia/presets";
import { SpeciesSchema, crossBreedSpecies, mutateSpecies } from "../../src/features/lenia/species";

describe("species genetics", () => {
  it("mutates within schema bounds and records the parent", () => {
    const parent = starterSpecies[0];
    const child = mutateSpecies(parent);

    expect(SpeciesSchema.safeParse(child).success).toBe(true);
    expect(child.id).not.toEqual(parent.id);
    expect(child.parents).toContain(parent.id);
  });

  it("crossbreeds two species and records both parents", () => {
    const child = crossBreedSpecies(starterSpecies[0], starterSpecies[1]);

    expect(SpeciesSchema.safeParse(child).success).toBe(true);
    expect(child.parents).toEqual([starterSpecies[0].id, starterSpecies[1].id]);
  });
});
