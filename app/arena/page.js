"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Swords, AlertCircle, ArrowRight, LoaderCircle } from "lucide-react";
import axios from "axios";

const TAGS = [
  { value: "all", label: "Any topic" },
  { value: "implementation", label: "Implementation" },
  { value: "greedy", label: "Greedy" },
  { value: "math", label: "Math" },
  { value: "dp", label: "Dynamic programming" },
  { value: "data structures", label: "Data structures" },
  { value: "brute force", label: "Brute force" },
  { value: "constructive algorithms", label: "Constructive algorithms" },
  { value: "sortings", label: "Sorting" },
  { value: "two pointers", label: "Two pointers" },
  { value: "binary search", label: "Binary search" },
];

const RULES = [
  "Problems are picked so that neither player has solved them before.",
  "They stay locked behind a shared countdown until the match starts.",
  "Solve them on Codeforces during the match window.",
  "1 point per problem, plus 0.5 to whoever solves it first.",
  "No database: the match is a signed link, checked against the Codeforces API.",
];

function PlayerCard({ n, role, value, onChange, members }) {
  return (
    <div className={`panel panel--pad ar-player${n === 1 ? " ar-player--one" : ""}`}>
      <div className="ar-player__head">
        <span className="ar-player__num">P{n}</span>
        <span className="label">{role}</span>
      </div>
      <label className="label" htmlFor={`p${n}`} style={{ marginBottom: 8 }}>
        Codeforces handle
      </label>
      <input
        id={`p${n}`}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. tourist"
        className="field"
        autoComplete="off"
        spellCheck={false}
        required
      />
      {members.length > 0 && (
        <select
          onChange={(e) => e.target.value && onChange(e.target.value)}
          value={members.some((m) => m.cf_username === value) ? value : ""}
          className="field"
          style={{ marginTop: 10 }}
          aria-label={`Pick player ${n} from the club`}
        >
          <option value="">Or pick from the club</option>
          {members.map((m) => (
            <option key={m.id} value={m.cf_username}>
              {m.name} ({m.cf_username}) · {m.year}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

export default function ArenaLobby() {
  const router = useRouter();
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  // Form state
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [minRating, setMinRating] = useState(900);
  const [maxRating, setMaxRating] = useState(1400);
  const [tag, setTag] = useState("all");
  const [count, setCount] = useState(3);
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [startDelaySeconds, setStartDelaySeconds] = useState(60); // 1 min, time to share the link

  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function loadMembers() {
      try {
        const res = await axios.get("/api/arena/members");
        if (res.data?.success) {
          setMembers(res.data.members);
          if (res.data.members.length >= 2) {
            setP1(res.data.members[0].cf_username);
            setP2(res.data.members[1].cf_username);
          }
        }
      } catch (err) {
        console.error("Failed to load members:", err);
      } finally {
        setLoadingMembers(false);
      }
    }
    loadMembers();
  }, []);

  const handleStartBattle = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!p1.trim() || !p2.trim()) {
      setErrorMsg("Enter a Codeforces handle for both players.");
      return;
    }
    if (p1.trim().toLowerCase() === p2.trim().toLowerCase()) {
      setErrorMsg("Player 1 and Player 2 can't be the same handle.");
      return;
    }
    if (Number(minRating) > Number(maxRating)) {
      setErrorMsg("The minimum rating can't be higher than the maximum.");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await axios.post("/api/arena/generate", {
        p1: p1.trim(),
        p2: p2.trim(),
        minRating: Number(minRating),
        maxRating: Number(maxRating),
        tag: tag === "all" ? "" : tag,
        count: Number(count),
        durationMinutes: Number(durationMinutes),
        startDelaySeconds: Number(startDelaySeconds),
      });

      if (res.data?.success && res.data?.token) {
        router.push(`/arena/match?token=${encodeURIComponent(res.data.token)}`);
      } else {
        setErrorMsg(res.data?.error || "Could not set up the match.");
        setIsGenerating(false);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message || "Could not set up the match.");
      setIsGenerating(false);
    }
  };

  return (
    <div className="container page">
      <header className="page-head">
        <span className="eyebrow">1v1 Battle Arena</span>
        <h1 className="page-title">
          Head-to-head <span className="mark">duel.</span>
        </h1>
        <p className="page-lede">
          Challenge another member to a ThemeCP-style live battle. Same problems, same clock, verdicts read straight
          from Codeforces.
        </p>
      </header>

      <div className="ar-layout">
        <form onSubmit={handleStartBattle} className="ar-form">
          {errorMsg && (
            <div className="alert" role="alert">
              <AlertCircle />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="ar-players">
            <PlayerCard n={1} role="Host" value={p1} onChange={setP1} members={members} />
            <span className="ar-vs" aria-hidden="true">vs</span>
            <PlayerCard n={2} role="Challenger" value={p2} onChange={setP2} members={members} />
          </div>

          <div className="panel panel--pad">
            <p className="sub-head__title" style={{ fontSize: "1.25rem", marginBottom: 20 }}>Match settings</p>
            <div className="ar-settings">
              <div>
                <label className="label" htmlFor="min-rating" style={{ marginBottom: 8 }}>Min rating</label>
                <input
                  id="min-rating"
                  type="number"
                  step="100"
                  min="800"
                  max="3500"
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                  className="field"
                />
              </div>
              <div>
                <label className="label" htmlFor="max-rating" style={{ marginBottom: 8 }}>Max rating</label>
                <input
                  id="max-rating"
                  type="number"
                  step="100"
                  min="800"
                  max="3500"
                  value={maxRating}
                  onChange={(e) => setMaxRating(e.target.value)}
                  className="field"
                />
              </div>
              <div>
                <label className="label" htmlFor="tag" style={{ marginBottom: 8 }}>Topic</label>
                <select id="tag" value={tag} onChange={(e) => setTag(e.target.value)} className="field">
                  {TAGS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="duration" style={{ marginBottom: 8 }}>Duration</label>
                <select id="duration" value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} className="field">
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                  <option value={90}>90 minutes</option>
                </select>
              </div>
              <div className="ar-settings__wide">
                <label className="label" htmlFor="delay" style={{ marginBottom: 8 }}>Start delay</label>
                <select id="delay" value={startDelaySeconds} onChange={(e) => setStartDelaySeconds(e.target.value)} className="field">
                  <option value={0}>Start right away</option>
                  <option value={30}>In 30 seconds</option>
                  <option value={60}>In 1 minute (time to share the link)</option>
                  <option value={120}>In 2 minutes</option>
                  <option value={300}>In 5 minutes</option>
                </select>
                <span className="ar-hint">Problems stay locked until this runs out.</span>
              </div>
              <div className="ar-settings__wide">
                <span className="label" style={{ marginBottom: 8 }}>Problems</span>
                <div className="chips" role="radiogroup" aria-label="Number of problems">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      role="radio"
                      aria-checked={count === n}
                      onClick={() => setCount(n)}
                      className={`chip-btn ar-count${count === n ? " is-active" : ""}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button type="submit" disabled={isGenerating || loadingMembers} className="btn btn--block ar-launch">
            {isGenerating ? (
              <>
                <LoaderCircle className="ar-spin" /> Finding unsolved problems...
              </>
            ) : (
              <>
                <Swords /> Start the duel <ArrowRight />
              </>
            )}
          </button>
        </form>

        <aside className="ar-rules">
          <span className="label">How it works</span>
          <ol className="ar-rules__list">
            {RULES.map((rule, i) => (
              <li key={i}>
                <span className="ar-rules__n">{String(i + 1).padStart(2, "0")}</span>
                {rule}
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </div>
  );
}
