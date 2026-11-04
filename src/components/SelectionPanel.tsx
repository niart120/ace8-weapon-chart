import { useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { targets, weapons } from '../data/masters';
import { targetCategories, weaponCategories } from '../domain/types';
import { missions, targetSubcategories } from '../domain/catalog';
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
  const missionMode = kind === 'targets' && state.targetMode === 'MISSION';
  const changeMode = (targetMode: 'TYPE' | 'MISSION') => {
    setState((current) => ({ ...current, targetMode }));
  };
  return (
    <Panel title={kind.toUpperCase()} onClose={onClose} onReset={onReset}>
      {kind === 'targets' && (
        <div className="target-tabs" role="tablist" aria-label="Target selection mode">
          {(['TYPE', 'MISSION'] as const).map((mode) => (
            <button
              key={mode}
              id={`target-tab-${mode}`}
              type="button"
              role="tab"
              aria-selected={state.targetMode === mode}
              aria-controls={`target-panel-${mode}`}
              tabIndex={state.targetMode === mode ? 0 : -1}
              onClick={() => changeMode(mode)}
              onKeyDown={(event) => {
                if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
                event.preventDefault();
                const next =
                  event.key === 'Home'
                    ? 'TYPE'
                    : event.key === 'End'
                      ? 'MISSION'
                      : mode === 'TYPE'
                        ? 'MISSION'
                        : 'TYPE';
                changeMode(next);
                document.getElementById(`target-tab-${next}`)?.focus();
              }}
            >
              {mode}
            </button>
          ))}
        </div>
      )}
      <div
        hidden={missionMode}
        role={kind === 'targets' ? 'tabpanel' : undefined}
        id={kind === 'targets' ? 'target-panel-TYPE' : undefined}
        aria-labelledby={kind === 'targets' ? 'target-tab-TYPE' : undefined}
      >
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
                    setState((current) => ({
                      ...current,
                      showMissionVariants: event.target.checked,
                    }))
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
            const groupIds = all
              .filter((item) => item.category === category)
              .map((item) => item.id);
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
                  {(kind === 'weapons'
                    ? [null]
                    : (Object.entries(targetSubcategories).find(([key]) => key === category)?.[1] ??
                      [])
                  ).map((subcategory) => {
                    const items = shown.filter(
                      (item) =>
                        subcategory === null ||
                        ('subcategory' in item && item.subcategory === subcategory)
                    );
                    if (!items.length) return null;
                    const subgroupIds = all
                      .filter(
                        (item) =>
                          'subcategory' in item &&
                          item.category === category &&
                          item.subcategory === subcategory
                      )
                      .map((item) => item.id);
                    return (
                      <div
                        className={subcategory ? 'selection-subgroup' : undefined}
                        key={subcategory ?? category}
                      >
                        {subcategory && (
                          <div className="subcategory-heading">
                            <GroupCheckbox
                              name={`${category} ${subcategory}`}
                              selection={groupSelection(state[field], subgroupIds)}
                              onChange={() =>
                                setState((current) => ({
                                  ...current,
                                  [field]: toggleGroup(current[field], subgroupIds),
                                }))
                              }
                            />
                            <span>{subcategory}</span>
                          </div>
                        )}
                        {items.map((item) => (
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
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
      {kind === 'targets' && (
        <div
          id="target-panel-MISSION"
          role="tabpanel"
          aria-labelledby="target-tab-MISSION"
          hidden={!missionMode}
        >
          <div className="mission-options">
            {missions.map((mission) => (
              <label key={mission.id}>
                <input
                  type="checkbox"
                  checked={state.missionIds.includes(mission.id)}
                  disabled={
                    !targets.some(
                      (target) =>
                        target.category !== 'EXCLUDED' && target.missionIds.includes(mission.id)
                    )
                  }
                  onChange={() =>
                    setState((current) => ({
                      ...current,
                      missionIds: current.missionIds.includes(mission.id)
                        ? current.missionIds.filter((id) => id !== mission.id)
                        : [...current.missionIds, mission.id],
                    }))
                  }
                />
                <span>{mission.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </Panel>
  );
}
