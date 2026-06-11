import type { ZodRawShape } from "zod";
import type { ApiClient } from "./http.js";

export interface ToolAnnotations {
  readOnlyHint?: boolean;
  destructiveHint?: boolean;
  idempotentHint?: boolean;
}

export interface ToolDef {
  name: string;
  description: string;
  inputSchema: ZodRawShape;
  annotations: ToolAnnotations;
  handler: (args: Record<string, any>, api: ApiClient) => Promise<unknown>;
}

export const READ_ONLY: ToolAnnotations = { readOnlyHint: true };
export const WRITE: ToolAnnotations = { readOnlyHint: false, destructiveHint: false };
export const UPDATE: ToolAnnotations = { readOnlyHint: false, destructiveHint: false, idempotentHint: true };
export const DESTRUCTIVE: ToolAnnotations = { readOnlyHint: false, destructiveHint: true };
