import { describe, expect, it } from "vitest";
import { starterSpecies } from "../../src/features/lenia/presets";
import { speciesFromHash, speciesToHash } from "../../src/features/share/hash";

describe("species hash sharing", () => {
  it("round-trips a species through the URL-safe hash payload", () => {
    const species = starterSpecies[2];
    const hash = speciesToHash(species);

    expect(hash.startsWith("#species=")).toBe(true);
    expect(speciesFromHash(hash)).toEqual(species);
  });

  it("returns undefined for invalid hashes", () => {
    expect(speciesFromHash("#species=not-json")).toBeUndefined();
    expect(speciesFromHash("#other=abc")).toBeUndefined();
  });
});
