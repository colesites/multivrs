const RANDOM_MULTIPLIER = 43_758.5453;
const RANDOM_FREQUENCY = 12.9898;

export function deterministicUnit(seed: number): number {
  const value = Math.sin(seed * RANDOM_FREQUENCY) * RANDOM_MULTIPLIER;
  return value - Math.floor(value);
}
