import type { Target } from '../domain/types';

export interface TargetGroup extends Target {
  readonly members: readonly Target[];
}

// Call only after filtering the source rows for the current operation.
export function groupTargets(targets: readonly Target[]): TargetGroup[] {
  const groups = new Map<number, Target[]>();
  for (const target of targets) {
    const id = target.comparisonId ?? target.id;
    const members = groups.get(id);
    if (members) members.push(target);
    else groups.set(id, [target]);
  }
  return [...groups].map(([id, members]) => ({ ...members[0], id, members }));
}

export function targetAffiliations(members: readonly Target[]): string {
  return [
    ...new Set(
      members.map(
        (t) =>
          `${t.searchNames?.[0] ?? t.name} · ${t.category} · ${t.missionIds.map((id) => `M${id}`).join(' / ')}`
      )
    ),
  ].join('\n');
}
