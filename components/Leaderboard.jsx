"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import members from "../json/members.json";
import Link from "next/link";
import { ArrowDown, ArrowUpDown } from "lucide-react";
import { LeaderboardSkeleton } from "./Skeleton";
import Image from "next/image";

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 1 day in milliseconds
const CACHE_KEY = "leaderboardData";

const TABS = [
  { key: "all", label: "All members" },
  { key: "club", label: "CP Club" },
  { key: "nonclub", label: "Non-club" },
];

// Official Codeforces rank colours, nudged so they read on true black.
// They only colour the small dot next to the rank name.
const CF_RANK_COLORS = {
  newbie: "#8C8C8C",
  pupil: "#2E9E3E",
  specialist: "#03A89E",
  expert: "#4C6FFF",
  "candidate master": "#B44CC2",
  master: "#FF8C00",
  "international master": "#FF8C00",
  grandmaster: "#FF3B30",
  "international grandmaster": "#FF3B30",
  "legendary grandmaster": "#FF3B30",
};

const readCache = () => {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
    if (cached && Array.isArray(cached.data) && Date.now() - cached.timestamp < CACHE_DURATION) return cached;
  } catch {
    /* private mode or bad JSON: fall through to a fresh fetch */
  }
  return null;
};

const attendedCount = (list) => (list || []).reduce((acc, val) => acc + (val ? 1 : 0), 0);

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isAttendanceLoading, setIsAttendanceLoading] = useState(true);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [activeTab, setActiveTab] = useState("all");
  const [sortKey, setSortKey] = useState("rating");

  const fetchUserRatings = async (handles) => {
    if (handles.length === 0) return [];
    try {
      const response = await axios.get(
        `https://codeforces.com/api/user.info?handles=${handles.join(";")}`
      );
      return response.data.result;
    } catch (error) {
      console.error("Error fetching ratings:", error);
      return [];
    }
  };

  const fetchLeetCodeRating = async () => {
    try {
      const response = await axios.get("/api/lcrating");
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.log("Error fetching leaderboard data:", error);
      return [];
    }
  };

  const fetchLastFiveContests = async () => {
    try {
      const response = await axios.get("https://codeforces.com/api/contest.list");
      return response.data.result
        .filter((contest) => contest.phase === "FINISHED")
        .slice(0, 5)
        .map((contest) => contest.id);
    } catch (error) {
      console.error("Error fetching contests:", error);
      return [];
    }
  };

  const getValidCodeforcesUsers = async (initialHandles) => {
    let currentHandles = [...initialHandles];
    let attempts = 0;

    while (attempts < 5 && currentHandles.length > 0) {
      try {
        const response = await axios.get(
          `https://codeforces.com/api/user.info?handles=${currentHandles.join(";")}`
        );
        return { validHandles: response.data.result.map((u) => u.handle) };
      } catch (error) {
        attempts++;
        const comment = error.response?.data?.comment;

        // Drop the one handle Codeforces complains about and try again
        const matches = comment?.match(/User with handle (.+) not found/);
        if (matches && matches[1]) {
          const badHandle = matches[1].toLowerCase();
          console.warn(`Invalid Handle Found: ${matches[1]}. Removing from list...`);
          currentHandles = currentHandles.filter((h) => h.toLowerCase() !== badHandle);
          continue;
        }
        console.error("Critical API Error:", error);
        break;
      }
    }
    return { validHandles: [] };
  };

  const fetchRatingsAndAttendance = useCallback(async () => {
    const handles = Object.values(members).map((member) => member.cf_username);
    setIsProfileLoading(true);
    setIsAttendanceLoading(true);

    try {
      const { validHandles } = await getValidCodeforcesUsers(handles);
      const [lastFiveContests, leetCodeRating, cfRatings] = await Promise.all([
        fetchLastFiveContests(),
        fetchLeetCodeRating(),
        fetchUserRatings(validHandles),
      ]);

      // Codeforces returns handles in their canonical case, members.json may not match
      const cfByHandle = new Map(cfRatings.map((user) => [user.handle.toLowerCase(), user]));
      const lcByUser = new Map(leetCodeRating.map((item) => [String(item.username).toLowerCase(), item.rating]));

      const freshAttendance = handles.reduce((acc, handle) => {
        acc[handle] = [false, false, false, false, false];
        return acc;
      }, {});

      const updatedMembers = Object.entries(members).map(([username, data]) => {
        const cfData = cfByHandle.get(data.cf_username.toLowerCase());
        return {
          ...data,
          username,
          rating: cfData?.rating || 0,
          maxRating: cfData?.maxRating || 0,
          rank: cfData?.rank || "unrated",
          maxRank: cfData?.maxRank || "unrated",
          titlePhoto:
            cfData?.titlePhoto && !cfData.titlePhoto.includes("no-title")
              ? // userpic.codeforces.org refuses direct loads; codeforces.com proxies the same path
                `https://codeforces.com/${cfData.titlePhoto.replace(/^(https?:)?\/\//, "")}`
              : "/images/nouserpic-photo.jpg",
          leetCodeRating: Math.round(lcByUser.get(String(data.lc_username).toLowerCase()) || 0),
        };
      });

      setLeaderboardData(updatedMembers);
      setIsProfileLoading(false);

      // canonical handle -> members.json handle, so standings rows map back
      const memberHandle = new Map(handles.map((h) => [h.toLowerCase(), h]));
      for (const [contestIndex, contestId] of lastFiveContests.entries()) {
        try {
          const response = await axios.get(
            `https://codeforces.com/api/contest.standings?contestId=${contestId}`
          );
          for (const row of response.data.result.rows) {
            for (const member of row.party.members) {
              const own = memberHandle.get(member.handle.toLowerCase());
              if (own && freshAttendance[own]) freshAttendance[own][contestIndex] = true;
            }
          }
        } catch (error) {
          console.error(`Error fetching standings for contest ${contestId}:`, error);
        }
      }
      setAttendanceMap(freshAttendance);

      try {
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ data: updatedMembers, attendanceMap: freshAttendance, timestamp: Date.now() })
        );
        localStorage.setItem("lastClearDateIST", new Date().toISOString());
      } catch {
        /* storage full or blocked: the page still works without the cache */
      }
    } catch (error) {
      console.error("Error fetching leaderboard data:", error);
    } finally {
      setIsProfileLoading(false);
      setIsAttendanceLoading(false);
    }
  }, []);

  useEffect(() => {
    const checkForMidnightIST = () => {
      const istNow = new Date(Date.now() + 330 * 60 * 1000); // IST is UTC+5:30
      if (istNow.getUTCHours() === 0 && istNow.getUTCMinutes() === 0) {
        try {
          localStorage.removeItem(CACHE_KEY);
          localStorage.setItem("lastClearDateIST", new Date().toISOString());
        } catch {
          /* ignore */
        }
      }
    };
    const intervalId = setInterval(checkForMidnightIST, 60000);

    const cached = readCache();
    if (cached) {
      setLeaderboardData(cached.data);
      setAttendanceMap(cached.attendanceMap || {});
      setIsProfileLoading(false);
      setIsAttendanceLoading(false);
    } else {
      fetchRatingsAndAttendance();
    }

    return () => clearInterval(intervalId);
  }, [fetchRatingsAndAttendance]);

  const rows = useMemo(() => {
    const list =
      activeTab === "all"
        ? [...leaderboardData]
        : leaderboardData.filter((m) => (activeTab === "club" ? m.inClub : !m.inClub));
    const by = {
      rating: (a, b) => b.rating - a.rating,
      leetCodeRating: (a, b) => b.leetCodeRating - a.leetCodeRating,
      attendance: (a, b) =>
        attendedCount(attendanceMap[b.cf_username]) - attendedCount(attendanceMap[a.cf_username]) ||
        b.rating - a.rating,
    }[sortKey];
    return list.sort(by);
  }, [leaderboardData, activeTab, sortKey, attendanceMap]);

  const counts = useMemo(
    () => ({
      all: leaderboardData.length,
      club: leaderboardData.filter((m) => m.inClub).length,
      nonclub: leaderboardData.filter((m) => !m.inClub).length,
    }),
    [leaderboardData]
  );
  const topRating = useMemo(() => Math.max(0, ...leaderboardData.map((m) => m.rating)), [leaderboardData]);

  if (isProfileLoading) {
    return <LeaderboardSkeleton />;
  }

  const SortHead = ({ k, children }) => (
    <button className="sort-btn" onClick={() => setSortKey(k)} aria-pressed={sortKey === k}>
      {children}
      {sortKey === k ? <ArrowDown /> : <ArrowUpDown style={{ opacity: 0.45 }} />}
    </button>
  );

  return (
    <div className="container page">
      <header className="page-head">
        <span className="eyebrow">Codeforces · LeetCode</span>
        <h1 className="page-title">
          Leader<span className="mark">board.</span>
        </h1>
        <p className="page-lede">
          Every member&apos;s Codeforces and LeetCode rating in one table, plus who turned up for the last five
          Codeforces rounds. Refreshed once a day.
        </p>
        <div className="stat-row">
          <div className="stat">
            <span className="stat__num">{counts.all}</span>
            <span className="stat__label">Members tracked</span>
          </div>
          <div className="stat">
            <span className="stat__num">{counts.club}</span>
            <span className="stat__label">In the CP Club</span>
          </div>
          <div className="stat">
            <span className="stat__num is-accent">{topRating || "-"}</span>
            <span className="stat__label">Top CF rating</span>
          </div>
        </div>
      </header>

      <div className="chips chips--scroll" role="tablist" aria-label="Filter members" style={{ marginBottom: 20 }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`chip-btn${activeTab === tab.key ? " is-active" : ""}`}
          >
            {tab.label} <span className="chip-btn__count">{counts[tab.key]}</span>
          </button>
        ))}
      </div>

      <div className="panel panel--clip">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th className="is-center" style={{ width: 64 }}>#</th>
                <th>Member</th>
                <th className="is-center">Year</th>
                <th className={`is-center${sortKey === "leetCodeRating" ? " is-sorted" : ""}`}>
                  <SortHead k="leetCodeRating">LeetCode</SortHead>
                </th>
                <th className={`is-center${sortKey === "rating" ? " is-sorted" : ""}`}>
                  <SortHead k="rating">CF rating</SortHead>
                </th>
                <th>CF rank</th>
                <th className={`is-center${sortKey === "attendance" ? " is-sorted" : ""}`}>
                  <SortHead k="attendance">Last 5 rounds</SortHead>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((member, index) => {
                const attendance = attendanceMap[member.cf_username];
                return (
                  <tr key={member.username}>
                    <td className="is-center">
                      <span className={`rank${index < 3 ? ` rank--${index + 1}` : ""}`}>{index + 1}</span>
                    </td>
                    <td>
                      <div className="person">
                        <Image
                          width={36}
                          height={36}
                          src={member.titlePhoto}
                          alt=""
                          className="avatar"
                          style={{ width: 36, height: 36 }}
                          unoptimized
                        />
                        <Link href={`/profile/${member.username}`} style={{ whiteSpace: "nowrap" }}>
                          {member.name}
                        </Link>
                      </div>
                    </td>
                    <td className="is-center num is-dim">{member.year}</td>
                    <td className="is-center">
                      <a
                        href={`https://leetcode.com/u/${member.lc_username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="num"
                      >
                        {member.leetCodeRating || "-"}
                      </a>
                    </td>
                    <td className="is-center">
                      <a
                        href={`https://codeforces.com/profile/${member.cf_username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="num"
                        style={{ fontWeight: 500 }}
                      >
                        {member.rating || "-"}
                      </a>
                    </td>
                    <td>
                      <span className="cf-rank" style={{ "--rk": CF_RANK_COLORS[member.rank] || "transparent" }}>
                        {member.rank === "N/A" ? "unrated" : member.rank}
                      </span>
                    </td>
                    <td>
                      <div className="attend" aria-label={`Took part in ${attendedCount(attendance)} of the last 5 rounds`}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span
                            key={i}
                            className={`attend__cell${isAttendanceLoading ? " is-loading" : attendance?.[i] ? " is-on" : ""}`}
                          />
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <p className="table-note">Tap a name for the full profile. Ratings link out to Codeforces and LeetCode.</p>
    </div>
  );
};

export default Leaderboard;
