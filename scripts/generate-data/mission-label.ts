// MissionNo_Name_ms* in the bundled localization (build 25201480).
// These are display labels, not replacements for internal mission IDs.
const labels = new Map<string, string>([
  ['1', 'PROLOGUE'],
  ['2', 'M1'],
  ['3', 'M2'],
  ['4', 'M3'],
  ['5', 'M4'],
  ['6', 'M5'],
  ['7', 'M6'],
  ['8', 'M7'],
  ['9', 'M8'],
  ['10', 'M9'],
  ['11', 'M10'],
  ['12', 'M11'],
  ['13', 'M12'],
  ['14', 'M13'],
  ['15', 'M14'],
  ['16', 'M15'],
  ['17', 'M16'],
  ['18', 'M17'],
  ['19', 'M18'],
  ['20', 'M19'],
  ['21', 'M20'],
  ['22', 'M21'],
  ['23', 'M22'],
  ['24', 'M23'],
  ['25day1', 'M24'],
  ['25day2', 'M25'],
  ['26', 'M26'],
  ['27', 'M27'],
  ['28', 'M28'],
  ['29', 'M29'],
  ['30', 'M30'],
]);

export function withMissionLabel(name: string, missionId: string): string {
  const label = labels.get(missionId);
  if (!label) throw new Error(`表示番号が未確認の任務: ${missionId}`);
  if (/ \[(?:M[^\]]+|PROLOGUE)\]$/.test(name))
    throw new Error(`生成元の名称に任務ラベルを含めない: ${name}`);
  return `${name} [${label}]`;
}
