import { useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { Dispatch, Ref, SetStateAction } from 'react';
import { targets, weapons } from '../data/masters';
import { targetCategories, weaponCategories } from '../domain/types';
import type { Weapon } from '../domain/types';
import { visibleMissions, isSelectableMission, targetSubcategories } from '../domain/catalog';
import {
  changeTargetIncludes,
  selectMission,
  groupSelection,
  targetCandidates,
  toggleGroup,
  toggleId,
  weaponCandidates,
} from '../state/preferences';
import type { Preferences } from '../state/preferences';
import { groupTargets, targetAffiliations, type TargetGroup } from '../state/target-groups';

function GroupCheckbox({
  name,
  selection,
  onChange,
  item = false,
}: {
  name: string;
  selection: 'all' | 'some' | 'none';
  onChange: () => void;
  item?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (input.current) input.current.indeterminate = selection === 'some';
  }, [selection]);
  return (
    <input
      ref={input}
      type="checkbox"
      aria-label={item ? name : `${name} all`}
      aria-checked={selection === 'some' ? 'mixed' : selection === 'all'}
      checked={selection === 'all'}
      onChange={onChange}
    />
  );
}
export interface SelectionPanelHandle {
  dismiss: () => boolean;
}
export function SelectionPanel({
  ref,
  kind,
  active,
  state,
  setState,
}: {
  ref?: Ref<SelectionPanelHandle>;
  kind: 'weapons' | 'targets';
  active: boolean;
  state: Preferences;
  setState: Dispatch<SetStateAction<Preferences>>;
}) {
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [previousActive, setPreviousActive] = useState(active);
  if (previousActive !== active) {
    setPreviousActive(active);
    setFilterOpen(false);
  }

  const filterPanel = useRef<HTMLDivElement>(null);
  const filterButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!filterOpen || !active) return;
    filterPanel.current?.querySelector<HTMLInputElement>('input:checked:not(:disabled)')?.focus();
    const pointer = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !filterPanel.current?.contains(event.target) &&
        !filterButton.current?.contains(event.target)
      )
        setFilterOpen(false);
    };
    document.addEventListener('pointerdown', pointer);
    return () => {
      document.removeEventListener('pointerdown', pointer);
    };
  }, [filterOpen, active]);
  const searchInput = useRef<HTMLInputElement>(null);
  const searchButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (searchOpen) searchInput.current?.focus();
  }, [searchOpen]);
  const [collapsed, setCollapsed] = useState<readonly string[]>([]);
  const candidates =
    kind === 'weapons' ? weaponCandidates(weapons, query) : targetCandidates(state, targets, query);
  const all = candidates;
  const categories = kind === 'weapons' ? weaponCategories : targetCategories;
  const field = kind === 'weapons' ? 'weaponIds' : 'targetIds';
  const chooseMission = (id: number | null) => {
    setState((current) => selectMission(current, id, targets));
    setCollapsed([]);
  };
  useImperativeHandle(ref, () => ({
    dismiss() {
      if (filterOpen) {
        setFilterOpen(false);
        filterButton.current?.focus();
        return true;
      }
      if (searchOpen) {
        setSearchOpen(false);
        setQuery('');
        searchButton.current?.focus();
        return true;
      }
      return false;
    },
  }));
  return (
    <div>
      <header className="sidebar-browser-toolbar">
        {searchOpen ? (
          <input
            ref={searchInput}
            className="search"
            type="search"
            aria-label={`Search ${kind}`}
            placeholder="SEARCH"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setCollapsed([]);
            }}
          />
        ) : (
          <h2>{kind.toUpperCase()}</h2>
        )}
        <button
          ref={searchButton}
          type="button"
          className="icon-button"
          aria-label={searchOpen ? `Close search ${kind}` : `Search ${kind}`}
          title="SEARCH"
          aria-expanded={searchOpen}
          onClick={() => {
            setSearchOpen((current) => !current);
            setQuery('');
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            aria-hidden="true"
          >
            {searchOpen ? (
              <path d="m6 6 12 12M18 6 6 18" />
            ) : (
              <>
                <circle cx="10" cy="10" r="6" />
                <path d="m15 15 6 6" />
              </>
            )}
          </svg>
        </button>
        {kind === 'targets' && (
          <button
            type="button"
            className="icon-button"
            ref={filterButton}
            aria-haspopup="dialog"
            aria-label="Filter targets"
            title="FILTER"
            aria-expanded={filterOpen}
            aria-controls="sidebar-mission-filter"
            onClick={() => setFilterOpen((current) => !current)}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              aria-hidden="true"
            >
              <path d="M3 4h18l-7 8v7l-4 2v-9Z" />
            </svg>
          </button>
        )}
        {kind === 'targets' && filterOpen && active && (
          <div
            ref={filterPanel}
            id="sidebar-mission-filter"
            className="sidebar-filter-popover"
            role="dialog"
            aria-label="Target filters"
          >
            <fieldset className="sidebar-mission-filter">
              <legend>MISSION</legend>
              <div className="mission-options">
                <label className="mission-all">
                  <input
                    type="radio"
                    name="mission"
                    checked={state.missionId === null}
                    onChange={() => chooseMission(null)}
                  />
                  <span>ALL</span>
                </label>
                {visibleMissions.map((mission) => (
                  <label key={mission.id}>
                    <input
                      type="radio"
                      name="mission"
                      checked={state.missionId === mission.id}
                      disabled={
                        !isSelectableMission(mission.id) ||
                        !targets.some(
                          (target) =>
                            target.category !== 'EXCLUDED' && target.missionIds.includes(mission.id)
                        )
                      }
                      onChange={() => chooseMission(mission.id)}
                    />
                    <span>{mission.name}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="sidebar-filter-divider" aria-hidden="true" />
            <fieldset className="sidebar-include-filter">
              <legend>INCLUDE</legend>
              <div className="target-flags">
                <label>
                  <input
                    type="checkbox"
                    checked={state.showMissionVariants}
                    onChange={(event) =>
                      setState((current) =>
                        changeTargetIncludes(
                          current,
                          {
                            showParts: current.showParts,
                            showMissionVariants: event.target.checked,
                          },
                          targets
                        )
                      )
                    }
                  />
                  MISSION VARIANTS
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={state.showParts}
                    onChange={(event) =>
                      setState((current) =>
                        changeTargetIncludes(
                          current,
                          {
                            showParts: event.target.checked,
                            showMissionVariants: current.showMissionVariants,
                          },
                          targets
                        )
                      )
                    }
                  />
                  TARGET PARTS
                </label>
              </div>
            </fieldset>
          </div>
        )}
      </header>
      {kind === 'targets' && state.missionId !== null && (
        <div className="sidebar-filter-chips">
          <button
            type="button"
            aria-label={`Remove M${state.missionId} filter`}
            onClick={() => chooseMission(null)}
          >
            M{state.missionId}
            <span aria-hidden="true"> ×</span>
          </button>
        </div>
      )}
      <div className="selection-groups">
        {!candidates.length && <p className="sidebar-empty">NO RESULTS</p>}
        {categories.map((category) => {
          const groupIds = all.filter((item) => item.category === category).map((item) => item.id);
          const shown = candidates.filter((item) => item.category === category);
          if (!shown.length) return null;
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
                  const sourceItems = shown.filter(
                    (item) =>
                      subcategory === null ||
                      ('subcategory' in item && item.subcategory === subcategory)
                  );
                  const items: readonly (Weapon | TargetGroup)[] =
                    kind === 'targets'
                      ? groupTargets(sourceItems.filter((item) => 'hp' in item))
                      : sourceItems.filter((item): item is Weapon => !('hp' in item));
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
                          {'members' in item ? (
                            <GroupCheckbox
                              item
                              name={item.name}
                              selection={groupSelection(
                                state.targetIds,
                                item.members.map((t) => t.id)
                              )}
                              onChange={() =>
                                setState((current) => ({
                                  ...current,
                                  targetIds: toggleGroup(
                                    current.targetIds,
                                    item.members.map((t) => t.id)
                                  ),
                                }))
                              }
                            />
                          ) : (
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
                          )}
                          <span
                            title={'members' in item ? targetAffiliations(item.members) : undefined}
                          >
                            {item.name}
                          </span>
                          {'hp' in item && <span className="option-hp">{item.hp ?? '-'}</span>}
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
  );
}
