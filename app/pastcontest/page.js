"use client";
import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import axios from "axios";
import { ArrowLeft, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { ContestTableSkeleton } from "@/components/Skeleton";
import Link from "next/link";

const platformLogos = {
  codeforces: "https://sta.codeforces.com/s/44094/favicon-32x32.png",
  leetcode: "https://leetcode.com/static/images/LeetCode_logo.png",
};
const platformNames = { codeforces: "Codeforces", leetcode: "LeetCode" };

function ContestLeaderboardContent() {
  const searchParams = useSearchParams();
  const contestName = searchParams.get("contestName");
  const platform = searchParams.get("platform");
  const contestId = searchParams.get("contestId");

  const [searchTerm, setSearchTerm] = useState("");
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const fetchParticipants = async () => {
      setLoading(true);
      setFailed(false);
      try {
        let response;
        if (platform === "codeforces") {
          response = await axios.get(`/api/codeforcespast?contestId=${encodeURIComponent(contestId)}`);
        } else if (platform === "leetcode") {
          response = await axios.get(
            `/api/leetcodepast?contestId=${encodeURIComponent(contestId)}&contestName=${encodeURIComponent(contestName || "")}`
          );
        }
        const list = Array.isArray(response?.data) ? response.data : [];
        // unranked rows come back as "-": keep them at the bottom
        const rankOf = (p) => (Number.isFinite(Number(p.standing)) ? Number(p.standing) : Infinity);
        setParticipants([...list].sort((a, b) => rankOf(a) - rankOf(b)));
      } catch (error) {
        console.error(`Failed to fetch standings for ${platform}:`, error);
        setFailed(true);
      } finally {
        setLoading(false);
      }
    };

    if (contestId && (platform === "codeforces" || platform === "leetcode")) {
      fetchParticipants();
    } else {
      setLoading(false);
    }
  }, [platform, contestId, contestName]);

  const needle = searchTerm.trim().toLowerCase();
  const filteredParticipants = participants.filter(
    (p) =>
      !needle ||
      String(p.name || "").toLowerCase().includes(needle) ||
      String(p.handle || "").toLowerCase().includes(needle)
  );

  const validLink = contestId && platformNames[platform];

  return (
    <div className="container page page--narrow">
      <Link href="/contest" className="link-arrow" style={{ color: "var(--fg-dim)", marginBottom: 28 }}>
        <ArrowLeft /> All contests
      </Link>

      <header className="page-head" style={{ marginTop: 28 }}>
        <span className="eyebrow">
          {platformLogos[platform] && (
            <Image src={platformLogos[platform]} alt="" width={16} height={16} style={{ borderRadius: 3 }} />
          )}
          {platformNames[platform] || "Contest"} · Club standings
        </span>
        <h1 className="page-title page-title--sm">{contestName || "Contest standings"}</h1>
        {!loading && participants.length > 0 && (
          <div className="stat-row">
            <div className="stat">
              <span className="stat__num">{participants.length}</span>
              <span className="stat__label">Club members took part</span>
            </div>
            <div className="stat">
              <span className="stat__num is-accent">#{participants[0].standing}</span>
              <span className="stat__label">Best rank: {participants[0].name}</span>
            </div>
          </div>
        )}
      </header>

      {participants.length > 0 && (
        <div className="field-wrap" style={{ maxWidth: 420, marginBottom: 20 }}>
          <Search />
          <input
            type="text"
            placeholder="Search by name or handle"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="field"
          />
        </div>
      )}

      {loading ? (
        <ContestTableSkeleton />
      ) : !validLink ? (
        <div className="panel panel--flat empty">
          <p className="empty__title">This link is missing the contest</p>
          <p className="empty__text">Open a past Codeforces or LeetCode round from the contests page.</p>
        </div>
      ) : failed ? (
        <div className="panel panel--flat empty">
          <p className="empty__title">Could not load the standings</p>
          <p className="empty__text">The platform did not answer. Try again in a minute.</p>
        </div>
      ) : filteredParticipants.length === 0 ? (
        <div className="panel panel--flat empty">
          <p className="empty__title">{participants.length === 0 ? "No club members in this round" : "No one matches that"}</p>
          <p className="empty__text">
            {participants.length === 0 ? "Nobody from the leaderboard took part." : "Try a different name or handle."}
          </p>
        </div>
      ) : (
        <div className="panel panel--clip">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="is-center" style={{ width: 90 }}>Rank</th>
                  <th>Member</th>
                  <th>Handle</th>
                </tr>
              </thead>
              <tbody>
                {filteredParticipants.map((participant, index) => (
                  <tr key={`${participant.handle}-${index}`}>
                    <td className="is-center">
                      <span className={`rank${index < 3 && !needle ? ` rank--${index + 1}` : ""}`}>{participant.standing}</span>
                    </td>
                    <td>
                      <div className="person">
                        {participant.ref ? (
                          <Link href={`/profile/${participant.ref}`}>{participant.name}</Link>
                        ) : (
                          <span>{participant.name}</span>
                        )}
                      </div>
                    </td>
                    <td className="num" style={{ color: "var(--fg-dim)" }}>{participant.handle}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ContestLeaderboard() {
  return (
    <Suspense fallback={<div className="container page page--narrow"><ContestTableSkeleton /></div>}>
      <ContestLeaderboardContent />
    </Suspense>
  );
}
