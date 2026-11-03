# 目標属性41行の再調査

状態: 調査41行のうち24行を承認後に反映済み（9節）。区分8の5行・MEGAFLOAT系12行は未反映。1〜8節の「未反映」「変更禁止」は初回調査時点の範囲を示す。

## 1. 概要

2026-11-03着手。開始時HEADは`9342e63`、作業ツリーはクリーン。local_002は完了のままとし、掲載311行のうちisAirまたはROLE区分が未確認の41行を再調査する。

| 用語 | 意味 |
| --- | --- |
| 属性確定 | 読取境界を検証したBlueprintの全継承とnative初期値から静的初期属性を確認した状態 |
| 資産不足 | 参照先の資産または親クラスが手元にない状態。未使用とは断定しない |
| イベント依存 | 静的初期値だけでは実際の被弾・破壊条件を確定できない状態 |

目的は解析器修正後の未確認範囲を分解すること。現行ビルドの静的証拠と基準ビルド・実ゲームの確認を区別する。

| 期待効果 | 完了時に示すもの |
| --- | --- |
| 調査対象の絞り込み | 各IDの属性、根拠、読取失敗・資産不足・イベント依存の区別 |
| 後続の反映判断 | 配信データへ反映可能な候補と、追加確認が必要な条件 |

## 2. 対象ファイル

| ファイル | 変更内容 |
| --- | --- |
| 本書 | 調査計画・対象一覧・結果・制約 |
| docs/analysis/calculation/MASTER_AUDIT.md | 現行件数と調査結果の参照を更新 |
| docs/analysis/calculation/investigate_target_attributes.py | 既存解析器で対象のみ再読取する調査用スクリプト |
| docs/analysis/calculation/TARGET_ATTRIBUTE_EVIDENCE.json | Git管理用の証拠抜粋。属性位置・資産ハッシュ・全出典・native命令 |
| docs/analysis/calculation/CALCULATION_EVIDENCE.md | 今回の調査結果と残る制約への参照 |
| data/local/local003-target-attributes.json | 調査結果のみ保存。生成用catalog・既存証拠を上書きしない |

## 3. 調査方針

ゲームは`D:/Steam/steamapps/common/ACE COMBAT 8`を読み取りに限定し、起動・設定・セーブ変更はしない。配信3ファイル、catalog、既存npc-evidence・native-constructorsを変更しない。追加抽出が必要な対象は取得可否と不足を記録する。名前・分類・隣接モデルから値を補完しない。

## 4. 調査手順

掲載対象41行を全sourceRefsからNPC・Model・Blueprintへ解決する。修正済みcollectorの初期化部分だけを再利用し、CDOの読取長・継承全段・上書きとnative初期値を確認する。通常被弾経路、最低HP、ROLE無効化は属性とは別に扱う。ビルド識別とファイルハッシュを記録し、調査前後の非変更を検証する。

## 5. 検証方針

| 対象 | 確認方法 |
| --- | --- |
| 範囲 | 現行配信JSONから41行を抽出し、全出典を照合 |
| 読取 | 親クラスを含めCDO消費長と定義長が一致。エラーを既定値にしない |
| 根拠 | EXE・資産ハッシュ、属性位置、native命令を記録 |
| 非変更 | catalog・既存証拠・配信3ファイルのSHA-256を前後比較 |

## 6. 進捗

- [x] 対象と変更禁止範囲を確認する
- [x] 全41行を再調査し、確定・資産不足・イベント依存を整理する
- [x] MASTER_AUDITを現行データと調査結果へ合わせる
- [x] 検証結果と反映候補を記録する
- [x] 24行の配信反映を合意し、実装・検証する
- [ ] 区分8の5行とMEGAFLOAT系12行の反映方針を決める

初回調査では配信反映を対象外とした。後続の承認で24行を反映し、残る17行を扱うためlocal_003はwipとして管理する。

## 7. 調査結果

### 7.1 結論と範囲

41行・117出典・48モデルについて、全継承に含まれる72 BlueprintのCDOを定義末尾まで読み切った。エラー0、全72件で消費長=定義長。各行にまとまる全出典の静的属性が一致した。isAirとGameObjectCategoryは全41行で確認でき、対象の静的属性を調べるための資産不足は0件。調査開始時のisAir未確認36行・roleGroup未確認34行（重複を除き41行）は、配信データでは変更していない。

**静的属性の確認と、実ゲームの全局面で必要命中数を確定できることは別。** 全41行でLiveAIGameObjectへの継承を確認し、今回の全出典に正のMinHealthはなかった。ただし被弾処理の上書き、配置でのROLE無効化、任務イベントによる状態変更まではこの調査で網羅していない。現在standardDamage=falseの13行は、いずれも旧解析のクラス読取・親参照失敗で基底クラスを確認できなかった行であり、非標準の被弾処理を実測した結果ではない。

| 反映検討の区分 | 行数 | 判断 |
| --- | ---: | --- |
| 既存のROLE区分に対応する候補 | 24 | isAir・roleGroupの根拠を確認。CH-47のstandardDamage判定も見直し候補。ただし今回未反映 |
| GameObjectCategory=8 | 5 | 属性とROLE100%の静的処理を確認。区分0のnoneと元定義を混同しない表現・対応付けが必要 |
| MEGAFLOAT系 | 12 | isAir=false・Category=4を確認。破壊条件とイベント後の被弾可否は継続調査。standardDamageを一律trueにしない |

### 7.2 読取失敗の原因と調査用対応

既存collectorや生成処理は変更せず、新しい調査スクリプト内だけで以下を補った。

| 原因 | 対応と検証 |
| --- | --- |
| BlueprintGeneratedClassの配列 | local_002で修正したDynamicBindingObjectsの読取を再利用 |
| CH-47のクラス名 | パッケージ名CPに対しexport名は`BP_OP0021_ch47_Cp_C`。クラス・CDO名の比較だけを大小文字非依存にし、実在するexportを使用。139/139バイト読取 |
| MEGAFLOATのnative親クラス | 既存キャッシュのLiveAIMegafloatConstructionのaddressが正しいFClassParamsより0x58後方だった。Pillarの親getterが参照する`0x14c51d650`から2プロパティと親LiveAIBuildingObjectを復元。以降ArrangementObject→AIGameObjectへ到達 |
| OptionalProperty（native型33） | 同名inner定義を捨てず、32bitの存在フラグと値を読取。V-22、ロケット系、SHUTTERのCDO境界が一致 |
| InterfaceProperty（native型18） | import/export参照の整数として読取。EXPLOSIVE UAVの全継承を読取 |
| EP40のnative struct不足 | `LiveCinematicsAnimationId`の登録情報`0x14dd44c28`で固有フィールド0・親PulldownStructBaseを確認。UNKNOWNの参照先EP40を108/108バイト読取 |

OptionalProperty・InterfacePropertyの保存形式は、[UAssetAPI OptionalPropertyData](https://github.com/atenfyr/UAssetAPI/blob/master/UAssetAPI/PropertyTypes/Objects/OptionalPropertyData.cs)と[InterfacePropertyData](https://github.com/atenfyr/UAssetAPI/blob/master/UAssetAPI/PropertyTypes/Objects/InterfacePropertyData.cs)を2026-11-03に確認した。形式の参考であり、ゲームでの属性値の根拠は実資産とEXEである。型を推測してバイトを読み飛ばさず、全CDOの末尾一致・親の完全読取を条件とした。

### 7.3 全対象一覧

以下は調査結果。24行は9節で反映済み、残る17行は未反映。T/FはbIsAirのtrue/false。区分はゲーム内GameObjectCategoryの値で、アプリの表示分類ではない。区分8の「中立」はROLE倍率100%を意味し、Category_None=0へ読み替えたものではない。

| ID | 現在の表示名 | isAir | 区分 / ROLE | 判断区分 |
| ---: | --- | --- | --- | --- |
| 201 | MSL PALLET《C-130》 | T | 8 / 中立100% | 区分8の対応付け候補 |
| 230 | CH-47 | T | 2 / air | 反映済み（standardDamageも復元） |
| 216 | EXPLOSIVE UAV | T | 1 / air | 属性反映済み |
| 373 | LAND AEGIS《PODARGE》 | F | 7 / ship | 属性反映済み |
| 377 | LAND DESTROYER《PODARGE》 | F | 7 / ship | 属性反映済み |
| 498 | UNKNOWN | T | 1 / air | 属性反映済み |
| 410 | UNKNOWN [M26] | T | 1 / air | 属性反映済み |
| 69 | V-22 | T | 2 / air | 属性反映済み |
| 457 | X-40 | T | 1 / air | 属性反映済み |
| 435 | X-40 [M28] | T | 1 / air | 属性反映済み |
| 45 | X-40 [M3] | T | 1 / air | 属性反映済み |
| 459 | X-40 NOSE UNIT | T | 1 / air | 属性反映済み |
| 106 | LAND AEGIS | F | 7 / ship | 属性反映済み |
| 315 | LAND AEGIS [M23] | F | 7 / ship | 属性反映済み |
| 155 | VLS《LAND BATTLESHIP 1》 | F | 6 / ship | 属性反映済み |
| 251 | BREACH《LAND BATTLESHIP 2》 | F | 6 / ship | 属性反映済み |
| 252 | CIWS《LAND BATTLESHIP 2》 | F | 6 / ship | 属性反映済み |
| 250 | CORE UNIT《LAND BATTLESHIP 2》 | F | 6 / ship | 属性反映済み |
| 255 | MAIN GUN《LAND BATTLESHIP 2》 | F | 6 / ship | 属性反映済み |
| 256 | SAM《LAND BATTLESHIP 2》 | F | 6 / ship | 属性反映済み |
| 228 | MAIN GUN《LAND BATTLESHIP 3》 | F | 5 / ground | 属性反映済み |
| 310 | LAND DESTROYER | F | 7 / ship | 属性反映済み |
| 314 | DISP. RAIL GUN《LAND DESTROYER》 | F | 0 / none | 属性反映済み |
| 418 | MEGAFLOAT | F | 4 / ground | イベント・被弾経路継続 |
| 423 | MEGAFLOAT | F | 4 / ground | イベント・被弾経路継続 |
| 430 | FUSION REACTOR《MEGAFLOAT》 | F | 4 / ground | イベント・被弾経路継続 |
| 420 | PILLAR《MEGAFLOAT》 | F | 4 / ground | イベント・被弾経路継続 |
| 422 | PILLAR《MEGAFLOAT》 | F | 4 / ground | イベント・被弾経路継続 |
| 429 | PILLAR《MEGAFLOAT》 | F | 4 / ground | イベント・被弾経路継続 |
| 500 | PILLAR《MEGAFLOAT》 | F | 4 / ground | イベント・被弾経路継続 |
| 501 | PILLAR《MEGAFLOAT》 | F | 4 / ground | イベント・被弾経路継続 |
| 419 | PILLAR《MEGAFLOAT》 [M27] | F | 4 / ground | イベント・被弾経路継続 |
| 421 | PILLAR《MEGAFLOAT》 [M27] | F | 4 / ground | イベント・被弾経路継続 |
| 503 | SHUTTER《MEGAFLOAT》 | F | 4 / ground | イベント・被弾経路継続 |
| 426 | SHUTTER《MEGAFLOAT》 [M27] | F | 4 / ground | イベント・被弾経路継続 |
| 264 | BVRAAM | T | 8 / 中立100% | 区分8の対応付け候補 |
| 237 | LAUNCH VEHICLE | T | 4 / ground | 属性反映済み |
| 238 | LAUNCH VEHICLE DEBRIS | T | 4 / ground | 属性反映済み |
| 505 | MSL DISPENSER | T | 8 / 中立100% | 区分8の対応付け候補 |
| 463 | MSL DISPENSER [M30] | T | 8 / 中立100% | 区分8の対応付け候補 |
| 462 | SLCM | T | 8 / 中立100% | 区分8の対応付け候補 |

LAUNCH VEHICLEとDEBRISは表示分類がOTHERでもisAir=true・Category=4。前者はLiveAILaunchVehicle、後者はLiveAIFallingObjectのnative初期値1を継承する。LAND AEGIS・LAND DESTROYERはCategory=7、LAND BATTLESHIP 3主砲はCategory=5、DISP. RAIL GUNはCategory=0であり、名前や所属から他部位と同じ値にはしない。

各IDから出典→モデル→Blueprint全継承・CDO位置を追える[機械可読証拠](../../../../docs/analysis/calculation/TARGET_ATTRIBUTE_EVIDENCE.json)を保存した。元のcategoryとroleGroupを別々に持ち、区分8を独立表示する。

### 7.4 区分8のROLE補正

対象は201・264・505・463・462。元のBlueprintでGameObjectCategory=8を確認し、既存bootstrapの0〜7だけの変換表ではroleGroup=nullになっていた。

基準ビルドの`role_columns_to_arrays.asm.txt`では、NPC配列に先頭100とCategory05〜11の7値を登録する。`npc_damage_role.asm.txt`の`0x147c93704`〜`0x147c9372b`は配列範囲外なら100を保持する。現行EXEでも命令パターンから別途見つけた配列作成`0x147d2c540`と参照`0x147c831f4`で同じ形を確認。長さ8に対して区分8は配列外となり、百分率100をfloat32(0.01)倍してROLE倍率1となる。旧アドレスを現行EXEに流用したものではない。

現行データ構造のnoneはCategory_None=0として記録されている。区分8を表示分類AIRCRAFTやROLE=airへ推測変換せず、将来の実装時に元区分8を保持した中立補正の扱いを決める。

### 7.5 残る調査と資産不足の扱い

| 残件 | 確認済み | 未確認・次の確認 |
| --- | --- | --- |
| MEGAFLOAT系12行 | 静的isAir=false・Category=4、AIGameObject継承。DeckのDestructConditionsはNum・Line・Pillarの3条件オブジェクト。ShutterのFreeFlightInitialEventNameはOpen | 条件オブジェクトの評価・被弾関数・キャンペーンイベントを追う。FreeFlightの値をキャンペーンの開閉状態とは扱わない。段階ごとの破壊可否・HP更新は実ゲーム観察も必要 |
| standardDamage=falseの13行 | CH-47の名前照合とMEGAFLOATの親参照失敗が原因。全出典のMinHealthは0または共通NPCで設定なし | CH-47は既存生成規則ならtrueに再判定される候補。MEGAFLOATも継承だけならtrueになるが、特殊破壊条件を確認せず解除しない |
| 配置・イベント全般 | 全CDOと通常初期属性を確認 | bDisableCategoryDamageRateは配置desc側も対象。CDOで上書きが見つからないことだけで全個体のROLE有効を保証しない。全レベル・全イベントは未解析 |
| ビルド差 | EXEは既存追加解析と同じSHA-256。基準数値資料のEXEとは異なる | 今回は再抽出しておらず、既存72資産とインストール済みコンテナの個別再照合は未実施。既存の現行ビルド抽出記録に基づく。今回の72資産が基準build 25201480と同一かも未確認。旧資産の追加取得が必要になる範囲。現行属性の証拠を旧ビルドの実測扱いにしない |
| 対象外の資産不足 | 今回41行の静的属性には不足なし | THRUSTER154のBP_TMP、8AAMプレイヤー定義などは今回対象外。除外済み154の掲載判断を再開しない |

MEGAFLOATのCDOにMaxHealthも存在するが、任務/NPC/modelのHP初期化と上書きの優先順位を今回新たに確定したわけではない。既存HPをCDO値に差し替えない。

## 8. 検証と次の判断

実行例:

```powershell
python -B docs/analysis/calculation/investigate_target_attributes.py 'D:\Steam\steamapps\common\ACE COMBAT 8\Game\Binaries\Win64\AceCombat8.exe'
```

- 全41行・117出典・48モデルを検査。72 CDOの境界一致、全継承の解決、同一ID内の静的属性一致を確認。
- native初期値9クラスの書込命令を現行EXEで再照合。即値とゼロ化レジスタの最終書込を確認。
- ROLE配列8要素と範囲外100の分岐を、現行EXE内の命令で再確認。
- 配信3ファイル、catalog、npc-evidence、native-constructors、generation-inputの7ファイルは前後SHA-256一致。再生成・bootstrap実行なし。

対象EXEのSHA-256は`3e47fd42858d1f2b81e59d7f57394a014c0eb6aaf4c02ee3da351b6a42936be2`。元資産uasset/uexpと解析入力のハッシュは証拠JSONに記録。証拠JSONはローカル報告から絶対インストールパスと保護対象ファイルのハッシュ欄を除いた抜粋である。

アプリのテスト・ビルドは未実行（アプリ・配信データ変更なし）。調査スクリプトの再実行で報告JSONのSHA-256が一致。整形済みの証拠JSONとローカル報告の内容一致、MASTER_AUDITの41 ID一致、文書内の相対リンクを確認した。`pnpm format:check`・`git diff --check`が成功。ゲームの起動・測定、ファイル追加抽出、設定・セーブ変更、コミット・push・PR作成は行っていない。

次は、24行の既存区分への反映候補と5行の区分8対応をレビューし、MEGAFLOAT系12行の扱いを分けて決める。属性だけの反映とstandardDamageの解除を同時に承認したとは扱わない。


## 9. 承認済み24行の属性反映

2026-11-03、ユーザーが「対応がはっきりしている24行」の対処を指示した。開始時HEADは`9342e63`、未コミット差分は前回のlocal_003調査・証拠JSON・解析スクリプト・MASTER_AUDIT/CALCULATION_EVIDENCEの更新。これらを保持して実装した。

### 9.1 反映範囲

対象IDは45・69・106・155・216・228・230・237・238・250・251・252・255・256・310・314・315・373・377・410・435・457・459・498。24行の全出典が参照する30モデルの属性だけをGit管理外のcatalogへ反映し、`pnpm generate:data`で配信JSONを更新した。同じモデルを参照する対象外の固定IDがないことを全catalogで確認した。

| ファイル | 変更 |
| --- | --- |
| data/local/catalog.json | 対象30モデルのisAir・roleGroup・元Categoryを確認値へ変更。CH-47のみstandardDamageもtrueへ復元 |
| src/data/targets.json | 24行のisAir、うち17行のroleGroup、CH-47のstandardDamageを更新 |
| src/data/target-attributes.test.ts | 全24行の属性、ROLEと条件付きMSLパーツ、CH-47の必要命中数、残る17行の保留を検証 |
| investigate_target_attributes.py | 反映後も再調査できるよう、開始時点の41固定IDを明示して再読取する |
| MASTER_AUDIT / CALCULATION_EVIDENCE | 反映済み24行と未反映17行を分離 |

CH-47は読取失敗でLiveAIGameObjectの継承を認識できず、standardDamage=falseとなっていた。全継承・CDO境界と任務MinHealth=0を確認した結果に基づき、既存の通常目標と同じ生成基準へ戻した。モデル/NPC/任務由来のHP35は維持し、CDOのMaxHealth200へ差し替えない。MEGAFLOAT系のstandardDamageはfalseのまま維持する。

全506行を実装前と比較し、差分は上記24行の属性のみ。固定ID、名前、表示分類、順序、HP、全耐性、missionVariant、partOfは完全一致。catalogの対象外モデル、全sourceRefs、除外指定、兵装・パーツは維持した。固定ID506件、掲載311行・EXCLUDED195行、元定義1459件・除外指定284件は変わらない。残る区分8の5行・MEGAFLOAT系12行は全フィールド一致。

### 9.2 検証

追加テストは反映前にCH-47のisAir=null、roleGroup=null、standardDamage=falseで失敗し、反映後に単体100テストが成功した。

独立した数値例として、攻撃機MSL基礎40についてVLS155の艦船補正40、対地パーツ適用44、3番艦主砲228の地上ROLE補正60、DISP. RAIL GUN314の無区分40を検証。LAUNCH VEHICLE237はROLE=ground・isAir=trueのため対空パーツで66、対地パーツでは60。CH-47はHP35・攻撃機倍率0.875からMSL35ダメージ・1命中を確認した。

`pnpm typecheck`・`pnpm lint`・`pnpm format:check`・`pnpm test`（100件）・`pnpm build`・`pnpm test:browser`（Chrome10シナリオ）が成功。PC・スマートフォン相当の既存選択・保存復元・検索・表示切替も成功。配信3ファイルは再生成前後のSHA-256が一致した。

調査スクリプトを反映後に再実行し、初回41行のモデル属性・CDO・native書込・ROLE処理・出典が初回証拠JSONと一致した。初回証拠JSONは当時の配信値を含む履歴として保存し、書き換えない。ローカル再調査報告のcurrent欄のみ反映後の値となる。既存npc-evidence・native-constructorsへの一括書戻し、bootstrap、ゲーム起動・変更、コミット・push・PR作成は行っていない。

### 9.3 残る17行とユーザー判断

区分8の5行は数値根拠が揃っており、先に実装側でCategory_None=0と区別した中立補正の対応付けを整理できる。追加のゲーム内知識をユーザーへ必須条件として求める段階ではない。

MEGAFLOAT系12行は、静的属性と破壊条件・被弾経路の確認を分ける。まず条件オブジェクト・被弾関数・イベントを追い、実ゲーム観察が必要な条件を絞る。部位のロック可否や破壊段階に関するユーザーの知見は補助になるが、記憶だけでHP・耐性・通常被弾判定を確定しない。
