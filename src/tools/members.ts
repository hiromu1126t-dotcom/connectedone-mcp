import { z } from "zod";
import type { ToolDef } from "../types.js";
import { READ_ONLY, WRITE, UPDATE, DESTRUCTIVE } from "../types.js";
import { pathId } from "../http.js";
import { paginationShape, idSchema, addressSchema, LIST_NOTE } from "../schemas.js";

const memberFieldsShape = {
  groups: z.array(z.number()).optional().describe("所属させる会員グループIDの配列"),
  approved: z.boolean().optional().describe("承認済みにするかどうか"),
  billingAddress: addressSchema.optional().describe("請求先住所"),
  shippingAddress: addressSchema.optional().describe("配送先住所"),
};

export const memberTools: ToolDef[] = [
  {
    name: "list_members",
    description: `サイトの会員（登録ユーザー）を一覧取得します。会員グループで絞り込みできます。${LIST_NOTE}`,
    inputSchema: {
      ...paginationShape,
      group_id: z.number().optional().describe("この会員グループに所属する会員のみ取得"),
    },
    annotations: READ_ONLY,
    handler: (args, api) => api.request("GET", "/members", { query: args }),
  },
  {
    name: "create_member",
    description:
      "会員を新規作成します。password を省略すると、ランダムなパスワードが設定され、会員にパスワード設定（リセット）メールが自動送信されます。",
    inputSchema: {
      name: z.string().describe("会員の名前（必須）"),
      email: z.string().describe("メールアドレス（必須）"),
      password: z.string().optional().describe("パスワード。省略時はリセットメールが会員に送信される"),
      ...memberFieldsShape,
    },
    annotations: WRITE,
    handler: (args, api) => api.request("POST", "/members", { body: args }),
  },
  {
    name: "search_member_by_email",
    description: "メールアドレスで会員を検索します。",
    inputSchema: {
      email: z.string().describe("検索するメールアドレス"),
    },
    annotations: READ_ONLY,
    handler: (args, api) => api.request("GET", "/members/search-by-email", { query: args }),
  },
  {
    name: "get_member",
    description: "IDを指定して会員を1件取得します。所属グループ・承認状態・登録日時も含まれます。",
    inputSchema: { id: idSchema },
    annotations: READ_ONLY,
    handler: ({ id }, api) => api.request("GET", `/members/${pathId(id)}`),
  },
  {
    name: "update_member",
    description: "会員情報を更新します。指定した項目のみ反映されます（パスワードはこのツールでは変更できません）。",
    inputSchema: {
      id: idSchema,
      name: z.string().optional().describe("会員の名前"),
      email: z.string().optional().describe("メールアドレス"),
      ...memberFieldsShape,
    },
    annotations: UPDATE,
    handler: ({ id, ...body }, api) => api.request("PUT", `/members/${pathId(id)}`, { body }),
  },
  {
    name: "delete_member",
    description: "会員を削除します。元に戻せないため、実行前に対象IDをよく確認してください。",
    inputSchema: { id: idSchema },
    annotations: DESTRUCTIVE,
    handler: ({ id }, api) => api.request("DELETE", `/members/${pathId(id)}`),
  },
  {
    name: "start_member_session",
    description:
      "会員のシングルサインオン（SSO）セッションを開始し、ログイン済み状態でアクセスできる accessUrl を発行します。自前の認証システムでログイン済みのユーザーを、再ログインなしで会員エリアへ誘導できます。accessUrl は15分間有効で、ログイン権限そのものなので取り扱いに注意してください。",
    inputSchema: {
      email: z.string().describe("会員のメールアドレス（必須）"),
      path: z.string().optional().describe("サインオン後に遷移させるページのパス"),
    },
    annotations: WRITE,
    handler: (args, api) => api.request("POST", "/members/start-session", { body: args }),
  },
];
