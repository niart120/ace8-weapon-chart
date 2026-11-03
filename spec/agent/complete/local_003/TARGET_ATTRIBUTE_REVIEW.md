# 目標属性41行の再調査

状態: 完了。24行（9節）、区分8の5行（11節）、MEGAFLOAT系12行（14節）を承認後に反映済み。MEGAFLOATの親3行はEXCLUDED、部位9行は元HPの計算対象とした。1〜13節の「未反映」「変更禁止」「未コミット」は各調査・提案時点の履歴を示す。ROLE適用範囲の横並び調査は12節、MEGAFLOATの追加調査は13節。残る全配置・イベント・実ゲーム測定・ビルド差の制約は14.4節。

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
- [x] 区分8の5行の対応を合意し、元区分を保持して実装・検証する
- [x] ROLEが掛からない目標・武器分類の横並び調査を行う
- [x] MEGAFLOATの初期無敵・最低HP書換え・甲板の崩壊条件を再調査し、残件を分ける
- [x] 通常支柱の元HP計算・Front/EV表記と甲板2行の除外方針を合意する
- [x] MEGAFLOAT系12行の破壊条件・被弾経路を確認し、反映方針を決める
- [x] 甲板418/423・中央支柱429の除外、Front/EV表記、確認済み属性を反映する
- [x] 固定ID・子部位・旧保存、再生成、単体・画面・ビルドを検証し、完了配置へ移す

初回調査では配信反映を対象外とした。後続の承認で24行、区分8の5行、MEGAFLOAT12行を反映し、本作業単位を完了した。実ゲームの全状態の再現は本作業単位の完了条件には含めない。

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

以下は初回調査時点の名称と判断区分。24行は9節、区分8の5行は11節、MEGAFLOAT12行は14節で反映済み。T/FはbIsAirのtrue/false。区分はゲーム内GameObjectCategoryの値で、アプリの表示分類ではない。区分8の「中立」はROLE倍率100%を意味し、Category_None=0へ読み替えたものではない。

| ID | 現在の表示名 | isAir | 区分 / ROLE | 判断区分 |
| ---: | --- | --- | --- | --- |
| 201 | MSL PALLET《C-130》 | T | 8 / 中立100% | 区分8反映済み |
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
| 264 | BVRAAM | T | 8 / 中立100% | 区分8反映済み |
| 237 | LAUNCH VEHICLE | T | 4 / ground | 属性反映済み |
| 238 | LAUNCH VEHICLE DEBRIS | T | 4 / ground | 属性反映済み |
| 505 | MSL DISPENSER | T | 8 / 中立100% | 区分8反映済み |
| 463 | MSL DISPENSER [M30] | T | 8 / 中立100% | 区分8反映済み |
| 462 | SLCM | T | 8 / 中立100% | 区分8反映済み |

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


## 10. 区分8の5行への対応案（後続の承認で採用）

24行の変更と調査・検証記録は、ユーザー指示により`813504e`（`fix(data): 確認済み24目標の計算属性を反映`）へコミットした。本節はその後に提示した設計案を記録する。提案時は未実装だったが、ユーザー承認後の実装結果は11節に記載する。

### 10.1 ROLE100%の意味

ROLEは攻撃側プレイヤー機のFIGHTER・MULTIROLE・ATTACKER・ELECTRONIC WARFAREによる威力補正を指す。100%は倍率1.0で、この補正段階ではダメージが増減しないという意味。命中率100%、敵耐性100%、武器の全補正を無効にするという意味ではない。

例えば通常の航空機区分に対するROLE倍率はFIGHTERが1.25、ATTACKERが0.875だが、今回の区分8では4種類の自機ROLEすべてが1.0になる。原処理はNPC用配列の範囲外で100を保持する分岐であり、根拠は7.4節。数値が未確認なので1で埋めるものではない。

具体例としてBVRAAM（ID264）はHP40・通常MSL耐性1。パーツなしのMSL基礎40はどのROLEでも40ダメージとなり、静的条件では1命中。これをisAir=trueという理由だけでROLE=airへ変換すると、ATTACKERは35ダメージ・2命中となってしまう。isAirは通常MSLの対空・対地パーツ判定であり、ROLE区分とは別に使う。

### 10.2 対象と保持する値

| ID | 表示名 | HP | 元GameObjectCategory | isAir | 採用前のroleGroup |
| ---: | --- | ---: | ---: | --- | --- |
| 201 | MSL PALLET《C-130》 | 20 | 8 | true | null |
| 264 | BVRAAM | 40 | 8 | true | null |
| 505 | MSL DISPENSER | 30 | 8 | true | null |
| 463 | MSL DISPENSER [M30] | 15 | 8 | true | null |
| 462 | SLCM | 25 | 8 | true | null |

5行は6モデルに対応する。全モデルの`catalog.modelAttributes[modelId].category`は既に8で、証拠JSONの`static_attributes.gameObjectCategory`にも8を記録済み。ここでいう数値categoryは元モデルの属性であり、配信Target.categoryのAIRCRAFT・OTHERという表示分類とは異なる。両方を保持する。

### 10.3 推奨案: 元区分を保持し、計算用noneを再利用

元のcategory=8と出典を維持し、対象6モデルの計算用roleGroupだけをnullから`none`にする。生成結果の変更は対象5行のroleGroupだけに限定する。

現在の`none`は元Category_None=0に対応する計算用キーとして記録しているが、`modifiers.roles`では全ROLEで1.0となっている。これを「確認済みのROLE補正なし」を表す計算区分として定義し直す。元区分0と8はcatalogと証拠で区別したまま、同じ計算倍率を共有する。したがって7.4節の「元区分を混同しない」を満たす。元区分8を0へ書き換える案ではない。

| 層 | 区分0 | 今回の区分8 | 未確認の区分 |
| --- | --- | --- | --- |
| 元データ・catalog | category=0を保持 | category=8を保持 | 不明はnullを保持 |
| 計算用roleGroup | none | none（提案） | null |
| ROLE倍率 | 全ROLEで1.0 | 全ROLEで1.0 | 未確認として扱う |

元区分の保存先をcatalogと証拠にするのは、区分1/2→air、3/4/5→ground、6/7→shipという既存の生成方針と同じ。配信データへ新しい元区分フィールドを追加する必要はない。未確認区分を一律noneにする既定動作は導入せず、今回確認済みの区分8・6モデルだけを明示的に更新する。

isAir=trueとstandardDamage=trueは既存値を保持する。MSL.AIR.POW+は引き続き適用され、MSL.GND.POW+は適用されない。通常威力パーツ、兵装別耐性、HP更新は既存経路を使う。区分8は艦船区分6/7ではないため艦船専用補正は適用しない。HP・耐性・固定ID・名前・表示分類・親参照・任務差分・保存選択は維持し、MSL DISPENSERの共通行と[M30]行も統合しない。

### 10.4 別案との比較

| 案 | 利点 | 変更・判断 |
| --- | --- | --- |
| 既存noneを共有（推奨） | 元区分を失わず、計算処理・配信型・倍率表の追加が不要 | noneの意味を「確認済みのROLE補正なし」と文書化。5行のroleGroupのみ更新 |
| 区分8専用の計算キーを追加 | 配信データだけでも元区分0と区分8の違いを表せる | 型・検証器・生成・4ROLEの倍率表・各fixtureへ同じ1.0を追加する。現状の画面・計算にこの区別は不要 |

ROLE100%のために新しい画面設定を追加する案ではない。現状では既存noneの共有で目的を満たすため、専用キーは推奨しない。

### 10.5 実装する場合の検証

- 対象5行・6モデルだけを更新し、元category=8、固定ID、その他の配信値を保持する。Category_None=0の既存行も保持する。
- 5行×4ROLEでMSL基礎40・耐性1・パーツなしが40ダメージになることを検証。対空パーツだけなら44、対地パーツだけなら40とする。
- BVRAAMのHP40がパーツなし・全ROLEで1命中となることを確認。空中判定をROLE=airと誤混同した35/50へしない。
- 残るMEGAFLOAT系12行の未確認、TLS・UAVTなど兵装側の未確認を維持する。nullを1やnoneへ暗黙補完しない。
- 旧保存の選択保持、生成前後の対象外一致、再生成一致、型・Lint・整形・単体・ビルド・必要な画面確認を行う。

提案時の検証: 未実行（対応案のみ）。後続の承認によりnoneを共有する案を採用し、11節の検証を実施した。


## 11. 区分8の5行への反映結果

2026-11-03、ユーザーが元区分8の保持、5行のroleGroup=none、検証・本書への追記・コミットを指示した。開始時HEADは`813504e`。作業ツリーには前回提示した10節の文書差分だけがあり、それを保持して実装した。

### 11.1 変更

| ファイル | 内容 |
| --- | --- |
| data/local/catalog.json | Git管理外。OP0059_rpdna、OP0053_ulraam、OP0037_mmslct、OP0037_mmslct_FirstShot、OP0036_slcm、OP0039_slcmpのroleGroupのみnull→none。全6モデルのcategory=8を維持 |
| src/data/targets.json | `pnpm generate:data`で201・264・505・463・462のroleGroupのみnull→none |
| src/data/target-attributes.test.ts | 全5行×4ROLEの威力、MSL対空/対地パーツ、必要命中数、旧保存ID、MSL DISPENSERのHP差を確認 |
| MASTER_AUDIT.md / CALCULATION_EVIDENCE.md | noneの意味を確認済み補正なし（元区分0/8）と定義。未反映一覧をMEGAFLOAT12行へ更新 |

全506行をHEADと比較し、差分が対象5行のroleGroupだけであることを検証した。固定ID・順序・表示分類・名前・HP・耐性・isAir・standardDamage・missionVariant・partOfは一致。catalogは変更前コピーと比較し、6モデルのroleGroup以外の全項目が一致。全sourceRefs、除外指定、兵装・パーツも維持した。

掲載311・EXCLUDED195、元定義1459、除外指定284は不変。区分0の既存41行を変更せず、MEGAFLOAT12行の未確認とTLS・UAVT・8AAM・SFFSパーツの既存未確認も維持した。MSL DISPENSER共通505はHP30、[M30]463はHP15のまま別行として保持する。

### 11.2 検証結果

Redでは追加した1テストがID201のroleGroup=nullにより失敗し、既存100テストは成功。6モデルの反映・再生成後は単体101テストが成功した。

5行×4ROLEで基礎MSL40・耐性1・パーツなしが40、対空パーツが44、対地パーツが40となる。BVRAAMのHP40を含め、全対象がパーツなしで1命中。旧保存の5 IDはそのまま復元される。実装自身から期待値を生成せず、基礎40×確認済みROLE1×条件付き1.1/1を固定値で検証した。

`pnpm typecheck`・`pnpm lint`・`pnpm test`（16ファイル・101件）・`pnpm build`・`pnpm test:browser`（Chrome10シナリオ）が成功。`pnpm format:check`・`git diff --check`も成功。配信3ファイルは再生成前後のSHA-256が一致した。PC・スマートフォン相当の既存選択・保存復元・表示切替も成功。ゲーム起動・実測・ゲーム本体/設定/セーブ変更、push・PR作成は行っていない。

## 12. ROLE補正の横並び調査

ユーザー指示により、今回の5行以外に同様の補正なし分類がないかを調査した。対象を全934モデル・全42兵装へ広げ、詳細を[ROLE_SCOPE_AUDIT.md](../../../../docs/analysis/calculation/ROLE_SCOPE_AUDIT.md)、機械可読の抜粋を[ROLE_SCOPE_EVIDENCE.json](../../../../docs/analysis/calculation/ROLE_SCOPE_EVIDENCE.json)に保存した。

| 確認対象 | 結果 |
| --- | --- |
| 全モデル | 874件の元区分を確認。31件は資産不足、29件は区分属性を持つLiveGameObject非継承。未解決を0へ補完しない |
| CDO/native | 1079 CDO全件で読取境界一致。native初期値10クラスの書込命令を現行EXEと照合 |
| 掲載311行 | 全参照モデルの区分が解決。既存区分0の41行は既にnone。今回5行以外の補正なし分類漏れなし |
| 配信との差 | MEGAFLOAT12行だけ。区分4は確認済みだが、特殊破壊条件を確認するまで保留 |
| 武器42件 | 34件（掲載33件）はLiveWeaponBaseまで継承を解決。8AAMと未使用7件はBlueprint定義不足 |
| 共通ROLE処理 | 現行NPC補正関数に武器ID固有のROLE除外なし。子弾104/105の分岐はROLE後 |
| 別の適用条件 | 配置のROLE無効フラグ、プレイヤー以外からの攻撃、コンテキスト欠落ではROLEを省略する経路あり。全配置・イベントは未網羅 |

区分8は全9モデルで、そのうち6モデルが今回の5行、1モデルがEXCLUDEDのALCM203、2モデルは未登録。掲載判断や未登録モデルの追加は行わない。enumにある区分9 Heliosは874件の解決済みモデルにはなく、仮の数値や新規行は作らない。

全武器の継承と共通関数を確認したことを、全命中・子兵装・継続攻撃経路の実証とは扱わない。TLS/UAVTの経路と攻撃単位、8AAMの資産不足、配置・イベントによるROLE切替、基準ビルドとの資産差は残る。実ゲーム測定は行っていない。

横並び調査スクリプトの再実行で全報告のSHA-256が一致した。証拠抜粋の入力ハッシュ、Python構文、文書の相対リンクも検証済み。

## 13. MEGAFLOAT系12行の追加調査

2026-11-03、ユーザーの「MEGAFLOAT系12行詰めようか」により調査を継続した。開始時HEADは`dd22f35`、作業ツリーはクリーン。5行の区分8対応と横並び調査は同コミットに収録済み。今回は調査・対応案を記録し、配信反映はしていない。

| 成果物 | 内容 |
| --- | --- |
| [MEGAFLOAT_REVIEW.md](../../../../docs/analysis/calculation/MEGAFLOAT_REVIEW.md) | 12行の対象一覧、無敵・最低HP・崩壊条件、用途を踏まえた反映候補 |
| [MEGAFLOAT_EVIDENCE.json](../../../../docs/analysis/calculation/MEGAFLOAT_EVIDENCE.json) | 43出典、13 CDO、6条件オブジェクト、現行nativeの位置・命令・ハッシュ、元HPとMSL耐性の再照合 |
| [investigate_megafloat.py](../../../../docs/analysis/calculation/investigate_megafloat.py) | 読取専用の再調査。ローカル報告だけを出力 |
| MASTER_AUDIT.md / CALCULATION_EVIDENCE.md | 配信側の未確認扱いと、静的属性の確認済み・破壊条件の残件を区別 |

### 13.1 確認できたこと

全12行・43出典・12モデルを追い、全継承の13 BlueprintのCDOと、甲板の6条件オブジェクトを末尾まで読み取った。全12行は静的isAir=false・元区分4（ground）。今回必要な資産の欠落はなく、残件は主に配置・状態遷移・イベントの未解析である。

通常支柱6行は再初期化でMinHealth=min(trunc(MaxHealth),1)を書き込む。甲板2行は初期無敵で、Num/Line/Pillarのいずれかを満たすと崩壊イベントへ進む。原子炉430は内側・外側が各HP40で初期無敵。中央支柱429も初期無敵と原子炉死亡イベント関連の関数を持つ。シャッター503/426は共通の被弾・補正・最低HP取得を使い、初期無敵のCDO上書きを持たない。

全クラスが通常の被弾計算を継承することだけでは、最低HP書換えや無敵、破壊段階を説明できない。初回の「任務MinHealthが全て0または設定なし」は表の値として正しいが、実行時の最低HPが全て0という意味にはしない。

### 13.2 ユーザーの知見と計算単位

ユーザーには、支柱への攻撃でロック表示が消えた後に柱が残り、甲板崩壊時に完全に壊れる挙動の記憶がある。「ツールの用途上単なるHP40のオブジェクトとして扱うことに問題はないはず」との指摘を受け、各オブジェクト1個の静的HPに対する計算と、演出・任務全体の進行を分けた。初期無敵や演出待ちだけを計算の保留理由にしない。

続いて、HP40という記憶は「M27でPILLARに通常ミサイルを2発以上撃ち込んだ記憶がない」との説明を受けた。元表を再照合し、通常支柱はHP100/200・NPC/任務加算差分0、MSL耐性列Category01は500%と確認した。MULTIROLEなら40×5=200、ATTACKERなら40×1.5×5=300で、どちらのHPも1命中となる。1命中という観察だけではHP40とは判定できない。原子炉の40、中央支柱の120と区別し、HPを推測で変更しない。

原子炉430とシャッター2行は、各1個・被弾可能な静的条件の通常計算へ反映する候補。通常支柱6行も元HP100/200に対する理論値を使う案とするが、HP1での無力化を実証した数値とはしない。例えばMGP・MULTIROLE・パーツなしの条件付き計算では、HP100を1以下へ削るのは55命中、0まで削るのは56命中であり、定義の境界差は残る。甲板2行と中央支柱429の掲載判断は別に残す。

### 13.3 検証範囲

13 CDO・6条件の全読取境界、6 nativeクラスの共通関数、最低HP書込、全43出典のHPとMSL倍率を検査した。数値は生成済みJSONだけでなく元のModel/NPC/Mission/Weapon/耐性/ROLE表を再読取し、生成値と一致した。現行EXEのハッシュを照合して20関数を解析し、旧ビルドのアドレスは流用していない。

配信3ファイル・catalog・npc-evidence・native-constructors・generation-inputの7ファイルは前後SHA-256一致。アプリのテスト・ビルドは未実行（アプリ・配信データ変更なし）。ゲーム起動・測定・ゲーム本体/設定/セーブ変更、コミット・push・PR作成は行っていない。配信反映・掲載変更は未実装で、local_003はwipを継続する。

調査スクリプトはモデル参照の出力順を固定し、連続再実行で報告JSONのSHA-256が一致した。証拠抜粋とローカル報告の内容一致、元数値表のハッシュ、Python構文、文書の相対リンクを検証済み。`pnpm format:check`・`git diff --check`が成功。今回の調査資料は未コミット。

### 13.4 元HP計算・支柱名・甲板の掲載判断

後続のユーザー指示で、通常支柱は元HP100/200で計算し、最低HP1への到達を計算・追加議論の対象にしないと決定した。13.2節の境界例は調査履歴として保持するが、配信反映の前提条件にはしない。

HP差の識別を追加調査した。各甲板定義の左右000番がFront型・HP100、001〜005番がEV型・HP200。両型にIN/OUTがあり、「前方がFront、内部がEV」という区別ではない。Front型はPillar001系メッシュ、EV型はPillar002系メッシュに加えてElevator_SMコンポーネント・Elevator001/002メッシュを持つ。ゲーム画面の現物との対応は未照合だが、元定義・資産上の区別は確認した。

| 対象 | 合意した方針（未実装） |
| --- | --- |
| 420・500・419 | 元HP100を維持し、PILLAR (Front)《MEGAFLOAT》へ変更。419の[M27]を維持 |
| 422・501・421 | 元HP200を維持し、PILLAR (EV)《MEGAFLOAT》へ変更。421の[M27]を維持 |
| 418・423 | 甲板の親定義としてEXCLUDEDへ変更。固定IDと元出典を残し、子部位の掲載・親参照を維持 |

甲板418は通常甲板、423はそれを継承してMainCannon・MainCannon_Coreの子部位を加える型。両者はModel/NPCの表示名が空、初期無敵・HUD枠非表示・条件による崩壊を持つ。ユーザーは直接攻撃対象ではない甲板をEXCLUDEDとする方針を示し、この静的根拠による掲載判断として採用した。全ゲーム局面の攻撃不能を測定したものではない。RAIL GUN TURRET 424とTURRET BASE 502/425は別オブジェクトで、甲板の除外に巻き込まない。

SHUTTERは共通503とM27の426で耐性差があるため、既存の2行を維持する。Front/EVの命名は通常支柱6行のみとし、中央支柱429には付けない。各行の固定ID・HP・耐性・任務差分と内外の統合範囲を保つ。今回の変更は調査・判断の記録だけで、配信データの実装・生成・コミットはまだ行っていない。

調査スクリプトと証拠JSONに、Modelの表示名・HP、甲板の子部位対応、支柱の昇降機部品・メッシュ参照を追加した。既存のコード証拠と元数値表は維持し、全13 CDO・6条件の読取、7保護対象ファイルの非変更を再確認した。

### 13.5 中央支柱429の破壊経路

ユーザーから、429が直接攻撃する部位か、核融合炉の破壊に連動して崩れる構造物かの確認を依頼された。前回までの調査差分を保持し、[CORE_PILLAR_REVIEW.md](../../../../docs/analysis/calculation/CORE_PILLAR_REVIEW.md)・[証拠JSON](../../../../docs/analysis/calculation/CORE_PILLAR_EVIDENCE.json)・[調査スクリプト](../../../../docs/analysis/calculation/investigate_core_pillar.py)を追加した。

確認した定義・イベントでは後者である。429は中央柱体・外装パネルを持つ親で、Child_Core→内側原子炉→Child_Outer→外側原子炉の構造。通常のFront/EV支柱とは別モデル。ModelとNPCの表示名は空であり、アプリのPILLAR表記をゲーム内ロック目標の正式名称とは扱わない。

柱のBeginPlayで炉2個の死亡通知へイベントを登録する。外側炉の死亡はSetDamageState(1)から外装損傷アニメーションへ、内側炉の死亡はSetDamageState(4)から崩壊アニメーションとSelfDeath(0.0, true)へ進む。native反射情報で第2引数はbForceKillと確認。遅延0の強制自己破壊は、内部で無敵を解除して自身へダメージを渡す。関数名だけでなく登録先・分岐・引数・native呼出しを照合した。

初期無敵・HUD枠非表示に、この炉死亡→自壊経路があるため、429を別途HP120を削る攻撃目標として掲載する根拠はない。429もEXCLUDEDを推奨する。固定ID・元HP・出典を保持し、原子炉430などの子部位を連鎖除外しない。429の除外はまだ実装していない。

3 Blueprintの全20関数（柱11・内側炉6・外側炉3）で保存サイズと展開後VMサイズが一致。全明示分岐・遅延再開点・イベント入口の命令境界も一致した。3 CDOの全読取、現行native 5関数、SelfDeathの引数名を検証。配信3ファイルとcatalog等の計7ファイルは前後SHA-256一致。全任務レベルからの外部上書き、基準ビルドとの全資産一致、実ゲーム測定は未確認。アプリ・配信データ変更、コミットは行っていない。

Python構文検査、連続2回の再実行による報告JSONのSHA-256一致、元表3個・資産3組のハッシュ再照合を実施した。証拠抜粋はローカル報告と一致し、`pnpm format:check`・`git diff --check`が成功した。

## 14. MEGAFLOATの承認済み変更と検証

2026-11-03、ユーザーが429・418・423のEXCLUDED化、Front/EV表記、確認済み属性の反映、固定IDと旧保存の選択・子部位の維持、検証・記録・コミットを指示した。開始時HEADは`dd22f35`、ブランチは`codex/initial-implementation`。13節の調査資料・スクリプト・証拠JSONの未コミット差分を保持し、今回の変更とまとめて記録する。

### 14.1 反映範囲

| 対象 | 実装した内容 |
| --- | --- |
| 418・423・429 | categoryをEXCLUDEDへ変更。isAir=false・roleGroup=groundを反映。standardDamage=falseは維持し、通常攻撃用の計算対象にしない。元HP100/1000/120と固定ID・出典・親参照を保持 |
| 420・500・419 | PILLAR (Front)《MEGAFLOAT》。HP100、419の[M27]を維持 |
| 422・501・421 | PILLAR (EV)《MEGAFLOAT》。HP200、421の[M27]を維持 |
| 支柱6行・原子炉430・シャッター503/426 | isAir=false・roleGroup=ground・standardDamage=true。被弾可能な1個の元HPに対する静的計算を有効化 |
| 原子炉・砲塔などの部位 | 430・424・502・425を含む部位12行を引き続き掲載。partOf=418と既存の統合範囲を維持。親除外を部位へ伝播しない |

FrontとEVの双方に内外の定義がある。今回も内外の統合範囲は変更せず、共通500/501の爆弾倍率0.1とM27の419/421の5倍を維持。シャッター503/426の任務耐性差も保持した。原子炉は内側・外側各HP40の同条件統合を維持し、合算80や中央支柱のHP120を計算へ加えない。

| ファイル | 変更内容 |
| --- | --- |
| data/local/catalog.json | Git管理外。12モデルの確認済み属性、6行の表示名、3行の分類と3出典の除外指定を更新 |
| src/data/targets.json | `pnpm generate:data`で12行の承認済み差分だけを生成 |
| src/data/target-attributes.test.ts / masters.test.ts / megafloat.test.ts | 旧保留条件を更新し、名称・HP・耐性差・親除外・部位保持・旧保存・元HP計算を検証 |
| tests/app.spec.ts | PC/スマートフォン幅の2シナリオを追加。Front/EV検索、M27併記、非表示中の選択、再読込を確認 |
| 計算・監査記録と本書 | 現行件数、静的計算の範囲、検証結果を更新。調査記録と実ゲーム未測定の区別を維持 |

更新モデルはMegafloat_Deck、Megafloat_Deck_Cannon、Megafloat_Center_CorePillar、Megafloat_Center_Core、Megafloat_Center_Core_Outer、Megafloat_Center_Shutter、MGFPillar_L_Front_IN/OUT、MGFPillar_L_EV_IN/OUT、MGFPillar_R_EV_IN/OUT。全12モデルに元category=4を記録し、除外3モデル以外の9モデルをstandardDamage=trueとした。evidenceの元Blueprint名は維持した。除外指定は`DT_NPC_Mission027`のMegafloat_Deck_01、Megafloat_Deck_Cannon_01、Megafloat_Center_CorePillar_01のみを追加した。

### 14.2 固定IDと旧保存

全506行を変更前と比較し、固定ID・順序・HP・全18耐性・missionVariant・partOfは一致。対象外494行、兵装・補正マスタは不変。catalogでは全sourceRefs・兵装・パーツ・modelCategoriesを保持した。元定義1459件、固定ID506件は不変。掲載311→308、EXCLUDED195→198、STRUCTURE43→40、元定義の除外指定284→287となった。

保存形式のversion=1と復元処理は変更していない。旧保存に残る418/423/429だけを既存のEXCLUDED除去ルールで選択から外し、部位のIDはそのまま復元する。部位表示・任務差分表示の4条件でも、非表示中の選択を保持する。選んでいなかった目標を自動追加せず、除外3行だけの旧保存は空の選択として復元する。新ID・統合ID対応は追加していない。

### 14.3 検証結果

Redでは新仕様の1テストがID418の分類・未確認属性で失敗し、既存100テストは成功。生成後、旧保留条件を新仕様へ更新し、追加の計算・保存テストも成功した。候補検索の検証では同名の別目標MEGAFLOAT（431）を含める誤った期待範囲を修正し、418の部位と除外3行に限定した。431のデータと掲載は変更していない。

| 検証 | 結果 |
| --- | --- |
| `pnpm test` | 17ファイル・105件成功 |
| `pnpm typecheck` / `pnpm lint` / `pnpm build` | 成功 |
| `pnpm test:browser` | Chrome12シナリオ成功。追加2件は1440×900、390×900 |
| `pnpm format:check` / `git diff --check` | 成功 |
| 再生成 | 配信3ファイルのSHA-256一致。全出典の統合条件一致を生成時に検証 |
| データ比較 | 前節の対象外不変、全固定ID・元数値・出典の維持を検証。既存npc-evidence/native-constructorsも不変 |

支柱の通常MSLは、元威力40・被ダメージ5倍・MULTIROLE=1から200、ATTACKER=1.5から300。対空パーツは不適用、対地パーツだけなら220。FIGHTERの175ではHP100が1命中、HP200が2命中となる。MGPは元威力5×耐性0.35=1.75、内部HPの整数更新で1命中18ずつ減り、HP100は56命中・HP200は112命中。最低HP1への到達に置き換えていない。

原子炉430はMULTIROLEのMSL40で各1命中。UGB75では共通シャッター503が2命中、M27の426が確認済みダメージ0。支柱500/501はUGBで14/27命中、M27の419/421は1命中。期待値は実装から生成せず、元HP・兵装値・ROLE・耐性と既存の整数HP更新から固定した。TLS・UAVT・8AAM・SFFS威力パーツの未確認結果も維持した。

ブラウザーでは旧保存の親3行だけを除去し、部位12行を保持。部位表示OFFは0行、ONで任務差分OFFは8行、ONは12行を確認。Front/EVそれぞれ共通2候補・M27併記1候補を検索でき、原子炉のHP40・必要命中数1が表示される。再読込後も12行が復元された。

再生成後のtargets.jsonのSHA-256は`d1a0da7bea252dd1bec668f8910bfc50a2331c465c78e786e7aea219b1c3d033`。今回、参照資料なしの別コピー検証は再実施していない。追加テストは配信JSONだけを読み、解析証拠やdata/localへ依存しない。依存ディレクトリの共有・変更は行っていない。

### 14.4 完了範囲と残る制約

local_003で対象とした41行の属性調査と承認済み配信反映は完了。掲載308行にisAir/roleGroupの未確認値とstandardDamage=falseは残っていない。これは、全局面の攻撃可能性やイベント進行まで実証した意味ではない。

基準build 25201480と現行資産の全照合、全レベル配置のROLE無効化、原子炉の露出・無敵解除、シャッター開閉中の攻撃可否、Front/EVの現物対応、実ゲーム測定は未確認。これらは被弾可能な各1個を元HPで計算する合意の前提条件にはしない。TLS・UAVT・8AAM・SFFSパーツの兵装側の残件は本作業単位の対象外として引き継ぐ。ゲーム起動・本体/設定/セーブ変更、push・PR作成は行っていない。
