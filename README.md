# connectedone-mcp

ConnectedOne のサイトデータを、Claude などの AI アシスタントから直接操作できる MCP サーバーです。

連絡先（CRM）・会員・商品・注文・フォーム送信・予約・メルマガ購読者リスト・Webhook を、チャットで話しかけるだけで確認・更新できるようになります。

> [English summary is at the bottom of this page.](#english)

## できることの例

設定が終わると、Claude にこんなお願いができるようになります。

- 「今月入った注文を一覧して」
- 「`tanaka@example.com` さんの連絡先に『セミナー参加』タグを付けて」
- 「注文 #1234 を発送済みにして、ヤマト運輸の追跡番号 XXXX を登録して、お客様に通知して」
- 「メルマガリストごとの購読者数と開封率を表にして」
- 「先週のフォーム送信を全部見せて」

## 必要なもの

- **Node.js 20 以上** — ターミナルで `node --version` を実行して確認できます。入っていない場合は <https://nodejs.org/> からインストールしてください
- **git** — macOS は Xcode Command Line Tools に含まれます（`git --version` で確認）
- **ConnectedOne サイトの管理者権限** — APIキーの取得に必要です

## ① APIキーを取得する

1. ConnectedOne のサイト管理画面を開く
2. **Website Settings**（サイト設定）→ **Applications**（アプリケーション）→ **API Key** を開く
3. 表示された APIキーをコピーする

> ⚠️ APIキーは「サイトの全データへの鍵」です。他人に共有しないでください。

## ② AIクライアントに設定する

### Claude Desktop の場合

設定ファイルを開きます。

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

以下を追記して、Claude Desktop を再起動します。

```json
{
  "mcpServers": {
    "connectedone": {
      "command": "npx",
      "args": ["-y", "github:hiromu1126t-dotcom/connectedone-mcp"],
      "env": {
        "CONNECTEDONE_SITE_URL": "https://あなたのサイトのドメイン",
        "CONNECTEDONE_API_KEY": "取得したAPIキー"
      }
    }
  }
}
```

### Claude Code の場合

ターミナルで1行実行します。

```bash
claude mcp add connectedone \
  -e CONNECTEDONE_SITE_URL=https://あなたのサイトのドメイン \
  -e CONNECTEDONE_API_KEY=取得したAPIキー \
  -- npx -y github:hiromu1126t-dotcom/connectedone-mcp
```

### Cursor の場合

プロジェクトの `.cursor/mcp.json`（または全体設定の `~/.cursor/mcp.json`）に、Claude Desktop と同じ形式で追記します。

### 動作確認

設定後にAIクライアントを再起動し、「**コネクティッドワンの購読者リストを一覧して**」と話しかけてみてください。リストが返ってくれば接続成功です。

## 環境変数

| 変数 | 必須 | 説明 |
|---|---|---|
| `CONNECTEDONE_SITE_URL` | ✅ | あなたのサイトのドメイン。`example.com` でも `https://example.com` でもOK（自動で正規化されます） |
| `CONNECTEDONE_API_KEY` | ✅ | ①で取得したAPIキー |
| `CONNECTEDONE_READONLY` | — | `true` にすると閲覧系ツールのみ有効になり、作成・更新・削除は一切できなくなります |

## 読み取り専用モード

「AIにはデータを見せたいけど、変更はさせたくない」場合は、`env` に1行追加してください。

```json
"CONNECTEDONE_READONLY": "true"
```

作成・更新・削除系のツール（19個）が登録されなくなり、誤操作が原理的に起きなくなります。チームメンバーやクライアントに配る設定としておすすめです。

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

## セキュリティ上の注意

- **APIキーはサイトの全データにアクセスできる鍵です。** チャットへの貼り付け、スクリーンショットでの共有、メールでの送付はしないでください
- 設定ファイル（`claude_desktop_config.json` など）は自分のPCの中だけに保存されます。PCを共有している場合は注意してください
- 漏えいの疑いがある場合は、サイト管理画面からAPIキーを再発行してください
- 削除系ツール（🗑️）は取り消しできません。心配な場合は読み取り専用モードをお使いください

## うまくいかない時

| 症状 | 確認すること |
|---|---|
| 「APIキーが無効」と言われる | キーのコピーミスがないか。Website Settings → Applications → API Key の値と一致しているか |
| 「サイトに接続できない」と言われる | `CONNECTEDONE_SITE_URL` のドメインが正しいか（管理画面ではなく公開サイトのドメイン） |
| ツールが一覧に出てこない | AIクライアントを再起動したか。設定JSONにカンマ抜け等の文法ミスがないか |
| `npx` でエラーが出る | `node --version` が20以上か。`git --version` でgitが入っているか |
| 古いバージョンが動いている | `npx` のキャッシュが原因のことがあります。`npx clear-npx-cache` を実行するか、時間をおいて再実行してください |

## English

**connectedone-mcp** is a Model Context Protocol (MCP) server for the ConnectedOne (Simvoly white-label) Website API. It exposes 37 tools covering contacts, members, member groups, products, orders, form submissions, bookings, subscriber lists and webhooks.

Setup: get your API key from **Website Settings → Applications → API Key**, then add to your MCP client:

```json
{
  "mcpServers": {
    "connectedone": {
      "command": "npx",
      "args": ["-y", "github:hiromu1126t-dotcom/connectedone-mcp"],
      "env": {
        "CONNECTEDONE_SITE_URL": "https://your-site-domain.com",
        "CONNECTEDONE_API_KEY": "your-api-key"
      }
    }
  }
}
```

Set `CONNECTEDONE_READONLY=true` to register read-only tools only (18 of 37).

## ライセンス

MIT
