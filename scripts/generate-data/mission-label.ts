import { missions } from '../../src/domain/catalog.ts';

const labels = new Map(missions.map((mission) => [mission.id, mission.name]));

export function withMissionLabel(name: string, missionId: number): string {
  const label = labels.get(missionId);
  if (!label) throw new Error(`表示番号が未確認の任務: ${missionId}`);
  if (/ \[(?:M[^\]]+|PROLOGUE)\]$/.test(name))
    throw new Error(`生成元の名称に任務ラベルを含めない: ${name}`);
  return `${name} [${label}]`;
}
