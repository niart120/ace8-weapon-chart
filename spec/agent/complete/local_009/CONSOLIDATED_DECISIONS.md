# 統合対象と保持する差の再整理

**2026-11-08実装完了：** [DISPLAY_AGGREGATION_SUMMARY.md](DISPLAY_AGGREGATION_SUMMARY.md)の19組・除外19行・任務注記省略を実装した。仕様と検証は[TARGET_AGGREGATION.md](TARGET_AGGREGATION.md)を参照。M25耐性の採否は引き続き保留。以下は判断の経緯を残した履歴であり、過去時点の件数・候補・未実装の表記は現行仕様ではない。

**2026-11-07更新：** 翼・COREの追加探索はユーザー指示で打ち切り、表示集約へ戻る。再開基準は[第9節](#9-表示集約の再開基準2026-11-07)、後続の除外判断と19組の対応は[第10節](#10-20組の表示名と複数所属の注記案2026-11-07)。命名方針は[第11節](#11-無注記の基準と例外の親注記2026-11-07)、PILLAR・MEGAFLOAT SHUTTERのM27有効値を標準とする最新案は[第12節](#12-m27専用対象の有効値を標準にする案2026-11-07)。いずれも未実装。

最新の掲載判断は[TARGETABILITY_FOLLOWUP.md 第10節](TARGETABILITY_FOLLOWUP.md)を参照。SUB CATERPILLAR (CORE)152は除外対象としてユーザー了承済み。外側151は維持。CORE UNIT250の除外、PODARGE Wing1/2（185/188）の維持も了承済み。Wing3/4の独立候補登録経路は確認したが、実ロック可否は未確定。以下の初回集計にはこれらの採否を未反映。

後続の[掲載基準監査](TARGETABILITY_AUDIT.md)で、WING SPAR系・BUILDING・陸上戦艦部位の掲載36行を維持20・除外候補6・保留10に整理した。監査提案は未反映。本書の統合数は監査採否の確定前の値であり、特にBUILDINGと翼の命名を先に実装しない。

## 1. 目的・現在の方針

2026-11-06。会話での修正を反映した最新の整理。本書は初回報告の表示名案と基本耐性への置換案に優先する。実装は未着手。

| 論点 | 方針 |
| --- | --- |
| 統合基準 | 現行のHP・全耐性・空中判定・ロール補正・通常計算可否が一致し、基本名が同じもの |
| 呼称 | 現状維持。日本語の倍率説明、AIR/GROUND/SHIPの新呼称、親タグ省略は採用しない。集約行の代表表記は別途決め、元の呼称を失わない |
| 所属 | 元ID・親・分類・任務・本体/部位・任務差分の対応を保持。代表の親や分類へ上書きしない |
| 任務設定 | 一律省略しない。CONTAINER SHIPは掲載出典の任務設定に基づく現行1行を維持 |
| M25専用耐性 | 採否は別件として保留。今回の統合では現行値を維持し、通常条件と混ぜない |
| PODARGE | 空中型179・水上型381とも掲載維持。水上型の対応はユーザーのゲーム内認識とSea_norn_01の静的定義が整合 |

「統合」は比較上の単位をまとめる意味であり、元の個体・所属定義を削除する意味ではない。追加判断で378は掲載除外対象となり、378/311の統合は撤回した。その後102/189のWING SPARも異なる部位として統合対象から外した。残る統合は21組60行→21比較単位（39減）。掲載269行から378を除外して268行とし、同値統合後は229単位となる。BUILDINGの除外は未確定で、この集計には反映していない。名称と選択操作は未確定であり、実装済みの行数ではない。

## 2. 統合対象と撤回した組

呼称は既存の基本名で記す。同名の複数行は別の統合グループ。

| No. | 基本名 | 統合するID | HP | 保持する所属・条件 |
| --- | --- | --- | ---: | --- |
| 1 | MSL PALLET | 201/202 | 20 | C-130、M12 |
| 2（撤回） | WING SPAR | 102と189を分離維持 | 150 | LADONのTailWingとPODARGEのWing_L3/R3。計算値が同じでも部位が異なるため統合しない |
| 3（撤回） | AA GUN | 378を除外、311を維持 | 35 | 搭載中のLAND DESTROYERの武装まで掲載するのは過剰というユーザー判断。統合せず311のみ残す |
| 4 | CIWS | 374/107/368 | 35 | PODARGE、LAND AEGIS、分類AIRCRAFT/GROUND/SHIP |
| 5 | DISP. RAIL GUN | 380/313/314 | 35 | PODARGE、LAND DESTROYER |
| 6 | LAND AEGIS | 373/106/367 | 200 | PODARGEの部位と独立本体、分類AIRCRAFT/GROUND/SHIP |
| 7 | LAND DESTROYER | 377/310 | 200 | PODARGEの部位と独立本体 |
| 8 | SHUTTER | 375/108/369 | 80 | PODARGE、LAND AEGIS |
| 9 | SSM LAUNCHER | 379/312 | 80 | PODARGE、LAND DESTROYER |
| 10 | VLS | 184/383 | 40 | 空中・水上PODARGE。383の親参照も出典と再照合する |
| 11 | VLS | 376/109/370 | 35 | PODARGE、LAND AEGIS |
| 12 | AA GUN | 148/248/227 | 40 | LAND BATTLESHIP 1/2/3、M9/M19/M17 |
| 13 | AIRBURST GUN | 150/257/229 | 70 | LAND BATTLESHIP 1/2/3、M9/M19/M17 |
| 14 | VLS | 155/254 | 40 | LAND BATTLESHIP 1/2、M9/M19 |
| 15 | AA GUN | 244/124/126/64/60/58/53 | 20 | 通常艦載。艦と任務の対応を保持 |
| 16 | AA GUN | 343/362/366 | 20 | M25専用耐性。No.15とは分離 |
| 17 | NAVAL GUN | 243/127/63/61/57 | 20 | 通常艦載 |
| 18 | NAVAL GUN | 342/363/365 | 20 | M25専用耐性。No.17とは分離 |
| 19 | VLS | 246/129 | 20 | AEGIS、BATTLECRUISER |
| 20 | SAM | 128/65/309 | 20 | BATTLECRUISER、CRUISER、MSL BOAT |
| 21 | BUILDING | 80/136 | 90 | M5/M8。157は別耐性で保持 |
| 22 | PILLAR (Front) | 420/419 | 100 | OUT基本行とINのM27設定。500は別耐性で保持 |
| 23 | PILLAR (EV) | 422/421 | 200 | OUT基本行とINのM27設定。501は別耐性で保持 |

## 3. 分けて残す項目

| 対象 | 残す理由 |
| --- | --- |
| PODARGE 179/381 | HP720・耐性は一致するがisAirがtrue/false。両者掲載維持 |
| PODARGEのAA GUN 183/382 | HP10/20。以下の追加調査で別モデルの基本HP差と確認 |
| LAND DESTROYERのAA GUN 311 | HP35・isAir=false・roleGroup=ship。独立したLAND DESTROYERの武装として維持。PODARGE搭載中に対応する378は掲載除外 |
| LAND BATTLESHIPのMAIN GUN 255/228 | 2はHP40・ship、3はHP80・ground、耐性も異なる |
| THRUSTER 488/153 | 任務設定による直撃耐性差がある。どちらの掲載を正本とするかは別途確認 |
| M25専用耐性と通常耐性 | AA GUN、NAVAL GUN、CIWS、VLS、AEGIS、DESTROYER、FRIGATEの差は採否保留のため維持 |
| BUILDING 157と80/136 | 機銃・レーザー耐性が異なる |
| PILLAR 500/501と各統合組 | 爆弾耐性が異なる。Front/EV間のHP差も維持 |
| その他の同名異値 | CANDIDATE_TABLES.mdの全32基本名の差を維持。上記統合組以外を同名という理由だけで統合しない |
| 異名同値 | 別機種・別部位の名称を維持。例: BREACHとCORE UNIT、AA GUNとSAM |

LAND BATTLESHIP本体は既にEXCLUDED。1～3は元名称の区別だが、同値部位の比較行を分ける理由にはしない。構成・任務の差は出典側で保持する。

## 4. PODARGEのAA GUN追加調査

### 4.1 HP10とHP20の対応

| 項目 | HP10・ID183 | HP20・ID382 |
| --- | --- | --- |
| 親の元NPC | OP0044_norn系、空中型 | VE006_norn_01、水上型 |
| 任務出典 | M11とM25のAir_norn_* | M25のSea_norn_* |
| モデル | OP0044_norn_AAGun_01/02、同MS25版 | VE006_norn_AAGun_01/02 |
| MaxHealth | 10 | 20 |
| NPC/任務HP差分 | すべて0 | すべて0 |
| 耐性 | NPC_WPDur_000 | NPC_WPDur_000 |
| isAir / roleGroup | true / air | true / air |

HP差は任務上書きではなく、DT_NPC_ModelのMaxHealthに存在する。183の8出典、382の4出典で確認した。どちらも左右Turretと左右AAGunを含む。空中型の翼側AA GUNはWingを経由した子NPC参照、水上型の4基は本体の直接の子NPCとして確認した。これは静的構成であり、実配置数の実測ではない。

M25の空中・水上型モデルは、同じ `BP_OP0044_norn_AAGun_01_MS25_CP_C` / `BP_OP0044_norn_AAGun_02_MS25_CP_C` を参照している。`data/local/npc-evidence.json` には両Blueprintの `bIsAir=1`、`GameObjectCategory=1`、解析エラーなしが記録されている。水上型でも現行抽出値が対空判定となる根拠であり、親が水上だから対地へ変更しない。実行時の属性変更・実ダメージは未検証。

### 4.2 HP35との違い

378の出典は `ldds_AAGun_MS25day2` → `GR035_ldds_AAGun_MS25day2` → `GR035_ldds_AAGun`。空中PODARGE → 搭載LAND DESTROYER → AA GUNという子NPC経路が存在する。本体固有のHP10/20砲とは別の搭載物。HP35・対地判定であることを水上PODARGEの武装と取り違えない。

追加のユーザー判断により378は掲載除外対象とし、311との統合案を撤回。独立したLAND DESTROYERの311は維持する。未使用・出現しないという認定ではなく、掲載範囲の判断。他のPODARGE搭載物や武装へ除外を自動拡張しない。マスタ反映は未実施。

### 4.3 親参照の整理対象

現行382のpartOfは179（空中型）だが、4出典とも `Sea_norn_*`、元NPC親は `VE006_norn_01`（381の出典）。親参照を381へ合わせる修正候補とする。名前はどちらもPODARGEなので呼称変更は不要。383も同様の水上VLSであり、統合時に元の親対応を再照合する。今回マスタの修正は行っていない。

## 5. 対象ファイル・実装上の制約

| 対象 | 扱い |
| --- | --- |
| 本書 | 新規。現在の判断を整理 |
| NORMALIZATION_REVIEW.md | 最新整理への案内を追加 |
| CANDIDATES.json / CANDIDATE_TABLES.md | 現行値の全件抽出根拠として維持 |
| BASE_DURABILITY_REVIEW.md | 不採用・未合意の比較試算として維持 |
| catalog / 配信マスタ / アプリ | 未変更 |

本体/部位・分類・任務差分をまたぐ統合は、元の対象に絞り込みを適用してから比較単位へまとめる設計が必要。呼称・選択仕様の具体化は未確定。現在のnameやpartOfを代表1件で置き換えるだけの実装はしない。

## 6. 検証とチェックリスト

既存の23組を再確認し、PODARGE関連のDT_NPC_Mission012、DT_NPC_Mission025day2、DT_NPC、DT_NPC_Model、catalogの属性、既存Blueprint抽出記録を照合した。アプリのテストは未実行（調査文書のみの変更）。実ゲーム測定なし。

- [x] 現在の統合対象23組を再整理
- [x] 呼称維持・M25採否保留・PODARGE維持を反映
- [x] HP10/20/35のPODARGE所属AA GUNの出典と子NPC経路を確認
- [x] 382の親参照の不整合を記録
- [ ] 集約表示・選択仕様の確定、親参照修正、実装・テスト（今回の対象外）

## 7. 注記の横断見直し（提案・未実装）

後続の命名検討では、親名を原則保持する以前の案を見直す。全行で共通の親名、または基本名とHPで識別できる親名は削除候補。同名同HPで計算差が残る場合だけ識別の必要性を検討する。任務耐性の採否保留と注記の削除を混同しない。

| 対象 | 更新案・確認結果 |
| --- | --- |
| PILLAR (Front)/(EV) | 掲載全行がMEGAFLOAT所属のため《MEGAFLOAT》を削除候補とする。共有の親名は耐性差の識別に役立っていない。既存の任務注記・異値行の扱いは別件 |
| BUILDING | M5/M8だけでなくM9の157が掲載中。3行ともHP90、M9は機銃・レーザー倍率約0.2、M5/M8は1。任務注記を無条件には外さない。名称は表示名なしの3棟に付けた編集名であり、明示的な破壊対象としての掲載適否を先に確認する候補。未除外 |
| DISP. RAIL GUN | 独立地上砲台の掲載行はない。LAND DESTROYER部位313/314とその搭載形態380がHP35、TRIUMPHANT部位484がHP60。親注記を外して基本名とHPで区別する候補 |
| WING SPAR | LADON/PODARGEだけでなくCELAENOもある。HP40のPODARGE190とCELAENO476は耐性が異なり、HP150にもLADON基本213と102/189統合組がある。親注記の一律削除は識別方法を検討してから。倍率を項目名へ追加しない |
| その他の削除候補 | MAIN ENGINE、MAIN PROPELLER、SUB PROPELLER、CARGO MODULE、SHUTTER、AIRBURST GUNは基本名とHPで計算条件を区別できる。MSL PALLET、GENERATOR、RADOME、AAM、SSM LAUNCHER、LASER DESIGNATOR、CASEMATE GUN、BREACH、CORE UNIT、HEAT VENT、RAIL GUN TURRET、LAUNCH TUBE、FUSION REACTORも親注記省略候補 |

親名を表示から外しても、検索用の所属情報と出典は保持する。上記は現行掲載範囲を比較した提案であり、マスタ・表示名は変更していない。

## 8. WING SPARの部位対応と命名再検討

ユーザー判断によりLADON/PODARGE間の102/189統合を撤回。7節の「基本名＋HPだけで識別できれば親名を外す」提案も採用しない。MAIN ENGINE、各PROPELLER、CARGO MODULE、SHUTTER、AIRBURST GUN、DISP. RAIL GUNの親名は維持する方向。全行で共通のMEGAFLOAT注記をPILLARから外す案は継続。

### 8.1 PODARGEの7条件

現行catalogのsourceRefsから任務行→NPC→モデルを追い、DT_NPC_Model.MaxHealthとNPC/任務HP差分を照合した。下記の7条件はすべてモデル基本HPによる差で、参照した出典のNPC/任務HP加算は0。M11/M25で同じHPを使う。正式表示名キーは全条件共通の `ContainerBossPartsName_Transport_Wing` であり、以下の部位説明は内部識別子に基づく。

| ID | HP | 元モデル・NPCの対応 | 子NPC参照による補足 |
| --- | ---: | --- | --- |
| 181 | 20 | O0044_norn_AirIntake。Left/RightAirIntake、AirIntake_L1～3/R1～3 | 本体とWing1～3に属する吸気口を同値統合している |
| 185 | 500 | OP0044_norn_Wing_L1/R1（M25版も同HP） | Elavator、SmallEngine、AAGun、AirIntakeを子に持つ |
| 188 | 370 | OP0044_norn_Wing_L2/R2（M25版も同HP） | Elavator、SmallEngine、AirIntakeを子に持つ |
| 189 | 150 | OP0044_norn_Wing_L3/R3（M25版も同HP） | Flap、SmallEngine、AirIntakeを子に持つ |
| 191 | 100 | OP0044_norn_Wing_L4/R4（M25版も同HP） | 子NPCなし |
| 186 | 60 | OP0044_norn_Elavator_L1/L2/R1/R2 | Wing1/2に属する。識別子の綴りはElavator |
| 190 | 40 | OP0044_norn_Flap_L/R | Wing3に属する |

L/Rは対として同じHP・計算属性にまとまっている。Wing1～4の数値を前後・内外・主翼/尾翼の位置へ読み替える根拠は今回得ていない。R4の通常モデルはBlueprint参照名がR3_Baseとなっているが、モデルIDとMaxHealthはR4/100であり、Blueprint名だけでHP150と解釈しない。

### 8.2 LADONとの対比・命名候補

LADONは `OP0045_ladn_TailWing_L/R` がHP150、`OP0045_ladn_Wing_L/R` がHP200。各々にM7の耐性差分がある。HP150のM7条件がPODARGEのWing3と偶然同じ計算属性だったが、部位としては一致しない。

LADONは `TAIL WING《LADON》` と `MAIN WING《LADON》` が候補。前者は内部名TailWingに直接対応し、後者はTailWingとの対比による説明的名称で、内部名そのものはWing。ゲーム内正式名称として確認した表記ではない。M7差分は改名しても保持する。

PODARGEは `AIR INTAKE`、`ELEVATOR`、`FLAP` と翼4種へ分ける候補がある。ただし全てゲーム内のWING SPAR表示とは異なる編集名となる。Wing1～4は位置の裏付けを得るまで既存名とHPを維持し、内部番号を無説明に正式名称へ採用しない。各名称にはPODARGEの親注記を保持する。実装・表示名変更は未実施。

### 8.3 検証範囲

現行配信値、catalog、DT_NPC、DT_NPC_Model、sourceRefsが指す任務表を読み取り、HPと左右・子NPCの対応を確認。外観、取り付け座標、メッシュ、ゲーム内表示位置、実測は未確認。アプリ変更なしのためテスト未実行。

## 9. 表示集約の再開基準（2026-11-07）

追加探索は終了。[終了時の記録](TARGETABILITY_FOLLOWUP.md#11-探索終了時の記録2026-11-07)に確認済み事項・未解決点・再開の参照先を保存した。ここからは既存の合意を基に集約表示と命名を検討し、ロック可否の確定を待たない。

| 論点 | 再開時の扱い |
| --- | --- |
| 集約する組 | 第2節のNo.1、4～20、22、23の20組。No.2は別部位なので撤回、No.3は378除外により撤回、No.21はBUILDING3行の除外により集約対象から外す |
| 除外対象 | 378、181/186/190、157/80/136、250、152の9行。元定義や調査証拠の削除ではなく掲載除外。現行マスタには未反映 |
| 保留の翼 | LADON4行、PODARGE Wing3/4の2行は、当面の案では現行行を維持。実ロック確認を追加作業の前提にしない。PODARGE Wing1/2の掲載維持は合意済み |
| 保持する差 | HP・耐性・空中判定・ロール補正・通常計算可否の差を保持。M25耐性の採否は別件として保留。PODARGE空中/水上とそのAA GUNのHP10/20を区別 |
| 所属・分類・任務 | 元行と出典の対応を保持。絞り込みは元行へ適用してから集約する案。代表1件の所属へ置き換えない |
| 親注記 | 基本名とHPだけで区別できるという理由では外さない。PILLARの全行共通のMEGAFLOAT注記を外す案は継続。MSL PALLET等の一意な名前の注記は、集約後の命名で個別に判断 |
| 名称 | 英語の基本名を使い、日本語訳や倍率の説明を足さない。LAND BATTLESHIPの同値部位はNo.1～3を集約名で分けない。PODARGEの空中/水上を区別する表記、複数所属の親注記、翼の改名は未確定 |

次の検討対象は20組の集約後の表示名と、複数所属を持つ行の注記。翼は現行名とHPを維持して命名保留のまま切り離して扱える。選択操作の詳細は未確定で、元データの統合・アプリ実装はまだ行わない。

本節の20組は既存表の採否を整理した数で、新たな同値候補を抽出したものではない。旧節の表示件数試算は除外確定前の履歴として扱う。テストは未実行（文書のみの変更）。

## 10. 20組の表示名と複数所属の注記案（2026-11-07）

採否判断と命名提案を整理した未実装の文書。第9節の20組を1～20に振り直した対応表を更新した。PODARGE搭載中のLAND AEGIS373とLAND DESTROYER377を除外し、ユーザーの明示により搭載LAND AEGISの個別部位374/375/376も除外対象とする。LAND AEGISは106/367の2行集約、LAND DESTROYERは310だけの単独行となり、現在の集約対象は19組52行。旧No.5は対応確認用に表へ残す。掲載除外対象は378、181/186/190、157/80/136、250、152、373/377、374/375/376の計14行。搭載LAND AEGISの本体だけを除外して個別部位を残した従前の解釈は撤回した。投下後・地上配置など非搭載LAND AEGISの個別部位は維持する（第10.5節）。

翼は親注記も含め現行名を維持する。M25耐性の採否は引き続き保留。

第12節の方針はユーザー了承済み。PILLARの上書き前の基本行500/501も掲載除外とし、除外対象は計16行となる。これらは集約外の単独行なので、19組52行という同値集約対象数は変わらない。

表示形式は `基本名《所属注記》 [任務差分]`。第11節のユーザー判断を反映し、AA GUNとSAMは通常地上型を無注記、通常艦載を《SHIP》とする。CIWSとNAVAL GUNは通常艦載を無注記とし、CIWSの単独地上型には《GROUND》を付ける。VLSは通常艦載を無注記にする提案を維持する。特殊な所属の別計算条件は親名で区別し、同値のPODARGE空中版・水上版にはAIR/SEAを列挙しない。表では基本名・任務注記と親注記を分けて示す。例えばNo.14の完成形は `AA GUN《SHIP》 [M25]`。

| No. | 元ID | HP | 基本名・任務注記 | 親注記案 |
| --- | --- | ---: | --- | --- |
| 1 | 201/202 | 20 | MSL PALLET | なし。C-130所属は検索・所属詳細に保持 |
| 2 | 107/368 | 35 | CIWS | 《LAND AEGIS》。搭載中の374は除外 |
| 3 | 380/313/314 | 35 | DISP. RAIL GUN | なし。LAND DESTROYER側を基準とする案 |
| 4 | 106/367 | 200 | LAND AEGIS | なし。373を除外 |
| 5（集約撤回） | 310 | 200 | LAND DESTROYER | なし。377を除外し310単独を維持 |
| 6 | 108/369 | 80 | SHUTTER | なし。LAND AEGIS側を基準とする案。搭載中の375は除外 |
| 7 | 379/312 | 80 | SSM LAUNCHER | なし。同名の別計算条件が残らないため省略する案 |
| 8 | 184/383 | 40 | VLS | 《PODARGE》 |
| 9 | 109/370 | 35 | VLS | 《LAND AEGIS》。搭載中の376は除外 |
| 10 | 148/248/227 | 40 | AA GUN | 《LAND BATTLESHIP》 |
| 11 | 150/257/229 | 70 | AIRBURST GUN | 《LAND BATTLESHIP》 |
| 12 | 155/254 | 40 | VLS | 《LAND BATTLESHIP》 |
| 13 | 244/124/126/64/60/58/53 | 20 | AA GUN | 《SHIP》 |
| 14 | 343/362/366 | 20 | AA GUN [M25] | 《SHIP》 |
| 15 | 243/127/63/61/57 | 20 | NAVAL GUN | なし。通常艦載を基準とする |
| 16 | 342/363/365 | 20 | NAVAL GUN [M25] | なし。任務注記だけを残す |
| 17 | 246/129 | 20 | VLS | なし。通常艦載を基準とする案 |
| 18 | 128/65/309 | 20 | SAM | 《SHIP》 |
| 19 | 420/419 | 100 | PILLAR (Front) | なし。M27の有効値を標準にする案（第12節） |
| 20 | 422/421 | 200 | PILLAR (EV) | なし。M27の有効値を標準にする案（第12節） |

### 10.1 所属表記の意味

`/` は元行が持つ所属先の列挙であり、搭載順序を表さない。物理的な搭載階層は出典側で保持する。分類・所属・任務を独立した集合に潰さず、元行ごとの対応を残す。LAND AEGISのCIWS/SHUTTER/VLSからはPODARGE搭載中の行を除外するため、《LAND AEGIS / PODARGE》という旧注記は使わない。

《SHIP》は通常艦載の集約組につける表示注記であり、roleGroup=shipの全行を統合する規則ではない。LAND BATTLESHIPやLAND AEGIS、PODARGEなど、計算条件が異なる行は引き続き分ける。元の艦名と任務の組み合わせは検索・所属詳細に保持する。373/377は掲載除外対象なので、LAND AEGIS/LAND DESTROYER本体の集約行に搭載形態として含めない。

LAND BATTLESHIPの注記は番号を省く。元のNo.1/2/3と任務の対応は保持する。AA GUNとAIRBURST GUNは1～3、VLSは1/2だけであり、VLSにNo.3を追加しない。

### 10.2 PODARGEと任務注記

`PODARGE (AIR)` / `PODARGE (SEA)` は、空中版・水上版で計算条件が変わる場合にだけ使う表記案。PODARGE本体は空中判定が異なるため区別し、AA GUNは `AA GUN《PODARGE (AIR)》`（HP10）と `AA GUN《PODARGE (SEA)》`（HP20）へ揃える。VLS184/383は同値なので `VLS《PODARGE》` とする。AIR/SEAは親の形態を表し、攻撃側の対空・対地補正を表すラベルではない。翼の親注記は今回変更しない。

No.14/16の[M25]は現在分離している任務耐性の注記を保持する。No.13にもM25出典を持つAIRCRAFT CARRIER/GUNBOATが含まれるため、No.13を「M25以外」とは呼ばない。

PILLARに[M27]を残してIN基本行500/501と並べる旧案は、第12節の再照合により撤回する。M27で有効なOUT420/422とIN419/421をFront/EVごとに集約し、`PILLAR (Front)` / `PILLAR (EV)` を標準表示とする案。上書き前の基本値500/501は掲載除外案とし、元の定義・任務上書きの根拠は保持する。SHUTTER426もM27の有効値を維持した `SHUTTER《MEGAFLOAT》` を提案する。

現行の配信マスタと既存の統合判断を照合した命名提案であり、新たなゲーム解析は行っていない。マスタ・アプリは未変更。文書のみの変更のためテスト未実行。

### 10.3 単独地上目標の有無の確認

現行 `src/data/targets.json` の非EXCLUDED行について、名称と `partOf` を照合した。以下の「なし」は現行掲載データ内の結果であり、ゲーム全配置の不存在を主張するものではない。

| 基本名 | 親なしの単独地上行 | 命名への反映 |
| --- | --- | --- |
| CIWS | 414、HP20、M27、roleGroup=ground | 単独地上はCIWS《GROUND》。AEGIS艦載245（HP20、roleGroup=ship）はCIWS、344はCIWS [M25]。LAND AEGIS、LAND BATTLESHIP、LADONの別条件は親名を維持 |
| AA GUN | 32、HP20 | 単独はAA GUN、通常艦載の集約組はAA GUN《SHIP》 |
| SAM | 33、HP20 | 単独はSAM、通常艦載の集約組はSAM《SHIP》。LAND BATTLESHIPのHP40行は別 |
| AIRBURST GUN | 79、HP20 | 単独はAIRBURST GUN、HP70集約組はAIRBURST GUN《LAND BATTLESHIP》 |
| VLS / NAVAL GUN / DISP. RAIL GUN / SHUTTER | なし | 単独地上との区別は不要。第11節に従い基準側を無注記、別計算条件を持つ例外側を親注記付きとする |
| SSM LAUNCHER | なし | 集約後は同名1条件になるため、親注記を省略する案 |

CIWSは地上414と艦載245が同じHP20でもロール補正が異なる。名称とHPだけで両者を同一視しない。既存の「HP列だけを理由に親注記を外さない」方針と、同値の形態名・艦名列挙を簡略化する今回の判断は分けて扱う。

### 10.4 SSM LAUNCHERとPODARGEのVLSの所属再確認

現行配信マスタ、catalogのsourceRefs、抽出済みDT_NPC_Mission025day2・DT_NPC・DT_NPC_Modelを照合。追加のnative解析・実ゲーム確認は行っていない。

SSM LAUNCHERは312（LAND DESTROYERの部位、HP80、M23/24/25）と379（PODARGE搭載LAND DESTROYERの部位、HP80、M25）の2行。単独地上型もM27出典も現行catalogにはない。SSM LAUNCHERの名前を無注記とする案は、単独地上型があるという意味ではない。

| ID | HP | 実際の搭載元 | 任務出典・参照 |
| --- | ---: | --- | --- |
| 184 | 40 | 空中PODARGE自身 | 掲載M11/M25。norn_VLS_L1/R1、Air_norn_VLS_L1/R1_MS25day2。M25モデルはOP0044_norn_VLS_MS25 |
| 383 | 40 | 水上PODARGE自身 | 掲載M25。Sea_norn_VLS_L1/R1_、モデルVE006_norn_VLS |
| 376 | 35 | PODARGE搭載LAND AEGIS | 掲載M25。ldag_VLS1/2_MS25day2、モデルGR034_ldag_VLS1/2_CP_MS25 |

M25の `Air_norn_MS25day2_ldag` は `OP0044_norn_MS25day2_ldag` を参照し、そのChildNPCIdにはLAND AEGISの `GR034_ldag_MS25day2` とPODARGE自身のVLS左右が共存する。LAND AEGISのChildNPCIdにはHP35のVLS1/2がある。したがってこの搭載型は構成上HP40/35の両方を持つが、HP35はPODARGE固有武装ではない。LAND AEGISを積まない空中型・水上型にもHP35があるという意味ではない。

SSM LAUNCHER379も `ldds_Msl1/2_MS25day2` → `GR035_ldds_Launch_L/R_MS25day2` であり、`GR035_ldds_MS25day2` の子NPC。PODARGE自身の発射装置と搭載LAND DESTROYERの発射装置を同列に列挙した旧親注記は、直接の搭載元と運搬元が混在していた。

この確認を踏まえ、HP35のVLSは `VLS《LAND AEGIS》`、HP40のPODARGE固有VLSは `VLS《PODARGE》` とする案。後続のユーザー判断で、搭載LAND AEGISの376は掲載除外となった。HP35の掲載には非搭載の109/370だけを使い、376の出典は除外記録として保持する。HP35とHP40の計算条件は統合しない。VLSも現行catalogの全行に親があり、単独地上型の掲載はない。

### 10.5 搭載LAND AEGISの部位除外（ユーザー確定）

PODARGE搭載中のLAND AEGISは本体・個別武装を取り扱わない。投下済み・既に地上にあるLAND AEGISの武装は個別に掲載する。本体373だけを除外して搭載武装を残す解釈を訂正する。

| 対象 | 搭載中として除外するID | 維持する非搭載行 |
| --- | --- | --- |
| LAND AEGIS本体 | 373（既決） | 106/367の集約。315は後続の出典再照合で追加除外候補へ変更（最新一覧参照） |
| CIWS、HP35 | 374 | 107/368の集約 |
| SHUTTER、HP80 | 375 | 108/369の集約 |
| VLS、HP35 | 376 | 109/370の集約 |
| NAVAL GUN、HP35 | 今回の搭載部位3行に対応なし | 327を維持 |

DT_NPC_Mission025day2の `ldag_MS25day2` が参照する `GR034_ldag_MS25day2` のChildNPCIdはCIWS左右、Mudr、VLS左右の5件。catalogの374/375/376のsourceRefsはこの5件をすべてカバーすることを照合した。SHUTTER375は `ldag_Mudr_MS25day2` に対応するため、搭載LAND AEGISの部位として同じ除外範囲に含める。

M25を一括除外する規則にはしない。非搭載行のM25出典も維持し、PODARGE固有VLS184/383（HP40）も維持する。これは掲載範囲の判断であり、投下時の実行時状態遷移を追加解析した結果ではない。テスト未実行（文書のみの変更）。マスタ・アプリへの反映は未実施。

## 11. 無注記の基準と例外の親注記（2026-11-07）

多数を占める所属群を無注記にする案を検討した後、ユーザー判断でAA GUN/SAMは通常地上型、NAVAL GUN/CIWSは通常艦載型を基準とする方針が確定した。VLSは通常艦載を無注記とする提案を維持する。以下は命名方針の記録で、マスタ・アプリへの実装は未着手。

ここでの基準は表示名の基準であり、計算値・任務設定の正本ではない。基本名ごとに基準となる所属群を固定し、検索・任務フィルターの結果で名前を入れ替えない。元の名称・所属は検索情報として保持する。

所属種類・件数は参考とし、最多側へ機械的に統一しない。AA GUN/SAMは通常地上目標を基準に、NAVAL GUNは名前から艦載が読み取れるため通常艦載を基準にする。CIWSもユーザー判断により通常艦載を基準とする。元行数は任務差分や左右部位の分割に左右されるため、そのまま多数決に使わない。

| 基本名 | 無注記にする側 | 親注記を残す側の例 |
| --- | --- | --- |
| AA GUN | 通常地上型（32）。ユーザー確定 | 通常艦載は《SHIP》。その他は《LAND BATTLESHIP》《LAND DESTROYER》《TRIUMPHANT》《CELAENO》《PODARGE (AIR)》《PODARGE (SEA)》 |
| SAM | 通常地上型（33）。ユーザー確定 | 通常艦載は《SHIP》。LAND BATTLESHIPの別条件は《LAND BATTLESHIP》 |
| VLS | 通常艦載（AEGIS/BATTLECRUISER）。提案 | 《LAND AEGIS》《LAND BATTLESHIP》《PODARGE》《AIRSHIP》《CELAENO》《TRIUMPHANT》 |
| NAVAL GUN | 通常艦載。ユーザー確定 | 《LAND AEGIS》《TRIUMPHANT》 |
| CIWS | 通常艦載（245）。ユーザー確定 | 単独地上型414は《GROUND》。その他は《LAND AEGIS》《LAND BATTLESHIP》《LADON》 |
| AIRBURST GUN | 単独地上型79、HP20、M5/23/25。既存案を維持 | HP70の150/257/229集約組は《LAND BATTLESHIP》 |
| DISP. RAIL GUN | LAND DESTROYER側のHP35集約組。提案 | HP60の484は《TRIUMPHANT》 |
| SSM LAUNCHER | HP80の同値集約組。親注記省略案を維持 | 同名の別計算条件なし |
| SHUTTER | LAND AEGIS側のHP80集約組。提案 | HP100の426は《MEGAFLOAT》。M27注記は第12節の案で省略 |

AA GUN/SAMとCIWSでは無注記にする側が逆になる。特殊な親の別計算条件まで《SHIP》や《GROUND》へ一括置換せず、親名による識別を維持する。

M25耐性は別件保留のため、`AA GUN《SHIP》` と `AA GUN《SHIP》 [M25]`、`NAVAL GUN` と `NAVAL GUN [M25]`、`CIWS` と `CIWS [M25]` を分ける。VLSも対応する任務差分を保持する。無注記化は異なる計算条件を合算する判断ではない。

MSL PALLET・SSM LAUNCHERのように、同値集約後に同名の別条件が残らないものは基本名だけでよい。PODARGE VLSのAIR/SEAは同値なので省略し、HP35のLAND AEGIS VLSとは直接の搭載元で区別する。翼は今回も変更しない。その他の基本名の基準選びは、この方式の採否を踏まえて整理する。

DISP. RAIL GUN・SSM LAUNCHER・SHUTTERは現行マスタのEXCLUDEDを含む全該当行に親があり、単独地上型の掲載はない。ユーザーから親注記省略の見直しを求められたため、上表の基準側を無注記とする案を追加した。単独型がないことを理由に全条件を同じ表示名へ揃えるのではなく、既存の「基準側は無注記・例外側に親注記」という方針を適用する。

具体案は `DISP. RAIL GUN`（HP35）、`DISP. RAIL GUN《TRIUMPHANT》`（HP60）、`SSM LAUNCHER`（HP80）、`SHUTTER`（HP80）、`SHUTTER《MEGAFLOAT》`（HP100、第12節を反映）。TRIUMPHANT版とMEGAFLOAT版はHP以外の計算条件も異なるため別行を維持する。SHUTTER375は搭載LAND AEGISとして除外対象、503は既存EXCLUDEDのままとし、今回の命名検討で復活させない。

AIRBURST GUNについても単独設置型の有無を再照合した。79はpartOf=null、category=GROUND、roleGroup=groundで、掲載任務はM5/23/25。catalogの出典はDT_NPC_Mission006とDT_NPC_Mission024のflak_01/02/03、およびDT_NPC_Mission025day2のflak_MS25。内部表番号とゲーム内任務番号は一致しない。LAND BATTLESHIP側150/257/229はHP70・roleGroup=shipで、掲載任務はM9/19/17。単独型が存在するため、`AIRBURST GUN`（HP20）と `AIRBURST GUN《LAND BATTLESHIP》`（HP70）を維持する案とする。

検証：対象IDと所属は現行の集約組とcatalogを照合。単独目標の有無とPODARGEの搭載構成は第10.3・10.4節を参照。テスト未実行（文書のみの変更）。マスタ・アプリは未変更。

## 12. M27専用対象の有効値を標準にする案（2026-11-07）

ユーザーから、PILLARとMEGAFLOATのSHUTTERがM27以外に出現しないなら、M27注記を外した標準表示にできるという指摘を受けた。抽出済み任務表を再照合し、M27の上書き後の値を唯一の掲載条件とする方針へ更新し、ユーザー了承を得た。M25耐性の採否は別件として保留を維持する。

### 12.1 確認結果

`docs/initial/ref/tables/DT_NPC_Mission*.json` の43表を、DT_NPCのModelIdを介して照合した。通常PILLARの各IN/OUTモデルと `Megafloat_Center_Shutter` を参照する任務行は、DT_NPC_Mission027の25行だけだった。PILLARはFrontの内外各2行とEVの内外各10行、SHUTTERは1行。これは抽出済み任務定義の確認であり、全実行時生成経路やゲーム内耐性の実測ではない。

| 対象 | 基本定義 | M27の有効な任務設定 |
| --- | --- | --- |
| PILLAR OUT（420/422の出典） | MGFPillar_WPDur_000 | 同じMGFPillar_WPDur_000 |
| PILLAR IN（500/501の出典） | MGFPillar_WPDur_001 | 全12行がMGFPillar_WPDur_000へ上書き。掲載419/421に対応 |
| MEGAFLOAT SHUTTER（503の出典） | NPC_WPDur_000 | MGFMainCannon_Core_WPDur_000へ上書き。掲載426に対応 |

PILLARのIN基本値500/501はDT_NPCだけを出典とする行であり、M27では対応する任務行419/421が同じNPCを参照して耐性を上書きする。現行配信の500/501にmissionIds=[27]があることは、上書き前の値を使う別個体がM27に存在する証拠として扱わない。

### 12.2 掲載・表示案

| 表示名 | HP | 掲載する計算条件 | 基本行の扱い |
| --- | ---: | --- | --- |
| PILLAR (Front) | 100 | OUT420とM27 IN419を同値集約 | 上書き前の500は掲載除外 |
| PILLAR (EV) | 200 | OUT422とM27 IN421を同値集約 | 上書き前の501は掲載除外 |
| SHUTTER | 80 | 非搭載LAND AEGISの108/369を集約 | 従前の判断を維持 |
| SHUTTER《MEGAFLOAT》 | 100 | M27の426の値を維持 | 上書き前の503は既存EXCLUDEDを維持 |

M27の任務上書きを適用した値を各対象の標準値とし、表示名から[M27]を外す。PILLARの《MEGAFLOAT》も従前案どおり省略する。SHUTTERにはLAND AEGIS側との区別が必要なため《MEGAFLOAT》を残す。元NPCの基本定義、上書き内容、任務出典は監査・生成用に保持し、注記省略によってM27以外の任務へ適用を広げない。

ユーザー了承により新たに500/501の2行を除外し、掲載除外対象は計16行。同値集約対象は19組52行のまま。追加のnative解析・アプリ変更は行っていない。テスト未実行（文書のみの変更）。
