import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { motion } from "motion/react";
import { Award, ChevronDown, ExternalLink, Lightbulb, Medal, Rocket, Star, Trophy } from "lucide-react";
import { ThinArrow } from "../components/ThinArrow";
import type { AppOutletContext } from "../types/outlet";
import { HeroVideoBackdrop } from "../components/hero/HeroVideoBackdrop";
import { PrizeAwardIcon } from "../components/PrizeAwardIcon";
import { SectionTitleEnDecor } from "../components/SectionTitleEnDecor";
import { SubmissionCountdown } from "../components/SubmissionCountdown";
import { RewardCardHud } from "../components/rewards/RewardCardHud";
import { ShowcaseLoading } from "../components/showcase/ShowcaseLoading";
import { getShowcaseListAsync } from "../lib/showcaseMerge";
import { compareShowcaseDesc } from "../lib/showcaseSort";
import {
  FEATURED_THUMB_SIZES,
  SHOWCASE_THUMB_SIZES,
  unsplashSrcSet
} from "../lib/responsiveThumbnail";
import {
  getVoteStateForProjects,
  type ShowcaseVoteStateMap
} from "../lib/showcaseVotes";
import type { ShowcaseSubmission } from "../types/submission";

/* ─────────── motion 变体 ─────────── */
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

/* ─────────── Featured Card 组件（基于用户稿/兜底 mock） ─────────── */
function FeaturedCard({
  item,
  large = false
}: {
  item: ShowcaseSubmission;
  large?: boolean;
}) {
  const description = (item.cardSummary?.trim() || item.gameplay).trim();
  const thumbSrcSet = unsplashSrcSet(item.thumbnailUrl);

  return (
    <Link
      to={`/showcase/${item.id}`}
      className="group relative block h-full min-h-0 overflow-hidden rounded-2xl border border-white/10 bg-[#161616] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
    >
      {/* 封面图：绝对定位避免比例容器被 intrinsic 图高撑破 */}
      <div
        className={`relative w-full shrink-0 overflow-hidden ${large ? "aspect-[4/3]" : "aspect-video"} bg-white/[0.03]`}
      >
        <img
          src={item.thumbnailUrl}
          srcSet={thumbSrcSet}
          sizes={FEATURED_THUMB_SIZES}
          alt={item.gameName}
          className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          loading="lazy"
          decoding="async"
        />
        {/* 渐变遮罩 */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#161616] via-[#161616]/40 to-transparent"
          aria-hidden
        />
        {/* hover 浮层 */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="flex items-center gap-2 rounded-full border border-white/20 bg-black/70 px-5 py-2 font-label text-xs font-semibold uppercase tracking-widest text-white backdrop-blur-md">
              查看作品 <ExternalLink className="h-3.5 w-3.5" />
            </span>
        </div>
      </div>

      {/* 文字区 */}
      <div className={`px-5 pb-5 pt-4 ${large ? "md:px-6 md:pb-6" : "md:px-5 md:pb-5"}`}>
        <h3 className={`font-headline font-semibold tracking-tight text-white ${large ? "text-xl md:text-2xl" : "text-base md:text-lg"}`}>
          {item.gameName}
        </h3>
        <p className={`mt-2 font-body leading-relaxed text-white/55 line-clamp-2 ${large ? "text-sm md:text-base" : "text-sm"}`}>
          {description}
        </p>
      </div>
    </Link>
  );
}

/* ─────────── Latest Submission 卡片（轻量版） ─────────── */
function LatestCard({ item }: { item: ShowcaseSubmission }) {
  const cardBlurb = (item.cardSummary?.trim() || item.gameplay).trim();
  const thumbSrcSet = unsplashSrcSet(item.thumbnailUrl);

  const inner = (
    <article className="group/card surface-card flex min-h-0 h-full flex-col overflow-hidden rounded-xl border border-white/10 transition-all duration-300 hover:border-white/[0.18] hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
      <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-white/[0.04]">
        <img
          src={item.thumbnailUrl}
          srcSet={thumbSrcSet}
          sizes={SHOWCASE_THUMB_SIZES}
          alt={item.gameName}
          className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover/card:scale-[1.04]"
          loading="lazy"
          decoding="async"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/65 via-background/10 to-transparent" aria-hidden />
      </div>
      <div className="flex flex-1 flex-col px-4 pb-4 pt-3.5 md:px-5 md:pb-5">
        <h3 className="font-headline text-sm font-semibold leading-snug tracking-tight text-white md:text-base">
          {item.gameName}
        </h3>
        <p className="mt-2 flex-1 font-body text-xs leading-relaxed text-white/55 line-clamp-2">
          {cardBlurb}
        </p>
      </div>
    </article>
  );

  return (
    <Link
      to={`/showcase/${item.id}`}
      className="block h-full min-h-0 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
    >
      {inner}
    </Link>
  );
}

/* ─────────── 页面主体 ─────────── */
export function HomePage() {
  const { openRegister } = useOutletContext<AppOutletContext>();
  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    () => false
  );

  /**
   * 展示数据：
   * - `getShowcaseListAsync()` 已内置「有可见用户稿 → 用户稿；否则 → 6 条 mock」的兜底规则。
   * - 精选作品：按点赞数降序取前 3；
   * - 最新参赛：按 createdAt 降序取前 6。
   */
  const [showcaseItems, setShowcaseItems] = useState<ShowcaseSubmission[]>([]);
  const [showcaseLoading, setShowcaseLoading] = useState(true);
  const [voteMap, setVoteMap] = useState<ShowcaseVoteStateMap>({});

  useEffect(() => {
    let cancelled = false;
    setShowcaseLoading(true);
    void getShowcaseListAsync()
      .then((list) => {
        if (cancelled) return;
        setShowcaseItems(list);
        setShowcaseLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setShowcaseItems([]);
        setShowcaseLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (showcaseItems.length === 0) {
      setVoteMap({});
      return;
    }
    void getVoteStateForProjects(showcaseItems.map((it) => it.id))
      .then((map) => {
        if (!cancelled) setVoteMap(map);
      })
      .catch(() => {
        if (!cancelled) setVoteMap({});
      });
    return () => {
      cancelled = true;
    };
  }, [showcaseItems]);

  const featuredItems = useMemo(() => {
    if (showcaseItems.length === 0) return [];
    return [...showcaseItems]
      .sort((a, b) => {
        const diff =
          (voteMap[b.id]?.counts.like ?? 0) - (voteMap[a.id]?.counts.like ?? 0);
        if (diff !== 0) return diff;
        return compareShowcaseDesc(a, b);
      })
      .slice(0, 3);
  }, [showcaseItems, voteMap]);

  const latestItems = useMemo(() => {
    if (showcaseItems.length === 0) return [];
    return [...showcaseItems].sort(compareShowcaseDesc).slice(0, 6);
  }, [showcaseItems]);

  return (
    <>
      <main className="flex flex-col">

        {/* ════════════════════════════════════
            1. Hero
        ════════════════════════════════════ */}
        <section
          id="hero"
          className="relative isolate flex min-h-[calc(100svh-var(--site-header-height))] w-full flex-col overflow-hidden bg-background text-white"
        >
          <HeroVideoBackdrop />
          <div className="home-hero-bottom-blend" aria-hidden />

          <div className="relative z-10 mx-auto grid min-h-[calc(100svh-var(--site-header-height))] w-full max-w-home place-content-center justify-items-stretch px-6 pb-[max(4rem,env(safe-area-inset-bottom,0px))] pt-0 md:px-12 md:pb-10">
            <motion.div
              initial="initial"
              animate="animate"
              variants={staggerContainer}
              className="mx-auto flex w-full max-w-4xl translate-y-[1vh] flex-col items-center space-y-5 px-4 text-center md:translate-y-[1.25vh] md:space-y-6 lg:space-y-7"
            >
              {/* 主标题 */}
              <motion.h1
                variants={fadeInUp}
                className="hero-title-over-video type-amount min-w-0 max-w-full font-headline font-bold leading-none tracking-tight text-white max-md:whitespace-nowrap max-md:text-center max-md:text-[clamp(1.375rem,11vw,3.125rem)] md:text-balance md:text-[clamp(3.25rem,6.25vw,5.6875rem)]"
              >
                AI 游戏设计大赛
              </motion.h1>

              {/* 倒计时 */}
              <motion.div variants={fadeInUp} className="flex flex-col items-center">
                <SubmissionCountdown variant="footer" />
              </motion.div>

              {/* CTA 按钮组 */}
              <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
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

                <motion.div
                  whileHover={reduceMotion ? undefined : { y: -2 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 520, damping: 28 }}
                >
                  <Link
                    to="/showcase"
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-8 py-3.5 font-label text-sm font-medium uppercase tracking-widest text-white/75 backdrop-blur-sm transition-colors duration-200 hover:border-white/30 hover:bg-white/[0.1] hover:text-white md:px-10 md:py-4 md:text-sm"
                  >
                    浏览作品
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>

          {/* Scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.8 }}
            className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2"
            aria-hidden
          >
            <motion.div
              animate={reduceMotion ? undefined : { y: [0, 7, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="flex flex-col items-center gap-1.5 text-white/25"
            >
              <span className="font-label text-[9px] uppercase tracking-[0.2em]">Scroll</span>
              <ChevronDown className="h-4 w-4" strokeWidth={1.5} />
            </motion.div>
          </motion.div>
        </section>

        {/* ════════════════════════════════════
            2. Featured Showcase（新增）
        ════════════════════════════════════ */}
        <section className="border-t border-white/[0.06] bg-background px-6 py-14 sm:py-16 md:px-12 md:py-20 lg:py-24">
          <div className="mx-auto w-full max-w-home">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-10 flex items-end justify-between md:mb-12"
            >
              <div>
                <span className="font-label mb-2 block text-xs font-medium uppercase tracking-widest text-white/40 md:mb-3">
                  Community Picks
                </span>
                <SectionTitleEnDecor
                  titleZh="精选作品"
                  titleEn="FEATURED"
                  align="left"
                  headlineClassName="text-white"
                />
              </div>
              <Link
                to="/showcase"
                className="hidden shrink-0 items-center gap-1.5 font-label text-sm font-medium tracking-normal text-white/40 transition-colors hover:text-primary/70 md:flex"
              >
                全部作品 <ThinArrow />
              </Link>
            </motion.div>

            {/* 2+1 布局：左侧大卡片占 2 列，右侧 2 个小卡片上下 */}
            {showcaseLoading ? (
              <ShowcaseLoading
                count={3}
                showHeader={false}
                columnsClass="grid-cols-1 gap-5 md:grid-cols-3 md:gap-6"
              />
            ) : featuredItems.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
                {/* 大卡片 */}
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55 }}
                  className="md:col-span-2"
                >
                  <FeaturedCard item={featuredItems[0]} large />
                </motion.div>

                {/* 右侧两个小卡片 */}
                <div className="flex flex-col gap-5 md:gap-6">
                  {featuredItems.slice(1, 3).map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.55, delay: 0.1 + i * 0.1 }}
                      className="flex-1"
                    >
                      <FeaturedCard item={item} />
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="py-10 text-center font-body text-sm text-white/45">
                还没有作品，快来成为第一位参赛者。
              </p>
            )}

            {/* 移动端"全部作品"链接 */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-6 flex justify-center md:hidden"
            >
              <Link
                to="/showcase"
                className="inline-flex items-center gap-1.5 font-label text-sm font-medium tracking-normal text-white/40 transition-colors hover:text-primary/70"
              >
                全部作品 <ThinArrow />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ════════════════════════════════════
            3. Awards / Prizes（hover 增强 + 金额放大）
        ════════════════════════════════════ */}
        <section className="home-prizes-section px-6 py-14 sm:py-16 md:px-12 md:py-20 lg:py-24 xl:py-28">
          <div className="mx-auto w-full max-w-home text-left">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-10 flex flex-col items-start space-y-3 md:mb-14 md:space-y-4"
            >
              <div className="flex w-full flex-col items-start text-left">
                <span className="font-label mb-2 block text-xs font-medium uppercase tracking-widest text-white/40 md:mb-3">
                  Prizes & Seats
                </span>
                <SectionTitleEnDecor
                  titleZh="奖项设置"
                  titleEn="PRIZES"
                  align="left"
                  headlineClassName="text-white"
                />
              </div>
              <p className="max-w-xl font-body text-sm font-normal text-white/70 md:text-base">
                高额赏金：一等奖 x 1 名、二等奖 x 1 名、三等奖 x 1 名、入围奖 x 3 名。
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-4 lg:gap-4">
              {/* Rank 1 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                whileHover={reduceMotion ? undefined : { scale: 1.02, y: -4 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                className="group surface-card relative flex flex-col items-center justify-center gap-[0.3375rem] p-[2.025rem] transition-shadow duration-300 hover:shadow-[0_20px_60px_rgba(0,0,0,0.65),0_0_40px_rgba(0,255,204,0.07)] md:col-span-2 md:gap-2.5 md:p-10 lg:p-12"
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
                  className="max-md:mb-[0.3375rem] max-md:h-[2.3625rem] max-md:w-[2.3625rem] max-md:rounded-full"
                  iconClassName="max-md:h-[1.18125rem] max-md:w-[1.18125rem]"
                />
                <span className="prize-tier-name">一等奖：领航者</span>
                <div className="flex justify-center">
                  <span className="prize-hero-gradient prize-hero-sweep-text prize-hero-sweep-text--diagonal type-amount font-headline text-[3.375rem] font-bold leading-none tracking-tight md:text-[5.5rem] lg:text-[6rem]">
                    20,000
                  </span>
                </div>
                <div className="mx-auto mt-1 h-[2.7px] w-[5.4rem] max-w-full bg-primary/30 transition-all duration-700 group-hover:w-[68%] md:h-1 md:w-32 md:group-hover:w-[62%]" />
              </motion.div>

              {/* Rank 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                whileHover={reduceMotion ? undefined : { scale: 1.025, y: -3 }}
                className="group surface-card flex flex-col items-center justify-center gap-1.5 p-8 transition-shadow duration-300 hover:shadow-[0_16px_48px_rgba(0,0,0,0.6)] md:p-10"
              >
                <RewardCardHud slotIndex={1} designation="DESIGNATION: R2" />
                <PrizeAwardIcon icon={Lightbulb} phase={1} />
                <span className="prize-tier-name">二等奖：进化者</span>
                <div className="flex justify-center">
                  <span className="type-amount font-headline text-[3.25rem] font-bold leading-none text-on-background md:text-[4rem]">
                    5,000
                  </span>
                </div>
              </motion.div>

              {/* Rank 3 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                whileHover={reduceMotion ? undefined : { scale: 1.025, y: -3 }}
                className="group surface-card flex flex-col items-center justify-center gap-1.5 p-8 transition-shadow duration-300 hover:shadow-[0_16px_48px_rgba(0,0,0,0.6)] md:p-10"
              >
                <RewardCardHud slotIndex={2} designation="DESIGNATION: R3" />
                <PrizeAwardIcon icon={Rocket} phase={2} />
                <span className="prize-tier-name">三等奖：破局者</span>
                <div className="flex justify-center">
                  <span className="type-amount font-headline text-[3.25rem] font-bold leading-none text-on-background md:text-[4rem]">
                    3,000
                  </span>
                </div>
              </motion.div>

              {/* 入围奖 ×3 */}
              <div className="grid w-full grid-cols-1 gap-3 md:col-span-2 md:grid-cols-3 md:gap-4 lg:col-span-4">
                {[
                  { icon: Star, title: "入围奖 1：观测者" },
                  { icon: Medal, title: "入围奖 2：解析者" },
                  { icon: Award, title: "入围奖 3：响应者" }
                ].map((prize, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    whileHover={reduceMotion ? undefined : { scale: 1.025, y: -3 }}
                    className="group surface-card flex w-full min-w-0 flex-col items-center justify-center gap-1 p-8 transition-shadow duration-300 hover:shadow-[0_12px_36px_rgba(0,0,0,0.55)] md:p-9"
                  >
                    <RewardCardHud slotIndex={3 + idx} designation="TYPE: REWARD_NODE" />
                    <PrizeAwardIcon icon={prize.icon} phase={3 + idx} />
                    <span className="prize-tier-name px-0.5">{prize.title}</span>
                    <div className="flex justify-center pt-0.5">
                      <span className="type-amount font-headline text-3xl font-bold text-primary md:text-4xl">
                        1,500
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════
            4. Latest Submissions（新增）
        ════════════════════════════════════ */}
        <section className="border-t border-white/[0.06] bg-background px-6 py-14 sm:py-16 md:px-12 md:py-20 lg:py-24">
          <div className="mx-auto w-full max-w-home">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-10 flex items-end justify-between md:mb-12"
            >
              <div>
                <span className="font-label mb-2 block text-xs font-medium uppercase tracking-widest text-white/40 md:mb-3">
                  Recent Entries
                </span>
                <SectionTitleEnDecor
                  titleZh="最新参赛"
                  titleEn="LATEST"
                  align="left"
                  headlineClassName="text-white"
                />
              </div>
              <Link
                to="/showcase"
                className="hidden shrink-0 items-center gap-1.5 font-label text-sm font-medium tracking-normal text-white/40 transition-colors hover:text-primary/70 md:flex"
              >
                全部作品 <ThinArrow />
              </Link>
            </motion.div>

            {showcaseLoading ? (
              <ShowcaseLoading
                count={6}
                showHeader={false}
                columnsClass="grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-3"
              />
            ) : latestItems.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
                {latestItems.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.07 }}
                  >
                    <LatestCard item={item} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="py-10 text-center font-body text-sm text-white/45">
                暂无最新参赛作品。
              </p>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-8 flex justify-center md:hidden"
            >
              <Link
                to="/showcase"
                className="inline-flex items-center gap-1.5 font-label text-sm font-medium tracking-normal text-white/40 transition-colors hover:text-primary/70"
              >
                全部作品 <ThinArrow />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ════════════════════════════════════
            5. 提交规范（正文 line-clamp-2，增加留白）
        ════════════════════════════════════ */}
        <section className="relative overflow-x-clip border-t border-white/[0.06] bg-background px-6 py-14 sm:py-16 md:px-12 md:py-20 lg:py-24 xl:py-28">
          <div className="mx-auto w-full max-w-home">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-10 flex flex-col items-start text-left md:mb-14"
            >
              <span className="font-label mb-2 block text-xs font-medium uppercase tracking-widest text-white/40 md:mb-3">
                Rules & Platform
              </span>
              <SectionTitleEnDecor
                titleZh="提交规范与平台"
                titleEn="SUBMISSION"
                align="left"
                headlineClassName="text-white"
              />
            </motion.div>

            <div className="flex w-full flex-col gap-4 text-left md:gap-5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group surface-card w-full p-9 md:p-12 lg:p-14"
              >
                <div className="flex items-start gap-4">
                  <span className="font-label text-3xl font-bold text-primary/50 transition-colors duration-500 group-hover:text-[#00ffcc]/36 md:text-4xl">
                    01
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-headline mb-3 text-xl font-semibold leading-snug tracking-tight text-white md:text-2xl">作品形式</h3>
                    <p className="font-body text-base leading-relaxed text-white/70 line-clamp-2 md:text-lg">
                      参赛作品须为公网可访问的
                      <span className="font-semibold text-white">HTML5 网页游戏</span>
                      ，提交进入展示页面。
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 }}
                className="group surface-card w-full p-9 md:p-12"
              >
                <div className="flex items-start gap-4">
                  <span className="font-label text-3xl font-bold text-primary/50 transition-colors duration-500 group-hover:text-[#00ffcc]/36 md:text-4xl">
                    02
                  </span>
                  <div className="min-w-0 flex-1 space-y-3 md:space-y-4">
                    <h3 className="font-headline text-xl font-semibold leading-snug tracking-tight text-white md:text-2xl">
                      投稿清单
                    </h3>
                    <div className="space-y-2 font-body text-base leading-relaxed text-white/70 line-clamp-2 md:space-y-2.5 md:text-lg">
                      <p>游戏名称 · 核心玩法或 PRD · AI 工具 · 其他说明</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

      </main>

      {/* ════════════════════════════════════
          6. 评审协议 + Footer — 共享游戏背景图
      ════════════════════════════════════ */}
      <div className="relative overflow-hidden">

        {/* ── 背景图层 ── */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <img
            src="/game_home_2.jpg"
            alt=""
            className="h-full w-full object-cover object-bottom"
            loading="lazy"
            decoding="async"
          />
        </div>

        {/* ── 统一暗化遮罩：移动端遮罩更浅，桌面端加深保证文字可读 ── */}
        <div
          className="pointer-events-none absolute inset-0 bg-black/50 sm:bg-black/62 md:bg-black/72"
          aria-hidden
        />

        {/* ── 顶部渐变：移动端覆盖比例缩小，避免和遮罩叠加过暗 ── */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[20%] bg-gradient-to-b from-background via-background/65 to-transparent sm:h-[28%] md:h-[35%] md:via-background/75"
          aria-hidden
        />

        {/* ── 评审协议 section ── */}
        <section className="relative border-t border-white/[0.04] px-6 py-14 sm:py-16 md:px-12 md:py-20 lg:py-24 xl:py-28">
          <div className="relative z-10 mx-auto w-full max-w-home text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-10 flex flex-col items-center md:mb-14"
            >
              <span className="font-label mb-2 block text-xs font-medium uppercase tracking-widest text-white/40 md:mb-3">
                Scoring Weight Matrix
              </span>
              <SectionTitleEnDecor
                titleZh="评审协议"
                titleEn="PROTOCOL"
                align="center"
                headlineClassName="text-white"
              />
            </motion.div>

            <div className="grid grid-cols-1 gap-12 overflow-visible sm:grid-cols-3 sm:gap-8 md:gap-12 lg:gap-16">
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
                  desc: "技术稳定性、打磨程度与执行质量。",
                  offset: 276
                }
              ].map((gauge, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.2 }}
                  className="flex min-w-0 flex-col items-center overflow-visible"
                >
                  <div className="flex w-full justify-center overflow-visible px-2 md:px-3">
                  <div className="relative box-content flex h-44 w-44 max-w-full shrink-0 items-center justify-center overflow-visible p-5 sm:h-48 sm:w-48 md:h-56 md:w-56 md:p-8 lg:h-60 lg:w-60">
                    <svg
                      className="h-full w-full shrink-0 -rotate-90 transform overflow-visible"
                      viewBox="0 0 256 256"
                      overflow="visible"
                    >
                      <defs>
                        <filter
                          id={`protocol-ring-glow-${idx}`}
                          x="-40%"
                          y="-40%"
                          width="180%"
                          height="180%"
                          colorInterpolationFilters="sRGB"
                        >
                          <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="3" />
                          <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>
                      <circle className="text-outline-variant/10" cx="128" cy="128" fill="transparent" r="110" stroke="currentColor" strokeWidth="2" />
                      <motion.circle
                        initial={{ strokeDashoffset: 690 }}
                        whileInView={{ strokeDashoffset: gauge.offset }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="text-primary-container opacity-80"
                        style={{ filter: `url(#protocol-ring-glow-${idx})` }}
                        cx="128" cy="128" fill="transparent" r="110" stroke="currentColor" strokeDasharray="690" strokeLinecap="round" strokeWidth="8"
                      />
                    </svg>
                    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-px overflow-visible px-2">
                      <span className="type-amount text-4xl font-bold leading-none text-white md:text-5xl">
                        {gauge.percent}%
                      </span>
                      <span className="text-[10px] font-medium uppercase leading-tight tracking-technical text-white/40">
                        权重比例
                      </span>
                    </div>
                  </div>
                  </div>
                  <div className="mt-2 flex w-full flex-col items-center gap-1 text-center md:mt-2.5 md:gap-1.5">
                    <h3 className="font-headline text-xl font-semibold leading-tight tracking-tight text-white sm:text-2xl md:text-3xl">
                      {gauge.label}
                    </h3>
                    <p className="font-body text-sm leading-relaxed text-white/70 md:text-base">
                      {gauge.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="relative border-t border-white/[0.06] px-6 pt-10 pb-[max(4.3rem,calc(env(safe-area-inset-bottom,0px)+3.6rem))] font-label text-[10px] font-medium uppercase tracking-technical sm:pt-12 md:px-12 md:pt-16 md:pb-[7.15rem]">
          <div
            className="mx-auto flex w-full max-w-home flex-col items-center justify-center text-white/45 [text-shadow:0_2px_12px_rgba(0,0,0,1),0_4px_32px_rgba(0,0,0,0.95),0_0_48px_rgba(0,0,0,0.8)]"
          >
            <div className="mb-5 text-center md:mb-6">
              © 2026 AI_GAME_CONTEST_PROTOCOL，保留所有权利。
            </div>
            <div className="flex flex-wrap justify-center gap-x-12 gap-y-3">
              <a href="#" className="footer-link-micro hover:text-primary/70">
                安全日志
              </a>
              <a href="#" className="footer-link-micro hover:text-primary/70">
                隐私缓冲
              </a>
              <a href="#" className="footer-link-micro hover:text-primary/70">
                同步条款
              </a>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
