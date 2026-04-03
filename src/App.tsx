/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Timer, Shield, Globe } from "lucide-react";
import { PointerFx } from "./components/PointerFx";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const HERO_VIDEO_SRC = `${import.meta.env.BASE_URL}hero-bg-ai-contest_2.mp4`;

export default function App() {
  const heroVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = heroVideoRef.current;
    if (!el) return;
    const kick = () => {
      el.play().catch(() => {});
    };
    kick();
    el.addEventListener("loadeddata", kick);
    return () => el.removeEventListener("loadeddata", kick);
  }, []);

  return (
    <div className="relative min-h-screen">
      <PointerFx />
      <div className="noise-overlay" />
      
      {/* Background Atmosphere */}
      <div className="fixed inset-0 -z-10 bg-background">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-center items-center px-6 md:px-10 py-6 glass-panel border-b border-white/5">
        <div className="text-xl font-black tracking-tighter text-primary font-headline">AI_GAME_2026</div>
        <div className="absolute right-6 md:right-10 flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
          <span className="text-[10px] text-primary/60 font-label tracking-technical uppercase">SYS_STABLE</span>
        </div>
      </header>

      <main>
        {/* Hero Section — 全屏循环视频 + 遮罩 + 文案 */}
        <section className="relative isolate min-h-screen min-h-[100svh] w-full overflow-hidden bg-background flex flex-col px-6 pb-12 text-center pt-20 md:pb-16">
          <video
            ref={heroVideoRef}
            className="hero-bg-video pointer-events-none absolute inset-0 z-0 h-full min-h-full w-full min-w-full object-cover object-center"
            src={HERO_VIDEO_SRC}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
          />
          <div
            className="hero-copy-scrim pointer-events-none absolute inset-0 z-[1]"
            aria-hidden
          />
          <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-center py-10 md:py-14">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="mx-auto flex w-full max-w-6xl flex-col items-center"
          >
            <motion.div 
              variants={fadeInUp}
              className="inline-flex items-center space-x-3 mb-8 bg-primary/10 border border-primary/20 px-5 py-2 rounded-full backdrop-blur-md"
            >
              <div className="w-2 h-2 rounded-full bg-primary-container animate-pulse shadow-[0_0_10px_rgba(0,240,255,0.8)]" />
              <span className="font-label text-primary text-[10px] tracking-technical uppercase">协议状态: ACTIVE_V2.026</span>
            </motion.div>

            <motion.h1 
              variants={fadeInUp}
              className="hero-title-over-video font-headline font-black text-4xl md:text-7xl lg:text-[7rem] leading-[0.88] tracking-tighter mb-8 max-w-5xl"
            >
              <span className="text-on-background">AI游戏设计大赛</span>
            </motion.h1>

            <motion.div 
              variants={fadeInUp}
              className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-16 mt-6"
            >
              <div className="flex flex-col items-center">
                <span className="font-label text-secondary text-xs uppercase tracking-technical mb-1.5">冠军赏金</span>
                <div className="flex items-baseline gap-2 md:gap-2.5">
                  <span className="type-amount text-7xl md:text-9xl font-black text-primary font-headline tracking-tighter drop-shadow-[0_4px_32px_rgba(0,0,0,0.9)]">10,000</span>
                  <span className="text-[2.5rem] md:text-[3rem] font-bold text-primary font-label tracking-wide leading-none self-end translate-y-[-0.06em]">U</span>
                </div>
              </div>

              <div className="flex flex-col items-center bg-surface-container-high/40 backdrop-blur-xl p-8 border border-white/5 border-t-4 border-t-primary shadow-2xl rounded-2xl">
                <span className="font-label text-secondary text-[10px] uppercase tracking-technical mb-3 leading-none">投递倒计时</span>
                <div className="flex items-center space-x-6">
                  <div className="flex flex-col items-center gap-1">
                    <span className="type-amount text-3xl font-black font-label text-on-background tracking-wide">2026.04.26</span>
                    <span className="text-[9px] text-primary/80 uppercase tracking-technical leading-tight">投稿截止日</span>
                  </div>
                  <div className="w-px h-12 bg-outline-variant/30" />
                  <div className="flex flex-col items-center">
                    <Timer className="text-primary w-10 h-10 animate-pulse" />
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              variants={fadeInUp}
              className="mt-16 md:mt-20 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8"
            >
              <a
                href="https://sundaycreative.atlassian.net/wiki/spaces/AI/folder/270106670?atlOrigin=eyJpIjoiM2E4ZTQyZTg0MTYxNGUyYWI3YzUyNjhhNzE1N2IzMDAiLCJwIjoiYyJ9"
                target="_blank"
                rel="noopener noreferrer"
                className="metal-btn text-on-primary-fixed font-black text-lg px-14 py-5 rounded-xl shadow-[0_0_40px_rgba(0,240,255,0.4)] hover:scale-105 active:scale-95 transition-all duration-300 tracking-sophisticated uppercase inline-block text-center leading-tight"
              >
                立即参赛
              </a>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 1 }}
              className="mt-24 flex flex-col items-center md:mt-32 lg:mt-40 animate-bounce"
            >
              <span className="font-label mb-4 text-[10px] uppercase tracking-technical text-secondary [text-shadow:0_1px_8px_rgba(0,0,0,0.9),0_0_20px_rgba(14,14,16,0.8)]">
                向下滚动阅读投稿指南
              </span>
              <div className="h-16 w-px bg-gradient-to-b from-primary to-transparent" />
            </motion.div>
          </motion.div>
          </div>
        </section>

        {/* Rewards Section */}
        <section className="py-40 px-6 md:px-10 bg-surface-container-lowest/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center mb-14"
            >
              <h2 className="font-headline font-black text-5xl md:text-6xl text-on-background tracking-tighter tracking-sophisticated mb-3 uppercase leading-[0.92]">奖励协议 // REWARDS</h2>
              <p className="text-secondary font-body max-w-2xl text-lg type-body-compact tracking-wide mx-auto">
                顶级表现值得精英级回报。赏金池已按战术等级分为六个级别。
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Rank 1 */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="md:col-span-2 group relative bg-surface-container-high/60 backdrop-blur-md p-10 md:p-12 flex flex-col items-center justify-center gap-5 overflow-hidden transition-all duration-500 hover:bg-surface-container-high border border-primary/10 hover:border-primary/50 rounded-2xl"
              >
                <div className="absolute top-0 right-0 p-4 font-label text-[120px] leading-none opacity-[0.03] font-black">R1</div>
                <div className="text-center space-y-2">
                  <span className="font-label text-primary text-sm tracking-technical block uppercase leading-tight">RANK_01 / 第一名</span>
                  <h3 className="text-5xl font-headline font-extrabold text-on-background tracking-tight leading-[1.05]">卓越创新奖</h3>
                </div>
                <div className="flex items-baseline justify-center gap-2 md:gap-2.5">
                  <span className="type-amount text-7xl md:text-8xl font-black text-primary font-headline tracking-tighter text-glow">10,000</span>
                  <span className="text-[2.25rem] md:text-[2.5rem] font-bold text-primary font-label tracking-wide leading-none self-end translate-y-[-0.05em]">U</span>
                </div>
                <div className="w-32 h-1 bg-primary/30 group-hover:w-full transition-all duration-700 mt-1" />
              </motion.div>

              {/* Rank 2-3 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="group bg-surface-container-high/60 backdrop-blur-md p-8 md:p-10 flex flex-col items-center justify-center gap-4 transition-all duration-500 hover:bg-surface-container-high border border-outline-variant/10 hover:border-primary/30 rounded-2xl"
              >
                <div className="text-center space-y-1.5">
                  <span className="font-label text-secondary text-xs tracking-technical block uppercase leading-tight">RANK_02 / 第二名</span>
                  <h3 className="text-3xl font-headline font-bold text-on-background tracking-tight leading-snug">优秀创意奖</h3>
                </div>
                <div className="flex items-baseline justify-center gap-1.5">
                  <span className="type-amount text-5xl font-black text-on-background font-headline tracking-tighter">5,000</span>
                  <span className="text-[2rem] font-bold text-secondary font-label tracking-wide leading-none self-end translate-y-[-0.05em]">U</span>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="group bg-surface-container-high/60 backdrop-blur-md p-8 md:p-10 flex flex-col items-center justify-center gap-4 transition-all duration-500 hover:bg-surface-container-high border border-outline-variant/10 hover:border-primary/30 rounded-2xl"
              >
                <div className="text-center space-y-1.5">
                  <span className="font-label text-secondary text-xs tracking-technical block uppercase leading-tight">RANK_03 / 第三名</span>
                  <h3 className="text-3xl font-headline font-bold text-on-background tracking-tight leading-snug">专业实践奖</h3>
                </div>
                <div className="flex items-baseline justify-center gap-1.5">
                  <span className="type-amount text-5xl font-black text-on-background font-headline tracking-tighter">3,000</span>
                  <span className="text-[2rem] font-bold text-secondary font-label tracking-wide leading-none self-end translate-y-[-0.05em]">U</span>
                </div>
              </motion.div>

              {/* Smaller prizes */}
              <div className="lg:col-span-4 flex flex-col md:flex-row justify-center gap-6">
                {[
                  { rank: "RANK_04 / 第四名" },
                  { rank: "RANK_05 / 第五名" },
                  { rank: "RANK_06 / 第六名" }
                ].map((prize, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    className="flex-1 min-w-[280px] max-w-[400px] group bg-surface-container-high/60 backdrop-blur-md p-8 flex flex-col items-center justify-center gap-2 transition-all duration-500 hover:bg-surface-container-high border border-outline-variant/10 hover:border-primary/30 rounded-2xl"
                  >
                    <span className="font-label text-secondary text-xs tracking-technical uppercase leading-tight">{prize.rank}</span>
                    <h3 className="text-lg font-headline font-bold text-on-background tracking-tight leading-snug">入围奖（精英奖）</h3>
                    <div className="flex items-baseline justify-center gap-1.5 pt-0.5">
                      <span className="type-amount text-4xl font-black text-on-background font-headline tracking-tighter">1,500</span>
                      <span className="text-[2rem] font-bold text-secondary font-label tracking-wide leading-none self-end translate-y-[-0.05em]">U</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Guidelines Section */}
        <section className="py-40 px-6 md:px-10 bg-surface-container-lowest/90 backdrop-blur-sm relative overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="font-label text-primary text-sm tracking-technical uppercase mb-2 block leading-tight">Operation Protocol</span>
              <h2 className="font-headline font-black text-5xl md:text-7xl text-on-background tracking-tighter tracking-sophisticated uppercase leading-[0.92]">投稿指南 // GUIDELINES</h2>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 space-y-8">
                {/* Card 01 */}
                <motion.div 
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="bg-surface-container-high/60 backdrop-blur-xl border border-white/5 rounded-2xl p-8 md:p-12 group hover:border-primary/30 transition-all duration-500"
                >
                  <div className="flex items-start gap-6">
                    <span className="font-label text-primary font-black text-4xl opacity-50">01</span>
                    <div>
                      <h3 className="font-headline text-2xl font-bold text-on-background mb-3 tracking-tight leading-snug">一、 投稿阵地：sundaycreative 空间</h3>
                      <p className="text-secondary text-lg type-body-compact font-body">
                        发布至公司内部 <span className="text-primary font-bold">sundaycreative 空间</span> 的指定活动看板。
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Card 02 */}
                <motion.div 
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="bg-surface-container-high/60 backdrop-blur-xl border border-white/5 rounded-2xl p-8 md:p-12 group hover:border-primary/30 transition-all duration-500"
                >
                  <div className="flex items-start gap-6">
                    <span className="font-label text-primary font-black text-4xl opacity-50">02</span>
                    <div className="w-full">
                      <h3 className="font-headline text-2xl font-bold text-on-background mb-4 tracking-tight leading-snug">二、 安全与合规（涉敏评估协议）</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-black/20 p-6 rounded-xl border border-white/5">
                          <div className="flex items-center gap-2 mb-4">
                            <Globe className="text-primary w-4 h-4" />
                            <span className="font-label text-[10px] text-primary tracking-technical uppercase">非敏感 / 公开</span>
                          </div>
                          <p className="text-secondary text-sm type-body-compact">若作品内容不涉及公司核心机密产品或数据，可自行部署上线，最后把上线地址发布于公司内部空间 <span className="text-primary font-bold">sundaycreative</span>。</p>
                        </div>
                        <div className="bg-primary/5 p-6 rounded-xl border border-primary/10">
                          <div className="flex items-center gap-2 mb-4">
                            <Shield className="text-primary w-4 h-4" />
                            <span className="font-label text-[10px] text-primary tracking-technical uppercase">敏感内容 / 安全托底</span>
                          </div>
                          <p className="text-secondary text-sm type-body-compact">存放在本地文件或 Lola 服务端，并联系管理员寻求 Server 端协助。</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="lg:col-span-5 space-y-8">
                {/* Card 03 */}
                <motion.div 
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="bg-surface-container-high/60 backdrop-blur-xl border border-white/5 rounded-2xl p-8 md:p-10 group hover:border-primary/30 transition-all duration-500 h-full"
                >
                  <div className="flex items-start gap-6">
                    <span className="font-label text-primary font-black text-4xl opacity-50">03</span>
                    <div>
                      <h3 className="font-headline text-2xl font-bold text-on-background mb-4 tracking-tight leading-snug">三、 提交清单：Creator’s Log</h3>
                      <ul className="space-y-3.5">
                        {[
                          { label: "游戏名片", id: "TITLE_ID" },
                          { label: "玩法说明", id: "MECH_DATA" },
                          { label: "AI 进化论", id: "EVO_LOG" },
                          { label: "协同过程", id: "CO-OP_RPT" }
                        ].map((item, idx) => (
                          <li key={idx} className="flex items-center gap-4 group/item">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                            <span className="text-on-background font-bold tracking-wide">{item.label}</span>
                            <span className="text-[10px] text-secondary font-label ml-auto opacity-40">{item.id}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Card 04 */}
              <div className="lg:col-span-12">
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-surface-container-high/60 backdrop-blur-xl border border-primary/20 rounded-2xl p-8 group hover:bg-surface-container-high transition-all duration-500"
                >
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                      <span className="font-label text-primary font-black text-4xl opacity-50">04</span>
                      <h3 className="font-headline text-2xl font-bold text-on-background tracking-tight leading-snug">四、 关键时刻 (Countdown)</h3>
                    </div>
                    <div className="flex flex-wrap justify-center gap-12">
                      <div className="text-center">
                        <span className="font-label text-[10px] text-secondary tracking-technical uppercase mb-1 block leading-tight">开启时间</span>
                        <span className="text-xl font-black text-on-background tracking-wide uppercase leading-tight">即刻 // NOW</span>
                      </div>
                      <div className="w-px h-10 bg-outline-variant/20 hidden md:block" />
                      <div className="text-center">
                        <span className="font-label text-[10px] text-primary tracking-technical uppercase mb-1 block leading-tight">截稿日期</span>
                        <span className="type-amount text-xl font-black text-primary tracking-wide">2026.04.26 23:59</span>
                      </div>
                      <div className="w-px h-10 bg-outline-variant/20 hidden md:block" />
                      <div className="text-center">
                        <span className="font-label text-[10px] text-secondary tracking-technical uppercase mb-1 block leading-tight">评选时刻</span>
                        <span className="text-xl font-black text-on-background tracking-wide leading-tight">4月底</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Evaluation Protocol */}
        <section className="relative py-48 px-6 md:px-10 bg-transparent overflow-hidden">
          <div className="absolute inset-0 flex justify-center items-center opacity-[0.03] pointer-events-none">
            <span className="text-[200px] md:text-[400px] lg:text-[500px] font-black font-headline tracking-tighter select-none">PROTOCOL</span>
          </div>
          
          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20 md:mb-24"
            >
              <span className="font-label text-primary-container text-sm tracking-technical uppercase mb-3 block leading-tight">评分权重矩阵 // MATRIX</span>
              <h2 className="font-headline font-black text-5xl md:text-7xl text-on-background tracking-tighter tracking-sophisticated leading-[0.92]">评审协议 / PROTOCOL</h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-14 lg:gap-20 text-center">
              {[
                { label: "创新意识", percent: 40, desc: "先锋概念与新颖的 AI 整合机制应用。", offset: 276 },
                { label: "趣味性", percent: 30, desc: "交互参与度与游戏叙事深度。", offset: 483 },
                { label: "完成度", percent: 30, desc: "技术稳定性、打磨程度与执行质量。", offset: 483 }
              ].map((gauge, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.2 }}
                  className="flex flex-col items-center"
                >
                  <div className="relative w-64 h-64 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90 filter drop-shadow-[0_0_20px_rgba(0,240,255,0.2)]">
                      <circle className="text-outline-variant/10" cx="128" cy="128" fill="transparent" r="110" stroke="currentColor" strokeWidth="2" />
                      <motion.circle 
                        initial={{ strokeDashoffset: 690 }}
                        whileInView={{ strokeDashoffset: gauge.offset }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="text-primary-container drop-shadow-[0_0_15px_rgba(0,240,255,0.6)]" 
                        cx="128" cy="128" fill="transparent" r="110" stroke="currentColor" strokeDasharray="690" strokeLinecap="round" strokeWidth="10" 
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center gap-0.5">
                      <span className="type-amount text-5xl font-black font-label text-on-background">{gauge.percent}%</span>
                      <span className="text-[10px] text-secondary uppercase tracking-technical leading-tight">权重比例</span>
                    </div>
                  </div>
                  <h3 className="mt-8 font-headline font-black text-3xl text-primary tracking-wide leading-tight">{gauge.label}</h3>
                  <p className="mt-2 text-secondary text-base font-body type-body-compact tracking-wide max-w-[280px]">{gauge.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-48 px-6 md:px-10 bg-surface-container-low/90 backdrop-blur-md border-t border-white/5">
          <div className="max-w-4xl mx-auto text-center flex flex-col items-center">

            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="mb-16 inline-block"
            >
              <div className="w-40 h-40 rounded-full mx-auto border-4 border-primary/20 overflow-hidden shadow-[0_0_50px_rgba(0,240,255,0.2)]">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuF44Aa-bVvEYGmoEprtZA7WF7_lg6bQrV14REk7FuGRE0nDXd3MsySn3OQ2OggWvGt7PnIpxbJTq0_-LgLBz8uaIdzGHvvnKIoyh0dErQdQGVEQiHmJVuU4NXw_99LAJ0wQx0FgCOiAF7lxQLyK7QQFUAmoNV0YDlZUWv1baHFandtnrPayP2rMq7f288Gw67vAzT4X1Kx-skeuYtMpqJQW4ZaAYFe_3-OJEIfGovScdfAJBhFwBwJa_MkkFTUhVzktoXdcnI7IYm" 
                  alt="futuristic circuit board" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-headline font-black text-5xl md:text-7xl text-on-background mb-6 tracking-tighter leading-[0.92]"
            >
              下一次惊艳，由你定义
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-secondary text-xl md:text-2xl mb-12 font-body type-body-compact tracking-wide max-w-3xl space-y-2"
            >
              <span className="block">小体量，大创意，高完成。</span>
              <span className="block">2026 协议开启，静候佳作。</span>
            </motion.p>
            <motion.a
              href="https://sundaycreative.atlassian.net/wiki/spaces/AI/folder/270106670"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="metal-btn text-on-primary-fixed font-black text-2xl px-16 md:px-20 py-6 md:py-8 rounded-2xl shadow-[0_20px_60px_rgba(0,240,255,0.3)] uppercase tracking-sophisticated leading-tight inline-block text-center"
            >
              启动上传流
            </motion.a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface px-6 md:px-10 py-16 flex flex-col items-center justify-center border-t border-white/5 text-secondary/40 font-label text-[10px] tracking-technical uppercase">
        <div className="mb-8 text-center">© 2026 AI_GAME_CONTEST_PROTOCOL. 保留所有权利.</div>
        <div className="flex space-x-12">
          <a href="#" className="hover:text-primary transition-colors">安全日志</a>
          <a href="#" className="hover:text-primary transition-colors">隐私缓冲</a>
          <a href="#" className="hover:text-primary transition-colors">同步条款</a>
        </div>
      </footer>
    </div>
  );
}
