# 内部任務識別子とゲーム内表示番号

2026-11-03、ユーザーの「GREENはM14ではないか」という指摘を受け、同梱build 25201480のローカライズ文字列を読み取り専用で再照合した。**内部Mission015はゲーム内MISSION 14**。従前の調査・アプリ表示は内部番号をそのままM番号として扱っていた。

## 根拠

既存の`docs/initial/ref/scripts/extract_target_names.py`のdecode処理と同じUTF-8 radix tree走査を使用し、末尾までの消費を確認した。対象文字列だけを読み出し、元ファイルは変更していない。実ゲーム画面による確認ではない。

| 元ファイル | SHA-256 |
| --- | --- |
| `CP_Cmn.dat` | `dc773dbb11f1535b5b1a5809520a9b520b97b557d1c3fc54806837103237c4e6` |
| `CP_A.dat` | `9e84a8c6ced711c58a36561a81f1b121120054255eeaded877310fa26000fc81` |

`MissiontitleJp_Name_ms15`は「脱出の2人」、`HudMissioninfo_Name_Checkpoint_15_1`は`CHECKPOINT 14-1`。番号文字列とも一致する。M14というユーザーの指摘が正しく、固定IDの再採番が原因ではない。

## 対応表

| 文字列キー（内部識別子） | ゲーム内表示 |
| --- | --- |
| `MissionNo_Name_ms01` | PROLOGUE |
| `MissionNo_Name_ms02` | MISSION 01 |
| `MissionNo_Name_ms03` | MISSION 02 |
| `MissionNo_Name_ms04` | MISSION 03 |
| `MissionNo_Name_ms05` | MISSION 04 |
| `MissionNo_Name_ms06` | MISSION 05 |
| `MissionNo_Name_ms07` | MISSION 06 |
| `MissionNo_Name_ms08` | MISSION 07 |
| `MissionNo_Name_ms09` | MISSION 08 |
| `MissionNo_Name_ms10` | MISSION 09 |
| `MissionNo_Name_ms11` | MISSION 10 |
| `MissionNo_Name_ms12` | MISSION 11 |
| `MissionNo_Name_ms13` | MISSION 12 |
| `MissionNo_Name_ms14` | MISSION 13 |
| `MissionNo_Name_ms15` | MISSION 14 |
| `MissionNo_Name_ms16` | MISSION 15 |
| `MissionNo_Name_ms17` | MISSION 16 |
| `MissionNo_Name_ms18` | MISSION 17 |
| `MissionNo_Name_ms19` | MISSION 18 |
| `MissionNo_Name_ms20` | MISSION 19 |
| `MissionNo_Name_ms21` | MISSION 20 |
| `MissionNo_Name_ms22` | MISSION 21 |
| `MissionNo_Name_ms23` | MISSION 22 |
| `MissionNo_Name_ms24` | MISSION 23 |
| `MissionNo_Name_ms25_Day1` | MISSION 24 |
| `MissionNo_Name_ms25_Day2` | MISSION 25 |
| `MissionNo_Name_ms26` | MISSION 26 |
| `MissionNo_Name_ms27` | MISSION 27 |
| `MissionNo_Name_ms28` | MISSION 28 |
| `MissionNo_Name_ms29` | MISSION 29 |
| `MissionNo_Name_ms30` | MISSION 30 |

内部01はPROLOGUE、02〜24は表示01〜23、25 Day1は24、25 Day2は25、26〜30は同番号。したがって全件一律に1を引く変換は誤りになる。表示番号とDT_NPC_Missionの参照キーを分離して扱う必要がある。

## 現行仕様（2026-11-04）

配信データの`missionIds`と`missionVariant.missionId`はゲーム内番号と同じ数値を持つ。M24は24、M25は25、PROLOGUEは記録用の0。内部識別子からの変換は`scripts/generate-data/target-index.py`に集約し、ローカル生成元の`sourceRefs`と任務差分指定を読み込む際に変換する。内部`25`だけの指定は引き続き不正だが、変換後の数値25はM25として有効。

`mission-label.ts`は数値から`[M25]`などの表示ラベルを生成する。生成元の名前に任務ラベルが既に含まれていれば拒否する。ブラウザーと保存設定は内部識別子を扱わない。保存形式はversion 3とし、旧形式の番号変換は行わない。下記R006は、この変更前に行った表示名修正の履歴である。

## アプリへの影響と修正（R006・履歴）

`[M番号]`の付いた任務差分行に影響する。例: 修正前のTYPHOON (SHADOW) [M25-2]はゲーム内M25、F-14D (SHADOW) [M21]はM20。元のsourceRefsやmissionVariant.missionIdは内部識別子として正しいため、固定IDや出典キーを採番し直さない。

ユーザーの承認によりR006を修正した。生成処理で内部missionIdから確認済み表示ラベルを解決し、配信名を更新する。過去の調査記録でM15等と書いた箇所は内部テーブル番号を使った記述であり、今回更新した画面ラベルとは区別して読む。

### 生成時の扱い

`scripts/generate-data/mission-label.ts`に、同梱文字列で確認した31識別子の対応を明示する。`generate.ts`で末尾の既存任務ラベルを置き換え、同じ入力や生成済みの名前を再入力しても二重に番号を変換しない。機体名、SHADOW／VENTUS、部位の二重山括弧は保持する。ブラウザーは解決済みnameを表示するだけで、内部番号からの変換を行わない。

内部25だけの指定はDay1／Day2のどちらか確定できないため受け付けない。未確認の識別子は生成エラーとし、配信3ファイルへの書き込み前に止める。`missionVariant.missionId`・sourceRefs・固定IDは維持する。

### 検証

同梱文字列を再読し、全31件の必要最小限のキー・表示文字列と元ファイルのハッシュを`src/test/fixtures/mission-numbers.json`へ保存。内部番号の算術変換から期待値を作らず、この文字列と対応表を照合する。参照資料やdata/localなしでもこの固定データでテストできる。

任務差分104行を全件照合し、92行の名前を修正（掲載47行、EXCLUDED45行）。残る12行は内部26以降で変更不要。全506行の比較で名前以外の差分なし。単体89件、Chrome7シナリオ、型検査・lint・整形確認・ビルド成功。再生成後の配信3ファイルはバイト単位で一致。
