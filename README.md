# ACE COMBAT 8 Weapon Guide

キャンペーン目標を行、兵装を列に並べ、HP満タンから撃破するための命中数をブラウザー内で計算する。PC・スマートフォンに対応。

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

固定ID対応と調査用の追加抽出物は `data/local/` に保存し、Git・配信対象から除外する。再生成でIDを採番し直さない。追加項目だけ未使用番号を割り当て、削除IDを再利用しない。更新で統合条件が崩れた場合は、対応表を見直して分離する。

ローカル入力を持たないチェックアウトは、生成済みJSONを使用できる。再生成には上記入力を別途用意する必要がある。

## 計算と未確認範囲

同一目標への同一兵装の命中数を表示する。成分別の補正、float32演算、HP×10の整数更新を反復する。命中可能性、搭載可否、任務中のイベントによる無敵解除は再現しない。ROLEは有効な条件とする。

SFFS・SODは子弾1発を単位とする。SFFSはBOMB.POW+で子弾1発の威力が40から48になる（ROLE・耐性補正前）。MPBMは直撃・範囲初撃までを扱い、継続ダメージを含めない。追加爆風のない兵装はDAMAGE TYPEを変更しても本来の計算を保つ。

`-` は確認済みのダメージ0、`?` は計算に必要な値・処理が未確認の組み合わせ。TLSの秒数、UAVTの展開全体の評価には未確認範囲がある。未確認を0や倍率1で補わない。

8AAMは現行キャンペーンの搭載機がないため掲載対象外とし、固定ID6を`UNUSED`として保持する。NPC用・オンライン用の威力をキャンペーン用へ転用しない。

MEGAFLOATのFront／EV支柱は元HP100／200、原子炉は各HP40で計算する。甲板と中央支柱の親構造物は掲載対象外。露出・開閉・崩壊演出などの進行を命中数に含めず、通常支柱も最低HP1への到達へ置き換えない。

根拠は静的な抽出値と処理。実ゲームでのダメージ測定は行っていない。元の数値資料と追加解析の対象EXEはビルドが異なるため、出典と確認範囲を[計算調査](docs/analysis/calculation/CALCULATION_EVIDENCE.md)で区別する。

- [仕様書](spec/agent/complete/local_001/INITIAL_DESIGN.md)
- [マスタ照合](docs/analysis/calculation/MASTER_AUDIT.md)
- [全体検証](docs/analysis/calculation/VALIDATION.md)
- [未対応課題](spec/agent/complete/local_001/ISSUES.md)

選択と計算条件は同じブラウザーのlocalStorageに自動保存する。検索・パネル開閉・計算結果は保存しない。保存できない環境でも画面操作を続けられる。
