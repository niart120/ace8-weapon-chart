# 陸上戦艦の同名行と掲載範囲の調査

調査日: 2026-11-03。Q002の代理用ダミー除外と分けて、ユーザーと議論するQ003の資料。後続の承認により、M24に続いて本体行をすべてEXCLUDEDへ変更済み（12・13節）。部位24行は掲載を維持。名前・親子関係の変更は未実装。

## 1. 目的と確認範囲

`LAND BATTLESHIP`を含む32行について、固定ID、元定義、表示名キー、任務耐性、計算属性、親子関係を比較した。うち2行はQ002で非表示にした採点用ダミー。後続の承認により通常本体6行も非表示とし、現在は部位24行が掲載対象。

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
- [ ] 部位の識別表記と表示切替の方針を決める
- [ ] 合意後に必要な親参照・ラベル修正と検証を行う

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

以下は本体の掲載判断前の案。本体除外の採用により147・371の改名・任務フラグ変更案は取り下げる。372など部位側の識別案だけを引き続き検討し、まだ実装しない。

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

本体掲載の判断待ちは解消。残るQ003は部位の識別表記・表示切替とID372の親参照修正。M24の先行変更を含め未コミット。
