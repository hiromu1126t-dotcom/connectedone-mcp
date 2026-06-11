import { z } from "zod";
import type { ToolDef } from "../types.js";
import { READ_ONLY, WRITE, DESTRUCTIVE } from "../types.js";
import { pathId } from "../http.js";
import { idSchema, webhookEventSchema } from "../schemas.js";

export const webhookTools: ToolDef[] = [
  {
    name: "list_webhooks",
    description: "登録済みのWebhook（イベント自動通知）を一覧取得します。",
    inputSchema: {},
    annotations: READ_ONLY,
    handler: (_args, api) => api.request("GET", "/webhooks"),
  },
  {
    name: "create_webhook",
    description:
      "Webhookを登録します。サイトで指定イベント（注文作成・フォーム送信など）が発生した瞬間に、指定URLへJSONがPOST送信されるようになります。",
    inputSchema: {
      target: z.string().describe("通知の送信先URL（あなたのサーバーのエンドポイント、必須）"),
      events: z.array(webhookEventSchema).min(1).describe("通知を受け取るイベントの配列（必須）"),
      secret: z
        .string()
        .optional()
        .describe("署名検証用シークレット。設定すると、受信側で通知の送信元がConnectedOneであることを検証できる"),
    },
    annotations: WRITE,
    handler: (args, api) => api.request("POST", "/webhooks", { body: args }),
  },
  {
    name: "delete_webhook",
    description: "Webhookを削除します。以降そのURLへの通知は停止します。",
    inputSchema: { id: idSchema },
    annotations: DESTRUCTIVE,
    handler: ({ id }, api) => api.request("DELETE", `/webhooks/${pathId(id)}`),
  },
];
