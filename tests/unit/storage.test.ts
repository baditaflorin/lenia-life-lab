import { describe, expect, it } from "vitest";
import { starterSpecies } from "../../src/features/lenia/presets";
import { loadSavedSpecies, removeSpecies, saveSpecies } from "../../src/features/library/storage";

describe("local species storage", () => {
  it("saves, loads, and removes species records", () => {
    const storage = window.localStorage;
    storage.clear();

    const saved = saveSpecies(starterSpecies[0], storage);
    expect(saved).toHaveLength(1);
    expect(loadSavedSpecies(storage)[0]?.id).toBe(starterSpecies[0].id);

    const next = removeSpecies(starterSpecies[0].id, storage);
    expect(next).toHaveLength(0);
  });
});
