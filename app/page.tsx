"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  Shield,
  Lock,
  Zap,
  Eye,
  Trash2,
  Timer,
  ArrowRight,
  CheckCircle2,
  Key,
  FileText,
  Users,
} from "lucide-react";
import { BlurFade } from "@/components/magic/BlurFade";
import { ShimmerButton } from "@/components/magic/ShimmerButton";
import { BorderBeam } from "@/components/magic/BorderBeam";

const HeroVault = dynamic(
  () => import("@/components/3d/HeroVault").then((m) => ({ default: m.HeroVault })),
  { ssr: false, loading: () => <div className="w-full h-full" /> }
);

const WebGLBackground = dynamic(
  () => import("@/components/3d/WebGLBackground").then((m) => ({ default: m.WebGLBackground })),
  { ssr: false }
);

// ─── Feature Cards ──────────────────────────────────────────────────────────
const features = [
  {
    icon: Lock,
    title: "AES-256-CBC Encryption",
    desc: "Military-grade encryption at rest. The database sees only encrypted gibberish — never your actual secret.",
    color: "emerald",
  },
  {
    icon: Eye,
    title: "One-Time View",
    desc: "The moment your secret is revealed, it is permanently destroyed from the server. No second chances.",
    color: "indigo",
  },
  {
    icon: Timer,
    title: "Custom Expiry",
    desc: "Set validity periods from minutes to hours. Links auto-expire even if never opened.",
    color: "amber",
  },
  {
    icon: Shield,
    title: "Zero-Knowledge",
    desc: "The encryption key lives only in the app environment. Even a database breach reveals nothing useful.",
    color: "emerald",
  },
  {
    icon: Trash2,
    title: "Burn on Read",
    desc: "Atomic delete-on-retrieve. Race conditions are handled — only one person can ever see the secret.",
    color: "danger",
  },
  {
    icon: Zap,
    title: "Instant Sharing",
    desc: "Generate a shareable link in seconds. No accounts, no sign-ups, no friction.",
    color: "indigo",
  },
];

const colorMap: Record<string, string> = {
  emerald: "text-emerald-DEFAULT border-emerald-DEFAULT/20 bg-emerald-DEFAULT/5 hover:border-emerald-DEFAULT/40",
  indigo: "text-indigo-DEFAULT border-indigo-DEFAULT/20 bg-indigo-DEFAULT/5 hover:border-indigo-DEFAULT/40",
  amber: "text-amber-DEFAULT border-amber-DEFAULT/20 bg-amber-DEFAULT/5 hover:border-amber-DEFAULT/40",
  danger: "text-danger border-danger/20 bg-danger/5 hover:border-danger/40",
};

// ─── How It Works ───────────────────────────────────────────────────────────
const steps = [
  {
    num: "01",
    icon: FileText,
    title: "Write your secret",
    desc: "Type your password, API key, or message. Set an expiry time.",
  },
  {
    num: "02",
    icon: Key,
    title: "Get a secure link",
    desc: "Your text is AES-256 encrypted and stored. A unique link is generated.",
  },
  {
    num: "03",
    icon: Users,
    title: "Share the link",
    desc: "Send it to the recipient. Once they open it, the secret is gone forever.",
  },
];

// ─── Use Cases ───────────────────────────────────────────────────────────────
const useCases = [
  { title: "Password Sharing", desc: "Send temporary passwords to new employees without leaving email trails." },
  { title: "API Key Distribution", desc: "Share environment variables with teammates securely — no git exposure." },
  { title: "Confidential HR Notes", desc: "Sensitive salary figures or personal data that must not persist." },
];

export default function LandingPage() {
  return (
    <div className="relative">
      <WebGLBackground />

      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 pt-10 pb-20 overflow-hidden">
        {/* 3D Orb */}
        <div className="absolute inset-0 flex items-center justify-center opacity-60 pointer-events-none">
          <div className="w-[500px] h-[500px]">
            <HeroVault />
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <BlurFade delay={0.1}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-emerald border border-emerald-DEFAULT/20 text-emerald-DEFAULT text-sm font-medium mb-8">
              <span className="w-2 h-2 bg-emerald-DEFAULT rounded-full animate-pulse" />
              AES-256-CBC Encrypted · Zero-Knowledge · Burn-on-Read
            </div>
          </BlurFade>

          <BlurFade delay={0.2}>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-[0.95]">
              <span className="text-white">This Message</span>
              <br />
              <span className="text-gradient-aurora">Will Self-Destruct</span>
            </h1>
          </BlurFade>

          <BlurFade delay={0.35}>
            <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
              Share passwords, API keys, and confidential notes through encrypted,
              one-time links that permanently erase themselves the moment they're read.
              <span className="text-white"> No logs. No traces. No second chances.</span>
            </p>
          </BlurFade>

          <BlurFade delay={0.5}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/new">
                <ShimmerButton className="text-base px-8 py-4 rounded-xl">
                  <Zap className="w-5 h-5" />
                  Create a Secret
                  <ArrowRight className="w-4 h-4" />
                </ShimmerButton>
              </Link>
              <motion.a
                href="#how-it-works"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-8 py-4 rounded-xl glass border border-white/10 text-muted hover:text-white hover:border-white/20 transition-all duration-300 text-base font-medium"
              >
                How it works
              </motion.a>
            </div>
          </BlurFade>

          {/* Stats */}
          <BlurFade delay={0.65}>
            <div className="flex flex-wrap justify-center gap-8 mt-16 text-center">
              {[
                { label: "Encryption Strength", value: "256-bit" },
                { label: "Secrets Destroyed", value: "∞" },
                { label: "Data Retained", value: "Zero" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-gradient-emerald">{stat.value}</div>
                  <div className="text-sm text-muted mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </BlurFade>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      </section>

      {/* ─── FEATURES GRID ───────────────────────────────────────────── */}
      <section className="relative px-6 py-20 max-w-6xl mx-auto">
        <BlurFade>
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for <span className="text-gradient-emerald">Serious Security</span>
            </h2>
            <p className="text-muted max-w-xl mx-auto">
              Every feature is designed around one principle: your secret should never outlive its purpose.
            </p>
          </div>
        </BlurFade>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <BlurFade key={f.title} delay={i * 0.08}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300 }}
                className={`relative p-6 rounded-2xl border transition-all duration-300 cursor-default ${colorMap[f.color]}`}
              >
                <f.icon className="w-7 h-7 mb-4" strokeWidth={1.5} />
                <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            </BlurFade>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────────────── */}
      <section id="how-it-works" className="relative px-6 py-20 max-w-5xl mx-auto">
        <BlurFade>
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Three Steps to <span className="text-gradient-emerald">Perfect Privacy</span>
            </h2>
          </div>
        </BlurFade>

        <div className="relative flex flex-col md:flex-row gap-6 items-stretch">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-DEFAULT/20 to-transparent -translate-y-1/2 z-0" />

          {steps.map((step, i) => (
            <BlurFade key={step.num} delay={i * 0.15} className="flex-1">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative z-10 glass rounded-2xl p-8 border border-white/5 hover:border-emerald-DEFAULT/20 transition-all duration-300"
              >
                <BorderBeam duration={12} delay={i * 2} />
                <div className="text-5xl font-black text-gradient-emerald mb-4 opacity-30">{step.num}</div>
                <step.icon className="w-7 h-7 text-emerald-DEFAULT mb-4" strokeWidth={1.5} />
                <h3 className="text-white font-bold text-xl mb-2">{step.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            </BlurFade>
          ))}
        </div>
      </section>

      {/* ─── USE CASES ───────────────────────────────────────────────── */}
      <section className="relative px-6 py-16 max-w-5xl mx-auto">
        <BlurFade>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">
              Real-World <span className="text-gradient-emerald">Use Cases</span>
            </h2>
          </div>
        </BlurFade>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {useCases.map((uc, i) => (
            <BlurFade key={uc.title} delay={i * 0.1}>
              <div className="glass rounded-xl p-6 border border-white/5 hover:border-emerald-DEFAULT/15 transition-all duration-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-DEFAULT mb-3" strokeWidth={2} />
                <h4 className="text-white font-semibold mb-2">{uc.title}</h4>
                <p className="text-muted text-sm leading-relaxed">{uc.desc}</p>
              </div>
            </BlurFade>
          ))}
        </div>
      </section>

      {/* ─── CTA BANNER ──────────────────────────────────────────────── */}
      <section className="relative px-6 py-20 max-w-4xl mx-auto text-center">
        <BlurFade>
          <div className="relative glass rounded-3xl p-12 border border-white/5 overflow-hidden">
            <BorderBeam duration={20} colorFrom="#10b981" colorTo="#6366f1" />
            <div className="absolute inset-0 bg-gradient-radial from-emerald-DEFAULT/5 via-transparent to-transparent pointer-events-none" />
            <Shield className="w-12 h-12 text-emerald-DEFAULT mx-auto mb-6 opacity-80" strokeWidth={1.5} />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Share a Secret?
            </h2>
            <p className="text-muted mb-8 max-w-md mx-auto">
              Create your first encrypted, self-destructing link in under 30 seconds.
            </p>
            <Link href="/new">
              <ShimmerButton className="text-base px-10 py-4 rounded-xl mx-auto">
                <Zap className="w-5 h-5" />
                Create Secret Now
                <ArrowRight className="w-4 h-4" />
              </ShimmerButton>
            </Link>
          </div>
        </BlurFade>
      </section>
    </div>
  );
}

