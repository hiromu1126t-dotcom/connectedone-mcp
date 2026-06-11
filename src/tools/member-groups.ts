import { z } from "zod";
import type { ToolDef } from "../types.js";
import { READ_ONLY, WRITE, UPDATE, DESTRUCTIVE } from "../types.js";
import { pathId } from "../http.js";
import { paginationShape, idSchema, LIST_NOTE } from "../schemas.js";

export const memberGroupTools: ToolDef[] = [
  {
    name: "list_member_groups",
    description: `会員グループを一覧取得します。${LIST_NOTE}`,
    inputSchema: { ...paginationShape },
    annotations: READ_ONLY,
    handler: (args, api) => api.request("GET", "/member-groups", { query: args }),
  },
  {
    name: "create_member_group",
    description: "会員グループを作成します。",
    inputSchema: {
      name: z.string().describe("グループ名（必須）"),
      link: z.string().optional().describe("ログイン成功後に会員をリダイレクトするデフォルトページ"),
    },
    annotations: WRITE,
    handler: (args, api) => api.request("POST", "/member-groups", { body: args }),
  },
  {
    name: "get_member_group",
    description: "IDを指定して会員グループを1件取得します。",
    inputSchema: { id: idSchema },
    annotations: READ_ONLY,
    handler: ({ id }, api) => api.request("GET", `/member-groups/${pathId(id)}`),
  },
  {
    name: "update_member_group",
    description: "会員グループを更新します。指定した項目のみ反映されます。",
    inputSchema: {
      id: idSchema,
      name: z.string().optional().describe("グループ名"),
      link: z.string().optional().describe("ログイン成功後に会員をリダイレクトするデフォルトページ"),
    },
    annotations: UPDATE,
    handler: ({ id, ...body }, api) => api.request("PUT", `/member-groups/${pathId(id)}`, { body }),
  },
  {
    name: "delete_member_group",
    description: "会員グループを削除します。元に戻せないため、実行前に対象IDをよく確認してください。",
    inputSchema: { id: idSchema },
    annotations: DESTRUCTIVE,
    handler: ({ id }, api) => api.request("DELETE", `/member-groups/${pathId(id)}`),
  },
];
