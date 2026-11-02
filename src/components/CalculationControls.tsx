import { modifiers } from '../data/masters';
import { roles } from '../domain/types';
import type { Conditions, DamageType } from '../domain/types';
import { IconButton, ResetIcon } from './IconButton';
const modes: readonly DamageType[] = ['DIRECT', 'BLAST', 'DIRECT+BLAST'];
export function CalculationControls({
  value,
  onChange,
  onReset,
}: {
  value: Conditions;
  onChange: (value: Conditions) => void;
  onReset: () => void;
}) {
  return (
    <div className="calculation-controls">
      <div className="conditions-reset">
        <IconButton name="Reset conditions" onClick={onReset}>
          <ResetIcon />
        </IconButton>
      </div>
      <div className="role-parts">
        <fieldset>
          <legend>ROLE</legend>
          <div className="segments role-options">
            {roles.map((role) => (
              <button
                type="button"
                key={role}
                aria-pressed={value.role === role}
                onClick={() => onChange({ ...value, role })}
              >
                {role}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="parts">
          <legend>PARTS</legend>
          <div className="part-options">
            {modifiers.parts.map((part) => (
              <label key={part.key}>
                <input
                  type="checkbox"
                  checked={value.parts.includes(part.key)}
                  onChange={() =>
                    onChange({
                      ...value,
                      parts: value.parts.includes(part.key)
                        ? value.parts.filter((k) => k !== part.key)
                        : [...value.parts, part.key],
                    })
                  }
                />
                <span>{part.name}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      <fieldset className="damage-options">
        <legend>DAMAGE TYPE</legend>
        <div className="segments">
          {modes.map((damageType) => (
            <button
              type="button"
              key={damageType}
              aria-pressed={value.damageType === damageType}
              onClick={() => onChange({ ...value, damageType })}
            >
              {damageType}
            </button>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
