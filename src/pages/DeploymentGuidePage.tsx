import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpDown,
  BookOpen,
  Check,
  ChevronDown,
  ClipboardCopy,
  Gamepad2,
  Github,
  Server,
  Triangle,
  Zap
} from "lucide-react";

function useScrollProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setPct(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return pct;
}

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function CodeBlock({
  lang,
  children,
  code
}: {
  lang: string;
  children?: ReactNode;
  code: string;
}) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    void navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  return (
    <div className="deploy-code my-4 max-w-full overflow-hidden rounded-xl border border-white/[0.1] bg-[#0a0f0e] shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between border-b border-white/[0.08] bg-white/[0.03] px-4 py-2.5">
        <span className="font-label text-[10px] font-medium uppercase tracking-technical text-primary/40">
          {lang}
        </span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.12] bg-transparent px-3 py-1 font-label text-[10px] font-medium uppercase tracking-technical text-primary/60 transition-colors hover:border-[#00ffcc]/40 hover:text-[#00ffcc]"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" /> 已复制
            </>
          ) : (
            <>
              <ClipboardCopy className="h-3 w-3" /> 复制
            </>
          )}
        </button>
      </div>
      <pre className="deploy-pre overflow-x-auto whitespace-pre-wrap break-words p-4 font-label text-[13px] leading-relaxed text-primary/88 md:p-5 md:text-[13.5px]">
        {children ?? code}
      </pre>
    </div>
  );
}

function Callout({
  variant,
  icon,
  title,
  children
}: {
  variant: "tip" | "warn" | "info" | "danger";
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  const styles = useMemo(
    () =>
      ({
        tip: "border-l-[#00ffcc]/50 bg-[rgba(0,255,204,0.06)] text-primary/90",
        warn: "border-l-amber-400/70 bg-amber-400/[0.07] text-amber-100/90",
        info: "border-l-sky-400/60 bg-sky-400/[0.08] text-sky-100/85",
        danger: "border-l-red-400/70 bg-red-500/[0.08] text-red-100/90"
      }) as const,
    []
  );
  return (
    <div
      className={`my-4 flex min-w-0 max-w-full gap-3 rounded-lg border border-white/[0.06] border-l-[3px] p-4 text-sm leading-relaxed md:text-[15px] ${styles[variant]}`}
    >
      <span className="mt-0.5 shrink-0 opacity-90" aria-hidden>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <strong className="mb-1 block font-headline text-sm font-semibold tracking-tight text-white">
          {title}
        </strong>
        <div className="font-body text-[0.92em] opacity-95 [&_code]:rounded [&_code]:bg-black/30 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-label [&_code]:text-[12px] [&_code]:text-primary/90">
          {children}
        </div>
      </div>
    </div>
  );
}

const STEPS = [
  { id: "step1", n: "01", label: "准备工作", sub: "工具与账号", color: "from-[#00a884] to-[#00ffcc]" },
  { id: "step2", n: "02", label: "GitHub", sub: "上传代码", color: "from-[#008f6e] to-[#00d4a8]" },
  { id: "step3", n: "03", label: "Supabase", sub: "数据库（可选）", color: "from-[#0d5c4a] to-[#00b894]" },
  { id: "step4", n: "04", label: "Vercel", sub: "一键上线", color: "from-primary/80 to-[#00ffcc]" }
] as const;

export function DeploymentGuidePage() {
  const progress = useScrollProgress();
  const [checks, setChecks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const prev = document.title;
    document.title = "部署指南 — AI 游戏设计大赛 2026";
    return () => {
      document.title = prev;
    };
  }, []);

  const toggleCheck = (key: string) => {
    setChecks((c) => ({ ...c, [key]: !c[key] }));
  };

  return (
    <>
      {/* 进度条：在顶栏下方，高于全站颗粒层 */}
      <div
        className="pointer-events-none fixed right-0 left-0 z-[55] h-0.5 bg-black/40"
        style={{ top: "var(--site-header-height)" }}
        aria-hidden
      >
        <div
          className="h-full bg-gradient-to-r from-[#00ffcc] to-primary transition-[width] duration-100 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <main className="relative min-w-0 bg-background pb-[max(5rem,calc(env(safe-area-inset-bottom,0px)+3rem))] text-on-background">
        <header className="relative isolate flex min-h-[calc(100svh-var(--site-header-height))] w-full min-w-0 flex-col border-b border-white/[0.06] bg-background">
          <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-100" aria-hidden>
            <div className="absolute top-[-14%] left-1/2 h-[min(92vh,860px)] w-[min(100vw,1280px)] max-w-full -translate-x-1/2 bg-[radial-gradient(ellipse_72%_58%_at_50%_38%,rgba(168,255,225,0.078)_0%,rgba(0,255,204,0.036)_40%,transparent_74%)]" />
            <div className="absolute bottom-[-18%] left-1/2 h-[min(76vh,700px)] w-[min(100vw,1120px)] max-w-full -translate-x-1/2 bg-[radial-gradient(ellipse_68%_52%_at_50%_72%,rgba(168,255,225,0.052)_0%,rgba(0,255,204,0.024)_42%,transparent_78%)]" />
          </div>
          <div className="relative z-10 mx-auto grid min-h-[calc(100svh-var(--site-header-height))] w-full min-w-0 max-w-home shrink-0 place-content-center justify-items-center py-10 md:py-14">
            <div className="mx-auto flex w-full min-w-0 max-w-4xl flex-col items-center px-2 text-center sm:px-4">
              <h1 className="font-headline text-balance text-[clamp(2.58rem,8.11vw,4.68rem)] font-bold leading-[1.12] tracking-tight text-white md:text-[clamp(3.28rem,5.93vw,4.92rem)]">
                <span className="block">把你的网页游戏</span>
                <span className="block bg-gradient-to-r from-white via-primary to-[#00ffcc] bg-clip-text text-transparent">
                  部署上线
                </span>
              </h1>
              <p className="mt-5 max-w-xl px-1 font-body text-[0.8rem] leading-relaxed text-[#FFFFFF] md:text-[0.9rem]">
                你已经写好了游戏代码——按下面四步即可托管上线。
              </p>
              <div className="mt-8 flex w-full min-w-0 flex-wrap justify-center gap-2 sm:gap-2.5">
                {(
                  [
                    {
                      id: "github",
                      href: "https://github.com",
                      icon: Github,
                      label: "GitHub · 代码仓库",
                      dot: "bg-white/40",
                      externalLabel: "GitHub 官网"
                    },
                    {
                      id: "supabase",
                      href: "https://supabase.com",
                      icon: Server,
                      label: "Supabase · 数据库",
                      dot: "bg-[#3ecf8e]",
                      externalLabel: "Supabase 官网"
                    },
                    {
                      id: "vercel",
                      href: "https://vercel.com",
                      icon: Triangle,
                      label: "Vercel · 托管",
                      dot: "bg-white",
                      externalLabel: "Vercel 官网"
                    }
                  ] as const
                ).map(({ id, href, icon: Icon, label, dot, externalLabel }) => (
                  <a
                    key={id}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex max-w-full min-w-0 items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.05] px-3 py-2 font-body text-[12px] text-white/90 no-underline backdrop-blur-sm transition-colors hover:border-[#00ffcc]/40 hover:text-[#00ffcc] sm:px-4 sm:text-[13px]"
                    aria-label={`${externalLabel}（新标签页打开）`}
                  >
                    <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} />
                    <Icon className="h-3.5 w-3.5 shrink-0 text-primary/80 transition-colors group-hover:text-[#00ffcc]" aria-hidden />
                    <span className="min-w-0 text-balance">{label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* 步骤导航 */}
        <nav className="border-b border-white/[0.06] bg-background py-8 md:py-10">
          <div className="mx-auto w-full min-w-0 max-w-home px-4 sm:px-6 md:px-12">
            <p className="mb-4 font-label text-xs font-semibold uppercase tracking-technical text-primary/70 md:text-sm">
              部署路线图 — 四步完成
            </p>
            <div className="grid w-full min-w-0 grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-3">
              {STEPS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => scrollToId(s.id)}
                  className="surface-card group flex h-full min-w-0 w-full items-start gap-3 rounded-xl border border-white/[0.08] p-3.5 text-left transition-transform hover:-translate-y-0.5 md:p-4"
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${s.color} font-label text-[11px] font-bold text-[#0e0e0e]`}
                  >
                    {s.n}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-headline text-sm font-semibold break-words text-white">
                      {s.label}
                    </span>
                    <span className="mt-0.5 block font-body text-xs text-primary/55">{s.sub}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        <div className="mx-auto w-full min-w-0 max-w-home px-4 py-12 sm:px-6 md:px-12 md:py-16">
          {/* 架构 */}
          <section className="mb-16 md:mb-20">
            <p className="mb-3 font-label text-xs font-semibold uppercase tracking-technical text-primary/70 md:text-sm">
              整体架构
            </p>
            <div className="surface-card flex w-full min-w-0 max-w-full flex-col items-center gap-3 overflow-x-auto rounded-xl border border-white/[0.08] p-4 sm:p-6 md:flex-row md:flex-wrap md:justify-center md:gap-3 md:p-8">
              {(
                [
                  { emoji: "💻", t: "你的电脑", st: "本地代码" },
                  { emoji: "🐙", t: "GitHub", st: "代码仓库" },
                  { emoji: "▲", t: "Vercel", st: "自动部署" },
                  { emoji: "🟢", t: "Supabase", st: "数据库" }
                ] as const
              ).flatMap((node, i, arr) => {
                const accent = node.t === "Supabase";
                const box = (
                  <div
                    key={node.t}
                    className={`min-w-[108px] rounded-lg border px-4 py-3 text-center ${
                      accent
                        ? "border-[#00ffcc]/35 bg-[rgba(0,255,204,0.08)]"
                        : "border-white/[0.1] bg-white/[0.04]"
                    }`}
                  >
                    <div className="text-xl">{node.emoji}</div>
                    <div className="mt-1 font-headline text-[13px] font-semibold text-white">{node.t}</div>
                    <div className="mt-0.5 font-label text-[10px] text-primary/45">{node.st}</div>
                  </div>
                );
                if (i >= arr.length - 1) return [box];
                const arrow =
                  i === 2 ? (
                    <ArrowUpDown
                      key={`a-${i}`}
                      className="h-5 w-5 shrink-0 rotate-90 text-primary/45 md:rotate-0"
                      aria-hidden
                    />
                  ) : (
                    <ArrowRight
                      key={`a-${i}`}
                      className="h-5 w-5 shrink-0 rotate-90 text-primary/45 md:rotate-0"
                      aria-hidden
                    />
                  );
                return [box, arrow];
              })}
            </div>
            <p className="mt-3 text-center font-body text-sm text-primary/50">
              推送代码到 GitHub 后，Vercel 会自动重新部署。
            </p>
          </section>

          {/* Step 1 */}
          <DeploySection
            id="step1"
            badge="01"
            title="准备工作"
            subtitle="在开始之前 · 约 10 分钟"
            badgeClass="bg-gradient-to-br from-[#00a884] to-[#00ffcc] text-[#0e0e0e]"
          >
            <SubCard title="1.1 注册三个账号">
              <p className="font-body text-sm leading-relaxed text-primary/85 md:text-[15px]">
                在以下平台注册免费账号（建议同一邮箱，便于管理）：
              </p>
              <ul className="mt-3 space-y-0 border border-white/[0.06] rounded-lg divide-y divide-white/[0.06]">
                {[
                  { k: "gh", label: "GitHub：github.com — 邮箱注册，Free 计划" },
                  { k: "sb", label: "Supabase：supabase.com — 推荐用 GitHub 登录" },
                  { k: "vc", label: "Vercel：vercel.com — 推荐用 GitHub 登录" }
                ].map(({ k, label }) => (
                  <li key={k}>
                    <button
                      type="button"
                      onClick={() => toggleCheck(k)}
                      className="flex w-full items-start gap-3 px-4 py-3 text-left font-body text-sm text-primary/88 transition-colors hover:bg-white/[0.03] md:text-[15px]"
                    >
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 text-[10px] font-bold ${
                          checks[k]
                            ? "border-[#00ffcc] bg-[#00ffcc] text-[#0e0e0e]"
                            : "border-white/20 bg-transparent text-transparent"
                        }`}
                      >
                        ✓
                      </span>
                      <span className={checks[k] ? "text-primary/45 line-through" : ""}>{label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </SubCard>

            <SubCard title="1.2 安装 Git">
              <p className="font-body text-sm text-primary/85 md:text-[15px]">
                Git 用于把本地代码同步到 GitHub。
              </p>
              <CodeBlock
                lang="Terminal"
                code={`# Windows：官网安装包\n# https://git-scm.com/download/win\n\n# macOS：终端执行\ngit --version\n# 若未安装，系统会提示安装\n`}
              >
                <span className="text-primary/35"># Windows：官网安装包</span>
                {"\n"}
                <span className="text-primary/35"># https://git-scm.com/download/win</span>
                {"\n\n"}
                <span className="text-primary/35"># macOS：终端执行</span>
                {"\n"}
                <span className="text-[#7ec8a0]">git</span>{" "}
                <span className="text-primary/80">--version</span>
                {"\n"}
                <span className="text-primary/35"># 若未安装，系统会提示安装</span>
              </CodeBlock>
            </SubCard>

            <SubCard title="1.3 配置 Git 身份">
              <p className="font-body text-sm text-primary/85 md:text-[15px]">
                使用与 GitHub 一致的名称与邮箱：
              </p>
              <CodeBlock
                lang="Terminal"
                code={'git config --global user.name "你的名字"\ngit config --global user.email "你的邮箱@example.com"\n'}
              >
                <span className="text-[#7ec8a0]">git config</span>{" "}
                <span className="text-primary/80">--global user.name</span>{" "}
                <span className="text-[#a8d8b4]">&quot;你的名字&quot;</span>
                {"\n"}
                <span className="text-[#7ec8a0]">git config</span>{" "}
                <span className="text-primary/80">--global user.email</span>{" "}
                <span className="text-[#a8d8b4]">&quot;你的邮箱@example.com&quot;</span>
              </CodeBlock>
            </SubCard>

            <Callout variant="tip" icon={<Zap className="h-5 w-5 text-[#00ffcc]" />} title="小白提示">
              命令行（Terminal）即黑色/深色窗口：Windows 搜「cmd」或「PowerShell」，macOS 搜「终端」。
            </Callout>
          </DeploySection>

          {/* Step 2 */}
          <DeploySection
            id="step2"
            badge="02"
            title="上传代码到 GitHub"
            subtitle="github.com · 约 15 分钟"
            badgeClass="bg-gradient-to-br from-[#008f6e] to-[#00d4a8] text-[#0e0e0e]"
          >
            <SubCard title="2.1 在 GitHub 创建新仓库">
              <p className="font-body text-sm text-primary/85 md:text-[15px]">
                登录后点右上角 <code>+</code> → <code>New repository</code>，建议：
              </p>
              <CodeBlock
                lang="配置项"
                code={`Repository name：my-game\nVisibility：Public（公开）\n可勾选 Add a README file\n→ Create repository`}
              >
                <span className="text-primary/70">Repository name</span>
                <span className="text-primary/50">：my-game</span>
                {"\n"}
                <span className="text-primary/70">Visibility</span>
                <span className="text-primary/50">：</span>
                <span className="text-[#dfc49d]">Public</span>
                <span className="text-primary/50">（公开）</span>
                {"\n"}
                <span className="text-primary/35">→ Create repository</span>
              </CodeBlock>
            </SubCard>

            <SubCard title="2.2 整理游戏文件">
              <p className="font-body text-sm text-primary/85 md:text-[15px]">典型网页游戏目录示例：</p>
              <CodeBlock
                lang="目录结构"
                code={`my-game/\n├── index.html\n├── style.css\n├── game.js\n└── assets/\n    └── ...`}
              >
                <span className="text-primary/70">my-game/</span>
                {"\n"}
                <span className="text-primary/50">├── </span>
                <span className="text-[#dfc49d]">index.html</span>
                {"\n"}
                <span className="text-primary/50">├── style.css\n├── game.js\n└── assets/</span>
              </CodeBlock>
              <Callout variant="danger" icon={<BookOpen className="h-5 w-5" />} title="密钥安全">
                若存在 <code>.env</code> 或 <code>.env.local</code>（含 Supabase 密钥等），<strong>不要</strong>提交到
                GitHub。下文 <code>.gitignore</code> 会排除它们。
              </Callout>
            </SubCard>

            <SubCard title="2.3 创建 .gitignore">
              <p className="font-body text-sm text-primary/85 md:text-[15px]">在项目根目录添加：</p>
              <CodeBlock
                lang=".gitignore"
                code={`.env\n.env.local\n.env.*.local\n.DS_Store\nnode_modules/\n`}
              >
                <span className="text-primary/35"># 环境变量</span>
                {"\n"}
                <span className="text-primary/80">.env</span>
                {"\n"}
                <span className="text-primary/80">.env.local</span>
                {"\n\n"}
                <span className="text-primary/35"># 依赖</span>
                {"\n"}
                <span className="text-primary/80">node_modules/</span>
              </CodeBlock>
            </SubCard>

            <SubCard title="2.4 推送到 GitHub">
              <p className="font-body text-sm text-primary/85 md:text-[15px]">在项目目录依次执行：</p>
              <CodeBlock
                lang="Terminal"
                code={`cd /path/to/my-game\ngit init\ngit remote add origin https://github.com/用户名/my-game.git\ngit add .\ngit commit -m "first commit"\ngit push -u origin main`}
              >
                <span className="text-primary/35">cd</span> <span className="text-[#a8d8b4]">/path/to/my-game</span>
                {"\n"}
                <span className="text-[#7ec8a0]">git init</span>
                {"\n"}
                <span className="text-[#7ec8a0]">git remote add origin</span>{" "}
                <span className="text-[#a8d8b4]">https://github.com/…/my-game.git</span>
                {"\n"}
                <span className="text-[#7ec8a0]">git add .</span>
                {"\n"}
                <span className="text-[#7ec8a0]">git commit -m</span>{" "}
                <span className="text-[#a8d8b4]">&quot;first commit&quot;</span>
                {"\n"}
                <span className="text-[#7ec8a0]">git push -u origin main</span>
              </CodeBlock>
              <Callout variant="info" icon={<Gamepad2 className="h-5 w-5" />} title="仓库地址">
                在仓库页点击绿色 <code>Code</code>，复制 HTTPS，形如{" "}
                <code>https://github.com/username/my-game.git</code>
              </Callout>
            </SubCard>

            <SubCard title="2.5 验证">
              <p className="font-body text-sm text-primary/85 md:text-[15px]">
                刷新 GitHub 页面，确认文件已出现即可。
              </p>
            </SubCard>
          </DeploySection>

          {/* Step 3 */}
          <DeploySection
            id="step3"
            badge="03"
            title="配置 Supabase 数据库"
            subtitle="supabase.com · 可选，约 20 分钟"
            badgeClass="bg-gradient-to-br from-[#0d5c4a] to-[#00b894] text-white"
          >
            <Callout variant="info" icon={<Server className="h-5 w-5" />} title="需要数据库吗？">
              若游戏仅本地逻辑、无排行榜/存档/登录等，可<strong>跳过本步</strong>，直接进入 Vercel。
            </Callout>

            <SubCard title="3.1 创建项目">
              <p className="font-body text-sm text-primary/85 md:text-[15px]">
                登录后 <code>New project</code>，设置名称、数据库密码、区域（如 Singapore），Plan 选 Free。
              </p>
            </SubCard>

            <SubCard title="3.2 建表示例（排行榜）">
              <p className="font-body text-sm text-primary/85 md:text-[15px]">
                左侧 <code>SQL Editor</code> 执行：
              </p>
              <CodeBlock
                lang="SQL"
                code={`-- 创建排行榜表\nCREATE TABLE leaderboard (\n  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  player text NOT NULL,\n  score integer NOT NULL DEFAULT 0,\n  created_at timestamptz DEFAULT now()\n);\n\nALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;\nCREATE POLICY "allow_read" ON leaderboard FOR SELECT USING (true);\nCREATE POLICY "allow_insert" ON leaderboard FOR INSERT WITH CHECK (true);`}
              />
            </SubCard>

            <SubCard title="3.3 API 密钥">
              <p className="font-body text-sm text-primary/85 md:text-[15px]">
                <code>Settings</code> → <code>API</code>：记录 <code>Project URL</code> 与{" "}
                <code>anon public</code> 密钥。
              </p>
              <div className="mt-3 overflow-x-auto rounded-lg border border-white/[0.08]">
                <table className="w-full min-w-[320px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.08] bg-white/[0.06] font-label text-[11px] uppercase tracking-technical text-primary/70">
                      <th className="px-4 py-3">变量</th>
                      <th className="px-4 py-3">说明</th>
                    </tr>
                  </thead>
                  <tbody className="font-body text-primary/80">
                    <tr className="border-b border-white/[0.05]">
                      <td className="px-4 py-2.5 font-label text-xs text-[#00ffcc]/90">SUPABASE_URL</td>
                      <td className="px-4 py-2.5">Project URL</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-label text-xs text-[#00ffcc]/90">SUPABASE_ANON_KEY</td>
                      <td className="px-4 py-2.5">anon / public，可放前端</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </SubCard>

            <SubCard title="3.4 在代码中连接">
              <p className="font-body text-sm text-primary/85 md:text-[15px]">
                通过 CDN 引入 SDK 后初始化 <code>createClient</code>，对表做 <code>insert</code> /{" "}
                <code>select</code> 即可。
              </p>
              <Callout variant="warn" icon={<Zap className="h-5 w-5" />} title="anon key">
                <strong>anon（public）密钥</strong>设计为可暴露；切勿把 <code>service_role</code> 写进前端。
              </Callout>
            </SubCard>
          </DeploySection>

          {/* Step 4 */}
          <DeploySection
            id="step4"
            badge="04"
            title="用 Vercel 一键上线"
            subtitle="vercel.com · 约 5 分钟"
            badgeClass="bg-gradient-to-br from-primary/90 to-[#00ffcc] text-[#0e0e0e]"
          >
            <SubCard title="4.1 导入仓库">
              <p className="font-body text-sm text-primary/85 md:text-[15px]">
                <code>Add New Project</code> → 选择 GitHub 仓库 → <code>Import</code>。首次需授权 GitHub App。
              </p>
            </SubCard>

            <SubCard title="4.2 构建设置">
              <p className="font-body text-sm text-primary/85 md:text-[15px]">
                纯静态 HTML/CSS/JS 多数情况<strong>无需</strong>自定义 Build；Framework 选 Other 或自动检测即可部署。
              </p>
            </SubCard>

            <SubCard title="4.3 环境变量（若用框架）">
              <p className="font-body text-sm text-primary/85 md:text-[15px]">
                Next.js 等可在 Vercel 填写 <code>NEXT_PUBLIC_SUPABASE_URL</code> 等。纯静态亦可把 anon 写在构建后的脚本里（注意勿提交 service_role）。
              </p>
            </SubCard>

            <SubCard title="4.4 部署与地址">
              <p className="font-body text-sm text-primary/85 md:text-[15px]">
                点击 <code>Deploy</code>，通常数十秒至数分钟完成。获得{" "}
                <code className="text-[#00ffcc]">https://项目名-用户名.vercel.app</code> 即可分享。
              </p>
            </SubCard>

            <SubCard title="4.5 后续更新">
              <CodeBlock lang="Terminal" code={`git add .\ngit commit -m "更新说明"\ngit push`}>
                <span className="text-[#7ec8a0]">git add .</span>
                {"\n"}
                <span className="text-[#7ec8a0]">git commit -m</span>{" "}
                <span className="text-[#a8d8b4]">&quot;更新说明&quot;</span>
                {"\n"}
                <span className="text-[#7ec8a0]">git push</span>
              </CodeBlock>
              <p className="mt-2 font-body text-sm text-primary/55">
                Vercel 会监听 GitHub 变更并自动重新部署。
              </p>
            </SubCard>
          </DeploySection>

          {/* FAQ — 与正文 SubCard 同一套 surface-card */}
          <section className="surface-card relative mt-16 max-w-full rounded-xl border border-white/[0.08] p-5 md:mt-20 md:p-8">
            <div>
              <h2 className="font-headline text-xl font-bold text-white md:text-2xl">
                常见问题
              </h2>
              <p className="mt-2 font-body text-sm text-primary/55 md:text-[15px]">
                新手常见卡点，按需展开查看。
              </p>
              <div className="mt-8 space-y-2">
                {[
                  {
                    q: "git push 提示 Permission denied",
                    a: "配置 SSH 密钥，或在 GitHub Settings → Developer settings 创建 Personal Access Token，HTTPS 推送时用 Token 代替密码。"
                  },
                  {
                    q: "Vercel 部署后空白页",
                    a: "确认 index.html 在仓库根目录；JS/CSS 使用相对路径（如 ./game.js）；在 Deployments 查看构建日志。"
                  },
                  {
                    q: "Supabase CORS",
                    a: "在 Supabase Settings → API 将 Vercel 域名加入允许的 CORS Origins，保存后稍等再试。"
                  },
                  {
                    q: "自定义域名",
                    a: "Vercel 项目 Settings → Domains 添加域名，按提示在 DNS 商添加记录；HTTPS 证书由 Vercel 自动处理。"
                  }
                ].map((faq) => (
                  <details
                    key={faq.q}
                    className="group surface-card overflow-hidden rounded-xl border border-white/[0.08]"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 font-headline text-sm font-semibold text-white marker:content-none md:px-5 md:py-4 md:text-[15px] [&::-webkit-details-marker]:hidden">
                      <span className="min-w-0 flex-1 pr-2 text-left break-words">{faq.q}</span>
                      <ChevronDown className="h-4 w-4 shrink-0 text-[#00ffcc] transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="border-t border-white/[0.06] px-4 py-3 font-body text-sm leading-relaxed break-words text-primary/65 md:px-5 md:text-[15px]">
                      {faq.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* 收尾 — 与 SubCard / FAQ 外层同一套 surface-card */}
          <section className="surface-card relative mt-12 max-w-full rounded-xl border border-white/[0.08] p-8 text-center md:mt-16 md:p-10">
            <h2 className="font-headline text-2xl font-bold text-white md:text-3xl">
              你的游戏已上线
            </h2>
            <p className="mx-auto mt-3 max-w-md font-body text-sm text-primary/65 md:text-base">
              把链接分享给朋友，邀请第一批玩家试玩。
            </p>
            <div className="mx-auto mt-6 inline-flex max-w-full break-all items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.05] px-4 py-2.5 font-label text-xs text-white/90 backdrop-blur-sm sm:px-6 md:text-sm">
              https://your-game.vercel.app
            </div>
            <p className="mt-6 font-label text-[10px] uppercase tracking-technical text-primary/35">
              GitHub · Supabase · Vercel — 免费档即可跑通
            </p>
          </section>
        </div>
      </main>

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed z-[55] flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.12] bg-[#00ffcc] text-[#0e0e0e] shadow-[0_8px_28px_rgba(0,255,204,0.25)] transition-transform hover:-translate-y-0.5 max-md:bottom-[max(1.25rem,env(safe-area-inset-bottom,0px))] max-md:right-[max(1rem,env(safe-area-inset-right,0px))] md:bottom-[max(2rem,env(safe-area-inset-bottom,0px))] md:right-[max(2rem,env(safe-area-inset-right,0px))]"
        aria-label="回到顶部"
      >
        <ArrowDown className="h-5 w-5 rotate-180" />
      </button>
    </>
  );
}

function DeploySection({
  id,
  badge,
  badgeClass,
  title,
  subtitle,
  children
}: {
  id: string;
  badge: string;
  badgeClass: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-[calc(var(--site-header-height)+0.5rem)] border-t border-white/[0.06] pt-12 md:pt-16"
    >
      <div className="mb-8 flex min-w-0 items-start gap-4 md:gap-5">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-headline text-sm font-bold shadow-lg md:h-12 md:w-12 ${badgeClass}`}
        >
          {badge}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-headline text-xl font-bold tracking-tight text-white md:text-2xl">{title}</h2>
          <p className="mt-1 font-label text-[11px] uppercase tracking-technical text-primary/45">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-6 md:space-y-8">{children}</div>
    </section>
  );
}

function SubCard({ title, children }: { title: string; children: ReactNode }) {
  const sp = title.indexOf(" ");
  const stepTag = sp >= 0 ? title.slice(0, sp) : title;
  const stepTitle = sp >= 0 ? title.slice(sp + 1) : "";
  return (
    <div className="surface-card min-w-0 max-w-full rounded-xl border border-white/[0.08] p-5 md:p-6">
      <h3 className="mb-3 flex flex-wrap items-center gap-2 font-headline text-[15px] font-semibold text-white md:text-base">
        <span className="rounded-full bg-[rgba(0,255,204,0.12)] px-2.5 py-0.5 font-label text-[10px] font-semibold tabular-nums tracking-technical text-[#00ffcc]">
          {stepTag}
        </span>
        {stepTitle || title}
      </h3>
      {children}
    </div>
  );
}
