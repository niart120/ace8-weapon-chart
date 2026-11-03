# 目標掲載範囲の追加監査

記録日: 2026-11-03。レビュー対象: `1fc1f6c`。[レビュー本体](INITIAL_IMPLEMENTATION_REVIEW.md)のR002・R005・Q001・Q002を補足する。

## 1. 出典と確認方法

配信用`src/data/targets.json`と、`data/local/catalog.json`の`sourceRefs`を対応させた。任務行から`NpcId → DT_NPC.ModelId → DT_NPC_Model`をたどり、耐性ID・表示名キー・Blueprint参照を照合した。新しい抽出や実ゲーム測定は行っていない。

Git管理外の資料を再調査する際の識別用に、確認時点のSHA-256を残す。

| ローカル資料 | SHA-256 |
| --- | --- |
| `data/local/catalog.json` | `4A661CCCD84D9DEDFE05EF39C3E75EB040A4B23846CD9E4D16A78B47D72B2E00` |
| `data/local/bootstrap.py` | `E04317E36209C08122E9664199A00364EBF00CA8406178FBAB4986137C0AA6A4` |

`bootstrap.py`は初期ID付与の処理を説明するために参照した。更新時の再実行を勧めるものではなく、既存IDの付け直しは行わない。

## 2. TYPHOONの2行

| 項目 | 通常設定 | SHADOW設定 |
| --- | --- | --- |
| アプリID | 95 | 333 |
| 表示名・HP | TYPHOON、60 | TYPHOON、60 |
| `missionVariant` | null | null |
| UAVT倍率 | 1 | 0.25 |
| その他の計算項目 | 右と同じ | 左と同じ |
| 出典例 | `DT_NPC_Mission025day2/typn_common` | `DT_NPC_Mission025day2/typn_Shadow_MS25day2_01`、`_02` |
| NPC例 | `OP1011_typn_01` | `OP1011_typn_Shadow_MS25day2_01`、`_02` |
| 通常耐性 | `NPC_WPDur_000` | `Shadows_WPDur_000` |

SHADOW側の任務耐性指定は`None`で、NPC側の`Shadows_WPDur_000`が適用される。同耐性の`Category19`は25。表示名の取得に使われる機体名はTYPHOONのままだが、NPCの`GameObjectDisplayName02`には`ContainerEnemyCallsign_Name_Shadow33rdUT`がある。

元データの参照先は[DT_NPC.json](../../../../docs/initial/ref/tables/DT_NPC.json):3803、[DT_NPC_WeaponDurability.json](../../../../docs/initial/ref/tables/DT_NPC_WeaponDurability.json):103。生成用定義は`catalog.json`:3858・3896、配信用定義は[targets.json](../../../../src/data/targets.json):4323・4354。

Chromeの1440×1000表示では、初期状態の結果表にTYPHOONが2行、TARGETSの検索結果にも`TYPHOON 60`が2件出る。`MISSION VARIANTS`はオフ。FIGHTER・パーツなし・DIRECTの全34掲載兵装で両行の結果が一致し、MSLは両方2発、UAVTは両方`?`だった。

結論: 耐性差があるため2行を統合する根拠はない。条件の識別と任務差分の扱いが欠落している。

## 3. 同一分類・同名・同HPの全グループ

EXCLUDEDを除き、`category/name/hp`の完全一致で集計した。34組69行。全組に下表の差があり、ID・表示順だけが異なる完全な重複はなかった。

数値は差の説明用に丸めて記載する。例えば0.1は配信用の`0.09999999403953552`を表す。`null`は未確認、`none`は確認済みのROLE区分であり、同一視しない。`standardMissile`は現在の誤ったキー名のまま記載しているため、この列の数値を正しいMSL耐性と解釈しない（R001）。

### 3.1 UAVT倍率だけが異なる12組

| 名称 | HP | 倍率1のID | 倍率0.25のID |
| --- | ---: | ---: | ---: |
| F-14D | 60 | 6 | 266 |
| F-15E | 88 | 272 | 134 |
| F-16C | 55 | 26 | 133 |
| GRIPEN E | 55 | 70 | 332 |
| MIG-29A | 60 | 67 | 28 |
| MIG-31B | 88 | 73 | 193 |
| MIRAGE 2000-5 | 55 | 4 | 135 |
| SU-33 | 65 | 68 | 336 |
| SU-35S | 65 | 265 | 305 |
| SU-47 | 60 | 207 | 236 |
| SU-57 | 115 | 335 | 235 |
| TYPHOON | 60 | 95 | 333 |

これらはAIRCRAFTに分類され、同じ組の2行はどちらも任務ラベルがない。TYPHOON以外も、SHADOWやVENTUSなどの元定義と対応させて表示条件を決める必要がある。すべてを同じ任務の差分と断定するものではない。

### 3.2 その他の22組

| 分類 | 名称 | HP | ID（左から差分値の順） | 差分 |
| --- | --- | ---: | --- | --- |
| AIRCRAFT | MSL PALLET《C-130》 | 20 | 201, 202 | `roleGroup`: null / none |
| GROUND | LAND BATTLESHIP 1 | 100 | 147, 371 | `guidedBomb`: 1 / 0.5、`bomb`: 1 / 0.25、`rocket`: 1 / 0.5 |
| GROUND | LAND BATTLESHIP 2 | 100 | 494, 496 | `isAir`: null / false、`roleGroup`: null / none、全17倍率: 1 / null |
| GROUND | LAND BATTLESHIP 2 [M20] | 100 | 247, 261 | `isAir`: null / false、`roleGroup`: null / none |
| GROUND | AA GUN《LAND BATTLESHIP 2》 | 40 | 248, 249 | `isAir`: false / null、`roleGroup`: ship / null |
| GROUND | VLS《LAND BATTLESHIP 2》 | 40 | 254, 258 | `isAir`: false / null、`roleGroup`: ship / null |
| GROUND | DISP. RAIL GUN《LAND DESTROYER》 | 35 | 313, 314 | `isAir`: false / null、`roleGroup`: none / null |
| SHIP | AEGIS | 155 | 242, 341 | `standardMissile`・`laser`: 1 / 0.5 |
| SHIP | AA GUN《AEGIS》 | 20 | 244, 343 | 同上 |
| SHIP | CIWS《AEGIS》 | 20 | 245, 344 | 同上 |
| SHIP | NAVAL GUN《AEGIS》 | 20 | 243, 342 | 同上 |
| SHIP | VLS《AEGIS》 | 20 | 246, 345 | 同上 |
| SHIP | AIRCRAFT CARRIER | 235 | 123, 461 | `antiShipMissile`: 0.5 / 1、`lacmBlast`: 0.2 / 1 |
| SHIP | CONTAINER SHIP | 75 | 12, 491, 492 | `standardMissile`: 1 / 5 / 10 |
| SHIP | DESTROYER | 115 | 59, 361 | `standardMissile`・`laser`: 1 / 0.5 |
| SHIP | AA GUN《DESTROYER》 | 20 | 60, 362 | 同上 |
| SHIP | NAVAL GUN《DESTROYER》 | 20 | 61, 363 | 同上 |
| SHIP | FRIGATE | 75 | 56, 364 | 同上 |
| SHIP | AA GUN《FRIGATE》 | 20 | 58, 366 | 同上 |
| SHIP | NAVAL GUN《FRIGATE》 | 20 | 57, 365 | 同上 |
| STRUCTURE | PILLAR《MEGAFLOAT》 | 100 | 420, 500 | `bomb`: 5 / 0.1 |
| STRUCTURE | PILLAR《MEGAFLOAT》 | 200 | 422, 501 | 同上 |

同名行を扱う修正では、未確認値と確認済み値の差も保持する。耐性の数値、分類、名前が同じだけで、未確認の属性を別モデルから補完しない。

## 4. QUEEN・GREENと追加の味方候補

### 4.1 既存調査との違い

[FRIEND_CANDIDATES.md](../../../../docs/analysis/friend-candidates/FRIEND_CANDIDATES.md):7–9の抽出対象は、任務行キー・NPC ID・モデルID・Blueprint名の4項目。今回、NPCの`GameObjectDisplayName02`、モデルの`GameObjectDisplayName01`・`BriefingDisplayNameID`でも`Ally|Friend`を検索した。

既存の合意済み除外集合外で43キャンペーン任務行が該当し、20の掲載行に対応した。これらを実ゲームで味方と確認したわけではない。従来の199行は変更せず、追加候補を別集合として扱う。

### 4.2 追加43任務行の対応

次表の任務番号は`DT_NPC_Mission`に続く識別子を示す。例えば004は`DT_NPC_Mission004`。任務をまとめた行は、列挙したすべての任務で同じ行キーを使う。

| 対象 | 任務識別子 | 任務行キー | 行数 | 対応する掲載ID |
| --- | --- | --- | ---: | --- |
| QUEEN 1 | 004, 006, 007, 009, 010, 011, 018, 019, 020, 021 | `f18c_Queen01` | 10 | 18、81（M7）、158（M11）、234（M19） |
| QUEEN 2 | 004, 006, 007, 009, 010, 011, 018, 019, 020, 021 | `f18c_Queen02` | 10 | 19、82（M7）、159（M11） |
| QUEEN 3 | 004, 006, 007, 009, 010, 011, 018, 019 | `f18c_Queen03` | 8 | 20、83（M7）、160（M11） |
| QUEEN 4 | 004, 006, 007, 009, 010, 011, 018, 019 | `f18c_Queen04` | 8 | 21、84（M7）、161（M11） |
| PURPLE MAGIC 1〜4 | 004 | `f15c_PurpleMagic1`〜`4` | 4 | 22〜25 |
| GREEN 1 | 015 | `OP1022_f16c_MS15` | 1 | 209 |
| AIRCRAFT CARRIER（ENDURANCEの呼称） | 011 | `edrne` | 1 | 162 |
| AIRCRAFT CARRIER（ENDURANCEの呼称） | 030 | `edrne_ms30` | 1 | 461 |

QUEENのM7・M11は`MinHealth=1`、その他の追加候補行は0。QUEEN 1のM19だけHP1002で、他のQUEENはHP57。最低HPや大きいHPは所属確定の根拠として使わない。

### 4.3 命名上の手掛かり

| 対象 | 確認したキー |
| --- | --- |
| QUEEN 1〜4 | モデル`OP1007_f18c_QUEEN_01`〜`04`の表示名・ブリーフィング名に`ContainerAllyCallsign_Name_Queen1`〜`Queen4` |
| QUEENのNPC別呼称 | `ContainerAllyCallsign_Name_LittleBee`、`Vaquero`、`Coyote`、`Solace` |
| PURPLE MAGIC 1〜4 | モデル表示名に`ContainerAllyCallsign_Name_Purplemagic1`〜`4` |
| M15のGREEN 1候補 | NPC `OP1022_f16c_MS15`の表示名に`ContainerAllyCallsign_Name_Viride` |
| ENDURANCEの2任務行 | NPC `VE024_edrne_02_wing`の表示名に`ContainerAllyCallsign_Name_Endurance` |

代表箇所: [DT_NPC_Model.json](../../../../docs/initial/ref/tables/DT_NPC_Model.json):1057、[DT_NPC.json](../../../../docs/initial/ref/tables/DT_NPC.json):8201。QUEENのアプリ定義は[targets.json](../../../../src/data/targets.json):3243以降、GREENは1342・1373、PURPLE MAGICは3057以降、AIRCRAFT CARRIERは7790・7821。

### 4.4 GREENを名前だけで一括除外できない理由

| 任務・NPC | 呼称キーの手掛かり | 現在の扱い |
| --- | --- | --- |
| M15 / `OP1022_f16c_MS15` | `ContainerAllyCallsign_Name_Viride` | GREEN 1、ID 209に統合 |
| M15 / `OP1022_f16c_Viride_01` | `ContainerEnemyCallsign_Name_Green1` | 同じGREEN 1、ID 209に統合 |
| M15 / `OP1022_f16c_Viride_02` | `ContainerEnemyCallsign_Name_Green2` | GREEN 2、ID 211 |
| M28 / `OP1022_f16c_Ally_Viride_01` | NPC IDにAllyあり | GREEN 1、ID 445、EXCLUDED |
| M28 / `OP1022_f16c_Ally_Viride_02` | NPC IDにAllyあり | GREEN 2、ID 446、EXCLUDED |

M15のGREEN 1の2元定義は、現在の表示名と計算条件が一致するため統合されている。どちらかだけを掲載対象外にする場合、ID 209の`sourceRefs`全体を一括除外してはいけない。所属に関する命名の違いだけでは、どちらかの実際の所属を断定しない。

### 4.5 既に除外されたQUEENとの違い

EXCLUDEDのQUEEN 1〜4（ID 137〜140）はF/A-18E系のPV用定義で、`BP_OP1032_f18e_CP_Ally_C`を参照する。今回の表示対象はF/A-18C系で、モデル`OP1007_f18c_QUEEN_*`と別のBlueprintを使う。既存199行の対応付けが消えて復活したものではない。

掲載判断の際は、任務行に加えて同じ掲載IDに入っている共通NPCの出典も確認する。共通NPCや同名の別任務をどこまで対象とするか、元定義単位で明示する必要がある。

## 5. ダミー用定義と未確認耐性

| NPC | 共通行 | 任務行 | 任務側の通常耐性 |
| --- | --- | --- | --- |
| `GR000_dummy_MS28_Airbase` | AIR BASE、ID 504 | `DT_NPC_Mission028/Gdummy_Airbase`、ID 456 | `NPC_WPDur_000` |
| `GR000_dummy_MS13_btr9` | APC、ID 489 | `DT_NPC_Mission013/Dummy_btr9_common`、ID 199 | `NPC_WPDur_000` |
| `GR000_dummy_MS20_ldbs2` | LAND BATTLESHIP 2、ID 496 | `DT_NPC_Mission020/GR037_ldbs2_ScoreDummy`、ID 261 | `ldbs2_WPDur_000` |

3NPCとも通常・爆風耐性IDは`None`、モデルHPは100で、`BP_GR000_dummy_CP_C`を参照する。共通行の全倍率はnullだが、任務側の耐性がある任務行は数値計算できる。この差を任務側から共通行への推測補完で解消しない。

これらは整理済みガイドのモデル対応から追加された行ではなく、表示名のあるキャンペーン任務行として取り込まれ、その後、任務差分に対する共通設定の生成処理でNPC共通行も追加された。掲載判断の再確認ではこの6行を対象にし、通常のAPCやLAND BATTLESHIP 2まで名称で除外を広げない。

元定義: [DT_NPC.json](../../../../docs/initial/ref/tables/DT_NPC.json):31173・41463・71621。掲載自体の誤りは未確定だが、共通行3件の耐性未確認が監査記録にないことはR005の確定指摘とする。

後続更新: Q002のユーザー判断を受け、上の6行をEXCLUDEDにした。固定ID・元定義・値は保持し、通常の同名目標は維持する。APCのゲーム内番号はM12、LAND BATTLESHIP 2はM19（内部任務識別子は変更なし）。陸上戦艦の同名行・親参照は[別調査Q003](LAND_BATTLESHIP_REVIEW.md)として記録した。
