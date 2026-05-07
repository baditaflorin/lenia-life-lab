# Architecture

Lenia Life Lab is Mode A: Pure GitHub Pages. The runtime surface is a static site at https://baditaflorin.github.io/lenia-life-lab/ with no backend, no database, no runtime secrets, and no authentication.

## Context

```mermaid
C4Context
  title Lenia Life Lab Context
  Person(user, "User", "Discovers, mutates, crossbreeds, saves, and shares Lenia species")
  System_Boundary(pages, "GitHub Pages Boundary") {
    System(app, "Lenia Life Lab", "Static browser application")
  }
  System_Ext(github, "GitHub Repository", "Source code, stars, issues")
  System_Ext(paypal, "PayPal", "Optional support link")
  Rel(user, app, "Uses in browser")
  Rel(app, github, "Links to", "https://github.com/baditaflorin/lenia-life-lab")
  Rel(app, paypal, "Links to", "https://www.paypal.com/paypalme/florinbadita")
```

## Containers

```mermaid
C4Container
  title Lenia Life Lab Containers
  Person(user, "User")
  System_Boundary(browser, "User Browser") {
    Container(ui, "TypeScript UI", "Vite, strict TypeScript", "Controls species lifecycle, sharing, storage, and status")
    Container(webgpu, "WebGPU Engine", "WGSL compute shader", "Runs Lenia convolution and growth on the GPU")
    Container(cpu, "CPU Fallback", "TypeScript", "Runs the same Lenia model when WebGPU is unavailable")
    Container(wasm, "WASM Helper", "AssemblyScript", "Deterministic growth and mutation helper math")
    Container(renderer, "Habitat Renderer", "Three.js", "Renders the creature as a living height field")
    Container(audio, "Soundscape", "Web Audio", "Maps motion metrics to oscillator/filter changes")
    ContainerDb(storage, "Local Species Library", "localStorage", "Stores compact species records on this device")
  }
  System_Ext(pages, "GitHub Pages", "Static host")
  Rel(user, ui, "Clicks, drags, shares")
  Rel(pages, ui, "Serves static assets")
  Rel(ui, webgpu, "Uses when available")
  Rel(ui, cpu, "Falls back to")
  Rel(ui, wasm, "Lazy-loads")
  Rel(ui, renderer, "Streams cells")
  Rel(ui, audio, "Streams metrics")
  Rel(ui, storage, "Reads/writes saved species")
```

## Module Boundaries

- `src/features/lenia/`: species schema, mutation, crossover, simulation engines, and metrics.
- `src/features/audio/`: Web Audio graph.
- `src/features/library/`: local storage persistence.
- `src/features/share/`: URL hash encoding and decoding.
- `src/rendering/`: Three.js renderer.
- `src/wasm/`: WASM loader and generated `lenia.wasm`.
- `src/app/`: DOM orchestration.

## Static Boundary

All computation happens in the browser. The app does not send species, metrics, audio events, or saved records to a server.
