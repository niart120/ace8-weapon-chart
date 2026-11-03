# 味方候補と掲載対象外の調査

調査日: 2026-11-03。同梱資料のSteam build 25201480を対象とした静的な参照調査。アプリやデータ生成処理の実装、ゲームの実行、追加ファイル抽出は行っていない。

## 調査方法と範囲

全 `DT_NPC_Mission*.json` の各行からNPC、モデル、Blueprint参照をたどり、任務行キー・NPC ID・モデルID・Blueprint名のいずれかに `Ally` または `Friend` を含むものを大文字・小文字を区別せず抽出した。名称は候補抽出の手掛かりであり、実ゲームでの所属を確定するフラグではない。

通常モデルを味方と敵が共用する場合があるため、判定単位は任務テーブルと行キーの組とする。同じ表示名・HP・モデルIDだけで別行へ分類を広げない。候補から漏れる味方の存在を否定できず、未配置のモデル定義や任務イベントによる生成も網羅しない。

## 集計と扱い

| 抽出根拠 | 任務行数 | 現在の扱い |
| --- | ---: | --- |
| モデルまたはBlueprintにも味方用の命名がある | 157 | 任務行単位でEXCLUDEDに分類する方針を合意済み。先行合意のM25の8行を含む |
| 任務行キーまたはNPC IDのみに味方用の命名がある | 42 | 同一パラメータの2行と最低HPを持つ11行をEXCLUDEDに分類。残る29行もEXCLUDED（21行は暫定、8行は詳細確認後に除外を承認） |
| 合計 | 199 | 表示行へ統合する前の元定義の行数 |

M25には合意済み8行に加え、同じ味方用APCモデル `GR013_stry_Ally` を使う `stry_ms25day1_Bravo`・`stry_ms25day1_Charley`（HP615）がある。通常モデルを参照し命名にも味方用の手掛かりがない `m1a2_common`・`stry_common`（HP500）は今回の199行に含まれないが、別途ユーザーがEXCLUDED扱いを承認した。実際の所属は未確認のままとする。

分類名は[初期設計仕様書](../../../spec/agent/complete/local_001/INITIAL_DESIGN.md)で `FRIEND` から `EXCLUDED` へ変更した。モデル・Blueprintの命名を根拠とする157行と、別行との同一パラメータを確認した2行に、最低HPを理由に除外した11行を加え、170行を掲載対象外とした。残る29行も後続のユーザー方針に従い暫定EXCLUDEDとし、199行すべてを現在の掲載対象から除外する。このうち任務行キーだけにAllyがある8行は、詳細確認後にユーザーがEXCLUDED扱いを承認した。残る21行は暫定除外を維持し、実際の所属は29行とも未確認。ALCMも同分類で掲載対象外だが、この199行には含まれない。`EXCLUDED` は掲載範囲を表し、実ゲームでの所属・未使用・恒久的な撃破不能を確定するものではない。除外理由と元定義との対応を記録に残す。

## 元資料

- [NPC定義](../../initial/ref/tables/DT_NPC.json)
- [モデル定義](../../initial/ref/tables/DT_NPC_Model.json)
- [任務HP照合用の既存レポート](../../initial/ref/reports/mission_enemy_health.json)
- [表示名の抽出結果](../../initial/ref/reports/target_display_names.json)

以下の任務番号は元テーブルの識別用表記であり、アプリのラベル案ではない。HPは既存の任務HPレポートから照合した初期値で、実ゲームの測定値ではない。

## モデル・Blueprintにも命名根拠がある157行

| 任務 | 任務行キー | 表示名 | HP | NPC ID | モデルID | Blueprint |
| --- | --- | --- | ---: | --- | --- | --- |
| 003 | `maya_Ally` | STALWART | 115 | `VE018_maya_Ally_MS03` | `VE018_maya_Ally_MS03` | `BP_VE018_maya_CP_Ally_MS03_C` |
| 004 | `hmwv_ally` | HMMWV | 100 | `GR030_hmwv_Ally_01` | `GR030_hmwv_Ally` | `BP_GR030_hmwv_CP_Ally_C` |
| 004 | `aegs_Ally` | AEGIS | 155 | `VE002_aegs_Ally_01` | `VE002_aegs_Ally` | `BP_VE002_aegs_CP_Ally_C` |
| 004 | `free_Ally_common` | FRIGATE | 75 | `VE016_free_Ally_01` | `VE016_free_Ally` | `BP_VE016_free_CP_Ally_C` |
| 004 | `free_Ally_mk110` | NAVAL GUN | 20 | `VE016_free_mk110_Ally_01` | `VE016_free_mk110_Ally` | `BP_VE016_free_mk110_CP_Ally_C` |
| 004 | `free_Ally_mk46_R` | AA GUN | 20 | `VE016_free_mk46_R_Ally_01` | `VE016_free_mk46_R_Ally` | `BP_VE016_free_mk46_01_CPBase_Ally_C` |
| 004 | `free_Ally_mk46_L` | AA GUN | 20 | `VE016_free_mk46_L_Ally_01` | `VE016_free_mk46_L_Ally` | `BP_VE016_free_mk46_02_CPBase_Ally_C` |
| 006 | `lcac_Ally_MS06` | LCAC | 480 | `VE014_lcac_Ally_MS06` | `VE014_lcac_Ally_MS06` | `BP_VE014_lcac_CP_Ally_WarmupWake_C` |
| 007 | `ch47_Ally_Spread1` | CH-47 | 280 | `OP0021_ch47_Ally_MS07_01` | `OP0021_ch47_Ally_MS07_01` | `BP_OP0021_ch47_Cp_Ally_C` |
| 007 | `ch47_Ally_Spread2` | SPREAD 2 | 280 | `OP0021_ch47_Ally_MS07_02` | `OP0021_ch47_Ally_MS07_02` | `BP_OP0021_ch47_Cp_Ally_C` |
| 007 | `hmwv_ally_Spread1` | HMMWV | 200 | `GR030_hmwv_Ally_MS07_01` | `GR030_hmwv_Ally_MS07_01` | `BP_GR030_hmwv_CP_Ally_C` |
| 007 | `hmwv_ally_Spread2` | HMMWV | 200 | `GR030_hmwv_Ally_MS07_02` | `GR030_hmwv_Ally_MS07_02` | `BP_GR030_hmwv_CP_Ally_C` |
| 008 | `OP0018_uavc_Ally_01` | MQ-99 | 6 | `OP0018_uavc_Ally_01` | `OP0018_uavc_Ally` | `BP_OP0018_uavc_CP_Ally_C` |
| 009 | `lcac_Ally` | LCAC | 300 | `VE014_lcac_Ally_01` | `VE014_lcac_Ally` | `BP_VE014_lcac_CP_Ally_C` |
| 010 | `PV_f18e_f18c_Queen01` | QUEEN 1 | 60 | `OP1032_f18e_PV_MS10_f18c_Queen1` | `OP1032_f18e_Queen1` | `BP_OP1032_f18e_CP_Ally_C` |
| 010 | `PV_f18e_f18c_Queen02` | QUEEN 2 | 60 | `OP1032_f18e_PV_MS10_f18c_Queen2` | `OP1032_f18e_Queen2` | `BP_OP1032_f18e_CP_Ally_C` |
| 010 | `PV_f18e_f18c_Queen03` | QUEEN 3 | 60 | `OP1032_f18e_PV_MS10_f18c_Queen3` | `OP1032_f18e_Queen3` | `BP_OP1032_f18e_CP_Ally_C` |
| 010 | `PV_f18e_f18c_Queen04` | QUEEN 4 | 60 | `OP1032_f18e_PV_MS10_f18c_Queen4` | `OP1032_f18e_Queen4` | `BP_OP1032_f18e_CP_Ally_C` |
| 010 | `PV_f18e_av8b_Ally01` | JACKPOT | 60 | `OP1032_f18e_PV_MS10_av88_Jackpot` | `OP1032_f18e_Jackpot` | `BP_OP1032_f18e_CP_Ally_C` |
| 010 | `PV_f18e_f18c_Ally` | F/A-18E | 10 | `OP1032_f18e_PV_MS10_f18c` | `OP1032_f18e_Ally` | `BP_OP1032_f18e_CP_Ally_C` |
| 011 | `aegs_Ally_MS11_Karkinos` | KARKINOS | 155 | `VE002_aegs_Ally_MS11_Karkinos` | `VE002_aegs_Ally_MS11_Karkinos` | `BP_VE002_aegs_CP_Ally_C` |
| 011 | `aegs_Ally_MS11_Bravery` | BRAVERY | 155 | `VE002_aegs_Ally_MS11_Bravery` | `VE002_aegs_Ally_MS11_Bravery` | `BP_VE002_aegs_CP_Ally_C` |
| 011 | `aegs_mk45_aagun_Ally_MS11` | AA GUN | 20 | `VE002_aegs_mk45_aagun_Ally_MS11` | `VE002_aegs_mk45_Ally` | `BP_VE002_aegs_mk45_CP_Ally_C` |
| 011 | `aegs_mk45_artillery_Ally_MS11` | NAVAL GUN | 20 | `VE002_aegs_mk45_artillery_Ally_MS11` | `VE002_aegs_artillery_Ally` | `BP_VE002_artillery_CP_Ally_C` |
| 011 | `aegs_mk15_Ally_MS11` | CIWS | 20 | `VE002_aegs_mk15_Ally_MS11` | `VE002_aegs_mk15_Ally` | `BP_VE002_aegs_mk15_01_CP_Ally_C` |
| 011 | `aegs_mk41_Ally_MS11` | VLS | 20 | `VE002_aegs_mk41_Ally_MS11` | `VE002_aegs_mk41_Ally` | `BP_VE002_aegs_mk41_CP_Ally_C` |
| 011 | `grfd_Ally` | AIRCRAFT CARRIER | 680 | `VE004_grfd_Ally_01` | `VE004_grfd_Ally` | `BP_VE004_grfd_CP_Ally_C` |
| 011 | `grfd_mk15_RF_Ally` | AA GUN | 20 | `VE004_grfd_mk15_RF_Ally_01` | `VE004_grfd_mk15_RF_Ally` | `BP_VE004_grfd_mk15_02_CP_Ally_C` |
| 011 | `grfd_mk15_LF_Ally` | AA GUN | 20 | `VE004_grfd_mk15_LF_Ally_01` | `VE004_grfd_mk15_LF_Ally` | `BP_VE004_grfd_mk15_01_CP_Ally_C` |
| 011 | `grfd_mk15_RB_Ally` | AA GUN | 20 | `VE004_grfd_mk15_RB_Ally_01` | `VE004_grfd_mk15_RB_Ally` | `BP_VE004_grfd_mk15_04_CP_Ally_C` |
| 011 | `grfd_mk15_LB_Ally` | AA GUN | 20 | `VE004_grfd_mk15_LB_Ally_01` | `VE004_grfd_mk15_LB_Ally` | `BP_VE004_grfd_mk15_03_CP_Ally_C` |
| 011 | `wasp_Ally` | ASSAULT SHIP | 255 | `VE023_wasp_Ally_01` | `VE023_wasp_Ally` | `BP_VE023_wasp_CP_Ally_C` |
| 011 | `aegs_Ally` | AEGIS | 155 | `VE002_aegs_Ally_01` | `VE002_aegs_Ally` | `BP_VE002_aegs_CP_Ally_C` |
| 013 | `uh47_Ally` | （表示名未解決） | 35 | `OP0002_uh09_01` | `OP0002_uh09_Ally` | `BP_OP0002_uh09_CP_Ally_C` |
| 013 | `ch47_Ally` | CH-47 | 200 | `OP0021_ch47_Ally_01` | `OP0021_ch47_Ally` | `BP_OP0021_ch47_Cp_Ally_C` |
| 014 | `OP0054_c130_MS14` | C-130 | 280 | `OP0054_c130_MS14_01` | `OP0054_c130_MS14` | `BP_OP0054_c130_Ally_MS14_C` |
| 014 | `Truck_Ally_common` | RESISTANCE TRUCK | 15 | `GR024_trkc_MS14` | `GR024_trkc_Ally_MS14` | `BP_GR024_trkc_CP_C` |
| 016 | `OP1007_f18c_01` | BANKER | 57 | `OP1007_f18c_Ally_MS16_Banker` | `OP1007_f18c_Ally_Banker` | `BP_OP1007_f18c_CP_Bunker_C` |
| 016 | `VE004_grfd_Ally_01` | AIRCRAFT CARRIER | 235 | `VE004_grfd_Ally_MS16` | `VE004_grfd_Ally_MS16_Grindylow` | `BP_VE004_grfd_CP_Ally_C` |
| 016 | `VE004_grfd_mk15_RF_Ally_01` | AA GUN | 20 | `VE004_grfd_mk15_RF_Ally_MS16` | `VE004_grfd_mk15_RF_Ally` | `BP_VE004_grfd_mk15_02_CP_Ally_C` |
| 016 | `VE004_grfd_mk15_LF_Ally_01` | AA GUN | 20 | `VE004_grfd_mk15_LF_Ally_MS16` | `VE004_grfd_mk15_LF_Ally` | `BP_VE004_grfd_mk15_01_CP_Ally_C` |
| 016 | `VE004_grfd_mk15_RB_Ally_01` | AA GUN | 20 | `VE004_grfd_mk15_RB_Ally_MS16` | `VE004_grfd_mk15_RB_Ally` | `BP_VE004_grfd_mk15_04_CP_Ally_C` |
| 016 | `VE004_grfd_mk15_LB_Ally_01` | AA GUN | 20 | `VE004_grfd_mk15_LB_Ally_MS16` | `VE004_grfd_mk15_LB_Ally` | `BP_VE004_grfd_mk15_03_CP_Ally_C` |
| 016 | `VE002_aegs_Ally_01` | AEGIS | 155 | `VE002_aegs_Ally_MS16` | `VE002_aegs_Ally` | `BP_VE002_aegs_CP_Ally_C` |
| 016 | `VE002_aegs_Ally_Nuckelavee` | AEGIS | 155 | `VE002_aegs_Ally_MS16_Nuckelavee` | `VE002_aegs_Ally_MS16` | `BP_VE002_aegs_CP_Ally_C` |
| 016 | `VE002_aegs_Ally_Alasalushi` | AEGIS | 155 | `VE002_aegs_Ally_MS16_Alasalushi` | `VE002_aegs_Ally_MS16` | `BP_VE002_aegs_CP_Ally_C` |
| 016 | `VE002_aegs_Ally_Crag` | AEGIS | 155 | `VE002_aegs_Ally_MS16_Crag` | `VE002_aegs_Ally_MS16` | `BP_VE002_aegs_CP_Ally_C` |
| 016 | `VE002_aegs_Ally_Lively` | AEGIS | 155 | `VE002_aegs_Ally_MS16_Lively` | `VE002_aegs_Ally_MS16` | `BP_VE002_aegs_CP_Ally_C` |
| 016 | `VE002_aegs_mk45_aagun_Ally_01` | AA GUN | 20 | `VE002_aegs_mk45_aagun_Ally_MS16` | `VE002_aegs_mk45_Ally` | `BP_VE002_aegs_mk45_CP_Ally_C` |
| 016 | `VE002_aegs_mk45_artillery_Ally_01` | NAVAL GUN | 20 | `VE002_aegs_mk45_artillery_Ally_MS16` | `VE002_aegs_artillery_Ally` | `BP_VE002_artillery_CP_Ally_C` |
| 016 | `VE002_aegs_mk15_Ally_01` | CIWS | 20 | `VE002_aegs_mk15_Ally_MS16` | `VE002_aegs_mk15_Ally` | `BP_VE002_aegs_mk15_01_CP_Ally_C` |
| 016 | `VE002_aegs_mk41_Ally_01` | VLS | 20 | `VE002_aegs_mk41_Ally_MS16` | `VE002_aegs_mk41_Ally` | `BP_VE002_aegs_mk41_CP_Ally_C` |
| 016 | `VE018_maya_MS16` | CRUISER | 115 | `VE018_maya_Ally_MS16` | `VE018_maya_Ally_MS16` | `BP_VE018_maya_CP_MS16_C` |
| 016 | `VE018_maya_MS16_Hafgufa` | CRUISER | 115 | `VE018_maya_Ally_MS16_Hafgufa` | `VE018_maya_Ally_MS16` | `BP_VE018_maya_CP_MS16_C` |
| 016 | `VE018_maya_MS16_Jackalope` | CRUISER | 115 | `VE018_maya_Ally_MS16_Jackalope` | `VE018_maya_Ally_MS16` | `BP_VE018_maya_CP_MS16_C` |
| 016 | `VE018_maya_MS16_Relic` | CRUISER | 115 | `VE018_maya_Ally_MS16_Relic` | `VE018_maya_Ally_MS16` | `BP_VE018_maya_CP_MS16_C` |
| 016 | `VE018_maya_MS16_Valor` | CRUISER | 115 | `VE018_maya_Ally_MS16_Valor` | `VE018_maya_Ally_MS16` | `BP_VE018_maya_CP_MS16_C` |
| 016 | `VE018_maya_mk45_MS16` | NAVAL GUN | 20 | `VE018_maya_mk45_Ally_MS16` | `VE018_maya_mk45_Ally` | `BP_VE018_maya_mk45_CP_Ally_C` |
| 016 | `VE018_maya_mk15_MS16` | AA GUN | 20 | `VE018_maya_mk15_Ally_MS16` | `VE018_maya_mk15_Ally` | `BP_VE018_maya_mk15_02_CP_Ally_C` |
| 018 | `b01b_Ally` | B-1 | 130 | `OP0008_b01b_Ally_Bigfoot` | `OP0008_b01b_Ally_Bigfoot` | `BP_OP0008_b01b_CP_Ally_C` |
| 020 | `f18c_Ally` | F/A-18C | 57 | `OP1007_f18c_Ally` | `OP1007_f18c_Ally` | `BP_OP1007_f18c_CP_Ally_C` |
| 020 | `b01b_Ally` | B-1 | 130 | `OP0008_b01b_Ally_Bigfoot` | `OP0008_b01b_Ally_Bigfoot` | `BP_OP0008_b01b_CP_Ally_C` |
| 020 | `mv22_Rosie` | ROSIE | 35 | `OP0023_mv22_Rosie` | `OP0023_mv22_Rosie` | `BP_OP0023_mv22_CP_Ally_C` |
| 021 | `PV_f18e_Queen01` | QUEEN 1 | 60 | `OP1032_f18e_PV_MS21_f18c_Queen1` | `OP1032_f18e_Queen1` | `BP_OP1032_f18e_CP_Ally_C` |
| 021 | `PV_f18e_Queen02` | QUEEN 2 | 60 | `OP1032_f18e_PV_MS21_f18c_Queen2` | `OP1032_f18e_Queen2` | `BP_OP1032_f18e_CP_Ally_C` |
| 022 | `e767_common` | E-767 | 155 | `OP0005_e767_Ally_MS22` | `OP0005_e767_Ally_MS22` | `BP_OP0005_e767_CP_Ally_MS22_C` |
| 022 | `free_Ally_common` | FRIGATE | 75 | `VE016_free_Ally_01` | `VE016_free_Ally` | `BP_VE016_free_CP_Ally_C` |
| 022 | `free_Ally_mk110` | NAVAL GUN | 20 | `VE016_free_mk110_Ally_01` | `VE016_free_mk110_Ally` | `BP_VE016_free_mk110_CP_Ally_C` |
| 022 | `free_Ally_mk46_R` | AA GUN | 20 | `VE016_free_mk46_R_Ally_01` | `VE016_free_mk46_R_Ally` | `BP_VE016_free_mk46_01_CPBase_Ally_C` |
| 022 | `free_Ally_mk46_L` | AA GUN | 20 | `VE016_free_mk46_L_Ally_01` | `VE016_free_mk46_L_Ally` | `BP_VE016_free_mk46_02_CPBase_Ally_C` |
| 024 | `f18c_Ally` | F/A-18C | 57 | `OP1007_f18c_Ally` | `OP1007_f18c_Ally` | `BP_OP1007_f18c_CP_Ally_C` |
| 024 | `f14d_Ally_MS24` | F-14D | 60 | `OP1023_f14d_Ally_MS24` | `OP1023_f14d_Ally` | `BP_OP1023_f14d_CP_Ally_C` |
| 024 | `ah64_common` | AH-64 | 35 | `OP0020_ah64_Ally_01` | `OP0020_ah64_Ally` | `BP_OP0020_ah64_CP_Ally_C` |
| 024 | `ch47_Ally` | CH-47 | 200 | `OP0021_ch47_Ally_01` | `OP0021_ch47_Ally` | `BP_OP0021_ch47_Cp_Ally_C` |
| 024 | `ch47_Ally_MS24_Valentine` | VALENTINE | 200 | `OP0021_ch47_Ally_MS24_Valentine` | `OP0021_ch47_Ally_MS24_Valentine` | `BP_OP0021_ch47_Cp_Ally_C` |
| 024 | `wasp_Ally` | ASSAULT SHIP | 155 | `VE023_wasp_Ally_01` | `VE023_wasp_Ally` | `BP_VE023_wasp_CP_Ally_C` |
| 024 | `m1a2_Ally_MS24_Valentine` | VALENTINE | 55 | `GR010_m1a2_Ally_MS24_Valentine` | `GR010_m1a2_Ally_MS24_Valentine` | `BP_GR010_m1a2_CP_Ally_C` |
| 024 | `m1a2_Ally_MS24_Bruiser` | BRUISER | 55 | `GR010_m1a2_Ally_MS24_Bruiser` | `GR010_m1a2_Ally_MS24_Bruiser` | `BP_GR010_m1a2_CP_Ally_C` |
| 024 | `stry_Ally_MS24_Bruiser` | BRUISER | 20 | `GR013_stry_Ally_MS24_Bruiser` | `GR013_stry_Ally_MS24_Bruiser` | `BP_GR013_stry_CP_Ally_C` |
| 024 | `msta_Ally_MS24_Bruiser` | BRUISER | 20 | `GR018_msta_Ally_MS24_Bruiser` | `GR018_msta_Ally_MS24_Bruiser` | `BP_GR018_msta_CP_C` |
| 024 | `trkc_Ally_MS24_Valentine` | VALENTINE | 15 | `GR024_trkc_Ally_MS24_Valentine` | `GR024_trkc_Ally_MS24_Valentine` | `BP_GR024_trkc_CP_C` |
| 024 | `trkc_Ally_MS24_Bruiser` | BRUISER | 15 | `GR024_trkc_Ally_MS24_Bruiser` | `GR024_trkc_Ally_MS24_Bruiser` | `BP_GR024_trkc_CP_C` |
| 024 | `hmwv_Ally` | HMMWV | 100 | `GR030_hmwv_Ally_01` | `GR030_hmwv_Ally` | `BP_GR030_hmwv_CP_Ally_C` |
| 024 | `hmwv_Ally_MS24_Valentine` | VALENTINE | 100 | `GR030_hmwv_Ally_MS24_Valentine` | `GR030_hmwv_Ally_MS24_Valentine` | `BP_GR030_hmwv_CP_Ally_C` |
| 024 | `hmwv_Ally_MS24_Bruiser` | BRUISER | 100 | `GR030_hmwv_Ally_MS24_Bruiser` | `GR030_hmwv_Ally_MS24_Bruiser` | `BP_GR030_hmwv_CP_Ally_C` |
| 025day1 | `m1a2_ms25day1_Alpha` | TANK | 500 | `GR010_m1a2_Ally_MS24_Alpha` | `GR010_m1a2_Ally` | `BP_GR010_m1a2_CP_Ally_C` |
| 025day1 | `m1a2_ms25day1_Bravo` | TANK | 500 | `GR010_m1a2_Ally_MS24_Bravo` | `GR010_m1a2_Ally` | `BP_GR010_m1a2_CP_Ally_C` |
| 025day1 | `m1a2_ms25day1_Charley` | TANK | 500 | `GR010_m1a2_Ally_MS24_Charley` | `GR010_m1a2_Ally` | `BP_GR010_m1a2_CP_Ally_C` |
| 025day1 | `stry_ms25day1_Alpha` | APC | 500 | `GR013_stry_Ally_MS25day1_Alpha` | `GR013_stry_Ally` | `BP_GR013_stry_CP_Ally_C` |
| 025day1 | `stry_ms25day1_Bravo` | APC | 615 | `GR013_stry_Ally_MS25day1_Bravo` | `GR013_stry_Ally` | `BP_GR013_stry_CP_Ally_C` |
| 025day1 | `stry_ms25day1_Charley` | APC | 615 | `GR013_stry_Ally_MS25day1_Charley` | `GR013_stry_Ally` | `BP_GR013_stry_CP_Ally_C` |
| 025day1 | `lcac_ms25day1_Alpha` | LCAC | 500 | `VE014_lcac_Ally_MS25day1_Alpha` | `VE014_lcac_Ally` | `BP_VE014_lcac_CP_Ally_C` |
| 025day1 | `lcac_ms25day1_Bravo` | LCAC | 500 | `VE014_lcac_Ally_MS25day1_Bravo` | `VE014_lcac_Ally` | `BP_VE014_lcac_CP_Ally_C` |
| 025day1 | `lcac_ms25day1_Charley` | LCAC | 500 | `VE014_lcac_Ally_MS25day1_Charley` | `VE014_lcac_Ally` | `BP_VE014_lcac_CP_Ally_C` |
| 025day1 | `lcac_Ally` | LCAC | 500 | `VE014_lcac_Ally_01` | `VE014_lcac_Ally` | `BP_VE014_lcac_CP_Ally_C` |
| 025day2 | `a10c_Ally_01` | A-10C | 110 | `OP1001_a10c_Ally_01` | `OP1001_a10c_Ally` | `BP_OP1001_a10c_CP_Ally_C` |
| 025day2 | `f18c_Ally` | F/A-18C | 57 | `OP1007_f18c_Ally` | `OP1007_f18c_Ally` | `BP_OP1007_f18c_CP_Ally_C` |
| 025day2 | `m1a2_MS25day2` | TANK | 130 | `GR010_m1a2_MS25day2` | `GR010_m1a2_Ally` | `BP_GR010_m1a2_CP_Ally_C` |
| 025day2 | `stry_Ally_MS25day2` | APC | 135 | `GR013_stry_Ally_MS25day2` | `GR013_stry_Ally_MS25day2_Echo` | `BP_GR013_stry_CP_Ally_C` |
| 025day2 | `aegs_Ally_MS25day2` | AEGIS | 155 | `VE002_aegs_Ally_MS25day2` | `VE002_aegs_Ally` | `BP_VE002_aegs_CP_Ally_C` |
| 025day2 | `aegs_Ally_MS25day2_Fearless` | FEARLESS | 155 | `VE002_aegs_Ally_MS25day2_Fearless` | `VE002_aegs_Ally_MS25day2_Fearless` | `BP_VE002_aegs_CP_Ally_C` |
| 025day2 | `aegs_Ally_MS25day2_Willing` | WILLING | 155 | `VE002_aegs_Ally_MS25day2_Willing` | `VE002_aegs_Ally_MS25day2_Willing` | `BP_VE002_aegs_CP_Ally_C` |
| 025day2 | `aegs_Ally_MS25day2_Redcap` | REDCAP | 155 | `VE002_aegs_Ally_MS25day2_Redcap` | `VE002_aegs_Ally_MS25day2_Redcap` | `BP_VE002_aegs_CP_Ally_C` |
| 025day2 | `aegs_mk45_aagun_Ally_MS25day2` | AA GUN | 20 | `VE002_aegs_mk45_aagun_Ally_MS25day2` | `VE002_aegs_mk45_Ally` | `BP_VE002_aegs_mk45_CP_Ally_C` |
| 025day2 | `aegs_mk45_artillery_Ally_MS25day2` | NAVAL GUN | 20 | `VE002_aegs_mk45_artillery_Ally_MS25day2` | `VE002_aegs_artillery_Ally` | `BP_VE002_artillery_CP_Ally_C` |
| 025day2 | `aegs_mk15_Ally_MS25day2` | CIWS | 20 | `VE002_aegs_mk15_Ally_MS25day2` | `VE002_aegs_mk15_Ally` | `BP_VE002_aegs_mk15_01_CP_Ally_C` |
| 025day2 | `aegs_mk41_Ally_MS25day2` | VLS | 20 | `VE002_aegs_mk41_Ally_MS25day2` | `VE002_aegs_mk41_Ally` | `BP_VE002_aegs_mk41_CP_Ally_C` |
| 025day2 | `free_Ally_MS25day2` | FRIGATE | 75 | `VE016_free_Ally_MS25day2` | `VE016_free_Ally` | `BP_VE016_free_CP_Ally_C` |
| 025day2 | `free_mk110_Ally_MS25day2` | NAVAL GUN | 20 | `VE016_free_mk110_Ally_MS25day2` | `VE016_free_mk110_Ally` | `BP_VE016_free_mk110_CP_Ally_C` |
| 025day2 | `free_mk46_R_Ally_MS25day2` | AA GUN | 20 | `VE016_free_mk46_R_Ally_MS25day2` | `VE016_free_mk46_R_Ally` | `BP_VE016_free_mk46_01_CPBase_Ally_C` |
| 025day2 | `free_mk46_L_Ally_MS25day2` | AA GUN | 20 | `VE016_free_mk46_L_Ally_MS25day2` | `VE016_free_mk46_L_Ally` | `BP_VE016_free_mk46_02_CPBase_Ally_C` |
| 026 | `f18c_Ally_ms26` | F/A-18C | 57 | `OP1007_f18c_Ally_MS26` | `OP1007_f18c_Ally` | `BP_OP1007_f18c_CP_Ally_C` |
| 026 | `aegs_Ally_ms26` | AEGIS | 155 | `VE002_aegs_Ally_MS26` | `VE002_aegs_Ally` | `BP_VE002_aegs_CP_Ally_C` |
| 026 | `aegs_Ally_ms26_Redemption` | REDEMPTION | 155 | `VE002_aegs_Ally_MS26_Redemption` | `VE002_aegs_Ally_MS26_Redemption` | `BP_VE002_aegs_CP_Ally_C` |
| 026 | `aegs_Ally_ms26_Endymion` | ENDYMION | 155 | `VE002_aegs_Ally_MS26_Endymion` | `VE002_aegs_Ally_MS26_Endymion` | `BP_VE002_aegs_CP_Ally_C` |
| 026 | `aegs_Ally_ms26_Repulse` | AEGIS | 155 | `VE002_aegs_Ally_MS26_Repulse` | `VE002_aegs_Ally_MS26_Repulse` | `BP_VE002_aegs_CP_Ally_C` |
| 026 | `aegs_mk45_aagun_Ally_ms26` | AA GUN | 20 | `VE002_aegs_mk45_aagun_Ally_MS26` | `VE002_aegs_mk45_Ally` | `BP_VE002_aegs_mk45_CP_Ally_C` |
| 026 | `aegs_mk45_artillery_Ally_ms26` | NAVAL GUN | 20 | `VE002_aegs_mk45_artillery_Ally_MS26` | `VE002_aegs_artillery_Ally` | `BP_VE002_artillery_CP_Ally_C` |
| 026 | `aegs_mk15_Ally_ms26` | CIWS | 20 | `VE002_aegs_mk15_Ally_MS26` | `VE002_aegs_mk15_Ally` | `BP_VE002_aegs_mk15_01_CP_Ally_C` |
| 026 | `aegs_mk41_Ally_ms26` | VLS | 20 | `VE002_aegs_mk41_Ally_MS26` | `VE002_aegs_mk41_Ally` | `BP_VE002_aegs_mk41_CP_Ally_C` |
| 026 | `maya_Ally_ms26` | DESTROYER | 115 | `VE018_maya_Ally_MS26` | `VE018_maya_Ally` | `BP_VE018_maya_CP_Ally_C` |
| 026 | `maya_Ally_ms26_Hobart` | HOBART | 115 | `VE018_maya_Ally_MS26_Hobart` | `VE018_maya_Ally_MS26_Hobart` | `BP_VE018_maya_CP_Ally_C` |
| 026 | `maya_Ally_ms26_Navantia` | NAVANTIA | 115 | `VE018_maya_Ally_MS26_Navantia` | `VE018_maya_Ally_MS26_Navantia` | `BP_VE018_maya_CP_Ally_C` |
| 026 | `maya_Ally_ms26_Phaeton` | PHAETON | 115 | `VE018_maya_Ally_MS26_Phaeton` | `VE018_maya_Ally_MS26_Phaeton` | `BP_VE018_maya_CP_Ally_C` |
| 026 | `maya_Ally_ms26_Acteon` | DESTROYER | 115 | `VE018_maya_Ally_MS26_Acteon` | `VE018_maya_Ally_MS26_Acteon` | `BP_VE018_maya_CP_Ally_C` |
| 026 | `maya_mk45_Ally_ms26` | NAVAL GUN | 20 | `VE018_maya_mk45_Ally_MS26` | `VE018_maya_mk45_Ally` | `BP_VE018_maya_mk45_CP_Ally_C` |
| 026 | `maya_mk15_Ally_ms26` | AA GUN | 20 | `VE018_maya_mk15_Ally_MS26` | `VE018_maya_mk15_Ally` | `BP_VE018_maya_mk15_02_CP_Ally_C` |
| 026 | `wasp_Ally_ms26_Dauntless` | DAUNTLESS | 155 | `VE023_wasp_Ally_MS26_Dauntless` | `VE023_wasp_Ally_MS26_Dauntless` | `BP_VE023_wasp_CP_Ally_C` |
| 026 | `wasp_Ally_ms26_Afanc` | AFANC | 155 | `VE023_wasp_Ally_MS26_Afanc` | `VE023_wasp_Ally_MS26_Afanc` | `BP_VE023_wasp_CP_Ally_C` |
| 026 | `wasp_Ally_ms26_Catoblepas` | ASSAULT SHIP | 155 | `VE023_wasp_Ally_MS26_Catoblepas` | `VE023_wasp_Ally` | `BP_VE023_wasp_CP_Ally_C` |
| 027 | `VE018_maya_Ally_MS27_Catoblepas` | DESTROYER | 115 | `VE018_maya_Ally_01` | `VE018_maya_Ally` | `BP_VE018_maya_CP_Ally_C` |
| 027 | `VE018_maya_mk45_Ally_MS27` | NAVAL GUN | 20 | `VE018_maya_mk45_Ally_01` | `VE018_maya_mk45_Ally` | `BP_VE018_maya_mk45_CP_Ally_C` |
| 027 | `VE018_maya_mk15_Ally_MS27` | AA GUN | 20 | `VE018_maya_mk15_Ally_01` | `VE018_maya_mk15_Ally` | `BP_VE018_maya_mk15_02_CP_Ally_C` |
| 027 | `VE002_aegs_01` | AEGIS | 155 | `VE002_aegs_Ally_01` | `VE002_aegs_Ally` | `BP_VE002_aegs_CP_Ally_C` |
| 027 | `VE002_aegs_mk45_aagun_Ally_01` | AA GUN | 20 | `VE002_aegs_mk45_aagun_Ally_01` | `VE002_aegs_mk45_Ally` | `BP_VE002_aegs_mk45_CP_Ally_C` |
| 027 | `VE002_aegs_mk45_artillery_Ally_01` | NAVAL GUN | 20 | `VE002_aegs_mk45_artillery_Ally_01` | `VE002_aegs_artillery_Ally` | `BP_VE002_artillery_CP_Ally_C` |
| 027 | `VE002_aegs_mk15_Ally_01` | CIWS | 20 | `VE002_aegs_mk15_Ally_01` | `VE002_aegs_mk15_Ally` | `BP_VE002_aegs_mk15_01_CP_Ally_C` |
| 027 | `VE002_aegs_mk41_Ally_01` | VLS | 20 | `VE002_aegs_mk41_Ally_01` | `VE002_aegs_mk41_Ally` | `BP_VE002_aegs_mk41_CP_Ally_C` |
| 027 | `OP1022_f16c_MS27` | F-16C | 10 | `OP1022_f16c_MS27` | `OP1022_f16c_Ally` | `BP_OP1022_f16c_CP_Ally_C` |
| 027 | `VE023_wasp_Ally_MS27_Catoblepas` | CATOBLEPAS | 155 | `VE023_wasp_Ally_MS27_Catoblepas` | `VE023_wasp_Ally_MS27_Catoblepas` | `BP_VE023_wasp_CP_Ally_C` |
| 027 | `VE018_maya_Ally_MS26_Phaeton` | PHAETON | 115 | `VE018_maya_Ally_MS26_Phaeton` | `VE018_maya_Ally_MS26_Phaeton` | `BP_VE018_maya_CP_Ally_C` |
| 027 | `VE018_maya_Ally_MS26_Acteon` | DESTROYER | 115 | `VE018_maya_Ally_MS26_Acteon` | `VE018_maya_Ally_MS26_Acteon` | `BP_VE018_maya_CP_Ally_C` |
| 028 | `f15c_Shark` | SHARK | 70 | `OP1004_f15c_Ally_Shark_01` | `OP1004_f15c_Ally_Shark` | `BP_OP1004_f15c_CP_Shark_C` |
| 028 | `f15c_Shark02` | SHARK | 70 | `OP1004_f15c_Ally_Shark_02` | `OP1004_f15c_Ally_Shark` | `BP_OP1004_f15c_CP_Shark_C` |
| 028 | `f15c_Shark03` | SHARK | 70 | `OP1004_f15c_Ally_Shark_03` | `OP1004_f15c_Ally_Shark` | `BP_OP1004_f15c_CP_Shark_C` |
| 028 | `f15c_Shark04` | SHARK | 70 | `OP1004_f15c_Ally_Shark_04` | `OP1004_f15c_Ally_Shark` | `BP_OP1004_f15c_CP_Shark_C` |
| 028 | `f15c_107sq` | 107 SQ | 70 | `OP1004_f15c_Ally_107sq` | `OP1004_f15c_Ally_107sq` | `BP_OP1004_f15c_CP_Ally_C` |
| 028 | `f15c_105sq` | 105 SQ | 70 | `OP1004_f15c_Ally_105sq` | `OP1004_f15c_Ally_105sq` | `BP_OP1004_f15c_CP_Ally_C` |
| 028 | `f16c_200sq` | 200 SQ | 55 | `OP1022_f16c_Ally_200sq` | `OP1022_f16c_Ally_200sq` | `BP_OP1022_f16c_CP_200th_C` |
| 028 | `f16c_301sq` | 301 SQ | 55 | `OP1022_f16c_Ally_301sq` | `OP1022_f16c_Ally_301sq` | `BP_OP1022_f16c_CP_Ally_C` |
| 028 | `f16c_Singleton` | SINGLETON | 55 | `OP1022_f16c_Ally_Singleton` | `OP1022_f16c_Ally_Singleton` | `BP_OP1022_f16c_CP_Ally_C` |
| 028 | `f16c_Magnolia` | MAGNOLIA | 55 | `OP1022_f16c_Ally_Magnolia` | `OP1022_f16c_Ally_Magnolia` | `BP_OP1022_f16c_CP_Ally_C` |
| 028 | `f18c_110sq` | 110 SQ | 57 | `OP1007_f18c_Ally_110sq` | `OP1007_f18c_Ally_110sq` | `BP_OP1007_f18c_CP_Ally_C` |
| 028 | `f18c_Banker` | BANKER | 57 | `OP1007_f18c_Ally_Banker` | `OP1007_f18c_Ally_Banker` | `BP_OP1007_f18c_CP_Bunker_C` |
| 028 | `e767_ally` | MAGNOLIA | 155 | `OP0005_e767_MS28` | `OP0005_e767_Ally_Magnolia` | `BP_OP0005_e767_CP_Ally_C` |
| 028 | `wasp_Ally` | DAUNTLESS | 155 | `VE023_wasp_Ally_MS26_Dauntless` | `VE023_wasp_Ally_MS26_Dauntless` | `BP_VE023_wasp_CP_Ally_C` |
| 030 | `aegs_Allu_ms30` | RANGER | 155 | `VE002_aegs_Ally_MS30_Ranger` | `VE002_aegs_Ally_MS30_Ranger` | `BP_VE002_aegs_CP_Ally_C` |

## 任務行・NPC IDのみに命名根拠がある42行

| 任務 | 任務行キー | 表示名 | HP | NPC ID | モデルID | Blueprint |
| --- | --- | --- | ---: | --- | --- | --- |
| 003 | `edrne_Ally` | ENDURANCE | 235 | `VE024_edrne_MS03` | `VE024_edrne_MS03` | `BP_VE024_edrne_CP_MS03_C` |
| 004 | `aegs_damage_Ally` | （表示名未解決） | 35 | `BP_BPD_aegs_DAM01_01` | `BP_BPD_aegs_DAM01` | `BP_BPD_ages_DAM01_C` |
| 006 | `av8b_Ally` | JACKPOT | 75 | `OP0022_av8b_Ally_01` | `OP0022_av8b_Jackpot` | `BP_OP0022_av8b_CP_Jackpot_C` |
| 009 | `av8b_Ally` | JACKPOT | 75 | `OP0022_av8b_Ally_01` | `OP0022_av8b_Jackpot` | `BP_OP0022_av8b_CP_Jackpot_C` |
| 009 | `OP0022_av8b_Ally_01` | JACKPOT | 75 | `OP0022_av8b_Ally_01` | `OP0022_av8b_Jackpot` | `BP_OP0022_av8b_CP_Jackpot_C` |
| 010 | `av8b_Ally01` | JACKPOT | 10 | `OP0022_av8b_Ally_01` | `OP0022_av8b_Jackpot` | `BP_OP0022_av8b_CP_Jackpot_C` |
| 010 | `f18c_Ally` | F/A-18C | 7 | `OP1007_f18c_01` | `OP1007_f18c` | `BP_OP1007_f18c_CP_C` |
| 020 | `su33_Ally` | SHILAGE VOL | 65 | `OP1030_su33_MS20` | `OP1030_su33_MS20` | `BP_OP1030_su33_CP_Avenir_MS20_C` |
| 022 | `f18e_common` | F/A-18E | 60 | `OP1032_f18e_Ally_MS22` | `OP1032_f18e` | `BP_OP1032_f18e_CP_C` |
| 024 | `av8b_Ally` | JACKPOT | 75 | `OP0022_av8b_Ally_01` | `OP0022_av8b_Jackpot` | `BP_OP0022_av8b_CP_Jackpot_C` |
| 024 | `free_Ally` | FRIGATE | 75 | `VE016_free_01` | `VE016_free` | `BP_VE016_free_CP_C` |
| 024 | `free_mk110_Ally` | NAVAL GUN | 20 | `VE016_free_mk110_01` | `VE016_free_mk110` | `BP_VE016_free_mk110_CP_C` |
| 024 | `free_mk46R_Ally` | AA GUN | 20 | `VE016_free_mk46_R_01` | `VE016_free_mk46_R` | `BP_VE016_free_mk46_01_CP_C` |
| 024 | `free_mk46L_Ally` | AA GUN | 20 | `VE016_free_mk46_L_01` | `VE016_free_mk46_L` | `BP_VE016_free_mk46_02_CP_C` |
| 024 | `gepa_Ally` | AA GUN | 20 | `GR002_gepa_01` | `GR002_gepa` | `BP_GR002_gepa_CP_C` |
| 024 | `m1a2_Ally` | TANK | 55 | `GR010_m1a2_01` | `GR010_m1a2` | `BP_GR010_m1a2_CP_C` |
| 024 | `stry_Ally` | APC | 20 | `GR013_stry_01` | `GR013_stry` | `BP_GR013_stry_CP_C` |
| 024 | `msta_Ally` | HOWITZER | 20 | `GR018_msta_01` | `GR018_msta` | `BP_GR018_msta_CP_C` |
| 024 | `m142_Ally` | RKT LAUNCHER | 20 | `GR019_m142_01` | `GR019_m142` | `BP_GR019_m142_CP_C` |
| 024 | `trkc_Ally` | TRUCK | 15 | `GR024_trkc_01` | `GR024_trkc` | `BP_GR024_trkc_CP_C` |
| 025day1 | `av8b_ally` | JACKPOT | 75 | `OP0022_av8b_Ally_01` | `OP0022_av8b_Jackpot` | `BP_OP0022_av8b_CP_Jackpot_C` |
| 025day1 | `f18c_ally` | F/A-18C | 57 | `OP1007_f18c_01` | `OP1007_f18c` | `BP_OP1007_f18c_CP_C` |
| 025day2 | `av8b_jackpot` | JACKPOT | 75 | `OP0022_av8b_Ally_01` | `OP0022_av8b_Jackpot` | `BP_OP0022_av8b_CP_Jackpot_C` |
| 026 | `av8b_Ally01_ms26` | JACKPOT | 75 | `OP0022_av8b_Ally_01_MS26` | `OP0022_av8b_Jackpot` | `BP_OP0022_av8b_CP_Jackpot_C` |
| 027 | `OP0022_av8b_Ally_01_MS27` | JACKPOT | 10 | `OP0022_av8b_Ally_01_MS27` | `OP0022_av8b_Jackpot` | `BP_OP0022_av8b_CP_Jackpot_C` |
| 027 | `OP0022_av8b_Ally_02_MS27` | JACKPOT | 10 | `OP0022_av8b_Ally_01_MS27` | `OP0022_av8b_Jackpot` | `BP_OP0022_av8b_CP_Jackpot_C` |
| 027 | `OP0022_av8b_Ally_03_MS27` | JACKPOT | 10 | `OP0022_av8b_Ally_01_MS27` | `OP0022_av8b_Jackpot` | `BP_OP0022_av8b_CP_Jackpot_C` |
| 027 | `OP0022_av8b_Ally_04_MS27` | JACKPOT | 10 | `OP0022_av8b_Ally_01_MS27` | `OP0022_av8b_Jackpot` | `BP_OP0022_av8b_CP_Jackpot_C` |
| 028 | `av8b_ally01` | JACKPOT | 75 | `OP0022_av8b_Ally_01` | `OP0022_av8b_Jackpot` | `BP_OP0022_av8b_CP_Jackpot_C` |
| 028 | `f04e_ally` | FLYING MOLE 1/BRAND | 60 | `OP1003_f04e_Ally_Mole_01` | `OP1003_f04e_Mole_01` | `BP_OP1003_f04e_CP_FM_C` |
| 028 | `f04e_ally_Mole02` | FLYING MOLE 2 | 60 | `OP1003_f04e_Ally_Mole_02` | `OP1003_f04e_Mole_02` | `BP_OP1003_f04e_CP_FM_C` |
| 028 | `f04e_ally_Mole03` | FLYING MOLE 3 | 60 | `OP1003_f04e_Ally_Mole_03` | `OP1003_f04e_Mole_03` | `BP_OP1003_f04e_CP_FM_C` |
| 028 | `f04e_ally_Mole04` | FLYING MOLE 4 | 60 | `OP1003_f04e_Ally_Mole_04` | `OP1003_f04e_Mole_04` | `BP_OP1003_f04e_CP_FM_C` |
| 028 | `f15c_ally` | F-15C | 70 | `OP1004_f15c_01` | `OP1004_f15c` | `BP_OP1004_f15c_CP_C` |
| 028 | `su33_ally` | SHILAGE VOL | 65 | `OP1030_su33_MS20` | `OP1030_su33_MS20` | `BP_OP1030_su33_CP_Avenir_MS20_C` |
| 028 | `f16c_ally` | F-16C | 55 | `OP1022_f16c_01` | `OP1022_f16c` | `BP_OP1022_f16c_CP_C` |
| 028 | `f16c_Viride` | GREEN 1 | 55 | `OP1022_f16c_Ally_Viride_01` | `OP1022_f16c_Viride_01` | `BP_OP1022_f16c_CP_Green_C` |
| 028 | `f16c_Viride02` | GREEN 2 | 55 | `OP1022_f16c_Ally_Viride_02` | `OP1022_f16c_Viride_02` | `BP_OP1022_f16c_CP_Green_C` |
| 028 | `f18c_ally` | F/A-18C | 57 | `OP1007_f18c_01` | `OP1007_f18c` | `BP_OP1007_f18c_CP_C` |
| 028 | `rflm_ally` | RAFALE M | 60 | `OP1014_rflm_Ally_Savia` | `OP1014_rflm_Savia` | `BP_OP1014_rflm_CP_Savia_C` |
| 028 | `gepa_ally` | AA GUN | 20 | `GR002_gepa_01` | `GR002_gepa` | `BP_GR002_gepa_CP_C` |
| 028 | `avng_ally` | SAM | 20 | `GR005_avng_01` | `GR005_avng` | `BP_GR005_avng_CP_C` |

## 残る42行の確認結果

42行すべての任務行→NPC→モデル→Blueprint名を再照合し、NPC IDにAllyを含む21行と、任務行キーのみにAllyを含む21行へ分けた。参照先の欠落はなかった。確認した任務・NPC・モデルの抽出プロパティには、所属を直接確定できるTeam／Faction／Friend等のフィールドはなかった。Blueprint名と参照先の照合であり、これらNPC Blueprintの実装や任務イベントを解析した結果ではない。

### 参照の比較で確認したこと

- JACKPOTの13任務行は、3つのAlly名のNPC定義から同じモデル `OP0022_av8b_Jackpot` を参照する。モデル名にAllyがなくても、NPC側に識別情報がある。
- M28のFLYING MOLE 4行・GREEN 2行・RAFALE M 1行も、Ally名のNPCを経由する。M22の `f18e_common` は行名がcommonだがNPCは `OP1032_f18e_Ally_MS22`。
- M24の `m1a2_Ally` とM5・M9・M10・M25の `m1a2_common` は同じNPC `GR010_m1a2_01` を参照する。M10・M25・M28の `f18c_Ally` 系行と他任務の通常行も `OP1007_f18c_01` を共有する。Ally行の分類をNPC単位で他の行へ広げない。
- M24の `free_Ally` は `VE016_free_01` を参照し、その `ChildNPCId` 3件が同任務の `free_mk110_Ally`・`free_mk46R_Ally`・`free_mk46L_Ally` と対応する。艦船と部位の参照関係が確認できる。
- M3の `edrne_Ally`（ENDURANCE）は6件の `ChildNPCId` を持つが、その子NPCを直接参照する任務行は同梱の全任務表に見つからなかった。この6件は199行に含まれず、部位を取り込む際に、本体のEXCLUDED分類との対応を確認する対象とする。

### 分類の提案と限界

当初の42行を味方用の任務行として個別指定する案を提示した。後続のパラメータ比較により2行、最低HPの設定を理由に11行を掲載対象外とし、EXCLUDEDに分類する。残る29行も確認待ちとして暫定EXCLUDEDとする。共通NPC・モデルの全参照先を除外する方針ではない。名称だけでは任務イベントの実際の所属・出現は確定できず、命名に手掛かりがないM25の `m1a2_common`・`stry_common` は別途EXCLUDEDとする承認を得たが、所属は引き続き未確認とする。

### NPC IDにも根拠がある21行

| 任務 | 行キー | 表示名 | NPC ID |
| --- | --- | --- | --- |
| 006 | `av8b_Ally` | JACKPOT | `OP0022_av8b_Ally_01` |
| 009 | `av8b_Ally` | JACKPOT | `OP0022_av8b_Ally_01` |
| 009 | `OP0022_av8b_Ally_01` | JACKPOT | `OP0022_av8b_Ally_01` |
| 010 | `av8b_Ally01` | JACKPOT | `OP0022_av8b_Ally_01` |
| 022 | `f18e_common` | F/A-18E | `OP1032_f18e_Ally_MS22` |
| 024 | `av8b_Ally` | JACKPOT | `OP0022_av8b_Ally_01` |
| 025day1 | `av8b_ally` | JACKPOT | `OP0022_av8b_Ally_01` |
| 025day2 | `av8b_jackpot` | JACKPOT | `OP0022_av8b_Ally_01` |
| 026 | `av8b_Ally01_ms26` | JACKPOT | `OP0022_av8b_Ally_01_MS26` |
| 027 | `OP0022_av8b_Ally_01_MS27` | JACKPOT | `OP0022_av8b_Ally_01_MS27` |
| 027 | `OP0022_av8b_Ally_02_MS27` | JACKPOT | `OP0022_av8b_Ally_01_MS27` |
| 027 | `OP0022_av8b_Ally_03_MS27` | JACKPOT | `OP0022_av8b_Ally_01_MS27` |
| 027 | `OP0022_av8b_Ally_04_MS27` | JACKPOT | `OP0022_av8b_Ally_01_MS27` |
| 028 | `av8b_ally01` | JACKPOT | `OP0022_av8b_Ally_01` |
| 028 | `f04e_ally` | FLYING MOLE 1/BRAND | `OP1003_f04e_Ally_Mole_01` |
| 028 | `f04e_ally_Mole02` | FLYING MOLE 2 | `OP1003_f04e_Ally_Mole_02` |
| 028 | `f04e_ally_Mole03` | FLYING MOLE 3 | `OP1003_f04e_Ally_Mole_03` |
| 028 | `f04e_ally_Mole04` | FLYING MOLE 4 | `OP1003_f04e_Ally_Mole_04` |
| 028 | `f16c_Viride` | GREEN 1 | `OP1022_f16c_Ally_Viride_01` |
| 028 | `f16c_Viride02` | GREEN 2 | `OP1022_f16c_Ally_Viride_02` |
| 028 | `rflm_ally` | RAFALE M | `OP1014_rflm_Ally_Savia` |

### 任務行キーだけに根拠がある21行

| 任務 | 行キー | 表示名 | NPC ID |
| --- | --- | --- | --- |
| 003 | `edrne_Ally` | ENDURANCE | `VE024_edrne_MS03` |
| 004 | `aegs_damage_Ally` | （表示名未解決） | `BP_BPD_aegs_DAM01_01` |
| 010 | `f18c_Ally` | F/A-18C | `OP1007_f18c_01` |
| 020 | `su33_Ally` | SHILAGE VOL | `OP1030_su33_MS20` |
| 024 | `free_Ally` | FRIGATE | `VE016_free_01` |
| 024 | `free_mk110_Ally` | NAVAL GUN | `VE016_free_mk110_01` |
| 024 | `free_mk46R_Ally` | AA GUN | `VE016_free_mk46_R_01` |
| 024 | `free_mk46L_Ally` | AA GUN | `VE016_free_mk46_L_01` |
| 024 | `gepa_Ally` | AA GUN | `GR002_gepa_01` |
| 024 | `m1a2_Ally` | TANK | `GR010_m1a2_01` |
| 024 | `stry_Ally` | APC | `GR013_stry_01` |
| 024 | `msta_Ally` | HOWITZER | `GR018_msta_01` |
| 024 | `m142_Ally` | RKT LAUNCHER | `GR019_m142_01` |
| 024 | `trkc_Ally` | TRUCK | `GR024_trkc_01` |
| 025day1 | `f18c_ally` | F/A-18C | `OP1007_f18c_01` |
| 028 | `f15c_ally` | F-15C | `OP1004_f15c_01` |
| 028 | `su33_ally` | SHILAGE VOL | `OP1030_su33_MS20` |
| 028 | `f16c_ally` | F-16C | `OP1022_f16c_01` |
| 028 | `f18c_ally` | F/A-18C | `OP1007_f18c_01` |
| 028 | `gepa_ally` | AA GUN | `GR002_gepa_01` |
| 028 | `avng_ally` | SAM | `GR005_avng_01` |

## 任務行名だけにAllyがある21行のパラメータ比較

ユーザーの「別行とパラメータが全く同じならFRIENDへ分類してよい。極端に大きい値なら別途検討する」という条件に基づき比較した（FRIENDは当時の分類名で、現在はEXCLUDED）。同じNPC IDを参照する別の任務行について、行キー・抽出オフセットを除く `values` 全項目を比較した。HPだけの一致を完全一致とは扱わない。

21行に正の任務HP差分はなかった。20行はモデル＋NPCの基礎HPと同値で、M10の `f18c_Ally` だけ57から7へ減る。全21行の任務耐性IDは `NPC_WPDur_000` でNPC定義の耐性IDも同じ。最低HPの生値 `MinHealth` は11行で1、10行で0だった。

完全一致したM25の `f18c_ally` とM28の `gepa_ally` の2行をEXCLUDEDへ追加する。同じパラメータの比較先行はEXCLUDEDへ変更しない。残る19行は全項目一致の条件を満たさないが、うち11行は下記の最低HP設定を理由に除外する。残る8行と、NPC IDにもAllyがある21行を合わせた29行は所属・掲載可否の確認待ちとして暫定EXCLUDEDとする。

M24のFRIGATE本体はHP75、艦載砲3基は各20で、4行とも `MinHealth = 1`。同じNPC IDを参照する別の任務行はないため、「全く同じ別行がある」とは確認できない。HPが特別に増量されているわけではないが、最低HP設定を無視して通常の撃破計算と同一視しない。実際の出現・所属・最低HP設定のイベント変更は未確認。

| 任務 | 行キー | 基礎HP | 任務HP差分 | MinHealth生値 | 別行との比較 |
| --- | --- | ---: | ---: | ---: | --- |
| 003 | `edrne_Ally` | 235 | 0 | 1 | 同じNPCを参照する別任務行なし |
| 004 | `aegs_damage_Ally` | 35 | 0 | 0 | 同じNPCを参照する別任務行なし |
| 010 | `f18c_Ally` | 57 | -50 | 0 | 最小差分の比較先 028 / `f18c_ally`: MaxHealthDifference, bOverrideBailoutParam |
| 020 | `su33_Ally` | 65 | 0 | 0 | 最小差分の比較先 028 / `su33_ally`: KDSId, ProvokeId, SurroundPursuitId, TargetNearDistance |
| 024 | `free_Ally` | 75 | 0 | 1 | 同じNPCを参照する別任務行なし |
| 024 | `free_mk110_Ally` | 20 | 0 | 1 | 同じNPCを参照する別任務行なし |
| 024 | `free_mk46R_Ally` | 20 | 0 | 1 | 同じNPCを参照する別任務行なし |
| 024 | `free_mk46L_Ally` | 20 | 0 | 1 | 同じNPCを参照する別任務行なし |
| 024 | `gepa_Ally` | 20 | 0 | 1 | 最小差分の比較先 025day1 / `gepa_common`: EnemySearchType, MinHealth, bOverrideEnemySearchType |
| 024 | `m1a2_Ally` | 55 | 0 | 1 | 最小差分の比較先 025day1 / `m1a2_common`: MaxHealthDifference, MinHealth |
| 024 | `stry_Ally` | 20 | 0 | 1 | 最小差分の比較先 009 / `stry_common`: MinHealth |
| 024 | `msta_Ally` | 20 | 0 | 1 | 最小差分の比較先 006 / `msta_common`: MinHealth |
| 024 | `m142_Ally` | 20 | 0 | 1 | 同じNPCを参照する別任務行なし |
| 024 | `trkc_Ally` | 15 | 0 | 1 | 最小差分の比較先 018 / `trkc_common`: MinHealth |
| 025day1 | `f18c_ally` | 57 | 0 | 0 | 全項目一致: 009 / `f18c_common`、015 / `OP1007_f18c_01` |
| 028 | `f15c_ally` | 70 | 0 | 0 | 最小差分の比較先 025day2 / `f15c_common`: KDSId, KeepMinHeight, ProvokeId, SurroundPursuitId, TargetNearDistance, WeaponDurabilityId |
| 028 | `su33_ally` | 65 | 0 | 0 | 最小差分の比較先 020 / `su33_Ally`: KDSId, ProvokeId, SurroundPursuitId, TargetNearDistance |
| 028 | `f16c_ally` | 55 | 0 | 0 | 最小差分の比較先 022 / `f16c_common`: EnemySearchType, FallDownProbability, GunProbability, NormalMissileProbability |
| 028 | `f18c_ally` | 57 | 0 | 0 | 最小差分の比較先 010 / `f18c_Ally`: MaxHealthDifference, bOverrideBailoutParam |
| 028 | `gepa_ally` | 20 | 0 | 0 | 全項目一致: 005 / `gepa_common`、010 / `gepa_common` |
| 028 | `avng_ally` | 20 | 0 | 0 | 最小差分の比較先 025day1 / `avng_common`: KeepMinHeight, TargetNearDistance |

## 最低HPを持つ11行の扱い

ユーザーの指示により、上の比較表で `MinHealth = 1` となる11行をEXCLUDEDに分類する。M3の `edrne_Ally` とM24の10行が該当する。任務行の命名と最低HP設定だけで実際の所属を確定せず、同じNPCを参照する別の通常行も除外しない。旧FRIEND分類をEXCLUDEDへ改名することで、味方と断定せずに掲載対象外として保持する。

### 最低HP処理の静的な確認

- `npc_health_initialization.asm.txt` の `0x147c8ef51` は最低HPの保持先 `+0x3b8` へ書き込む。
- `npc_minimum_health.asm.txt` の `0x147c94590` は、条件分岐により1を返す経路と、保持先 `+0x3b8` の値を返す経路を持つ。
- `npc_vtables.json` のNPC仮想関数表には、`+0x928` が上の最低HP取得関数、`+0x938` が `0x147d1ce30` を指す対応がある。
- `health_modifier.asm.txt` の `0x147d1d09b` は `+0x928` を呼び、`0x147d1d0b4` でHP変化分を加算した後、最大HPとの `minss`、最低HPとの `maxss` を経てHPを設定する。

この経路では最低HPが下限として使われる。ダメージそのものを常に0にすること、味方であること、特定イベントで必ず解除されることは、この処理からは確定しない。実際の任務イベントと全ダメージ経路は未検証。

根拠: `docs/initial/ref/indexes/native/npc_health_initialization.asm.txt`、`npc_minimum_health.asm.txt`、`npc_vtables.json`、`health_modifier.asm.txt`。今回も実ゲームの実行や追加抽出は行っていない。

## 残る29行の再確認と暫定除外

2026-11-03、上記42行から全項目一致の2行と最低HP付き11行を除いた29行について、任務テーブル・NPC・モデルを再照合した。NPC IDにも `Ally` がある21行と、任務行キーだけにある8行に分かれる。全29行の `MinHealth` は0、NPCのHP差分も0。初期HPは7～75で、モデルHPに対する正の任務HP差分はない。

JACKPOTは13行あり、M10の1行とM27の4行はモデルHP75に任務差分-65が加わりHP10となる。他の8行はHP75。M10の `f18c_Ally` はHP57に任務差分-50が加わりHP7となる。残る23行には任務HP差分がない。初期HPは `reports/mission_enemy_health.json` の計算結果とも一致した。M25後半のJACKPOTだけ任務耐性IDが `None`、他28行は `NPC_WPDur_000` であり、この差を所属や撃破可否の判定には使用しない。

ユーザーの「未確定なら一旦EXCLUDED」という方針を、この29行に適用する。除外理由は所属・掲載可否の確認待ちであり、最低HP・異常なHP増量・未使用・撃破不能を根拠とするものではない。元定義と下表を保持し、掲載可否を再検討する際に参照する。今回の199行はすべてEXCLUDEDとなるが、全行を実ゲームで味方と確認したことは意味しない。

除外対象は次表の任務テーブルと行キーの組に限定する。NPC・モデル・表示名を共有する別行へ自動的に広げない。今回の候補集合に含まれないM25の `m1a2_common`・`stry_common` は、後続の個別承認により別途除外する。未確認データをすべて自動で除外する一般規則にもせず、掲載対象セルの未確認値を `?` とする既存仕様は維持する。

| 任務テーブル | 行キー | 表示名 | 初期HP | 命名上の手掛かり |
| --- | --- | --- | ---: | --- |
| `DT_NPC_Mission006` | `av8b_Ally` | JACKPOT | 75 | NPC IDにもAllyあり |
| `DT_NPC_Mission009` | `av8b_Ally` | JACKPOT | 75 | NPC IDにもAllyあり |
| `DT_NPC_Mission009` | `OP0022_av8b_Ally_01` | JACKPOT | 75 | NPC IDにもAllyあり |
| `DT_NPC_Mission010` | `av8b_Ally01` | JACKPOT | 10 | NPC IDにもAllyあり |
| `DT_NPC_Mission022` | `f18e_common` | F/A-18E | 60 | NPC IDにもAllyあり |
| `DT_NPC_Mission024` | `av8b_Ally` | JACKPOT | 75 | NPC IDにもAllyあり |
| `DT_NPC_Mission025day1` | `av8b_ally` | JACKPOT | 75 | NPC IDにもAllyあり |
| `DT_NPC_Mission025day2` | `av8b_jackpot` | JACKPOT | 75 | NPC IDにもAllyあり |
| `DT_NPC_Mission026` | `av8b_Ally01_ms26` | JACKPOT | 75 | NPC IDにもAllyあり |
| `DT_NPC_Mission027` | `OP0022_av8b_Ally_01_MS27` | JACKPOT | 10 | NPC IDにもAllyあり |
| `DT_NPC_Mission027` | `OP0022_av8b_Ally_02_MS27` | JACKPOT | 10 | NPC IDにもAllyあり |
| `DT_NPC_Mission027` | `OP0022_av8b_Ally_03_MS27` | JACKPOT | 10 | NPC IDにもAllyあり |
| `DT_NPC_Mission027` | `OP0022_av8b_Ally_04_MS27` | JACKPOT | 10 | NPC IDにもAllyあり |
| `DT_NPC_Mission028` | `av8b_ally01` | JACKPOT | 75 | NPC IDにもAllyあり |
| `DT_NPC_Mission028` | `f04e_ally` | FLYING MOLE 1/BRAND | 60 | NPC IDにもAllyあり |
| `DT_NPC_Mission028` | `f04e_ally_Mole02` | FLYING MOLE 2 | 60 | NPC IDにもAllyあり |
| `DT_NPC_Mission028` | `f04e_ally_Mole03` | FLYING MOLE 3 | 60 | NPC IDにもAllyあり |
| `DT_NPC_Mission028` | `f04e_ally_Mole04` | FLYING MOLE 4 | 60 | NPC IDにもAllyあり |
| `DT_NPC_Mission028` | `f16c_Viride` | GREEN 1 | 55 | NPC IDにもAllyあり |
| `DT_NPC_Mission028` | `f16c_Viride02` | GREEN 2 | 55 | NPC IDにもAllyあり |
| `DT_NPC_Mission028` | `rflm_ally` | RAFALE M | 60 | NPC IDにもAllyあり |
| `DT_NPC_Mission004` | `aegs_damage_Ally` | 表示名未解決（内部名 aegs_damage） | 35 | 任務行キーだけにAllyあり |
| `DT_NPC_Mission010` | `f18c_Ally` | F/A-18C | 7 | 任務行キーだけにAllyあり |
| `DT_NPC_Mission020` | `su33_Ally` | SHILAGE VOL | 65 | 任務行キーだけにAllyあり |
| `DT_NPC_Mission028` | `f15c_ally` | F-15C | 70 | 任務行キーだけにAllyあり |
| `DT_NPC_Mission028` | `su33_ally` | SHILAGE VOL | 65 | 任務行キーだけにAllyあり |
| `DT_NPC_Mission028` | `f16c_ally` | F-16C | 55 | 任務行キーだけにAllyあり |
| `DT_NPC_Mission028` | `f18c_ally` | F/A-18C | 57 | 任務行キーだけにAllyあり |
| `DT_NPC_Mission028` | `avng_ally` | SAM | 20 | 任務行キーだけにAllyあり |

確認範囲は同梱資料の静的設定。任務イベントでの生成・所属設定・実際の出現は確認しておらず、今回アプリ実装・ゲーム実行・追加抽出は行っていない。


### 8行の詳細確認後の決定

任務行キーだけに `Ally` がある8行について、ユーザーが詳細を確認し、`EXCLUDED` とする判断を承認した。対象はM4の `aegs_damage_Ally`、M10の `f18c_Ally`、M20の `su33_Ally`、M28の `f15c_ally`・`su33_ally`・`f16c_ally`・`f18c_ally`・`avng_ally`。掲載範囲の判断であり、実際の所属を確認したものではない。

「任務行キーだけ」の区分は、任務行キー・NPC ID・モデルID・Blueprint名の4項目での抽出結果を指す。SHILAGE VOLの2行は表示名キーが `ContainerAllyCallsign_Name_Shilage` であり、表示名キーにも味方用の命名がある。味方を示唆する情報が任務行キーにしか存在しないとは扱わない。

全パラメータの不一致にはAI・距離などの設定差も含まれる。これを確定数の不一致とみなさない。8行のうち任務HP差分があるのはM10のF/A-18C（57−50＝7）のみ。


## M25の通常モデルを使用する2行の除外

ユーザーの承認により、次の2行もEXCLUDEDとする。命名による候補199行とは別の対象であり、抽出件数199行自体は変更しない。除外理由は所属・掲載可否の確認待ち。任務テーブルはいずれも `DT_NPC_Mission025day1`。

| 行キー | 表示名 | NPC ID | モデルID | 基礎HP | 任務HP差分 | 初期HP | MinHealth |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: |
| `m1a2_common` | TANK | `GR010_m1a2_01` | `GR010_m1a2` | 55 | +445 | 500 | 0 |
| `stry_common` | APC | `GR013_stry_01` | `GR013_stry` | 20 | +480 | 500 | 0 |

両行のNPCのHP差分は0。任務行・NPC・モデル・Blueprint名にAllyはなく、HP500という値の一致だけで味方用定義と同じ所属・同一表示行とは判定しない。同じNPCを使う他任務の通常TANK・APCには、この除外を適用しない。

根拠: `docs/initial/ref/tables/DT_NPC_Mission025day1.json`、`DT_NPC.json`、`DT_NPC_Model.json`。静的設定とユーザーによる掲載範囲の判断であり、実際の出現・所属は未検証。

## local_002で承認された追加除外

2026-11-03、ユーザーがQUEEN・PURPLE MAGIC・ENDURANCE本体と対応部位、および内部Mission015（ゲーム内M14）のGREEN 1・2をEXCLUDEDにすることを承認した。既存の203元定義とは別の63出典を追加指定した。元の候補199行の抽出件数を書き換えるものではない。

QUEENの共通NPC出典も含め、既存22表示行をEXCLUDEDに変更。ENDURANCEの対空砲8出典は新規ID 506へ分離し、他艦の12出典は既存ID 124に残した。GREEN 1の旧呼称・敵用呼称の両定義とGREEN 2を含めて除外する方針であり、今回も実所属の確認とは区別する。

[全出典と反映結果](../../../spec/agent/complete/local_002/FRIEND_EXCLUSION_REVIEW.md)を参照。内部番号をM番号として記載していた問題は[ゲーム内番号の照合](../ui-labels/MISSION_NUMBERS.md)で訂正した。既存画面の番号表示は後続のR006修正でゲーム内番号に合わせた。内部の出典キーは維持している。
