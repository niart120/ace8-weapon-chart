import type { DefeatRequirementResult, Target, Weapon, Conditions } from '../domain/types';
import { calculateDefeatRequirement } from '../domain/calculate';
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
  return (
    <div className="table-scroll" role="region" aria-label="Results" tabIndex={0}>
      <table aria-label="Defeat requirements">
        <thead>
          <tr>
            <th scope="col">TARGET</th>
            <th scope="col">HP</th>
            {weapons.map((w) => (
              <th scope="col" key={w.id}>
                {w.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {targets.map((target) => (
            <tr key={target.id} data-target-id={target.id}>
              <th scope="row">{target.name}</th>
              <td className="hp">{target.hp}</td>
              {weapons.map((weapon) => (
                <td key={weapon.id}>
                  {formatResult(calculateDefeatRequirement(target, weapon, conditions))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
