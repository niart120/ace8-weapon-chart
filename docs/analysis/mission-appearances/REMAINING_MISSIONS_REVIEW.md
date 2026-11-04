# M8〜M30 の残件一括照合

調査日: 2026-11-05。基準 HEAD: `f1d3afb`。M7 の承認済み修正をコミット後、残る任務をまとめて照合した。後続のユーザー判断を下記のとおり反映済み。「調査範囲と集計」以降は変更前の調査・候補記録として保持する。

## ユーザー判断と反映

| 任務 | 除外 | 維持・区別 |
| --- | --- | --- |
| M8 | AH-64、F-14D、F/A-18C、通常 MIRAGE 2000-5、SU-34、TU-95 | SU-33 と SHADOW 行を維持。AH-64 121 は唯一の掲載任務がなくなるため行全体を EXCLUDED |
| M9 | なし | INTERCEPTOR UAV はユーザーが出現を確認 |
| M10 | DESTROYER 59 と部位 60/61 | 他任務の駆逐艦は維持 |
| M11 | 通常 MIRAGE 2000-5 | MIG-29A など裏付け済み機種は維持 |
| M12 | DESTROYER 59/60/61、CRUISER 62/63/64/65 | LCAC・APC は維持 |
| M17 | MI-24 | CH-47 は維持 |
| M18 | Shadow 22・DFM と同 NPC の基本出典を計算用 sourceRefs から除外 | SU-57 235 の Shadow 24 と M28、HP 115・通常計算は維持。除いた 3 出典は JSON に保存 |
| M21 | 通常 GRIPEN E | 他の機種・艦艇は維持 |
| M22 | 地上型 AA GUN 32、SAM 33 | SAM も後続の明示指示で除外。CELAENO の AA GUN 278／VLS 281 は維持 |
| M23 | F-22A、IL-76、IL-78、QUADCOPTER、V-22 | 未裏付け一覧の GRIPEN E、MI-24、MIG-29A、TU-95、TYPHOON は維持 |
| M24 | JTAC 320 | MI-24 は維持。JTAC は `?` 化ではなく行全体を EXCLUDED。元 HP 20 は履歴として保持 |
| M25 | 未裏付け通常機 19 対応のうち、GRIPEN E・MI-24 以外の 17 対応 | 通常 GRIPEN E 70・MI-24 29、SHADOW の GRIPEN E 332・SU-33 336・TYPHOON 333 を維持。確認済みの V-22・RAFALE M・FA-36・EA-36・F-15E なども維持 |
| M26 | なし | MIG-29A・SU-33 を維持。表記差のある F-35C も維持 |
| M27 | KC-10 417 | 他候補の GRIPEN E・SU-33・SU-57・V-22 は維持。KC-10 は唯一の掲載任務がなくなるため行全体を EXCLUDED |
| M28 | なし | GRIPEN E を維持 |

共有行から 42 任務対応を削除し、3 行（AH-64 121、JTAC 320、KC-10 417）を EXCLUDED とした。掲載 269 行、除外 237 行。EXCLUDED 行は履歴用の元任務を保持し、TYPE/MISSION の選択対象から外れる。HP・耐性・固定 ID・名称・指定外の任務対応は変更前と一致する。調査 JSON の `records` / `counts` / `targetsSha256` は変更前の記録で、反映内容は `subsequentDecision` に保存した。

今回列挙した候補への掲載判断は完了。残置は掲載の判断であり、ユーザーが明示した M9 以外を新たな実測確認済みとは扱わない。

任務選択と TYPE 選択の回帰テストを追加し、変更前の失敗を確認してから反映した。旧テストの任務一覧と JTAC 掲載期待を現行判断へ更新し、140 テスト・型検査・Lint・整形確認・ビルドが成功した。全 506 行の差分検査で戦闘値と指定外の任務対応の不変も確認した。

## 調査範囲と集計

旧監査を現行の掲載区分・ゲーム内ミッション番号で絞り、部位を除く航空機の未裏付け・疑義 107 対応を再確認した。追加資料で機種名を支持できたのは 54 対応、過去に維持を合意済みの UAV が 2 対応、機種単位で未解消なのは 51 対応。54 対応には、ユーザーが既に維持を確認した M11 MIG-29A への追加裏付け 1 対応を含む。古い「未裏付け118対応」を残件数として使わない。

航空機以外は、大分類ごとの既存調査と現行の任務対応を引き継ぎ、今回の攻略記述に照らして艦艇・地上目標・特殊対象の疑義を抽出した。全地上目標・艦載部位を個別に実出現確認済みとはしていない。M14 は無効化済み。M16・M29 は既存判断を引き継ぐ。

## 計算・出典の扱いを変える候補

| 対象 | 現在 | 提案・根拠 |
| --- | --- | --- |
| M24 JTAC（320） | HP 20、通常の命中数計算 | 掲載と元 HP は残し、必要命中数を `?` にする案。[Wiki](https://acecombat.wiki.gg/wiki/The_Battle_of_Rocky_Island%2C_Day_1) は地上照準役を「無敵らしい」と記載。[Gamerch](https://gamerch.com/acecombat8/1019039) は JTAC の出現を明記する。無敵の実測確認は未実施で、撃破不能の断定ではない |
| M18 SU-57 (SHADOW)（235） | Shadow 22・DFM・Shadow 24 と M28 の機体を同じ計算行に統合 | M18 の計算対象出典を Shadow 24 に限定する案。[Wiki](https://acecombat.wiki.gg/wiki/Moonlight_and_Shadows) は Shadow 22 を撃墜不能、Shadow 24 を撃墜可能と区別。行全体・M18/M28 対応・HP 115 は維持 |

JTAC の任務定義は `DT_NPC_Mission025day1/lass_common` → `GR044_lass_01`。`MinHealth=0` であり、表だけでは無敵を実証も否定もできない。今回 HP を `-` にする根拠はない。Shadow 22 は `DT_NPC_Mission019/su57_Shadow22` と `su57_Shadow22_DFM`、Shadow 24 は `su57_Shadow24`。参照元は調査履歴として残し、計算対象からの除外理由を記録する。UI に説明文・状態表示を追加する提案ではない。

## 地上目標・艦艇の暫定除外候補

以下は敵出現の裏付け不足による候補であり、非出現・味方と確定した一覧ではない。変更する場合は指定任務だけを外し、他任務の行は維持する。

| 任務 | 本体と部位の ID | 未確認点 |
| --- | --- | --- |
| M10 | DESTROYER 59、AA GUN 60、NAVAL GUN 61 | [攻略](https://acecombat.wiki.gg/wiki/Over_the_Rainband) は味方艦隊への航空攻撃を阻止する内容。敵駆逐艦を確認できない。Bravery と `udal_common` の同一性は未特定 |
| M12 | DESTROYER 59/60/61、CRUISER 62/63/64/65 | [部分敵一覧](https://acecombat.wiki.gg/wiki/An_Island_in_Darkness) は LCAC とその APC を明記するが、この 2 艦種を記載しない。LCAC/APC は候補に含めない |
| M22 | 地上型 AA GUN 32、SAM 33 | [攻略](https://www.neoseeker.com/ace-combat-8-wings-of-theve/walkthrough/Mission_22%3A_Pursuing_the_HSCA) は CELAENO・UAV・戦闘機との戦闘を記載。地上型を攻撃可能な敵として特定できない。CELAENO の艦載部位 278/281 は別定義なので維持 |

本体 5 対応、部位を含めると 12 対応。元定義は M10 `DT_NPC_Mission011/udal_common`、M12 `DT_NPC_Mission013/udal_common` / `slav_common`、M22 `DT_NPC_Mission023/vads_common` / `GR009_rams_01`。部位 ID は現行の所属と任務対応を確認したもので、出現を独立に実証した意味ではない。

## 機種を特定できなかった航空機の全一覧

51 対応をすべて記載する。通常機と SHADOW の別行を区別した。未裏付けを掲載対象から外す方針を適用する場合の候補であって、51 件の誤りが確定したわけではない。特に大規模戦の M23/M25 は、攻略が通常機・駐機機を網羅していない。

| 任務 | 対象（固定 ID） | 件数 |
| --- | --- | ---: |
| M8 | AH-64（121）、F-14D（6）、F/A-18C（30）、MIRAGE 2000-5（4）、SU-33（68）、SU-34（75）、TU-95（8） | 7 |
| M9 | INTERCEPTOR UAV（146） | 1 |
| M11 | MIRAGE 2000-5（4） | 1 |
| M17 | CH-47（230）、MI-24（29） | 2 |
| M21 | GRIPEN E（70） | 1 |
| M23 | F-22A（307）、GRIPEN E（70）、IL-76（93）、IL-78（118）、MI-24（29）、MIG-29A（67）、QUADCOPTER（94）、TU-95（8）、TYPHOON（95）、V-22（69） | 10 |
| M24 | MI-24（29） | 1 |
| M25 | AV-8B（122）、EA-18G（274）、F-15C（66）、F-15J（233）、F/A-18C（30）、F/A-18E（241）、F/A-18F（197）、GRIPEN E（70）、MI-24（29）、MIG-21BIS（1）、MIG-29A（67）、MIG-31B（73）、MIRAGE 2000-5（4）、SU-33（68）、SU-34（75）、SU-35S（265）、SU-47（207）、SU-57（335）、TYPHOON（95） | 19 |
| M26 | F-35C（409）、MIG-29A（67）、SU-33（68） | 3 |
| M27 | GRIPEN E（70）、KC-10（417）、SU-33（68）、SU-57（335）、V-22（69） | 5 |
| M28 | GRIPEN E（70） | 1 |

このうち M23 MI-24 は「敵ヘリ」の間接根拠があり、M26 F-35C は Wiki 側が F-35A と記載する表記差がある。この 2 対応は維持・保留を推奨し、単純な暫定除外候補から分ける。残る 49 対応も、非出現の確定ではない。

M8 MIRAGE 2000-5 と M25 GRIPEN E / SU-33 / TYPHOON の通常行を、確認できた SHADOW 行の機種名だけで裏付けたことにはしない。M17 CH-47 は今回確認できた唯一の任務が M17 であり、暫定除外する場合は任務未指定の通常掲載行として残さず、行自体を EXCLUDED にする案となる。

## 追加資料で維持を支持できた航空機

以下の 54 対応は変更候補から外す。機種・敵用途の裏付けであり、HP や個別 NPC 配置の実測ではない。

| 任務 | 対象（固定 ID） | 追加資料 |
| --- | --- | --- |
| M8 | AV-8B（122）、MIG-29A（67）、TU-160（31） | [Wiki の敵一覧・攻略](https://acecombat.wiki.gg/wiki/Retaking_of_Theve_II) |
| M10 | F-14D（6）、F-2A（74）、MIRAGE 2000-5（4） | [Wiki の敵一覧・攻略](https://acecombat.wiki.gg/wiki/Over_the_Rainband) |
| M11 | A-50（2）、IL-78（118）、MIG-29A（67） | [Wiki の敵一覧・攻略](https://acecombat.wiki.gg/wiki/Maximum_Payload) |
| M12 | MI-24（29）、TU-160（31） | [Wiki の敵一覧・攻略](https://acecombat.wiki.gg/wiki/An_Island_in_Darkness) |
| M13 | AV-8B（122）、F-14D（6）、F-4E（7）、MI-24（29）、SU-25SM（27） | [Wiki の敵一覧・攻略](https://acecombat.wiki.gg/wiki/The_People_of_the_Lost_Country) |
| M15 | INTERCEPTOR UAV（146） | [Wiki の敵一覧・攻略](https://acecombat.wiki.gg/wiki/Wings_of_Wax) |
| M17 | INTERCEPTOR UAV（146）、QUADCOPTER（94）、SU-33（68） | [Wiki の敵一覧・攻略](https://acecombat.wiki.gg/wiki/Land_Battleship_No._3_%28mission%29) |
| M18 | MIG-31B（73）、RAFALE M（232） | [Wiki の敵一覧・攻略](https://acecombat.wiki.gg/wiki/Moonlight_and_Shadows) |
| M19 | INTERCEPTOR UAV（146）、MIG-29A（67）、QUADCOPTER（94） | [Wiki の敵一覧・攻略](https://acecombat.wiki.gg/wiki/Clearing_the_Lighthouse) |
| M20 | MIG-31B（73）、MIRAGE 2000-5（4）、SU-47（207） | [Wiki の敵一覧・攻略](https://acecombat.wiki.gg/wiki/Escort_Orbiter) |
| M21 | A-10C（273）、F-14D（6）、F-15E（272）、F-16C（26）、MIG-21BIS（1）、MIG-29A（67）、MIG-31B（73）、SU-33（68）、SU-34（75） | [Wiki の敵一覧・攻略](https://acecombat.wiki.gg/wiki/The_Star-Bound_Bird) |
| M22 | INTERCEPTOR UAV（146）、SU-35S（265）、SU-47（207） | [プレイヤー投稿 #9185](https://forums.spacebattles.com/threads/ace-combat-general-discussion-thread.366416/page-368) |
| M23 | SU-47（207） | [Neoseeker](https://www.neoseeker.com/ace-combat-8-wings-of-theve/walkthrough/Mission_23%3A_The_Destruction_of_Expo_City) |
| M24 | RAFALE M（232）、TYPHOON（95） | [Wiki の敵一覧・攻略](https://acecombat.wiki.gg/wiki/The_Battle_of_Rocky_Island%2C_Day_1) |
| M26 | AV-8B（122）、TU-160（31） | [Wiki の敵一覧・攻略](https://acecombat.wiki.gg/wiki/Crossing_Fleets) |
| M28 | B-1（434）、MIG-29A（67）、MIRAGE 2000-5（4）、SU-33（68）、SU-35S（265）、TU-160（31）、TU-95（8）、TYPHOON（95） | [Wiki の敵一覧・攻略](https://acecombat.wiki.gg/wiki/A_Thousand_Points_of_Light) |
| M30 | INTERCEPTOR UAV（146） | [Wiki の敵一覧・攻略](https://acecombat.wiki.gg/wiki/Song_of_Wings_%28mission%29) |

M22 の SU-35S / SU-47 はプレイヤー投稿の敵機種・得点の記述を根拠にする。独立した実測を行ったものではない。INTERCEPTOR UAV は [Neoseeker](https://www.neoseeker.com/ace-combat-8-wings-of-theve/walkthrough/Mission_22%3A_Pursuing_the_HSCA) の発進・迎撃手順でも支持される。M15 EXPLOSIVE UAV（216）と M26 UNKNOWN UAV（411）は [既存調査](../calculation/AIRCRAFT_SCOPE_REVIEW.md)とユーザー判断に従い維持する。

## 既存判断との関係・残る限界

M10 の AIRSHIP には Bravery を照準する撃墜不能個体の記述があるが、同じ任務に撃墜する飛行船があるため、AIRSHIP 177 の M10 全体は除外しない。[M10 Wiki](https://acecombat.wiki.gg/wiki/Over_the_Rainband)。M24 の飛行船 319 も撃墜できる記述があり、JTAC と一緒に除外しない。

M25 の V-22 は撃墜による会話分岐が [保存済み Gamerch](https://gamerch.com/acecombat8/1019041) にあるため維持。M27 の GAS CARRIER、M23 COMMAND POST、通常 PILLBOX、CANISTER、HP 30 のタンク、M26 UNKNOWN の `?`、SWARM DRONES の `-` / `?` は承認済み判断を維持する。

地上・艦載部位の無条件な任務継承は修正済み。今回の未裏付け航空機と、過去の「部位の46対応」を混同しない。陸上戦艦・PODARGE・MEGAFLOAT などの部位属性と掲載範囲は既存の分類別調査を引き継ぎ、攻略本文に部位名が省略されることだけで一括削除しない。

Wiki と Neoseeker は直接取得が 403 のページがあり、検索エンジンが保持する本文を確認した。Gamerch は前回保存した本文を再利用した。動画のコマ送り確認・ゲーム実測・全配置の解析は行っていない。これで全目標の実出現や撃破可否を確認済みとはしない。今回の資料照合で増えた変更候補と、資料だけでは解消しなかった項目をここに集約した。

## 記録と検査

[機械可読の一覧](remaining-missions-review.json) に 107 対応の状態・固定 ID・元任務参照・確認資料と、計算／地上／艦艇の追加候補を保存した。現行ターゲット JSON の SHA-256 も記録した。元の初回監査は履歴として上書きしない。

107 対応の重複なし、54+2+51 の集計、候補 ID と任務の現行掲載、部位候補の所属を確認した。配信データ・生成ルール・アプリ実装は変更していない。M7 コミットの検証は 139 テスト、型検査、Lint、整形確認、ビルドが成功済み。
