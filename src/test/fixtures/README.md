# 固定の検証用データ

`missile-traces.json` はSteam build 25201480の `reports/normal_missile_hit_traces.json` から通常MSL・HP55/65/300の固定値を抜粋した。アプリの計算関数から生成していない。実ゲーム測定ではなく、同梱の静的解析に基づく値。

ROLE→通常MSL対象別パーツ→耐性→HP更新の順序は `npc_damage_role.asm.txt` の0x147c93704〜0x147c937a8、`npc_damage_after_role.asm.txt` の0x147c94156〜0x147c9415eで再確認した。パーツの同ラベル倍率乗算は `parts_register.asm.txt`、HPは `health_store.asm.txt` と `health_modifier.asm.txt` に従う。

LACM・MPBM・0.01倍率などの追加固定例は計算テストに入力・手計算の根拠を併記する。HP内部値は10倍整数。getterの0.1もfloat32であり、差分を10倍してゼロ方向へ切り捨てる。単純な除算の期待値で置き換えない。
