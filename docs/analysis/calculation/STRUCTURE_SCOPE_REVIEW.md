# STRUCTURE の基本行と破壊後定義の掲載確認

確認日: 2026-11-05。基準 HEAD `b403c5a`。ユーザー承認に基づき 490/480/339/132 の 4 行を `EXCLUDED` に変更した。HP 30 の GAS TANK（17）／OIL TANK（16）と HARDENED DEPOT（482）は維持する。固定 ID、元 HP、耐性、任務出典は保持した。

## 既存調査からの継続範囲

[未確認項目の棚卸し](../mission-appearances/FOLLOWUP_REVIEW.md)から AIR BASE（490）と AMMO BUNKER（480）を引き継いだ。M12 防衛対象の AIR BASE（204）、M28 の代理用 AIR BASE（456/504）は既に除外済みで、判断を引き継ぐ。MEGAFLOAT の部位・支柱・シャッターは[既存調査](MEGAFLOAT_REVIEW.md)があり、今回は再調査していない。

一覧照合で HP 10000 の GAS TANK（339）と OIL TANK（132）も `Destruction` 定義だったため、[PILLBOX の調査](GROUND_MISSION_REVIEW.md)と同じ観点で追加確認した。

## 確定した掲載判断

| ID | 対象 | 確認結果 | 反映内容 |
| ---: | --- | --- | --- |
| 490 | AIR BASE、HP 2200、任務なし | `MS13Runway_01`。除外済み M12 防衛対象（204）と同じ NPC。別任務・子 NPC からの参照なし | 基本行も除外済み |
| 480 | AMMO BUNKER、HP 75、任務なし | `BPD_MunitionsDepot01_01`。全 43 任務表・子 NPC 参照・同モデル別 NPC を確認しても使用先は特定できない。M7 の HARDENED DEPOT とは別モデル | 未裏付けとして暫定除外済み |
| 339 | GAS TANK、HP 10000、M25/M28 | 全出典が `GasTank01/02_Destruction`。2 Blueprint とも HUD 枠・メッセージ非表示 | 破壊後用と推定する行として暫定除外済み。通常行 17 は維持 |
| 132 | OIL TANK、HP 10000、M8/M9/M25/M28/M29 | 全出典が `OilTank01/02` またはその S 型の `Destruction`。4 Blueprint とも HUD 枠・メッセージ非表示 | 破壊後用と推定する行として暫定除外済み。通常行 16 は維持 |

後二者は HP の大きさだけによる除外ではない。全出典のモデルが破壊後を示す別定義であり、HUD の設定も通常の独立した目標という解釈を支持しない。任務イベントからの用途や実ゲームでの追加攻撃可否は未確認なので、無敵・完全な被弾不能とは断定しない。

## AIR BASE と AMMO BUNKER

AIR BASE 490 はモデル HP 2200、NPC 加算 0。M12 の 204 は同じ NPC に任務加算 600 があり、HP 2800 となる。元定義の解決誤りではなく、防衛対象の基本値だけが掲載に残った構造である。全 43 任務表で同じモデルを使う NPC を追うと、`DT_NPC_Mission013/Runway` 以外の参照はなかった。[M12 攻略](https://gamerch.com/acecombat8/1017960)も基地の防衛を記載する。基本値を使う別の敵対象は未確認。

AMMO BUNKER の Blueprint には HP 75 と表示キー `ContainerGround_Name_Ammunition` がある。名称だけの空定義ではないが、実出現は特定できない。M7 に弾薬貯蔵区画があることは[保存済み攻略本文](https://gamerch.com/acecombat8/1017955)で確認できるものの、区画名をこの NPC の出現証明にはしない。

[M7 の Neoseeker 攻略](https://www.neoseeker.com/ace-combat-8-wings-of-theve/walkthrough/Mission_7%3A_A_Lifeline_in_the_Desert)は、入口から攻撃する HARDENED DEPOT を明示する。掲載中の HARDENED DEPOT（482）は `BPD_MunitionsDeptTunnel_DamagePoint_01` → `BP_BPD_MunitionsDeptTunnel_DamagePoint_C`、HP 35 で、AMMO BUNKER 480 とは別対象。480 の除外案を 482 へ広げず、M7 を推測で 480 に付与しない。

## HP 10000 のタンク

GAS TANK 339 の出典は 3 件・2 モデル、OIL TANK 132 は 10 件・4 モデル。いずれもモデル HP 10000、NPC・任務加算 0。任務番号や HP 差分の処理による誤生成ではない。

6 Blueprint 全てで `bShowHUDBox=false`、`bDrowHUDMessage=false` を読み取った。CDO の初期 HP は 30 だが、モデル表と役割が異なるため 10000 を 30 に修正したり、通常行へ統合したりする根拠にはしない。固定 ID と元 HP・耐性を保持した掲載除外を反映した。

通常の GAS TANK 17 は HP 30・M2/M7/M8/M27、OIL TANK 16 は HP 30・M2/M7/M23 で、別モデル群を参照している。通常 OIL TANK の一部 Blueprint にも HUD 枠非表示があるため、そのフラグだけで他行を除外しない。今回の対象は全出典が `Destruction` 定義の 339/132 に限定する。

## 証拠と残件

[STRUCTURE_SCOPE_EVIDENCE.json](STRUCTURE_SCOPE_EVIDENCE.json) に変更前の 8 対象の元定義、22 Blueprint の完全読取確認・関連属性・ハッシュ、基本 2 行に関する全任務表の検索範囲を記録した。抽出済み資産と既存解析器を再利用した。元テーブルの基準ビルドと現行 EXE は異なる。マップやイベントからの直接生成、実ゲームの配置・被弾は未確認。

上表の 4 行は判断・反映済み。STRUCTURE 全体の出現確認完了を意味しない。既に判断済みの MEGAFLOAT 部位やシャッターの耐性差を、未確認の重複として再度扱わない。
