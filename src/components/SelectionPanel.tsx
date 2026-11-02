import { useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { targets, weapons } from '../data/masters';
import { targetCategories, weaponCategories } from '../domain/types';
import {
  groupSelection,
  targetCandidates,
  toggleGroup,
  toggleId,
  weaponCandidates,
} from '../state/preferences';
import type { Preferences } from '../state/preferences';
import { Panel } from './Panel';
function GroupCheckbox({
  name,
  selection,
  onChange,
}: {
  name: string;
  selection: 'all' | 'some' | 'none';
  onChange: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (input.current) input.current.indeterminate = selection === 'some';
  }, [selection]);
  return (
    <input
      ref={input}
      type="checkbox"
      aria-label={`${name} all`}
      aria-checked={selection === 'some' ? 'mixed' : selection === 'all'}
      checked={selection === 'all'}
      onChange={onChange}
    />
  );
}
export function SelectionPanel({
  kind,
  state,
  setState,
  onClose,
  onReset,
}: {
  kind: 'weapons' | 'targets';
  state: Preferences;
  setState: Dispatch<SetStateAction<Preferences>>;
  onClose: () => void;
  onReset: () => void;
}) {
  const [query, setQuery] = useState('');
  const [collapsed, setCollapsed] = useState<readonly string[]>([]);
  const all =
    kind === 'weapons'
      ? weapons.filter((w) => w.category !== 'UNUSED')
      : targets.filter((t) => t.category !== 'EXCLUDED');
  const candidates =
    kind === 'weapons' ? weaponCandidates(weapons, query) : targetCandidates(state, targets, query);
  const categories = kind === 'weapons' ? weaponCategories : targetCategories;
  const field = kind === 'weapons' ? 'weaponIds' : 'targetIds';
  return (
    <Panel title={kind.toUpperCase()} onClose={onClose} onReset={onReset}>
      <div className="panel-options">
        <input
          className="search"
          type="search"
          aria-label={`Search ${kind}`}
          placeholder="SEARCH"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setCollapsed([]);
          }}
          autoFocus
        />
        {kind === 'targets' && (
          <div className="target-flags">
            <label>
              <input
                type="checkbox"
                checked={state.showMissionVariants}
                onChange={(event) =>
                  setState((current) => ({ ...current, showMissionVariants: event.target.checked }))
                }
              />
              MISSION VARIANTS
            </label>
            <label>
              <input
                type="checkbox"
                checked={state.showParts}
                onChange={(event) =>
                  setState((current) => ({ ...current, showParts: event.target.checked }))
                }
              />
              TARGET PARTS
            </label>
          </div>
        )}
      </div>
      <div className="selection-groups">
        {categories.map((category) => {
          const groupIds = all.filter((item) => item.category === category).map((item) => item.id);
          const shown = candidates.filter((item) => item.category === category);
          const expanded = !collapsed.includes(category);
          return (
            <section className="selection-group" key={category}>
              <div className="category-heading">
                <GroupCheckbox
                  name={category}
                  selection={groupSelection(state[field], groupIds)}
                  onChange={() =>
                    setState((current) => ({
                      ...current,
                      [field]: toggleGroup(current[field], groupIds),
                    }))
                  }
                />
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() =>
                    setCollapsed((current) =>
                      current.includes(category)
                        ? current.filter((c) => c !== category)
                        : [...current, category]
                    )
                  }
                >
                  <span>{category}</span>
                  <span className="chevron" aria-hidden="true">
                    {expanded ? '−' : '+'}
                  </span>
                </button>
              </div>
              <div className="group-items" hidden={!expanded}>
                {shown.map((item) => (
                  <label key={item.id}>
                    <input
                      type="checkbox"
                      checked={state[field].includes(item.id)}
                      onChange={() =>
                        setState((current) => ({
                          ...current,
                          [field]: toggleId(current[field], item.id),
                        }))
                      }
                    />
                    <span>{item.name}</span>
                    {'hp' in item && <span className="option-hp">{item.hp}</span>}
                  </label>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </Panel>
  );
}
