import { CreatureAudio } from "../features/audio/audioEngine";
import type { LeniaEngine } from "../features/lenia/engine";
import { createLeniaEngine } from "../features/lenia/engine";
import { defaultSpecies } from "../features/lenia/presets";
import {
  crossBreedSpecies,
  mutateSpecies,
  updateSpeciesParameter,
  type Species
} from "../features/lenia/species";
import {
  loadPreferences,
  loadSavedSpecies,
  removeSpecies,
  savePreferences,
  saveSpecies
} from "../features/library/storage";
import { setSpeciesHash, speciesFromHash, speciesToHash } from "../features/share/hash";
import { loadStarterSpecies } from "../lib/queryClient";
import type { LeniaMath } from "../wasm/leniaWasm";
import { loadLeniaWasm } from "../wasm/leniaWasm";
import type { LeniaRenderer } from "../rendering/threeRenderer";
import { createLeniaRenderer } from "../rendering/threeRenderer";

const GRID_SIZE = 96;
const GITHUB_REPO = "https://github.com/baditaflorin/lenia-life-lab";
const PAYPAL_URL = "https://www.paypal.com/paypalme/florinbadita";

type ParameterKey = "radius" | "mu" | "sigma" | "dt" | "growth";

interface Ui {
  viewport: HTMLElement;
  status: HTMLElement;
  awaken: HTMLButtonElement;
  mutate: HTMLButtonElement;
  crossbreed: HTMLButtonElement;
  save: HTMLButtonElement;
  share: HTMLButtonElement;
  audio: HTMLButtonElement;
  speciesName: HTMLElement;
  speciesId: HTMLElement;
  generation: HTMLElement;
  engineMode: HTMLElement;
  wasmState: HTMLElement;
  movement: HTMLElement;
  population: HTMLElement;
  energy: HTMLElement;
  savedCount: HTMLElement;
  library: HTMLElement;
  version: HTMLElement;
  commit: HTMLAnchorElement;
  github: HTMLAnchorElement;
  paypal: HTMLAnchorElement;
  sliders: Record<ParameterKey, HTMLInputElement>;
  sliderValues: Record<ParameterKey, HTMLElement>;
}

export async function mountApp(root: HTMLElement): Promise<void> {
  const app = new LeniaApp(root);
  await app.mount();
}

class LeniaApp {
  private readonly root: HTMLElement;
  private readonly audio = new CreatureAudio();
  private ui!: Ui;
  private species: Species = defaultSpecies();
  private saved: Species[] = [];
  private starters: Species[] = [];
  private engine?: LeniaEngine;
  private renderer?: LeniaRenderer;
  private math?: LeniaMath;
  private running = false;
  private stepping = false;
  private raf = 0;

  constructor(root: HTMLElement) {
    this.root = root;
  }

  async mount(): Promise<void> {
    this.root.innerHTML = template();
    this.ui = bindUi(this.root);
    this.saved = loadSavedSpecies();
    this.starters = await loadStarterSpecies();
    this.species = speciesFromHash(window.location.hash) ?? this.starters[0] ?? defaultSpecies();
    this.applyVersion();
    this.syncSpeciesPanel();
    this.renderLibrary();
    this.attachEvents();

    const preferences = loadPreferences();
    if (preferences.audioEnabled) {
      this.ui.audio.dataset.active = "queued";
    }

    this.setStatus("Ready");
  }

  private attachEvents(): void {
    this.ui.awaken.addEventListener("click", () => void this.toggleRunning());
    this.ui.mutate.addEventListener(
      "click",
      () => void this.replaceSpecies(mutateSpecies(this.species, this.math), "Mutated")
    );
    this.ui.crossbreed.addEventListener("click", () => void this.crossbreed());
    this.ui.save.addEventListener("click", () => this.saveCurrent());
    this.ui.share.addEventListener("click", () => void this.shareCurrent());
    this.ui.audio.addEventListener("click", () => void this.toggleAudio());

    for (const key of Object.keys(this.ui.sliders) as ParameterKey[]) {
      this.ui.sliders[key].addEventListener("change", () => {
        const value = Number(this.ui.sliders[key].value);
        void this.replaceSpecies(updateSpeciesParameter(this.species, key, value), "Parameters updated");
      });
      this.ui.sliders[key].addEventListener("input", () => {
        this.ui.sliderValues[key].textContent = formatParameter(key, Number(this.ui.sliders[key].value));
      });
    }

    window.addEventListener("hashchange", () => {
      const next = speciesFromHash(window.location.hash);
      if (next && next.id !== this.species.id) {
        void this.replaceSpecies(next, "Loaded from URL");
      }
    });
  }

  private async toggleRunning(): Promise<void> {
    await this.ensureReady();
    this.running = !this.running;
    this.ui.awaken.textContent = this.running ? "Pause" : "Awaken";
    this.ui.awaken.dataset.active = String(this.running);

    if (this.running) {
      this.loop();
    }
  }

  private async ensureReady(): Promise<void> {
    if (!this.math) {
      this.setStatus("Loading WASM");
      this.math = await loadLeniaWasm();
      this.ui.wasmState.textContent = "ready";
    }

    if (!this.renderer) {
      this.setStatus("Opening habitat");
      this.renderer = await createLeniaRenderer(this.ui.viewport, GRID_SIZE);
    }

    if (!this.engine) {
      this.setStatus("Starting simulation");
      this.engine = await createLeniaEngine(this.species, GRID_SIZE, this.math);
      this.ui.engineMode.textContent = this.engine.mode;
      await this.renderSeedFrame();
    }

    if (this.ui.audio.dataset.active === "queued") {
      await this.audio.setEnabled(true);
      this.ui.audio.dataset.active = "true";
      this.ui.audio.textContent = "Sound on";
    }

    this.setStatus("Alive");
  }

  private loop(): void {
    if (!this.running) {
      cancelAnimationFrame(this.raf);
      return;
    }

    if (!this.stepping) {
      this.stepping = true;
      this.engine
        ?.step(this.engine.mode === "webgpu" ? 2 : 1)
        .then((frame) => {
          this.renderer?.update(frame.cells, this.species.colorway, frame.metrics);
          this.audio.update(frame.metrics, this.species);
          this.ui.generation.textContent = frame.generation.toLocaleString();
          this.ui.movement.textContent = frame.metrics.movement.toFixed(4);
          this.ui.population.textContent = frame.metrics.population.toFixed(3);
          this.ui.energy.textContent = frame.metrics.energy.toFixed(3);
        })
        .catch((error: unknown) => {
          this.running = false;
          this.ui.awaken.textContent = "Awaken";
          this.setStatus(error instanceof Error ? error.message : "Simulation stopped");
        })
        .finally(() => {
          this.stepping = false;
        });
    }

    this.raf = requestAnimationFrame(() => this.loop());
  }

  private async replaceSpecies(species: Species, status: string): Promise<void> {
    this.species = species;
    this.syncSpeciesPanel();
    this.engine?.reset(species);
    setSpeciesHash(species);
    await this.renderSeedFrame();
    this.setStatus(status);
  }

  private async renderSeedFrame(): Promise<void> {
    if (!this.engine || !this.renderer) {
      return;
    }

    const frame = await this.engine.step(0);
    this.renderer.update(frame.cells, this.species.colorway, frame.metrics);
    this.ui.generation.textContent = frame.generation.toLocaleString();
    this.ui.movement.textContent = frame.metrics.movement.toFixed(4);
    this.ui.population.textContent = frame.metrics.population.toFixed(3);
    this.ui.energy.textContent = frame.metrics.energy.toFixed(3);
  }

  private async crossbreed(): Promise<void> {
    const partner = this.saved.find((item) => item.id !== this.species.id) ?? this.randomStarter();
    await this.replaceSpecies(crossBreedSpecies(this.species, partner, this.math), "Crossbred");
  }

  private saveCurrent(): void {
    this.saved = saveSpecies(this.species);
    this.renderLibrary();
    this.setStatus("Saved locally");
  }

  private async shareCurrent(): Promise<void> {
    setSpeciesHash(this.species);
    const url = `${window.location.origin}${window.location.pathname}${speciesToHash(this.species)}`;

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      this.setStatus("Share URL copied");
      return;
    }

    this.setStatus("Share URL ready");
  }

  private async toggleAudio(): Promise<void> {
    const next = !this.audio.isEnabled;
    await this.audio.setEnabled(next);
    savePreferences({ audioEnabled: next });
    this.ui.audio.dataset.active = String(next);
    this.ui.audio.textContent = next ? "Sound on" : "Sound off";
  }

  private renderLibrary(): void {
    this.ui.savedCount.textContent = this.saved.length.toLocaleString();
    this.ui.library.replaceChildren();

    if (this.saved.length === 0) {
      const empty = document.createElement("p");
      empty.className = "library-empty";
      empty.textContent = "No local species yet.";
      this.ui.library.append(empty);
      return;
    }

    for (const species of this.saved) {
      const item = document.createElement("div");
      item.className = "library-item";

      const load = document.createElement("button");
      load.type = "button";
      load.className = "library-load";
      load.textContent = species.name;
      load.addEventListener("click", () => void this.replaceSpecies(species, "Loaded"));

      const meta = document.createElement("span");
      meta.textContent = `${species.id} · ${species.colorway}`;

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "library-remove";
      remove.textContent = "Remove";
      remove.addEventListener("click", () => {
        this.saved = removeSpecies(species.id);
        this.renderLibrary();
      });

      item.append(load, meta, remove);
      this.ui.library.append(item);
    }
  }

  private syncSpeciesPanel(): void {
    this.ui.speciesName.textContent = this.species.name;
    this.ui.speciesId.textContent = this.species.id;

    for (const key of Object.keys(this.ui.sliders) as ParameterKey[]) {
      this.ui.sliders[key].value = String(this.species[key]);
      this.ui.sliderValues[key].textContent = formatParameter(key, this.species[key]);
    }
  }

  private randomStarter(): Species {
    const index = Math.floor(Math.random() * this.starters.length);
    return this.starters[index] ?? defaultSpecies();
  }

  private setStatus(message: string): void {
    this.ui.status.textContent = message;
  }

  private applyVersion(): void {
    this.ui.version.textContent = __APP_VERSION__;
    this.ui.commit.textContent = __GIT_COMMIT__;
    this.ui.commit.href = `${GITHUB_REPO}/commit/${__GIT_COMMIT__}`;
    this.ui.github.href = GITHUB_REPO;
    this.ui.paypal.href = PAYPAL_URL;
  }
}

function template(): string {
  return `
    <main class="lab-shell">
      <section class="habitat" aria-label="Lenia habitat">
        <div class="habitat-bar">
          <div>
            <h1>Lenia Life Lab</h1>
            <p><span id="species-name"></span> <span id="species-id"></span></p>
          </div>
          <div class="status-pill" id="status" role="status" aria-live="polite"></div>
        </div>
        <div id="viewport" class="viewport" data-testid="viewport">
          <div class="viewport-placeholder" aria-hidden="true">
            <span></span><span></span><span></span><span></span>
          </div>
        </div>
        <footer class="habitat-footer">
          <a id="github-link" target="_blank" rel="noreferrer">Star on GitHub</a>
          <a id="paypal-link" target="_blank" rel="noreferrer">Support via PayPal</a>
          <span>v<span id="app-version"></span></span>
          <a id="commit-link" target="_blank" rel="noreferrer"></a>
        </footer>
      </section>

      <aside class="control-panel" aria-label="Creature controls">
        <div class="metrics-grid" aria-label="Runtime metrics">
          <div><span>gen</span><strong id="generation">0</strong></div>
          <div><span>engine</span><strong id="engine-mode">idle</strong></div>
          <div><span>wasm</span><strong id="wasm-state">idle</strong></div>
          <div><span>saved</span><strong id="saved-count">0</strong></div>
        </div>

        <div class="button-grid">
          <button type="button" class="primary" id="awaken" data-testid="awaken">Awaken</button>
          <button type="button" id="mutate" data-testid="mutate">Mutate</button>
          <button type="button" id="crossbreed">Crossbreed</button>
          <button type="button" id="save">Save</button>
          <button type="button" id="share">Share</button>
          <button type="button" id="audio">Sound off</button>
        </div>

        <div class="sliders" aria-label="Species genome">
          ${slider("radius", "Radius", 5, 20, 0.1)}
          ${slider("mu", "Mu", 0.05, 0.55, 0.001)}
          ${slider("sigma", "Sigma", 0.008, 0.12, 0.001)}
          ${slider("dt", "Step", 0.025, 0.28, 0.001)}
          ${slider("growth", "Growth", 0.5, 1.8, 0.001)}
        </div>

        <div class="signal-grid" aria-label="Creature signals">
          <div><span>movement</span><strong id="movement">0.0000</strong></div>
          <div><span>population</span><strong id="population">0.000</strong></div>
          <div><span>energy</span><strong id="energy">0.000</strong></div>
        </div>

        <section class="library" aria-label="Local species library">
          <h2>Local Species</h2>
          <div id="library-list" class="library-list"></div>
        </section>
      </aside>
    </main>
  `;
}

function slider(id: ParameterKey, label: string, min: number, max: number, step: number): string {
  return `
    <label class="slider-row" for="${id}">
      <span>${label}</span>
      <input id="${id}" type="range" min="${min}" max="${max}" step="${step}" />
      <strong id="${id}-value"></strong>
    </label>
  `;
}

function bindUi(root: HTMLElement): Ui {
  return {
    viewport: requireElement(root, "#viewport"),
    status: requireElement(root, "#status"),
    awaken: requireElement(root, "#awaken"),
    mutate: requireElement(root, "#mutate"),
    crossbreed: requireElement(root, "#crossbreed"),
    save: requireElement(root, "#save"),
    share: requireElement(root, "#share"),
    audio: requireElement(root, "#audio"),
    speciesName: requireElement(root, "#species-name"),
    speciesId: requireElement(root, "#species-id"),
    generation: requireElement(root, "#generation"),
    engineMode: requireElement(root, "#engine-mode"),
    wasmState: requireElement(root, "#wasm-state"),
    movement: requireElement(root, "#movement"),
    population: requireElement(root, "#population"),
    energy: requireElement(root, "#energy"),
    savedCount: requireElement(root, "#saved-count"),
    library: requireElement(root, "#library-list"),
    version: requireElement(root, "#app-version"),
    commit: requireElement(root, "#commit-link"),
    github: requireElement(root, "#github-link"),
    paypal: requireElement(root, "#paypal-link"),
    sliders: {
      radius: requireElement(root, "#radius"),
      mu: requireElement(root, "#mu"),
      sigma: requireElement(root, "#sigma"),
      dt: requireElement(root, "#dt"),
      growth: requireElement(root, "#growth")
    },
    sliderValues: {
      radius: requireElement(root, "#radius-value"),
      mu: requireElement(root, "#mu-value"),
      sigma: requireElement(root, "#sigma-value"),
      dt: requireElement(root, "#dt-value"),
      growth: requireElement(root, "#growth-value")
    }
  };
}

function requireElement<T extends Element>(root: ParentNode, selector: string): T {
  const element = root.querySelector<T>(selector);

  if (!element) {
    throw new Error(`Missing UI element: ${selector}`);
  }

  return element;
}

function formatParameter(key: ParameterKey, value: number): string {
  if (key === "radius") {
    return value.toFixed(1);
  }

  return value.toFixed(3);
}
