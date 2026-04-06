import { useSyncExternalStore } from "react";
import { useOutletContext } from "react-router-dom";
import { motion } from "motion/react";
import { Award, Lightbulb, Medal, Rocket, Star, Trophy } from "lucide-react";
import type { AppOutletContext } from "../types/outlet";
import { HeroVideoBackdrop } from "../components/hero/HeroVideoBackdrop";
import { PrizeAwardIcon } from "../components/PrizeAwardIcon";
import { SectionTitleEnDecor } from "../components/SectionTitleEnDecor";
import { SubmissionCountdown } from "../components/SubmissionCountdown";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.06
    }
  }
};

const CREATOR_LOG_ITEMS = [
  "游戏名称",
  "核心玩法说明或 PRD",
  "使用的 AI 相关工具",
  "作品须公网可访问（部署链接有效）",
  "其他说明"
] as const;

function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function getReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function HomePage() {
  const { openRegister } = useOutletContext<AppOutletContext>();
  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    () => false
  );

  return (
    <>
      <main className="flex flex-col">
        {/* Hero：全屏 HLS + 深绿底与青绿强调，中文主文案 */}
        <section
          id="hero"
          className="relative isolate flex min-h-[calc(100svh-var(--site-header-height))] w-full flex-col overflow-hidden bg-background text-white"
        >
          <HeroVideoBackdrop />

          <div className="relative z-10 mx-auto grid min-h-[calc(100svh-var(--site-header-height))] w-full max-w-home place-content-center justify-items-stretch px-6 pb-[max(1rem,env(safe-area-inset-bottom,0px))] pt-0 md:px-12 md:pb-6">
              <motion.div
                initial="initial"
                animate="animate"
                variants={staggerContainer}
                className="mx-auto flex w-full max-w-4xl translate-y-[2vh] flex-col items-center space-y-8 px-4 text-center md:translate-y-[2.75vh] md:space-y-9"
              >
                <motion.h1
                  variants={fadeInUp}
                  className="hero-title-over-video text-balance font-headline text-[clamp(1.95rem,5.8vw,3.5rem)] font-bold leading-[1.08] tracking-[-0.032em] text-white md:text-[clamp(2.15rem,4.25vw,3.85rem)] md:leading-[1.06] md:tracking-[-0.03em]"
                >
                  AI 游戏设计大赛
                </motion.h1>

                <motion.div
                  variants={fadeInUp}
                  className="flex flex-col items-center gap-0.5 md:gap-1"
                  aria-label="总奖金池 32,500 U"
                >
                  <p className="max-w-xl font-body text-xs font-normal tracking-normal text-primary/90 md:text-sm">
                    总奖金池{" "}
                    <span className="text-primary/75">(Total Prize Pool)</span>
                  </p>
                  <div className="flex justify-center">
                    <span className="prize-hero-gradient prize-hero-sweep-text prize-hero-sweep-text--diagonal type-amount font-headline text-[clamp(1.85rem,5.2vw,3.15rem)] font-bold leading-none tracking-tight md:text-[clamp(2rem,3.85vw,3.5rem)]">
                      32,500&nbsp;U
                    </span>
                  </div>
                </motion.div>

                <motion.p
                  variants={fadeInUp}
                  className="max-w-xl font-body text-sm font-normal tracking-[0.02em] text-primary/95 md:text-base md:tracking-[0.025em]"
                >
                  AI 驱动 · 全栈进化
                </motion.p>

                <motion.div variants={fadeInUp}>
                  <motion.button
                    id="hero-cta"
                    type="button"
                    onClick={openRegister}
                    className="btn-primary px-10 py-3.5 text-sm md:px-12 md:py-4 md:text-base"
                    whileHover={reduceMotion ? undefined : { y: -2 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 520, damping: 28 }}
                  >
                    立即参赛
                  </motion.button>
                </motion.div>

                <motion.div
                  variants={fadeInUp}
                  className="flex flex-col items-center"
                  aria-label="投稿截止倒计时"
                >
                  <p className="mb-2 font-body text-[13px] font-normal tracking-normal text-primary/45 md:text-[14px]">
                    投递截止倒计时
                  </p>
                  <SubmissionCountdown variant="footer" />
                </motion.div>
              </motion.div>
          </div>
        </section>

        {/* Rewards Section */}
        <section className="border-t border-white/[0.06] bg-background px-6 py-24 sm:py-32 md:px-12 md:py-44 lg:py-52 xl:py-60">
          <div className="mx-auto w-full max-w-home text-center">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-20 flex flex-col items-center space-y-5 md:mb-28 md:space-y-6"
            >
              <div className="flex w-full flex-col items-center text-center">
                <span className="font-label mb-4 block text-sm font-medium uppercase leading-snug tracking-technical text-primary-container">
                  奖金与席位
                </span>
                <SectionTitleEnDecor
                  titleZh="奖项设置"
                  titleEn="PRIZES"
                  align="center"
                />
              </div>
              <p className="mx-auto max-w-xl font-body text-sm font-normal tracking-[0.02em] text-primary/95 md:text-base md:tracking-[0.025em]">
                高额赏金，共设一等奖 1 名、二等奖 1 名、三等奖 1 名、入围奖 3 名。
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-4 lg:gap-4">
              {/* Rank 1 */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="group surface-card relative flex flex-col items-center justify-center gap-2 p-12 md:col-span-2 md:gap-2.5 md:p-14"
              >
                <div className="absolute top-0 right-0 p-4 font-label text-[120px] leading-none font-bold opacity-[0.03]">R1</div>
                <PrizeAwardIcon icon={Trophy} emphasis="primary" size="lg" phase={0} />
                <div className="space-y-2 text-center">
                  <span className="font-label block text-sm font-medium uppercase leading-snug tracking-technical text-[#b5f0d8]">
                    一等奖（领航者）
                  </span>
                </div>
                <div className="flex justify-center">
                  <span className="prize-hero-gradient prize-hero-sweep-text prize-hero-sweep-text--diagonal type-amount font-headline text-7xl font-bold leading-none tracking-tight md:text-8xl">
                    20,000&nbsp;U
                  </span>
                </div>
                <div className="w-32 h-1 bg-primary/30 group-hover:w-full transition-all duration-700 mt-1" />
              </motion.div>

              {/* Rank 2-3 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="group surface-card flex flex-col items-center justify-center gap-1.5 p-10 md:p-12"
              >
                <PrizeAwardIcon icon={Lightbulb} phase={1} />
                <div className="space-y-1.5 text-center">
                  <span className="font-label block text-xs font-medium uppercase leading-snug tracking-technical text-[#b5f0d8]">
                    二等奖（进化者）
                  </span>
                </div>
                <div className="flex items-baseline justify-center gap-1.5">
                  <span className="type-amount text-5xl font-bold font-headline text-on-background">5,000</span>
                  <span className="text-[2rem] font-bold font-label tracking-normal leading-none text-[#7ee5b5] self-end translate-y-[-0.05em]">
                    U
                  </span>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="group surface-card flex flex-col items-center justify-center gap-1.5 p-10 md:p-12"
              >
                <PrizeAwardIcon icon={Rocket} phase={2} />
                <div className="space-y-1.5 text-center">
                  <span className="font-label block text-xs font-medium uppercase leading-snug tracking-technical text-[#b5f0d8]">
                    三等奖（破局者）
                  </span>
                </div>
                <div className="flex items-baseline justify-center gap-1.5">
                  <span className="type-amount text-5xl font-bold font-headline text-on-background">3,000</span>
                  <span className="text-[2rem] font-bold font-label tracking-normal leading-none text-[#7ee5b5] self-end translate-y-[-0.05em]">
                    U
                  </span>
                </div>
              </motion.div>

              {/* 入围奖 ×3 — 与上行同宽齐边 */}
              <div className="grid w-full grid-cols-1 gap-3 md:col-span-2 md:grid-cols-3 md:gap-4 lg:col-span-4">
                {[
                  { icon: Star },
                  { icon: Medal },
                  { icon: Award }
                ].map((prize, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    className="group surface-card flex w-full min-w-0 flex-col items-center justify-center gap-1 p-10"
                  >
                    <PrizeAwardIcon icon={prize.icon} phase={3 + idx} />
                    <span className="font-label text-center text-xs font-medium uppercase leading-snug tracking-technical text-[#b5f0d8]">
                      入围奖（觉醒者）
                    </span>
                    <div className="flex items-baseline justify-center gap-1.5 pt-0.5">
                      <span className="type-amount font-headline text-4xl font-bold text-on-background">1,500</span>
                      <span className="translate-y-[-0.05em] self-end font-label text-[2rem] font-bold leading-none tracking-normal text-[#7ee5b5]">
                        U
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 提交规范 — max-w-home 1024px */}
        <section className="relative overflow-x-clip border-t border-white/[0.06] bg-background px-6 py-24 sm:py-32 md:px-12 md:py-44 lg:py-52 xl:py-60">
          <div className="mx-auto w-full max-w-home">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-20 flex flex-col items-center text-center md:mb-28"
            >
              <span className="font-label mb-4 block text-sm font-medium uppercase leading-snug tracking-technical text-primary-container">
                Rules & Platform
              </span>
              <SectionTitleEnDecor
                titleZh="提交规范与平台"
                titleEn="SUBMISSION"
                align="center"
              />
            </motion.div>

            <div className="flex w-full flex-col gap-4 text-left md:gap-5">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group surface-card w-full p-10 md:p-14"
              >
                <div className="flex items-start gap-2">
                  <span className="font-label text-4xl font-bold text-primary/50 transition-colors duration-500 group-hover:text-[#5ed29c]/45">
                    01
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-headline mb-3 text-2xl font-semibold leading-snug tracking-tight text-on-background">作品形式</h3>
                    <p className="font-body type-body-compact text-lg text-on-background/92">
                      参赛作品须为
                      <span className="font-semibold text-on-background"> HTML5 网页游戏</span>
                      ，以便统一汇总至公司展示页。
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 }}
                className="group surface-card w-full p-10 md:p-12"
              >
                <div className="flex items-start gap-2">
                  <span className="font-label text-4xl font-bold text-primary/50 transition-colors duration-500 group-hover:text-[#5ed29c]/45">
                    02
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-headline mb-3 text-2xl font-semibold leading-snug tracking-tight text-on-background">发布路径</h3>
                    <p className="font-body type-body-compact text-lg text-on-background/92">
                      完成报名后，请将可访问的上线链接同步至公司群，供全员体验。
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="group surface-card w-full p-10 md:p-12"
              >
                <div className="flex items-start gap-2">
                  <span className="font-label text-4xl font-bold text-primary/50 transition-colors duration-500 group-hover:text-[#5ed29c]/45">
                    03
                  </span>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <h3 className="font-headline text-2xl font-semibold leading-snug tracking-tight text-on-background">
                      简短说明
                    </h3>
                    <ul className="list-none space-y-1">
                      {CREATOR_LOG_ITEMS.map((line, idx) => (
                        <li key={line} className="flex gap-1 text-left">
                          <span className="shrink-0 font-body text-base font-medium tabular-nums text-primary/50">
                            {idx + 1}、
                          </span>
                          <span className="text-base font-normal leading-[1.21] tracking-normal text-on-background">
                            {line}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Evaluation Protocol — 不用整段 overflow-hidden，避免圆环 drop-shadow 被裁切；水印单独裁剪 */}
        <section className="relative bg-transparent px-6 py-24 sm:py-32 md:px-12 md:py-44 lg:py-52 xl:py-60">
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            aria-hidden
          >
            <div className="flex h-full items-center justify-center opacity-[0.03]">
              <span className="select-none font-headline text-[200px] font-bold tracking-tighter md:text-[400px] lg:text-[500px]">
                PROTOCOL
              </span>
            </div>
          </div>
          
          <div className="relative z-10 mx-auto w-full max-w-home">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-20 text-center md:mb-28"
            >
              <span className="font-label mb-4 block text-sm font-medium uppercase leading-snug tracking-technical text-primary-container">
                评分权重矩阵
              </span>
              <SectionTitleEnDecor
                titleZh="评审协议"
                titleEn="PROTOCOL"
                align="center"
              />
            </motion.div>

            <div className="grid grid-cols-1 gap-5 overflow-visible text-center md:grid-cols-3 md:gap-6 lg:gap-8">
              {[
                {
                  label: "创新意识",
                  percent: 30,
                  desc: "玩法与概念的新颖度，以及 AI 是否实质拓展创作边界。",
                  offset: 483
                },
                {
                  label: "趣味性",
                  percent: 30,
                  desc: "交互参与感与叙事吸引力。",
                  offset: 483
                },
                {
                  label: "完成度",
                  percent: 40,
                  desc: "技术稳定性、完成度与落地执行力。",
                  offset: 276
                }
              ].map((gauge, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.2 }}
                  className="flex min-w-0 flex-col items-center overflow-visible px-2"
                >
                  <div className="relative box-content flex h-64 w-64 max-w-full items-center justify-center overflow-visible p-8 md:h-[17.5rem] md:w-[17.5rem] md:p-10">
                    <svg
                      className="h-full w-full shrink-0 -rotate-90 transform overflow-visible [filter:drop-shadow(0_0_14px_rgba(94,210,156,0.22))_drop-shadow(0_0_28px_rgba(94,210,156,0.12))]"
                      viewBox="0 0 256 256"
                      overflow="visible"
                    >
                      <circle className="text-outline-variant/10" cx="128" cy="128" fill="transparent" r="110" stroke="currentColor" strokeWidth="2" />
                      <motion.circle 
                        initial={{ strokeDashoffset: 690 }}
                        whileInView={{ strokeDashoffset: gauge.offset }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="text-primary-container [filter:drop-shadow(0_0_12px_rgba(94,210,156,0.45))_drop-shadow(0_0_24px_rgba(94,210,156,0.2))]" 
                        cx="128" cy="128" fill="transparent" r="110" stroke="currentColor" strokeDasharray="690" strokeLinecap="round" strokeWidth="10" 
                      />
                    </svg>
                    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-0.5 overflow-visible px-2">
                      <span className="type-amount text-5xl font-bold text-on-background">
                        {gauge.percent}%
                      </span>
                      <span className="text-[10px] font-medium uppercase leading-normal tracking-technical text-primary/45">
                        权重比例
                      </span>
                    </div>
                  </div>
                  <h3 className="mt-8 font-headline text-3xl font-semibold leading-snug tracking-tight text-primary">{gauge.label}</h3>
                  <p className="mt-2 max-w-[280px] text-base font-body type-body-compact tracking-normal text-on-background/88">{gauge.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-background px-6 pt-16 pb-[max(4rem,calc(env(safe-area-inset-bottom,0px)+3rem))] font-label text-[10px] font-medium uppercase tracking-technical text-primary/40 sm:pt-20 md:px-12 md:pt-24 md:pb-28">
        <div className="mx-auto flex w-full max-w-home flex-col items-center justify-center">
          <div className="mb-8 text-center">
            © 2026 AI_GAME_CONTEST_PROTOCOL，保留所有权利。
          </div>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-3">
            <a href="#" className="footer-link-micro hover:text-primary">
              安全日志
            </a>
            <a href="#" className="footer-link-micro hover:text-primary">
              隐私缓冲
            </a>
            <a href="#" className="footer-link-micro hover:text-primary">
              同步条款
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
