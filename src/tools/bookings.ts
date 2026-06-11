import { z } from "zod";
import type { ToolDef } from "../types.js";
import { READ_ONLY } from "../types.js";
import { paginationShape, LIST_NOTE } from "../schemas.js";

export const bookingTools: ToolDef[] = [
  {
    name: "list_bookings",
    description: `予約済みセッション（予約カレンダーの予約）を一覧取得します。開始日時やイベントIDで絞り込みできます。${LIST_NOTE}`,
    inputSchema: {
      ...paginationShape,
      from: z.number().int().optional().describe("この日時以降に開始する予約のみ（Unix秒）"),
      to: z.number().int().optional().describe("この日時以前に開始する予約のみ（Unix秒）"),
      eventId: z.number().optional().describe("このイベントIDの予約のみ取得"),
    },
    annotations: READ_ONLY,
    handler: (args, api) => api.request("GET", "/bookings", { query: args }),
  },
];
