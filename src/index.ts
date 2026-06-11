#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig, VERSION } from "./config.js";
import { createServer } from "./server.js";

async function main(): Promise<void> {
  const config = loadConfig();
  const server = createServer(config);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  const siteList = config.sites.map((s) => `${s.name} → ${s.baseUrl}`).join(", ");
  console.error(
    `connectedone-mcp v${VERSION} を起動しました（${config.sites.length}サイト: ${siteList}${config.readonly ? " / 読み取り専用モード" : ""}）`,
  );
}

main().catch((err) => {
  console.error("connectedone-mcp の起動に失敗しました:", err instanceof Error ? err.message : err);
  process.exit(1);
});
