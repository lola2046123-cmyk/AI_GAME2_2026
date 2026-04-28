/**
 * 管理员会话：仅在前端持有由服务端签发的短期 HMAC token。
 *
 * 历史上 PIN 通过 VITE_ADMIN_PIN 注入到前端 bundle，导致任何访客都可在 dist
 * 中搜出 PIN（所谓「钥匙藏在地毯下」）。整改后：
 *   - 前端不再持有 PIN；登录改为调用 /api/showcase-admin op:"login" 由服务端
 *     校验，成功后服务端下发一枚有签名 + 过期时间的 token。
 *   - 后续所有 admin 写操作只携带 token，不携带 PIN。
 */

import { isRemoteSubmissionMode } from "./supabaseClient";

const TOKEN_KEY = "ai_game_2026_admin_session_v2";

/** 本地（无 Supabase）模式下的占位 token：仅作 UI 状态标记，无安全意义 */
const LOCAL_TOKEN_VALUE = "local-dev";
const LOCAL_TOKEN_TTL_MS = 12 * 60 * 60 * 1000;

type StoredToken = { token: string; exp: number };

function readStored(): StoredToken | null {
  try {
    const raw = sessionStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredToken>;
    if (typeof parsed.token !== "string" || typeof parsed.exp !== "number") {
      return null;
    }
    if (Date.now() >= parsed.exp) {
      sessionStorage.removeItem(TOKEN_KEY);
      return null;
    }
    return { token: parsed.token, exp: parsed.exp };
  } catch {
    return null;
  }
}

function writeStored(t: StoredToken) {
  try {
    sessionStorage.setItem(TOKEN_KEY, JSON.stringify(t));
  } catch {
    /* sessionStorage 不可用时忽略；不会影响一次性请求 */
  }
}

function clearStored() {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export function isAdminAuthenticated(): boolean {
  return readStored() !== null;
}

/** 取出当前会话 token；过期或未登录返回 null */
export function getAdminToken(): string | null {
  return readStored()?.token ?? null;
}

export type LoginResult = { ok: boolean; error: string | null };

/**
 * 用 PIN 向服务端换取短期 token。
 * - 远端模式：调用 /api/showcase-admin，由服务端时序安全比对 PIN 并下发 token。
 * - 本地模式：没有真实写权限风险（数据仅写 localStorage），用占位 token 简化体验。
 */
export async function loginAdmin(pin: string): Promise<LoginResult> {
  const trimmed = pin.trim();
  if (!trimmed) return { ok: false, error: "请输入 PIN" };

  if (!isRemoteSubmissionMode()) {
    writeStored({
      token: LOCAL_TOKEN_VALUE,
      exp: Date.now() + LOCAL_TOKEN_TTL_MS
    });
    return { ok: true, error: null };
  }

  let res: Response;
  try {
    res = await fetch("/api/showcase-admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ op: "login", pin: trimmed })
    });
  } catch {
    return { ok: false, error: "网络异常，请稍后重试" };
  }

  let json: { ok?: boolean; token?: string; exp?: number; error?: string } = {};
  try {
    json = (await res.json()) as typeof json;
  } catch {
    /* ignore */
  }

  if (res.status === 429) {
    return { ok: false, error: json.error ?? "尝试过于频繁，请稍后再试" };
  }
  if (!res.ok || !json.ok || !json.token || !json.exp) {
    return { ok: false, error: json.error ?? "PIN 错误" };
  }

  writeStored({ token: json.token, exp: json.exp });
  return { ok: true, error: null };
}

export function logoutAdmin() {
  clearStored();
}
