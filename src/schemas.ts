import { z } from "zod";

export const paginationShape = {
  limit: z.number().int().min(1).max(50).optional().describe("1ページの件数（1〜50、省略時30）"),
  skip: z.number().int().min(0).optional().describe("スキップする件数（ページ送り用、省略時0）"),
};

export const idSchema = z.union([z.number(), z.string()]).describe("対象のID");

export const LIST_NOTE =
  "レスポンスは {items, totalCount, limit, skip} 形式。totalCount が limit より多い場合は skip を増やして続きを取得できます。";

export const contactPropertySchema = z.object({
  name: z.string().describe("カスタムプロパティ名（サイトのCRMで定義した項目名）"),
  value: z.string().describe("値"),
});

export const contactFieldsShape = {
  name: z.string().optional().describe("連絡先の名前"),
  phone: z.string().optional().describe("電話番号"),
  note: z.string().optional().describe("非公開メモ"),
  address: z.string().optional().describe("住所"),
  city: z.string().optional().describe("市区町村"),
  state: z.string().optional().describe("都道府県・州"),
  zip: z.string().optional().describe("郵便番号"),
  country: z.string().optional().describe("国"),
  companyName: z.string().optional().describe("会社名"),
  properties: z.array(contactPropertySchema).optional().describe("CRMカスタムプロパティの配列"),
  tags: z.array(z.string()).optional().describe("タグの一覧"),
  subscribed: z.boolean().optional().describe("メルマガ購読者にするかどうか"),
  subscriberLists: z.array(z.number()).optional().describe("所属させる購読者リストIDの配列"),
};

export const addressSchema = z.object({
  name: z.string().optional().describe("宛名"),
  phone: z.string().optional().describe("電話番号"),
  companyName: z.string().optional().describe("会社名"),
  companyId: z.string().optional().describe("会社の識別番号（法人番号など）"),
  country: z.string().optional().describe("国コード（ISO 3166の2文字。日本は JP）"),
  state: z.string().optional().describe("都道府県・州"),
  city: z.string().optional().describe("市区町村"),
  zipCode: z.string().optional().describe("郵便番号"),
  address: z.string().optional().describe("住所1行目"),
  address2: z.string().optional().describe("住所2行目"),
});

export const productTypeSchema = z
  .enum(["physical", "digital", "service", "membership"])
  .describe("商品タイプ: physical=物販 / digital=デジタル商品 / service=サービス / membership=メンバーシップ");

export const subscriptionSchema = z
  .object({
    cycles: z.number().int().optional().describe("課金回数（0で無期限の継続課金）"),
    period: z.number().int().optional().describe("課金間隔の数（例: 1ヶ月ごとなら1）"),
    periodUnit: z.enum(["WEEKLY", "MONTHLY"]).optional().describe("課金間隔の単位（週次/月次）"),
  })
  .describe("サブスクリプション（定期課金）設定");

export const productOptionSchema = z.object({
  name: z.string().describe("オプション名（例: Color、Size、Material）"),
  values: z.array(z.string()).describe("選択肢の一覧"),
  advanced: z.boolean().optional().describe("trueの場合、選択肢の組み合わせごとに価格・在庫を個別管理"),
});

export const productVariantSchema = z.object({
  options: z.array(z.string()).optional().describe("このバリエーションを識別するオプション値の組み合わせ"),
  price: z.number().optional().describe("価格"),
  onSale: z.boolean().optional().describe("セール中かどうか"),
  regularPrice: z.number().nullable().optional().describe("通常価格（セール中の場合）"),
  salePrice: z.number().nullable().optional().describe("セール価格"),
  quantity: z.number().int().nullable().optional().describe("在庫数（在庫管理しない場合はnull）"),
  sku: z.string().nullable().optional().describe("SKU（商品管理番号）"),
  weight: z.number().nullable().optional().describe("重量"),
});

export const productFieldsShape = {
  description: z.string().optional().describe("商品説明（簡単なHTML可）"),
  url: z.string().optional().describe("ストア内の商品URL（ハンドル）"),
  hidden: z.boolean().optional().describe("ストアで非表示にするかどうか"),
  images: z.array(z.string()).optional().describe("商品画像URLの配列"),
  categories: z.array(z.any()).optional().describe("商品カテゴリ（カテゴリIDの配列）"),
  options: z.array(productOptionSchema).optional().describe("商品オプション（色・サイズ等）の定義"),
  variants: z.array(productVariantSchema).optional().describe("バリエーション（価格・在庫・SKU等）"),
  subscription: subscriptionSchema.optional(),
  file: z.string().optional().describe("デジタル商品のみ: 販売するファイルのURL"),
};

export const orderStatusSchema = z
  .enum(["PENDING", "SHIPPED", "COMPLETED", "CANCELED", "ARCHIVED"])
  .describe(
    "設定する注文ステータス（更新時は大文字で指定。取得時は小文字で返る）。COMPLETED にすると、デジタル商品・メンバーシップを含む注文では顧客にアクセス用メールが自動送信される",
  );

export const fulfillmentSchema = z
  .object({
    courier: z.string().optional().describe("配送業者名（例: ヤマト運輸、UPS）"),
    trackingNo: z.string().optional().describe("追跡番号"),
    trackingUrl: z.string().optional().describe("追跡ページのURL"),
  })
  .describe("配送情報");

export const webhookEventSchema = z
  .enum([
    "order_created",
    "order_updated",
    "product_created",
    "product_updated",
    "form_submitted",
    "contact_updated",
    "booking_created",
  ])
  .describe(
    "イベント種別: order_created=注文作成 / order_updated=注文更新 / product_created=商品作成 / product_updated=商品更新 / form_submitted=フォーム送信 / contact_updated=連絡先更新 / booking_created=予約作成",
  );
