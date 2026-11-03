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

## アプリへの影響（R006・未修正）

`[M番号]`の付いた任務差分行に影響する。例: 現在のTYPHOON (SHADOW) [M25-2]はゲーム内M25、F-14D (SHADOW) [M21]はM20。元のsourceRefsやmissionVariant.missionIdは内部識別子として正しいため、固定IDや出典キーを採番し直さない。

今回の主作業は友軍候補の除外であり、以前合意した任務ラベルを一括変更してはいない。表示番号の修正はlocal_002のR006として残す。過去の資料でM15等と書いた箇所は、内部テーブル番号を使った記述であることを区別して読む。
