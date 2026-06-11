import { z } from "zod";
import type { ToolDef } from "../types.js";
import { READ_ONLY, UPDATE } from "../types.js";
import { pathId } from "../http.js";
import { paginationShape, idSchema, addressSchema, orderStatusSchema, fulfillmentSchema, LIST_NOTE } from "../schemas.js";

export const orderTools: ToolDef[] = [
  {
    name: "list_orders",
    description: `ストアの注文を一覧取得します。注文日時で絞り込みできます。${LIST_NOTE}`,
    inputSchema: {
      ...paginationShape,
      created_at_min: z.number().int().optional().describe("この日時以降の注文のみ（Unix秒）"),
      created_at_max: z.number().int().optional().describe("この日時以前の注文のみ（Unix秒）"),
    },
    annotations: READ_ONLY,
    handler: (args, api) => api.request("GET", "/orders", { query: args }),
  },
  {
    name: "get_order",
    description:
      "IDを指定して注文を1件取得します。注文商品・金額・支払い状況・配送先・ステータス・メモも含まれます。",
    inputSchema: { id: idSchema },
    annotations: READ_ONLY,
    handler: ({ id }, api) => api.request("GET", `/orders/${pathId(id)}`),
  },
  {
    name: "update_order",
    description:
      "注文を更新します。指定した項目のみ反映されます。ステータス変更（発送済み・完了など）、配送業者・追跡番号の設定、顧客への通知メール送信ができます。status を COMPLETED にすると、デジタル商品・メンバーシップを含む注文では顧客にアクセス用メールが自動送信されます。",
    inputSchema: {
      id: idSchema,
      status: orderStatusSchema.optional(),
      fulfillment: fulfillmentSchema.optional(),
      notifyCustomer: z.boolean().optional().describe("trueにすると、この変更を顧客にメールで通知する"),
      paid: z.boolean().optional().describe("支払い済みにするかどうか"),
      paymentMethod: z.string().optional().describe("支払い方法（例: stripe）"),
      transactionId: z.string().optional().describe("支払いを一意に識別するトランザクションID"),
      customerName: z.string().optional().describe("顧客名"),
      customerEmail: z.string().optional().describe("顧客のメールアドレス"),
      billingAddress: addressSchema.optional().describe("請求先住所"),
      shippingAddress: addressSchema.optional().describe("配送先住所"),
    },
    annotations: UPDATE,
    handler: ({ id, ...body }, api) => api.request("PUT", `/orders/${pathId(id)}`, { body }),
  },
];
