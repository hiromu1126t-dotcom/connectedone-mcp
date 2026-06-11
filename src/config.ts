import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const pkg = require("../package.json") as { version: string };

export const VERSION: string = pkg.version;

export interface Config {
  baseUrl: string;
  apiKey: string;
  readonly: boolean;
}

const SETUP_EXAMPLE = {
  mcpServers: {
    connectedone: {
      command: "npx",
      args: ["-y", "github:hiromu1126t-dotcom/connectedone-mcp"],
      env: {
        CONNECTEDONE_SITE_URL: "https://あなたのサブドメイン.connected-one.world",
        CONNECTEDONE_API_KEY: "取得したAPIキー",
      },
    },
  },
};

export function loadConfig(): Config {
  const rawUrl = process.env.CONNECTEDONE_SITE_URL?.trim();
  const apiKey = process.env.CONNECTEDONE_API_KEY?.trim();

  const missing: string[] = [];
  if (!rawUrl) missing.push("CONNECTEDONE_SITE_URL");
  if (!apiKey) missing.push("CONNECTEDONE_API_KEY");

  if (missing.length > 0) {
    console.error(`[connectedone-mcp] 環境変数が設定されていません: ${missing.join(", ")}`);
    console.error("");
    console.error("APIキーは、サイト管理画面の Website Settings → Applications → API Key で確認できます。");
    console.error("MCPクライアント（Claude Desktop など）の設定例:");
    console.error(JSON.stringify(SETUP_EXAMPLE, null, 2));
    console.error("");
    console.error(`Missing required environment variable(s): ${missing.join(", ")}`);
    process.exit(1);
  }

  let url = rawUrl!;
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  url = url.replace(/^http:\/\//i, "https://");

  let origin: string;
  try {
    origin = new URL(url).origin;
  } catch {
    console.error(`[connectedone-mcp] CONNECTEDONE_SITE_URL の形式が不正です: ${rawUrl}`);
    console.error("例: https://www.example.com または example.com");
    process.exit(1);
  }

  const readonly = /^(true|1)$/i.test(process.env.CONNECTEDONE_READONLY ?? "");

  return { baseUrl: `${origin}/api/site`, apiKey: apiKey!, readonly };
}
