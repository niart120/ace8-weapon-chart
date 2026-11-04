# VEHICLE 系の出現・掲載根拠の調査

調査日: 2026-11-04。調査開始時 HEAD: `17e73cc`。表示名に `VEHICLE` を含む全 7 行（当時の掲載 6 行、除外済み 1 行）を調査した。証拠 JSON と次節以降の調査結果は変更前の記録。

## 承認後の反映

ユーザーの「裏付けのないターゲットも一旦除外」という判断に従い、COMMAND VEHICLE（316）、EPP VEHICLE（317）、IED VEHICLE 基本行（487）を `EXCLUDED` にした。COMMAND/EPP は未出現確定ではなく、敵出現の裏付けを得るまでの暫定除外である。固定 ID・HP・耐性・任務情報は保持した。

RADAR VEHICLE（36）と LAUNCH VEHICLE / DEBRIS（237/238）は維持。今回の除外指示は直前に調査した VEHICLE 系へ適用し、過去の全監査にある未裏付け対象へ一括適用していない。他系統の残件は [既存調査と現行データの照合](../mission-appearances/FOLLOWUP_REVIEW.md) に整理した。

`src/data/vehicles.test.ts` で、除外対象が TYPE・MISSION の両方式、検索、初期選択、過去の選択 ID が残る状態でも表示されないことを確認する。

変更前のテスト失敗を確認後、SWARM DRONES 統合を含め全 130 テストが成功。型検査・Lint・整形確認・本番ビルドも成功。HP・耐性・任務情報の差分が車両 3 行に発生していないことを確認した。

## 結果

全行がコミュニティ資料で裏付け済みという状態ではない。元データの数値と任務参照は確認できるが、COMMAND/EPP の実際の敵出現は未裏付け。IED の任務用定義だけを除外し、基本定義を残していた点は追加の修正候補となる。

| 対象 | 現行値・任務 | 裏付けと判断 |
| --- | --- | --- |
| COMMAND VEHICLE、ID 316 | HP 15、M23 | 任務表とモデルは確認済み。確認した攻略資料に個別の敵としての記載がなく、出現・敵味方は未裏付け |
| EPP VEHICLE、ID 317 | HP 15、M23/M24 | 両任務の定義は確認済み。COMMAND と同様、個別の敵出現は未裏付け |
| IED VEHICLE、ID 487 | HP 120、任務未指定 | 除外済み M9 行と同じ NPC の基本定義。敵としての使用は確認できず、追加の掲載除外候補 |
| IED VEHICLE [M9]、ID 145 | HP 3、M9、除外済み | 自爆車両の突入を援護する任務であり、撃破対象としての掲載除外は資料と整合 |
| RADAR VEHICLE、ID 36 | HP 20、M17 | M17 の敵一覧に掲載あり。M3 は既に任務除外済み。現状維持が妥当 |
| LAUNCH VEHICLE / DEBRIS、ID 237/238 | HP 160/20、M18 | ロケット本体と破片が M18 の撃破対象として記載され、元データとの対応も一致。現状維持が妥当 |

## IED VEHICLE の基本行が残っている

ID 487 は `DT_NPC/GR025_trkb_01`、ID 145 は `DT_NPC_Mission010/trkb_common` を参照する。後者の `NpcId` も `GR025_trkb_01` であり、別種の敵車両ではない。

モデル `GR025_trkb` の HP 120 に、M9 の任務差分 -117 を加えると HP 3 になる。これは基本値と任務値の違いであり、HP 120 の敵車両が別に出現する証拠ではない。全 `DT_NPC_Mission*` を走査した結果、この NPC の直接参照は M9 の 1 件だけだった。

[Ace Combat Wiki の M9 攻略](https://acecombat.wiki.gg/wiki/The_Land_Battleship_Blockade)は、味方の IED 車両を援護し、陸上戦艦の履帯装甲へ突入させる流れを説明している。[既存の出現監査](../mission-appearances/MISSION_APPEARANCE_AUDIT.md)でも M9 行を支援対象として除外済み。

したがって、ID 487 も `EXCLUDED` とし、元 HP 120 と固定 ID は保持する案が妥当。CONTAINER SHIP と同じく、任務用定義を整理した後に基本定義だけが掲載へ残ったケースである。ただし、任務イベントや配置から基本 NPC を直接生成する全経路を解析したわけではなく、ゲーム全体での未使用を確定したものではない。

補足として `GR025_trkb_Ally` という別モデルと Blueprint も存在するが、`DT_NPC` の該当車両は `GR025_trkb` を参照する。`Ally` 接尾辞の有無だけで基本行を敵と判断しない。

## 出現の裏付けが取れた対象

[M17 の敵一覧](https://acecombat.wiki.gg/wiki/Land_Battleship_No._3_%28mission%29)には、初期段階の `RADAR VEHICLE` が 6 台・各 430 点と記載されている。同ページはゲーム内観察に基づく部分的な一覧と明記している。内部の `DT_NPC_Mission018/radv_common` → `GR027_radv_01` と対応し、NPC の得点も 430。現在の M17 対応を支持する。

[M18 の攻略・敵一覧](https://acecombat.wiki.gg/wiki/Moonlight_and_Shadows)には、`LAUNCH VEHICLE` 2 基と `LAUNCH VEHICLE DEBRIS` 5 個が撃破対象として記載されている。内部の `DT_NPC_Mission019` にもロケット 1 種と破片 5 定義がある。破片は段階的に分裂するため、HP 20 は各破片 1 個の値であり、全段階を合わせた必要命中数ではない。

LAUNCH 系の `isAir=true` と `roleGroup=ground` は、過去の [対象属性調査](../../../spec/agent/complete/local_003/TARGET_ATTRIBUTE_REVIEW.md)で別々の属性として確認・反映済み。今回も元モデル HP 160/20、NPC/任務 HP 加算 0 を照合した。名前に VEHICLE があることを理由に地上車両へ変更しない。

## COMMAND/EPP に残る確認事項

| 内部参照 | 対応 |
| --- | --- |
| `DT_NPC_Mission024/cccv_common` → `GR007_cccv_01` | COMMAND VEHICLE、M23 |
| `DT_NPC_Mission024/trka_common` → `GR026_trka_01` | EPP VEHICLE、M23 |
| `DT_NPC_Mission025day1/trka_common` → `GR026_trka_01` | EPP VEHICLE、M24 |

どちらもモデル HP 15、NPC/任務 HP 加算 0、最低 HP 0、耐性 `NPC_WPDur_000`、子 NPC なし。Blueprint は `LiveAIGroundVehicleObject` を継承し、`GameObjectCategory=3` を指定している。読めた継承範囲に、独自 Blueprint 関数や HUD 非表示・無敵指定は見つからなかった。ただし、任務イベントによる上書きや陣営・配置はこの確認では決まらない。

[Gamerch の M23](https://gamerch.com/acecombat8/1019038)・[M24](https://gamerch.com/acecombat8/1019039)では対地戦が説明されているが、敵一覧は未記入で、COMMAND/EPP を個別に識別できない。英語名・日本語の指揮車／電源車でも検索したが、今回確認した資料からは追加の裏付けを得られなかった。資料に記載がないことを非出現の根拠にせず、現時点では掲載維持・確認待ちとするのが妥当。

残る作業は、M23 の COMMAND/EPP、M24 の EPP について、ゲーム画面・プレイ映像の目標名と敵マーカー、または配置・生成イベントの NPC 指定と陣営を直接照合すること。テーブル内の存在だけでは、撃破対象として出現すると確定できない。

## 検証範囲

再収集用の [investigate_vehicles.py](investigate_vehicles.py) と [VEHICLE_EVIDENCE.json](VEHICLE_EVIDENCE.json) に、7 対象・12 任務参照・23 Blueprint のクラス既定値を保存した。Blueprint は全件で解析エラーなし・領域の完全消費を確認した。アプリデータと元カタログのハッシュが調査前後で一致することも確認した。

```powershell
python -B -X utf8 docs/analysis/calculation/investigate_vehicles.py 'D:/Steam/steamapps/common/ACE COMBAT 8/Game/Binaries/Win64/AceCombat8.exe'
```

ゲーム起動・被弾数の実測は行っていない。元テーブルは既存の基準ビルド `25201480`、解析に使う現行 EXE は別ビルドである。HP・耐性の静的照合と、現行ゲームの実測値を区別する。コミュニティの敵一覧も出現の根拠であり、HP の実測根拠としては扱わない。
