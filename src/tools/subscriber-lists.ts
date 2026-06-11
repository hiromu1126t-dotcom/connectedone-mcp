import { z } from "zod";
import type { ToolDef } from "../types.js";
import { READ_ONLY, WRITE, UPDATE, DESTRUCTIVE } from "../types.js";
import { pathId } from "../http.js";
import { paginationShape, idSchema, LIST_NOTE } from "../schemas.js";

export const subscriberListTools: ToolDef[] = [
  {
    name: "list_subscriber_lists",
    description: `メルマガの購読者リストを一覧取得します。各リストの購読者数（subscribers）・開封率（opens、0〜1）・クリック率（clicks、0〜1）が含まれます。${LIST_NOTE}`,
    inputSchema: { ...paginationShape },
    annotations: READ_ONLY,
    handler: (args, api) => api.request("GET", "/subscriber-lists", { query: args }),
  },
  {
    name: "create_subscriber_list",
    description: "メルマガの購読者リストを作成します。",
    inputSchema: {
      name: z.string().describe("リスト名（必須）"),
    },
    annotations: WRITE,
    handler: (args, api) => api.request("POST", "/subscriber-lists", { body: args }),
  },
  {
    name: "get_subscriber_list",
    description:
      "IDを指定して購読者リストを1件取得します。購読者数（subscribers）・開封率（opens、0〜1）・クリック率（clicks、0〜1）が含まれます。",
    inputSchema: { id: idSchema },
    annotations: READ_ONLY,
    handler: ({ id }, api) => api.request("GET", `/subscriber-lists/${pathId(id)}`),
  },
  {
    name: "update_subscriber_list",
    description: "購読者リストの名前を変更します。",
    inputSchema: {
      id: idSchema,
      name: z.string().describe("新しいリスト名"),
    },
    annotations: UPDATE,
    handler: ({ id, ...body }, api) => api.request("PUT", `/subscriber-lists/${pathId(id)}`, { body }),
  },
  {
    name: "delete_subscriber_list",
    description: "購読者リストを削除します。元に戻せないため、実行前に対象IDをよく確認してください。",
    inputSchema: { id: idSchema },
    annotations: DESTRUCTIVE,
    handler: ({ id }, api) => api.request("DELETE", `/subscriber-lists/${pathId(id)}`),
  },
];
