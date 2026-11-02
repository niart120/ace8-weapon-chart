const f32 = Math.fround;
export function applyDamage(healthInternal: number, damage: number): number {
  const current = f32(f32(healthInternal) * f32(0.1));
  return Math.max(0, Math.trunc(f32(f32(current - damage) * f32(10))));
}
