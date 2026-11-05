import { useEffect, useRef, useState } from 'react';
import { publishedParts, targets, weapons } from '../data/masters';
import { initialPreferences, selectedTargets, selectedWeapons } from '../state/preferences';
import { ResetIcon, SettingsIcon } from './IconButton';
import { ResultsTable } from './ResultsTable';
import { browserStorage, readPreferences, writePreferences } from '../storage/preferences';
import { SettingsPanel } from './SettingsPanel';
import { SelectionPanel } from './SelectionPanel';

const sections = ['weapons', 'targets', 'settings'] as const;
type Section = (typeof sections)[number];

export function Sidebar() {
  const [state, setState] = useState(() =>
    readPreferences(
      browserStorage(),
      initialPreferences(window.matchMedia('(max-width: 767px)').matches, { targets, weapons }),
      { targets, weapons },
      publishedParts.map((p) => p.key)
    )
  );
  useEffect(() => writePreferences(browserStorage(), state), [state]);
  const [section, setSection] = useState<Section | null>(null);
  const [lastSection, setLastSection] = useState<Section>('weapons');
  const [revision, setRevision] = useState(0);
  const triggers = useRef<Partial<Record<Section, HTMLButtonElement | null>>>({});
  const close = () => {
    if (section) triggers.current[section]?.focus();
    setSection(null);
  };
  return (
    <div
      className={`workspace-layout${section ? ' sidebar-open' : ''}`}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && section) {
          event.preventDefault();
          close();
        }
      }}
    >
      <main className="app-shell sidebar-main">
        <header className="app-heading">
          <h1>
            ACE COMBAT 8<span>WEAPON GUIDE</span>
          </h1>
        </header>
        <ResultsTable
          key={revision}
          targets={selectedTargets(state, targets)}
          weapons={selectedWeapons(state, weapons)}
          conditions={state.conditions}
        />
      </main>
      <aside
        id="sidebar-selection"
        className="sidebar-panel"
        aria-label={(section ?? lastSection).toUpperCase()}
        inert={!section}
        aria-hidden={!section}
      >
        {(section ?? lastSection) === 'settings' && (
          <header className="sidebar-heading">
            <h2>SETTINGS</h2>
          </header>
        )}
        <div
          hidden={(section ?? lastSection) !== 'settings'}
          className="settings-container"
          key={`settings-${revision}`}
        >
          <SettingsPanel
            value={state.conditions}
            onChange={(conditions) => setState((current) => ({ ...current, conditions }))}
          />
        </div>
        {(['weapons', 'targets'] as const).map((kind) => (
          <div
            hidden={(section ?? lastSection) !== kind}
            className="selection-container"
            key={`${kind}-${revision}`}
          >
            <SelectionPanel
              active={section === kind}
              kind={kind}
              state={state}
              setState={setState}
            />
          </div>
        ))}
      </aside>
      <nav className="sidebar-rail" aria-label="表示対象の選択">
        {sections.map((kind) => (
          <button
            key={kind}
            type="button"
            aria-label={kind.toUpperCase()}
            title={kind.toUpperCase()}
            ref={(node) => {
              triggers.current[kind] = node;
            }}
            aria-expanded={section === kind}
            aria-controls={section === kind ? 'sidebar-selection' : undefined}
            onClick={() => {
              setSection((current) => (current === kind ? null : kind));
              setLastSection(kind);
            }}
          >
            {kind === 'settings' ? (
              <SettingsIcon />
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                aria-hidden="true"
              >
                {kind === 'weapons' ? (
                  <>
                    <path d="M9 15l-3-3L17 3l4-1-1 4-9 11-2-2ZM6 12H2l4-4h5M11 17v5l4-5v-5M5 17l-3 5 5-3" />
                  </>
                ) : (
                  <>
                    <circle cx="12" cy="12" r="7" />
                    <circle cx="12" cy="12" r="2" />
                    <path d="M12 1v6M12 17v6M1 12h6M17 12h6" />
                  </>
                )}
              </svg>
            )}
          </button>
        ))}
        <button
          className="sidebar-reset-all"
          type="button"
          aria-label="Reset all"
          title="RESET ALL"
          onClick={() => {
            setState(
              initialPreferences(window.matchMedia('(max-width: 767px)').matches, {
                targets,
                weapons,
              })
            );
            setRevision((current) => current + 1);
          }}
        >
          <ResetIcon />
        </button>
      </nav>
    </div>
  );
}
