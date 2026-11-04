# AIRCRAFT の基本行と撃破用途の確認

調査日 2026-11-04、反映日 2026-11-05。基準 HEAD `5ca832a`。SHUTTLE TRANSPORT と未裏付け UAV 基本行の除外、M26 UNKNOWN の必要命中数未確定での再掲載をユーザー指示により反映した。

## SHUTTLE TRANSPORT

ユーザー指示で ID 497 を `EXCLUDED` にした。護衛対象として既に除外した M20 行（262）と同じ `OP0043_ssca_01` の基本定義であり、HP 100 と任務時 HP 380 の差を保持する。除外後も固定 ID・元 HP・耐性を維持した。両行とも TYPE/MISSION・検索・古い選択から表示されないことを回帰テストで確認する。

## EXPLOSIVE UAV は M15 と M16 で別モデル

| ID | 任務 | NPC | HP | 判断 |
| ---: | --- | --- | ---: | --- |
| 216 | M15 | `OP0046_uavcb_01` | 4 | 維持。LADON が放つ爆装 UAV |
| 493 | 未指定 | `OP0019_uavcs_01` | 6 | M16 用モデルの基本値。使用場面の裏付けがないため除外済み |
| 224 | M16 | `OP0019_uavcs_01` | 10 | 維持。基本 HP 6 に任務差分 +4 |

[M15 の無線記録](https://acecombat.wiki.gg/wiki/Transcript%3AWings_of_Wax)には LADON の爆装 UAV 発射と撃破の場面がある。ID 493 の除外は M15 の UAV を消す意味ではない。前回答では M15 の別行を説明から省いていたが、アプリには継続して掲載されている。

## M26 UNKNOWN と UNKNOWN UAV

UNKNOWN（410/498）は `OP1016_x40a_MS26` → `OP1016_x40a_Unkown` → `BP_OP1016_x40a_CP_Tewy_C`。UNKNOWN UAV（411/499）は `OP0024_uavn_MS26` → `BP_OP0024_uavn_CP_C`。任務表の両行は最低 HP 0、耐性 `NPC_WPDur_000`。モデル HP は本体 300、UAV 60。

両 Blueprint と継承元の計 7 クラスの既定値を完全に読み取った。両 CP に `bIsInvincibleInducedExplosion=1` があるが、一般の `bIsInvincible` とは別フィールドである。名称から誘爆向けの設定とは読めるものの、今回そのフラグを読む native 処理までは追跡していない。これを「通常攻撃に対して常時無敵」の証拠にはしない。読んだ Blueprint には一般無敵の明示上書きがなく、任務イベントによる無敵・最低 HP の変更は未解析。証拠は [M26_UNKNOWN_EVIDENCE.json](M26_UNKNOWN_EVIDENCE.json)。

[PowerPyx の M26 攻略](https://www.powerpyx.com/ace-combat-8-all-ace-s-ranks-walkthrough/)は、護衛 UAV を破壊して本体のシールドを排除し、本体へ攻撃を加えてイベントへ進める手順を説明する。[Ace Combat Wiki](https://acecombat.wiki.gg/wiki/Crossing_Fleets)も減速後の命中を、[Gamerch](https://gamerch.com/acecombat8/1019042)も攻撃を当てた後のカットシーン移行を記載する。必要命中数の表現は資料間で異なるため、イベント閾値は確定しない。

ここから支持されるのは、UNKNOWN UAV は撃破対象、本体 UNKNOWN は命中が進行条件となるイベント対象という区別。UAV の通常 HP 計算を維持する根拠はある。本体の HP 300 を削り切る数と、イベントへ進める命中数が同じとは確認できていない。実ゲームでの被弾測定は行っていない。

### 必要命中数の `-` と `?`

現行 `calculateDefeatRequirement` は、確定した全ダメージ成分が 0 の場合だけ `zeroDamage`（表示 `-`）を返す。通常の HP 計算が成立しない、または値が未確定の場合は `unknown`（表示 `?`）。HP 欄の `-` は別の意味で、HP 非適用を表す。

M26 UNKNOWN は常時ダメージ 0 と確認できていないため、`-` のために耐性を 0 へ書き換えるのは不適切。必要命中数は `?` として再掲載した。HP 300 は元テーブルの数値として存在するため、SWARM DRONES と同じ HP 非適用への変更も今回の根拠からは行わない。`scripts/generate-data/event-targets.json` で ID 410 の `standardDamage` を false に固定し、再生成後も HP 300 と元の耐性を維持する。任務なし本体の基本行（498）は今回の変更対象外。

UNKNOWN UAV の M26 行（411）は掲載維持。基本行（499、機銃倍率 0.2）は任務時の倍率 1 と異なり、基本値の使用場面が未裏付けのため除外した。
