# ACE COMBAT 8 Weapon Guide

キャンペーン目標を行、兵装を列に並べ、HP満タンから撃破するための命中数をブラウザー内で計算する。PC・スマートフォンに対応。

`TARGETS` の `TYPE` は種別・細分類からの個別選択、`MISSION` は複数任務からの絞り込み。選択中の方式だけを適用し、もう一方の選択は保持する。MISSIONの未選択は任務で絞らない状態とする。任務指定時は該当任務の部位・性能差分も含める。

表はHP昇順で開始し、列見出しで名前・HP・各兵装の命中数を並べ替える。命中数の文字色は1・2・3・4・5以上の固定区分。数値は実数のまま表示する。Rajdhaniは同梱して配信し、外部フォントサービスへ接続しない。[書体ライセンス](public/fonts/OFL.txt)

## 開発・起動

Node.js 24以上、pnpm 12.4.1を使用する。生成処理と生成の固定テストにはPython 3.10以上も必要。

```powershell
pnpm install
pnpm dev
```

表示されたローカルURLを開く。通常の起動・テスト・ビルドは `src/data/` の配信用JSONと固定の検証用データを使い、ゲーム本体・ローカル参照資料・`data/local/` を要求しない。

```powershell
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test
pnpm build
pnpm preview
```

Chromeによる実ブラウザーテストは次のコマンドで実行する。インストール済みのChromeを使用する。初回選択を分ける境界は767px。

```powershell
pnpm test:browser
```

## データの再生成

生成結果を直接編集しない。次のローカル入力を保持して実行する。

| 入力 | 内容 |
| --- | --- |
| `docs/initial/ref/tables/` | Model・NPC・任務・兵装・パーツ・耐性・ROLEの抽出表、継承済み兵装Blueprint |
| `docs/initial/ref/reports/weapon_part_bindings.json` | 兵装グループとパーツの適用ラベル |
| `data/local/catalog.json` | 固定整数ID、分類・順序・除外、部位・任務・元定義の対応、確認済み属性 |

```powershell
pnpm generate:data
```

PythonでHP・耐性・威力・パーツを解決し、TypeScriptで統合条件と3マスタを検証して、整形済みの `weapons.json`・`targets.json`・`modifiers.json` を更新する。検証に失敗した場合は配信用の3ファイルを変更しない。通常ビルドから生成を呼び出さない。

生成元の目標名は任務ラベルなしで管理する。`missionVariant.missionId`から生成時にだけ`[M24]`などを付与する。任務差分の入力名にラベルが含まれていた場合はエラーとし、自動で剥がしたり置き換えたりしない。配信済みの行をそのまま生成元へ戻す形式には対応しない。

固定ID対応と調査用の追加抽出物は `data/local/` に保存し、Git・配信対象から除外する。再生成でIDを採番し直さない。追加項目だけ未使用番号を割り当て、削除IDを再利用しない。更新で統合条件が崩れた場合は、対応表を見直して分離する。

ローカル入力を持たないチェックアウトは、生成済みJSONを使用できる。再生成には上記入力を別途用意する必要がある。

## 計算と未確認範囲

同一目標への同一兵装の命中数を表示する。成分別の補正、float32演算、HP×10の整数更新を反復する。命中可能性、搭載可否、任務中のイベントによる無敵解除は再現しない。ROLEは有効な条件とする。

SFFS・SODは子弾1発を単位とする。SFFSはBOMB.POW+で子弾1発の威力が40から48になる（ROLE・耐性補正前）。MPBMは直撃・範囲初撃までを扱い、継続ダメージを含めない。追加爆風のない兵装はDAMAGE TYPEを変更しても本来の計算を保つ。

`-` は確認済みのダメージ0、`?` は計算に必要な値・処理が未確認の組み合わせ。TLS・UAVTは計算仕様の複雑化を避けるため掲載対象外（UNUSED）とし、固定IDを保持している。キャンペーンで使用できないという意味ではない。未確認を0や倍率1で補わない。

8AAMは現行キャンペーンの搭載機がないため掲載対象外とし、固定ID6を`UNUSED`として保持する。NPC用・オンライン用の威力をキャンペーン用へ転用しない。

MEGAFLOATのFront／EV支柱は元HP100／200、原子炉は各HP40で計算する。甲板と中央支柱の親構造物は掲載対象外。露出・開閉・崩壊演出などの進行を命中数に含めず、通常支柱も最低HP1への到達へ置き換えない。

根拠は静的な抽出値と処理。実ゲームでのダメージ測定は行っていない。元の数値資料と追加解析の対象EXEはビルドが異なるため、出典と確認範囲を[計算調査](docs/analysis/calculation/CALCULATION_EVIDENCE.md)で区別する。

- [仕様書](spec/agent/complete/local_001/INITIAL_DESIGN.md)
- [マスタ照合](docs/analysis/calculation/MASTER_AUDIT.md)
- [全体検証](docs/analysis/calculation/VALIDATION.md)
- [未対応課題](spec/agent/complete/local_001/ISSUES.md)

選択方式・各方式の選択と計算条件は同じブラウザーのlocalStorageに自動保存する。検索・パネル開閉・ソート・計算結果は保存しない。保存できない環境でも画面操作を続けられる。保存形式はversion 3。ミッション番号はゲーム内番号と同じ数値とし、文字列の内部識別子を使っていたversion 2以前の保存設定は初期化する。

出現任務は対象自身の任務定義と実際の子NPC参照を根拠にし、`partOf`だけでは親の任務を継承しない。確認済みの非敵対象・撃破対象外と任務限定の除外を反映する。PROLOGUEは非表示、非武装任務M14は選択不可。最新の掲載判断は[出現対応監査](docs/analysis/mission-appearances/MISSION_APPEARANCE_AUDIT.md)を参照。掲載279行のうち5行は出現任務が未特定で、TYPEおよび任務未指定では掲載し、特定任務へは推測で割り当てない。分類と対応範囲は[対象データ調査](spec/agent/complete/local_007/TARGET_DATA_AUDIT.md)、操作仕様と検証結果は[対象選択・比較表・書体の改善](spec/agent/complete/local_007/TARGET_BROWSING_AND_TYPOGRAPHY.md)を参照。

COMMAND VEHICLE・EPP VEHICLE・IED VEHICLEの基本行は、敵出現の裏付け不足または支援対象の基本定義として掲載対象外。[VEHICLE調査](docs/analysis/calculation/VEHICLE_REVIEW.md)と[既存調査の残件整理](docs/analysis/mission-appearances/FOLLOWUP_REVIEW.md)を参照。

CONTAINER SHIPは計算値が一致する通常船とM16偽装船を1行に統合し、名前に任務接尾辞を付けない。絞り込み用の任務対応はM16・M23・M27を保持する。基本定義2行と船上MANPADSは掲載対象外とする。[調査・反映記録](docs/analysis/calculation/CONTAINER_SHIP_REVIEW.md)を参照。

SWARM DRONESは同じ表示・計算条件の2行を1行へ統合し、M9・M10・M19・M30に対応させる。専用の個体破壊処理を使うため、必要命中数は`?`、HPは`-`とする。選択候補でもHPを`-`で表示し、HP順では昇順・降順とも数値のある対象の後に置く。元定義のHP1／20と計算に適用するHPを区別する。[調査記録](docs/analysis/calculation/SWARM_DRONES_REVIEW.md)を参照。

公開前は後方互換性を保証せず、変更により以前の選択が失われたり設定が初期化されたりすることを許容する。保存の復元では現行の掲載対象との照合を行い、廃止IDを別のIDへ変換しない。
