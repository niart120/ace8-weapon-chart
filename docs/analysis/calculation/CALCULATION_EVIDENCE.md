# 計算調査の根拠と限界

調査日: 2026-11-03。ゲームの起動・本体・設定・セーブの変更なし。実ゲーム測定なし。

## 同梱資料から確認した数値と処理

基準の数値資料はSteam build 25201480。EXEの記録SHA-256は `51510e2a520565dbe81fb0d569e95cd4393077acaaa859371489b80b8128829f`、555,102,832バイト。

`docs/initial/ref/reports/analysis_ja.txt` の記載だけでなく、対応する抽出表と逆アセンブルを照合した。

| 対象 | 根拠と採用した扱い |
| --- | --- |
| ROLE | `DT_CategoryDamageRateForPlayerDataTable.json`、`role_columns_to_arrays.asm.txt`、`npc_damage_role.asm.txt`。攻撃側Fighter/Multirole/Attacker/Electronicと目標Plane/Heli/Vehicle/Building/Battery/CarrierBattery/Shipの対応、百分率→float32倍率。配列添字0は100 |
| パーツ | `DT_LiveParts.json`、`weapon_part_bindings.json`、`parts_register.asm.txt`、`parts_apply_in_place.asm.txt`。同ラベルの倍率をfloat32で乗算し、基礎威力へ適用。通常MSLの目標条件付きパーツはROLEの後 |
| 対艦補正 | Blueprintの `AntiShipDamageRate`。機銃20%、LASM150%。`npc_damage_role.asm.txt` の0x147c93541以降で目標6/7に適用し、ROLEの前に作用。兵装主成分と追加成分へ別に保持 |
| 耐性 | `DT_NPC_WeaponDurability.json`・`DT_NPC_ExplosionDurability.json`、`npc_damage_after_role.asm.txt`。専用爆風値は通常耐性を置き換え、二重乗算しない。百分率×float32(0.01)を生成時に解決 |
| HP | `npc_health_initialization.asm.txt`、`health_store.asm.txt`、`health_modifier.asm.txt`。モデル＋NPC差分＋任務差分をfloat32で逐次加算し、最大HPを非負整数へ切り捨て。被弾時は現在内部値×float32(0.1)からダメージを引き、×10をゼロ方向へ切り捨てる |
| 難易度 | `DT_NPC_Difficulty.json` のC.Story/Easy/Normal/Hard/AceでMaxHealth=1。キャンペーン1662任務行の初期HP合成が `mission_enemy_health.json` と全件一致。任務最低HPは0が1628行、1が34行。全任務イベントのHP上書きまでは確認していない |

数値テストはアプリ計算から期待値を生成せず、固定48トレースと独立した境界例を使用する。MPBM HP252の内部値は2520→1265→10→0。0.01倍率・威力0.47999998927116394の例は内部550→545→540…→0で110命中となる。単純除算では115となり一致しない。

## TLS・UAVT・子弾の調査

TLSの `BP_plwp_tls_x0_C` はDamage40、SlipDamage18、DamageStartDelay約0.05秒、DamageInterval約0.4秒、LifeTime8秒。これらの既知値を保持した。初撃を時刻0とする式や一定DPSへの換算は採用していない。

追加の現行EXE調査でLiveAttachedInstantWeaponのタイマー・継続判定候補と親子関係を確認したが、旧ビルドの全命中イベント、初回・継続・再接触時刻を対応付けていない。フレーム時間の入力条件も確定していない。基準ビルドの時間計算を確定できる実行コードが不足するため、TLSは `calculation: tls` のまま `unknown` を返す。威力そのものをnullにはしない。

UAVT（WeaponID103）の `WeaponData.SpawnWeaponClass = -8` を元uassetのimportへ解決し、`BP_uavwp_tls_C` を指すことを確認した。展開側はAttackTime約7.7秒、LifeTime11秒、MaxLoadedCount4、ShotIntervalTime1秒。搭載側はDamage20、SlipDamage20、初回遅延約0.45秒、継続間隔約0.65秒、LifeTime約6.8秒。装填数や活動時間だけから同一目標への全攻撃回数を確定していない。分散・展開・活動時間と攻撃の単位が未決なので、最大ダメージや必要展開数は採用せず `unknown`。

`npc_damage_after_role.asm.txt` の0x147c93bdc〜0x147c93c10と0x147c93d4b〜0x147c93d64で、耐性参照時に子弾104→SOD（27）、105→SFFS（26）へ置き換える処理を確認した。両者のCategory07を使うことは、子弾に親の威力を流用することとは別である。SOD子弾（104）はBombPowerグループに対応する。SFFS子弾（105）は同梱マッピングの1〜104の範囲外。子弾40は確認済みだが、親のBombPowerを転送する全経路が不足するため、SFFSはBOMB.POW+選択時だけ未確認とする。SODやパーツなしの子弾計算まで一律に止めない。

8AAMはDT_LiveWeaponに定義があるが、同梱のプレイヤー兵装Blueprintに基礎威力がない。隣接する6AAMやBot用定義から補完せずnullを保持する。

## 追加抽出とビルド差

現在のインストール済みEXEは551,201,904バイト、SHA-256 `3e47fd42858d1f2b81e59d7f57394a014c0eb6aaf4c02ee3da351b6a42936be2`。基準資料のEXEと異なる。旧アドレスを現行EXEへ直接適用した探索は、確定した根拠から除外した。

[retoc](https://github.com/trumank/retoc)でAI Blueprintを `data/local/npc-raw/` へ読み取り抽出した（1457資産、変換失敗2）。鍵は既存のローカル抽出用資料を使用し、公開物に含めていない。現在の反射情報を再抽出して親クラスを解決し、CDOの変更値とnative初期値を調べた。補足属性の記録は `data/local/npc-evidence.json`・`native-constructors.json`・`catalog.json` に保持する。

- LiveAIGameObject/Plane/HeliのbIsAir初期値1、LiveAIArrangementObject/UniqueObjectBaseの0を確認した。CDOの明示変更を別に適用する。
- 空中の砲台にはGameObjectCategory=Battery・bIsAir=1がある。表示分類から両属性を導出しない。
- CDOの読込が不完全、親クラス未解決などの場合は、未読込の設定を既定値扱いにせずnullを保持する。明示的なCategory_Noneと未確認の区分は分ける。

数値マスタは基準資料、補足属性は現行の静的設定に基づく。旧ビルドの全Blueprintとのバイト単位の一致や、イベント実行後の属性までは確認できていない。このビルド差は残る検証範囲であり、実ゲームで全組み合わせを確認済みとは扱わない。

全レベル配置のROLE無効化、特殊なダメージ変更、イベントによるHP・耐性変更は網羅していない。アプリは静的な初期設定を扱い、最低HP・特殊経路を解決できない行はunknownにする。具体的な対象は[マスタ照合](MASTER_AUDIT.md)に記録する。


## local_002の陸上戦艦部位属性の追加確認

BlueprintGeneratedClassのDynamicBindingObjectsを4バイト整数として読んでいたため、一部クラスの読取位置がずれ、CDO属性を得られていなかった。現行EXEの反射情報に従って配列として読むよう`collect_npc_evidence.py`を修正した。対象13 BlueprintのCDOを定義長まで読み切り、調査結果と属性が一致することを確認。全モデルの再抽出・一括更新は行っていない。

SubCat、Thruster_L1/L2、AAGun_BI、VLSMはGameObjectCategory=6、native基底クラスによるbIsAir=falseと確認し、配信ID151・153・488・249・258へ反映した。元データ・位置・ハッシュは[local_002の15・16節](../../../spec/agent/complete/local_002/LAND_BATTLESHIP_REVIEW.md)と`src/test/fixtures/land-parts-evidence.json`に保持する。ビルド差とイベント後の状態に関する上記の制約は維持する。


## local_003の目標属性再調査（初回調査）

掲載中の属性未確認41行・117出典・48モデルを調査し、72 BlueprintのCDOを全継承で末尾まで読み切った。local_002の配列読取修正に加え、調査専用スクリプトでクラス名の大小文字、Optional/Interface型、MEGAFLOATのnative親クラス記録、EP40のstruct定義を解決した。全41行の静的isAir・GameObjectCategoryを確認。今回の属性確認に必要な資産不足はない。

GameObjectCategory=8の5行は、基準ビルドと現行EXEでNPC用ROLE配列が8要素、範囲外の係数が100であることを確認した。現行の該当箇所は配列作成`0x147d2c540`、参照`0x147c831f4`。Category_None=0と同じ元区分とは扱わず、アプリ上の対応付けは未実装。

全13行のstandardDamage=falseは旧解析での基底クラス確認失敗によるものだった。今回LiveAIGameObject継承と非正の任務MinHealthを確認したが、特にMEGAFLOAT系12行の破壊条件・イベント後の状態は未解析であり、通常の確定数計算を無条件に有効化しない。

[local_003の調査記録](../../../spec/agent/wip/local_003/TARGET_ATTRIBUTE_REVIEW.md)と[証拠JSON](TARGET_ATTRIBUTE_EVIDENCE.json)を参照。既存catalog・配信3ファイル・npc-evidence・native-constructorsは変更していない。基準ビルドとの資産差・全レベル配置・実ゲーム未測定の制約は継続する。


後続の承認により、41行のうち既存ROLE区分の24行を配信へ反映した。CH-47のstandardDamageはクラス読取失敗によるfalseから通常判定へ復元。区分8の5行・MEGAFLOAT系12行は未反映を維持する。初回証拠JSONは当時の配信値を含む調査履歴として保持し、調査スクリプトの対象を41固定IDへ固定して反映後も再現できるようにした。[反映範囲と検証](../../../spec/agent/wip/local_003/TARGET_ATTRIBUTE_REVIEW.md#9-承認済み24行の属性反映)を参照。
