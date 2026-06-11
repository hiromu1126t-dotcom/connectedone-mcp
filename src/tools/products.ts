import { z } from "zod";
import type { ToolDef } from "../types.js";
import { READ_ONLY, WRITE, UPDATE, DESTRUCTIVE } from "../types.js";
import { pathId } from "../http.js";
import { paginationShape, idSchema, productTypeSchema, productFieldsShape, LIST_NOTE } from "../schemas.js";

export const productTools: ToolDef[] = [
  {
    name: "list_products",
    description: `ストアの商品を一覧取得します。カテゴリや商品名で絞り込みできます。${LIST_NOTE}`,
    inputSchema: {
      ...paginationShape,
      category_id: z.number().optional().describe("このカテゴリに属する商品のみ取得"),
      title: z.string().optional().describe("商品名で検索"),
    },
    annotations: READ_ONLY,
    handler: (args, api) => api.request("GET", "/products", { query: args }),
  },
  {
    name: "create_product",
    description:
      "商品を作成します。物販（physical）・デジタル商品（digital）・サービス（service）・メンバーシップ（membership）に対応し、バリエーションやサブスクリプション（定期課金）も設定できます。",
    inputSchema: {
      type: productTypeSchema,
      title: z.string().describe("商品名（必須）"),
      ...productFieldsShape,
      update_existing_product_by_url: z
        .boolean()
        .optional()
        .describe("trueの場合、url が一致する既存商品があれば新規作成せずに更新する"),
    },
    annotations: WRITE,
    handler: ({ update_existing_product_by_url, ...body }, api) =>
      api.request("POST", "/products", {
        body,
        query:
          update_existing_product_by_url === undefined
            ? undefined
            : { update_existing_product_by_url },
      }),
  },
  {
    name: "get_product",
    description: "IDを指定して商品を1件取得します。バリエーション・カテゴリ・サブスク設定も含まれます。",
    inputSchema: { id: idSchema },
    annotations: READ_ONLY,
    handler: ({ id }, api) => api.request("GET", `/products/${pathId(id)}`),
  },
  {
    name: "update_product",
    description: "商品を更新します。指定した項目のみ反映されます。",
    inputSchema: {
      id: idSchema,
      type: productTypeSchema.optional(),
      title: z.string().optional().describe("商品名"),
      ...productFieldsShape,
    },
    annotations: UPDATE,
    handler: ({ id, ...body }, api) => api.request("PUT", `/products/${pathId(id)}`, { body }),
  },
  {
    name: "delete_product",
    description: "商品を削除します。元に戻せないため、実行前に対象IDをよく確認してください。",
    inputSchema: { id: idSchema },
    annotations: DESTRUCTIVE,
    handler: ({ id }, api) => api.request("DELETE", `/products/${pathId(id)}`),
  },
  {
    name: "list_product_categories",
    description: "商品カテゴリを一覧取得します。親カテゴリIDで絞り込みできます。",
    inputSchema: {
      parent: z.number().optional().describe("この親カテゴリ直下のカテゴリのみ取得"),
    },
    annotations: READ_ONLY,
    handler: (args, api) => api.request("GET", "/products/categories", { query: args }),
  },
];
