"use client";
import React, { useRef, useEffect, useMemo } from "react";
import { Chart } from "chart.js/auto";

const MONO = "'DM Mono', ui-monospace, monospace";

// Both platforms are plotted against real time (x = contest date), so a
// LeetCode round and a Codeforces round from the same week line up.
const RatingChart = ({ data }) => {
  const chartRef = useRef(null);

  const series = useMemo(() => {
    const lc = [...(data.contestsData?.leetCodeContestsData || [])]
      .filter((item) => item?.contest?.startTime && item.rating)
      .sort((a, b) => a.contest.startTime - b.contest.startTime)
      .map((item) => ({ x: item.contest.startTime * 1000, y: Math.round(item.rating) }));
    const cf = [...(data.contestsData?.codeForcesContestsData || [])]
      .filter((item) => item?.ratingUpdateTimeSeconds)
      .sort((a, b) => a.ratingUpdateTimeSeconds - b.ratingUpdateTimeSeconds)
      .map((item) => ({ x: item.ratingUpdateTimeSeconds * 1000, y: item.newRating }));
    return { lc, cf };
  }, [data]);

  const hasData = series.lc.length > 0 || series.cf.length > 0;

  useEffect(() => {
    if (!hasData || !chartRef.current) return undefined;
    const ctx = chartRef.current.getContext("2d");

    const fill = (rgb) => {
      const g = ctx.createLinearGradient(0, 0, 0, 260);
      g.addColorStop(0, `rgba(${rgb}, 0.22)`);
      g.addColorStop(1, `rgba(${rgb}, 0)`);
      return g;
    };

    const datasets = [
      series.cf.length > 0 && {
        label: "Codeforces",
        data: series.cf,
        fill: true,
        backgroundColor: fill("29, 185, 84"),
        borderColor: "#1DB954",
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.3,
      },
      series.lc.length > 0 && {
        label: "LeetCode",
        data: series.lc,
        fill: true,
        backgroundColor: fill("245, 247, 245"),
        borderColor: "rgba(245, 247, 245, 0.85)",
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.3,
      },
    ].filter(Boolean);

    const values = [...series.lc, ...series.cf].map((p) => p.y);
    const lo = Math.min(...values);
    const hi = Math.max(...values);

    const chart = new Chart(ctx, {
      type: "line",
      data: { datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "nearest", intersect: false },
        plugins: {
          legend: {
            display: true,
            align: "end",
            labels: { color: "rgba(245, 247, 245, 0.62)", boxWidth: 10, boxHeight: 10, font: { family: MONO, size: 11 } },
          },
          tooltip: {
            backgroundColor: "#0E100F",
            borderColor: "rgba(245, 247, 245, 0.18)",
            borderWidth: 1,
            titleFont: { family: MONO, size: 11 },
            bodyFont: { family: MONO, size: 12 },
            callbacks: {
              title: (items) =>
                new Date(items[0].parsed.x).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
              label: (item) => `${item.dataset.label}: ${item.parsed.y}`,
            },
          },
        },
        scales: {
          x: {
            type: "linear",
            bounds: "data",
            min: Math.min(...[...series.lc, ...series.cf].map((p) => p.x)),
            max: Math.max(...[...series.lc, ...series.cf].map((p) => p.x)),
            grid: { display: false },
            ticks: {
              color: "rgba(245, 247, 245, 0.38)",
              font: { family: MONO, size: 10 },
              maxTicksLimit: 6,
              callback: (v) => new Date(v).toLocaleDateString("en-GB", { month: "short", year: "2-digit" }),
            },
          },
          y: {
            suggestedMin: lo === hi ? 0 : Math.max(0, lo - 100),
            suggestedMax: hi + 150,
            ticks: { color: "rgba(245, 247, 245, 0.38)", font: { family: MONO, size: 10 } },
            grid: { color: "rgba(245, 247, 245, 0.06)" },
            border: { display: false },
          },
        },
      },
    });
    return () => chart.destroy();
  }, [series, hasData]);

  return (
    <div>
      <div className="pf-card__head">
        <h3 className="pf-card__title">Contest rating</h3>
      </div>
      {hasData ? (
        <div className="pf-chart">
          <canvas ref={chartRef} />
        </div>
      ) : (
        <p className="pf-card__sub">No rated contests yet.</p>
      )}
    </div>
  );
};

export default RatingChart;
