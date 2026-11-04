import type { DefeatRequirementResult, Target, Weapon, Conditions } from '../domain/types';
import { useMemo, useState } from 'react';
import { calculateDefeatRequirement } from '../domain/calculate';
import { compareTargetHealth, compareTargetNames, compareTargets } from '../state/preferences';

type Sort = { key: 'target' | 'hp' | number; direction: 'ascending' | 'descending' } | null;
const resultRank = (result: DefeatRequirementResult) =>
  result.kind === 'value' ? 0 : result.kind === 'zeroDamage' ? 1 : 2;
function compareResults(a: DefeatRequirementResult, b: DefeatRequirementResult, direction: number) {
  return (
    resultRank(a) - resultRank(b) ||
    (a.kind === 'value' && b.kind === 'value' ? (a.value - b.value) * direction : 0)
  );
}
function formatResult(result: DefeatRequirementResult): string {
  switch (result.kind) {
    case 'unknown':
      return '?';
    case 'zeroDamage':
      return '-';
    case 'value':
      return String(Number(result.value.toFixed(2)));
  }
}
export function ResultsTable({
  targets,
  weapons,
  conditions,
}: {
  targets: readonly Target[];
  weapons: readonly Weapon[];
  conditions: Conditions;
}) {
  const [sort, setSort] = useState<Sort>(null);
  const activeSort =
    sort && (typeof sort.key !== 'number' || weapons.some((w) => w.id === sort.key)) ? sort : null;
  if (sort && !activeSort) setSort(null);
  const rows = useMemo(
    () =>
      targets.map((target) => ({
        target,
        results: new Map(
          weapons.map((weapon) => [
            weapon.id,
            calculateDefeatRequirement(target, weapon, conditions),
          ])
        ),
      })),
    [targets, weapons, conditions]
  );
  const ordered = rows.toSorted((a, b) => {
    if (!activeSort) return compareTargets(a.target, b.target);
    const direction = activeSort.direction === 'ascending' ? 1 : -1;
    let comparison = 0;
    if (activeSort.key === 'target')
      comparison = compareTargetNames(a.target.name, b.target.name) * direction;
    else if (activeSort.key === 'hp')
      comparison = compareTargetHealth(a.target, b.target, direction);
    else {
      const left = a.results.get(activeSort.key);
      const right = b.results.get(activeSort.key);
      if (left && right) comparison = compareResults(left, right, direction);
    }
    return comparison || compareTargets(a.target, b.target);
  });
  function heading(key: NonNullable<Sort>['key'], name: string) {
    const direction =
      activeSort?.key === key
        ? activeSort.direction
        : !activeSort && key === 'hp'
          ? 'ascending'
          : 'none';
    return (
      <th scope="col" key={key} aria-sort={direction}>
        <button
          className="sort-button"
          type="button"
          onClick={() =>
            setSort((current) => {
              const previous = current ?? { key: 'hp', direction: 'ascending' };
              return previous.key !== key
                ? { key, direction: 'ascending' }
                : previous.direction === 'ascending'
                  ? { key, direction: 'descending' }
                  : null;
            })
          }
        >
          {name}
          <span className="sort-indicator" aria-hidden="true">
            {direction === 'ascending' ? '↑' : direction === 'descending' ? '↓' : '↕'}
          </span>
        </button>
      </th>
    );
  }
  return (
    <div className="table-scroll" role="region" aria-label="Results" tabIndex={0}>
      <table aria-label="Defeat requirements">
        <thead>
          <tr>
            {heading('target', 'TARGET')}
            {heading('hp', 'HP')}
            {weapons.map((w) => heading(w.id, w.name))}
          </tr>
        </thead>
        <tbody>
          {ordered.map(({ target, results }) => (
            <tr key={target.id} data-target-id={target.id}>
              <th scope="row">{target.name}</th>
              <td className="hp">{target.hp ?? '-'}</td>
              {weapons.map((weapon) => {
                const result = results.get(weapon.id);
                if (!result) return null;
                const color =
                  result.kind === 'value'
                    ? Math.min(5, Math.max(1, Math.ceil(result.value)))
                    : result.kind;
                return (
                  <td key={weapon.id} className={`hits hits-${color}`}>
                    {formatResult(result)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
