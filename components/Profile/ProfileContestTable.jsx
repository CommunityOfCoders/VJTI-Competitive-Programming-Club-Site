"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ProfileContestTable = ({ data }) => {
  const [contests, setContests] = useState([]);
  useEffect(() => {
    setContests(data.mergedContests);
  }, [data])

  const sortedContests = [...contests].sort((a, b) => b.startTime - a.startTime);
  const formatDate = (timestamp) =>
    timestamp
      ? new Date(timestamp * 1000).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
      : "-";

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.max(1, Math.ceil(contests.length / itemsPerPage));

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const currentContests = sortedContests.slice(
    indexOfFirstItem,
    indexOfFirstItem + itemsPerPage
  );

  const formatContestName = (name) => {
    return name.toLowerCase().replace(/\s+/g, '-').concat('/');
  };

  // console.log(currentContests);

  if (!contests || contests.length === 0) {
    return <p className="pf-card__sub">No contests played yet.</p>;
  }

  return (
    <div>
      <div className="table-wrap pf-table">
        <table className="data-table">
          <thead>
            <tr>
              <th>Contest</th>
              <th>Date</th>
              <th className="is-right">Rank</th>
              <th className="is-right">Solved</th>
            </tr>
          </thead>
          <tbody>
            {currentContests.map((contest, index) => (
              <tr key={`${contest.platform}-${contest.contestId || contest.contestName}-${index}`}>
                <td>
                  <div className="person">
                    <Image
                      src={contest.platform === "LeetCode" ? "/svgs/lc.svg" : "/svgs/cf.svg"}
                      width={18}
                      height={18}
                      alt={contest.platform}
                    />
                    <a
                      href={
                        contest.platform === "LeetCode"
                          ? `https://leetcode.com/contest/${formatContestName(contest.contestName)}`
                          : `https://codeforces.com/contest/${contest.contestId}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontWeight: 500 }}
                    >
                      {contest.contestName}
                    </a>
                  </div>
                </td>
                <td className="num is-dim" style={{ whiteSpace: "nowrap", fontSize: "0.8rem" }}>
                  {formatDate(contest.startTime)}
                </td>
                <td className="num is-right">{contest.rank ?? "-"}</td>
                <td className="num is-right" style={{ color: "var(--accent)" }}>
                  {contest.problemsSolved ?? 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pf-pager">
        <button onClick={handlePreviousPage} disabled={currentPage === 1} className="icon-btn icon-btn--sm" aria-label="Newer contests">
          <ChevronLeft />
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button onClick={handleNextPage} disabled={currentPage === totalPages} className="icon-btn icon-btn--sm" aria-label="Older contests">
          <ChevronRight />
        </button>
      </div>
    </div>
  );
};

export default ProfileContestTable;
