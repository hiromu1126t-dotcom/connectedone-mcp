import { VERSION } from "./config.js";
import type { Config } from "./config.js";

export type Query = Record<string, string | number | boolean | undefined>;

export interface RequestOptions {
  query?: Query;
  body?: unknown;
}

export class ApiError extends Error {}

export function pathId(id: string | number): string {
  return encodeURIComponent(String(id));
}

export class ApiClient {
  constructor(private readonly config: Config) {}

  async request(method: string, path: string, options: RequestOptions = {}): Promise<unknown> {
    const url = new URL(this.config.baseUrl + path);
    for (const [key, value] of Object.entries(options.query ?? {})) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.config.apiKey}`,
      "User-Agent": `connectedone-mcp/${VERSION}`,
    };
    if (options.body !== undefined) headers["Content-Type"] = "application/json";

    let response: Response;
    try {
      response = await fetch(url, {
        method,
        headers,
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
        signal: AbortSignal.timeout(30_000),
        redirect: "manual",
      });
    } catch {
      throw new ApiError(
        `サイトに接続できませんでした。CONNECTEDONE_SITE_URL の値（現在: ${url.origin}）が正しいか、ネットワーク接続を確認してください。`,
      );
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      let recommended = "";
      if (location) {
        try {
          recommended = new URL(location, url).origin.replace(/^http:\/\//i, "https://");
        } catch {
          recommended = "";
        }
      }
      const hint = recommended
        ? `CONNECTEDONE_SITE_URL を「${recommended}」に変更してください。`
        : "CONNECTEDONE_SITE_URL に、ブラウザでサイトを開いた時に表示される正式なドメインを設定してください。";
      throw new ApiError(
        `接続先がリダイレクトされました。設定されたドメイン（${url.origin}）はサイトの正式なドメインではないようです。${hint}よくある原因は「www.」の付けすぎ・付け忘れです。`,
      );
    }

    const text = await response.text();
    let data: unknown = null;
    if (text.length > 0) {
      try {
        data = JSON.parse(text);
      } catch {
        throw new ApiError(
          `APIの応答がJSONではありません。CONNECTEDONE_SITE_URL がConnectedOneサイトのドメインを指しているか確認してください。(HTTP ${response.status}: ${text.slice(0, 100)})`,
        );
      }
    }

    const failure = data as { success?: boolean; message?: string } | null;
    if ((failure && failure.success === false) || !response.ok) {
      throw new ApiError(describeError(response.status, failure?.message));
    }
    return data;
  }
}

function describeError(status: number, message?: string): string {
  const detail = message ? ` (${message})` : "";
  if (status === 401 || status === 403) {
    return `APIキーが無効か、権限がありません。サイト管理画面の Website Settings → Applications → API Key を再確認してください。${detail}`;
  }
  if (status === 404) {
    return `対象が見つかりませんでした。IDの間違い、または削除済みの可能性があります。${detail}`;
  }
  if (status === 429) {
    return `リクエストが多すぎます（レート制限）。少し待ってから再実行してください。${detail}`;
  }
  if (status >= 500) {
    return `ConnectedOne側でエラーが発生しました。時間をおいて再実行してください。(HTTP ${status})${detail}`;
  }
  return `ConnectedOne APIエラー (HTTP ${status})${detail}`;
}
