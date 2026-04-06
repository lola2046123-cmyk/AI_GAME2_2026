import { useSyncExternalStore } from "react";
import { useOutletContext } from "react-router-dom";
import { motion } from "motion/react";
import { Award, Lightbulb, Medal, Rocket, Star, Trophy } from "lucide-react";
import type { AppOutletContext } from "../types/outlet";
import { HeroVideoBackdrop } from "../components/hero/HeroVideoBackdrop";
import { PrizeAwardIcon } from "../components/PrizeAwardIcon";
import { SectionTitleEnDecor } from "../components/SectionTitleEnDecor";
import { SubmissionCountdown } from "../components/SubmissionCountdown";
import { RewardCardHud } from "../components/rewards/RewardCardHud";

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
                className="mx-auto flex w-full max-w-4xl translate-y-[1vh] flex-col items-center space-y-5 px-4 text-center md:translate-y-[1.25vh] md:space-y-6 lg:space-y-7"
              >
                <motion.h1
                  variants={fadeInUp}
                  className="type-amount text-balance font-headline text-[clamp(3rem,8.45vw,5.125rem)] font-bold leading-none tracking-tight text-white md:text-[clamp(3.25rem,6.25vw,5.6875rem)]"
                >
                  AI 游戏设计大赛
                </motion.h1>

                <motion.div
                  variants={fadeInUp}
                  className="flex flex-col items-center"
                  aria-label="投稿截止倒计时"
                >
                  <p className="mb-1 font-body text-[13px] font-normal tracking-normal text-primary/45 md:text-[14px]">
                    投递截止倒计时
                  </p>
                  <SubmissionCountdown variant="footer" />
                </motion.div>

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
                    <span className="prize-hero-gradient prize-hero-sweep-text prize-hero-sweep-text--diagonal type-amount font-headline text-[clamp(2.4rem,6.76vw,4.1rem)] font-bold leading-none tracking-tight md:text-[clamp(2.6rem,5vw,4.55rem)]">
                      32,500&nbsp;U
                    </span>
                  </div>
                </motion.div>

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
              </motion.div>
          </div>
        </section>

        {/* Rewards Section */}
        <section className="border-t border-white/[0.06] bg-background px-6 py-14 sm:py-16 md:px-12 md:py-20 lg:py-24 xl:py-28">
          <div className="mx-auto w-full max-w-home text-center">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-10 flex flex-col items-center space-y-3 md:mb-14 md:space-y-4"
            >
              <div className="flex w-full flex-col items-center text-center">
                <span className="font-label mb-2 block text-sm font-medium uppercase leading-snug tracking-technical text-primary-container md:mb-3">
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
                className="group surface-card relative flex flex-col items-center justify-center gap-[0.3375rem] p-[2.025rem] md:col-span-2 md:gap-2.5 md:p-10 lg:p-12"
              >
                <RewardCardHud slotIndex={0} designation="DESIGNATION: R1" />
                <div className="absolute top-0 right-0 p-4 font-label text-[81px] leading-none font-bold opacity-[0.03] md:text-[120px]">
                  R1
                </div>
                <PrizeAwardIcon
                  icon={Trophy}
                  emphasis="primary"
                  size="lg"
                  phase={0}
                  className="max-md:mb-[0.3375rem] max-md:h-[2.3625rem] max-md:w-[2.3625rem] max-md:rounded-[0.675rem]"
                  iconClassName="max-md:h-[1.18125rem] max-md:w-[1.18125rem]"
                />
                <div className="space-y-[0.3375rem] text-center md:space-y-2">
                  <span className="font-label block text-[0.590625rem] font-medium uppercase leading-snug tracking-technical text-[#a8ffe1] md:text-sm">
                    一等奖（领航者）
                  </span>
                </div>
                <div className="flex justify-center">
                  <span className="prize-hero-gradient prize-hero-sweep-text prize-hero-sweep-text--diagonal type-amount font-headline text-[3.0375rem] font-bold leading-none tracking-tight md:text-8xl">
                    20,000&nbsp;U
                  </span>
                </div>
                <div className="mt-1 h-[2.7px] w-[5.4rem] bg-primary/30 transition-all duration-700 group-hover:w-full md:h-1 md:w-32" />
              </motion.div>

              {/* Rank 2-3 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="group surface-card flex flex-col items-center justify-center gap-1.5 p-8 md:p-10"
              >
                <RewardCardHud slotIndex={1} designation="DESIGNATION: R2" />
                <PrizeAwardIcon icon={Lightbulb} phase={1} />
                <div className="space-y-1.5 text-center">
                  <span className="font-label block text-xs font-medium uppercase leading-snug tracking-technical text-[#a8ffe1]">
                    二等奖（进化者）
                  </span>
                </div>
                <div className="flex items-baseline justify-center gap-1.5">
                  <span className="type-amount text-5xl font-bold font-headline text-on-background">5,000</span>
                  <span className="text-[2rem] font-bold font-label leading-none tracking-normal text-on-background self-end translate-y-[-0.05em]">
                    U
                  </span>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="group surface-card flex flex-col items-center justify-center gap-1.5 p-8 md:p-10"
              >
                <RewardCardHud slotIndex={2} designation="DESIGNATION: R3" />
                <PrizeAwardIcon icon={Rocket} phase={2} />
                <div className="space-y-1.5 text-center">
                  <span className="font-label block text-xs font-medium uppercase leading-snug tracking-technical text-[#a8ffe1]">
                    三等奖（破局者）
                  </span>
                </div>
                <div className="flex items-baseline justify-center gap-1.5">
                  <span className="type-amount text-5xl font-bold font-headline text-on-background">3,000</span>
                  <span className="text-[2rem] font-bold font-label leading-none tracking-normal text-on-background self-end translate-y-[-0.05em]">
                    U
                  </span>
                </div>
              </motion.div>

              {/* 入围奖 ×3 — 与上行同宽齐边 */}
              <div className="grid w-full grid-cols-1 gap-3 md:col-span-2 md:grid-cols-3 md:gap-4 lg:col-span-4">
                {[
                  { icon: Star, title: "入围奖（观测者 / Observer）" },
                  { icon: Medal, title: "入围奖（解析者 / Parser）" },
                  { icon: Award, title: "入围奖（响应者 / Responder）" }
                ].map((prize, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    className="group surface-card flex w-full min-w-0 flex-col items-center justify-center gap-1 p-8 md:p-9"
                  >
                    <RewardCardHud slotIndex={3 + idx} designation="TYPE: REWARD_NODE" />
                    <PrizeAwardIcon icon={prize.icon} phase={3 + idx} />
                    <span className="px-0.5 text-center font-label text-xs font-medium leading-snug tracking-technical text-[#a8ffe1] normal-case">
                      {prize.title}
                    </span>
                    <div className="flex items-baseline justify-center gap-1 pt-0.5">
                      <span className="type-amount font-headline text-2xl font-bold text-primary md:text-3xl">
                        1,500
                      </span>
                      <span className="translate-y-[-0.05em] self-end font-label text-2xl font-bold leading-none tracking-normal text-primary md:text-3xl">
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
        <section className="relative overflow-x-clip border-t border-white/[0.06] bg-background px-6 py-14 sm:py-16 md:px-12 md:py-20 lg:py-24 xl:py-28">
          <div className="mx-auto w-full max-w-home">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-10 flex flex-col items-center text-center md:mb-14"
            >
              <span className="font-label mb-2 block text-sm font-medium uppercase leading-snug tracking-technical text-primary-container md:mb-3">
                Rules & Platform
              </span>
              <SectionTitleEnDecor
                titleZh="提交规范与平台"
                titleEn="SUBMISSION"
                align="center"
              />
            </motion.div>

            <div className="flex w-full flex-col gap-3 text-left md:gap-4">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group surface-card w-full p-8 md:p-10 lg:p-12"
              >
                <div className="flex items-start gap-2">
                  <span className="font-label text-3xl font-bold text-primary/50 transition-colors duration-500 group-hover:text-[#00ffcc]/45 md:text-4xl">
                    01
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-headline mb-2 text-xl font-semibold leading-snug tracking-tight text-on-background md:text-2xl">作品形式</h3>
                    <p className="font-body type-body-compact text-base text-on-background/92 md:text-lg">
                      参赛作品须为
                      <span className="font-semibold text-on-background">公网可访问的 HTML5 网页游戏</span>
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
                className="group surface-card w-full p-8 md:p-10"
              >
                <div className="flex items-start gap-2">
                  <span className="font-label text-3xl font-bold text-primary/50 transition-colors duration-500 group-hover:text-[#00ffcc]/45 md:text-4xl">
                    02
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-headline mb-2 text-xl font-semibold leading-snug tracking-tight text-on-background md:text-2xl">发布路径</h3>
                    <p className="font-body type-body-compact text-base text-on-background/92 md:text-lg">
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
                className="group surface-card w-full p-8 md:p-10"
              >
                <div className="flex items-start gap-2">
                  <span className="font-label text-3xl font-bold text-primary/50 transition-colors duration-500 group-hover:text-[#00ffcc]/45 md:text-4xl">
                    03
                  </span>
                  <div className="min-w-0 flex-1 space-y-2 md:space-y-2.5">
                    <h3 className="font-headline text-xl font-semibold leading-snug tracking-tight text-on-background md:text-2xl">
                      简短说明
                    </h3>
                    <div className="font-body type-body-compact space-y-1.5 text-base font-normal leading-[1.21] tracking-normal text-on-background/92 md:space-y-2 md:text-lg">
                      <p>游戏名称</p>
                      <p>核心玩法说明或 PRD</p>
                      <p>使用的 AI 相关工具</p>
                      <p>其他说明</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Evaluation Protocol — 不用整段 overflow-hidden，避免圆环 drop-shadow 被裁切；水印单独裁剪 */}
        <section className="relative bg-transparent px-6 py-14 sm:py-16 md:px-12 md:py-20 lg:py-24 xl:py-28">
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            aria-hidden
          >
            <div className="flex h-full items-center justify-center opacity-[0.03]">
              <span className="select-none font-headline text-[160px] font-bold tracking-tighter md:text-[320px] lg:text-[400px]">
                PROTOCOL
              </span>
            </div>
          </div>
          
          <div className="relative z-10 mx-auto w-full max-w-home">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-10 text-center md:mb-14"
            >
              <span className="font-label mb-2 block text-sm font-medium uppercase leading-snug tracking-technical text-primary-container md:mb-3">
                评分权重矩阵
              </span>
              <SectionTitleEnDecor
                titleZh="评审协议"
                titleEn="PROTOCOL"
                align="center"
              />
            </motion.div>

            <div className="grid grid-cols-1 gap-10 overflow-visible text-center md:grid-cols-3 md:gap-12 lg:gap-16">
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
                  className="flex min-w-0 flex-col items-center overflow-visible px-2 md:px-3"
                >
                  <div className="relative box-content flex h-52 w-52 max-w-full shrink-0 items-center justify-center overflow-visible p-6 md:h-56 md:w-56 md:p-8 lg:h-60 lg:w-60">
                    <svg
                      className="h-full w-full shrink-0 -rotate-90 transform overflow-visible [filter:drop-shadow(0_0_14px_rgba(0,255,204,0.22))_drop-shadow(0_0_28px_rgba(0,255,204,0.12))]"
                      viewBox="0 0 256 256"
                      overflow="visible"
                    >
                      <circle className="text-outline-variant/10" cx="128" cy="128" fill="transparent" r="110" stroke="currentColor" strokeWidth="2" />
                      <motion.circle 
                        initial={{ strokeDashoffset: 690 }}
                        whileInView={{ strokeDashoffset: gauge.offset }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="text-primary-container [filter:drop-shadow(0_0_12px_rgba(0,255,204,0.45))_drop-shadow(0_0_24px_rgba(0,255,204,0.2))]" 
                        cx="128" cy="128" fill="transparent" r="110" stroke="currentColor" strokeDasharray="690" strokeLinecap="round" strokeWidth="10" 
                      />
                    </svg>
                    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-px overflow-visible px-2">
                      <span className="type-amount text-4xl font-bold leading-none text-on-background md:text-5xl">
                        {gauge.percent}%
                      </span>
                      <span className="text-[10px] font-medium uppercase leading-tight tracking-technical text-primary/45">
                        权重比例
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 flex w-full max-w-[280px] flex-col items-center gap-1 text-center md:mt-2.5 md:gap-1.5">
                    <h3 className="font-headline text-2xl font-semibold leading-tight tracking-tight text-primary md:text-3xl">
                      {gauge.label}
                    </h3>
                    <p className="text-sm font-body leading-[1.38] tracking-normal text-on-background/88 md:text-base md:leading-[1.4]">
                      {gauge.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-background px-6 pt-10 pb-[max(3rem,calc(env(safe-area-inset-bottom,0px)+2.5rem))] font-label text-[10px] font-medium uppercase tracking-technical text-primary/40 sm:pt-12 md:px-12 md:pt-16 md:pb-20">
        <div className="mx-auto flex w-full max-w-home flex-col items-center justify-center">
          <div className="mb-5 text-center md:mb-6">
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
