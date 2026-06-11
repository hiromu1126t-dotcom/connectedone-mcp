import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const pkg = require("../package.json") as { version: string };

export const VERSION: string = pkg.version;

export interface SiteConfig {
  name: string;
  baseUrl: string;
  apiKey: string;
}

export interface Config {
  sites: SiteConfig[];
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

function fail(lines: string[]): never {
  for (const line of lines) console.error(line);
  process.exit(1);
}

function normalizeOrigin(raw: string, varName: string): string {
  let url = raw.trim();
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  url = url.replace(/^http:\/\//i, "https://");
  try {
    return new URL(url).origin;
  } catch {
    return fail([
      `[connectedone-mcp] ${varName} の形式が不正です: ${raw}`,
      "例: https://あなたのサブドメイン.connected-one.world",
    ]);
  }
}

function defaultName(origin: string): string {
  return new URL(origin).hostname.split(".")[0];
}

export function loadConfig(): Config {
  const sites: SiteConfig[] = [];

  const baseUrl = process.env.CONNECTEDONE_SITE_URL?.trim();
  const baseKey = process.env.CONNECTEDONE_API_KEY?.trim();
  if (baseUrl && baseKey) {
    const origin = normalizeOrigin(baseUrl, "CONNECTEDONE_SITE_URL");
    const name = process.env.CONNECTEDONE_SITE_NAME?.trim() || defaultName(origin);
    sites.push({ name, baseUrl: `${origin}/api/site`, apiKey: baseKey });
  } else if (baseUrl || baseKey) {
    const missing = baseUrl ? "CONNECTEDONE_API_KEY" : "CONNECTEDONE_SITE_URL";
    fail([`[connectedone-mcp] ${missing} が設定されていません（URLとAPIキーは2つセットで必要です）。`]);
  }

  for (let i = 1; ; i++) {
    const urlRaw = process.env[`CONNECTEDONE_SITE_URL_${i}`]?.trim();
    const key = process.env[`CONNECTEDONE_API_KEY_${i}`]?.trim();
    if (!urlRaw && !key) break;
    if (!urlRaw || !key) {
      const missing = urlRaw ? `CONNECTEDONE_API_KEY_${i}` : `CONNECTEDONE_SITE_URL_${i}`;
      fail([`[connectedone-mcp] ${missing} が設定されていません（URLとAPIキーは2つセットで必要です）。`]);
    }
    const origin = normalizeOrigin(urlRaw, `CONNECTEDONE_SITE_URL_${i}`);
    const name = process.env[`CONNECTEDONE_SITE_NAME_${i}`]?.trim() || defaultName(origin);
    sites.push({ name, baseUrl: `${origin}/api/site`, apiKey: key });
  }

  if (sites.length === 0) {
    fail([
      "[connectedone-mcp] 環境変数が設定されていません: CONNECTEDONE_SITE_URL, CONNECTEDONE_API_KEY",
      "",
      "APIキーは、サイト管理画面の Website Settings → Applications → API Key で確認できます。",
      "MCPクライアント（Claude Desktop など）の設定例:",
      JSON.stringify(SETUP_EXAMPLE, null, 2),
      "",
      "複数サイトをまとめて扱う場合は、番号付きで設定します:",
      "CONNECTEDONE_SITE_NAME_1 / CONNECTEDONE_SITE_URL_1 / CONNECTEDONE_API_KEY_1, _2, _3 ...",
      "",
      "Missing required environment variable(s): CONNECTEDONE_SITE_URL, CONNECTEDONE_API_KEY",
    ]);
  }

  const seen = new Set<string>();
  for (const site of sites) {
    if (seen.has(site.name)) {
      fail([
        `[connectedone-mcp] サイト名が重複しています: ${site.name}`,
        "CONNECTEDONE_SITE_NAME_◯ でそれぞれ一意の名前を付けてください。",
      ]);
    }
    seen.add(site.name);
  }

  const readonly = /^(true|1)$/i.test(process.env.CONNECTEDONE_READONLY ?? "");

  return { sites, readonly };
}
