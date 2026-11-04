import { useEffect, useState } from 'react';
import { publishedParts, targets, weapons } from './data/masters';
import {
  initialPreferences,
  resetPreferences,
  selectedTargets,
  selectedWeapons,
} from './state/preferences';
import { browserStorage, readPreferences, writePreferences } from './storage/preferences';
import { CalculationControls } from './components/CalculationControls';
import { IconButton, SettingsIcon } from './components/IconButton';
import { Panel } from './components/Panel';
import { SelectionPanel } from './components/SelectionPanel';
import { ResultsTable } from './components/ResultsTable';
import './App.css';
const catalog = { targets, weapons };
function useMobile() {
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)');
    const update = () => setMobile(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return mobile;
}
export default function App() {
  const mobile = useMobile();
  const [state, setState] = useState(() =>
    readPreferences(
      browserStorage(),
      initialPreferences(mobile, catalog),
      catalog,
      publishedParts.map((p) => p.key)
    )
  );
  const [panel, setPanel] = useState<'weapons' | 'targets' | 'settings' | null>(null);
  const [tableRevision, setTableRevision] = useState(0);
  useEffect(() => writePreferences(browserStorage(), state), [state]);
  const reset = (section: 'conditions' | 'weapons' | 'targets' | 'all') => {
    setState((current) => resetPreferences(current, section, mobile, catalog));
    if (section === 'all') setTableRevision((value) => value + 1);
  };
  const controls = (
    <CalculationControls
      value={state.conditions}
      onChange={(conditions) => setState((current) => ({ ...current, conditions }))}
      onReset={() => reset('conditions')}
    />
  );
  return (
    <main className="app-shell">
      <header className="app-heading">
        <h1>
          ACE COMBAT 8<span>WEAPON GUIDE</span>
        </h1>
      </header>
      <div className="desktop-controls">{controls}</div>
      <nav className="table-toolbar" aria-label="Display controls">
        <button type="button" onClick={() => setPanel('weapons')}>
          WEAPONS
        </button>
        <button type="button" onClick={() => setPanel('targets')}>
          TARGETS
        </button>
        <div className="toolbar-spacer" />
        <button className="reset-all" type="button" onClick={() => reset('all')}>
          RESET
        </button>
        <div className="mobile-settings">
          <IconButton name="SETTINGS" onClick={() => setPanel('settings')}>
            <SettingsIcon />
          </IconButton>
        </div>
      </nav>
      <ResultsTable
        key={tableRevision}
        targets={selectedTargets(state, targets)}
        weapons={selectedWeapons(state, weapons)}
        conditions={state.conditions}
      />
      {panel === 'settings' && (
        <Panel title="SETTINGS" onClose={() => setPanel(null)} onReset={() => reset('conditions')}>
          {controls}
        </Panel>
      )}
      {(panel === 'weapons' || panel === 'targets') && (
        <SelectionPanel
          kind={panel}
          state={state}
          setState={setState}
          onClose={() => setPanel(null)}
          onReset={() => reset(panel)}
        />
      )}
    </main>
  );
}
