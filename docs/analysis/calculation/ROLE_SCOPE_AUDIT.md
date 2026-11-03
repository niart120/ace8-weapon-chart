# ROLE補正の適用範囲監査

調査日: 2026-11-03。local_003の区分8対応に伴い、目標・武器の横並び調査を実施した。実ゲーム測定ではなく、既存抽出資産と元の処理による静的確認である。

## 結論

掲載311目標の全出典を再照合した結果、区分8の今回5行以外に、計算用roleGroupをnoneへ変更すべき分類漏れは見つからなかった。既存の区分0・41行は既にnone。静的区分が確定しているMEGAFLOAT系12行は、破壊条件・被弾経路が未確認のため引き続き保留する。

NPC共通の補正関数には、特定の武器IDだけROLEを省略する分岐はない。区分0/8の倍率1、配置によるROLE無効化、攻撃者がプレイヤーではない場合を区別する。武器の継承だけで、すべての命中・継続・子兵装が必ずこの共通関数へ到達すると保証したものではない。

## 調査範囲と再現方法

| 対象 | 確認 |
| --- | --- |
| catalog全934モデル | 出典Blueprint、CDO全継承、GameObjectCategory、native初期値、読取失敗を列挙 |
| 1079 Blueprint | CDO読取長と末尾が全件一致。CH-47の親参照Cp/CPも大文字小文字を区別せず一意に解決 |
| native初期値10クラス | category/isAirの書込命令と即値・ゼロ化レジスタを現行EXEで再照合 |
| 配信全506行、うち掲載311行 | 全sourceRefsから元モデルを解決し、各モデルのROLE区分と配信値を比較 |
| catalog全42兵装、うち掲載34兵装 | 同梱Blueprint一覧と現行native親クラスを追跡。定義不足は別記 |
| 被弾処理 | 基準ビルドの共通被弾・ROLE・配置フラグ設定処理と、現行EXEのNPC補正関数を確認 |

```powershell
python -B docs/analysis/calculation/audit_role_scope.py 'D:\Steam\steamapps\common\ACE COMBAT 8\Game\Binaries\Win64\AceCombat8.exe'
```

スクリプトは既存資産を読み取り、`data/local/local003-role-scope.json`だけを出力する。catalog・npc-evidence・native-constructors・配信3ファイルは前後ハッシュ一致を要求する。bootstrapや生成入力への書戻しは行わない。

現行EXEのSHA-256は`3e47fd42858d1f2b81e59d7f57394a014c0eb6aaf4c02ee3da351b6a42936be2`。機械可読の抜粋を[ROLE_SCOPE_EVIDENCE.json](ROLE_SCOPE_EVIDENCE.json)に保持する。内容は件数、区分0/8の掲載全IDとモデル、区分8全モデル、資産不足モデル、全42兵装の継承、native書込、現行NPC補正関数、入力ハッシュ。全934モデルの詳細は上記ローカル報告に残す。

## 目標側の区分

| 元区分 | モデル数 | 計算用区分・ROLE |
| --- | ---: | --- |
| 0 Category_None | 176 | none、全ROLEで1 |
| 1 Category_Plane | 333 | air |
| 2 Category_Heli | 23 | air |
| 3 Category_Vehicle | 62 | ground |
| 4 Category_Building | 27 | ground |
| 5 Category_Battery | 42 | ground |
| 6 Category_CarrierBattery | 118 | ship |
| 7 Category_Ship | 84 | ship |
| 8 ObjectCategory_MSL | 9 | none、NPC用8要素配列の範囲外で1 |
| 資産不足 | 31 | 未解決。0やnoneに補完しない |
| LiveGameObject非継承 | 29 | 置換Actorなど。区分属性のない定義を区分0扱いしない |

区分が解決した874モデルに9はなかった。enumには9 ObjectCategory_Heliosも存在し、長さ8の同じ配列を使えば範囲外になるが、該当するモデル・攻撃経路を確認していない。新たな目標や計算値は作らない。

掲載311行の参照モデルには資産不足も未解決区分もない。ID32 AA GUNとID33 SAMは区分3/5をまとめた既存行だが、どちらもgroundでROLE差はない。配信roleGroupとの不一致は保留済みMEGAFLOAT12行だけだった。

区分0の掲載41行はMSL PALLET《C-130》ID202、DISP. RAIL GUN、RADAR TOWER、各種施設、SWARM DRONESなど。41 ID・名前・モデルの全一覧は証拠JSONの`neutral_published_targets`を参照。今回の5行と合わせてnoneは46行となる。名前・表示分類・空中判定からROLEを推測していない。

区分8の9モデルは次のとおり。掲載判断は変更しない。

| モデル | 固定ID・扱い |
| --- | --- |
| OP0059_rpdna | 201 MSL PALLET《C-130》。今回noneへ変更 |
| OP0053_ulraam | 264 BVRAAM。同上 |
| OP0037_mmslct / OP0037_mmslct_FirstShot | 505・463 MSL DISPENSER。同上。任務差分維持 |
| OP0036_slcm / OP0039_slcmp | 462 SLCM。同上 |
| OP0060_lacm | 203 ALCM《C-130》。EXCLUDEDを維持 |
| OP0047_lasm / OP0061_mop | 固定IDへの登録なし。今回の計算用区分変更対象外 |

資産不足31モデルは既に除外したTHRUSTER右側のBP_TMP、陸上戦艦の長距離射撃用補助定義、BDF置換の親、各種ダミーなど。具体的な欠落クラスを証拠JSONに残す。名称だけで味方・非攻撃対象と新規判定したわけではない。

## 武器側の確認

| 最初のnative基底 | 件数（掲載） | 確認範囲 |
| --- | ---: | --- |
| LiveMissile | 19（19） | 通常MSL、特殊ミサイル、RKT。LiveWeaponBase継承 |
| LiveBomb | 6（6） | 爆弾、SOD/SFFS子弾。LiveWeaponBase継承 |
| LiveBullet / LiveEMLBullet | 6（5） | GUN各型、MGP、EMLB、未使用EML。LiveWeaponBase継承 |
| LiveMissile_FinallySpawnWeapon | 1（1） | MPBM本体。生成するDamageAreaの命中処理は別に確認 |
| LiveTLSLaserWeapon / LiveWeaponUAV | 2（2） | TLS本体・UAVT展開側の継承。全命中時刻・子兵装の所有者伝播を確定したものではない |
| Blueprint定義不足 | 8（1） | 掲載8AAM、未使用PLSL・PGUN・ADMM・EMLT・UAVG・UAVP・FAEB |

34兵装（掲載33）の継承はいずれもLiveWeaponBaseまで解決した。ただし武器のBlueprint一覧は基準資料に由来するため、現行EXEとの組合せで旧ビルドと全挙動が一致するとは扱わない。

基準資料の`take_damage_common.asm.txt`はdamage causerから武器CDOと所有者を受け取り、NPCの仮想補正関数へ渡す。`damage_area_hit.asm.txt`ではMPBMのDamageArea自身をdamage causerとして対象の被弾関数へ渡している。生成物であることを理由にROLEを除外する根拠はない。

現行NPC補正関数`0x147c82f70`〜`0x147c83352`では、武器コンテキストと攻撃者が存在し、攻撃者がLivePlayerPlane系であることを確認してから補正へ進む（`0x147c82ff4`〜`0x147c8302b`）。区分6/7の艦船補正後、ROLE処理へ合流する。ROLE部ではNPC+0x252aの有効フラグと目標区分で係数を決める（`0x147c831eb`〜`0x147c8321f`）。武器IDでこのROLE部を飛ばす分岐はない。

子弾104/105と通常MSLの武器ID分岐はROLEの後（`0x147c83228`以降）。通常MSLの対空/対地パーツやSFFSのパーツ適用未確認を「ROLEが掛からない」と解釈しない。isAir、艦船補正、耐性も独立した判定である。

## 補正なしと未確認の境界

| 条件 | 結論 |
| --- | --- |
| 区分0 / 区分8 | 確認済み倍率1。元区分を保持して計算用noneを共有 |
| MULTIROLE / ELECTRONIC WARFARE | 基準のROLE表で全目標区分が1。処理自体の省略ではない |
| ATTACKER対艦船区分 | ROLE表の値が1。LASMなどの艦船専用補正は別に適用 |
| NPC+0x252aが0 | ROLEの乗算を飛ばす。基準のnpc_setup_flags / npc_disable_role_flagには配置入力の反転から設定する経路がある |
| 武器・攻撃者コンテキストなし、攻撃者がLivePlayerPlane系以外 | 共通関数内のROLE適用条件を満たさない。敵機の機種分類だけで決まる例外ではない |
| TLS・UAVT | 継承だけで継続攻撃・搭載兵装の全経路を確定しない。既存の時間・攻撃単位の未確認を維持 |

全レベル配置のbDisableCategoryDamageRateとイベントによる切替は網羅していない。モデルCDOの再読取だけで、全個体のROLE有効を保証することはできない。MEGAFLOATの特殊被弾、TLS/UAVTの全攻撃経路、8AAMのプレイヤー定義不足、基準と現行のビルド差は引き続き未確認として残す。今回新たに武器種別のROLE除外を確定したものはない。
