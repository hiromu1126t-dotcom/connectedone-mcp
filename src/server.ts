import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { VERSION } from "./config.js";
import type { Config } from "./config.js";
import { ApiClient } from "./http.js";
import type { ToolDef } from "./types.js";
import { contactTools } from "./tools/contacts.js";
import { memberTools } from "./tools/members.js";
import { memberGroupTools } from "./tools/member-groups.js";
import { productTools } from "./tools/products.js";
import { orderTools } from "./tools/orders.js";
import { formTools } from "./tools/forms.js";
import { bookingTools } from "./tools/bookings.js";
import { subscriberListTools } from "./tools/subscriber-lists.js";
import { webhookTools } from "./tools/webhooks.js";

export function allTools(): ToolDef[] {
  return [
    ...contactTools,
    ...memberTools,
    ...memberGroupTools,
    ...productTools,
    ...orderTools,
    ...formTools,
    ...bookingTools,
    ...subscriberListTools,
    ...webhookTools,
  ];
}

export function createServer(config: Config): McpServer {
  const clients = new Map<string, ApiClient>();
  for (const site of config.sites) clients.set(site.name, new ApiClient(site));

  const siteNames = config.sites.map((s) => s.name);
  const multiSite = config.sites.length > 1;
  const defaultClient = clients.get(siteNames[0])!;

  const server = new McpServer({ name: "connectedone", version: VERSION });

  for (const tool of allTools()) {
    if (config.readonly && !tool.annotations.readOnlyHint) continue;

    const inputSchema = multiSite
      ? {
          site: z
            .enum(siteNames as [string, ...string[]])
            .describe(`操作対象のサイト名（${siteNames.join(" / ")}）`),
          ...tool.inputSchema,
        }
      : tool.inputSchema;

    server.registerTool(
      tool.name,
      {
        description: tool.description,
        inputSchema,
        annotations: tool.annotations,
      },
      async (args: Record<string, unknown>) => {
        try {
          const { site, ...rest } = (args ?? {}) as Record<string, any>;
          const client = multiSite ? clients.get(String(site)) : defaultClient;
          if (!client) {
            return {
              content: [
                {
                  type: "text" as const,
                  text: `サイト「${site}」は設定されていません。利用可能なサイト: ${siteNames.join(" / ")}`,
                },
              ],
              isError: true,
            };
          }
          const data = await tool.handler(rest, client);
          return {
            content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
          };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return {
            content: [{ type: "text" as const, text: message }],
            isError: true,
          };
        }
      },
    );
  }

  return server;
}
