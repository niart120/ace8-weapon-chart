# 兵装側の未確認経路の調査

状態: 完了。SFFSのBOMB.POW+対応と8AAMの固定ID6を保持したUNUSED化を実装・検証済み。TLS・UAVTと実ゲーム測定は後続課題。

## 1. 概要

2026-11-04着手。開始時HEADは`203e1ff`、ブランチは`codex/initial-implementation`、作業ツリーはクリーン。SFFSのBOMB.POW+が子弾へ適用される経路と、8AAMのプレイヤー用資産の所在を調べる。

| 用語 | 意味 |
| --- | --- |
| 親弾 | SFFSの投下・子弾生成を担当するWeaponID26のオブジェクト |
| 子弾 | 計算単位とするWeaponID105の1発。元資料の基礎威力40 |
| 静的確認 | 資産の参照・初期値と実行コードを照合した結果。実ゲーム測定とは区別する |

| 期待効果 | 完了時に示す内容 |
| --- | --- |
| SFFSの未確認範囲の縮小 | 親から子への情報伝達、補正適用先・回数、未追跡の分岐 |
| 8AAMの所在確認 | プレイヤー装備からの参照と実資産の有無、読取可能性、残る不足 |

## 2. 初回調査の対象ファイル

| 対象 | 扱い |
| --- | --- |
| 本書 | 調査計画・結果・制約を記録 |
| docs/analysis/calculation/ | 読取専用の調査スクリプトと根拠の抜粋を必要に応じて追加 |
| data/local/local004-* | 抽出資産・完全な解析結果。配信・Git管理から除外 |
| インストール済みゲーム、docs/initial/ref | 読取専用。対象ビルドと資産ハッシュを確認 |
| 配信3ファイル・catalog・既存属性証拠・generation-input | 変更しない。調査前後のハッシュを比較 |

## 3. 設計方針

親のパーツ対応や子弾の対応表欠落だけで、補正の有効・無効を決めない。生成元→生成・初期化→補正→被弾の順に接続を確認する。耐性参照の105→26置換と、パーツ適用の判定は別に扱う。

8AAMは名前の類似だけで6AAMやBot用の値を採用しない。現行ゲームの装備設定・生成クラスへの参照を追い、未収録と不存在を区別する。基準build 25201480と現行EXE・資産の差を記録する。

初回調査ではゲーム起動・本体/設定/セーブの変更、配信反映、コミット・push・PR作成を行わない方針とした。後続でSFFSの配信反映・検証・コミットが承認された（11節）。TLS・UAVTの詳細解析は後続候補とする。

## 4. 調査手順

1. 保護対象のハッシュ、EXE識別、コンテナ・抽出資産の所在を記録する。
2. SFFS親・子の全継承、生成先、補正パラメータの伝達を追う。
3. 親と子のパーツ評価、再適用、耐性参照を区別し、確定範囲と未追跡を整理する。
4. 8AAMの資産一覧と装備参照を照合し、読取可能性を記録する。
5. 根拠・限界・反映候補を記録し、保護対象の非変更を検証する。

## 5. 検証方針

| 対象 | 方法 |
| --- | --- |
| 資産 | 全継承の読取境界、参照先、ハッシュを確認。未読取値を補完しない |
| native処理 | 現行EXEのハッシュを照合。旧ビルドのアドレスを流用しない |
| 補正 | 同梱の説明、元表、実行コード、実ゲーム測定を区別 |
| 非変更 | 配信・生成入力など7ファイルの前後SHA-256一致 |

初回調査ではアプリのテスト・ビルドは未実行（調査のみ）。実装後の検証は11節に記録する。実ゲーム測定は行っていない。

## 6. 進捗

- [x] 現在のGit状態と対象範囲を確認する
- [x] SFFSの子弾生成・補正伝達を調査する
- [x] 8AAMの資産所在・装備参照を調査する
- [x] 根拠と残件、配信反映候補を整理する
- [x] 記録の整合性と保護対象の非変更を検証する

## 7. SFFSの調査結果

**静的確認: BOMB.POW+は親弾のDamageに適用され、補正後の値が各子弾へコピーされる。確認した生成経路では二重適用されない。** 基礎威力40にBOMB.POW+だけを適用した例は、float32の`40 × 1.2000000476837158 = 48`。1発の子弾の値であり、1投下の合計ではない。

### 7.1 資産と対応表

| 対象 | 読取結果 |
| --- | --- |
| `BP_plwp_sffs_a0_C` | native親`LiveSFFSBomb`、WeaponID26、Damage40、ChildClass=`BP_SFFS_Child_Bomb_C`。CDO 878/878バイト |
| `BP_plwp_sffs_r0_C` | a0を継承。Damageの上書きなし。CDO 133/133バイト |
| `BP_SFFS_Child_Bomb_C` | native親`LiveBomb`、WeaponID105、Damage40。CDO 809/809バイト |
| `DT_LiveParts`の`RAW_00002032` | PartsID2032802、ParameterLabel124、条件0、乗算1.2000000476837158。装備フィルターにもSFFSを明記 |
| 現行EXEの対応表 | 26→グループ6→BombPower124、個別SFFSPower167。105はグループ0・個別対応なし。167のパーツ効果行は今回の表にない |

3つのSFFS Blueprintには独自の関数exportがなく、この生成経路はnative側にある。子弾105の対応表欠落は現行でも確認したが、親弾からの値の受け渡しを遮断するものではなかった。

### 7.2 適用順序と受け渡し

以下のアドレスは今回の現行EXE専用。仮想関数の位置はvtable内のバイト位置を表す。解析用の処理名であり、元の関数名を復元したものではない。

| 順序 | 確認した処理と位置 |
| --- | --- |
| 親弾初期化 | 共通生成側`0x147f69bc6`が`0x147f60360`を呼び、その後`0x147f69bd1`で仮想関数`+0x850`を呼ぶ |
| パーツ適用 | `0x147f60360`はレベル補正`+0x810`の後、`0x147f6043c`でパーツ用`+0x840`を呼ぶ。SFFSでは`0x147f2cd00`へ解決し、共通威力処理`0x147dc5d10`に入る |
| 親Damage更新 | `0x147dc5f17`でDamage=`+0x41c`を参照、`0x147dc5f4d`でグループの威力ラベル124を取得。`0x147de2e9b`の`mulss`でfloat32乗算し、`0x147de2f1b`で書き戻す |
| 子弾パラメータ作成 | `+0x850`=`0x147f602e0`が`+0x890`を呼ぶ。SFFSの`0x147f2cd80`で、親Damage`+0x41c`をパラメータ`+0x3c`へコピーし、適用フラグ`+0x38`を1にする |
| 生成器へ渡す | 同関数の`0x147f2ce71`で生成器設定`+0x50`へ渡す。`0x147f10220`が生成器のWeaponParameters=`+0xd0`に保持する |
| 子弾の初期化と上書き | `0x147f10710`は子弾を生成し、`0x147f10b89`で共通初期化、`0x147f10b97`で`+0x820`に親由来のパラメータを渡す。共通初期化中のパーツ処理より後に上書きされる |
| 子弾Damageへの確定 | 子弾の`+0x820`は`0x147f1b780`→`0x147f25990`。フラグ`+0x38`を確認し、`0x147f259b3`〜`0x147f259b6`でパラメータ`+0x3c`を子弾Damage`+0x41c`へ代入する |

子弾のパーツ処理は`+0x840`=`0x147f1f8d0`から共通処理へ入る。WeaponID105に直接の威力パーツ対応はなく、受け取った48へもう一度1.2を掛ける処理ではない。上書き後の子弾`+0x850`も確認し、子弾の`+0x890`は何もしない関数へ解決する。

レベル補正用の`LevelModifiersDataTable`参照と、装備パーツの処理は別である。調査途中で見つかった`0x147f60cf0`は前者であり、それ自体をBOMB.POW+の根拠にはしていない。

### 7.3 配信への反映候補

調査時の提案はSFFSの`unverifiedParts: ["bombPower"]`を解除し、子弾1発40にBOMB.POW+の1.2倍を適用する対応。固定ID・計算単位・子弾の耐性参照105→26は維持する。補正なし40／あり48、HP45・ROLE100%・耐性100%なら2命中／1命中となる境界を独立期待値で検証する。承認後の反映結果は11節を参照。

初回調査ではアプリ側を変更していない。パーツの伝達確認をもって、散布した子弾が全て同じ目標へ命中すること、距離減衰・イベント・1投下の総ダメージまで確認済みとはしない。

## 8. 8AAMの所在と掲載判断の残件

**静的確認: 8AAMの資産は存在する。現行の機体装備表とプレイヤー機Blueprintでは、キャンペーン用装備としての参照を発見できなかった。** 従来の「同梱資産に基礎威力がない」だけでなく、掲載対象としての使用先を見直す材料がある。

| コンテナ | `Live/Content/`以下の資産 | 確認値・参照 |
| --- | --- | --- |
| pakchunk0 | `Blueprints/Weapons/MSL/NPC/8aam/BP_wp_8aam_a0` | WeaponID8、Damage80。CDO 314/314バイト |
| pakchunk0 | `Blueprints/Weapons/MSL/NPC/8aam/BP_wp_8aam_r0` | a0を継承、Damage上書きなし。48/48バイト |
| pakchunk20 | `OnlineMode/Blueprint/Weapons/BP_wp_8aam` | NPCのr0を継承しDamage60へ上書き。215/215バイト |
| pakchunk20 | `OnlineMode/Blueprint/Weapons/BP_FCS/BP_FCS_8AAM_r0_00` | オンライン用`BP_wp_8aam_C`への参照あり |

80・60は各CDOの設定値であり、実ゲームで測定した1発のダメージではない。これらを現在のキャンペーン計算用8AAMへ流用しない。

探索範囲と根拠は次の通り。

- pakchunk0/10/20と各optionalの計6コンテナの全パスを取得し、大文字・小文字を区別せず8AAMを検索した。上記のほかにUI・動画・音声がある。Player配下の8AAM兵装Blueprintは見つからない。global.utocはスクリプト情報用で、この資産パス一覧の対象外。
- `DT_LiveAircraft`全36行から35個の異なる機体パラメータ表を解決した。各表の`SpWeaponID1`〜`SpWeaponID4`に8はない。Player/Parameter配下の全36表（参照外のIP2041_av8bを含む）も読み取った。
- プレイヤー機`BP_PlayerPlane_*`全37クラスの名前表・importを確認し、8AAMへの参照は0件。機体一覧36行の参照先を全て含み、各CDOを末尾まで読めた。
- `DT_WeaponSettings`6行にもWeaponID8はない。`DT_LiveWeapon`には引き続き8AAMのメニュー定義があり、この表だけではプレイヤーが装備可能とは判断できない。

**推定:** キャンペーンのプレイヤー兵装として未使用の定義である可能性が高い。全イベントによる装備の差し替え、解放条件、オンラインの全装備経路は未調査なので、「ゲーム全体で未使用」とは断定しない。

**次の判断候補:** 現在のアプリがキャンペーンのプレイヤー兵装を扱う範囲なら、8AAMを固定ID6を保持した`UNUSED`にするかを相談する。現時点の掲載・null値・保存IDは維持する。実測へ進む前に、ゲーム内装備画面で8AAMを装備できる機体・モードの有無を確認する方が先である。

## 9. ビルド差と証拠の保存

現行EXEはSHA-256 `3e47fd42858d1f2b81e59d7f57394a014c0eb6aaf4c02ee3da351b6a42936be2`、551,201,904バイト。基準build 25201480のEXEと異なる。今回の対応表・vtable・命令は現行EXEから読み直した。

SFFSの親a0・派生r0・子弾の各uasset/uexpと`DT_LiveParts`、`DT_LiveWeapon`は同梱資料とのSHA-256が全て一致した。`DT_LiveAircraft`は不一致で、読取値の差は`Row_0024_2`の`bIsInitialPayload: false → true`だった。装備参照は今回の現行表から解決した。資産の一致は旧EXEの子弾生成コードまで同一であることの証明にはならない。

| 記録 | 内容 |
| --- | --- |
| [WEAPON_UNCERTAINTY_EVIDENCE.json](../../../../docs/analysis/calculation/WEAPON_UNCERTAINTY_EVIDENCE.json) | 現行EXE識別、主要資産ハッシュ、対応表、機体36行と装備ID、調査した37クラス、命令抜粋・関数ハッシュ、保護対象のハッシュ |
| [extract_weapon_uncertainty_assets.py](../../../../docs/analysis/calculation/extract_weapon_uncertainty_assets.py) | 6コンテナの検索と87資産の限定抽出。鍵を記録せず、ゲーム側は読取のみ |
| [investigate_weapon_uncertainties.py](../../../../docs/analysis/calculation/investigate_weapon_uncertainties.py) | 現行EXE限定の調査再実行。既存パーサーの初期化を再利用し、対象監査・配信生成は実行しない |
| `data/local/local004-weapon-evidence.json` | 初回調査結果・逆アセンブル・87資産174ファイルのハッシュ。Git対象外。公開証拠が参照する固定記録として保持 |
| `data/local/local004-weapon-evidence-latest.json` | 調査スクリプトの再実行先。承認済み実装後も、その実行前後で保護対象7ファイルが不変であることを確認 |
| `data/local/local004-raw/`、`local004-*-files.txt` | 抽出資産・全パス一覧。Git対象外 |

再実行には既存の`docs/initial/ref`のパーサー・Pythonライブラリ、`data/local/current-native/indexes`、`data/local/tools/retoc/retoc.exe`、有効な鍵ファイルが必要。抽出用スクリプトは`--game`と`--key-file`に既存のローカルパスを指定する。鍵の内容は文書・ログへ出力しない。抽出後の解析コマンドは以下。

```powershell
python -B -X utf8 docs/analysis/calculation/investigate_weapon_uncertainties.py 'D:\Steam\steamapps\common\ACE COMBAT 8\Game\Binaries\Win64\AceCombat8.exe'
```

## 10. 検証結果と未実施範囲

2026-11-04実施。6コンテナから87資産を再抽出し、変換失敗0。調査用スクリプトを現行EXEで再実行し、40表・SFFS/8AAMと基底の7 Blueprint・プレイヤー機37 Blueprintの読取境界を確認した。配信3ファイル・catalog・generation-input・既存の属性証拠2ファイルは開始時からSHA-256が全7件一致する。

Pythonスクリプト2本の構文解析、公開証拠と完全版のハッシュ照合、`git diff --check`は成功。`pnpm format:check`はpnpm起動時の作業ディレクトリ正規化でアクセス拒否となったため、同じ既存ツールを`node node_modules/oxfmt/bin/oxfmt --check`で直接実行して整形を確認した。

初回調査時点では、実ゲーム測定、アプリの単体/ブラウザテスト・ビルドは未実行（配信値・アプリ実装の変更なし）。TLS・UAVTのヒット時刻、全配置の動的変更、旧EXEのSFFS経路は対象外。コミット・push・PR作成は行っていない。後続のSFFS対応は11節に記録し、8AAMの掲載判断が残るためlocal_004はwipに保持する。

## 11. 承認済みSFFSのBOMB.POW+対応

2026-11-04、ユーザーがSFFSの実装・検証・コミットを承認。8AAMの掲載判断は後続の議論とする。開始時HEADは`203e1ff`、ブランチは`codex/initial-implementation`。初回調査の文書・証拠・スクリプトが未コミットであり、これらを保持して実装の根拠として含める。

### 11.1 変更仕様と検証計画

| 対象 | 変更・保持する内容 |
| --- | --- |
| `data/local/catalog.json`のSFFS固定ID21 | `partsWeaponId: 26`を指定し、`unverifiedParts`を除く。基礎威力の子弾Blueprint・damageWeaponId105と、耐性のweaponId26を維持 |
| `resolve-reference.py` | パーツ対応を`partsWeaponId`→`damageWeaponId`→`weaponId`の順に解決。指定のない他兵装の処理は維持 |
| `src/data/weapons.json` | 生成でSFFSのbombPower倍率1.2000000476837158を追加し、未確認指定を除去。計算処理は既存のfloat32乗算を使用 |
| 固定ID・掲載・保存 | 42兵装・506目標のID、SFFSの分類・順序・基礎40・子弾1発の単位を維持。8AAM・TLS・UAVTは変更しない |
| テスト | 固定期待値40/48、HP45/48/49の命中境界、追加成分の誤合算防止、実データのF-16Cと原子炉、PC/スマートフォンの即時反映と保存を検証 |

- [x] Red: 新しい境界テストと既存のSFFS未確認期待値を更新し、`pnpm test`で3件が`unknown`のため失敗することを確認（他103件成功）
- [x] Green: 参照元の指定・再生成後にテストを成功させる
- [x] 型検査・Lint・整形・ビルド・ブラウザーを確認する
- [x] 再生成一致、変更対象外の不変、記録と差分を検証する
- [x] 実装・根拠・検証結果をコミットする

### 11.2 実装結果

配信の変更はSFFS固定ID21の`primary.partMultipliers.bombPower: 1.2000000476837158`追加と`unverifiedParts`削除だけ。`calculateDefeatRequirement`・float32演算・HP整数更新・保存復元の実装は変更していない。ローカルcatalogと生成入力も同じSFFSだけを更新した。ゲーム本体・設定・セーブは変更していない。

初回調査の証拠は、その時点のHEAD・配信ハッシュの記録として保持した。再実行用スクリプトは初回ハッシュとの一致を要求する代わりに、各実行前後で7ファイルの不変を検証し、出力先を`local004-weapon-evidence-latest.json`に分けた。承認済みの配信反映後も初回記録を上書きせず調査できる。

### 11.3 検証結果

| 検証 | 結果 |
| --- | --- |
| `pnpm test` | 17ファイル・106件成功。新規1件で40/48の固定ダメージ、HP45/48/49と全DAMAGE TYPEの命中境界を確認。既存2件のSFFS期待値をunknownから数値へ更新 |
| `pnpm test:browser` | Chrome14シナリオ成功。追加2件は1440×900と390×900。旧保存のSFFS21・F-16C26・BOMB.POW+を復元し、補正あり1命中→なし2命中→あり1命中、再読込後1命中を確認 |
| `pnpm typecheck`・`pnpm lint`・`pnpm format:check`・`pnpm build` | 全て成功 |
| 再生成 | `pnpm generate:data`を2回実行し、配信3ファイルのSHA-256が一致。1459出典・42兵装・506目標を保持 |
| 変更範囲 | 開始時の7ファイルを保存して構造比較。変更はweapons・catalog・generation-inputのSFFS設定だけ。他41兵装（8AAM・TLS・UAVT・SODを含む）、全目標・全固定ID・分類・順序・耐性・補正マスタ、既存属性証拠2ファイルは不変 |
| 調査記録 | 反映後に調査スクリプトを再実行し、保護対象ハッシュ以外の全解析結果が初回報告と一致。公開証拠が参照する初回報告のSHA-256も維持。Python構文・リンク・`git diff --check`を確認 |

制限環境内の`pnpm test`は作業ディレクトリ正規化のアクセス拒否で起動できなかった。許可された制限外実行でRed/Greenと上記pnpm検証を実施した。参照資料なしの別コピー検証と実ゲーム測定は再実施していない。8AAMの掲載状態・基礎威力nullは維持し、次の議論対象として残す。

## 12. 8AAMのキャンペーン装備可否の再調査

2026-11-04、ユーザーの「キャンペーンで装備できたはず」という記憶を受け、搭載機・機体ツリーの追加枠・コミュニティ資料を照合した。開始時HEADは`64744e3`、ブランチは`codex/initial-implementation`、作業ツリーはクリーン。今回は調査・記録だけを行い、掲載変更・コミットは行わない。

**判断: 調査対象の現行ビルドでは、キャンペーンの自機に8AAMを割り当てた機体はないと判断する。** 通常32機種と追加2機種、任務専用2行の装備設定にWeaponID8はない。8AAMの資産そのものは存在するため、「ゲーム全体で未使用」「基礎威力を読めない」という意味ではない。

### 12.1 元データで確認した範囲

| 対象 | 静的確認の結果 |
| --- | --- |
| `DT_LiveAircraft`と参照先35パラメータ表 | 全36行の装備4枠を再読取。初回証拠と全装備IDが一致し、8は0件 |
| `DT_LiveMenuAircraftTreeNodeDataTable` | 全90行を末尾まで読取。機体32行は全て上記装備表へ対応。他58行は全て`DT_LiveParts`のPartsIDへ対応 |
| `DT_LiveMenuAircraftTreeExNodeDataTable` | 追加2行はF-14A（PlaneID10034010）とADFX-02（38010）。それぞれHVAA/SAAM/UGB、MPBM/TLS/ECMであり、追加枠にも8AAMなし |
| 機体ツリー外の2行 | A-6E任務用`PP0013_a06e_ms15`はLAGM/LASM/UGB。F/A-18F任務用`PP0024_f18f_ms01`はLASM/4AAM/GPB。内部名のms番号を画面の任務番号とは扱わない |
| ツリーの接続表・設定2資産 | 接続137行と表示設定を末尾まで読取。設定は配置・色・スクロール等とページ背景で、別の兵装解放リストではない |
| `DT_WingmanAircraft` | 全34行の`EquipSpWeapon1st/2nd`にも8は0件。NPC用8AAM資産があることと、通常の僚機がそれを装備することは別 |

代表的な機体のキャンペーン装備は以下。IDはゲーム側のWeaponIDであり、アプリ固定IDとは異なる。

| 機体 | 特殊兵装1 / 2 / 3 | WeaponID |
| --- | --- | --- |
| F-22A | QAAM / 4AAM / XSDB | 21 / 4 / 31 |
| F-14D | LAAM / SAAM / GPB | 16 / 23 / 11 |
| Su-57 | QAAM / HCAA / LACM | 21 / 13 / 17 |
| TYPHOON | 4AAM / LAAM / 8AGM | 4 / 16 / 9 |

F-22Aのツリーノードは機体550,000 MRP、特殊兵装2・3が各55,000 MRP。購入費が設定された第2枠も4AAMであり、初期装備だけを調べて8AAMを見落とした結果ではない。

探索した`DT_OnlineAircraftParam`41行はAbilityIdLists、`DT_Mission027_Weapons`5行は甲板支柱の連動ダメージ設定だった。ファイル名から装備一覧と誤認しない。これらを根拠にオンライン装備可否や全任務の装備差し替えを確認済みとはしない。

### 12.2 外部資料との照合

参照日はいずれも2026-11-04。コミュニティの記載は元データの静的確認・実ゲーム測定と区別する。

| 資料 | 記載と今回の扱い |
| --- | --- |
| [r/acecombatの全機体装備表](https://www.reddit.com/r/acecombat/comments/1wq6t3v/minor_spoilers_full_aircraft_roster_confirmed_so/) | 上記4機の装備が一致し、表の34機種に8AAM搭載機はない。投稿には発売前の議論も含まれるため、現行全解放状態の実測証明には使わない |
| [Ace Combat WikiのF-22A](https://acecombat.wiki.gg/wiki/F-22A_Raptor) | AC8節はQAAM/4AAM/XSDBと記載。機体・特殊兵装の購入費も元表と一致 |
| [Ace Combat Wikiの8AAM](https://acecombat.wiki.gg/wiki/8AAM) | AC7ではF-14DとF-22Aが装備。前作の搭載実績は確認できるが、ユーザーの記憶がどの作品・モードかを断定しない |
| [AC8 Custom Wingman Weaponsの作者説明](https://www.nexusmods.com/acecombat8wingsoftheve/mods/104?tab=description) | 8AAMをAI版資産のある兵装として挙げる。改造用の選択肢であり、無改造のキャンペーン自機で装備できる根拠にはしない。ダウンロード・導入は行っていない |

Wikiは本文の直接取得が403となったため、検索サービスが返した各ページ本文の該当節を参照した。一部攻略記事（[gameranbu](https://gameranbu.jp/acecombat8/57133525cb62b3bdcaa1)、[acecombat8.org](https://acecombat8.org/ja/aircraft/)）にはF-22A等が8AAMを搭載する記載もあるが、今回の現行装備表と一致しない。掲載維持や威力値の採用根拠にはしない。

### 12.3 掲載案・制約・記録

**提案:** アプリはキャンペーン自機の兵装を対象としているため、8AAMは固定ID6を保持して`UNUSED`へ移す。理由は「現行キャンペーン装備への割当なし」とし、NPC用80・オンライン用60を代入して掲載を続けない。今回は分類・null値・保存処理を変更していない。

今回の判断は現行の機体一覧・購入ツリー・追加枠と装備表に基づく。全任務イベントによる装備差し替えの網羅、オンラインの全装備経路、ゲーム内装備画面の操作、実ゲーム測定、今後の追加機体は未確認。これらを「全モードに8AAM搭載機なし」という結論へ拡張しない。

| 記録 | 内容 |
| --- | --- |
| [EIGHT_AAM_AVAILABILITY.json](../../../../docs/analysis/calculation/EIGHT_AAM_AVAILABILITY.json) | 追加調査の要約、機体ツリーの対応、読取境界、資産と保護対象のハッシュ、初回証拠との対応 |
| [investigate_8aam_availability.py](../../../../docs/analysis/calculation/investigate_8aam_availability.py) | 現行EXEと抽出済み資産を使う読取専用の再実行。座標のIntVector2は反射情報のint32×2・offset0/4を検証して読み、元パーサーは変更しない |
| `data/local/local004-8aam-availability.json` | 44表・表示設定2資産の完全な読取結果。Git対象外 |
| `data/local/local004-8aam-availability-latest.json` | 承認済み反映後の再実行先。公開証拠が参照する上の初回記録を上書きしない |
| `data/local/local004-8aam-followup-raw/` | 追加抽出8資産。Git対象外。既存の`local004-raw/`は保持 |

追加抽出は既存retocの`to-legacy --no-shaders --no-script-objects`を使い、既存の鍵をログへ出さず、次の4フィルターを指定した。出力先は上表のfollowup専用ディレクトリとし、ゲーム側は読取のみ。

```text
Datatables/UI/Menu/HangerMenu/AircraftTree/
Datatables/AI/DataInstance/DT_WingmanAircraft
OnlineMode/DataTables/Information/DT_OnlineAircraftParam
Maps/Ingame/Mission027/DAtoDT/DT_Mission027_Weapons
```

```powershell
python -B -X utf8 docs/analysis/calculation/investigate_8aam_availability.py 'D:\Steam\steamapps\common\ACE COMBAT 8\Game\Binaries\Win64\AceCombat8.exe'
```

追加抽出は8資産・失敗0。解析は44表と設定2資産の読取境界・機体34種への対応・36行の初回装備IDとの一致を確認した。配信3ファイル・catalog・generation-input・既存属性証拠2ファイルの計7件は今回の開始時ハッシュと一致。Python構文、記録のハッシュ・リンク、`git diff --check`、既存Oxfmtによる整形確認を実施。アプリのテスト・ビルドは未実行（アプリ・配信・生成入力の変更なし）。掲載判断が残るためlocal_004はwipに保持する。

## 13. 承認済み8AAMのUNUSED化

2026-11-04、ユーザーが固定ID6を保持したUNUSED化・実装検証・記録・コミットを承認。開始時HEADは`64744e3`、ブランチは`codex/initial-implementation`。12節の調査記録・証拠・再実行スクリプトが未コミットであり、内容を保持して今回の根拠として含める。

### 13.1 変更仕様と検証計画

| 対象 | 変更・保持する内容 |
| --- | --- |
| `data/local/catalog.json`と生成済み`src/data/weapons.json` | 8AAMのcategoryだけをMSL.AIRからUNUSEDへ変更。固定ID6・名前・順序5・元WeaponID8・基礎威力null・パーツ倍率を保持 |
| 掲載件数 | 全42兵装のまま掲載34→33、UNUSED8→9。他41兵装・全506目標・補正マスタは不変 |
| 画面・保存 | 既存のUNUSED処理で初期選択・検索・分類操作・結果列から除外。旧保存の選択ID6だけを取り除き、他の選択・条件を保持。ID6だけの旧選択は空を維持 |
| 計算・生成・状態処理 | 既存実装を維持。8AAMを削除・別IDへ統合せず、NPC用80・オンライン用60を補完しない |
| 記録 | README・マスタ照合・計算根拠・検証記録を現状に更新し、検証後にlocal_004をcompleteへ移す。TLS・UAVTは後続課題として残す |

- [x] Red: 変更後の掲載件数・旧保存の期待値で`pnpm test`を実行し、8AAMがまだ掲載されているため5件が失敗、他102件が成功することを確認
- [x] Green: catalogの分類変更・再生成後に全テストを成功させる
- [x] PC・スマートフォンの旧保存・検索・分類操作・リセット・再読込を確認する
- [x] 型検査・Lint・整形・ビルド、再生成一致と変更範囲を確認する
- [x] 結果を追記してlocal_004を完了扱いへ移し、コミットする

### 13.2 実装と検証結果

配信の変更は8AAM固定ID6の`category: MSL.AIR → UNUSED`だけ。全42兵装を保持し、掲載33・UNUSED9となった。catalogと生成入力も同じ分類だけを変更した。名前・順序・元WeaponID8・基礎威力null・パーツ倍率を維持し、計算・保存・画面・生成処理の実装は変更していない。

| 検証 | 結果 |
| --- | --- |
| `pnpm test` | 17ファイル・107件成功。旧保存の混在選択からID6だけを除去し、ID6のみ／全解除は空を維持。他の兵装・非表示中の目標・ROLE・パーツ・DAMAGE TYPEを再保存後も保持 |
| `pnpm test:browser` | Chrome16シナリオ成功。追加2件は1440×900と390×900。8AAMの候補・結果列への非掲載、旧保存・再読込、検索中の分類全選択、兵装リセット、ID6のみの旧保存から空への復元を確認 |
| `pnpm typecheck`・`pnpm lint`・`pnpm format:check`・`pnpm build` | 全て成功。既存PCテストの掲載列期待値を34→33、見出し総数を36→35、MSL.AIR分類を11→10へ更新 |
| 再生成 | `pnpm generate:data`を2回実行し、配信3ファイルのSHA-256が一致。1459出典・42兵装・506目標を保持 |
| 変更範囲 | 開始時7ファイルの構造・ハッシュ比較で、weapons/catalog/generation-inputのID6分類以外は不変。他41兵装、全目標・固定ID・耐性・補正マスタ、既存属性証拠2ファイルを保持 |
| 調査記録 | 反映後の8AAM調査再実行で、保護対象ハッシュ以外の全読取結果が初回と一致。公開証拠2件と初回完全版のハッシュを維持。再実行先をlatestへ分離。Python構文・文書リンク・`git diff --check`を確認 |

制限環境内のpnpmは作業ディレクトリ正規化のアクセス拒否で起動できず、許可された制限外実行で上記検証を行った。実機スマートフォン・実ゲーム測定・参照資料なしの別コピー検証は再実施していない。ゲーム本体・設定・セーブは変更していない。

SFFS対応と8AAM掲載判断を完了したため、本書を`spec/agent/complete/local_004/`へ移した。TLSのヒット時刻、UAVTの評価単位・全攻撃回数、全任務イベント・オンライン装備経路の網羅、基準EXEとの処理差は後続調査として残す。
