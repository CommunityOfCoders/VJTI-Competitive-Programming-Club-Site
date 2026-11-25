"use client";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ArrowDown, ArrowUp, ExternalLink, Flame, Search } from "lucide-react";
import { rankUsers } from "@/lib/daily/ranking.mjs";

const COLUMNS = [
  { sort: "streak", label: "Streak" },
  { sort: "best", label: "Best" },
  { sort: "today", label: "Today" },
  { sort: "total", label: "Solved" },
  { sort: "points", label: "Points" },
  { sort: "time", label: "Latest Solve" },
];

const TABS = [
  { sort: "streak", label: "Streak" },
  { sort: "today", label: "Today" },
  { sort: "total", label: "Solved" },
  { sort: "points", label: "Points" },
  { sort: "best", label: "Best" },
  { sort: "time", label: "Recent" },
];

function formatSolveTime(iso) {
  const date = iso ? new Date(iso) : null;
  if (!date || Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function RankBadge({ rank }) {
  if (rank === null || rank === undefined) return <span className="rank">-</span>;
  return <span className={`rank${rank <= 3 ? ` rank--${rank}` : ""}`}>{rank}</span>;
}

export default function DailyLeaderboard({ questionCount = 6 }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("streak");
  const [ascending, setAscending] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    axios
      .get("/api/daily/stats")
      .then((response) => setStats(response.data))
      .catch(() => setError("Could not load daily stats"));
  }, []);

  const ranked = useMemo(() => (stats?.users ? rankUsers(stats.users, sortBy) : []), [stats, sortBy]);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matches = needle
      ? ranked.filter(
          (user) =>
            user.name.toLowerCase().includes(needle) ||
            user.cfHandle?.toLowerCase().includes(needle)
        )
      : ranked;
    return ascending ? [...matches].reverse() : matches;
  }, [ranked, query, ascending]);

  const activeCount = useMemo(
    () => (stats?.users ?? []).filter((u) => u.totalSolved > 0 || u.currentStreak > 0).length,
    [stats]
  );

  return (
    <section className="dl">
      <div className="sub-head">
        <span className="sub-head__num">{activeCount} active</span>
        <h2 className="sub-head__title">Daily leaderboard</h2>
        <span className="sub-head__meta">Members with the same stats share a rank</span>
      </div>

      <div className="dl-tools">
        <div className="chips chips--scroll" role="tablist" aria-label="Rank by">
          {TABS.map((tab) => (
            <button
              key={tab.sort}
              role="tab"
              aria-selected={sortBy === tab.sort}
              onClick={() => setSortBy(tab.sort)}
              className={`chip-btn${sortBy === tab.sort ? " is-active" : ""}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="dl-tools__end">
          <div className="field-wrap dl-search">
            <Search />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search member or handle"
              className="field"
              aria-label="Search member or handle"
            />
          </div>
          <button
            onClick={() => setAscending((value) => !value)}
            aria-label={ascending ? "Showing lowest first" : "Showing highest first"}
            title={ascending ? "Lowest first" : "Highest first"}
            className="icon-btn"
          >
            {ascending ? <ArrowUp /> : <ArrowDown />}
          </button>
        </div>
      </div>

      {error && (
        <div className="panel panel--flat empty">
          <p className="empty__title">{error}</p>
        </div>
      )}
      {!stats && !error && <div className="skel" style={{ height: 320, borderRadius: "var(--r-md)" }} />}
      {stats && stats.count === 0 && (
        <div className="panel panel--flat empty">
          <p className="empty__title">No stats recorded yet</p>
          <p className="empty__text">Solve today&apos;s questions and you&apos;ll show up here.</p>
        </div>
      )}

      {stats && stats.count > 0 && (
        <div className="panel panel--clip">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="is-center" style={{ width: 60 }}>#</th>
                  <th>Member</th>
                  {COLUMNS.map((column) => (
                    <th key={column.sort} className={`is-center${column.sort === sortBy ? " is-sorted" : ""}`}>
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="is-center" style={{ padding: "36px 16px" }}>
                      No members match &ldquo;{query}&rdquo;
                    </td>
                  </tr>
                ) : (
                  rows.map((user) => (
                    <tr key={user.key}>
                      <td className="is-center">
                        <RankBadge rank={user.rank} />
                      </td>
                      <td>
                        <div className="person" style={{ flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
                          <span style={{ whiteSpace: "nowrap" }}>{user.name}</span>
                          {user.cfHandle && (
                            <a
                              href={`https://codeforces.com/profile/${user.cfHandle}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="handle"
                            >
                              @{user.cfHandle}
                              <ExternalLink size={10} />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="is-center">
                        <span className={`dl-streak${user.currentStreak > 0 ? " is-on" : ""}`}>
                          {user.currentStreak > 0 && <Flame />}
                          {user.currentStreak}
                        </span>
                      </td>
                      <td className={`is-center num${sortBy === "best" ? "" : " is-dim"}`}>{user.longestStreak}</td>
                      <td className="is-center">
                        <span className={(user.solvedToday ?? 0) > 0 ? "tag tag--accent" : "num is-dim"} style={{ fontSize: "0.78rem" }}>
                          {user.solvedToday ?? 0}/{questionCount}
                        </span>
                      </td>
                      <td className={`is-center num${sortBy === "total" ? "" : " is-dim"}`}>{user.totalSolved}</td>
                      <td className={`is-center num${sortBy === "points" ? "" : " is-dim"}`}>{user.points ?? 0}</td>
                      <td className="is-center num is-dim" style={{ fontSize: "0.78rem", whiteSpace: "nowrap" }}>
                        {formatSolveTime(user.todayCompletedAt || user.lastCompletedAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {stats?.updatedAt && (
        <p className="table-note">
          Last synced with Codeforces:{" "}
          {new Date(stats.updatedAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
        </p>
      )}
    </section>
  );
}
