# CONTAINER SHIP の掲載・任務・部位対応の調査

調査日: 2026-11-04。調査開始時 HEAD: `ccb3fdd`。元テーブル、抽出済み Blueprint、コミュニティの攻略資料を照合した。ゲーム起動・配置の実測・被弾測定は行っていない。以下の調査結果と証拠 JSON は変更前の記録。後続のユーザー判断による反映内容は次節に記載する。

## 初回承認後の反映（履歴）

MANPADS（ID 223）と任務表示のない基本定義（ID 491/492）を `EXCLUDED` にした。固定 ID と元 HP・耐性は保持する。

残る通常船（ID 12）と M16 船（ID 222）は、HP・全耐性・計算属性が一致するため、表示を ID 12 の `CONTAINER SHIP` に統合した。`missionVariant=null` とし、名前末尾の `[M16]` は掲載しない。絞り込み用の `missionIds` は `[16,23,27]`。M23/M27 の実際の敵配置が未裏付けである点は変わらず、任務対応の追加・削除はしていない。

統合先には M16 の偽装船 3 種の出典だけを加え、民間船と推定した `VE020_ctsl_01` は加えていない。ID 222 自体も、元出典と固定 ID を残して `EXCLUDED` とした。M16 偽装船の代表が ID 12 になったため、除外した MANPADS の `partOf=12` は統合後の正しい親を指す。

回帰テストは `src/data/container-ships.test.ts`。公開行が 1 件で接尾辞なし、除外 4 ID が非表示、任務差分表示が無効でも表示、M16/M23/M27 から同じ船体を選べることを確認する。

変更前は公開船体が 4 行あるため新規テストが失敗し、変更後は全 129 テストが成功した。型検査・Lint・整形確認・本番ビルドも成功。掲載 290 行、`EXCLUDED` 216 行、掲載中で任務未特定の対象は 13 行となった。

## 結論と修正候補

船体 HP を変更する根拠は見つかっていない。主な問題は、基本定義と任務用定義の重複掲載、非敵対象を含む出典の統合、部位の親参照にある。

| 対象 | 確認したこと | 判断・修正候補 |
| --- | --- | --- |
| CONTAINER SHIP、ID 491 | `VE020_ctsl_01` の基本定義。HP 75、機銃倍率 5。任務対応なし。同じ NPC は M16 の任務表にあり、そこでは機銃倍率 1 | 民間船の基本定義と推定。計算対象からの除外候補 |
| CONTAINER SHIP、ID 492 | `VE021_ctslf_01/02/03` の基本定義。HP 75、機銃倍率 10。任務対応なし。M16 の任務表では機銃倍率 1 | M16 の偽装船と同じ NPC の、任務上書き前の値。独立した実戦対象の裏付けがなく、除外候補 |
| CONTAINER SHIP [M16]、ID 222 | `VE020_ctsl_01` と偽装船 3 種を、計算値が同じため一緒に保持している | 偽装船 3 種の出典に限定する候補。HP 75・機銃倍率 1 を維持 |
| MANPADS《CONTAINER SHIP》、ID 223 | M16 の偽装船 3 種の子部位。しかし `partOf=12` は M23/M27 の別船を指す | 親参照の誤りは確認済み。`partOf=222` が対応する。独立して狙えない部位として掲載除外も候補 |
| CONTAINER SHIP、ID 12 | M23/M27 の任務定義を保持。M2/M3 は既に任務除外済み。上記 MANPADS を持たない | M23/M27 の敵目標としての配置は未裏付け。現時点で任務を削除する根拠は不足 |

ID 491/492 の「任務対応なし」は現行テーブル索引での結果である。配置・イベントから基本 NPC を直接生成する経路をすべて調査したわけではなく、ゲーム全体で未使用と確定した意味ではない。除外案は、確認できた敵目標とその任務時の値を計算対象にするという用途に基づく。

## M16 の民間船と偽装船

[Gamerch の M16 攻略](https://gamerch.com/acecombat8/1017964)は、民間船の中に偽装船 3 隻が紛れており、その 3 隻を撃沈する任務と説明している。

内部定義の `VE021_ctslf_01/02/03` は、各々に `GR032_ctslf_01/02/03_stgr` を持つ。Blueprint にも対応する MANPADS とコンテナ内の発射装置を参照する構成がある。`VE020_ctsl_01` は子 NPC がなく、Blueprint には `bCanBeDamagedByAlly=1` が指定されている。この構造と攻略資料から、前者を偽装船、後者を民間船と対応付けるのが妥当。ただし、任務中の陣営設定・配置との直接照合は未実施である。

M16 の内部テーブルは `DT_NPC_Mission017`。船体 4 定義とも、モデル HP 75、NPC/任務 HP 加算 0、最低 HP 0、耐性 `NPC_WPDur_000` である。したがって現在のテーブル解決規則では HP 75・機銃倍率 1 となる。基本定義の `ctsl_WPDur_000` の 500%、`ctslf_WPDur_000` の 1000% を M16 に適用するのは不適切。

Blueprint の初期値には民間船 HP 150、偽装船 HP 80 もあるが、これらはモデルテーブルの HP 75 と別の値である。現行生成処理はモデル・NPC・任務の合成値を使う。Blueprint 初期値だけを採って HP を 150/80 に変更する根拠にはしない。現在のゲームビルドでの実測値は未確認。

## MANPADS の親と攻撃対象としての扱い

`DT_NPC` の対応は次のとおり。

| 親 NPC | 子 NPC | 船上の子コンポーネント |
| --- | --- | --- |
| `VE021_ctslf_01` | `GR032_ctslf_01_stgr` | `BP_VE021_stgr_Base` |
| `VE021_ctslf_02` | `GR032_ctslf_02_stgr` | `BP_VE021_stgr_Base` |
| `VE021_ctslf_03` | `GR032_ctslf_03_stgr` | `BP_VE021_stgr_Base` |

ID 12 の `VE025_cont_01` と `VE025_cont_MS27` の `ChildNPCId` は空。ID 223 の親を ID 12 とする現行値は、この対応と一致しない。任務を M16 だけに修正した後も、親 ID の誤りが残っていた。

[Ace Combat Wiki の Singer](https://acecombat.wiki.gg/wiki/Singer)は、MANPADS が偽装船に各 1 基あり、攻撃を受けた船から発砲するが、単独では狙えないと記載している。直接取得は HTTP 403 だったため、検索エンジンが保持する同ページ本文を確認した。船上で実際に使う `BP_VE021_stgr_Base` にも `bShowHUDBox=false` がある。

これらは「独立したロックオン対象として扱わない」根拠になる。機銃・爆風の個別当たり判定や独立破壊の可否までは確認していない。HP 15 という元データを HP 非適用へ変更する根拠でもないため、SWARM DRONES と同じ `HP=-` にする案とは分ける。掲載を外す場合も、元 HP と正しい親参照は保持する。

## M23・M27 の残る不確実性

M23 は `DT_NPC_Mission024/cont_common`、M27 は `DT_NPC_Mission027/VE025_cont_MS27` が根拠。いずれも HP 75、機銃倍率 1、最低 HP 0。M16 の偽装船とは異なるモデルであり、MANPADS の任務・親を引き継がせる根拠はない。

[M23 攻略](https://gamerch.com/acecombat8/1019038)には湾内の敵艦艇との戦闘があるが、コンテナ船を個別に識別できる記載は見つからなかった。[M27 攻略](https://gamerch.com/acecombat8/1019044)でも個別の掲載根拠は得られなかった。記載がないことだけで非出現とは判断しない。

M27 用 Blueprint は通常船を継承し、`LiveChainDamagedState` のサブオブジェクトを追加している。M16 の偽装船にも同種のサブオブジェクトがある。ただし、この参照の存在だけでは連鎖破壊の発火条件・被害範囲・敵味方を確定できない。船体単独の HP 計算を無効化する根拠にはしない。

## 調査範囲と再実行

証拠は [CONTAINER_SHIP_EVIDENCE.json](CONTAINER_SHIP_EVIDENCE.json)、再収集は [investigate_container_ships.py](investigate_container_ships.py)。5 対象・11 任務参照・継承元を含む 17 Blueprint のクラス既定値を読み取った。クラス既定値は全件でエラーなし・シリアライズ領域の完全消費を検査した。`LiveChainDamagedState` の対象サブオブジェクトも完全消費を確認した。他の全コンポーネントや任務イベントを解析済みとするものではない。

```powershell
python -B -X utf8 docs/analysis/calculation/investigate_container_ships.py 'D:/Steam/steamapps/common/ACE COMBAT 8/Game/Binaries/Win64/AceCombat8.exe'
```

元テーブルは既存の解析基準ビルド `25201480`。現在の EXE はその基準とは異なるため、テーブル値と現行ゲームでの挙動を同一視しない。入力と資産のハッシュ、参照した EXE のハッシュ、アプリデータの非変更検証を証拠 JSON に保存した。

## 2026-11-05: M23/M27 の暫定除外

基準 HEAD は `7d53018`。基本行の整理が完了したため、残件の M23/M27 だけを追加確認した。M16 偽装船・MANPADS・船体 HP の解析は繰り返していない。元定義と Blueprint については上記証拠 JSON を再利用した。

[Neoseeker の M23 攻略](https://www.neoseeker.com/ace-combat-8-wings-of-theve/walkthrough/Mission_23%3A_The_Destruction_of_Expo_City)を追加確認した。半島付近の海上目標の撃破は記載されているが、CONTAINER SHIP の個別名称・用途は得られなかった。[Ace Combat Wiki の M23](https://acecombat.wiki.gg/wiki/The_Destruction_of_Expo_City)も港の艦隊を挙げるだけで、船種を特定できない。一般的な艦隊の記述をコンテナ船の実出現根拠にはしない。

[Neoseeker の M27 攻略](https://www.neoseeker.com/ace-combat-8-wings-of-theve/walkthrough/Mission_27%3A_Fatsia%2C_the_Ocean_Fortress)は甲板下の停泊船が甲板崩壊で破壊されることと、甲板脇の GAS CARRIER の誘爆を記載する。直接取得は HTTP 403 のため検索エンジン保持本文を確認した。CONTAINER SHIP の個別名称は見つからなかった。[Ace Combat Wiki の M27](https://acecombat.wiki.gg/wiki/Fatsia%2C_The_Ocean_Fortress)も各種施設と誘爆手順を説明するが、対象船種を裏付けない。

| 任務 | 残る根拠と限界 | 反映内容 |
| --- | --- | --- |
| M23 | `DT_NPC_Mission024/cont_common` → `VE025_cont_01`。汎用の船体定義は存在するが、攻略でコンテナ船を特定できない | ID 12 の M23 対応を暫定除外 |
| M27 | `DT_NPC_Mission027/VE025_cont_MS27` → M27 専用 Blueprint。専用の連鎖損傷部品と停泊船の攻略記述はあるが、その船種・敵味方・配置との対応は未確認 | ID 12 の M27 対応も、裏付けが得られるまで暫定除外 |

M27 は専用定義がある分、M23 より出現を支持する内部資料がある。この差を残したうえで、実出現の個別裏付けがない対応を一旦掲載から外すという、今回までの整理方針に合わせ、ユーザー承認により暫定除外した。いずれも非出現・非敵対象と確定したわけではない。ID 12 の `missionIds` を `[16]` とし、船体の掲載・HP 75・耐性・元出典を維持する。任務単位の除外規則で処理し、基本行除外や船体全体の除外と混同しない。

今回、新たな個別出現の証拠は得られていない。Web の同じ検索を繰り返す調査はここで区切り、確定にはゲーム画面での識別記録、またはマップ／任務イベントからの配置・陣営設定の追跡が必要な残件とする。ユーザーは M27 の出現を確認できておらず、M23 も出現の記憶がないとして除外を承認した。`target-mission-exclusions.json` に理由を記録し、両任務対応の暫定除外を反映した。

`container-ships.test.ts` で M16 の掲載と M2/M3/M23/M27 の非掲載を確認する。変更前の失敗、変更後の全 137 テスト成功を確認した。船体の HP・耐性・固定 ID・元出典・TYPE での掲載は維持する。
