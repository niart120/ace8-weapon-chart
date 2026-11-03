# 中央支柱429の実体と破壊イベント

調査日: 2026-11-03。ユーザーから、中央支柱429が直接攻撃する部位か、核融合炉の破壊に連動する構造物かの確認を依頼された。開始時HEADは`dd22f35`。前回のMEGAFLOAT調査の未コミット差分を保持して実施した。調査段階ではゲーム起動・実ゲーム測定・配信データ変更なし。後続の承認で429の除外を実装した。[実装・検証結果](../../../spec/agent/complete/local_003/TARGET_ATTRIBUTE_REVIEW.md#14-megafloatの承認済み変更と検証)を参照。

## 結論

**確認した定義・処理では後者。429は核融合炉を収める中央の柱体・外装の親オブジェクトであり、原子炉の破壊通知によって損傷・崩壊する。** プレイヤーが別途HP120を削って倒す通常目標としては掲載せず、ユーザー承認後にEXCLUDEDへ変更した。

単に`OnCoreDeath`という関数名があることを根拠にした判断ではない。Blueprintのイベント登録、外側/内側の死亡通知、状態分岐、アニメーション再生、強制自己破壊の呼出しを命令単位で接続した。さらにnativeの自己破壊処理で、無敵解除から自己ダメージまでを確認した。

## 何を表すオブジェクトか

| 層 | 元定義・対応 |
| --- | --- |
| アプリ | ID429、PILLAR《MEGAFLOAT》、HP120 |
| M27任務行 | DT_NPC_Mission027 / Megafloat_Center_CorePillar_01 |
| モデル | Megafloat_Center_CorePillar → BP_Megafloat_Center_CorePillar_C |
| 見た目の資産 | SK_MGF_CentralControlPillar001P001_I07、3個の中央柱メッシュ、15種類のCorePanelParts |
| 子部位 | Child_Core → Megafloat_Center_Core_01（原子炉内側、HP40） |
| その子部位 | Child_Outer → Megafloat_Center_Core_Outer_01（原子炉外側、HP40） |

「中央制御柱」は資産名CentralControlPillarに基づく説明であり、新たに確認したゲーム内正式名称ではない。ModelのGameObjectDisplayName01とNPCのGameObjectDisplayName02はともに空。アプリのPILLAR表記を、そのままゲーム内でロックする目標名と解釈しない。

親子関係はDT_NPCのChildNPCIdとChildNPCComponentNamesでも一致する。原子炉の内側/外側は同条件としてID430へ統合済みだが、429のHP120とは別オブジェクトである。Front/EV支柱6行とも別のクラス・モデルで、今回の命名・元HP計算の対象には含めない。

## 破壊通知から崩壊までの経路

以下の位置は、`ExecuteUbergraph_BP_Megafloat_Center_CorePillar`内のVMオフセット。保存ファイルのバイト位置とは異なる。両方を[証拠JSON](CORE_PILLAR_EVIDENCE.json)へ記録した。

| 起点 | 確認した呼出し・分岐 | 結果 |
| --- | --- | --- |
| ReceiveBeginPlay | `0x657 → 0x486`。Child_Coreを取得し、OnCoreDeathと、その子OuterのOnOuterDeathへ柱のイベントを登録 | 炉2個の破壊通知と柱を接続 |
| 外側原子炉のOnDeath | OuterのBlueprintがOnOuterDeathを配信。柱のOnOuterDeath_イベントは`0x595`へ入り、SetDamageState(1) | 柱をMinorへ変更 |
| 柱のMinorへの変更 | OnChangeDamageStateの比較から`0x10b`へ分岐。外装パネルを表示し、AM_MGF_CorePillarのCrackOuter_Aを再生 | 外装の損傷表現を開始 |
| 内側原子炉のOnDeath | CoreのBlueprintがOnCoreDeathを配信。柱のOnCoreDeath_イベントは`0x479`へ入り、SetDamageState(4) | 柱をDestructへ変更 |
| 柱のDestructへの変更 | `0x2e0`へ分岐。外装アニメーションの区切りを変更し、AM_CorePillar_Destructを再生。`0x3b2`でLiveSelfTimerDamage.SelfDeath(0.0, true) | 崩壊アニメーションと強制自己破壊を開始 |

この自己破壊呼出しの後に、モンタージュの再生時間を使う待機とOnDestructAnimEndが続く。さらにCDOのDeathAnimLoopTIme=5秒の待機後、DestructEnd_Cへ進む。自己破壊を「アニメーションが全部終わってからプレイヤーが倒す段階」とは解釈しない。各アニメーションの実時間・見た目の完了時刻は測定していない。

## 無敵と自己破壊の確認

429のCDOは`bInitialInvincible=1`・`bShowHUDBox=false`・`bIsIgnoreScoreBoard=1`・`bShouldRecordForDebriefing=false`。native初期化`0x147e60fe0`の`0x147e61016`以降で初期無敵を読み、virtual `0x970`へtrueを渡す。この関数はBuildingの無敵設定`0x147c5b8a0`である。

SelfDeathの反射情報`0x14dd75690`では、引数名は`InTime`と`bForceKill`。したがってBlueprintの`SelfDeath(0.0, true)`は遅延0・強制破壊指定である。native実体`0x146fda520`は最大HPの2倍を自己ダメージとして用意し、遅延0なら`0x147bffc40`を直ちに呼ぶ。

`0x147bffc40`の強制破壊分岐は、無敵をfalseにしてから自身の被弾関数を呼ぶ。無敵解除はこの内部自己破壊の経路で確認したもので、プレイヤーが柱を直接攻撃できる状態へ移ることを示す処理ではない。初期無敵・表示名なし・HUD枠非表示に加え、炉の死亡通知から自壊する実処理があるため、429を通常攻撃用のHP120目標として扱う根拠はない。

## 掲載方針

429は甲板418/423と同じく親構造物としてEXCLUDEDへ変更した。固定ID・元HP120・出典は保持し、原子炉430、シャッター、Front/EV支柱、砲塔などの部位を連鎖除外しない。429を430へ統合したり、HP120を原子炉のHPへ足したりしない。

本調査で確定したのは、現行資産とコードにおける上記の連動処理と初期設定。全任務レベルからの外部上書き、基準build 25201480との全資産同一性、実ゲームでのロック・被弾試験は未確認。これを「全ゲーム局面で衝突や命中が絶対にない」と言い換えない。

## 再現方法と検証（配信反映前の調査記録）

[investigate_core_pillar.py](investigate_core_pillar.py)は既存抽出資産とハッシュ確認済みの現行EXEを読み、`data/local/local003-core-pillar.json`だけを出力する。

```powershell
python -B docs/analysis/calculation/investigate_core_pillar.py 'D:\Steam\steamapps\common\ACE COMBAT 8\Game\Binaries\Win64\AceCombat8.exe'
```

対象EXEのSHA-256は`3e47fd42858d1f2b81e59d7f57394a014c0eb6aaf4c02ee3da351b6a42936be2`。柱・内側炉・外側炉の3 Blueprint、全20関数（11+6+3）を読取。各関数の保存サイズと展開後VMサイズの両方、全明示分岐・遅延再開点・イベントの開始位置が命令境界と一致した。3 CDOも読取末尾が一致。native 5関数を現行EXEから再読取し、SelfDeathの引数名・強制破壊経路を照合した。

関数・命令の保存形式は[UAssetAPI FunctionExport](https://github.com/atenfyr/UAssetAPI/blob/master/UAssetAPI/ExportTypes/FunctionExport.cs)、[Kismetの読取](https://github.com/atenfyr/UAssetAPI/blob/master/UAssetAPI/AssetBinaryReader.cs)、[Context命令](https://github.com/atenfyr/UAssetAPI/blob/master/UAssetAPI/Kismet/Bytecode/Expressions/EX_Context.cs)を参考にした。これらは形式の根拠であり、ゲーム内の挙動の根拠は実資産と現行EXE。未対応の命令・読取不一致は推測して飛ばさずエラーにする。ゲームの命令自体を実行したものではない。

配信3ファイル・catalog・既存npc-evidence・native-constructors・generation-inputの7ファイルは前後SHA-256一致。アプリのテスト・ビルドは未実行（アプリ・配信データ変更なし）。ゲーム起動・実測・本体/設定/セーブ変更、コミット・push・PR作成は行っていない。

調査スクリプトのPython構文を検査し、連続2回の再実行でローカル報告のSHA-256が一致した（`c4911f79d523d506f2fb3583d0de478342aaf2733c3a0c6f143701aa14f4329e`）。証拠JSONは同報告から表・CDOの該当値、全20関数の命令列、nativeの該当命令を抜粋した。元表3個と資産3組のハッシュも再照合した。`pnpm format:check`・`git diff --check`が成功。
