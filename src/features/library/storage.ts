import { SpeciesSchema, type Species } from "../lenia/species";

const STORAGE_KEY = "lenia-life-lab:saved-species:v1";
const PREFERENCES_KEY = "lenia-life-lab:preferences:v1";

export interface Preferences {
  audioEnabled: boolean;
}

export function loadSavedSpecies(storage: Storage = window.localStorage): Species[] {
  const raw = storage.getItem(STORAGE_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return SpeciesSchema.array().parse(parsed);
  } catch {
    storage.removeItem(STORAGE_KEY);
    return [];
  }
}

export function saveSpecies(species: Species, storage: Storage = window.localStorage): Species[] {
  const existing = loadSavedSpecies(storage).filter((item) => item.id !== species.id);
  const next = [species, ...existing].slice(0, 24);
  storage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function removeSpecies(id: string, storage: Storage = window.localStorage): Species[] {
  const next = loadSavedSpecies(storage).filter((item) => item.id !== id);
  storage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function loadPreferences(storage: Storage = window.localStorage): Preferences {
  try {
    const parsed = JSON.parse(storage.getItem(PREFERENCES_KEY) ?? "{}") as Partial<Preferences>;
    return { audioEnabled: parsed.audioEnabled === true };
  } catch {
    return { audioEnabled: false };
  }
}

export function savePreferences(preferences: Preferences, storage: Storage = window.localStorage): void {
  storage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
}
