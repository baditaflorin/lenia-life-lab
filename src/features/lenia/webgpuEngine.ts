import { measureCells, type LeniaMetrics } from "./metrics";
import type { Species } from "./species";
import { seedCells } from "./cpuEngine";

export interface WebGpuFrame {
  cells: Float32Array;
  generation: number;
  metrics: LeniaMetrics;
}

const WORKGROUP_SIZE = 8;

const shaderSource = /* wgsl */ `
struct Params {
  width: u32,
  height: u32,
  radius: f32,
  mu: f32,
  sigma: f32,
  dt: f32,
  growth: f32,
  time: f32,
}

@group(0) @binding(0) var<storage, read> source: array<f32>;
@group(0) @binding(1) var<storage, read_write> target: array<f32>;
@group(0) @binding(2) var<uniform> params: Params;

fn wrap_coord(value: i32, maximum: u32) -> u32 {
  let size = i32(maximum);
  return u32(((value % size) + size) % size);
}

fn kernel(distance: f32, radius: f32) -> f32 {
  if (distance <= 0.0 || distance > radius) {
    return 0.0;
  }

  let ring = distance / radius;
  let q = (ring - 0.5) / 0.15;
  return exp(-0.5 * q * q);
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
  if (id.x >= params.width || id.y >= params.height) {
    return;
  }

  let index = id.y * params.width + id.x;
  let integer_radius = i32(ceil(params.radius));
  var sum = 0.0;
  var weight = 0.0;

  for (var dy = -integer_radius; dy <= integer_radius; dy = dy + 1) {
    for (var dx = -integer_radius; dx <= integer_radius; dx = dx + 1) {
      let distance = sqrt(f32(dx * dx + dy * dy));
      let w = kernel(distance, params.radius);
      let sx = wrap_coord(i32(id.x) + dx, params.width);
      let sy = wrap_coord(i32(id.y) + dy, params.height);
      sum = sum + source[sy * params.width + sx] * w;
      weight = weight + w;
    }
  }

  let neighborhood = sum / max(weight, 0.0001);
  let q = (neighborhood - params.mu) / max(params.sigma, 0.0001);
  let bell = exp(-0.5 * q * q);
  let growth = (2.0 * bell - 1.0) * params.growth;
  target[index] = clamp(source[index] + params.dt * growth, 0.0, 1.0);
}
`;

export class WebGpuLeniaEngine {
  readonly mode = "webgpu";
  readonly size: number;
  generation = 0;

  private species: Species;
  private readonly device: GPUDevice;
  private readonly pipeline: GPUComputePipeline;
  private readonly paramsBuffer: GPUBuffer;
  private readonly stateBuffers: [GPUBuffer, GPUBuffer];
  private readonly readbackBuffer: GPUBuffer;
  private readonly bindGroups: [GPUBindGroup, GPUBindGroup];
  private readonly bufferSize: number;
  private currentIndex = 0;
  private previous?: Float32Array;

  private constructor(device: GPUDevice, species: Species, size: number) {
    this.device = device;
    this.species = species;
    this.size = size;
    this.bufferSize = size * size * Float32Array.BYTES_PER_ELEMENT;

    const shader = device.createShaderModule({ code: shaderSource });
    this.pipeline = device.createComputePipeline({
      layout: "auto",
      compute: {
        module: shader,
        entryPoint: "main"
      }
    });

    this.paramsBuffer = device.createBuffer({
      size: 32,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });

    this.stateBuffers = [
      device.createBuffer({
        size: this.bufferSize,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC
      }),
      device.createBuffer({
        size: this.bufferSize,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC
      })
    ];

    this.readbackBuffer = device.createBuffer({
      size: this.bufferSize,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
    });

    this.bindGroups = [this.createBindGroup(0, 1), this.createBindGroup(1, 0)];

    this.reset(species);
  }

  static async create(species: Species, size: number): Promise<WebGpuLeniaEngine> {
    if (!navigator.gpu) {
      throw new Error("WebGPU is unavailable in this browser.");
    }

    const adapter = await navigator.gpu.requestAdapter({ powerPreference: "high-performance" });

    if (!adapter) {
      throw new Error("No WebGPU adapter is available.");
    }

    const device = await adapter.requestDevice();
    return new WebGpuLeniaEngine(device, species, size);
  }

  reset(species: Species): void {
    this.species = species;
    this.generation = 0;
    this.currentIndex = 0;
    this.previous = undefined;
    const seeded = seedCells(species, this.size);
    this.device.queue.writeBuffer(
      this.stateBuffers[0],
      0,
      seeded.buffer as ArrayBuffer,
      seeded.byteOffset,
      seeded.byteLength
    );
    const empty = new Float32Array(seeded.length);
    this.device.queue.writeBuffer(
      this.stateBuffers[1],
      0,
      empty.buffer as ArrayBuffer,
      empty.byteOffset,
      empty.byteLength
    );
    this.writeParams();
  }

  async step(steps: number): Promise<WebGpuFrame> {
    const encoder = this.device.createCommandEncoder();

    for (let step = 0; step < steps; step += 1) {
      this.writeParams();
      const pass = encoder.beginComputePass();
      pass.setPipeline(this.pipeline);
      pass.setBindGroup(0, this.bindGroups[this.currentIndex]);
      pass.dispatchWorkgroups(Math.ceil(this.size / WORKGROUP_SIZE), Math.ceil(this.size / WORKGROUP_SIZE));
      pass.end();
      this.currentIndex = 1 - this.currentIndex;
      this.generation += 1;
    }

    encoder.copyBufferToBuffer(
      this.stateBuffers[this.currentIndex],
      0,
      this.readbackBuffer,
      0,
      this.bufferSize
    );
    this.device.queue.submit([encoder.finish()]);
    await this.readbackBuffer.mapAsync(GPUMapMode.READ);
    const cells = new Float32Array(this.readbackBuffer.getMappedRange()).slice();
    this.readbackBuffer.unmap();
    const metrics = measureCells(cells, this.size, this.previous);
    this.previous = cells;
    return { cells, generation: this.generation, metrics };
  }

  dispose(): void {
    this.paramsBuffer.destroy();
    this.stateBuffers[0].destroy();
    this.stateBuffers[1].destroy();
    this.readbackBuffer.destroy();
  }

  private createBindGroup(sourceIndex: 0 | 1, targetIndex: 0 | 1): GPUBindGroup {
    return this.device.createBindGroup({
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.stateBuffers[sourceIndex] } },
        { binding: 1, resource: { buffer: this.stateBuffers[targetIndex] } },
        { binding: 2, resource: { buffer: this.paramsBuffer } }
      ]
    });
  }

  private writeParams(): void {
    const buffer = new ArrayBuffer(32);
    const view = new DataView(buffer);
    view.setUint32(0, this.size, true);
    view.setUint32(4, this.size, true);
    view.setFloat32(8, this.species.radius, true);
    view.setFloat32(12, this.species.mu, true);
    view.setFloat32(16, this.species.sigma, true);
    view.setFloat32(20, this.species.dt, true);
    view.setFloat32(24, this.species.growth, true);
    view.setFloat32(28, this.generation, true);
    this.device.queue.writeBuffer(this.paramsBuffer, 0, buffer);
  }
}
