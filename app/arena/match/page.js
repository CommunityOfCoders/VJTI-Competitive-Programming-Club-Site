"use client";

import React, { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import {
  Timer,
  ExternalLink,
  CheckCircle2,
  Trophy,
  RefreshCw,
  Copy,
  Check,
  Zap,
  ArrowLeft,
  Lock,
  Share2,
} from "lucide-react";

function MatchContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Authoritative synced countdown seconds
  const [countdownSeconds, setCountdownSeconds] = useState(0);

  const fetchStatus = useCallback(
    async (isManual = false) => {
      if (!token) {
        setError("No match token provided.");
        setLoading(false);
        return;
      }

      if (isManual) setRefreshing(true);

      try {
        const res = await axios.get(`/api/arena/verify?token=${encodeURIComponent(token)}`);
        if (res.data?.success) {
          setMatchData(res.data);
          // Sync client countdown with server authoritative time
          if (res.data.isPending) {
            setCountdownSeconds(res.data.startsInSeconds || 0);
          } else {
            setCountdownSeconds(res.data.timeRemainingSeconds || 0);
          }
          setError(null);
        } else {
          setError(res.data?.error || "Failed to verify match.");
        }
      } catch (err) {
        setError(err.response?.data?.error || err.message || "Failed to verify match.");
      } finally {
        setLoading(false);
        if (isManual) setRefreshing(false);
      }
    },
    [token]
  );

  useEffect(() => {
    fetchStatus();
    // Auto poll every 2 minutes (120,000 ms)
    const interval = setInterval(() => {
      fetchStatus(false);
    }, 120000);

    return () => clearInterval(interval);
  }, [fetchStatus]);

  // Client-side 1-second countdown tick
  useEffect(() => {
    if (countdownSeconds <= 0) return;

    const timer = setInterval(() => {
      setCountdownSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [countdownSeconds > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  // Timer reached 0: re-fetch once so the problems unlock / the result shows
  const hitZero = useRef(false);
  useEffect(() => {
    if (countdownSeconds > 0) {
      hitZero.current = false;
      return;
    }
    if (matchData && !matchData.isFinished && !hitZero.current) {
      hitZero.current = true;
      fetchStatus(true);
    }
  }, [countdownSeconds, matchData, fetchStatus]);

  const copyMatchLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      window.prompt("Copy this match link:", window.location.href);
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="container page mt-state">
        <RefreshCw className="ar-spin" />
        <p>Loading the match...</p>
      </div>
    );
  }

  if (error || !matchData) {
    return (
      <div className="container page page--narrow">
        <div className="panel panel--flat empty">
          <p className="empty__title">This match can&apos;t be opened</p>
          <p className="empty__text">{error || "The match link is not valid."}</p>
          <Link href="/arena" className="btn btn--ghost" style={{ marginTop: 22 }}>
            <ArrowLeft /> Back to the arena
          </Link>
        </div>
      </div>
    );
  }

  const { match, scoreboard, problems, isFinished, isPending, winner, outcome } = matchData;
  const p1 = match.p1;
  const p2 = match.p2;
  const lowTime = !isFinished && countdownSeconds < 300;

  const Side = ({ handle, n }) => {
    const row = scoreboard[handle] || { score: 0, solvedCount: 0, totalTimeSeconds: 0 };
    return (
      <div className={`panel mt-side${n === 1 ? " is-one" : ""}${winner === handle ? " is-winner" : ""}`}>
        <div className="mt-side__top">
          <div style={{ minWidth: 0 }}>
            <span className="label">Player {n}{winner === handle ? " · winner" : ""}</span>
            <a
              href={`https://codeforces.com/profile/${handle}`}
              target="_blank"
              rel="noreferrer"
              className="mt-side__name"
              style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              {handle}
              {winner === handle && <Trophy style={{ width: 18, height: 18, color: "var(--accent)" }} />}
            </a>
          </div>
          <span className="mt-side__pts">
            {row.score}
            <small>PTS</small>
          </span>
        </div>
        <div className="mt-side__meta">
          <span>Solved {row.solvedCount}/{match.totalProblems}</span>
          <span>Time {Math.floor(row.totalTimeSeconds / 60)}m</span>
        </div>
      </div>
    );
  };

  const Status = ({ handle, n, prob }) => {
    const st = prob[handle] || { solved: false };
    return (
      <span className={`mt-pill${st.solved ? " is-solved" : ""}${n === 1 ? " is-one" : ""}`}>
        <b>{handle}</b>
        {st.solved ? (
          <>
            <CheckCircle2 /> {st.timeTakenMinutes}m
            {prob.firstSolver === handle && (
              <span title="First to solve: +0.5 points">
                <Zap className="mt-first" />
              </span>
            )}
          </>
        ) : (
          "not yet"
        )}
      </span>
    );
  };

  return (
    <div className="container page">
      <div className="mt-bar">
        <Link href="/arena" className="link-arrow" style={{ color: "var(--fg-dim)" }}>
          <ArrowLeft /> Back to the arena
        </Link>
        <div className="mt-bar__actions">
          <button onClick={copyMatchLink} className="btn btn--ghost btn--sm">
            {copied ? <Check /> : <Copy />}
            {copied ? "Link copied" : "Share match link"}
          </button>
          <button
            onClick={() => fetchStatus(true)}
            disabled={refreshing}
            title="Checks automatically every 2 minutes. Click to check now."
            className="btn btn--sm"
          >
            <RefreshCw className={refreshing ? "ar-spin" : ""} />
            {refreshing ? "Checking..." : "Check verdicts"}
          </button>
        </div>
      </div>

      {isPending ? (
        <div className="panel mt-clock">
          <span className="eyebrow" style={{ justifyContent: "center" }}>Match starts in</span>
          <div className="mt-clock__time">{formatTime(countdownSeconds)}</div>
          <p className="mt-clock__text">
            Send the link to your opponent now. The problems unlock for both of you at the same moment.
          </p>
          <button onClick={copyMatchLink} className="btn">
            {copied ? <Check /> : <Share2 />}
            {copied ? "Link copied" : "Copy the match link"}
          </button>
        </div>
      ) : (
        <div className="panel mt-clock">
          <span className="eyebrow" style={{ justifyContent: "center" }}>
            <Timer style={{ width: 14, height: 14 }} /> {isFinished ? "Match over" : "Time left"}
          </span>
          <div className={`mt-clock__time ${isFinished ? "is-over" : lowTime ? "is-low" : "is-live"}`}>
            {formatTime(countdownSeconds)}
          </div>
          {isFinished && (
            <div className="mt-result">
              <p className="mt-result__title">
                {outcome === "tie" ? (
                  "It's a tie."
                ) : winner ? (
                  <>
                    <span className="mark">{winner}</span> wins.
                  </>
                ) : (
                  "Match over."
                )}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="mt-score">
        <Side handle={p1} n={1} />
        <span className="mt-vs">vs</span>
        <Side handle={p2} n={2} />
      </div>

      <div className="mt-probs">
        <div className="sub-head" style={{ marginBottom: 6 }}>
          <span className="sub-head__num">{String(problems.length).padStart(2, "0")}</span>
          <h2 className="sub-head__title">Problems</h2>
        </div>

        {problems.map((prob, idx) => (
          <div key={prob.problemId} className="panel mt-prob">
            <span className="mt-prob__n">{String.fromCharCode(65 + idx)}</span>
            <div style={{ minWidth: 0 }}>
              {prob.locked ? (
                <span className="mt-prob__name" style={{ color: "var(--fg-faint)" }}>
                  <Lock /> {prob.name}
                </span>
              ) : (
                <a href={prob.url} target="_blank" rel="noreferrer" className="mt-prob__name">
                  {prob.name}
                  <ExternalLink />
                </a>
              )}
              <div className="mt-prob__meta">
                <span className="tag">{prob.rating}</span>
                {prob.locked ? "Unlocks when the match starts" : prob.problemId}
              </div>
            </div>
            <div className="mt-prob__status">
              {prob.locked ? (
                <span className="mt-pill">
                  <Lock /> Locked
                </span>
              ) : (
                <>
                  <Status handle={p1} n={1} prob={prob} />
                  <Status handle={p2} n={2} prob={prob} />
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ArenaMatchPage() {
  return (
    <Suspense
      fallback={
        <div className="container page mt-state">
          <RefreshCw className="ar-spin" />
        </div>
      }
    >
      <MatchContent />
    </Suspense>
  );
}
