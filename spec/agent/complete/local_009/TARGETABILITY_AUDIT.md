# 攻撃対象と破壊可能部品の掲載監査

後続の[追加調査](TARGETABILITY_FOLLOWUP.md)を参照。除外候補6行はユーザー了承済み。CORE UNIT250は除外推奨へ、PODARGE Wing1/2は維持推奨へ更新。以下は初回監査の記録。

## 1. 目的・範囲

2026-11-06。WING SPAR系12行、BUILDING 3行、陸上戦艦部位21行の掲載36行を監査。陸上戦艦本体・統合済み部位・右側THRUSTERなど除外済み11行を対照に加え、計47行を読んだ。HPや同じ表示名だけを掲載根拠にせず、独立した攻撃対象・直接攻撃する役割・連動破壊を区別する。

| 掲載基準 | 判断上の注意 |
| --- | --- |
| 独立したロック対象 | 掲載対象。ただし初期HUD表示だけで実際のロック可否を確定しない |
| ロック不可でも直接破壊が攻略上の対象 | 個別に掲載する。無得点やHUD非表示だけで落とさない |
| 損傷表現・連動破壊用の部品 | 原則掲載しない。HPの存在や破壊メッシュだけでは役割を確定しない |
| 未確認 | 根拠不足を明示して掲載判断を保留。名前だけで上記のどれかに振り分けない |

今回は静的監査。ゲーム起動・実測・マスタ変更は行っていない。新たにロック可否を全件実証した監査ではない。既存のnative解析器と抽出済み資産を読み、継承CDO、表示設定、スコア設定、元定義、限定したイベント本体を確認した。

## 2. 結論

| 提案 | 行数 | 対象 |
| --- | ---: | --- |
| 掲載維持 | 20 | CELAENOのWING SPAR 1行、陸上戦艦部位19行（CORE系2行以外） |
| 除外候補 | 6 | PODARGEのAirIntake/Elavator/Flap 181/186/190、BUILDING 157/80/136 |
| 追加確認・掲載判断保留 | 10 | LADON翼4行、PODARGE翼4行、SUB CATERPILLAR (CORE)152、CORE UNIT250 |

上表は監査後の提案であり、除外は未反映。除外候補6行は「ロック不可・攻略無関係を証明済み」ではなく、独立した攻撃対象としての掲載根拠が不足し、今回の掲載基準では表へ残す優先度が低いもの。保留10行を自動的に除外数へ加えない。既に合意した378除外は本監査の36行に含めない。

## 3. 各対象の根拠

### 3.1 WING SPAR

| ID・対象 | 確認済みの根拠 | 提案・未確認事項 |
| --- | --- | --- |
| 181 PODARGE吸気口 HP20 | 全参照がBaseScore=0、CDOでbShowHUDBox=false、bIsIgnoreScoreBoard=1。nativeはLiveAIPodargeAirIntake | 除外候補。独立して狙う攻略上の役割を確認できない。被弾不能とは断定しない |
| 186 PODARGE昇降舵相当 HP60 | LiveAIPodargeFlap、HUD非表示・スコア集計対象外、全参照スコア0 | 除外候補。部位名称をELEVATORへ変更して掲載継続する案を先に進めない |
| 190 PODARGEフラップ HP40 | 186と同じnative、HUD非表示・スコア集計対象外、全参照スコア0 | 除外候補。直接破壊を攻略対象とする根拠は未確認 |
| 185/188 PODARGE Wing1/2 HP500/370 | HUD非表示のBlueprint上書きはなく、bIsIgnoreScoreBoard=1。bIsParentDestroyInThisDestroy=1と親破壊演出ソケット設定がある | 保留。親破壊へ関与する設定があり、単なる外観部品として除外するのも早い。フラグを読むnative実行経路・ロック対象登録は未解析 |
| 189/191 PODARGE Wing3/4 HP150/100 | スコア0・集計対象外。損傷・分離用設定があるがHUD非表示のBlueprint上書きはない | 保留。Wing1/2と同じ親破壊フラグの明示上書きは見つからないが、未設定をfalse確定として扱わない |
| 213/215/102/104 LADON尾翼/主翼 HP150/200 | スコア0・集計対象外。破壊時に非表示にするWingMesh/ElevatorMesh等の一覧、DestroyMesh/DestroyPartsMeshを保持。HUD非表示のBlueprint上書きはない | 保留。損傷表現は確認できるが独立した攻撃対象か、親への攻撃で連動する部位かは未確定。命名・PODARGEとの統合は進めない |
| 476 CELAENO内側翼 HP40 | LiveAICelaenoInsideWing、BaseScore=400。今回のCDOにHUD非表示・スコア集計対象外の明示上書きなし。モデル名はMainWing_BL_Inside | 掲載維持案。LADON/PODARGEの無得点部品と一括で除外しない。スコア設定のみを実ロック可能の証明とは扱わない |

### 3.2 BUILDING

157/80/136の全出典は3種類のBSV_ThreeBuildingモデル。BaseScore=0、モデル表示名キーおよびNPC表示名キーは空、nativeはLiveAICollapseBuildingObject。CDOのHP90と崩壊メッシュ切替設定を確認した。3 Blueprintの関数exportはなく、固有処理はnative側にある。

明示的な独立ターゲットとしての根拠がなく、崩壊する建物側の定義であることから3行とも除外候補。ユーザーが指摘したM9のEXPLOSIVEをこれらへ改名して代用しない。建物と設置爆弾のイベント上の対応、ロック可否、直接攻撃で崩す攻略用途は未確認。M5/M8の出典も存在するため、M9の知見だけで全任務の挙動を断定しない。

### 3.3 陸上戦艦

| 対象・ID | 確認済みの根拠 | 提案 |
| --- | --- | --- |
| AA GUN 148/248/227、AIRBURST GUN 150/257/229、CASEMATE GUN149、VLS155/254、CIWS252、SAM256 | スコア100または200の武装部位。継承CDOを完全読取。今回のBlueprintにHUD非表示上書きなし | 11行を維持。同条件の部位統合は既存案どおり候補 |
| MAIN GUN 255/228/372 | スコア1000。CDOはHUD枠非表示。3番艦側のイベントは状態Beast2-BでFCS設定を切替。既存調査に主砲破壊の任務上の裏付けがある | 3行を維持。HUD非表示だけで除外しない。2番艦のイベントはSwitchValue未対応で完全読取できず、実ロック可否も未実証 |
| SUB CATERPILLAR151 | スコア250。HUD非表示・集計対象外のBlueprint上書きなし | 維持。CORE152と別の役割として扱う |
| THRUSTER488/153 | 左側L1/L2、スコア1400。M9終盤の攻撃対象として既存調査あり | 2行を維持。基本/任務耐性の掲載整理は別件。既に除外済み右側154を復活しない |
| BREACH251 | スコア800。モデルMainCore、ObjNameIDはBreach。Bridge側からToOpenを受ける別の子オブジェクト | 維持。CORE UNIT250とHP120一致だけで統合しない |
| HEAT VENT253 | 12 Blueprintの継承CDOでHUD非表示上書きなし、スコア250 | 維持。固有イベントの全状態・ロック可否は未確認 |
| SUB CATERPILLAR (CORE)152 | HUD非表示・集計対象外、スコア0。BeginPlayとUbergraphは実質Returnのみ | 保留。単純なBlueprintイベントは確認したが、状態機械・native・親からの制御を未確認。装甲破壊後の直接攻撃対象とも単なる連動部品とも断定しない |
| CORE UNIT250 | 実体はBridge。HUD非表示・集計対象外、スコア0。Open状態で子MainCoreへToOpen、CoreDeadで親艦へOnShakeBodyを通知 | 保留。BREACH251を開く外側制御オブジェクトであることは確認。250自体への直接攻撃がOpenの条件かは未確認 |

陸上戦艦本体は既にEXCLUDED。今回の監査で本体を復活させる根拠は得ていない。既存の右側THRUSTER除外判断も維持する。攻略上の裏付けは[既存調査](../../complete/local_002/LAND_BATTLESHIP_REVIEW.md)の記録で、新たな実測ではない。

## 4. ロック可否について確認できた境界

nativeのBool setterを逆アセンブルして、bShowHUDBoxは+0x10d2、bIsNotLockonTargetは+0x117a、bIsNotFCSTargetsは+0x11b2と別フィールドであることを確認した。LiveAIGameObjectのコンストラクターにはHUD表示true、後者2フラグfalseの初期化がある。HUD非表示はロック不可と同義ではない。

今回読んだ継承Blueprintの設定にbIsNotLockonTarget/bIsNotFCSTargetsの明示上書きは見つからなかった。ただし、これを「全対象がロック可能」と解釈しない。全native継承・仮想関数・状態遷移・任務配置上書き・FCS登録経路は追い切っていない。nativeコンストラクター抜粋は初期化の補助証拠であり、実行時の最終状態の証明ではない。

## 5. 対象ファイル・再現・検証

| ファイル | 内容 |
| --- | --- |
| audit_targetability.py / TARGETABILITY_EVIDENCE.json | 47行、元定義、継承CDO、関数名、読取状態 |
| inspect_target_flags.py / TARGET_FLAGS_NATIVE.json | 3フラグのsetter、10 nativeクラスのコンストラクター逆アセンブル |
| inspect_target_events.py / TARGET_EVENTS.json | CORE系・主砲の限定的なイベント読取 |
| 本書 | 掲載維持・除外候補・保留の判断 |

```powershell
python -B -X utf8 spec/agent/complete/local_009/audit_targetability.py 'D:/Steam/steamapps/common/ACE COMBAT 8/Game/Binaries/Win64/AceCombat8.exe'
python -B -X utf8 spec/agent/complete/local_009/inspect_target_flags.py 'D:/Steam/steamapps/common/ACE COMBAT 8/Game/Binaries/Win64/AceCombat8.exe'
python -B -X utf8 spec/agent/complete/local_009/inspect_target_events.py 'D:/Steam/steamapps/common/ACE COMBAT 8/Game/Binaries/Win64/AceCombat8.exe'
```

EXE SHA-256は既存解析器の基準値と一致。87 Blueprint CDOを末尾まで完全読取、解析エラーなし。既に除外済みの右側THRUSTER154用BP_TMP 2資産は不足し、未読取として記録。掲載36行のCDOには未読取なし。イベントは4 Blueprint・10関数で保存サイズ/VMサイズが一致、2番艦MAIN GUNの1 BlueprintはSwitchValueで未完了を明示。制御フローの全到達条件を実証したわけではない。

初回抽出処理で配信3ファイル・catalog・既存npc-evidence・native-constructors・generation-inputのSHA-256不変を確認した。ゲーム起動・マスタ再生成・アプリ変更なし。pnpm test等は未実行（監査資料と読取処理のみ）。

## 6. 次の確認とチェックリスト

表示件数を減らすために未確認を「連動部品」と確定しない。まず除外候補6行の採否を検討し、保留10行は掲載判断を別に残す。候補6行を除外する場合、BUILDING 80/136の統合案も不要になる。従来の統合後件数は監査採否の確定後に更新する。

| 未確認対象 | 次に必要な根拠 |
| --- | --- |
| LADON/PODARGEの翼8行 | nativeの被弾・親破壊経路、ロック候補登録/実画面。特にWing1/2が直接攻撃で親を破壊するか |
| CORE152/250 | 状態機械の遷移条件と被弾受付、開放前後の標的表示。Bridge→MainCoreの接続は今回確認済み |
| BUILDING | 独立した攻撃目的があると主張する場合に、EXPLOSIVEとの配置・イベント対応を追加確認 |

- [x] 対象36掲載行と11除外済み行を棚卸し
- [x] HUD非表示とロック不可を区別して属性を抽出
- [x] CORE系の限定イベント本体を追加確認
- [x] 維持20・除外候補6・保留10に分けて根拠と限界を記録
- [ ] 提案の採否とマスタ反映（今回の監査には含めない）
