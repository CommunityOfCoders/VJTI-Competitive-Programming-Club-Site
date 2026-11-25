"use client";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen } from "lucide-react";
import members from "@/json/members.json";
import { DAILY_CONFIG } from "@/lib/daily/config.mjs";

const EASE = [0.16, 1, 0.3, 1];

const all = Object.values(members);
const stats = [
  { label: "Members on the leaderboard", value: all.length },
  { label: "In the CP Club", value: all.filter((m) => m.inClub).length },
  { label: "Fresh problems every day", value: DAILY_CONFIG.slots.length },
  { label: "Platforms tracked", value: 4 },
];

const sections = [
  { href: "/leaderboard", title: "Leaderboard", text: "Codeforces and LeetCode ratings for every member, side by side." },
  { href: "/daily", title: "Daily questions", text: "Six Codeforces problems a day, with streaks and a points table." },
  { href: "/arena", title: "Battle arena", text: "Challenge another member to a live 1v1 on unsolved problems." },
  { href: "/contest", title: "Contests", text: "Every upcoming round on four platforms, and how the club placed." },
  { href: "/resources", title: "Resources", text: "Where to start, what to practice and how to approach contests." },
  { href: "/blogs", title: "Blogs", text: "Tutorials and write-ups by club members, from DP to trees." },
];

export default function Home() {
  const reduce = useReducedMotion();
  const rise = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 22 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, ease: EASE, delay },
        };

  return (
    <>
      <section className="relative flex min-h-[calc(100svh-78px)] items-center">
        <div className="container py-16">
          <motion.span className="eyebrow" {...rise(0.05)}>
            CP Club · VJTI · 2026-27
          </motion.span>

          <motion.h1 className="mt-6 text-[clamp(2.8rem,8.5vw,7rem)] font-bold leading-[0.95]" {...rise(0.15)}>
            Where algorithms
            <br />
            meet <span className="text-accent">excellence.</span>
          </motion.h1>

          <motion.p className="mt-7 max-w-xl text-lg leading-relaxed text-zinc-400" {...rise(0.3)}>
            VJTI&apos;s competitive programming community, run by Community of Coders. Solve problems, compete in
            contests and level up your problem-solving, together.
          </motion.p>

          <motion.div className="mt-10 flex flex-wrap gap-3" {...rise(0.42)}>
            <Link href="/leaderboard" className="btn">
              View the leaderboard <ArrowRight />
            </Link>
            <Link href="/resources" className="btn btn--ghost">
              <BookOpen /> Start learning
            </Link>
          </motion.div>

          <motion.dl className="home-stats" {...rise(0.55)}>
            {stats.map((s) => (
              <div key={s.label} className="home-stat">
                <dd className="home-stat__num">{s.value}</dd>
                <dt className="stat__label">{s.label}</dt>
              </div>
            ))}
          </motion.dl>
        </div>
      </section>

      <section className="container home-sections">
        <div className="sub-head">
          <span className="sub-head__num">06</span>
          <h2 className="sub-head__title">What&apos;s here</h2>
        </div>
        <div className="home-grid">
          {sections.map((s, i) => (
            <Link key={s.href} href={s.href} className="panel panel--hover home-card">
              <span className="home-card__num">{String(i + 1).padStart(2, "0")}</span>
              <span className="panel__title home-card__title">{s.title}</span>
              <span className="panel__text">{s.text}</span>
              <ArrowUpRight className="home-card__go" />
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
