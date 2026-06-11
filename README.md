# connectedone-mcp

コネクティッドワンのサイトを、AI（Claude）に**話しかけるだけで操作できる**ようにする無料ツールです。

このページを案内された方は、**上から順番に進めれば約10分**でセットアップできます。専門知識は不要です。

> [English summary is at the bottom of this page.](#english)

## できるようになることの例

セットアップが終わると、Claude にこんなお願いができるようになります。

- 「今月入った注文を一覧して」
- 「`tanaka@example.com` さんの連絡先に『セミナー参加』タグを付けて」
- 「注文 #1234 を発送済みにして、ヤマト運輸の追跡番号 XXXX を登録して、お客様に通知して」
- 「メルマガリストごとの購読者数と開封率を表にして」
- 「先週のフォーム送信を全部見せて」

## セットアップの全体像

| ステップ | やること | 目安 |
|---|---|---|
| ① | 準備：Node.js が入っているか確認する | 3分 |
| ② | コネクティッドワンの管理画面で APIキーを取得する | 2分 |
| ③ | AI（Claude）につなぐ | 5分 |

---

## ステップ①　準備：Node.js が入っているか確認する

このツールは Node.js（無料のソフト）の上で動きます。まず、お使いのパソコンに入っているか確認します。

**1. ターミナル（黒い画面）を開きます**

- **Mac**: `⌘（コマンド）+ スペース` を押す →「ターミナル」と入力 → Enter
- **Windows**: スタートボタンを押す →「PowerShell」と入力 → Enter

**2. 開いた画面に、次の1行を貼り付けて Enter**

```
node --version
```

**3. 結果を見ます**

- `v20.x.x` や `v22.x.x` のような数字が出た → **準備OK。ステップ②へ**（20以上ならOK）
- 「command not found」などのエラーが出た → 下の手順で Node.js を入れます

**Node.js のインストール（入っていなかった場合）**

1. <https://nodejs.org/ja> を開く
2. 緑色のボタン（**LTS／推奨版**）をクリックしてダウンロード
3. ダウンロードしたファイルをダブルクリックし、画面の指示どおり「次へ」で進めてインストール
4. ターミナルを**一度閉じて開き直し**、もう一度 `node --version` を貼り付けて数字が出ればOK

---

## ステップ②　APIキーを取得する

1. コネクティッドワンの**サイト管理画面**を開く
2. **Website Settings（サイト設定）→ Applications（アプリケーション）→ API Key** を開く
3. 表示された APIキーをコピーして、メモ帳などに控える

あわせて、**あなたのサイトのサブドメイン**も控えてください。

```
https://あなたのサブドメイン.connected-one.world
```

- サブドメインは全サイトに自動発行されています（公開サイトを開いたときのURLで確認できます）
- 独自ドメイン（例: `https://example.com`）でも動作します
- ⚠️ **`www.` は付けないでください**（もし間違えても、正しいURLを教えてくれるエラーが出るので、その通りに直せばOKです）

> ⚠️ APIキーは「サイトの全データへの鍵」です。他人に教えたり、チャットやメールに貼ったりしないでください。

---

## ステップ③　AI（Claude）につなぐ

お使いのツールに合わせて、どれか1つを選んでください。

### A. Claude Desktop（デスクトップアプリ）を使っている方

1. Claude Desktop を開き、**設定（Settings）→ 開発者（Developer）→ 構成を編集（Edit Config）** をクリック
   - `claude_desktop_config.json` というファイルが開きます（または保存場所が表示されるので、メモ帳などで開きます）
2. ファイルの中身を、次のように書きます（**初めて設定する場合は、これを丸ごと貼り付け**）

```json
{
  "mcpServers": {
    "connectedone": {
      "command": "npx",
      "args": ["-y", "github:hiromu1126t-dotcom/connectedone-mcp"],
      "env": {
        "CONNECTEDONE_SITE_URL": "https://あなたのサブドメイン.connected-one.world",
        "CONNECTEDONE_API_KEY": "取得したAPIキー"
      }
    }
  }
}
```

3. `あなたのサブドメイン` と `取得したAPIキー` の2か所を、ステップ②で控えた値に書き換えて保存
4. Claude Desktop を**完全に終了**（Mac: `⌘+Q`）して、もう一度起動

※ すでに他の設定が書いてあるファイルだった場合は、`"mcpServers": {` の中に `"connectedone": { ... }` の部分だけを追加してください。

### B. Claude Code（ターミナル版）を使っている方

ターミナルに次の**1行**を貼り付けて、2か所（サブドメイン・APIキー）を書き換えて Enter。

```
claude mcp add connectedone -s user -e CONNECTEDONE_SITE_URL=https://あなたのサブドメイン.connected-one.world -e CONNECTEDONE_API_KEY=取得したAPIキー -- npx -y github:hiromu1126t-dotcom/connectedone-mcp
```

- ⚠️ **改行を入れず、1行のまま**貼り付けてください（途中で改行すると `command not found` エラーになります）
- `Added stdio MCP server connectedone...` と表示されれば成功です

### C. Cursor を使っている方

`~/.cursor/mcp.json`（プロジェクト単位なら `.cursor/mcp.json`）に、上記 A と同じ内容を書きます。

---

## 動作確認

Claude を起動し直して、こう話しかけてください。

```
コネクティッドワンの購読者リストを一覧して
```

リストが返ってくれば、セットアップ完了です 🎉
（初回だけ、裏でツールの準備に30秒ほどかかることがあります）

---

## うまくいかない時

| 症状 | 確認すること |
|---|---|
| 「APIキーが無効」と言われる | キーのコピーミスがないか。Website Settings → Applications → API Key の値と一致しているか |
| 「サイトに接続できない」と言われる | `CONNECTEDONE_SITE_URL` のドメインが正しいか（管理画面ではなく公開サイトのドメイン） |
| 「リダイレクトされました」と言われる | エラー内に表示された正しいドメインに `CONNECTEDONE_SITE_URL` を変更（`www.` を外すのが典型） |
| `command not found: -e` と出る | コマンドに改行が入っています。**1行のまま**コピーし直してください |
| `command not found: node` と出る | ステップ①の Node.js インストールへ |
| `command not found: claude` と出る | Claude Code が未インストールです。Claude Desktop をお使いの場合は方法Aで設定してください |
| ツールが一覧に出てこない | Claude を完全終了して再起動したか。設定ファイルにカンマ抜け等の書き間違いがないか |
| 古いバージョンが動いている | `npx` のキャッシュが原因のことがあります。時間をおいて再実行してください |

解決しない場合は、表示されたエラー文をそのまま案内元（コネクティッドワン担当者）に送ってください。

---

## 安全に使うために

- **APIキーはサイトの全データにアクセスできる鍵です。** チャットへの貼り付け、スクリーンショットでの共有、メールでの送付はしないでください
- 設定ファイルは自分のPCの中だけに保存されます。PCを共有している場合は注意してください
- 漏えいの疑いがある場合は、サイト管理画面からAPIキーを再発行してください
- 削除系ツール（🗑️）は取り消しできません。心配な場合は下の「読み取り専用モード」をお使いください

## 読み取り専用モード

「AIにはデータを見せたいけど、変更はさせたくない」場合は、`env` に1行追加してください。

```json
"CONNECTEDONE_READONLY": "true"
```

作成・更新・削除系のツール（19個）が登録されなくなり、誤操作が原理的に起きなくなります。チームメンバーに配る設定としておすすめです。

## 複数サイトを管理している場合

2つの方法があります。**2〜3サイトなら方法A（シンプル）、サイトが多いなら方法B（1つにまとめる）**がおすすめです。

### 方法A: サイトごとに登録する

サイトごとに名前を変えて複数登録できます。Claude には「cfbooks の注文を見せて」のようにサーバー名で区別して話しかけられます。

```json
{
  "mcpServers": {
    "connectedone-cfbooks": {
      "command": "npx",
      "args": ["-y", "github:hiromu1126t-dotcom/connectedone-mcp"],
      "env": {
        "CONNECTEDONE_SITE_URL": "https://cfbooksのサブドメイン.connected-one.world",
        "CONNECTEDONE_API_KEY": "サイトAのAPIキー"
      }
    },
    "connectedone-honten": {
      "command": "npx",
      "args": ["-y", "github:hiromu1126t-dotcom/connectedone-mcp"],
      "env": {
        "CONNECTEDONE_SITE_URL": "https://hontenのサブドメイン.connected-one.world",
        "CONNECTEDONE_API_KEY": "サイトBのAPIキー"
      }
    }
  }
}
```

APIキーはサイトごとに別物です。それぞれのサイトの管理画面（Website Settings → Applications → API Key）から取得してください。

### 方法B: 1つのサーバーに複数サイトをまとめる

環境変数に番号を付けて登録すると、1つのサーバーで全サイトを扱えます。全ツールに `site` パラメータが追加され、「**cfbooks の注文を一覧して**」のようにサイト名で指定して操作します（どのサイトへの操作か必ず指定する仕組みなので、誤って別サイトを書き換える事故が起きません）。

```json
{
  "mcpServers": {
    "connectedone": {
      "command": "npx",
      "args": ["-y", "github:hiromu1126t-dotcom/connectedone-mcp"],
      "env": {
        "CONNECTEDONE_SITE_NAME_1": "cfbooks",
        "CONNECTEDONE_SITE_URL_1": "https://cfbooksのサブドメイン.connected-one.world",
        "CONNECTEDONE_API_KEY_1": "サイトAのAPIキー",
        "CONNECTEDONE_SITE_NAME_2": "honten",
        "CONNECTEDONE_SITE_URL_2": "https://hontenのサブドメイン.connected-one.world",
        "CONNECTEDONE_API_KEY_2": "サイトBのAPIキー"
      }
    }
  }
}
```

- 番号は `_1` `_2` `_3` … と続けられます（サイト数の上限なし）
- `CONNECTEDONE_SITE_NAME_◯` は省略可。省略するとサブドメイン名（例: `autosalesacademy`）がサイト名になります
- サイトが1つだけの場合は従来どおり `CONNECTEDONE_SITE_URL` ＋ `CONNECTEDONE_API_KEY` でOK（`site` パラメータは追加されません）

## 環境変数

| 変数 | 必須 | 説明 |
|---|---|---|
| `CONNECTEDONE_SITE_URL` | ✅ | コネワン発行のサブドメイン推奨（`https://◯◯.connected-one.world`）。独自ドメインも可。`www.` は付けない |
| `CONNECTEDONE_API_KEY` | ✅ | ステップ②で取得したAPIキー |
| `CONNECTEDONE_SITE_NAME` | — | サイトの呼び名（省略時はサブドメイン名） |
| `CONNECTEDONE_SITE_URL_1` `_2` … | — | 複数サイトをまとめる場合のサイトURL（方法B） |
| `CONNECTEDONE_API_KEY_1` `_2` … | — | 複数サイトをまとめる場合のAPIキー（方法B） |
| `CONNECTEDONE_SITE_NAME_1` `_2` … | — | 複数サイトをまとめる場合の呼び名（省略時はサブドメイン名） |
| `CONNECTEDONE_READONLY` | — | `true` にすると閲覧系ツールのみ有効になり、作成・更新・削除は一切できなくなります |

## ツール一覧（全37）

凡例: 📖 読み取り / ✏️ 作成・更新 / 🗑️ 削除（取り消し不可）

### 連絡先（CRM）

| ツール | 種別 | 内容 |
|---|---|---|
| `list_contacts` | 📖 | 連絡先の一覧（作成日時で絞り込み可） |
| `create_contact` | ✏️ | 連絡先の作成（メール重複時は更新） |
| `search_contact_by_email` | 📖 | メールアドレスで検索 |
| `get_contact` | 📖 | 連絡先の詳細取得 |
| `update_contact` | ✏️ | 連絡先の更新（タグ・カスタム項目・購読リスト含む） |
| `delete_contact` | 🗑️ | 連絡先の削除 |

### 会員

| ツール | 種別 | 内容 |
|---|---|---|
| `list_members` | 📖 | 会員の一覧（グループで絞り込み可） |
| `create_member` | ✏️ | 会員の作成（パスワード省略時は設定メール自動送信） |
| `search_member_by_email` | 📖 | メールアドレスで検索 |
| `get_member` | 📖 | 会員の詳細取得 |
| `update_member` | ✏️ | 会員情報の更新 |
| `delete_member` | 🗑️ | 会員の削除 |
| `start_member_session` | ✏️ | SSO（再ログインなしで会員エリアに入れるURLを発行・15分有効） |

### 会員グループ

| ツール | 種別 | 内容 |
|---|---|---|
| `list_member_groups` | 📖 | グループの一覧 |
| `create_member_group` | ✏️ | グループの作成 |
| `get_member_group` | 📖 | グループの詳細取得 |
| `update_member_group` | ✏️ | グループの更新 |
| `delete_member_group` | 🗑️ | グループの削除 |

### 商品

| ツール | 種別 | 内容 |
|---|---|---|
| `list_products` | 📖 | 商品の一覧（カテゴリ・商品名で絞り込み可） |
| `create_product` | ✏️ | 商品の作成（物販・デジタル・サービス・メンバーシップ、サブスク設定可） |
| `get_product` | 📖 | 商品の詳細取得 |
| `update_product` | ✏️ | 商品の更新 |
| `delete_product` | 🗑️ | 商品の削除 |
| `list_product_categories` | 📖 | 商品カテゴリの一覧 |

### 注文

| ツール | 種別 | 内容 |
|---|---|---|
| `list_orders` | 📖 | 注文の一覧（注文日時で絞り込み可） |
| `get_order` | 📖 | 注文の詳細取得（商品・金額・支払い・配送先） |
| `update_order` | ✏️ | 注文の更新（ステータス変更・追跡番号登録・顧客への通知メール） |

### フォーム・予約

| ツール | 種別 | 内容 |
|---|---|---|
| `list_form_submissions` | 📖 | フォーム送信データの一覧 |
| `list_bookings` | 📖 | 予約の一覧（期間・イベントで絞り込み可） |

### メルマガ購読者リスト

| ツール | 種別 | 内容 |
|---|---|---|
| `list_subscriber_lists` | 📖 | リストの一覧（購読者数・開封率・クリック率付き） |
| `create_subscriber_list` | ✏️ | リストの作成 |
| `get_subscriber_list` | 📖 | リストの詳細取得 |
| `update_subscriber_list` | ✏️ | リスト名の変更 |
| `delete_subscriber_list` | 🗑️ | リストの削除 |

### Webhook（イベント自動通知）

| ツール | 種別 | 内容 |
|---|---|---|
| `list_webhooks` | 📖 | 登録済みWebhookの一覧 |
| `create_webhook` | ✏️ | Webhookの登録（注文・フォーム送信・予約などのイベントを外部URLへ即時通知） |
| `delete_webhook` | 🗑️ | Webhookの削除 |

> 補足: Webhook の「受信側」（通知を受け取るサーバー）はこのMCPの範囲外です。Zapier / Make / 自作エンドポイントなどをご用意ください。

## English

**connectedone-mcp** is a Model Context Protocol (MCP) server for the ConnectedOne Website API. It exposes 37 tools covering contacts, members, member groups, products, orders, form submissions, bookings, subscriber lists and webhooks.

Setup: get your API key from **Website Settings → Applications → API Key**, then add to your MCP client:

```json
{
  "mcpServers": {
    "connectedone": {
      "command": "npx",
      "args": ["-y", "github:hiromu1126t-dotcom/connectedone-mcp"],
      "env": {
        "CONNECTEDONE_SITE_URL": "https://your-subdomain.connected-one.world",
        "CONNECTEDONE_API_KEY": "your-api-key"
      }
    }
  }
}
```

Use your platform-issued subdomain (recommended) or your custom domain — without `www.`. If you set a wrong domain, the error message tells you the correct one.

Set `CONNECTEDONE_READONLY=true` to register read-only tools only (18 of 37). For multiple sites, use numbered env vars (`CONNECTEDONE_SITE_URL_1`, `CONNECTEDONE_API_KEY_1`, …) — a required `site` parameter is then added to every tool.

## ライセンス

MIT
