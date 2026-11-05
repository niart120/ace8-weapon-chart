# Changelog

## [1.1.0](https://github.com/niart120/ace8-weapon-chart/compare/v1.0.0...v1.1.0) (2026-11-05)


### Features

* **ui:** 左サイドバーと任務選択を改善 ([7292460](https://github.com/niart120/ace8-weapon-chart/commit/7292460d2ce515d83359dd387f02684fe3d86445))
* **ui:** 左サイドバーと候補フィルターを実装 ([ebfbc71](https://github.com/niart120/ace8-weapon-chart/commit/ebfbc71df57f968f7ce96b7ee932cd0441777040))


### Bug Fixes

* **ui:** 任務と表示範囲の自動選択および操作不具合を修正 ([c2732d1](https://github.com/niart120/ace8-weapon-chart/commit/c2732d1a52ecbfa3f4731e1115504daad9c95e89))


### Miscellaneous Chores

* **skill:** PRをマージコミット方式に変更 ([3cb3acc](https://github.com/niart120/ace8-weapon-chart/commit/3cb3accb9e9f27f5205933e3a0d2756ee7613498))

## 1.0.0 (2026-11-04)


### Features

* **ui:** 対象のミッション絞り込みと比較表の表示を改善 ([090e3ba](https://github.com/niart120/ace8-weapon-chart/commit/090e3ba204877c145cd6d99679bbe1d0b1c63a67))
* マスタ生成と成分別の撃破計算を実装する ([2940adb](https://github.com/niart120/ace8-weapon-chart/commit/2940adb6343cbebd0a6616424e6af3e6dd02f675))
* 全対象マスタと保存対応の比較画面を実装する ([fa65cf8](https://github.com/niart120/ace8-weapon-chart/commit/fa65cf82cd964b9c2243adf0c6a60fd0f0b21f56))


### Bug Fixes

* **calculation:** SFFS子弾へのBOMB.POW+適用を反映 ([64744e3](https://github.com/niart120/ace8-weapon-chart/commit/64744e3cb831f5ad4b7198e2b0e82c5920f247e6))
* **data:** 8AAMの固定IDを保持してUNUSEDに変更 ([663ebf7](https://github.com/niart120/ace8-weapon-chart/commit/663ebf7107280718b431f5d8fa3f520ed30988c6))
* **data:** M26のUNKNOWNを未確定表示で再掲載し未裏付け基本行を除外 ([071a480](https://github.com/niart120/ace8-weapon-chart/commit/071a4806e528adcd63fd13c758b4f69533159134))
* **data:** M6の目標除外と小型バンカー復帰を反映 ([2047540](https://github.com/niart120/ace8-weapon-chart/commit/2047540287bf7bab2d7281ad623f4271cdcf0905))
* **data:** M7の未裏付け航空機5種の任務対応を除外 ([f1d3afb](https://github.com/niart120/ace8-weapon-chart/commit/f1d3afb5673eb6e0a8c98a36a2fdd7eec9fb5688))
* **data:** MEGAFLOATの掲載範囲と部位属性を反映 ([203e1ff](https://github.com/niart120/ace8-weapon-chart/commit/203e1fffd0d7354a10df181a3a44056c3959569b))
* **data:** SWARM DRONESをHP計算非適用として表示 ([ccb3fdd](https://github.com/niart120/ace8-weapon-chart/commit/ccb3fddc1b4ddd6a778d7a702f2162cab005f3b1))
* **data:** THRUSTER右側定義を掲載対象から除外 ([9342e63](https://github.com/niart120/ace8-weapon-chart/commit/9342e631ed3b69e516f1a22f7743287bdc5b2618))
* **data:** TLSとUAVTの固定IDを保持して掲載対象外に変更 ([1b79197](https://github.com/niart120/ace8-weapon-chart/commit/1b79197c5d327ad38a0e98d632325855c91ed18f))
* **data:** コンテナ船の未裏付け任務対応を除外 ([898f419](https://github.com/niart120/ace8-weapon-chart/commit/898f4194598f3d5688c164be2070898eeed52dfb))
* **data:** コンテナ船の重複掲載と非対象部位を整理 ([17e73cc](https://github.com/niart120/ace8-weapon-chart/commit/17e73cc6d32855d611b1bcb1f82604dbe3e2ca4f))
* **data:** ミッション番号と出現対象・部位の任務対応を修正 ([d2e8b4c](https://github.com/niart120/ace8-weapon-chart/commit/d2e8b4c2e1f6c26a98d3905ecfaef235d5ad1274))
* **data:** 一括調査で確定した任務別の掲載範囲を反映 ([8b8f610](https://github.com/niart120/ace8-weapon-chart/commit/8b8f6100767ac0b9008b09a7924982d4f6911881))
* **data:** 区分8の5目標をROLE補正なしで計算 ([dd22f35](https://github.com/niart120/ace8-weapon-chart/commit/dd22f350cb1a07bdce0f8834abafc24df34c8934))
* **data:** 撃破対象外のX-40を除外し出現対応の監査を記録 ([ba944ca](https://github.com/niart120/ace8-weapon-chart/commit/ba944cab1dfb8a4eab92168c3f347c187ba2a1ba))
* **data:** 未裏付けの任務未指定基本3行を除外 ([7d53018](https://github.com/niart120/ace8-weapon-chart/commit/7d53018b3fb5fef1225d984947d1eec49e4f0682))
* **data:** 未裏付けの地上目標基本4行を除外 ([bc18190](https://github.com/niart120/ace8-weapon-chart/commit/bc18190951d42a9e84379f6e358c7c3c17decfd0))
* **data:** 未裏付け車両を除外し群体ドローンの重複を統合 ([5ca832a](https://github.com/niart120/ace8-weapon-chart/commit/5ca832a046d4ab79881719a181650a35616f40bb))
* **data:** 破壊後PILLBOXを除外し地上目標の掲載判断を記録 ([e13a28f](https://github.com/niart120/ace8-weapon-chart/commit/e13a28fbb1b96c6be77b944b183cdc875867c45b))
* **data:** 確認済み24目標の計算属性を反映 ([813504e](https://github.com/niart120/ace8-weapon-chart/commit/813504e398c1729c9ae4306653da8f2e70aa4e52))
* **data:** 輸送船の味方と未裏付け任務の対応を除外 ([b403c5a](https://github.com/niart120/ace8-weapon-chart/commit/b403c5ae5ceffed5d8a89467903f1a3c6f5221ae))
* **data:** 防衛施設の基本行と破壊後タンクを除外 ([de41ebb](https://github.com/niart120/ace8-weapon-chart/commit/de41ebb71cef3d61219d225459b184d97de8e09c))
* **data:** 陸上戦艦の本体を掲載対象から除外 ([2730007](https://github.com/niart120/ace8-weapon-chart/commit/27300076644d77bf592084581f83a671e6436625))
* **data:** 陸上戦艦部位の属性と識別を修正し旧選択を維持 ([aa02ffb](https://github.com/niart120/ace8-weapon-chart/commit/aa02ffbbe90f15471fc0ea51fcf90fb2f1618c91))
* **parts:** TLS強化パーツを非掲載にして旧保存の選択を整理 ([3fe7ee1](https://github.com/niart120/ace8-weapon-chart/commit/3fe7ee1fece474eb24028c4f7cf3d26590b83f89))
* Q002の代理用ダミー6行を掲載対象から除外する ([f9329a9](https://github.com/niart120/ace8-weapon-chart/commit/f9329a9fa2f5a05312ed9379baca641291b335b2))
* R001の通常MSLと機銃の耐性参照を分離する ([6580260](https://github.com/niart120/ace8-weapon-chart/commit/658026052c34808fa39b343a477e2b7f0ed21b15))
* R002のM25後半艦船を任務差分として識別する ([4e8470f](https://github.com/niart120/ace8-weapon-chart/commit/4e8470f517834796ef7922c26ebc8eaeadb3cc6c))
* R003の大型兵器部位の所属と分類を修正する ([99de20c](https://github.com/niart120/ace8-weapon-chart/commit/99de20c1d80da5cbbf70230a2ea6c0c14045bae9))
* R004のキーボード操作によるパネル閉鎖を防ぐ ([d7be964](https://github.com/niart120/ace8-weapon-chart/commit/d7be964fac55016d3f8e546756427d11899766ca))
* R006の任務ラベルをゲーム内表示番号に合わせる ([34eadd2](https://github.com/niart120/ace8-weapon-chart/commit/34eadd2f4b2c0c965b0b419d2c2cd5dd6839ada5))
* SHADOWとVENTUSの識別名と任務ラベルを整える ([6269d6d](https://github.com/niart120/ace8-weapon-chart/commit/6269d6dbc5ef69e6a506e04e400a1caf4c93d0af))
* 承認された友軍候補を除外し他艦の部位出典を保持する ([a7433c4](https://github.com/niart120/ace8-weapon-chart/commit/a7433c4ed09d913d5ee9582f08b795d9d7a38039))


### Code Refactoring

* **data:** 任務ラベルなしの生成入力に統一 ([e69b8af](https://github.com/niart120/ace8-weapon-chart/commit/e69b8af5940f60f61cf54b6e9c9b8bf9e5f33ce1))
* **domain:** 未使用のパーツ未確認指定とTLS継続値を削除 ([765f45a](https://github.com/niart120/ace8-weapon-chart/commit/765f45a183fd50d3ff110c108e462b573016c80d))
* **storage:** 公開前の互換方針を明記し旧ID救済を廃止 ([8b69524](https://github.com/niart120/ace8-weapon-chart/commit/8b69524edd34c19c52602a768193976217853e97))
* プロジェクト名およびディレクトリをace8-weapon-chartへ変更 ([e7b5179](https://github.com/niart120/ace8-weapon-chart/commit/e7b51795b5bc01797a5863539a174f4b1052d611))
* 生成専用の出典検査を配信コードから分離する ([4f1f6ee](https://github.com/niart120/ace8-weapon-chart/commit/4f1f6ee4ad65395d45fbe6a1086474d70a8d2d2f))


### Continuous Integration

* release-pleaseとGitHub Pagesデプロイワークフローを設定 ([683a56c](https://github.com/niart120/ace8-weapon-chart/commit/683a56c0f4421d38311db09d1fa8aee881515d62))


### Tests

* jsdom と依存する画面テストを外す ([8aead04](https://github.com/niart120/ace8-weapon-chart/commit/8aead04ffd347ef2a6808cc178a4b7bd59e7bef6))
* Vitest と React コンポーネントのテスト環境を導入する ([69b09da](https://github.com/niart120/ace8-weapon-chart/commit/69b09da7e8e820a2b4b77a573ab4b456c4630d92))
* 初期実装の検証基盤と固定トレースを整える ([6c584f1](https://github.com/niart120/ace8-weapon-chart/commit/6c584f1c53ea61a3af32c71fd8779d510919b432))


### Miscellaneous Chores

* use TypeScript and align tooling with 5genSearch-web ([4e83997](https://github.com/niart120/ace8-weapon-chart/commit/4e839977e381db31d6ce6195a9414694e382c026))
* 開発規約と作業用スキルを追加する ([c191e64](https://github.com/niart120/ace8-weapon-chart/commit/c191e6439234417e84413e2140599e4fb7ae54fe))
