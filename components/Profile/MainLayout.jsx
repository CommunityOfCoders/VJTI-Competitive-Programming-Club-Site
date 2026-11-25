"use client";
import "react-tooltip/dist/react-tooltip.css";
import React, { useState, useEffect } from "react";
import DoughnutChart from "./DoughnutChart";
import RatingChart from "./RatingChart";
import ProfileContestTable from "./ProfileContestTable";
import TopicAnalysis from "./TopicAnalysis";
import Link from "next/link";
import ActivityHeatmap from "./Heatmap";

function mergeTopicData(leetCodeData = {}, codeForcesData = {}) {
  const combinedAnalysis = { advanced: [], intermediate: [], fundamental: [] };

  ["advanced", "intermediate", "fundamental"].forEach((level) => {
    const leetTopics = leetCodeData?.[level] || [];
    const cfTopics = codeForcesData?.[level] || [];

    const topicMap = new Map();

    // Add LeetCode topics
    leetTopics.forEach((topic) => {
      topicMap.set(topic.tagSlug, { ...topic });
    });

    cfTopics.forEach((topic) => {
      if (topicMap.has(topic.tagSlug)) {
        topicMap.get(topic.tagSlug).problemsSolved += topic.problemsSolved;
      } else {
        topicMap.set(topic.tagSlug, { ...topic });
      }
    });

    combinedAnalysis[level] = Array.from(topicMap.values());
  });

  return combinedAnalysis;
}

async function getDailySolvedProblemsCount(userHandle) {
  const response = await fetch(
    `https://codeforces.com/api/user.status?handle=${userHandle}`
  );
  const data = await response.json();

  if (data.status !== "OK") {
    throw new Error("Failed to fetch user data");
  }

  const solvedProblems = data.result
    .filter((submission) => submission.verdict === "OK")
    .map((submission) => ({
      date: new Date(submission.creationTimeSeconds * 1000)
        .toISOString()
        .split("T")[0],
      problemId: `${submission.contestId}-${submission.problem.index}`,
    }));

  const dailyCounts = new Map();

  solvedProblems.forEach(({ date, problemId }) => {
    if (!dailyCounts.has(date)) {
      dailyCounts.set(date, new Set());
    }
    dailyCounts.get(date).add(problemId);
  });

  const dailySolvedProblems = Array.from(dailyCounts, ([date, problems]) => ({
    date,
    count: problems.size,
  }));

  return dailySolvedProblems;
}

function MainLayout({ data }) {
  const [dailySolvedProblem, setdailySolvedProblems] = useState([]);
  const [activeTab, setActiveTab] = useState('leetcode');

  useEffect(() => {
    const fetchDailySolvedProblems = async () => {
      try {
        const dailySolvedProblems = await getDailySolvedProblemsCount(
          data?.codeForcesData?.handle
        );
        setdailySolvedProblems(dailySolvedProblems);
      } catch (error) {
        console.error("Error fetching daily solved problems:", error);
      }
    };

    if (data?.codeForcesData?.handle) {
      fetchDailySolvedProblems();
    }
  }, [data?.codeForcesData?.handle]);

  // either platform can be missing, so default each side to 0 (no NaN)
  const totalContests =
    (data.leetCodeData?.userContestDetails?.contestParticipation?.length ?? 0) +
    (data.codeForcesData?.ratingData?.length ?? 0);

  let calenderSubmission = data.leetCodeData?.submissionCalendar;

  // console.log(calenderSubmission);

  const topicWiseAnalysis = mergeTopicData(
    data.leetCodeData?.topicWiseAnalysis,
    data.codeForcesData?.topicAnalysis
  );

  const heatmapData = Object.keys(calenderSubmission || {}).map((timestamp) => {
    const date = new Date(parseInt(timestamp) * 1000)
      .toISOString()
      .split("T")[0];
    return { date, count: calenderSubmission[timestamp] };
  });

  function mergeHeatmapAndDailySolvedProblems(
    heatmapData,
    dailySolvedProblems
  ) {
    const dailySolvedMap = new Map(
      dailySolvedProblems.map(({ date, count }) => [date, count])
    );

    const mergedData = heatmapData.map(({ date, count }) => {
      const dailySolvedCount = dailySolvedMap.get(date) || 0;
      return {
        date,
        count: count + dailySolvedCount,
      };
    });

    dailySolvedProblems.forEach(({ date, count }) => {
      if (!mergedData.some((item) => item.date === date)) {
        mergedData.push({
          date,
          count,
        });
      }
    });

    return mergedData.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  const mergedData = mergeHeatmapAndDailySolvedProblems(
    heatmapData,
    dailySolvedProblem
  );
  // console.log(mergedData);

  const leetContestSolvedSum = (
    data.leetCodeData?.userContestDetails?.contestParticipation ?? []
  ).reduce((sum, p) => sum + (p?.problemsSolved ?? 0), 0);

  const topData = [
    {
      image: "/svgs/puzzle.svg",
      title: "Contest problems solved",
      count:
        (data.codeForcesData?.problemsSolvedCount ?? 0) + leetContestSolvedSum,
    },
    {
      image: "/svgs/trophy.svg",
      title: "Contests played",
      count: totalContests ?? 0,
    },
    {
      image: "/svgs/active-days.svg",
      title: "Active days",
      count: mergedData.filter((d) => d.count > 0).length,
    },
  ];
  // console.log(data.codeForcesData);


  return (
    <div className="pf-main">
      <div className="pf-stats">
        {topData.map((item) => (
          <div key={item.title} className="panel pf-stat">
            <span className="pf-stat__num">{item.count}</span>
            <span className="stat__label">{item.title}</span>
          </div>
        ))}
      </div>

      <ActivityHeatmap heatMapData={mergedData} />

      <div className="pf-cols">
        <div className="panel panel--pad pf-card">
          <div className="pf-card__head">
            <h3 className="pf-card__title">Problems solved</h3>
            <div className="chips" role="tablist" aria-label="Platform" style={{ gap: 6 }}>
              {[
                ["leetcode", "LeetCode"],
                ["codeforces", "Codeforces"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={activeTab === key}
                  onClick={() => setActiveTab(key)}
                  className={`chip-btn${activeTab === key ? " is-active" : ""}`}
                  style={{ padding: "7px 14px", fontSize: "0.72rem" }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <p className="pf-card__sub">
            {activeTab === "leetcode" ? "By difficulty on LeetCode" : "In contests, by rating (<1200, 1200-1799, 1800+)"}
          </p>
          <div className="pf-donut">
            <DoughnutChart
              data={activeTab === "leetcode" ? data.leetCodeData?.acSubmissionNum : data.codeForcesData?.topicAnalysis}
            />
          </div>
        </div>

        <div className="panel panel--pad pf-card">
          <RatingChart data={data} />
        </div>
      </div>

      <div className="panel panel--pad pf-card">
        <div className="pf-card__head">
          <h3 className="pf-card__title">Contest history</h3>
          <Link href="/contest" className="link-arrow">
            Upcoming contests &rarr;
          </Link>
        </div>
        <ProfileContestTable data={data} />
      </div>

      <div className="panel panel--pad pf-card">
        <div className="pf-card__head">
          <h3 className="pf-card__title">Topics</h3>
        </div>
        <TopicAnalysis data={topicWiseAnalysis} />
      </div>
    </div>
  );
}

export default MainLayout;
