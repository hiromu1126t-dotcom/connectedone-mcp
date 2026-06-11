import { z } from "zod";
import type { ToolDef } from "../types.js";
import { READ_ONLY, WRITE, UPDATE, DESTRUCTIVE } from "../types.js";
import { pathId } from "../http.js";
import { paginationShape, idSchema, contactFieldsShape, LIST_NOTE } from "../schemas.js";

export const contactTools: ToolDef[] = [
  {
    name: "list_contacts",
    description: `サイトの連絡先（見込み客・顧客）を一覧取得します。作成日時で絞り込みできます。${LIST_NOTE}`,
    inputSchema: {
      ...paginationShape,
      created_at_min: z.number().int().optional().describe("この日時以降に作成された連絡先のみ（Unix秒）"),
      created_at_max: z.number().int().optional().describe("この日時以前に作成された連絡先のみ（Unix秒）"),
    },
    annotations: READ_ONLY,
    handler: (args, api) => api.request("GET", "/contacts", { query: args }),
  },
  {
    name: "create_contact",
    description:
      "連絡先を作成します。同じメールアドレスの連絡先が既に存在する場合は、その連絡先が更新されます（指定した項目のみ反映）。",
    inputSchema: {
      email: z.string().describe("メールアドレス（必須）"),
      ...contactFieldsShape,
    },
    annotations: WRITE,
    handler: (args, api) => api.request("POST", "/contacts", { body: args }),
  },
  {
    name: "search_contact_by_email",
    description: "メールアドレスで連絡先を検索します。",
    inputSchema: {
      email: z.string().describe("検索するメールアドレス"),
    },
    annotations: READ_ONLY,
    handler: (args, api) => api.request("GET", "/contacts/search-by-email", { query: args }),
  },
  {
    name: "get_contact",
    description: "IDを指定して連絡先を1件取得します。タグ・CRMカスタムプロパティ・購読リストの所属も含まれます。",
    inputSchema: { id: idSchema },
    annotations: READ_ONLY,
    handler: ({ id }, api) => api.request("GET", `/contacts/${pathId(id)}`),
  },
  {
    name: "update_contact",
    description: "連絡先を更新します。指定した項目のみ反映されます。",
    inputSchema: {
      id: idSchema,
      email: z.string().optional().describe("メールアドレス"),
      ...contactFieldsShape,
    },
    annotations: UPDATE,
    handler: ({ id, ...body }, api) => api.request("PUT", `/contacts/${pathId(id)}`, { body }),
  },
  {
    name: "delete_contact",
    description: "連絡先を削除します。元に戻せないため、実行前に対象IDをよく確認してください。",
    inputSchema: { id: idSchema },
    annotations: DESTRUCTIVE,
    handler: ({ id }, api) => api.request("DELETE", `/contacts/${pathId(id)}`),
  },
];
