import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
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
  const api = new ApiClient(config);
  const server = new McpServer({ name: "connectedone", version: VERSION });

  for (const tool of allTools()) {
    if (config.readonly && !tool.annotations.readOnlyHint) continue;
    server.registerTool(
      tool.name,
      {
        description: tool.description,
        inputSchema: tool.inputSchema,
        annotations: tool.annotations,
      },
      async (args: Record<string, unknown>) => {
        try {
          const data = await tool.handler(args ?? {}, api);
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
