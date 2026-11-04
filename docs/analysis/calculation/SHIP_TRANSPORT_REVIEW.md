# SHIP の輸送・支援船の出現確認

確認日: 2026-11-05。基準 HEAD `e13a28f`。LCAC、OIL TANKER、GAS CARRIER の 3 行・7 任務対応を確認した。後続のユーザー確認・記憶を受け、任務対応を LCAC `[12]`、OIL TANKER `[4,26]`、GAS CARRIER `[27]` に変更した。3 行の掲載・HP・耐性は維持する。

## 既存調査から引き継いだ範囲

[既存調査の棚卸し](../mission-appearances/FOLLOWUP_REVIEW.md)に残っていた 3 種を対象とした。CONTAINER SHIP の統合・基本行除外・MANPADS 除外は[前回調査](CONTAINER_SHIP_REVIEW.md)と反映結果を引き継ぎ、今回は再解析していない。味方 LCAC も[友軍候補調査](../friend-candidates/FRIEND_CANDIDATES.md)と現行除外を確認し、除外判断を維持する。

## 任務ごとの裏付けと反映結果

| 対象 | 任務 | 確認結果 |
| --- | --- | --- |
| LCAC（198、HP 55） | M12 | 裏付けあり。保存済み Gamerch 本文が敵 LCAC の迎撃と全撃破によるネームド機出現を明記 |
| LCAC（198） | M23 | ユーザーが味方と確認。M23 の計算対象から除外 |
| OIL TANKER（54、HP 75） | M4 | 裏付けあり。Ace Combat Wiki の敵一覧に OIL TANKER 1 隻を記載 |
| OIL TANKER（54） | M23 | ユーザーは非出現と記憶。資料でも個別裏付けがないため、M23 を暫定除外 |
| OIL TANKER（54） | M26 | タンカーへの攻撃・誘爆を支持する記述があり、ユーザーも OIL TANKER の出現を記憶。維持。実測による個別識別とは区別する |
| GAS CARRIER（413、HP 75） | M26 | ユーザーは OIL TANKER だったと記憶。GAS CARRIER の個別裏付けも得られていないため、M26 を暫定除外 |
| GAS CARRIER（413） | M27 | 裏付けあり。Neoseeker が甲板脇の gas carrier を破壊して支柱へ誘爆させる手順を記載 |

3 種とも別任務で攻撃対象として裏付けられるため、行全体は維持した。M23 LCAC の味方確認と、M23 OIL TANKER／M26 GAS CARRIER の記憶に基づく暫定除外を区別し、`target-mission-exclusions.json` に理由を記録した。後者 2 件は非出現の実証ではなく、未裏付け対象を暫定的に外す既存方針による掲載判断。元の任務出典は保持する。

## 根拠資料と限界

[M12 の Gamerch 攻略](https://gamerch.com/acecombat8/1017960)は前回保存した本文を再利用した。敵 LCAC が基地へ接近すること、上陸前の撃破、ヘリ残骸による破壊を記載する。[Wiki のエース出現条件](https://acecombat.wiki.gg/wiki/Ace_Combat_8%3A_Wings_of_Theve/Aces)でも M12 の LCAC 全撃破条件を確認した。

[M4 の敵一覧](https://acecombat.wiki.gg/wiki/Fall_of_the_Numbered_Fleets)は OIL TANKER を 1 隻掲載する。[M26 の Gamerch 攻略](https://gamerch.com/acecombat8/1019042)の保存済み本文は、島にガスタンクとタンカーが多く、誘爆を狙えると記載する。ただし陸上のガスタンクを GAS CARRIER の根拠にはしない。[Neoseeker の M26](https://www.neoseeker.com/ace-combat-8-wings-of-theve/walkthrough/Mission_26%3A_Crossing_Fleets)も停泊船を攻撃対象に含めるが、輸送船の個別名称は示さない。

[Neoseeker の M27](https://www.neoseeker.com/ace-combat-8-wings-of-theve/walkthrough/Mission_27%3A_Fatsia%2C_the_Ocean_Fortress)は GAS CARRIER の具体的な破壊用途を記載する。直接取得は HTTP 403 だったため、検索エンジンが保持する同ページ本文を確認した。HP や必要命中数をこの記述から確定したものではない。

M23 は[保存済み Gamerch 本文](https://gamerch.com/acecombat8/1019038)と [Wiki](https://acecombat.wiki.gg/wiki/The_Destruction_of_Expo_City)で湾内の敵艦隊を確認できるが、LCAC と OIL TANKER の個別記載は得られていない。名称・任務名による追加検索でも対応を特定できなかった。隣接する M24 の味方 LCAC の記述を M23 の敵出現へ転用しない。

## 元データとの対応

| ID | 元 NPC | 任務表 |
| ---: | --- | --- |
| 198 | `VE014_lcac_01` | `DT_NPC_Mission013/lcac_common`（M12）、`DT_NPC_Mission024/lcac_common`（M23） |
| 54 | `VE013_oilt_01` | `DT_NPC_Mission005/oilt_common`（M4）、`DT_NPC_Mission024/oilt_common`（M23）、`DT_NPC_Mission026/oilt_common`（M26） |
| 413 | `VE019_lngt_01`、`VE019_lngt_Megafloat` | `DT_NPC_Mission026/lngt_common`（M26）、`DT_NPC_Mission027/VE019_lngt_01`（M27） |

7 出典とも NPC/任務の HP 差分は 0、最低 HP 0、任務耐性は `NPC_WPDur_000`。GAS CARRIER の M27 行名は通常 NPC と同じように見えるが、参照先は Megafloat 用 NPC である。3 種の現行 HP・耐性を修正する根拠は見つかっていない。

掲載 LCAC の元モデル名には Ally が付かないが、それだけでは敵味方を確定できない。M23 はユーザー確認に基づき任務単位で除外した。味方用 ID 72（M5、HP 480）・130（M8、HP 300）・324（M24、HP 500）は既に除外済みで、今回の敵 LCAC 198 と統合されていない。

変更前の詳細は [SHIP_TRANSPORT_EVIDENCE.json](SHIP_TRANSPORT_EVIDENCE.json)。既存の元定義と攻略資料を照合した範囲であり、全マップ配置・任務イベント・敵味方設定の解析や実ゲーム測定は実施していない。SHIP 全体の調査完了を意味しない。
