/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE?: string;
  /** Supabase 项目 URL（公开） */
  readonly VITE_SUPABASE_URL?: string;
  /** Supabase anon key（公开，受 RLS 约束） */
  readonly VITE_SUPABASE_ANON_KEY?: string;
  /** Google AI Studio / Gemini API Key（前端直连仅适合演示，生产请走代理） */
  readonly VITE_GEMINI_API_KEY?: string;
  /** 可选，默认 gemini-2.0-flash */
  readonly VITE_GEMINI_MODEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
