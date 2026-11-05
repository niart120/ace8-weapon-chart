import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import { publishedParts } from '../data/masters';
import { roles } from '../domain/types';
import type { Conditions, DamageType } from '../domain/types';
const groups = [
  { label: 'MSL', keys: ['missilePower', 'missileAirPower', 'missileGroundPower'] },
  { label: 'SP.MSL', keys: ['specialAirPower', 'specialGroundPower'] },
  { label: 'BOMB', keys: ['bombPower'] },
  { label: 'GUN / RKT / EML', keys: ['gunPower', 'rocketPower', 'railgunPower'] },
];
const modes: readonly DamageType[] = ['DIRECT', 'BLAST', 'DIRECT+BLAST'];
function SettingsSection({ title, children }: { title: string; children: ReactNode }) {
  const [expanded, setExpanded] = useState(true);
  const id = useId();
  return (
    <section className="selection-group sidebar-settings-section">
      <div className="category-heading">
        <button
          type="button"
          id={`${id}-heading`}
          aria-expanded={expanded}
          aria-controls={id}
          onClick={() => setExpanded((current) => !current)}
        >
          <span>{title}</span>
          <span className="chevron" aria-hidden="true">
            {expanded ? '−' : '+'}
          </span>
        </button>
      </div>
      <div
        id={id}
        role="group"
        aria-labelledby={`${id}-heading`}
        hidden={!expanded}
        className="sidebar-settings-section-body"
      >
        {children}
      </div>
    </section>
  );
}
export function SettingsPanel({
  value,
  onChange,
}: {
  value: Conditions;
  onChange: (value: Conditions) => void;
}) {
  return (
    <div className="sidebar-settings-layout">
      <SettingsSection title="ROLE">
        <div className="segments role-options">
          {roles.map((role) => (
            <button
              key={role}
              type="button"
              aria-pressed={value.role === role}
              onClick={() => onChange({ ...value, role })}
            >
              {role}
            </button>
          ))}
        </div>
      </SettingsSection>
      <SettingsSection title="DAMAGE TYPE">
        <div className="segments sidebar-damage">
          {modes.map((damageType) => (
            <button
              key={damageType}
              type="button"
              aria-pressed={value.damageType === damageType}
              onClick={() => onChange({ ...value, damageType })}
            >
              {damageType}
            </button>
          ))}
        </div>
      </SettingsSection>
      <SettingsSection title="PARTS">
        <div className="sidebar-parts-scroll">
          {groups.map((group) => (
            <fieldset key={group.label}>
              <legend>{group.label}</legend>
              <div className="part-options">
                {group.keys.map((key) => {
                  const part = publishedParts.find((item) => item.key === key);
                  return (
                    part && (
                      <label key={key}>
                        <input
                          type="checkbox"
                          checked={value.parts.includes(key)}
                          onChange={() =>
                            onChange({
                              ...value,
                              parts: value.parts.includes(key)
                                ? value.parts.filter((item) => item !== key)
                                : [...value.parts, key],
                            })
                          }
                        />
                        <span>{part.name}</span>
                      </label>
                    )
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>
      </SettingsSection>
    </div>
  );
}
