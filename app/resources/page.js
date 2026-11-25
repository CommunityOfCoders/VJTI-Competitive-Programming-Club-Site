"use client";
import React, { useState } from "react";
import { ArrowUpRight, Copy, Check } from "lucide-react";
import Image from "next/image";

const PLAYLIST = "PLauivoElc3ggagradg8MfOZreCMmXMmJ-";

const platforms = [
  { name: "Codeforces", url: "https://codeforces.com/", note: "Rated rounds 2-3 times a week", logo: "https://sta.codeforces.com/s/44094/favicon-32x32.png" },
  { name: "LeetCode", url: "https://leetcode.com/", note: "Weekly and biweekly contests", logo: "https://leetcode.com/static/images/LeetCode_logo.png" },
  { name: "CodeChef", url: "https://www.codechef.com/", note: "Starters every Wednesday", logo: "https://www.codechef.com/favicon.ico" },
  { name: "AtCoder", url: "https://atcoder.jp/home", note: "Beginner Contest every Saturday", logo: "https://atcoder.jp/favicon.ico" },
  { name: "CSES", url: "https://cses.fi/register/", note: "The classic problem set, by topic", logo: "/images/cses.png" },
  {
    name: "HackerRank",
    url: "https://www.hackerrank.com/auth/login",
    note: "Interview-style practice",
    logo: "https://cdn.prod.website-files.com/66b6d7fd4d3e9cef94717176/6715d41d809c171b16ea5612_Hackerrank%20Cursor%20Favicon.png",
  },
];

const learningResources = [
  {
    topic: "Dynamic Programming",
    topics: ["DP"],
    resources: [
      { name: "AtCoder Educational DP Contest", url: "https://atcoder.jp/contests/dp", desc: "26 classic DP problems, A to Z" },
      { name: "LeetCode DP Study Plan", url: "https://leetcode.com/studyplan/dynamic-programming/", desc: "A structured DP learning path" },
    ],
  },
  {
    topic: "Graph Algorithms",
    topics: ["Graphs", "Trees"],
    resources: [
      { name: "CSES Graph Section", url: "https://cses.fi/problemset/list/", desc: "Classic graph problems" },
      { name: "Graph Theory Playlist", url: `https://www.youtube.com/watch?v=eQA-m22wjTQ&list=${PLAYLIST}`, desc: "Video tutorials on graphs" },
    ],
  },
  {
    topic: "Data Structures",
    topics: ["Trees", "Heaps", "Segment Trees"],
    resources: [
      { name: "CP-Algorithms", url: "https://cp-algorithms.com/", desc: "A complete guide to data structures and algorithms" },
      { name: "CSES Problem Set", url: "https://cses.fi/problemset/", desc: "Practice problems for every topic" },
    ],
  },
];

const practiceResources = [
  {
    title: "Rating-wise practice",
    resources: [
      { name: "CP-31 Sheet", url: "https://www.tle-eliminators.com/cp-sheet", desc: "A structured sheet, good for beginners" },
      { name: "Codeforces Problemset", url: "https://codeforces.com/problemset", desc: "Filter by difficulty" },
    ],
  },
  {
    title: "Topic-wise practice",
    resources: [
      { name: "CSES Problem Set", url: "https://cses.fi/problemset/", desc: "A strong collection, from basics to advanced" },
      { name: "Codeforces Problemset", url: "https://codeforces.com/problemset", desc: "Filter by topic tag" },
    ],
  },
];

const contests = [
  { level: "For beginners", list: ["CodeChef Starters (every Wednesday)", "Codeforces Div. 3 and Div. 4", "AtCoder Beginner Contest"] },
  { level: "Intermediate and advanced", list: ["Codeforces (all divisions)", "CodeChef Starters", "LeetCode Weekly and Biweekly"] },
];

const tips = [
  "Be consistent and don't skip contests.",
  "Upsolve at least 1-2 problems after every contest.",
  "Go through the contest afterwards and note your silly mistakes so you don't repeat them.",
];

const steps = [
  "Start studying the topics and keep practicing problems alongside.",
  "Start giving contests once you know the basics. Be consistent and patient.",
  "When you study a topic, solve plenty of problems on it before moving to the next.",
  "When stuck, try to debug it yourself first. If you still can't, read the editorial or ask for help.",
];

function SectionHead({ num, title, meta }) {
  return (
    <div className="sub-head">
      <span className="sub-head__num">{num}</span>
      <h2 className="sub-head__title">{title}</h2>
      {meta && <span className="sub-head__meta">{meta}</span>}
    </div>
  );
}

const Resources = () => {
  const [copiedKey, setCopiedKey] = useState(null);

  const copyToClipboard = async (url, key) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 2000);
    } catch {
      window.prompt("Copy this link:", url);
    }
  };

  const ResourceRow = ({ resource, copyKey }) => (
    <div className="rs-row">
      <a href={resource.url} target="_blank" rel="noopener noreferrer" className="rs-row__link">
        <span className="rs-row__name">
          {resource.name} <ArrowUpRight />
        </span>
        <span className="rs-row__desc">{resource.desc}</span>
      </a>
      <button
        onClick={() => copyToClipboard(resource.url, copyKey)}
        className={`icon-btn icon-btn--sm${copiedKey === copyKey ? " is-done" : ""}`}
        title="Copy link"
        aria-label={`Copy the ${resource.name} link`}
      >
        {copiedKey === copyKey ? <Check /> : <Copy />}
      </button>
    </div>
  );

  return (
    <div className="container page">
      <header className="page-head">
        <span className="eyebrow">Learn · Practice · Compete</span>
        <h1 className="page-title">
          The <span className="mark">roadmap.</span>
        </h1>
        <p className="page-lede">
          Everything the club points new members to: one playlist to start, the best topic guides and problem sets,
          and how to approach contests.
        </p>
      </header>

      {/* Featured playlist */}
      <section className="rs-section">
        <SectionHead num="01" title="Start here" meta="Featured playlist" />
        <div className="rs-feature">
          <div className="panel panel--clip">
            <div className="rs-video">
              <iframe
                src={`https://www.youtube.com/embed/videoseries?list=${PLAYLIST}`}
                title="Fundamentals and getting started playlist"
                frameBorder="0"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            <div className="rs-feature__body">
              <h3 className="panel__title">Fundamentals and getting started</h3>
              <p className="panel__text" style={{ marginTop: 6 }}>
                A great starting point to learn the fundamentals and begin solving problems.
              </p>
              <a
                href={`https://youtube.com/playlist?list=${PLAYLIST}`}
                target="_blank"
                rel="noopener noreferrer"
                className="link-arrow"
                style={{ marginTop: 14 }}
              >
                Open on YouTube <ArrowUpRight />
              </a>
            </div>
          </div>
          <div className="panel panel--pad">
            <span className="label">How to use it</span>
            <ul className="ticks" style={{ marginTop: 16 }}>
              <li>Watch the videos in order to build a strong foundation.</li>
              <li>Pause and solve the example problems alongside the videos.</li>
              <li>Revisit concepts you find hard, then practice related problems.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Topic-based learning */}
      <section className="rs-section">
        <SectionHead num="02" title="Learn by topic" />
        <div className="rs-topics">
          {learningResources.map((section) => (
            <div key={section.topic} className="panel panel--pad rs-topic">
              <div className="rs-topic__head">
                <h3 className="panel__title">{section.topic}</h3>
                <div className="chips" style={{ gap: 6 }}>
                  {section.topics.map((topic) => (
                    <span key={topic} className="tag tag--accent">{topic}</span>
                  ))}
                </div>
              </div>
              <div className="rs-rows">
                {section.resources.map((resource) => (
                  <ResourceRow key={resource.name} resource={resource} copyKey={`${section.topic}:${resource.name}`} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Practice */}
      <section className="rs-section">
        <SectionHead num="03" title="Practice" />
        <div className="rs-two">
          {practiceResources.map((section) => (
            <div key={section.title} className="panel panel--pad">
              <span className="label">{section.title}</span>
              <div className="rs-rows" style={{ marginTop: 10 }}>
                {section.resources.map((resource) => (
                  <ResourceRow key={resource.name} resource={resource} copyKey={`${section.title}:${resource.name}`} />
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="note" style={{ marginTop: 16 }}>
          <strong>You need both.</strong> When you study a topic, practice topic-wise problems to lock it in. Alongside,
          keep solving random rating-wise problems.
        </p>
      </section>

      {/* Platforms */}
      <section className="rs-section">
        <SectionHead num="04" title="Where to compete" />
        <div className="rs-platforms">
          {platforms.map((platform) => (
            <a
              key={platform.name}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className="panel panel--hover rs-platform"
            >
              <Image width={32} height={32} src={platform.logo} alt="" className="rs-platform__logo" loading="lazy" />
              <span style={{ minWidth: 0 }}>
                <span className="panel__title" style={{ display: "block" }}>{platform.name}</span>
                <span className="rs-row__desc">{platform.note}</span>
              </span>
              <ArrowUpRight className="rs-platform__go" />
            </a>
          ))}
        </div>
      </section>

      {/* Contest strategy */}
      <section className="rs-section">
        <SectionHead num="05" title="Contest strategy" />
        <div className="rs-two">
          {contests.map((contest) => (
            <div key={contest.level} className="panel panel--pad">
              <span className="label">{contest.level}</span>
              <ul className="ticks" style={{ marginTop: 16 }}>
                {contest.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="note" style={{ marginTop: 16 }}>
          <strong>Contest tips</strong>
          <ul className="ticks" style={{ marginTop: 12 }}>
            {tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* How to proceed */}
      <section className="rs-section">
        <SectionHead num="06" title="How to proceed" />
        <ol className="rs-steps">
          {steps.map((step, i) => (
            <li key={i} className="rs-step">
              <span className="rs-step__n">{String(i + 1).padStart(2, "0")}</span>
              <p>{step}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
};

export default Resources;
