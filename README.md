# 営業管理システム 設計書

## プロジェクト概要

本プロジェクトは、営業担当者・営業責任者・マネージャー・上司が、日々の営業状況を短時間で把握し、店舗ごとの進捗・課題・次回アクションを管理するための営業管理システムです。

一時的なサンプルではなく、日常業務で継続利用することを前提に、拡張性・保守性・一覧性・更新しやすさを重視して設計します。

技術構成は HTML / CSS / JavaScript を基本とし、Cloudflare Pages にそのままデプロイできる構成で運用します。

Version1.1以降は、共有データ保存のために Cloudflare Pages Functions と Cloudflare D1 を利用します。画面はこれまで通り静的なHTML/CSS/JavaScriptで構成し、保存・取得だけを `/api/stores` 経由にします。

## システムコンセプト

営業担当者と営業責任者の両方が毎日利用する営業管理システムです。

営業担当者にとっては、担当店舗の状況、今日やること、次回連絡、営業履歴をすぐ確認・更新できることを重視します。

営業責任者にとっては、誰が何を対応しているか、どの店舗が停滞しているか、どの案件を優先すべきかを短時間で判断できることを重視します。

このシステムで実現すること:

- 営業状況が一目で分かる
- 誰が何を対応しているか分かる
- 次にやることが分かる
- 営業履歴を蓄積できる
- 店舗ごとの状態変化を追跡できる
- 営業責任者がチーム全体の状況を把握できる

## 目的

最重要目的は、営業状況を誰でも30秒以内に把握できることです。

そのため、画面設計では以下を優先します。

- 営業状況の全体像がすぐ分かる
- 店舗ごとの状態・次回対応・担当者が一覧で確認できる
- 未対応・停滞・優先対応が見落とされない
- 入力や更新に迷わない
- 営業責任者や上司が確認する場合も、現場の状況をすぐ判断できる

## Version1.0 実装範囲

Version1.0では、毎日使う上で最も重要な「営業サマリー」と「店舗一覧」を中心に実装します。

### 実装する機能

- ダッシュボード
  - 営業サマリーのみ表示する
  - 今日やることは表示しない
  - 営業ステータス別件数を自動集計する

- 店舗一覧
  - メイン画面として扱う
  - 店舗名、グループ名、エリア、担当者、営業ステータス、最終連絡日、次回連絡日、アポ日時、次回アクション、メモ、操作を表示する
  - 一覧上で営業ステータスを変更できる
  - 操作列では編集ボタンの右側に削除ボタンを配置する

- 検索・絞り込み
  - 店舗名、グループ、担当者、営業ステータス、エリアで絞り込む
  - エリアは固定選択肢から選ぶ

- 店舗追加・編集
  - 店舗名、グループ名、エリア、担当者、営業ステータス、最終連絡日、次回連絡日、アポ日時、次回アクション、メモを登録・更新する
  - エリアは固定選択肢から選ぶ
  - 登録済み店舗を削除できる

- 店舗一括登録
  - `店舗名 (グループ名)` または `店舗名（グループ名）` 形式のテキストを貼り付けて登録する
  - 1行につき1店舗として読み込む
  - 括弧がない場合は店舗名のみ登録し、グループ名は空欄にする
  - 初期値は営業ステータス `未対応`、担当者 `未設定`、エリア `未設定` とする
  - 同じ店舗名とグループ名の組み合わせが存在する場合は追加しない
  - 読み込み後に追加件数と重複スキップ件数を表示する

- CSV
  - CSV読込
  - CSV書き出し

- データ保存
  - Cloudflare D1 を正の保存先として扱う
  - LocalStorage はD1に接続できない場合のバックアップとして残す
  - CSV読込・書き出しはバックアップ用途として残す

### Version1.0では実装しない機能

- 今日やること
- 店舗詳細専用画面
- 営業分析専用画面
- 設定専用画面
- Googleカレンダー連携
- Googleスプレッドシート同期
- LINE連携
- Instagram連携
- GoogleMap連携
- 通知
- 日報自動作成

これらはVersion2以降で追加できるよう、データ操作・CSV処理・画面描画を分離して実装します。

## ターゲットユーザー

- 営業担当者
  - 担当店舗の状況確認
  - 営業履歴の更新
  - 次回アクションの管理
  - 日報作成の補助

- 営業責任者
  - チーム全体の進捗確認
  - 停滞案件や重点対応店舗の確認
  - 担当者別の活動状況確認

- マネージャー
  - 契約率・進捗率・対応状況の確認
  - エリアや担当者ごとの傾向把握
  - 改善ポイントの発見

- 上司・経営層
  - 全体の営業状況を短時間で確認
  - 重要指標の把握
  - 報告前の確認

## 画面構成

### 1. ダッシュボード

営業状況を最短で把握するためのメイン画面です。

表示内容の想定:

- 全体の営業ステータス別件数
- 担当者別の対応状況
- 本日の対応予定
- 次回連絡日が今日以前の店舗
- 未対応店舗数
- 要フォロー店舗数
- アポ予定数
- 商談中店舗数
- 契約済み店舗数
- 見送り店舗数
- 今週の活動件数
- 直近更新された店舗
- 優先対応店舗

設計方針:

- 数値サマリーは必要最小限に絞る
- 詳細分析よりも、今見るべき状態を優先する
- 一覧への導線を明確にする
- 営業責任者が開いた瞬間にチームの詰まりを把握できるようにする
- 営業担当者が開いた瞬間に今日の対応対象を把握できるようにする

### 2. 店舗一覧

システムの中心となる画面です。

表示内容の想定:

- 店舗名
- グループ
- エリア
- 担当者
- 営業ステータス
- 最終連絡日
- 次回連絡日
- アポ日時
- 次回アクション
- メモ概要

主な操作:

- 検索
- ステータス絞り込み
- 担当者絞り込み
- エリア絞り込み
- 並び替え
- CSVインポート
- CSVエクスポート

設計方針:

- カード表示ではなく一覧表を主役にする
- 1画面で多くの店舗を比較できるようにする
- 更新が必要な店舗を視覚的に見つけやすくする
- 営業担当者・営業責任者のどちらも同じ一覧で状況を確認できるようにする
- 列の表示量は多くなりすぎないようにし、重要列を優先する

### 3. 店舗詳細

1店舗ごとの営業情報を確認・更新する画面です。

表示内容の想定:

- 基本情報
- グループ
- エリア
- 営業ステータス
- 担当者
- 最終連絡日
- 次回連絡日
- アポ日時
- 次回アクション
- Googleマップリンク
- LINEリンク
- Instagramリンク
- 営業履歴
- メモ

設計方針:

- 上部に現在の状態と次回アクションを表示する
- 履歴は時系列で確認できるようにする
- 詳細情報はセクションごとに整理する
- 店舗詳細を見れば、過去の経緯と次にやることが分かるようにする

### 4. 営業分析

営業活動の傾向を確認する画面です。

表示内容の想定:

- 契約率
- ステータス別件数
- 担当者別件数
- 担当者別契約率
- エリア別件数
- エリア別契約率
- 月別活動件数
- 見送り理由の集計

設計方針:

- 判断に使う指標を優先する
- グラフだけに頼らず、一覧や数値でも確認できるようにする
- 将来的な分析項目の追加を前提にする
- 営業責任者が改善点を見つけやすい構成にする

### 5. 設定

運用に必要なマスタ情報や表示設定を管理する画面です。

表示内容の想定:

- 担当者一覧確認
- エリア管理
- グループ管理
- 営業ステータス確認
- CSV項目設定
- LocalStorageデータのバックアップ
- LocalStorageデータの初期化

設計方針:

- 通常業務で頻繁に使う画面ではないため、分かりやすさを優先する
- 誤操作が業務データに影響する操作には確認を入れる
- 固定値として扱う項目と、将来変更可能にする項目を分けて設計する
- 担当者は初期設計では固定プルダウンとし、設定画面では確認対象として扱う

### 6. 営業履歴画面

追加提案画面です。

店舗詳細内だけでなく、全店舗横断で営業履歴を確認するための画面を用意します。

表示内容の想定:

- 日付
- 店舗名
- 担当者
- 活動種別
- 内容
- 次回アクション

設計方針:

- 日報自動作成や活動量分析に流用できる構造にする
- 担当者別・日付別で絞り込めるようにする

## データ構造

JavaScript 上では、以下のようなオブジェクト構造を基本とします。

### 固定営業ステータス

営業ステータスは以下で統一します。

| 値 | 用途 |
| --- | --- |
| 未対応 | まだ営業対応していない状態 |
| コール済み | 電話対応を行った状態 |
| コール済み（返信なし） | 電話または連絡を行ったが返信がない状態 |
| 連絡済み | 電話以外も含めて連絡を行った状態 |
| 返信あり | 店舗側から返信があった状態 |
| アポ | アポイントが設定された状態 |
| 商談 | 商談中の状態 |
| 契約 | 契約済みの状態 |
| 見送り | 今回は契約や商談を見送った状態 |

### 固定担当者

担当者は固定プルダウンとして扱います。

| id | 表示名 |
| --- | --- |
| user_kawamura_hiroto | 川村大登 |
| user_shimada_kazuaki | 島田和明 |
| user_mizuno_takayuki | 水野貴之 |
| user_shiraishi_yu | 白石裕 |

### 固定エリア

エリアは以下の固定プルダウンとして扱います。

| 値 | 用途 |
| --- | --- |
| 未設定 | エリア未分類 |
| 歌舞伎町 | 歌舞伎町エリア |
| 横浜 | 横浜エリア |
| 千葉 | 千葉エリア |
| 名古屋 | 名古屋エリア |
| 大阪 | 大阪エリア |
| 福岡 | 福岡エリア |
| 札幌 | 札幌エリア |
| その他 | 上記に該当しないエリア |

### Store

店舗情報を表す中心データです。

| 項目名 | 型 | 内容 |
| --- | --- | --- |
| id | string | 店舗ID |
| name | string | 店舗名 |
| groupName | string | グループ |
| areaName | string | エリア名 |
| ownerName | string | 担当者名 |
| status | string | 営業ステータス |
| lastContactDate | string | 最終連絡日 |
| nextContactDate | string | 次回連絡日 |
| appointmentAt | string | アポ日時 |
| nextAction | string | 次回アクション |
| memo | string | メモ |
| createdAt | string | 作成日時 |
| updatedAt | string | 更新日時 |

店舗ごとに最低限保持する項目:

- 店舗名
- グループ
- エリア
- 担当者
- 営業ステータス
- 最終連絡日
- 次回連絡日
- アポ日時
- 次回アクション
- メモ
- 作成日時
- 更新日時

### D1 stores テーブル

Cloudflare D1では、店舗データを `stores` テーブルに保存します。

| カラム名 | 型 | 対応データ |
| --- | --- | --- |
| id | TEXT PRIMARY KEY | Store.id |
| name | TEXT NOT NULL | Store.name |
| group_name | TEXT | Store.groupName |
| area_name | TEXT | Store.areaName |
| owner_name | TEXT | Store.ownerName |
| status | TEXT | Store.status |
| last_contact_date | TEXT | Store.lastContactDate |
| next_contact_date | TEXT | Store.nextContactDate |
| appointment_at | TEXT | Store.appointmentAt |
| next_action | TEXT | Store.nextAction |
| memo | TEXT | Store.memo |
| created_at | TEXT | Store.createdAt |
| updated_at | TEXT | Store.updatedAt |

初期化SQLは `schema.sql` に定義します。

### API仕様

Cloudflare Pages Functions で以下のAPIを提供します。

| メソッド | パス | 用途 |
| --- | --- | --- |
| GET | `/api/stores` | 店舗一覧取得 |
| POST | `/api/stores` | 店舗追加 |
| PUT | `/api/stores/:id` | 店舗編集 |
| DELETE | `/api/stores/:id` | 店舗削除 |
| PUT | `/api/stores` | CSV読込時の一括置き換え |

画面起動時はD1から店舗一覧を取得します。店舗追加・編集・削除・CSV読込後はD1へ保存し、再度D1から一覧を取得して営業サマリーと店舗一覧を更新します。

### Activity

営業履歴を表すデータです。

| 項目名 | 型 | 内容 |
| --- | --- | --- |
| id | string | 履歴ID |
| storeId | string | 店舗ID |
| ownerId | string | 担当者ID |
| activityDate | string | 活動日 |
| type | string | 活動種別 |
| statusBefore | string | 変更前ステータス |
| statusAfter | string | 変更後ステータス |
| summary | string | 活動概要 |
| detail | string | 詳細 |
| nextContactDate | string | 次回連絡日 |
| nextAction | string | 次回アクション |
| createdAt | string | 作成日時 |
| updatedAt | string | 更新日時 |

### User

担当者を表すデータです。

| 項目名 | 型 | 内容 |
| --- | --- | --- |
| id | string | 担当者ID |
| name | string | 氏名 |
| role | string | 役割 |
| email | string | メールアドレス |
| isActive | boolean | 利用中かどうか |

初期担当者は固定値として登録し、画面ではプルダウンから選択します。

### Area

エリアを表すデータです。

| 項目名 | 型 | 内容 |
| --- | --- | --- |
| id | string | エリアID |
| name | string | エリア名 |
| sortOrder | number | 表示順 |

### AppSettings

設定情報を表すデータです。

| 項目名 | 型 | 内容 |
| --- | --- | --- |
| statuses | array | 営業ステータス一覧 |
| activityTypes | array | 活動種別一覧 |
| csvMapping | object | CSV項目対応 |
| updatedAt | string | 更新日時 |

## フォルダ構成

実装時は以下の構成を基本とします。

```text
/
├── index.html
├── README.md
├── schema.sql
├── functions/
│   └── api/
│       └── stores/
│           ├── index.js
│           └── [id].js
├── assets/
│   ├── css/
│   │   ├── base.css
│   │   ├── layout.css
│   │   ├── components.css
│   │   └── pages.css
│   ├── js/
│   │   ├── app.js
│   │   ├── constants.js
│   │   ├── storage.js
│   │   ├── csv.js
│   │   ├── utils.js
│   │   ├── views/
│   │   │   ├── dashboardView.js
│   │   │   ├── storesView.js
│   │   │   ├── storeDetailView.js
│   │   │   ├── activitiesView.js
│   │   │   ├── analyticsView.js
│   │   │   └── settingsView.js
│   │   ├── services/
│   │       ├── storeService.js
│   │       ├── activityService.js
│   │       ├── analyticsService.js
│   │       └── settingsService.js
│   │   └── integrations/
│   │       ├── googleCalendarIntegration.js
│   │       ├── googleSheetsIntegration.js
│   │       └── notificationIntegration.js
└── sample-data/
    ├── stores.csv
    └── activities.csv
```

### フォルダ設計方針

- `index.html` は画面の土台を担当する
- CSSは役割別に分割する
- JavaScriptは機能別に分割する
- 画面描画は `views` に集約する
- データ操作は `services` に集約する
- LocalStorage操作は `storage.js` に集約する
- CSV入出力は `csv.js` に集約する
- Cloudflare D1との通信は `storeService.js` に集約する
- Cloudflare Pages Functions は `functions/api/` に配置する
- D1のテーブル定義は `schema.sql` に集約する
- Googleカレンダー、Googleスプレッドシート、通知などの外部連携は将来 `integrations` に分離する

## CSV仕様

CSVは、店舗情報と営業履歴を分けて扱います。

### stores.csv

店舗情報のインポート・エクスポートに使用します。

| CSV列名 | 必須 | 対応データ | 備考 |
| --- | --- | --- | --- |
| id | 任意 | Store.id | 空の場合は自動採番 |
| name | 必須 | Store.name | 店舗名 |
| groupName | 任意 | Store.groupName | グループ |
| areaName | 任意 | Store.areaName | 空欄の場合は未設定。固定エリア外の値はその他として扱う |
| ownerName | 必須 | Store.ownerName | 川村大登 / 島田和明 / 水野貴之 / 白石裕 |
| status | 必須 | Store.status | 固定営業ステータスのいずれか |
| lastContactDate | 任意 | Store.lastContactDate | YYYY-MM-DD |
| nextContactDate | 任意 | Store.nextContactDate | YYYY-MM-DD |
| appointmentAt | 任意 | Store.appointmentAt | YYYY-MM-DD HH:mm |
| nextAction | 任意 | Store.nextAction | 次回やること |
| memo | 任意 | Store.memo | 改行はエスケープして扱う |
| createdAt | 任意 | Store.createdAt | 空の場合は取込日時 |
| updatedAt | 任意 | Store.updatedAt | 空の場合は取込日時 |

### stores.csv ヘッダー例

```csv
id,name,groupName,areaName,ownerName,status,lastContactDate,nextContactDate,appointmentAt,nextAction,memo,createdAt,updatedAt
```

### activities.csv

営業履歴のインポート・エクスポートに使用します。

| CSV列名 | 必須 | 対応データ | 備考 |
| --- | --- | --- | --- |
| id | 任意 | Activity.id | 空の場合は自動採番 |
| storeId | 必須 | Activity.storeId | 店舗ID |
| storeName | 任意 | Store.name | 補助項目 |
| ownerName | 必須 | Activity.ownerId | 担当者名からIDへ変換 |
| activityDate | 必須 | Activity.activityDate | YYYY-MM-DD |
| type | 必須 | Activity.type | コール / 連絡 / 返信 / アポ / 商談 / 契約 / 見送り / メモ |
| method | 任意 | Activity.method | 電話 / メール / LINE / Instagram / 訪問 / 紹介 / その他 |
| statusBefore | 任意 | Activity.statusBefore | 変更前ステータス |
| statusAfter | 任意 | Activity.statusAfter | 変更後ステータス |
| summary | 必須 | Activity.summary | 活動概要 |
| detail | 任意 | Activity.detail | 詳細 |
| nextContactDate | 任意 | Activity.nextContactDate | YYYY-MM-DD |
| nextAction | 任意 | Activity.nextAction | 次回やること |
| createdAt | 任意 | Activity.createdAt | 空の場合は取込日時 |
| updatedAt | 任意 | Activity.updatedAt | 空の場合は取込日時 |

### activities.csv ヘッダー例

```csv
id,storeId,storeName,ownerName,activityDate,type,method,statusBefore,statusAfter,summary,detail,nextContactDate,nextAction,createdAt,updatedAt
```

### CSV運用方針

- 文字コードは UTF-8 を基本とする
- 1行目はヘッダー行とする
- 日付形式は `YYYY-MM-DD` に統一する
- アポ日時は `YYYY-MM-DD HH:mm` に統一する
- 担当者は固定担当者の表示名と一致させる
- 営業ステータスは固定営業ステータスの値と一致させる
- インポート前にプレビューとエラー確認を行う
- 必須項目が不足している行は取り込まない
- 取り込み結果は成功件数・失敗件数を表示する
- エクスポート時は現在の絞り込み条件を反映できるようにする
- 店舗情報と営業履歴を両方エクスポートできるようにする
- CSVから復元しても、店舗一覧・店舗詳細・分析に必要な情報が欠けない列構成にする

## LocalStorage仕様

Version1.1以降は Cloudflare D1 を正の保存先として運用します。

LocalStorage は以下の目的で残します。

- `file://` でローカル確認する場合の保存先
- D1 APIに接続できない場合の一時バックアップ
- 最後に取得できた店舗データの退避

### 保存キー

| キー名 | 内容 |
| --- | --- |
| salesManager.stores | 店舗情報 |
| salesManager.activities | 営業履歴 |
| salesManager.users | 担当者情報 |
| salesManager.areas | エリア情報 |
| salesManager.settings | アプリ設定 |
| salesManager.meta | データバージョンなどのメタ情報 |

### データ形式

- JSON文字列として保存する
- 保存時に `updatedAt` を更新する
- データ構造変更に備えて `schemaVersion` を持つ
- 読み込み時に不正なJSONを検知した場合は、エラー表示と復旧導線を用意する

### 保存方針

- 通常時は `/api/stores` 経由でD1から取得・保存する
- D1から取得できた店舗データはLocalStorageにも保存する
- D1 APIに接続できない場合はLocalStorageのデータを表示する
- CSV書き出しは画面が保持している最新のD1取得データを対象にする
- CSV読込時はD1へ一括保存し、保存後にD1から再取得する

### バックアップ方針

- 設定画面から全データをJSONとしてエクスポートできるようにする
- JSONバックアップをインポートできるようにする
- データ初期化は確認ダイアログを必須にする

### 将来的な同期拡張

Googleスプレッドシート同期を追加する場合でも、画面側はD1やLocalStorageを直接参照せず、サービス層を通じてデータを取得します。

これにより、将来的に保存先や外部連携が増えても、画面側の変更を最小限に抑えます。

## UIデザイン方針

目指す雰囲気は Notion / Linear / HubSpot のような、シンプルで洗練された業務向けUIです。

### 基本方針

- 一覧画面を主役にする
- カードは必要最小限にする
- 余白は広げすぎず、情報密度を保つ
- 装飾よりも読みやすさを優先する
- 状態・期限・次回アクションが一瞬で分かるようにする
- 営業中でも迷わず操作できる導線にする

### レイアウト

- 左側にナビゲーション
- 上部に画面タイトルと主要操作
- メイン領域は一覧表・詳細・分析を用途ごとに切り替える
- モバイル対応は行うが、主利用はPCを想定する

### 色

- 背景は白または淡いグレー
- テキストは高コントラストを維持する
- ステータス色は意味が直感的に分かるものにする
- 警告色や強調色は使いすぎない

### コンポーネント

- テーブル
- フィルター
- 検索ボックス
- セグメント切り替え
- ステータスバッジ
- モーダル
- トースト通知
- 確認ダイアログ

### アクセシビリティ

- 文字サイズは小さくしすぎない
- 色だけで状態を判断させない
- キーボード操作を考慮する
- フォーム項目には明確なラベルを付ける

## 命名規則

### ファイル名

- HTML: `index.html`
- CSS: 小文字のケバブケース
  - 例: `base.css`
- JavaScript: 小文字始まりのキャメルケース
  - 例: `storeService.js`

### JavaScript

- 変数名: キャメルケース
  - 例: `storeList`
- 関数名: 動詞から始める
  - 例: `renderStoreTable`
- 定数名: 大文字スネークケース
  - 例: `STORAGE_KEYS`
- クラス名を使う場合: パスカルケース
  - 例: `StoreRepository`

### CSS

- クラス名はケバブケース
  - 例: `.store-table`
- 役割が分かる名前にする
- 見た目だけに依存した名前を避ける
  - 良い例: `.status-badge`
  - 避ける例: `.green-box`

### ID

- データIDは文字列で扱う
- 形式は `prefix_timestamp_random` を基本とする
  - 例: `store_20260630_ab12cd`

## 今後追加予定の機能

以下の機能追加を見据えて設計します。

- Googleカレンダー
  - 次回アクション日や訪問予定をカレンダーへ反映する
  - `appointmentAt` と `nextContactDate` を予定作成に利用する

- Googleスプレッドシート同期
  - D1データのバックアップ先または集計用データソースとして利用する
  - 画面側はサービス層経由でデータ取得し、保存先変更の影響を抑える

- 通知
  - 本日対応予定
  - 期限切れアクション
  - 停滞店舗

- LINE
  - 店舗ごとのLINE連絡先を管理する
  - 店舗詳細の外部リンクとして利用する

- Instagram
  - 店舗アカウントの確認導線を用意する
  - 店舗詳細の外部リンクとして利用する

- GoogleMap
  - 店舗所在地の確認
  - 訪問ルート検討

- 営業分析
  - ステータス別、担当者別、エリア別に営業状況を確認する

- 契約率分析
  - ステータス遷移や担当者別の契約率を確認する

- 担当者別分析
  - 活動量・契約数・停滞案件を確認する

- エリア分析
  - エリアごとの営業状況や契約率を確認する

- 日報自動作成
  - 営業履歴から担当者別の日報を生成する
  - `Activity` データを日付・担当者単位で集計する

### 将来拡張の設計方針

- 画面はD1やLocalStorageを直接操作せず、サービス層を通じてデータを扱う
- Google連携や通知などの外部連携は、将来 `integrations` 配下に分離する
- 店舗情報と営業履歴を分けて保存し、分析・日報・通知へ再利用できるようにする
- 固定プルダウンの値は `constants.js` に集約し、画面ごとの重複定義を避ける
- CSV、Googleスプレッドシート、手入力のどの経路でも同じデータ構造へ変換する

## Cloudflare Pagesへのデプロイ手順

本プロジェクトは HTML / CSS / JavaScript と Cloudflare Pages Functions で構成します。

Node.js、React、Vue、TypeScript、ビルド処理は使用しないため、GitHub へ push した内容を Cloudflare Pages でそのまま公開できます。

デプロイ後は、Cloudflare Pages が発行するURLまたは独自ドメインの同じURLを使って、PC・スマホから閲覧できます。

店舗データは Cloudflare D1 に保存します。同じURLを開いた人は、同じ店舗データを確認できます。LocalStorage はバックアップとして残します。

### 1. GitHubへPushする手順

初回のみ、GitHubで空のリポジトリを作成します。

推奨リポジトリ設定:

- Repository name: 任意
- Public / Private: 運用方針に合わせて選択
- README、.gitignore、license はGitHub側では追加しない

ローカルで実行する手順:

```bash
git init
git add .
git commit -m "Initial sales management system"
git branch -M main
git remote add origin https://github.com/<GitHubユーザー名>/<リポジトリ名>.git
git push -u origin main
```

すでにGitリポジトリ化済みの場合は、以下のみ実行します。

```bash
git add .
git commit -m "Update sales management system"
git push
```

### 2. Cloudflare Pagesへ接続する手順

1. Cloudflare ダッシュボードへログインする
2. `Workers & Pages` を開く
3. `Pages` を選択する
4. `Create application` を選択する
5. `Connect to Git` を選択する
6. GitHubアカウントを連携する
7. 対象リポジトリを選択する
8. Build settings を以下のように設定する
   - Framework preset: `None`
   - Build command: 空欄
   - Build output directory: `/`
   - Root directory: `/`
9. `Save and Deploy` を実行する
10. デプロイ完了後、Cloudflare Pages のURLを開いて表示を確認する

### 3. Cloudflare D1を作成する手順

1. Cloudflare ダッシュボードで `Workers & Pages` を開く
2. `D1 SQL Database` を開く
3. `Create database` を選択する
4. Database name に任意の名前を入力する
   - 例: `sales-management-db`
5. 作成したD1データベースを開く
6. `Console` または `Query` 画面で `schema.sql` の内容を実行する
7. `stores` テーブルが作成されていることを確認する

Wranglerを使う場合は以下でも作成できます。

```bash
wrangler d1 create sales-management-db
wrangler d1 execute sales-management-db --file=./schema.sql
```

### 4. PagesとD1を接続する手順

Cloudflare Pages のプロジェクトにD1をバインドします。

1. Cloudflare ダッシュボードで対象の Pages プロジェクトを開く
2. `Settings` を開く
3. `Functions` を開く
4. `D1 database bindings` を追加する
5. Variable name に `DB` を入力する
6. D1 database に作成済みの `sales-management-db` を選択する
7. 保存する
8. Pages を再デプロイする

このプロジェクトのAPIは `env.DB` を参照するため、バインディング名は必ず `DB` にします。

### 5. デプロイ後の更新方法

コードやREADMEを更新したら、GitHubへ push します。

```bash
git add .
git commit -m "Update app"
git push
```

GitHubへ push すると、Cloudflare Pages が自動で再デプロイします。

更新確認の流れ:

1. ローカルで `index.html` を確認する
2. 変更内容を commit する
3. GitHubへ push する
4. Cloudflare Pages のデプロイ完了を待つ
5. 公開URLを開いて表示を確認する
6. `/api/stores` にアクセスし、JSONが返ることを確認する
7. 店舗追加・編集・削除後に別端末でも同じデータが見えることを確認する

### 6. 独自ドメインを設定する場合の手順

Cloudflareで管理しているドメインを使う場合:

1. Cloudflare ダッシュボードで対象の Pages プロジェクトを開く
2. `Custom domains` を開く
3. `Set up a custom domain` を選択する
4. 使用したいドメインまたはサブドメインを入力する
   - 例: `sales.example.com`
5. Cloudflare の案内に従って DNS レコードを追加する
6. SSL/TLS が有効になるまで待つ
7. 独自ドメインのURLで表示を確認する

Cloudflare以外で管理しているドメインを使う場合:

1. Cloudflare Pages 側で Custom domain を追加する
2. 表示された CNAME レコードを確認する
3. ドメイン管理サービス側のDNS設定に CNAME を追加する
4. DNS反映後、Cloudflare Pages 側で有効化を確認する
5. 独自ドメインのURLで表示を確認する

### デプロイ時の注意点

- Node.js のビルド処理は使用しない
- ルートに `index.html` を配置する
- Cloudflare Pages の Build command は空欄にする
- Build output directory は `/` にする
- Framework preset は `None` にする
- Cloudflare Pages Functions のため、`functions/` をGitHubへ含める
- D1初期化のため、`schema.sql` をGitHubへ含める
- GitHubへ push するファイルは、`index.html`、`README.md`、`assets/`、`functions/`、`schema.sql`、`sample-data/` を含める
- D1 binding の Variable name は `DB` にする
- 外部API連携を追加する場合は、認証情報をフロントエンドへ直接埋め込まない

## 更新履歴

| 日付 | 内容 |
| --- | --- |
| 2026-06-30 | 初版作成。プロジェクト概要、画面構成、データ構造、CSV仕様、LocalStorage仕様、UI方針、デプロイ手順を定義。 |
| 2026-06-30 | システムコンセプト、固定営業ステータス、固定担当者、店舗データ項目、CSV列、将来拡張方針を追記。 |
| 2026-07-02 | Cloudflare D1を正の保存先にする共有データ方式、Pages Functions API、D1デプロイ手順を追記。 |
