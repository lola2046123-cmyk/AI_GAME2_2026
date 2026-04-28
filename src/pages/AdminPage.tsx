import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent
} from "react";
import { useOutletContext } from "react-router-dom";
import { motion } from "motion/react";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import {
  deleteSubmission,
  loadUserSubmissionsAsync,
  setSubmissionVisibility
} from "../lib/submissionsStorage";
import { compareShowcaseDesc } from "../lib/showcaseSort";
import {
  isAdminAuthenticated,
  loginAdmin,
  logoutAdmin
} from "../lib/adminSession";
import type { AppOutletContext } from "../types/outlet";
import type { ShowcaseSubmission } from "../types/submission";

export function AdminPage() {
  const { openEdit, adminSaveSignal } = useOutletContext<AppOutletContext>();
  const [authed, setAuthed] = useState(isAdminAuthenticated);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinSubmitting, setPinSubmitting] = useState(false);
  const [list, setList] = useState<ShowcaseSubmission[]>([]);
  const [listError, setListError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ShowcaseSubmission | null>(
    null
  );

  const refresh = useCallback(async () => {
    setListError(null);
    try {
      const rows = await loadUserSubmissionsAsync();
      setList(rows);
    } catch (e) {
      setListError(e instanceof Error ? e.message : "加载失败");
      setList([]);
    }
  }, []);

  useEffect(() => {
    if (!authed) return;
    void refresh();
  }, [authed, refresh, adminSaveSignal]);

  const attemptLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (pinSubmitting) return;
    setPinSubmitting(true);
    setPinError(null);
    const r = await loginAdmin(pinInput);
    setPinSubmitting(false);
    if (r.ok) {
      setAuthed(true);
      setPinInput("");
    } else {
      setPinError(r.error ?? "PIN 错误");
    }
  };

  const logout = () => {
    logoutAdmin();
    setAuthed(false);
  };

  const toggleVisible = async (row: ShowcaseSubmission) => {
    setActionError(null);
    try {
      await setSubmissionVisibility(row.id, row.is_visible === false);
      await refresh();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "更新失败");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setActionError(null);
    try {
      await deleteSubmission(deleteTarget.id);
      setDeleteTarget(null);
      await refresh();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "删除失败");
    }
  };

  const sorted = useMemo(
    () => [...list].sort(compareShowcaseDesc),
    [list]
  );

  if (!authed) {
    return (
      <main className="relative flex min-h-[70vh] flex-col items-center justify-center bg-background px-6 pt-8 pb-[max(5rem,calc(env(safe-area-inset-bottom,0px)+3.5rem))] md:px-12 md:pt-12 md:pb-20">
        <div className="mx-auto flex w-full max-w-home justify-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="surface-card w-full max-w-sm p-8"
          >
            <h1 className="font-headline text-xl font-bold text-on-background">
              管理中心
            </h1>
            <p className="font-body mt-2 text-sm text-primary/50">
              请输入管理员 PIN
            </p>
            <form onSubmit={attemptLogin} className="mt-6 space-y-4">
              <input
                type="password"
                autoComplete="current-password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="PIN"
                aria-label="管理员 PIN"
                disabled={pinSubmitting}
                className="w-full rounded-xl border border-white/[0.12] bg-black/35 px-4 py-3 font-body text-sm text-on-background outline-none focus:border-[#00ffcc]/50 disabled:opacity-60"
              />
              {pinError && (
                <p className="text-sm text-red-400/95">{pinError}</p>
              )}
              <button
                type="submit"
                disabled={pinSubmitting}
                className="btn-primary w-full py-3 text-sm disabled:opacity-60"
              >
                {pinSubmitting ? "校验中…" : "进入"}
              </button>
            </form>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="relative bg-background px-6 pt-8 pb-[max(7rem,calc(env(safe-area-inset-bottom,0px)+5.5rem))] md:px-12 md:pt-12 md:pb-28">
        <div className="mx-auto w-full max-w-home">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="font-label text-xs font-medium uppercase tracking-technical text-[#00ffcc]/90">
                Admin
              </span>
              <h1 className="mt-1 font-headline text-3xl font-bold tracking-tight text-on-background md:text-4xl">
                作品管理
              </h1>
              <p className="font-body type-body-compact mt-2 max-w-xl text-sm text-primary/50">
                管理已提交作品：编辑、删除、控制前台展示（is_visible）。编辑时若修改部署 URL 会重新请求截图 API。
              </p>
              {listError ? (
                <p className="mt-2 font-body text-sm text-red-400/95">{listError}</p>
              ) : null}
              {actionError ? (
                <p className="mt-2 font-body text-sm text-red-400/95">{actionError}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={logout}
              className="btn-secondary-outline self-start px-4 py-2 text-xs font-label uppercase tracking-technical sm:self-auto"
            >
              退出登录
            </button>
          </div>

          <div className="surface-card">
            {sorted.length === 0 ? (
              <p className="p-10 text-center font-body text-primary/50">
                暂无用户投稿，请到首页报名或本地写入数据。
              </p>
            ) : (
              <ul className="divide-y divide-white/[0.06]">
                {sorted.map((row) => (
                  <li
                    key={row.id}
                    className="flex flex-col gap-1.5 p-4 md:flex-row md:items-center md:gap-2 md:p-5"
                  >
                    <div className="h-16 w-28 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black/40">
                      <img
                        src={row.thumbnailUrl}
                        alt={row.gameName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-headline text-base font-bold text-on-background md:text-lg">
                          {row.gameName}
                        </h2>
                        {row.is_visible === false && (
                          <span className="rounded-md bg-amber-500/15 px-2 py-0.5 font-label text-[10px] uppercase tracking-technical text-amber-400">
                            已隐藏
                          </span>
                        )}
                      </div>
                      <a
                        href={row.deployUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-body mt-1 inline-flex items-center gap-1 text-xs text-[#00ffcc]/90 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {row.deployUrl}
                      </a>
                      <p className="font-body mt-2 line-clamp-2 text-xs text-primary/50">
                        {row.techStack.join(" · ")}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 md:shrink-0">
                      <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-black/25 px-3 py-2 font-label text-[10px] uppercase tracking-technical text-primary/50">
                        <input
                          type="checkbox"
                          className="accent-[#00ffcc]"
                          checked={row.is_visible !== false}
                          onChange={() => toggleVisible(row)}
                        />
                        前台展示
                      </label>
                      <button
                        type="button"
                        onClick={() => openEdit(row)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#00ffcc]/35 bg-[#00ffcc]/10 px-3 py-2 font-label text-xs font-semibold text-[#00ffcc] transition-colors hover:bg-[#00ffcc]/18"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        编辑
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(row)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-red-400/30 bg-red-400/10 px-3 py-2 font-label text-xs font-semibold text-red-300/95 hover:bg-red-400/18"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        删除
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>

      <ConfirmDialog
        open={!!deleteTarget}
        title="确认删除"
        message={
          deleteTarget
            ? `确定删除「${deleteTarget.gameName}」？此操作不可恢复。`
            : ""
        }
        confirmLabel="删除"
        variant="danger"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
