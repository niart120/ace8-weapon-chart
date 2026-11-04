# GROUND の任務付き目標の追加確認

確認日: 2026-11-05。基準 HEAD `bc18190`。ユーザー判断を反映し、HP 10000 の PILLBOX（340）だけを除外した。通常の PILLBOX（90/325/326）、COMMAND POST（318）、CANISTER（481）は掲載を維持する。

## 既存調査からの継続範囲

今回の調査は GROUND 全件のやり直しではない。[既存調査の棚卸し](../mission-appearances/FOLLOWUP_REVIEW.md)と下記の記録から、掲載根拠が未確認の対象を選んだ。

| 範囲 | 状態 | 今回の扱い |
| --- | --- | --- |
| GROUND の任務なし基本4行 | [前回調査](GROUND_SCOPE_REVIEW.md)の判断を `bc18190` で反映済み | 再調査しない |
| 陸上戦艦本体の除外・部位属性・統合 | [local_002](../../../spec/agent/complete/local_002/LAND_BATTLESHIP_REVIEW.md)で調査・反映済み | 確定した掲載判断と静的属性を引き継ぐ |
| COMMAND POST（318） | 既存の棚卸しで敵出現の追加確認候補 | M23 の元定義・既存攻略本文・追加資料を確認 |
| PILLBOX（340、HP 10000） | 任務対応は既知だが、破壊後モデルの掲載用途は未確認 | 通常型と別定義を比較 |
| CANISTER（481） | M19 対応は既知 | 保存済み攻略本文の破壊指示を掲載根拠として記録 |

## 確定した掲載判断

| 対象 | 事実・未確認点 | 反映内容 |
| --- | --- | --- |
| PILLBOX（340、M25、HP 10000） | 元モデル `BPD_SeaPillbox_Destruction`。Blueprint で `bShowHUDBox=false`、`bDrowHUDMessage=false`。通常型にある砲塔・被弾判定用コンポーネントのエクスポートがなく、破壊後の残骸用という解釈を支持する。任務イベントでの用途や実ゲームの攻撃可否は未確認 | ユーザー承認により、この行だけ暫定除外済み。通常の PILLBOX 90/325/326 は維持 |
| COMMAND POST（318、M23、HP 30） | `DT_NPC_Mission024/GreenTent02_HQ` → `BPD_GreenTent02_HQ`。攻略資料では出現を特定できなかったが、ユーザーが M23 での出現を確認 | ユーザー確認に基づき掲載維持。除外候補から取り下げ |
| CANISTER（481、M19、HP 160） | 保存済み Gamerch 本文と Wiki の攻略手順に、陸上戦艦後部のキャニスターへの攻撃・破壊指示がある | 維持。出現の裏付けであり、命中数の実測確認とは区別する |

### HP 10000 の PILLBOX

ID 340 は `DT_NPC_Mission025day2/SeaPillbox_01_Destruction_01_common` が出典。HP 10000 はモデル表にあり、NPC・任務差分は 0。計算時の足し算や番号変換の誤りではない。

通常の海上型（326、HP 30）は `BP_BPD_SeaPillbox_C`。こちらには `vads_GEN_VARIABLE`（砲塔）、`LiveFireControlSystemArms`、`DamageCollision_GEN_VARIABLE` がある。`BP_BPD_SeaPillbox_Destruction_C` のエクスポートにはこれらがなく、HUD 枠とメッセージが非表示に設定されている。ただし、コンポーネント名の欠落だけで被弾不能や無敵を確定しない。

両 Blueprint の CDO にある初期 HP は 30 だが、モデル表の値とは役割が異なる。ID 340 の HP を 30 に修正したり、通常型と統合したりする根拠にはしない。表示名・内部名・構成から残骸用と推定し、独立した HP 10000 の撃破対象として掲載する裏付けがないことを除外理由とする。

### COMMAND POST と CANISTER

COMMAND POST はテント系 Blueprint に属する。一般無敵や HUD 非表示の明示上書きは、読み取った Blueprint 継承元まででは見つからない。[M23 の保存済み攻略本文](https://gamerch.com/acecombat8/1019038)と [Wiki](https://acecombat.wiki.gg/wiki/The_Destruction_of_Expo_City)は、部隊支援・地上艦・飛行場などを記載するが、このテント型目標の出現は特定できない。敵一覧が網羅的でないため、記載がないことを不在の証明にはしない。後続のユーザー確認で M23 の出現が裏付けられ、掲載維持を確定した。これはユーザーのゲーム内認知を根拠とする判断であり、今回の静的解析で配置や敵味方を実証したものではない。

CANISTER は [M19 の攻略本文](https://gamerch.com/acecombat8/1017967)に破壊手順があり、[Wiki の攻略手順](https://acecombat.wiki.gg/wiki/Clearing_the_Lighthouse)も陸上戦艦後部の対象として記載する。Blueprint の既定値は HUD 枠非表示だが、攻略手順では TGT として攻撃される。したがって、HUD 非表示だけを理由に一律除外することはできない。任務中の表示変更や被弾処理全体は今回追跡していない。

## 証拠と残件

[GROUND_MISSION_EVIDENCE.json](GROUND_MISSION_EVIDENCE.json) に変更前の元定義、6 Blueprint の完全読取結果、入力ハッシュを保存した。解析器と抽出資産は既存調査のものを再利用した。現行 EXE と元テーブルの基準ビルドは異なり、実ゲームの配置・イベント後の状態・命中数を測定したものではない。

当初の除外候補 340/318 の判断は確定した。340 を除外、318 を維持し、今回確認対象の判断待ちはない。除外前の GROUND 全 61 行の実出現確認が完了したわけではない。通常目標の任務ごとの敵味方、陸上戦艦部位の局面ごとの撃破可否は残る。確定済みの分類・属性確認とは分けて管理する。
