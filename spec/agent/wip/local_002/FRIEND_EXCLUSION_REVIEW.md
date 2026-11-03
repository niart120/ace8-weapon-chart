# 友軍候補の除外設定見直し調査

2026-11-03。対象HEAD: `6269d6d`。状態: 除外方針を承認・反映済み。1〜7節は承認前の調査記録、8節が最終決定。開始時のGit作業ツリーはクリーン。

## 1. 目的と範囲

Q001のQUEEN・GREEN等について、追加除外を判断する材料と、除外する場合の正確な元定義範囲を整理する。実装・catalog・配信用JSON・ゲーム本体・設定・セーブは変更していない。追加のゲームファイル抽出・実ゲーム測定も行っていない。

同梱のbuild 25201480のNPC・モデル・任務表と文字列を主な根拠とする。追加解析の別ビルドの属性を、旧ビルドの実際の所属値として転用しない。今回の調査文書は除外承認を意味しない。

## 2. 確認資料

| 資料 | 用途 |
| --- | --- |
| `data/local/catalog.json`、`src/data/targets.json` | 現在の分類、固定ID、統合元、親子関係 |
| `docs/initial/ref/tables/DT_NPC.json`、`DT_NPC_Model.json`、`DT_NPC_Mission*.json` | 表示名キー、AI設定、最低HP、NPC子参照 |
| `docs/initial/ref/reports/target_display_names.json` | QUEEN・GREEN・ENDURANCE等の表示文字列 |
| `docs/initial/ref/indexes/native_schema.json`、`native_enums.json` | 所属を保持する別の構造が存在することの確認 |
| `docs/initial/ref/indexes/assets.txt` | 未取得のブリーフィング・Lua定義の所在候補 |
| `data/local/npc-evidence.json` | 既存のBlueprint継承・計算属性の調査範囲確認。所属を確定する資料ではない |

関連: [前回の候補一覧](TARGET_SCOPE_AUDIT.md)、[既存の除外合意](../../../../docs/analysis/friend-candidates/FRIEND_CANDIDATES.md)。

## 3. 確認できた事実

### 3.1 既存の除外設定に復活・登録漏れはない

catalogの合意済み199任務行、M25の追加2行、ALCMの2行、計203の指定元定義はすべてEXCLUDEDの表示行に対応している。今回の候補は、これらとは別の元定義である。

表示名キーのAlly/Friendも調べると、既存除外集合外の43任務行が20表示行に対応する。内訳はQUEEN 36、PURPLE MAGIC 4、M15のGREEN 1が1、ENDURANCE本体2。これは前回の調査と一致した。

### 3.2 QUEEN: 13表示行と共通NPC5行も対象範囲に含める必要がある

モデル表示名・ブリーフィング名のキーは`ContainerAllyCallsign_Name_Queen1`〜`Queen4`。NPC側にもLittleBee・Vaquero・Coyote・SolaceのAllyCallsignキーがある。既存EXCLUDEDのF/A-18E系PV用QUEENとは別のF/A-18C系定義である。

掲載対象は13表示行。M7・M11の8任務行はMinHealth=1、残りは0。QUEEN 1 [M19]のHPは1002、他は57。最低HPやHP増量は所属判定に使わない。

任務36行に加え、通常表示行の出典には`DT_NPC/OP1007_f18c_Queen01`、`Queen01_MS19`、`Queen02`、`Queen03`、`Queen04`の5行が含まれる。任務表側だけ除外して共通設定を残すと、QUEENの通常表示行が残り得る。13表示行を掲載対象外とする判断なら、この計41出典をセットで明示する必要がある。

### 3.3 PURPLE MAGIC: 4表示行、M4の4元定義

モデル表示名に`ContainerAllyCallsign_Name_Purplemagic1`〜`4`がある。現在のID 22〜25は各1任務行だけを出典に持つため、別任務・通常F-15Cを巻き込まず個別指定できる。

BaseScore=700、LuaSetId=`NLID_0021_CP`。同じLuaSetIdは通常機やAlly命名の別機体にも使われるため、得点・LuaSetIdを所属確定の根拠にはしない。

### 3.4 GREEN: M15とM28を分けて扱う

| 項目 | M15の旧呼称側 | M15のGREEN 1側 | M28の除外済みGREEN 1 |
| --- | --- | --- | --- |
| NPC | `OP1022_f16c_MS15` | `OP1022_f16c_Viride_01` | `OP1022_f16c_Ally_Viride_01` |
| 呼称キー | `ContainerAllyCallsign_Name_Viride` | `ContainerEnemyCallsign_Name_Green1` | 空文字 |
| 解決文字列 | GREEN | GREEN 1 | NPCの第2表示名なし |
| LuaSetId | `NLID_0012_CP` | `NLID_0012_CP` | `NLID_0400_CP` |
| BaseScore | 500 | 500 | 380 |
| 表示行 | ID 209 GREEN 1 | 同じID 209 | ID 445、EXCLUDED |

M15の2NPCは全フィールド比較で、AirframeSkinIdとGameObjectDisplayName02だけが異なる。任務行もNpcId以外は全項目一致。モデル・Blueprint・AIモジュール・HP・耐性・FCS設定は同じ。表の「旧呼称側」は比較用の呼び方であり、定義が旧版・未使用と確認できた意味ではない。

M15のGREEN 2（ID 211）は`ContainerEnemyCallsign_Name_Green2`を持つ別NPC。M28のGREEN 2（ID 446）は既にEXCLUDED。

M15とM28はモデル・Blueprintを共有するが、NPCのLuaSetId・FCS・得点等に差がある。M28を除外した合意をM15へ広げる根拠にはならない。M15の2つの呼称は敵味方の異なる状態を意味する可能性も、呼称・スキン違いだけの定義である可能性もある。現時点でどちらかに確定しない。

ID 209の一方の出典だけを除外しても、他方が残るためGREEN 1の表示は残る。ユーザーに見えるGREEN 1自体を消す判断と、味方用呼称を持つ出典だけを分離する判断は異なる。

### 3.5 ENDURANCE: 本体だけでなく部位の統合元を確認する必要がある

M11 `edrne`とM30 `edrne_ms30`は、NPC `VE024_edrne_02_wing`の`ContainerAllyCallsign_Name_Endurance`を使う。本体はID 162（HP680）と461（HP235）で、461には共通NPC出典も含まれる。既に除外済みのM3 ENDURANCEとは別定義。

本体のChildNPCIdに対空砲4基・艦砲2基があり、現行マスタでは次のように統合されていた。

| 部位 | 表示ID | ENDURANCE由来の出典 | 他艦の出典 | 除外判断時の注意 |
| --- | ---: | ---: | ---: | --- |
| AA GUN《AIRCRAFT CARRIER》 | 124 | M11の4任務行＋共通NPC4行＝8 | 12 | 行全体を除外してはいけない |
| NAVAL GUN《AIRCRAFT CARRIER》 | 163 | M11の2任務行＋共通NPC2行＝4 | 0 | 本体を除外するなら部位も判断対象 |

AA GUNの他12出典はM9・M25後半・M26の`kuzn`系。これらをENDURANCEの判断で除外しない。NAVAL GUNの出典はすべて今回のENDURANCE系である。

両部位のpartOfはID 123（別のAIRCRAFT CARRIER）を指す。同名本体・同条件部位の統合があるため、partOfからID 162・461の子だけを抽出すると、この12出典を見落とす。除外判断はNPCのChildNPCIdとsourceRefsに戻って行う。

## 4. 所属の確定に不足している情報

NPC・モデル・任務表の項目には、その行だけで敵味方を確定できるFactionがない。スキーマには別に`LiveUnitDesc.Faction`、`LiveTeamGroup.Factions`が存在する。ELiveFactionの値はAlpha・Bravo等であり、それ自体がAlly/Enemyの二値ではない。配置された部隊とプレイヤー側の関係を照合する必要がある。

`LiveAIObjectDesc.MissionNpcID`や`LiveWingmanStartDesc.MissionNpcID`、`LiveCampaignBriefUnitDataTableRow.bIsAlly/bIsWingman`も確認できる。ただし、今回の抽出済み資料には対象任務の配置・イベントの具体値を確認できるデータがなく、これらのスキーマの存在を対象機が味方である証拠には使わない。

assets一覧には`DT_BriefUnitData_Mission04`・`Mission15`等や`DT_NPC_LuaSet`の所在があるが、対象の内容は未取得。確定を進める場合は、同じビルドのM4・M15等のブリーフィング、配置、生成・所属変更イベントを調べ、MissionNpcIDから今回の行に結び付ける。ブリーフィングで味方と確認できても任務全局面の所属までは保証しない。

LuaSetIdは所属フラグではない。`NLID_0400_CP`は145 NPCが参照し、QUEENだけでなくNAMED・SHADOW・Ally用NPCにも使われる。`NLID_0012_CP`は16、`NLID_0021_CP`は17 NPCが参照し、こちらも単一の所属を表すと確認できない。

## 5. 掲載判断の提案（承認前。8節の決定を優先）

| 対象 | 提案 | 根拠・限界 |
| --- | --- | --- |
| QUEEN 1〜4 | 13表示行を追加除外の候補とする | 複数の味方用呼称キーが一貫。任務36＋共通5出典を明示して扱う。実所属は未検証 |
| PURPLE MAGIC 1〜4 | M4の4表示行を追加除外の候補とする | モデル表示名に味方用呼称キー。実所属は未検証 |
| GREEN 1・2（M15） | 現状維持で所属の追加確認を優先 | 敵用呼称キーとの混在があり、名前・モデル・LuaSetIdだけでは除外できない |
| GREEN 1・2（M28） | 既存EXCLUDEDを維持 | 現在の合意対象であり、設定も反映済み |
| ENDURANCE（M11・M30） | 本体と対応部位の出典を一緒に追加除外候補とする | 航空機の議論に付随する艦船候補。AA GUNの他艦出典は必ず残す |

EXCLUDEDは掲載範囲の決定であり、実所属の確定とは別である。新規候補を暫定除外するか、所属の確定まで表示するかはユーザーの判断待ち。既存の「未確認なら一旦EXCLUDED」の合意を、今回の別集合へ自動適用しない。

実装する場合も固定IDの削除・再利用やbootstrapの再実行を避け、既存IDと分離する出典の対応を記録する。混在行ID 209・124は残る出典を維持し、EXCLUDED側に分離する場合は未使用IDを割り当てる。今回はこの変更を行っていない。

## 6. 影響範囲の完全な対応表

43任務行の候補に、共通NPC6行とENDURANCE子部位12出典を加えると、計61出典（任務49＋共通NPC12）、22表示行が確認対象になる。61出典すべてを除外する案を承認済みとするものではない。20表示行は出典全部が候補集合内、ID 209・124は他の出典と混在している。

| 元定義 | 掲載ID | NPC | 抽出根拠 |
| --- | ---: | --- | --- |
| `DT_NPC/OP1007_f18c_Queen01` | 18 | `OP1007_f18c_Queen01` | 表示名キー |
| `DT_NPC/OP1007_f18c_Queen01_MS19` | 18 | `OP1007_f18c_Queen01_MS19` | 表示名キー |
| `DT_NPC/OP1007_f18c_Queen02` | 19 | `OP1007_f18c_Queen02` | 表示名キー |
| `DT_NPC/OP1007_f18c_Queen03` | 20 | `OP1007_f18c_Queen03` | 表示名キー |
| `DT_NPC/OP1007_f18c_Queen04` | 21 | `OP1007_f18c_Queen04` | 表示名キー |
| `DT_NPC/VE024_edrne_02_wing` | 461 | `VE024_edrne_02_wing` | 表示名キー |
| `DT_NPC/VE024_edrne_a192_B_02_wing` | 163 | `VE024_edrne_a192_B_02_wing` | 子NPC参照 |
| `DT_NPC/VE024_edrne_a192_F_02_wing` | 163 | `VE024_edrne_a192_F_02_wing` | 子NPC参照 |
| `DT_NPC/VE024_edrne_palma_LB_02_wing` | 124 | `VE024_edrne_palma_LB_02_wing` | 子NPC参照 |
| `DT_NPC/VE024_edrne_palma_LF_02_wing` | 124 | `VE024_edrne_palma_LF_02_wing` | 子NPC参照 |
| `DT_NPC/VE024_edrne_palma_RB_02_wing` | 124 | `VE024_edrne_palma_RB_02_wing` | 子NPC参照 |
| `DT_NPC/VE024_edrne_palma_RF_02_wing` | 124 | `VE024_edrne_palma_RF_02_wing` | 子NPC参照 |
| `DT_NPC_Mission004/f15c_PurpleMagic1` | 22 | `OP1004_f15c_Purple_01` | 表示名キー |
| `DT_NPC_Mission004/f15c_PurpleMagic2` | 23 | `OP1004_f15c_Purple_02` | 表示名キー |
| `DT_NPC_Mission004/f15c_PurpleMagic3` | 24 | `OP1004_f15c_Purple_03` | 表示名キー |
| `DT_NPC_Mission004/f15c_PurpleMagic4` | 25 | `OP1004_f15c_Purple_04` | 表示名キー |
| `DT_NPC_Mission004/f18c_Queen01` | 18 | `OP1007_f18c_Queen01` | 表示名キー |
| `DT_NPC_Mission004/f18c_Queen02` | 19 | `OP1007_f18c_Queen02` | 表示名キー |
| `DT_NPC_Mission004/f18c_Queen03` | 20 | `OP1007_f18c_Queen03` | 表示名キー |
| `DT_NPC_Mission004/f18c_Queen04` | 21 | `OP1007_f18c_Queen04` | 表示名キー |
| `DT_NPC_Mission006/f18c_Queen01` | 18 | `OP1007_f18c_Queen01_MS06` | 表示名キー |
| `DT_NPC_Mission006/f18c_Queen02` | 19 | `OP1007_f18c_Queen02_MS06` | 表示名キー |
| `DT_NPC_Mission006/f18c_Queen03` | 20 | `OP1007_f18c_Queen03_MS06` | 表示名キー |
| `DT_NPC_Mission006/f18c_Queen04` | 21 | `OP1007_f18c_Queen04_MS06` | 表示名キー |
| `DT_NPC_Mission007/f18c_Queen01` | 81 | `OP1007_f18c_Queen01` | 表示名キー |
| `DT_NPC_Mission007/f18c_Queen02` | 82 | `OP1007_f18c_Queen02` | 表示名キー |
| `DT_NPC_Mission007/f18c_Queen03` | 83 | `OP1007_f18c_Queen03` | 表示名キー |
| `DT_NPC_Mission007/f18c_Queen04` | 84 | `OP1007_f18c_Queen04` | 表示名キー |
| `DT_NPC_Mission009/f18c_Queen01` | 18 | `OP1007_f18c_Queen01` | 表示名キー |
| `DT_NPC_Mission009/f18c_Queen02` | 19 | `OP1007_f18c_Queen02` | 表示名キー |
| `DT_NPC_Mission009/f18c_Queen03` | 20 | `OP1007_f18c_Queen03` | 表示名キー |
| `DT_NPC_Mission009/f18c_Queen04` | 21 | `OP1007_f18c_Queen04` | 表示名キー |
| `DT_NPC_Mission010/f18c_Queen01` | 18 | `OP1007_f18c_Queen01` | 表示名キー |
| `DT_NPC_Mission010/f18c_Queen02` | 19 | `OP1007_f18c_Queen02` | 表示名キー |
| `DT_NPC_Mission010/f18c_Queen03` | 20 | `OP1007_f18c_Queen03` | 表示名キー |
| `DT_NPC_Mission010/f18c_Queen04` | 21 | `OP1007_f18c_Queen04` | 表示名キー |
| `DT_NPC_Mission011/edrne` | 162 | `VE024_edrne_02_wing` | 表示名キー |
| `DT_NPC_Mission011/edrne_a192_B` | 163 | `VE024_edrne_a192_B_02_wing` | 子NPC参照 |
| `DT_NPC_Mission011/edrne_a192_F` | 163 | `VE024_edrne_a192_F_02_wing` | 子NPC参照 |
| `DT_NPC_Mission011/edrne_palma_LB` | 124 | `VE024_edrne_palma_LB_02_wing` | 子NPC参照 |
| `DT_NPC_Mission011/edrne_palma_LF` | 124 | `VE024_edrne_palma_LF_02_wing` | 子NPC参照 |
| `DT_NPC_Mission011/edrne_palma_RB` | 124 | `VE024_edrne_palma_RB_02_wing` | 子NPC参照 |
| `DT_NPC_Mission011/edrne_palma_RF` | 124 | `VE024_edrne_palma_RF_02_wing` | 子NPC参照 |
| `DT_NPC_Mission011/f18c_Queen01` | 158 | `OP1007_f18c_Queen01` | 表示名キー |
| `DT_NPC_Mission011/f18c_Queen02` | 159 | `OP1007_f18c_Queen02` | 表示名キー |
| `DT_NPC_Mission011/f18c_Queen03` | 160 | `OP1007_f18c_Queen03` | 表示名キー |
| `DT_NPC_Mission011/f18c_Queen04` | 161 | `OP1007_f18c_Queen04` | 表示名キー |
| `DT_NPC_Mission015/OP1022_f16c_MS15` | 209 | `OP1022_f16c_MS15` | 表示名キー |
| `DT_NPC_Mission018/f18c_Queen01` | 18 | `OP1007_f18c_Queen01` | 表示名キー |
| `DT_NPC_Mission018/f18c_Queen02` | 19 | `OP1007_f18c_Queen02` | 表示名キー |
| `DT_NPC_Mission018/f18c_Queen03` | 20 | `OP1007_f18c_Queen03` | 表示名キー |
| `DT_NPC_Mission018/f18c_Queen04` | 21 | `OP1007_f18c_Queen04` | 表示名キー |
| `DT_NPC_Mission019/f18c_Queen01` | 234 | `OP1007_f18c_Queen01_MS19` | 表示名キー |
| `DT_NPC_Mission019/f18c_Queen02` | 19 | `OP1007_f18c_Queen02_MS19` | 表示名キー |
| `DT_NPC_Mission019/f18c_Queen03` | 20 | `OP1007_f18c_Queen03` | 表示名キー |
| `DT_NPC_Mission019/f18c_Queen04` | 21 | `OP1007_f18c_Queen04` | 表示名キー |
| `DT_NPC_Mission020/f18c_Queen01` | 18 | `OP1007_f18c_Queen01` | 表示名キー |
| `DT_NPC_Mission020/f18c_Queen02` | 19 | `OP1007_f18c_Queen02` | 表示名キー |
| `DT_NPC_Mission021/f18c_Queen01` | 18 | `OP1007_f18c_Queen01` | 表示名キー |
| `DT_NPC_Mission021/f18c_Queen02` | 19 | `OP1007_f18c_Queen02` | 表示名キー |
| `DT_NPC_Mission030/edrne_ms30` | 461 | `VE024_edrne_02_wing` | 表示名キー |

## 7. 検証・進捗

- [x] Git状態と合意済み除外203元定義の対応を確認
- [x] 追加43任務行を再抽出し、前回の候補集合を確認
- [x] GREENのNPC・任務全項目、LuaSetIdの共用を比較
- [x] 共通NPCとENDURANCE子部位まで影響範囲を照合
- [x] 所属を確認する別構造と未取得資料を特定
- [ ] 掲載方針を決定
- [ ] 必要に応じて対象任務の配置・イベントを追加確認
- [ ] 承認後に分類・出典分離・回帰テストを実施

アプリのテスト・ビルドは未実行（調査文書のみの変更）。数値の更新、分類の変更、コミット、push、PR作成は行っていない。Q002のダミー用定義は今回の友軍候補調査とは分けて保留する。

## 8. 承認後の実装結果

ユーザーがQUEEN・PURPLE MAGIC・ENDURANCE本体と対応部位、内部Mission015（ゲーム内M14）のGREEN 1・2をEXCLUDEDにすることを承認した。実ゲームでの所属確定とは別の掲載方針として記録する。旧提案のGREEN現状維持は採用しない。

| 対象 | 既存ID・新規ID | 反映 |
| --- | --- | --- |
| QUEEN 1〜4 | 18〜21、81〜84、158〜161、234 | 13行をEXCLUDED。共通NPC5出典も含む |
| PURPLE MAGIC 1〜4 | 22〜25 | 4行をEXCLUDED |
| GREEN 1・2 | 209、211 | 両行をEXCLUDED。ID 209の2出典とも対象 |
| ENDURANCE本体 | 162、461 | 2行をEXCLUDED |
| ENDURANCE艦砲 | 163 | EXCLUDED、partOfを461へ対応 |
| ENDURANCE対空砲 | 新規506 | ID 124から8出典を分離してEXCLUDED、partOf=461 |
| 他艦の対空砲 | 既存124 | kuzn系12出典を残し、SHIP・partOf=123を維持 |

6節の61出典に、`DT_NPC_Mission015/OP1022_f16c_Viride_01`と`DT_NPC_Mission015/OP1022_f16c_Viride_02`を加えた63出典が今回の除外範囲。catalog.exclusionsにも`approved-local002-friend-scope`として記録した。出典の集合・出現数は分離前後で一致し、登録漏れ・複製なし。

既存22行の分類を変更し、新規EXCLUDEDを1行追加。全506行、EXCLUDED180行、掲載326行。ID 1〜505は維持し、未使用506だけを追加。既存の数値は変更しない。更新前の保存に含まれる除外対象IDは復元時に除去し、他艦ID 123・124は保持する。

追加2テストは修正前に失敗し、修正後に単体85件が成功。旧保存からの復元・検索候補・他艦対空砲の表示をChromeで追加検証し成功した。

### 任務番号の訂正

本資料の承認前調査で使ったM15は内部Mission015の略記で、ゲーム内はM14。[番号対応の根拠](../../../../docs/analysis/ui-labels/MISSION_NUMBERS.md)を確認した。内部Mission004のPURPLE MAGICもゲーム内M3である。除外元キーは変わらない。既存の画面ラベル全体の修正はR006として別途記録した。

### 最終検証

`pnpm test`85件、`pnpm test:browser`のChrome6シナリオ、`pnpm typecheck`・`pnpm lint`・`pnpm format:check`・`pnpm build`が成功。変更前コミットとの比較で既存505 IDの数値・名前・順序を維持し、変更は22行のcategoryと艦砲のpartOfだけであることを確認した。新規506の数値は分離元124と同じ出典から解決した。

既存203＋今回63の計266除外指定がすべてEXCLUDEDへ対応することを確認。元定義の出現数は分離前後で同一。再生成後の配信3ファイルはバイト単位で一致。Q001の掲載判断は完了し、Q002とR006は残る。
