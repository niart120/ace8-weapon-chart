# 開発・コントリビューションガイド

本リポジトリの開発環境構築、日常コマンド、データ再生成手順、および内部仕様の管理方針です。

## 開発・起動

Node.js 24以上、pnpm 12.4.1を使用します。生成処理と生成の固定テストにはPython 3.10以上も必要です。

```powershell
pnpm install
pnpm dev
```

表示されたローカルURLを開きます。通常の起動・テスト・ビルドは `src/data/` の配信用JSONと固定の検証用データを使い、ゲーム本体・ローカル参照資料・`data/local/` を要求しません。

### 日常コマンド

```powershell
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test
pnpm build
pnpm preview
```

### ブラウザーテスト

Chromeによる実ブラウザーテスト（Playwright）は次のコマンドで実行します。インストール済みのChromeを使用します。初回選択を分ける境界は767pxです。

```powershell
pnpm test:browser
```

## データの再生成

生成結果を直接編集しません。次のローカル入力を保持して実行します。

| 入力 | 内容 |
| --- | --- |
| `docs/initial/ref/tables/` | Model・NPC・任務・兵装・パーツ・耐性・ROLEの抽出表、継承済み兵装Blueprint |
| `docs/initial/ref/reports/weapon_part_bindings.json` | 兵装グループとパーツの適用ラベル |
| `data/local/catalog.json` | 固定整数ID、分類・順序・除外、部位・任務・元定義の対応、確認済み属性 |

```powershell
pnpm generate:data
```

PythonでHP・耐性・威力・パーツを解決し、TypeScriptで統合条件と3マスタを検証して、整形済みの `weapons.json`・`targets.json`・`modifiers.json` を更新します。検証に失敗した場合は配信用の3ファイルを変更しません。通常ビルドから生成を呼び出しません。

- 生成元の目標名は任務ラベルなしで管理します。`missionVariant.missionId`から生成時にだけ `[M24]` などを付与します。任務差分の入力名にラベルが含まれていた場合はエラーとし、自動で剥がしたり置き換えたりしません。
- 固定ID対応と調査用の追加抽出物は `data/local/` に保存し、Git・配信対象から除外します。再生成でIDを採番し直さず、追加項目だけ未使用番号を割り当て、削除IDを再利用しません。
- ローカル入力を持たないチェックアウトは、生成済みJSONを使用できます。

## 計算仕様と内部設計

計算ロジック、境界条件、除外判断の根拠資料です。

- [仕様書](spec/agent/complete/local_001/INITIAL_DESIGN.md)
- [計算調査・根拠](docs/analysis/calculation/CALCULATION_EVIDENCE.md)
- [マスタ照合](docs/analysis/calculation/MASTER_AUDIT.md)
- [全体検証](docs/analysis/calculation/VALIDATION.md)
- [未対応課題](spec/agent/complete/local_001/ISSUES.md)
- [出現対応監査](docs/analysis/mission-appearances/MISSION_APPEARANCE_AUDIT.md)
- [対象データ調査](spec/agent/complete/local_007/TARGET_DATA_AUDIT.md)
- [コンテナ船の統合記録](docs/analysis/calculation/CONTAINER_SHIP_REVIEW.md)
- [スウォームドローンの調査記録](docs/analysis/calculation/SWARM_DRONES_REVIEW.md)

## 公開前の互換性方針

公開前は後方互換性を保証せず、変更により以前の選択が失われたり設定が初期化されたりすることを許容します。保存の復元では現行の掲載対象との照合を行い、廃止IDを別のIDへ変換しません。
