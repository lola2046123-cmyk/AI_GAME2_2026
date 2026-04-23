import { useState } from "react";
import { Mail, X } from "lucide-react";
import { getSupabaseAuth } from "../../lib/supabaseClient";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function LoginModal({ open, onClose }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  if (!open) return null;

  async function handleLogin() {
    const sb = getSupabaseAuth();
    if (!sb) {
      setMessage("请先配置 Supabase 环境变量。");
      return;
    }
    if (!email.trim()) {
      setMessage("请输入邮箱。");
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await sb.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.href }
    });

    setLoading(false);
    setMessage(error ? error.message : "请查看邮箱，点击登录链接完成登录。");
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#111111] p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="font-headline text-lg font-semibold text-white">登录后投票</p>
            <p className="mt-1 font-body text-sm leading-relaxed text-white/45">
              使用邮箱 Magic Link 登录，无需密码。
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/45 transition-colors hover:text-white/80"
            aria-label="关闭登录弹窗"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <label className="mb-2 block font-label text-[10px] uppercase tracking-widest text-white/30">
          邮箱
        </label>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3">
          <Mail className="h-4 w-4 shrink-0 text-white/35" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="h-12 w-full bg-transparent font-body text-sm text-white outline-none placeholder:text-white/25"
          />
        </div>

        <button
          type="button"
          onClick={handleLogin}
          disabled={loading}
          className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-white/12 bg-white/[0.08] px-4 py-3 font-body text-sm font-medium text-white transition-colors hover:bg-white/[0.12] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "发送中..." : "发送登录链接"}
        </button>

        {message ? (
          <p className="mt-3 font-body text-sm leading-relaxed text-white/55">
            {message}
          </p>
        ) : null}
      </div>
    </div>
  );
}
