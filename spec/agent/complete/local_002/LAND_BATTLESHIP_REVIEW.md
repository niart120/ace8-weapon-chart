# 陸上戦艦の同名行と掲載範囲の調査

調査日: 2026-11-03。Q002の代理用ダミー除外と分けて、ユーザーと議論するQ003の資料。後続の承認により、M24に続いて本体行をすべてEXCLUDEDへ変更済み（12・13節）。部位は同条件2組の統合と右側THRUSTER154の除外を反映し、21行を掲載。合意した表記・属性・親参照を反映済み（16・18節）。Q003の掲載・識別判断と実装は完了。各節の保留・未実装記述は当時の履歴で、最終結果は18節を参照。

## 1. 目的と確認範囲

`LAND BATTLESHIP`を含む32行について、固定ID、元定義、表示名キー、任務耐性、計算属性、親子関係を比較した。うち2行はQ002で非表示にした採点用ダミー。後続の承認により通常本体6行も非表示とし、現在は同条件2組の統合とTHRUSTER154の除外により部位21行が掲載対象（固定IDは24件とも維持）。

| 用語 | 意味 |
| --- | --- |
| 表示名の1・2・3 | `ContainerGround_Name_Landbattleship1`〜`3`のゲーム内文字列。アプリが重複回避のために付けた番号ではない |
| 内部ldbs4 | `GR039_ldbs4_A`〜`D`のモデル群。表示名はすべてLAND BATTLESHIP 1であり、表示上の4はない |
| 共通行と任務行 | 同じNPCでも共通耐性と任務側の上書き耐性が異なる場合、別の条件として保持した行 |

基準ビルド25201480のDataTable・表示文字列と、生成用catalog、配信用JSONを照合。補足属性は既存の別ビルドBlueprint解析記録に依存する。実ゲーム測定、任務イベントの解析、新しいゲーム資産の抽出は行っていない。

## 2. 確認資料

| ファイル | 用途 |
| --- | --- |
| `src/data/targets.json` | 現在の表示名・計算条件・親参照 |
| `data/local/catalog.json` | 固定IDから元NPC・任務行への対応 |
| `docs/initial/ref/tables/DT_NPC.json`・`DT_NPC_Model.json` | モデル・耐性・子部位・Blueprint参照 |
| `docs/initial/ref/tables/DT_NPC_Mission010.json`・`018.json`・`020.json`・`025day1.json`・`025day2.json` | 任務の登録と耐性上書き。省略名はすべてDT_NPC_Missionを接頭辞とする |
| `docs/initial/ref/reports/target_display_names.json` | 表示名キー9734〜9736の1・2・3 |
| `data/local/bootstrap.py` | 初回取り込み時の任務差分・統合・親参照の決め方。実行していない |
| `data/local/npc-evidence.json` | 属性が未確認になる理由とBlueprint継承。用途・被弾可否の確認ではない |

## 3. 本体行が複数ある理由

| 表示名 / ID | 元モデル・任務 | 分かれている理由 |
| --- | --- | --- |
| LAND BATTLESHIP 1 / 147 | `GR036_ldbs1`、内部010の`ldbs1_Boss`（M9） | 通常耐性NPC_WPDur_000。全倍率1 |
| LAND BATTLESHIP 1 / 371 | `GR039_ldbs4_A`〜`D`、内部025day2（M25）。Dの共通NPCも統合 | 同じ表示名だが別モデル。ldbs4_WPDur_000により誘導爆弾0.5・爆弾0.25・ロケット0.5。A〜Dは表示名・計算条件・親ラベルが一致して1行に統合されている |
| LAND BATTLESHIP 1 [M24] / 330 | `GR039_ldbs4_D`、内部025day1の`ldbs4_D` | 任務側NPC_WPDur_000が共通ldbs4_WPDur_000を上書きし、全倍率1。ID371の共通条件と区別 |
| LAND BATTLESHIP 2 / 494 | `GR037_ldbs2`、共通NPC`GR037_ldbs2_01` | 共通耐性NPC_WPDur_000。全倍率1 |
| LAND BATTLESHIP 2 [M19] / 247 | 同モデル・内部020の`GR037_ldbs2_01` | 任務側ldbs2_WPDur_000へ変わり、誘導爆弾0.5・爆弾0.25・ロケット0.5 |
| LAND BATTLESHIP 2 / 496、[M19] / 261 | `GR000_dummy_MS20_ldbs2`、共通NPCと内部020のScoreDummy | 同じ表示名の別モデル。共通耐性は未確認、任務耐性はldbs2_WPDur_000。Q002でこの2行だけ非表示にした |
| LAND BATTLESHIP 3 / 226 | `GR038_ldbs3`、内部018の`ldbs3_ms18`（M17） | 本体は1行だけ。共通と任務の耐性はldbs3_WPDur_000で一致し、任務差分を作っていない |

初回生成は、任務に登録されているだけでは任務ラベルを付けず、共通設定と計算値が異なるときだけ任務差分を作る。このため、M9由来の147とM25由来の371が、どちらも任務ラベルのないLAND BATTLESHIP 1として並ぶ。表示名に任務の識別情報がないことと、数値が同じ行を二重登録したことは区別する。

1の各モデル・2・3は専用Blueprint（`BP_GR036_ldbs1_C`等）を参照し、汎用`BP_GR000_dummy_CP_C`とは異なる。`BaseScore=0`やHP100だけを根拠に代理用ダミーと判断しない。今回の横断確認では、掲載中のLAND BATTLESHIPに追加の同種ダミーは見つからなかった。

## 4. 部位の同名行

| 同名部位 / ID | 差の根拠 |
| --- | --- |
| SUB CATERPILLAR《LAND BATTLESHIP 1》 / 151・152 | SubCatのHP40とSubCat_CoreのHP300。モデルも異なる |
| THRUSTER《LAND BATTLESHIP 1》 / 154・488、および[M9]の153 | 右側R1/R2はHP40・通常ダメージ経路未確認、左側L1/L2はHP160。左側の共通と任務で通常耐性がldbs1_WPDur_001→000へ変わる。爆風の専用耐性は保持 |
| AA GUN《LAND BATTLESHIP 2》 / 248・249 | AAGunとAAGun_BIの別モデル。HP40・耐性は同じだが、248はisAir=false・ROLE=ship、249は両属性が未確認 |
| VLS《LAND BATTLESHIP 2》 / 254・258 | EXSAM_BIとVLSMの別モデル。HP40・耐性は同じだが、254はisAir=false・ROLE=ship、258は両属性が未確認 |

AA GUN・VLSの未確認属性は、既存Blueprint解析記録の読込エラーに由来する。確認済みの別モデルの値をコピーして統合しない。これは同じ表示名・HPで並ぶ原因の説明であり、実ゲームで属性が異なると確定した意味ではない。

## 5. 確定した親参照の不整合

ID372 `MAIN GUN《LAND BATTLESHIP 1》`は内部025day2のldbs4_B_MainCannon1・ldbs4_C_MainCannon2・3から生成される。元NPCの`ChildNPCId`では、これらの親はGR039_ldbs4_B_01・C_01（掲載ID371の出典群）。ところが配信用の`partOf`は、M9のGR036_ldbs1に由来するID147を指している。GR036_ldbs1_01の子部位にはこの主砲がない。

初回bootstrapが親モデルの識別を失った後、親の表示名で候補を探して先頭を選ぶため、同名の別モデルへ結び付いたことを確認した。ID372の出典と数値はldbs4のままであり、親の誤参照が計算属性を継承させているわけではない。

**確定事項:** 元定義と親参照が一致しない。**今回の扱い:** ユーザーが陸上戦艦の扱いを別途議論する方針を示したため、変更せずQ003に記録する。表示名の区別と親対応を合わせて検討する。

## 6. 後続で決めること

本体を非表示にし、部位だけを掲載する方針を採用した（13節）。部位側に残るM9とM25の識別、HP差のある部位の説明、未確認属性だけが異なる行の表示方法を決める。表示名の1・2・3を削ったり、未確認値を補完して統合したりする変更は実施しない。

- [x] 本体・部位の同名行と元定義を照合する
- [x] 表示番号、別モデル、任務差分、属性未確認を区別する
- [x] 追加の同種ダミーと親参照を確認する
- [x] 本体を非表示・部位を掲載する方針を決め、反映する
- [x] 部位の識別表記と表示切替の方針を決める
- [x] 合意後に必要な親参照・ラベル修正と検証を行う

初回調査時は通常陸上戦艦の実装変更なし。後続の本体除外と検証結果は12・13節を参照。

## 7. 任務と艦番号の外部照合

2026-11-03追記。Q002は`f9329a9`へコミット済み。以下はユーザーの追加依頼による調査・提案であり、陸上戦艦のデータや実装を変更する合意ではない。

ユーザー指定の[任務カテゴリ](https://acecombat.wiki.gg/wiki/Category:Ace_Combat_8:_Wings_of_Theve_missions)は直接取得で403となった。以下のWiki各記事は検索サービスが取得した本文を参照した。独立した攻略記事と同梱のゲーム内文字列も照合し、実ゲームを操作した確認とは区別する。

| 対応 | 外部資料で確認した内容 | 同梱資料による確認 |
| --- | --- | --- |
| 1番艦 / M9 | [The Land Battleship Blockade](https://acecombat.wiki.gg/wiki/The_Land_Battleship_Blockade)はM9でXanthosを擱座させる任務と説明 | `MissionNo_Name_ms10=MISSION 09`、`CampaignBriefing_Description_ms10`は1番艦を擱座させる目的。`v1015_0005`には艦名「ザンザス」 |
| 2番艦 / M19 | [Clearing the Lighthouse](https://acecombat.wiki.gg/wiki/Clearing_the_Lighthouse)はM19でBaliosと戦う任務と説明 | `MissionNo_Name_ms20=MISSION 19`、`CampaignBriefing_Description_ms20`は2番艦破壊。`v2001_0022`には艦名「バリオス」 |
| 3番艦 / M17 | [Land Battleship No. 3](https://acecombat.wiki.gg/wiki/Land_Battleship_No._3)は未完成艦の回収部材とバルーンによる囮と説明。[任務記事](https://acecombat.wiki.gg/wiki/Land_Battleship_No._3_%28mission%29)はM17・主砲2基の破壊を記載 | `MissionNo_Name_ms18=MISSION 17`、`MissiontitleJp_Name_ms18=陸上戦艦3番艦`。`GR038_ldbs3`の子部位に主砲2基 |
| ロッキー島 / M25 | [Land BattleshipのOther vessels](https://acecombat.wiki.gg/wiki/Land_battleship#Other_vessels)と[NeoseekerのM25攻略](https://www.neoseeker.com/ace-combat-8-wings-of-theve/walkthrough/Mission_25%3A_The_Battle_of_Rocky_Island%2C_Day_2)は、ドック内の未完成艦2隻と主砲の使用を記載 | `MissionNo_Name_ms25_Day2=MISSION 25`。既存の`v2514_0017`はドック開放、`v2514_0025`は建造中でも構わない旨の台詞。内部025day2にGR039系と主砲の登録あり |
| ロッキー島 / M24（攻撃対象として未確認） | [GamerchのM24攻略](https://gamerch.com/acecombat8/1019039)には陸上戦艦への攻撃という記載があるが、LAND AEGIS等との混同を排除できず、掲載根拠に採用しない。後続の再確認は11節 | `MissionNo_Name_ms25_Day1=MISSION 24`、同任務表の`ldbs4_D`はGR039_ldbs4_Dを参照。M25のDと同モデルだが、登録は実出現・攻撃可否の証明ではない |

文字列の出典は`docs/initial/ref/raw/CP_Cmn.dat`・`CP_A.dat`。既存の`extract_target_names.py`の復号・木構造読込を読み取り専用で使用した。基準ビルド25201480。SHA-256は順に`dc773dbb11f1535b5b1a5809520a9b520b97b557d1c3fc54806837103237c4e6`、`9e84a8c6ced711c58a36561a81f1b121120054255eeaded877310fa26000fc81`（R006の確認資料と同じ）。

**判断:** 1・2・3は艦番号として解釈でき、中心となる攻略任務はM9・M19・M17でユーザーの認識と一致する。登場・言及がその任務だけという意味ではない。同梱の`CampaignBriefing_Description_ms14`は2番艦の偵察を目的としており、これはゲーム内M13に当たる。1番艦も他任務の台詞に登場する。

**M24・M25の区別:** GR039系が表示名キーLandbattleship1を再利用している事実から、これらを物語上の1番艦Xanthosと同一視してはいけない。M25の建造中艦という用途は外部記事と台詞が整合する。M24の登録Dがどの配置・攻撃可能対象に対応するか、A〜Dと実際の艦数の対応までは未確認。内部ldbs4から「4番艦」という番号を新造せず、M24の用途をM25から無条件に補完しない。

M17の囮艦は攻撃可能な主砲を持つ任務対象であり、Q002の採点用代理定義とは別である。「囮」「dummy」という呼び方だけでM17の本体・部位をEXCLUDEDにしない。

## 8. 掲載・表記案（未採用）

以下は本体の掲載判断前の案。本体除外の採用により147・371の改名・任務フラグ変更案は取り下げる。本体非表示を前提とする最新の部位案は14節。いずれもまだ実装しない。

### 8.1 掲載方針

通常の本体・部位の数値と固定IDは維持する。Q002の非表示は維持するが、M24・M25の登録を「1番艦が登場するはずがない」という理由で削除しない。M24のID330はユーザーのゲーム内経験と追加照合を受けて推奨表示案から外し、後続の承認によりEXCLUDEDへ変更した（11・12節）。共通行は計算条件の基準であり、別の任務での実出現を意味しない。例えばID494と247は同じ2番艦の共通・M19耐性設定で、別の艦ではない。

本体HP100の通常計算を、そのまま艦全体の攻略に必要な命中数と解釈できるかは未確定。外部攻略ではM9の履帯・スラスター、M17の主砲、M19の弱点部位と段階進行が説明されている。調査時点では本体だけを非表示にする方針は未決だったが、後続のユーザー判断により13節で採用した。

### 8.2 案A: 任務を明示する（推奨）

丸括弧は識別情報、角括弧は任務、二重山括弧は部位の親を示す既存規則に合わせる。ROCKY ISLANDはアプリが付加する説明用識別名で、正式な艦名ではない。M24・M25では誤解を招く1を表示名から外すが、元の表示名キーと固定IDは保持する。

| ID | 提案する表示名 | 任務識別子・表示条件の変更案 |
| ---: | --- | --- |
| 147 | `LAND BATTLESHIP 1 [M9]` | missionVariant=null→内部10 |
| 330 | EXCLUDEDへ変更済み。改名しない | 内部25day1・固定ID・出典を維持。実際の攻撃対象との対応は未確認 |
| 371 | `LAND BATTLESHIP (ROCKY ISLAND) [M25]` | missionVariant=null→内部25day2。共通D出典も同条件として維持 |
| 372 | `MAIN GUN《LAND BATTLESHIP (ROCKY ISLAND)》 [M25]` | missionVariant=null→内部25day2、partOf=371 |

Xanthosを表示したい場合の拡張案は`LAND BATTLESHIP 1 (XANTHOS) [M9]`。2番艦も同じ方針なら`LAND BATTLESHIP 2 (BALIOS) [M19]`となる。長くなるため、任務と番号で識別できる最小案では艦名を追加しない。`INCOMPLETE`はM25には根拠があるが、M24にも共通して付けるには用途確認が足りないため、現段階では場所による識別を優先する。

**表示条件への影響:** 案Aでは147・371がMISSION VARIANTSオフ時に非表示となる。372はTARGET PARTSとMISSION VARIANTSの両方がオンのときだけ表示。角括弧だけを足して、実際の任務表示フラグと食い違わせない。

M9の既存共通設定部位は、親が任務行になったことだけでは任務差分に変えない。現在もID247の任務本体に、共通設定の部位が接続される構造がある。部位の親参照は計算条件・表示フラグを継承する規則ではない。共通部位を含めた表示方法まで変える場合は、別の合意が必要。

### 8.3 案B: 現在の初期表示を維持する

147を`LAND BATTLESHIP 1 (XANTHOS)`、371を`LAND BATTLESHIP (ROCKY ISLAND)`、372を`MAIN GUN《LAND BATTLESHIP (ROCKY ISLAND)》`とし、missionVariantは変更しない。372のpartOfだけ371へ直す。330は案Aと同じくEXCLUDEDを維持し、改名しない。

現在の初期表示・部位表示を維持できるが、画面名だけでは147のM9・371/372のM25との対応が分からない。任務を明示する要求には案Aのほうが適合する。表示用任務メタデータを別途追加して表示切替から独立させる拡張は、今回の最小修正案には含めない。

## 9. ID372の親参照修正案（未実装）

`data/local/catalog.json`のID372について、`partOf: 147`を`partOf: 371`へ変更し、採用案に合わせて表示名と任務フラグを設定する。固定ID372・371、主砲の3出典、HP80と全計算属性を保持する。配信用JSONは通常の生成コマンドで再生成し、bootstrapは再実行しない。

親は以下の実参照から決める。表示名の一致や、同じ数字1であることは親を決める根拠に使わない。

| 子NPC（ID372の任務出典が参照） | 元NPCの親 | 掲載上の親 |
| --- | --- | --- |
| GR039_ldbs4_B_MainCannon1 | GR039_ldbs4_B_01のChildNPCId | ID371 |
| GR039_ldbs4_C_MainCannon2 | GR039_ldbs4_C_01のChildNPCId | ID371 |
| GR039_ldbs4_C_MainCannon3 | GR039_ldbs4_C_01のChildNPCId | ID371 |

ID330はM24のDであり、この主砲群の親ではない。ID147のGR036モデルにもこの主砲群は属さない。B/Cは同条件の親ID371に統合されているため、今回の修正に新規IDや出典の分割は必要ない。

## 10. 合意後の検証案

| 確認 | 内容 |
| --- | --- |
| 元定義との照合 | 上の3子NPCと親NPCのChildNPCIdを、元表から採った小さな固定資料で検証。期待する親番号だけをアプリ定義から写さない |
| 差分 | 固定ID・出典・数値・並び順を保持。変更は採用したname・missionVariantと372のpartOfに限定 |
| 表示 | 掲載を合意したM9・M25を検索で識別可能。M24のID330は検索候補・結果から除外。部位名と任務ラベルを二重に付けない |
| 状態と保存 | 部位／任務表示の4通りを検証。147・330・371・372の旧保存選択IDを維持。非表示中の選択を失わない |
| 再生成 | 配信3ファイルを再生成し、繰り返してバイト単位で一致することを確認 |

今回の追記は調査・提案文書のみ。アプリ・catalog・配信データ・テストコードは変更していない。Q002で成功済みの90テスト・Chrome8シナリオ等は、未実装の上記案を検証した結果ではない。

## 11. M24の攻撃対象としての掲載根拠を再確認

ユーザーから「M24では少なくとも攻撃目標にできなかった記憶がある」との指摘を受け、同日の表記提案を訂正した。ユーザーの経験は、今回の実ゲーム測定と区別して記録する。

確認できたのは`DT_NPC_Mission025day1/ldbs4_D → GR039_ldbs4_D_01 → GR039_ldbs4_D → BP_GR039_ldbs4_Dparts_C`という登録経路。HP100、BaseScore=0、ChildNPCIdなし。M25のA〜D・主砲の登録と異なり、M24でGR039系の登録はDだけである。ただし、得点0・子部位なし・Dpartsという名前だけでは攻撃不能と断定しない。

[NeoseekerのM24攻略](https://www.neoseeker.com/ace-combat-8-wings-of-theve/walkthrough/Mission_24%3A_The_Battle_of_Rocky_Island%2C_Day_1)は一般的なland shipsとLAND AEGISを記載するが、GR039系の陸上戦艦を攻撃できるという個別の確認にはならない。[PowerPyxのM24節](https://www.powerpyx.com/ace-combat-8-all-ace-s-ranks-walkthrough/)も上陸支援・LAND AEGIS・ターンテーブルへの進撃を説明し、ドック艦の主砲への攻撃はM25節で扱う。M24任務表には実際にGR034のLandAegisとGR035のLandDestroyerが別に登録されている。

したがって、Gamerchの陸上戦艦に関する表現には他の陸上艦との混同の可能性が残る。攻略記事に記載がないことも不出現・攻撃不能の証明にはしない。M24のGR039系の攻撃可否を独立して裏づける資料は得られていない。

手元の`docs/initial/ref`と`data/local`にはumap資産がなく、M24の配置・スポーン処理・ターゲット可否を切り替える任務イベントは確認できていない。未使用登録・背景用・攻撃不可の配置という解釈は候補にとどまる。新しいゲーム資産の抽出やゲーム起動は行っていない。

**再確認時点の判断:** ID330の掲載・改名を保留し、固定IDと出典を残した暫定EXCLUDEDを提案した。その後ユーザーが除外を承認し、12節のとおり反映した。M24の攻撃不能を確定したわけではない。ID371と372のM25の設定、372の親を371へ修正する根拠とは分ける。


## 12. M24の除外決定と残る判断事項

この節の件数・検証結果はM24だけを除外した時点の履歴。現状は13節を参照。

ユーザーがM24をEXCLUDEDにすることを承認した。ID330の1行・`DT_NPC_Mission025day1/ldbs4_D`の1出典に限定し、catalogの除外理由は`approved-local002-M24-land-battleship-pending`とした。攻撃可否の未確認は残るが、掲載判断は完了。共通Dを含むID371とM25主砲ID372、ほかの陸上戦艦には除外を広げない。

HEAD（f9329a9）との全506行比較で、配信データの変更はID330のcategoryだけ。固定ID・name・内部missionId・順序・出典・計算値・partOfは維持。掲載319行・EXCLUDED187行、元定義1459件・除外指定273件。全除外指定がEXCLUDEDへ対応し、再生成で配信3ファイルがバイト単位で一致した。

回帰テストは変更前にGROUNDとEXCLUDEDの不一致で失敗、変更後に91テスト成功。旧保存の330を除去し、371・372の選択と表示を保持すること、検索候補から330を除外することを確認した。pnpm typecheck・lint・format:check・buildが成功。UIロジックは変更しておらず、今回はChromeテストを再実行していない（Q002時点の8シナリオ成功とは区別）。今回の変更は未コミット。

| 残件 | 状態・次の判断 |
| --- | --- |
| 陸上戦艦の本体行の掲載 | 判断・反映済み。本体をすべて非表示、部位24行を掲載（13節） |
| 識別表記と表示切替 | 部位について案Aの任務明示か、案Bの表示条件維持か未決。M25主砲、HP差・未確認属性差のある同名部位が対象。本体の改名は不要 |
| ID372の親参照 | 修正先371は元定義から確定。ユーザーに親番号を判断してもらう項目ではなく、陸上戦艦変更をまだ実装しない指示に従う実装待ち |
| 初期設計ISSUE-003 | MISSION VARIANTS・TARGET PARTSの和訳案検討が未着手。現行英語表記の合意は有効で、初期実装の完了を妨げない |
| 初期設計ISSUE-005 | UAVTの評価方法・単位は未決。先に攻撃回数・分配等の調査が必要で、すぐユーザー判断だけで確定できる事項ではない |

初期設計の課題は[ISSUES.md](../../complete/local_001/ISSUES.md)を参照。TLS、8AAM、SFFSパーツ、一部目標属性、ビルド差・任務イベントは技術的な未確認事項であり、追加の掲載判断をユーザーへ求めているものではない。MPBM継続分は初版対象外で合意済み。Q001・Q002・R001〜R006の過去の保留記述は履歴で、現在の判断待ちではない。


## 13. 本体を非掲載とする決定と実装

2026-11-03、ユーザーが「ひとまずは本体は載せなくていい」と判断した。技術上の攻撃不能を確定する変更ではなく、静的な本体HP100を艦全体の攻略に必要な命中数として掲載しない方針である。

### 根拠と限界

| 任務 | 参考サイトの記載 | 掲載判断との関係 |
| --- | --- | --- |
| M9 | [The Land Battleship Blockade](https://acecombat.wiki.gg/wiki/The_Land_Battleship_Blockade)は履帯を破壊し、最後に左舷のスラスターを破壊して任務を終えると説明 | 本体HPを削り切る手順ではなく、部位と段階進行を説明している |
| M17 | [Land Battleship No. 3](https://acecombat.wiki.gg/wiki/Land_Battleship_No._3_%28mission%29)は最後に主砲2基を破壊すると説明 | 囮艦でも主砲は攻略対象。本体と一緒に部位まで除外しない |
| M19 | [Clearing the Lighthouse](https://acecombat.wiki.gg/wiki/Clearing_the_Lighthouse)は主砲と排熱口の破壊、弱点への段階的な攻撃を説明 | 本体1行の計算では攻略条件を表せない |
| M25 | [Operation Paint it Blue](https://acecombat.wiki.gg/wiki/Operation_paint_it_blue)は建造途中の2隻の主砲を起動し、航空部隊がその砲座を攻撃したと説明 | 主砲ID372を残す判断を支持。本体へのダメージ可否までは示さない |

Wikiは検索サービス取得本文を確認。ゲーム内攻略・物語の二次資料であり、モデルIDや実行処理の証明ではない。同梱表の本体・子NPCの対応（3・5節）と区別する。実ゲーム測定は行っておらず、本体HPへのダメージが全状況で不可能と断定しない。

### 変更範囲

| 対象 | 変更 |
| --- | --- |
| 本体ID147・371・494・247・226 | categoryをEXCLUDEDへ変更。計9出典を`approved-local002-land-battleship-body`として除外指定 |
| 本体ID330・代理用ID496・261 | 既存EXCLUDEDを維持。これで本体8行はすべて非表示 |
| 部位24行 | 掲載・名前・値・親参照を保持。親がEXCLUDEDでも部位は表示可能 |
| `data/local/catalog.json` | 固定ID・出典を保持した生成入力。Git管理外 |
| `src/data/targets.json` | 正規生成。HEAD（f9329a9）との差分は330を含む本体6行のcategoryのみ |
| 単体・ブラウザーテスト | 本体の初期選択・候補・結果・旧保存からの除去と、部位の表示・復元を検証 |

ID372のpartOfは147のまま。371への修正根拠は確定しているが、前の実装保留指示を維持し、部位の識別表記と合わせて別途扱う。本体の固定IDは除外後も存在するため、親修正のために新規IDは不要。

### 検証結果

変更前に単体テストがGROUND／EXCLUDEDおよび本体の残存で失敗し、変更後は92テスト成功。Chrome8シナリオ成功。旧保存の本体8行・Q002ダミーを除去しても、M25主砲372・M19対空砲248を結果と候補へ表示できることを確認した。部位24行すべての掲載と部位表示オフ時の非表示は単体テストで確認。

全506行、掲載314行・EXCLUDED192行。1459元定義と固定ID・名前・並び順・計算値・missionVariant・partOfを保持。除外指定282件はすべてEXCLUDEDへ対応。再生成した配信3ファイルのSHA-256が一致した。pnpm typecheck・lint・format:check・buildが成功。参照資料なしの別コピー検証は今回再実行していない。

本体掲載の判断待ちは解消。残るQ003は部位の識別表記・表示切替とID372の親参照修正。M24の先行変更を含め、後続のユーザー指示により`2730007`へローカルコミット済み。


## 14. 本体非表示を前提とした部位表記・親参照の整理（提案、未実装）

ユーザーの追加意見と再解析を受け、SUB CATERPILLAR・THRUSTER・属性未確認の注記に関する案を15節で更新した。以下の表は初回提案の履歴。

### 14.1 前提と記法

本体除外は`2730007`（`fix(data): 陸上戦艦の本体を掲載対象から除外`）へコミットし、直後の作業ツリーがクリーンであることを確認した。今回の後続作業は調査・提案文書だけであり、catalog・配信データ・アプリ・テストは変更しない。

目的は、本体行を見なくても部位の所属や同名行の差が分かること。部位24行を統合・削除せず、固定ID・数値・出典を保持する。

| 記法 | 用途と例 |
| --- | --- |
| `部位名 (識別情報)` | 部位自体の区別。例: `THRUSTER (左側)` |
| `《所属する艦》` | 本体が非表示でも所属を示す。例: `《LAND BATTLESHIP 2》` |
| `《LAND BATTLESHIP (ROCKY ISLAND)》` | M25の建造中艦群の識別。正式艦名ではなく、アプリが付加する説明名 |
| 末尾の`[M9]`等 | 従来どおり任務差分。単なる出典任務を示すためには追加しない |

**推奨:** missionVariantと表示切替を維持し、表示名による区別と372の親参照だけを変更する。M25出典だからという理由で372へmissionVariantを追加しない。任務表示オフでもTARGET PARTSオンなら現状どおり372を表示する。

### 14.2 識別を検討する10行

| ID | 現在の部位名・所属 | 確認した差 | 推奨表記案 |
| ---: | --- | --- | --- |
| 372 | MAIN GUN《LAND BATTLESHIP 1》 | M9の1番艦ではなくM25のGR039系。HP80 | `MAIN GUN《LAND BATTLESHIP (ROCKY ISLAND)》` |
| 151 | SUB CATERPILLAR《LAND BATTLESHIP 1》 | SubCatモデル、HP40、isAir・ROLE未確認 | 現状維持 |
| 152 | SUB CATERPILLAR《LAND BATTLESHIP 1》 | SubCat_Coreモデル、HP300、isAir=false・ROLE=ship | `SUB CATERPILLAR (CORE)《LAND BATTLESHIP 1》` |
| 154 | THRUSTER《LAND BATTLESHIP 1》 | 元定義R1/R2、HP40、通常ダメージ経路未確認 | `THRUSTER (右側)《LAND BATTLESHIP 1》` |
| 488 | THRUSTER《LAND BATTLESHIP 1》 | 元定義L1/L2、HP160、共通耐性 | `THRUSTER (左側)《LAND BATTLESHIP 1》` |
| 153 | THRUSTER《LAND BATTLESHIP 1》 [M9] | 488と同じL1/L2。任務耐性が異なる | `THRUSTER (左側)《LAND BATTLESHIP 1》 [M9]` |
| 248 | AA GUN《LAND BATTLESHIP 2》 | AAGunモデル、HP40、isAir=false・ROLE=ship | 現状維持 |
| 249 | AA GUN《LAND BATTLESHIP 2》 | AAGun_BIモデル、HP40、isAir・ROLE未確認 | `AA GUN (属性未確認)《LAND BATTLESHIP 2》` |
| 254 | VLS《LAND BATTLESHIP 2》 | EXSAM_BIモデル群、HP40、isAir=false・ROLE=ship | 現状維持 |
| 258 | VLS《LAND BATTLESHIP 2》 | VLSMモデル、HP40、isAir・ROLE未確認 | `VLS (属性未確認)《LAND BATTLESHIP 2》` |

COREは元モデル名にある識別子に限定した表記。「装甲」「装甲破壊後」「内部弱点」などのゲーム上の機能は未確認なので付けない。代案は151を`SUB CATERPILLAR (HP 40)`、152を`SUB CATERPILLAR (HP 300)`とする方法。確定数値だけで区別できるが、HP列と重複し、部位の意味は伝わらない。

左側・右側は元定義のL/Rからの解釈であり、今回は実ゲームの位置を測定していない。488と153は対地ミサイル倍率が約0.6→1、対艦ミサイル倍率が0.5→1になる差を持つ。爆風耐性は共通・任務で維持されるため、左右と耐性差を同じ識別子でまとめない。

249は任務のBI行に加えて共通NPCのB2行を含むが、すべて同じAAGun_BIモデルを参照する。248/249と254/258はそれぞれHP・全耐性・standardDamageが一致し、配信計算属性の差はisAir・ROLEの確認状況だけ。属性を補完して統合せず、強化型・耐性型とも呼ばない。

「属性未確認」は当該の同名行を区別する暫定注記であり、付いていない全ターゲットの属性確認済みを意味しない。ゲーム内の位置・外見を識別できる名称ではない点が限界。内部名をそのまま使う代案は`AA GUN (BI)`および`VLS (EXSAM)` / `VLS (VLSM)`だが、利用者に意味が伝わらないため推奨しない。物理的な配置やフェーズによる名称を求める場合は追加調査が必要。

### 14.3 改名不要の14行

| 所属 | IDと部位 |
| --- | --- |
| LAND BATTLESHIP 1（M9由来） | 148 AA GUN、149 CASEMATE GUN、150 AIRBURST GUN、155 VLS |
| LAND BATTLESHIP 2（M19由来） | 250 CORE UNIT、251 BREACH、252 CIWS、253 HEAT VENT、255 MAIN GUN、256 SAM、257 AIRBURST GUN |
| LAND BATTLESHIP 3（M17由来） | 227 AA GUN、228 MAIN GUN、229 AIRBURST GUN |

いずれも現行の`部位名《LAND BATTLESHIP 番号》`を維持する。所属だけで区別でき、艦名や任務ラベルを全行に追加する必要はない。14.2の現状維持3行と合わせ、推奨案での改名は7行に限定する。

### 14.4 任務番号を表示したい場合の代案

372を`MAIN GUN《LAND BATTLESHIP (ROCKY ISLAND)》 [M25]`にする案は残せる。ただし現行設計ではmissionVariantを内部25day2へ変更し、MISSION VARIANTSオフで非表示になる。現在はTARGET PARTSだけで表示できるため、この操作上の変化まで合意が必要。全出典任務を表示しつつ表示切替を変えない方法は、任務差分と出典任務を分ける設計変更が必要になるため、今回の最小案に含めない。

### 14.5 ID372の親参照修正案

**確定:** `DT_NPC_Mission025day2`の主砲3出典が指す子NPCは、`GR039_ldbs4_B_01`と`GR039_ldbs4_C_01`のChildNPCIdに存在する。両親はID371へ統合されている。ID147のGR036_ldbs1_01の子一覧には該当主砲がない。元表を今回も再照合した。

**提案:** ID372の`partOf: 147`を`371`へ修正する。371はEXCLUDEDのまま保持する。部位の計算値や表示条件は親から継承しないため、親を正しても主砲を非表示にはしない。表示ラベルのROCKY ISLANDは部位名に保持し、非表示本体のnameを変更する必要はない。内部ID・HP80・全耐性・属性・3出典・並び順は維持する。

| 実装を合意した場合の対象 | 変更案 |
| --- | --- |
| `data/local/catalog.json` | 採用した表示名7行と372のpartOfのみ。Git管理外 |
| `src/data/targets.json` | 正規生成による同内容の反映 |
| `src/data/land-battleship.test.ts`と固定資料 | 元ChildNPCIdに基づく親371の検証、部位24行・計算値・表示条件の維持 |
| `tests/app.spec.ts` | 新名の検索、旧ID372の選択復元、部位／任務表示の4条件を検証 |

本体8行の除外、既存の`?`、固定IDを保持する。再生成の一致を確認する。現時点でコード変更・テスト実行はなし（調査・提案文書のみ）。本体除外コミットに記録した92テスト・Chrome8シナリオの成功は、未実装の表記・親参照案の検証結果ではない。

- [x] 本体除外をコミットする
- [x] 掲載部位24行と同名の原因を整理する
- [x] 元NPCの子一覧からID372の正しい親を再照合する
- [x] 部位表記と任務表示切替の方針を合意する
- [x] 合意後に改名・親参照修正を実装し検証する


## 15. 部位名の簡略化と未確認属性の再解析（調査時点の記録）

この節の「未反映」は調査時点の状態。後続の実装・検証は16節を参照。

2026-11-03。ユーザーから、SUB CATERPILLARの所属艦名省略、同条件のTHRUSTERの左右修飾省略、属性未確認という文言を名前に入れる前の調査を求められた。既存の抽出済みBlueprintと現行EXEを読み取り、調査専用スクリプトのメモリ内で読取方法を変更した。ゲーム・既存の解析スクリプト・catalog・配信データは変更していない。

### 15.1 今回の結論と表記案の更新

| 対象 | 確認結果 | 更新する案 |
| --- | --- | --- |
| SUB CATERPILLAR 151・152 | 全506行でこの2行だけ。他の所属艦との衝突なし。両方とも静的属性はisAir=false・ROLE=shipと確認。HP40／300の差は残る | `SUB CATERPILLAR`と`SUB CATERPILLAR (CORE)`。両方から`《LAND BATTLESHIP 1》`を省くがpartOfは維持 |
| THRUSTER 154 | 元モデルR1/R2は各HP40。基準表が参照するBP_TMP系資産を手元で読めず、処理・属性は未確認 | 左側と同条件とは扱わない。改名・統合・掲載変更は保留 |
| THRUSTER 488・153 | 元モデルL1/L2は各HP160。isAir=false・ROLE=shipと確認。L1/L2同士は計算条件が共通だが、共通行488とM9行153の耐性差は残る | L1/L2を分ける修飾は不要。共通行と`[M9]`行は維持。左右の修飾採否は154の扱いと合わせて再整理 |
| AA GUN 248・249 | 未確認だった249もisAir=false・ROLE=ship。HP・全耐性・standardDamage・親・任務条件は248と一致 | `(属性未確認)`案を撤回。属性反映後に同条件行を統合する案 |
| VLS 254・258 | 未確認だった258もisAir=false・ROLE=ship。HP・全耐性・standardDamage・親・任務条件は254と一致 | `(属性未確認)`案を撤回。属性反映後に同条件行を統合する案 |

COREは元モデル名による識別であり、「装甲破壊後」を確定したものではない。THRUSTERの左右は現状HP40／160で異なり、処理も比較し切れていないため、「共通なら修飾不要」の条件はまだ満たさない。左側のL1/L2は既に統合されており、新しく枝番を付ける必要はない。

統合案は249→248、258→254を表示上の代表とするもの。実装する場合は出典を失わず、旧IDを再利用せず、旧保存で249・258だけを選んでいた場合も選択を代表行へ引き継ぐ方針を併せて整理する。現時点では属性反映・統合・保存移行は未実装。

### 15.2 読取失敗の原因

既存`collect_npc_evidence.py`は`parse_blueprints.py`のクラス先頭プロパティをすべて4バイト整数として読み進めていた。失敗したクラスのヘッダーはインデックス2・7・9を持ち、インデックス2は配列であるため、読取位置が4バイトずれた。後続の親クラス参照確認でAssertionErrorとなり、既存記録には空文字列のエラーだけが残っていた。未知の属性値が元資産に欠落していたわけではない。

現行EXEのBlueprintGeneratedClass反射情報（`0x14bc40030`、RigVMBlueprintGeneratedClassの親参照から到達）により、インデックス2は`DynamicBindingObjects`、型22=配列、要素型82=オブジェクト参照と確認。対象では要素数1と参照を読む必要があり、4バイトではなく8バイトを消費する。調査用読取では反射情報の型に従って読み進め、その後の親参照・フィールド・CDO境界を検証した。値を推測してエラーを無視したものではない。

### 15.3 得られた静的属性と確認強度

| Blueprint | CDO読取バイト数 / 定義長 | GameObjectCategoryの値とuexp位置 |
| --- | --- | --- |
| BP_GR037_ldbs2_AAGun_BI_C | 127 / 127 | 6、612バイト目 |
| BP_GR037_ldbs2_VLSM_C | 119 / 119 | 6、768バイト目 |
| BP_GR036_ldbs1_SubCat_C | 250 / 250 | 6、691バイト目 |
| BP_GR036_ldbs1_Thruster_Base_C | 104 / 104 | 6、353バイト目 |
| BP_GR036_ldbs1_Thruster_L1_C・L2_C | 各72 / 72 | 上記Baseを継承し、区分の上書きなし |

位置は0始まりのuexp絶対オフセット。Category=6は既存計算のship区分。対象のBlueprint継承全段についてCDOを最後まで読み切り、bIsAirの上書きがないことを確認した。追加の比較対象AAGun、SubCat_Core、EXSAM_BIのL1/L2/R1/R2を含め、11モデルを読取エラーなしで確認した。

bIsAirはnative側でLiveAIGameObjectが`0x147c7c8d6`にて1を設定した後、派生LiveAIUniqueObjectBaseが`0x147e5d78f`にて0を設定する。後者は冒頭で0にしたr15dの下位バイトr15bを書き込む。書込までの命令でr15の追加書換えがないことを再照合した。LiveAIUniquetTargetObjectもこの基底コンストラクターを呼び、対象のBlueprintもbIsAirを上書きしない。既存のstandardDamage=trueと整合するLiveAIGameObject継承も保持される。

配信データをメモリ上だけで比較し、249・258のisAirとroleGroupを上記確認値へ置き換えると、248/249と254/258はID・order以外の全フィールドが一致することを確認した。統合可能という判断はこの比較に基づく。151と152、488と153は属性確認後もHPまたは耐性が異なる。

### 15.4 THRUSTER右側の制約

基準表`DT_NPC_Model`はR1/R2に`/Game/Blueprints/Gadget/G6510/Weapon/BP_TMP_GR036_ldbs1_Thruster_R1`・`R2`を指定する。L1/L2の`Vehicle/AI/GroundVehicle/GR036_ldbs1`とは抽出対象の場所が違う。手元のnpc-rawと同梱rawに右側資産はなく、未使用や削除済みと断定できない。

既存retocで対象名に限定した追加抽出を試みたが、暗号鍵不足で開始前に失敗した。過去の抽出記録に鍵利用の記載はあるものの、今回利用できる鍵の保管先は確認できていない。したがって右側の動作・用途・掲載可否は未確認のままとする。HP40は基準のモデル表で確認済みであり、左側160へ補完しない。ゲームへの書込・起動はしていない。

### 15.5 再現資料と未反映の範囲

調査専用ファイル（ともにGit管理外）:

- `data/local/investigate-land-parts.py`: 既存collect_npc_evidenceの初期化部分だけを再利用。解析器をメモリ内で差し替え、既存出力を上書きしない。
- `data/local/land-parts-followup.json`: 型情報、Blueprintごとの読取長・属性・位置・ハッシュ、native命令、モデル別の解決結果を保存。

```powershell
python -B data/local/investigate-land-parts.py 'D:/Steam/steamapps/common/ACE COMBAT 8/Game/Binaries/Win64/AceCombat8.exe'
```

| 資料 | SHA-256 |
| --- | --- |
| 現行EXE | `3e47fd42858d1f2b81e59d7f57394a014c0eb6aaf4c02ee3da351b6a42936be2` |
| 調査スクリプト | `691b90a5eea677c3d4f46dec7ace3a5ae2e0b7fc080d208e7197567f4ea98641` |
| 調査結果JSON | `8062ac41fbc89f4790549c4320341aecd7ba9581db8e48ba5bf805e7f2a8bdd5` |
| AAGun_BI uexp | `d564adf7f10354b2f301fba8540b4a108159f236d52f3a4f3e23ec5294fc7825` |
| VLSM uexp | `d269b54fdcd1527f3bd269d6f131cf10fda588e41cd903a05022b4648d69ce38` |

**確認済み:** 既存抽出資産と対応する現行EXEにおける静的な初期属性。**未検証:** 基準build 25201480との同一性、イベント実行後の属性変更、実ゲーム測定。既存の補足属性と同じ確認水準であり、ビルド差を解消した意味ではない。

今回の調査で新たに解決した配信行は151・153・488・249・258。ただしcatalog・npc-evidence・配信用JSONへはまだ反映しない。同じ読取不具合がほかの未確認行にもある可能性はあるが、今回の結果を未解析の行へ一括適用しない。

既存catalog（SHA-256 `b9a757dd38f5ee0f1df2b3cde2baa5500a115862f17ae8ecdb543b588ad3bb8e`）、npc-evidence（`a538a2f20f3e0bb002787f82c4d3d40d2782de9f20c0408d33468ca51cbe3b7a`）、targets（`ba1b48925a538486f0d57c844c781da86bfd601f6f5818029db380e4359f5f8f`）の内容維持を確認した。アプリのテスト・ビルドは再実行していない（アプリ変更なし）。ID372の親参照修正案とROCKY ISLAND案は引き続き未実装。調査文書とローカル調査用ファイルのみを更新し、コミットは行っていない。


## 16. 合意した部位変更の実装と検証

2026-11-03、ユーザーがSUB CATERPILLAR表記、確認済み属性、AA GUN・VLSの統合、372の親参照とROCKY ISLAND表記の実装・検証・コミットを指示した。変更前HEADは`2730007`。開始時の未コミット差分は本書14・15節の調査記録のみで、今回の実装記録と合わせてコミット対象に含める。THRUSTER左右表記・右側掲載判断は次の議論へ残す。

### 実装内容

| 対象 | 反映内容 |
| --- | --- |
| ID151・152 | `SUB CATERPILLAR` / `SUB CATERPILLAR (CORE)`。所属ラベルを省き、partOf=147を保持 |
| ID151・153・488・249・258 | isAir=false・roleGroup=ship。15節の静的確認値を反映し、HP・耐性・standardDamageは維持 |
| ID249→248、258→254 | 代表行へ計9出典を追加。旧2行は固定ID・出典・値を保持してEXCLUDED。代表行は14出典／5出典となり、正規生成で全出典の計算条件一致を照合 |
| 保存復元 | `src/data/target-merges.ts`の対応表により249→248、258→254へ変換してから掲載対象を照合。両IDが選択済みの場合は重複除去。旧IDのみの選択も維持 |
| ID372 | `MAIN GUN《LAND BATTLESHIP (ROCKY ISLAND)》`、partOf=371へ修正。missionVariant=null・HP80・3出典は維持。部位表示オンなら任務差分表示オフでも表示 |
| 調査用読取処理 | `collect_npc_evidence.py`はBlueprintGeneratedClassの反射情報からクラス先頭の各型を読むよう修正。DynamicBindingObjects配列を単一の整数扱いしない |
| 根拠資料 | `src/test/fixtures/land-parts-evidence.json`に抽出CDOの属性・位置・ハッシュ、元NPCの子一覧、調査EXEのハッシュを保存。参照資料を同梱しなくても回帰テストを実行可能 |

統合元のcategory=EXCLUDEDは旧IDの表示停止であり、元NPCを掲載範囲外にする意味ではない。元定義のexclusions指定は282件のまま維持した。旧出典は代表行と履歴行の両方に保持し、uniqueな元定義集合は1459件のまま。旧IDの再利用・全IDの採番変更はない。

保存形式はversion=1のまま。表示フラグを変更せず移行するので、部位を非表示にして保存していた選択も保持する。選択なしの保存から代表行を勝手に追加しない。未知IDや掲載対象外の本体IDは従来どおり除去する。移行後の保存・再読み込みでも結果が変わらない。

### 検証結果

| 検証 | 結果 |
| --- | --- |
| Red/Green | 旧ID選択の移行前失敗、部位数と属性の反映前失敗を確認してから変更。最終95テスト成功 |
| 計算とデータ | 確認属性でMSLの命中数を算出。旧IDと代表行はid・order・category以外の全項目が一致。元ChildNPCIdの固定資料と372の親を照合 |
| 保存・表示条件 | 旧IDだけの選択、代表IDとの重複、全解除、部位非表示中の保存、書込後再読込を確認。部位／任務差分の4条件で選択を維持 |
| Chrome | 10シナリオ成功。追加の1440px・390pxで旧保存移行、新名検索、重複行の非表示、4表示条件と再読み込みを確認 |
| 型・静的検査・ビルド | pnpm typecheck・lint・format:check・build成功 |
| 再生成 | targets・weapons・modifiersの3ファイルが再生成前後でSHA-256一致 |
| 読取処理 | 修正したcollectorの初期化・対象読取だけを実行。13 BlueprintのCDOがすべてエラーなし・定義長と消費長一致・15節の属性と一致。全件collector実行による他行への変更は行っていない |

追加Chromeテストの初回は、テストの初期化スクリプトが再読込時にも古い保存を投入したため失敗した。既存保存がある場合は初期化しない準備へ直し、10シナリオすべて成功を確認した。アプリの保存処理の障害ではない。

配信全506行を変更前と比較し、差分は151のname/isAir/roleGroup、152のname、153・488のisAir/roleGroup、249・258のcategory/isAir/roleGroup、372のname/partOfだけ。全ID・order・HP・全耐性・missionVariantは維持した。代表行248・254は配信値の変更なし。掲載312行・EXCLUDED194行、陸上戦艦の掲載部位22行。THRUSTER154の配信値は完全一致、153・488も名前と耐性差は維持。

ビルド差、実ゲームの任務イベント後の状態、右側Thrusterの参照資産未取得という制約は残る。参照資料なしの独立コピー検証は今回再実施していない。新しい回帰テストはGit管理の固定資料だけを参照する。ゲーム本体・設定・セーブ、push・PR作成は変更範囲外。

- [x] SUB CATERPILLARの所属表記を省略する
- [x] 確認した5行の属性を反映する
- [x] AA GUN・VLSを同条件として統合し、固定IDと旧保存選択を保持する
- [x] 372の親参照とROCKY ISLAND表記を反映する
- [x] 単体・Chrome・型・Lint・整形・ビルド・再生成を確認する
- [x] THRUSTERの左右表記と右側掲載判断を別途議論する

この時点ではTHRUSTERを残件とした。後続の18節で掲載判断と実装を完了した。


## 17. THRUSTER左右差に関する外部照合（調査のみ）

2026-11-03、ユーザーから実ゲームで左右差があるのか疑問が示され、コミュニティでの言及を調査した。開始時HEADは`aa02ffb`、作業ツリーはクリーン。今回の変更は本節の追記だけで、名前・分類・数値を変更しない。

### 確認した公開資料

| 資料 | 確認できる記載 | 確認できないこと |
| --- | --- | --- |
| [Ace Combat Wiki: The Land Battleship Blockade](https://acecombat.wiki.gg/wiki/The_Land_Battleship_Blockade) | 最後に左舷のTGTスラスターを破壊すると任務終了。検索サービス取得本文で確認 | 右舷の攻撃可否、左右のHP・必要命中数の比較 |
| [PowerPyx: Mission 09節](https://www.powerpyx.com/ace-combat-8-all-ace-s-ranks-walkthrough/) | 左舷の2基を破壊し、それぞれ複数回の命中が必要と説明。本文を直接確認 | 2基の耐久差や、右舷に攻撃可能な別ターゲットがあるという報告 |
| [Reddit: Any tips on Mission 9 for a newbie?](https://www.reddit.com/r/acecombat/comments/1xakz1e/any_tips_on_mission_9_for_a_newbie/) | 終盤の目標としてロケットスラスターへの攻撃を案内。本文を直接確認 | 左右の性能差・右舷のHP40という実測 |

日本語・英語の「スラスター」「thruster(s)」に左右・左舷／右舷・port／starboard・health・M9・Xanthosを組み合わせ、Wiki・攻略記事・Reddit・Steam Community等の検索結果を確認した。調べた範囲では、ゲーム内の左右ターゲットにHP差があるという比較報告や実測は見つからなかった。検索で見つからないことを、報告の不存在や左右同一の証明にはしない。攻略記事同士が同じ情報を参照している可能性もあり、独立した実測の件数として数えない。

### 元定義との差の扱いを訂正

`DT_NPC_Mission010`を再確認し、THRUSTERとして直接登録されるのは`ldbs1_Boss_Thruster_L1`と`ldbs1_Boss_Thruster_L2`だけ。どちらもモデルHP160で、M9のID153へ統合されている。ID488は同じ左側L1/L2の共通耐性条件であり、別の左右2基を表す行ではない。

右側ID154は`DT_NPC/GR036_ldbs1_Thruster_R1`・`R2`という共通定義の取り込みで、HP40。親NPCのChildNPCIdには存在するが、M9任務表への直接登録はない。親から生成される可能性はあるため、任務表にないことだけで未使用・攻撃不能とは確定しない。参照するBP_TMP系Blueprintの未取得という15.4節の制約も残る。

**訂正:** 「左側160・右側40」は元モデル表の値の差であり、実ゲームで攻撃できる左右のTHRUSTERに耐久差があると確認した意味ではない。特に、攻略で攻撃する2基は左舷のL1/L2という説明と整合し、その2基を左右で異なる耐久のターゲットとして扱う根拠はない。

**現時点の判断・提案:** 左右の修飾を表示名へ付ける根拠は不足している。左側L1/L2の統合を維持し、153と488の任務耐性差を保持する。右側154は同条件へ推測統合せず、攻撃対象としての掲載根拠を別途判断する。非表示候補にはなるが、今回は除外決定・実装をしない。追加確認の焦点は、右側がプレイヤーの独立した撃破対象になるのかであり、左右のHP数値を並べることではない。

実ゲームの起動・測定・新しい資産抽出は未実施。アプリ変更なしのためテスト・ビルドは再実行せず、調査記録のみ未コミットで保持する。

## 18. THRUSTER右側の除外と最終検証

2026-11-03、ユーザーが右側ID154をEXCLUDEDとし、左右修飾を付けず、153と488の任務耐性差を維持する方針を承認した。変更前HEADは`aa02ffb`。開始時の未コミット差分は17節の調査記録だけで、今回の結果とともにコミットする。

### 変更内容と根拠

| 対象 | 反映内容 |
| --- | --- |
| ID154 | categoryだけをGROUNDからEXCLUDEDへ変更。固定ID・名前・HP40・耐性・属性・partOf=147・順序・出典を維持 |
| ID488 | `THRUSTER《LAND BATTLESHIP 1》`、HP160、共通条件を維持 |
| ID153 | `THRUSTER《LAND BATTLESHIP 1》 [M9]`、HP160、内部missionId=10を維持 |
| 旧保存 | 154だけを復元対象から除去し、153・488の選択を維持。154を他IDへ置き換えず、154だけの選択は空になる |

153・488には左右の修飾を付けない。共通488のgroundMissile=0.5999999642372131・antiShipMissile=0.5、M9の153の両倍率=1を含む全計算値を保持した。L1/L2が同じ条件としてまとまることと、共通／任務間の耐性差は区別する。

Git管理外の`data/local/catalog.json`で154をEXCLUDEDにし、`DT_NPC/GR036_ldbs1_Thruster_R1`・`DT_NPC/GR036_ldbs1_Thruster_R2`の2出典を`approved-local002-thruster-right`として除外指定した。正規の生成コマンドで配信データを更新。全506固定ID・1459元定義を保持し、掲載311行・EXCLUDED195行、GROUND69行、陸上戦艦掲載部位21行、除外指定284件となった。`aa02ffb`との全行比較で、配信データの変更が154のcategoryだけであることを確認した。

右側の攻撃不能・未使用を確定した変更ではない。17節の静的データ・公開資料と、ユーザーの掲載方針に基づく除外である。BP_TMP資産の未取得、実ゲームでの独立ターゲット化と被弾処理の未確認は残す。

### 検証結果

追加単体テストで変更前の154=GROUNDおよび掲載部位22行による失敗を確認し、変更後は96テスト成功。初期選択、旧保存の除外、154単独選択、部位・任務表示の4条件、検索候補・選択結果、153・488の名前と耐性差を検証した。

Chromeの10シナリオ成功。1440px・390pxで旧保存から154を除去し、153・488を表示切替後も保持、THRUSTER検索候補が共通条件だけなら1行、任務差分込みなら2行になることと再読込を確認した。追加検証の要素指定が複数要素に一致して一度失敗したため、パネル単位へ修正して再実行した。

`pnpm typecheck`・`pnpm lint`・`pnpm format:check`・`pnpm build`成功。`pnpm generate:data`再実行でtargets・weapons・modifiersの3ファイルがSHA-256で一致した。参照資料なしの独立コピー検証は今回再実施していない。ゲーム本体・設定・セーブの変更、push・PR作成は行っていない。

Q003の掲載判断・表記・属性・統合・親参照の合意済み対応は完了。R001〜R006、Q001・Q002も完了済みのため、local_002を`spec/agent/complete/local_002/`へ移す。初期設計から残る技術的な未確認事項は完了扱いにせず、既存の根拠資料・課題一覧で保持する。
