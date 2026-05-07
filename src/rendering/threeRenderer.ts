import type { LeniaMetrics } from "../features/lenia/metrics";
import type { Colorway } from "../features/lenia/species";

export interface LeniaRenderer {
  update(cells: Float32Array, colorway: Colorway, metrics: LeniaMetrics): void;
  resize(): void;
  dispose(): void;
}

const palettes: Record<Colorway, [number, number, number][]> = {
  aurora: [
    [7, 18, 15],
    [33, 144, 141],
    [118, 247, 200],
    [247, 215, 116]
  ],
  ember: [
    [18, 10, 13],
    [140, 44, 52],
    [240, 106, 95],
    [247, 215, 116]
  ],
  reef: [
    [5, 15, 22],
    [41, 117, 132],
    [99, 219, 183],
    [239, 244, 194]
  ],
  violet: [
    [12, 11, 23],
    [91, 72, 168],
    [192, 139, 247],
    [118, 247, 200]
  ],
  solar: [
    [16, 13, 4],
    [128, 97, 24],
    [247, 215, 116],
    [255, 249, 214]
  ]
};

export async function createLeniaRenderer(container: HTMLElement, size: number): Promise<LeniaRenderer> {
  const THREE = await import("three");
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x07120f, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.replaceChildren(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x07120f, 2.5, 6);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.01, 10);
  camera.position.set(0, -2.65, 2.2);
  camera.lookAt(0, 0, 0);

  const geometry = new THREE.PlaneGeometry(2.8, 2.8, size - 1, size - 1);
  const colors = new Float32Array(size * size * 3);
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.62,
    metalness: 0.08,
    side: THREE.DoubleSide
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -0.2;
  scene.add(mesh);

  const key = new THREE.DirectionalLight(0xf7d774, 1.8);
  key.position.set(0.8, -1, 2.5);
  scene.add(key);

  const fill = new THREE.PointLight(0x76f7c8, 1.8, 5);
  fill.position.set(-1.4, 0.8, 1.6);
  scene.add(fill);

  const resizeObserver = new ResizeObserver(() => resize());
  resizeObserver.observe(container);

  function resize(): void {
    const rect = container.getBoundingClientRect();
    const width = Math.max(320, Math.floor(rect.width));
    const height = Math.max(280, Math.floor(rect.height));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  }

  resize();

  return {
    update(cells, colorway, metrics) {
      const position = geometry.getAttribute("position");
      const color = geometry.getAttribute("color");
      const palette = palettes[colorway];

      for (let index = 0; index < cells.length; index += 1) {
        const value = cells[index] ?? 0;
        position.setZ(index, value * 0.52);
        const [r, g, b] = samplePalette(palette, value);
        color.setXYZ(index, r / 255, g / 255, b / 255);
      }

      position.needsUpdate = true;
      color.needsUpdate = true;
      geometry.computeVertexNormals();
      mesh.rotation.z += 0.003 + metrics.movement * 0.45;
      mesh.position.x = (metrics.centroidX - 0.5) * 0.12;
      mesh.position.y = (metrics.centroidY - 0.5) * 0.12;
      renderer.render(scene, camera);
    },
    resize,
    dispose() {
      resizeObserver.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      container.replaceChildren();
    }
  };
}

function samplePalette(palette: [number, number, number][], value: number): [number, number, number] {
  const scaled = Math.max(0, Math.min(0.999, value)) * (palette.length - 1);
  const index = Math.floor(scaled);
  const next = Math.min(index + 1, palette.length - 1);
  const mix = scaled - index;
  const left = palette[index];
  const right = palette[next];
  return [
    left[0] + (right[0] - left[0]) * mix,
    left[1] + (right[1] - left[1]) * mix,
    left[2] + (right[2] - left[2]) * mix
  ];
}
