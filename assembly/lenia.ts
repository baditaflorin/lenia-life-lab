export function bell(x: f64, mu: f64, sigma: f64): f64 {
  const safeSigma = Math.max(0.0001, sigma);
  const q = (x - mu) / safeSigma;
  return Math.exp(-0.5 * q * q);
}

export function clamp(value: f64, minimum: f64, maximum: f64): f64 {
  return Math.min(maximum, Math.max(minimum, value));
}

export function clamp01(value: f64): f64 {
  return clamp(value, 0.0, 1.0);
}

export function mixSeed(a: u32, b: u32): u32 {
  let x = a ^ (b + 0x9e3779b9 + (a << 6) + (a >> 2));
  x ^= x << 13;
  x ^= x >> 17;
  x ^= x << 5;
  return x;
}

export function mutateFloat(value: f64, minimum: f64, maximum: f64, amount: f64, seed: u32): f64 {
  const span = maximum - minimum;
  const jitter = randomSigned(seed) * amount * span;
  return clamp(value + jitter, minimum, maximum);
}

function randomSigned(seed: u32): f64 {
  let x = seed + 0x6d2b79f5;
  x ^= x << 13;
  x ^= x >> 17;
  x ^= x << 5;
  const unsigned = (x ^ (x >> 14)) >>> 0;
  return <f64>unsigned / 2147483647.5 - 1.0;
}
