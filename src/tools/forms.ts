import { z } from "zod";
import type { ToolDef } from "../types.js";
import { READ_ONLY } from "../types.js";
import { paginationShape, LIST_NOTE } from "../schemas.js";

export const formTools: ToolDef[] = [
  {
    name: "list_form_submissions",
    description: `サイトのフォーム送信データ（お問い合わせ・申し込み等）を一覧取得します。送信日時で絞り込みできます。${LIST_NOTE}`,
    inputSchema: {
      ...paginationShape,
      from: z.number().int().optional().describe("この日時以降の送信のみ（Unix秒）"),
      to: z.number().int().optional().describe("この日時以前の送信のみ（Unix秒）"),
    },
    annotations: READ_ONLY,
    handler: (args, api) => api.request("GET", "/form-submissions", { query: args }),
  },
];
