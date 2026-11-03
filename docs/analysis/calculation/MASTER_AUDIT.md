# 初期マスタの照合記録

更新日: 2026-11-03。数値は同梱のbuild 25201480の抽出表。実ゲーム測定なし。

全兵装42件（掲載34・UNUSED8）、全目標506行（掲載311・EXCLUDED195、固定ID・件数の基準HEAD `9342e63`、24行の属性および区分8の5行反映後）。キャンペーン任務元行1662件、対応付け済み元定義は1459件（NPC共通行・不足部位の子NPCも含む）。

## 掲載範囲と固定ID

整理済みガイドの表示識別子・キャンペーンの表示名付き目標・合意した部位を登録。表示識別子のないダミー、壁、破損物、NoRadioなどの補助定義は元行監査に残す。これらを名前だけで味方とは判定しない。ガイドの明示的なdummy/training除外範囲と、ユーザー指定のEXCLUDEDを区別した。

固定ID・元定義対応は `data/local/catalog.json`。初回登録後はこのファイルを更新し、初期整備用bootstrapを再実行して番号を付け直さない。追加は未使用ID、削除IDは再利用しない。再生成は同じ出典群の値が一致することを照合する。

合意した199任務行、M25の通常TANK/APC2行、ALCM2行はすべて対応表に存在しEXCLUDEDとして保持。ENDURANCEの任務表にない子部位も同じ文脈のEXCLUDEDとして保持し、他の通常艦や同名NPCへ除外を広げていない。

表示名がない可変翼はアプリ用の `VARIABLE WING`、整理済みの3棟のビルは `BUILDING` とした。ゲーム内の正式名称を確認したものではない。MEGAFLOATの施設関係は仕様書の明示的な対応を使用し、部位の親子関係を計算属性の継承には使わない。

| 分類 | 行数 |
| --- | ---: |
| AIRCRAFT | 132 |
| GROUND | 69 |
| SHIP | 59 |
| STRUCTURE | 43 |
| OTHER | 8 |
| EXCLUDED | 195 |

## 未確認項目

TLSは威力40・継続18・初回遅延0.05000000074505806・間隔0.4000000059604645を保持するが、秒数の起点・フレームの超過時間・再接触時の扱いをbuild 25201480の処理で確定できていないため `?`。UAVTは展開側と搭載レーザー側を区別して調査したが、1展開の全攻撃数と同一目標への分配、評価単位が未確定で `?`。8AAMは掲載対象だが、同梱84 Blueprintにプレイヤー用の威力定義がなく基礎威力null。Botや他兵装の値で補完しない。

SFFS子弾（105）はグループマッピングの範囲外、SOD子弾（104）はBombPower（124）への対応を確認。SFFSの親から子へのパーツ転送経路は旧ビルドで未確認のため、BOMB.POW+選択時だけ `?`。パーツなしは子弾40を使用する。

ROLEのnoneは確認済みの補正なしを表す。元区分0（配列添字0=100）と区分8（8要素配列の範囲外=100）をcatalog・証拠で区別したまま倍率1を共有する。未解決の区分をnoneや1へ補完しない。以下は**配信データで未確認扱いの12行**。local_003で41行の静的属性を確認し、承認済み24行と区分8の5行を反映した。MEGAFLOAT系12行は未反映。[調査結果と残件](../../../spec/agent/wip/local_003/TARGET_ATTRIBUTE_REVIEW.md)を参照。isAirだけが未確認なら通常MSLの条件付きパーツを選択していない計算は継続できる。

| ID | 目標 | 未確認 |
| ---: | --- | --- |
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

### 通常・爆風耐性が未確認の共通行（Q002で非表示）

以下の3行は通常・爆風耐性IDがともに`None`で、配信用の18倍率すべてがnull（R001で機銃と通常MSLのキーを分離）。Q002の掲載判断でEXCLUDEDとなり、現在は結果表に表示しない。データは保持し、値を1へ補完しない。

| ID | 目標 | 元NPC |
| ---: | --- | --- |
| 504 | AIR BASE、HP100 | `GR000_dummy_MS28_Airbase` |
| 489 | APC、HP100 | `GR000_dummy_MS13_btr9` |
| 496 | LAND BATTLESHIP 2、HP100 | `GR000_dummy_MS20_ldbs2` |

対応する任務行ID 456・199・261は任務側の耐性を持つため、共通行と区別する。local_002のQ002で、この3任務行もEXCLUDEDにした。静的設定上の数値は維持し、実ゲームで攻撃不能と確定した意味にはしない。

## 静的設定の限界

NPC共通と任務の耐性IDが違う場合は任務側を解決し、共通行を残した任務差分として出力する。例: MEGAFLOAT砲塔基部は共通NPCのCategory07=0と、任務側NPC_WPDur_000の100を区別する。同梱ガイドの免疫例を全任務へ一律コピーしない。任務耐性の適用とイベントによる変更は区別する。

難易度5行のMaxHealth=1を再照合した。全1662キャンペーン任務行のMaxHealthDifference/MinHealth、NPCとModelとの合成を確認したが、全レベル配置・イベントでのHP上書きやROLE無効化は網羅していない。アプリは静的初期設定・ROLE有効の条件であり、ゲーム内全局面の保証ではない。

整理済みガイドが識別する239モデルのうち238モデルを直接参照している。汎用 `OP1016_x40a` はNPCから直接参照されておらず、同じHP300・X-40表示の実参照モデル `OP1016_x40a_Tewy` を使う通常行で表現する。この対応は他のモデルを表示名だけで統合する規則にはしない。

## local_002で承認された追加除外

QUEEN 13行、PURPLE MAGIC 4行、GREEN 2行、ENDURANCE本体2行・艦砲1行をEXCLUDEDに変更。ENDURANCE対空砲は他艦と統合されていたID 124から8出典を新規ID 506へ分離し、他艦12出典をID 124へ残した。全63出典を明示指定しており、同名・同モデルの別行へ除外を広げていない。

掲載326行・EXCLUDED180行。元定義1459件と既存固定IDは維持。[除外見直し記録](../../../spec/agent/complete/local_002/FRIEND_EXCLUSION_REVIEW.md)を参照。実所属の確定とは別の掲載判断である。内部任務番号とゲーム内表示番号のずれは[別記録](../ui-labels/MISSION_NUMBERS.md)に訂正し、画面ラベルはR006で修正済み。

R006では全104任務差分を照合して92行のnameだけを更新し、内部識別子・固定ID・数値・件数は維持した。

Q002では表示名を持つダミー用定義6行をEXCLUDEDに変更。この時点で掲載320行・EXCLUDED186行、固定ID506件・元定義1459件。通常のAPC・滑走路・陸上戦艦本体と部位を維持した。[掲載判断と検証](../../../spec/agent/complete/local_002/INITIAL_IMPLEMENTATION_REVIEW.md)を参照。陸上戦艦の同名行とID372の親参照不整合は[Q003の別調査](../../../spec/agent/complete/local_002/LAND_BATTLESHIP_REVIEW.md)として記録し、今回は変更していない。


Q003のうちM24のID330は、攻撃可能な対象との対応が未確認であることを踏まえたユーザーの掲載判断によりEXCLUDEDへ変更。この時点で掲載319行・EXCLUDED187行。M25の同モデル・主砲を除外せず、ID330のcategory以外を維持した。実際の攻撃不能や未使用を確定したものではない。詳細は[陸上戦艦の調査](../../../spec/agent/complete/local_002/LAND_BATTLESHIP_REVIEW.md)の12節を参照。


Q003の後続判断で、陸上戦艦の本体ID147・371・494・247・226もEXCLUDEDへ変更。本体除外時点では掲載314行・EXCLUDED192行、本体8行が非表示、部位24行は掲載を維持した。固定ID・元定義・計算値・親参照は保持。本体6行のisAir・roleGroupの未確認値も保持するが、上の「掲載対象」の属性表からは除いた。本体HP100を艦全体の撃破条件と解釈できる根拠が不足しており、部位を中心とする攻略記事とユーザー判断に基づく掲載方針である。実際の攻撃不能を確定したものではない。[陸上戦艦の調査](../../../spec/agent/complete/local_002/LAND_BATTLESHIP_REVIEW.md)の13節を参照。


Q003の確認済み部位属性を反映し、151・153・488・249・258をisAir=false・ROLE=shipへ更新した。249→248、258→254を同条件として統合し、旧IDはEXCLUDEDとして保持、旧保存の選択は代表IDへ移す。旧出典は履歴用IDにも残し、代表IDにも追加して生成時に同条件を照合する。これら9出典は掲載を続けるため、元定義の除外指定282件には追加しない。

local_002の16節時点では固定ID506件、掲載312行・EXCLUDED194行。陸上戦艦部位は固定ID24件のうち22行を掲載。SUB CATERPILLAR 151・152の所属ラベルを省略して152へ(CORE)を付け、M25主砲372をROCKY ISLAND表記・partOf=371へ修正した。HP・耐性・任務差分・並び順、THRUSTERの名前と右側154の全設定は維持。根拠・検証は[陸上戦艦の調査16節](../../../spec/agent/complete/local_002/LAND_BATTLESHIP_REVIEW.md#16-合意した部位変更の実装と検証)を参照。現行の静的属性を確認したもので、基準ビルドとの同一性や実ゲーム測定を確認した意味ではない。


## local_002完了時点とlocal_003の再調査

local_002の最終承認でTHRUSTER154をEXCLUDEDへ変更した。現行は固定ID506件、掲載311行・EXCLUDED195行、GROUND69行、陸上戦艦掲載部位21行。元定義1459件・除外指定284件。153・488は左右修飾なしで、共通／M9の耐性差を維持する。154は上の掲載中の属性一覧から除いた。過去各節の件数は履歴であり、現在値ではない。

local_003では、掲載中の属性未確認41行（isAir 36行、roleGroup 34行）の117出典・48モデルを再照合した。既存抽出資産と現行EXEを使用し、72 Blueprintの全CDO読取とnative初期値から全41行のisAir・GameObjectCategoryを確認した。対象の静的属性確認に必要な資産不足は0件。配信JSON・生成catalog・既存属性証拠は未変更。

| 調査結果 | 行数・扱い |
| --- | --- |
| 既存ROLE区分へ対応する反映候補 | 24行。CH-47のstandardDamage=falseはクラス名の大小文字による読取失敗が原因であり、特殊被弾の確認結果ではない |
| GameObjectCategory=8 | 201・264・505・463・462の5行。ROLE配列の範囲外は100%となる静的処理を確認。Category_None=0と元定義を混同しない対応が必要 |
| MEGAFLOAT系 | 12行のisAir=false・Category=4を確認。破壊条件・イベント後の状態・被弾経路は未確定で、standardDamageを一律trueにしない |

standardDamage=falseの全13行は、今回全てLiveAIGameObjectへの継承を確認した。全出典のMinHealthは0または共通NPCの設定なし。この再読取結果だけで全局面の撃破数を保証しない。全レベル配置のROLE無効化、任務イベントによる値変更、基準build 25201480との資産同一性は残る制約である。

対象一覧・読取不具合の原因・反映候補は[local_003](../../../spec/agent/wip/local_003/TARGET_ATTRIBUTE_REVIEW.md)、出典・ハッシュ・命令は[TARGET_ATTRIBUTE_EVIDENCE.json](TARGET_ATTRIBUTE_EVIDENCE.json)へ記録した。


## local_003の承認済み24行の反映

30モデルの確認値を生成catalogへ反映し、24行のisAir・17行のroleGroup・CH-47のstandardDamageを更新した。全固定ID・表示分類・名前・HP・耐性・任務差分・親子関係・出典は維持。掲載311行・EXCLUDED195行は変わらない。この時点の未確認は17行（isAir未確認12行、roleGroup未確認17行、standardDamage=false 12行）だった。現在の一覧は後続の区分8対応を反映している。

CH-47はクラス名の大小文字による読取失敗を解消したため、既存の通常目標と同じ判定基準へ戻した。区分8の5行とMEGAFLOAT系12行の配信値は変更していない。単体100テスト、Chrome10シナリオ、型検査・Lint・整形・ビルド成功。配信3ファイルの再生成一致を確認。詳細は[local_003の9節](../../../spec/agent/wip/local_003/TARGET_ATTRIBUTE_REVIEW.md#9-承認済み24行の属性反映)を参照。


## local_003 区分8の5行反映と横並び監査（2026-11-03）

201・264・505・463・462のroleGroupのみをnullからnoneへ更新した。6モデルの元category=8は保持。固定ID・HP・耐性・isAir・standardDamage・任務差分などは不変。初回41行のうち29行が反映済みで、未反映はMEGAFLOAT12行（isAir/roleGroup未確認、standardDamage=false）となった。

934モデルと42兵装を横並び調査した。掲載311行では、区分0の既存41行は既にnoneで、今回5行以外の補正なし分類漏れは見つからなかった。NPC共通のROLE処理に武器ID固有の除外分岐はないが、配置での無効化・攻撃者の条件・特殊経路の未確認を区別する。[適用範囲監査](ROLE_SCOPE_AUDIT.md)に全件確認の範囲・資産不足・残件を記録した。
