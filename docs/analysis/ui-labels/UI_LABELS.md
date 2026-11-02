# 画面ラベルの表示名調査

調査日: 2026-11-03。対象は同梱資料のSteam build 25201480。ゲーム画面の実行確認・追加のゲームファイル抽出は行っていない。

## 確認方法

`docs/initial/ref/raw_guides/Live/Content/Localization/GameData/CP_Cmn.dat` と `CP_A.dat` を、既存の `extract_target_names.py` の復号処理で読み取った。日本語モード用データにも、兵装・パーツの英語略号と自機種別の英語表記が収録されている。

[兵装定義](../../initial/ref/tables/DT_LiveWeapon.json)の `WeaponNameTextID`・`WeaponShortNameTextID`、[パーツ定義](../../initial/ref/tables/DT_LiveParts.json)の `PartsNameTextID`・`PartsShortNameTextID` を文字列へ解決した。内部の `WeaponStringID` と表示名は区別する。

## 自機種別

| 区分 | 収録表記 | 文字列キー |
| --- | --- | --- |
| 戦闘機 | `FIGHTER` | `HangarAircrafttype_Name_Fighter` |
| 攻撃機 | `ATTACKER` | `HangarAircrafttype_Name_Attecker` |
| マルチロール機 | `MULTIROLE` | `HangarAircrafttype_Name_Multirole` |
| 電子戦機 | `ELECTRONIC WARFARE` | `HangarAircrafttype_Name_Electronic` |

攻撃機のキー内の `Attecker` は元データの綴り。画面に用いる文字列は `ATTACKER`。

## 威力強化パーツ

計算対象として検討している威力強化パーツ10種の収録表記。

| PartsID | 略号 | パーツ名 |
| --- | --- | --- |
| 2011802 | `GUN.POW+` | 高威力化改修対応砲弾 |
| 2014802 | `MSL.POW+` | 指向性近接信管 (標準ミサイル用) |
| 2058802 | `MSL.AIR.POW+` | 対空弾道補正モジュール (標準ミサイル用) |
| 2059802 | `MSL.GND.POW+` | 対地弾道補正モジュール (標準ミサイル用) |
| 2021802 | `AIR.POW+` | 対空弾道補正モジュール (特殊兵装用) |
| 2022802 | `GND.POW+` | 対地弾道補正モジュール (特殊兵装用) |
| 2032802 | `BOMB.POW+` | 高性能炸薬 |
| 2038802 | `RKT.POW+` | ロケット弾用追加炸薬 |
| 2040802 | `TLS.POW+` | 集光補正装置 |
| 2042802 | `EML.POW+` | 高速投射体 |

名称の照合結果であり、個々の兵装への倍率適用は既存の計算資料に従って確認する。

## 兵装の内部名と表示名

49行の兵装定義を照合し、各行の名称・略号を[抽出結果](ui_labels.json)に保存した。内部名と表示略号が異なる例は次のとおり。

| WeaponID | WeaponStringID | 略号の参照キー | 収録された略号 |
| --- | --- | --- | --- |
| 10 | `eml` | `WeaponShort_Name_emlb` | `EMLB` |
| 45 | `emlb` | `WeaponShort_Name_emlb` | `EMLB` |
| 44 | `emlt` | `WeaponShort_Name_emlt` | `EMLT` |
| 25 | `plsl` | `WeaponShort_Name_plsl` | `PLSL` |
| 35 | `pgun` | `WeaponShort_Name_pgun` | `PLSL` |
| 42 | `admm` | `WeaponShort_Name_admm` | `ADMM` |
| 103 | `4uav` | `WeaponShort_Name_uav_x40a` | `UAVT` |
| 101 | `uavp` | `WeaponShort_Name_uavp` | `UAVP` |
| 102 | `uavg` | `WeaponShort_Name_uavg` | `UAVG` |

定義の存在は、プレイヤーが装備できることやアプリの表示対象であることを保証しない。同じ略号を参照する複数の定義もあるため、表示文字列で定義を統合しない。兵装一覧への採否と計算単位は[初期設計仕様書](../../../spec/agent/wip/local_001/INITIAL_DESIGN.md)で管理する。これまで資料内で使用している `EML` 系、`4UAV` などの解析上の呼称は、この調査だけで一括置換しない。

ユーザーからの未解禁情報に基づき、単発EML（WeaponID 10）・PLSL（25）・ADMM（42）は `UNUSED` として現時点の表示対象から外すことを合意した。PGUN（35・内部名 `pgun`、収録略号は `PLSL`）・EMLT（44）・UAVG（102）・UAVP（101）・FAEB（32）も、ユーザー指定により `UNUSED` とする。これらは名称の抽出結果とは別の設計判断。`blueprint_weapons.json` の `BP_plwp_eml_x0_C` はWeaponID 10・基礎威力140、`BP_plwp_eml_x3_C` はWeaponID 45・基礎威力80であり、単発EMLとEMLBを同じ略号だけで一括除外しない。EMLB（45）とUAVT（103）は表示対象として合意済み。同系統の定義の除外に巻き込まない。UAVTの評価方法・計算単位は引き続き未確定。

アプリ独自の絞り込み分類名は初期設計仕様書の3.8に記載する。命中条件や操作欄の見出しは未確定。`TypeA`・`TypeB`・`TypeC` と `TLS [s]` は合意済みのアプリ表記を維持する。

## 再現・検証

リポジトリのルートから実行する。Pythonの標準ライブラリのみを使用し、出力先はこのディレクトリの `ui_labels.json`。参照資料への書き込みは行わない。

```powershell
python -B docs/analysis/ui-labels/extract_ui_labels.py
```

[抽出スクリプト](extract_ui_labels.py)で、文字列キーの木構造777,044バイトを最後まで読めること、文字列の添字が範囲内であることを確認した。[既存の目標名抽出結果](../../initial/ref/reports/target_display_names.json)と入力2ファイルのSHA-256を照合し、既存の目標名737件の全文字列が一致した。パーツ10件についてIDの過不足と名称の欠落がないことも確認した。

入力ファイルのSHA-256と名称ごとの参照キーは `ui_labels.json` に収録している。文字列の解決を確認したものであり、各兵装の計算処理や実際の装備可否を検証した結果ではない。
