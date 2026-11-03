# 初期マスタの照合記録

更新日: 2026-11-03。数値は同梱のbuild 25201480の抽出表。実ゲーム測定なし。

全兵装42件（掲載34・UNUSED8）、全目標506行。キャンペーン任務元行1662件、対応付け済み元定義は1459件（NPC共通行・不足部位の子NPCも含む）。

## 掲載範囲と固定ID

整理済みガイドの表示識別子・キャンペーンの表示名付き目標・合意した部位を登録。表示識別子のないダミー、壁、破損物、NoRadioなどの補助定義は元行監査に残す。これらを名前だけで味方とは判定しない。ガイドの明示的なdummy/training除外範囲と、ユーザー指定のEXCLUDEDを区別した。

固定ID・元定義対応は `data/local/catalog.json`。初回登録後はこのファイルを更新し、初期整備用bootstrapを再実行して番号を付け直さない。追加は未使用ID、削除IDは再利用しない。再生成は同じ出典群の値が一致することを照合する。

合意した199任務行、M25の通常TANK/APC2行、ALCM2行はすべて対応表に存在しEXCLUDEDとして保持。ENDURANCEの任務表にない子部位も同じ文脈のEXCLUDEDとして保持し、他の通常艦や同名NPCへ除外を広げていない。

表示名がない可変翼はアプリ用の `VARIABLE WING`、整理済みの3棟のビルは `BUILDING` とした。ゲーム内の正式名称を確認したものではない。MEGAFLOATの施設関係は仕様書の明示的な対応を使用し、部位の親子関係を計算属性の継承には使わない。

| 分類 | 行数 |
| --- | ---: |
| AIRCRAFT | 132 |
| GROUND | 84 |
| SHIP | 59 |
| STRUCTURE | 43 |
| OTHER | 8 |
| EXCLUDED | 180 |

## 未確認項目

TLSは威力40・継続18・初回遅延0.05000000074505806・間隔0.4000000059604645を保持するが、秒数の起点・フレームの超過時間・再接触時の扱いをbuild 25201480の処理で確定できていないため `?`。UAVTは展開側と搭載レーザー側を区別して調査したが、1展開の全攻撃数と同一目標への分配、評価単位が未確定で `?`。8AAMは掲載対象だが、同梱84 Blueprintにプレイヤー用の威力定義がなく基礎威力null。Botや他兵装の値で補完しない。

SFFS子弾（105）はグループマッピングの範囲外、SOD子弾（104）はBombPower（124）への対応を確認。SFFSの親から子へのパーツ転送経路は旧ビルドで未確認のため、BOMB.POW+選択時だけ `?`。パーツなしは子弾40を使用する。

ROLEは3区分に加えて、元のCategory_Noneの配列添字0=100を明示的なnone区分で保持する。未解決の区分をnoneや1へ補完しない。以下は掲載対象で未確認の属性を含む行。isAirだけが未確認なら通常MSLの条件付きパーツを選択していない計算は継続できる。

| ID | 目標 | 未確認 |
| ---: | --- | --- |
| 201 | MSL PALLET《C-130》 | roleGroup |
| 230 | CH-47 | isAir, roleGroup, standardDamage |
| 216 | EXPLOSIVE UAV | isAir, roleGroup |
| 373 | LAND AEGIS《PODARGE》 | isAir, roleGroup |
| 377 | LAND DESTROYER《PODARGE》 | isAir, roleGroup |
| 498 | UNKNOWN | isAir |
| 410 | UNKNOWN [M26] | isAir |
| 69 | V-22 | isAir, roleGroup |
| 457 | X-40 | isAir |
| 435 | X-40 [M28] | isAir |
| 45 | X-40 [M3] | isAir |
| 459 | X-40 NOSE UNIT | isAir |
| 106 | LAND AEGIS | isAir, roleGroup |
| 315 | LAND AEGIS [M23] | isAir, roleGroup |
| 147 | LAND BATTLESHIP 1 | isAir, roleGroup |
| 371 | LAND BATTLESHIP 1 | isAir, roleGroup |
| 330 | LAND BATTLESHIP 1 [M24] | isAir, roleGroup |
| 151 | SUB CATERPILLAR《LAND BATTLESHIP 1》 | isAir, roleGroup |
| 154 | THRUSTER《LAND BATTLESHIP 1》 | isAir, roleGroup, standardDamage |
| 488 | THRUSTER《LAND BATTLESHIP 1》 | isAir, roleGroup |
| 153 | THRUSTER《LAND BATTLESHIP 1》 [M9] | isAir, roleGroup |
| 155 | VLS《LAND BATTLESHIP 1》 | isAir, roleGroup |
| 494 | LAND BATTLESHIP 2 | isAir, roleGroup |
| 247 | LAND BATTLESHIP 2 [M19] | isAir, roleGroup |
| 249 | AA GUN《LAND BATTLESHIP 2》 | isAir, roleGroup |
| 251 | BREACH《LAND BATTLESHIP 2》 | isAir, roleGroup |
| 252 | CIWS《LAND BATTLESHIP 2》 | isAir, roleGroup |
| 250 | CORE UNIT《LAND BATTLESHIP 2》 | isAir, roleGroup |
| 255 | MAIN GUN《LAND BATTLESHIP 2》 | isAir, roleGroup |
| 256 | SAM《LAND BATTLESHIP 2》 | isAir, roleGroup |
| 258 | VLS《LAND BATTLESHIP 2》 | isAir, roleGroup |
| 226 | LAND BATTLESHIP 3 | isAir, roleGroup |
| 228 | MAIN GUN《LAND BATTLESHIP 3》 | isAir, roleGroup |
| 310 | LAND DESTROYER | isAir, roleGroup |
| 314 | DISP. RAIL GUN《LAND DESTROYER》 | isAir, roleGroup |
| 418 | MEGAFLOAT | isAir, roleGroup, standardDamage |
| 423 | MEGAFLOAT | isAir, roleGroup, standardDamage |
| 430 | FUSION REACTOR《MEGAFLOAT》 | isAir, roleGroup, standardDamage |
| 420 | PILLAR《MEGAFLOAT》 | isAir, roleGroup, standardDamage |
| 422 | PILLAR《MEGAFLOAT》 | isAir, roleGroup, standardDamage |
| 429 | PILLAR《MEGAFLOAT》 | isAir, roleGroup, standardDamage |
| 500 | PILLAR《MEGAFLOAT》 | isAir, roleGroup, standardDamage |
| 501 | PILLAR《MEGAFLOAT》 | isAir, roleGroup, standardDamage |
| 419 | PILLAR《MEGAFLOAT》 [M27] | isAir, roleGroup, standardDamage |
| 421 | PILLAR《MEGAFLOAT》 [M27] | isAir, roleGroup, standardDamage |
| 503 | SHUTTER《MEGAFLOAT》 | isAir, roleGroup, standardDamage |
| 426 | SHUTTER《MEGAFLOAT》 [M27] | isAir, roleGroup, standardDamage |
| 264 | BVRAAM | roleGroup |
| 237 | LAUNCH VEHICLE | isAir |
| 238 | LAUNCH VEHICLE DEBRIS | isAir, roleGroup |
| 505 | MSL DISPENSER | roleGroup |
| 463 | MSL DISPENSER [M30] | roleGroup |
| 462 | SLCM | roleGroup |

### 通常・爆風耐性が未確認の共通行

以下の3行は通常・爆風耐性IDがともに`None`で、配信用の17倍率すべてがnull。全兵装の結果が`?`となる。値を1へ補完しない。

| ID | 目標 | 元NPC |
| ---: | --- | --- |
| 504 | AIR BASE、HP100 | `GR000_dummy_MS28_Airbase` |
| 489 | APC、HP100 | `GR000_dummy_MS13_btr9` |
| 496 | LAND BATTLESHIP 2、HP100 | `GR000_dummy_MS20_ldbs2` |

対応する任務行ID 456・199・261は任務側の耐性を持つため、共通行と区別する。ダミー用定義の掲載可否はlocal_002のQ002として保留。今回の追記は未確認範囲の記録を補うもので、掲載範囲の変更ではない。

## 静的設定の限界

NPC共通と任務の耐性IDが違う場合は任務側を解決し、共通行を残した任務差分として出力する。例: MEGAFLOAT砲塔基部は共通NPCのCategory07=0と、任務側NPC_WPDur_000の100を区別する。同梱ガイドの免疫例を全任務へ一律コピーしない。任務耐性の適用とイベントによる変更は区別する。

難易度5行のMaxHealth=1を再照合した。全1662キャンペーン任務行のMaxHealthDifference/MinHealth、NPCとModelとの合成を確認したが、全レベル配置・イベントでのHP上書きやROLE無効化は網羅していない。アプリは静的初期設定・ROLE有効の条件であり、ゲーム内全局面の保証ではない。

整理済みガイドが識別する239モデルのうち238モデルを直接参照している。汎用 `OP1016_x40a` はNPCから直接参照されておらず、同じHP300・X-40表示の実参照モデル `OP1016_x40a_Tewy` を使う通常行で表現する。この対応は他のモデルを表示名だけで統合する規則にはしない。

## local_002で承認された追加除外

QUEEN 13行、PURPLE MAGIC 4行、GREEN 2行、ENDURANCE本体2行・艦砲1行をEXCLUDEDに変更。ENDURANCE対空砲は他艦と統合されていたID 124から8出典を新規ID 506へ分離し、他艦12出典をID 124へ残した。全63出典を明示指定しており、同名・同モデルの別行へ除外を広げていない。

掲載326行・EXCLUDED180行。元定義1459件と既存固定IDは維持。[除外見直し記録](../../../spec/agent/wip/local_002/FRIEND_EXCLUSION_REVIEW.md)を参照。実所属の確定とは別の掲載判断である。内部任務番号とゲーム内表示番号のずれは[別記録](../ui-labels/MISSION_NUMBERS.md)に訂正し、画面ラベルはR006で修正済み。

R006では全104任務差分を照合して92行のnameだけを更新し、内部識別子・固定ID・数値・件数は維持した。
