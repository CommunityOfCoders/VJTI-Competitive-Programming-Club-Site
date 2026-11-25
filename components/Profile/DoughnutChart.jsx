"use client";
import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const DoughnutChart = ({ data }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const isLeetCode = Array.isArray(data);
  let easy = 0,
    medium = 0,
    hard = 0,
    total = 0;

  if (isLeetCode && data?.length >= 4) {
    // LeetCode structure
    total = data[0]?.count || 0;
    easy = data[1]?.count || 0;
    medium = data[2]?.count || 0;
    hard = data[3]?.count || 0;
  } else if (data && typeof data === "object") {
    // Codeforces structure
    easy = data.fundamental?.reduce(
      (sum, topic) => sum + (topic.problemsSolved || 0),
      0
    );
    medium = data.intermediate?.reduce(
      (sum, topic) => sum + (topic.problemsSolved || 0),
      0
    );
    hard = data.advanced?.reduce(
      (sum, topic) => sum + (topic.problemsSolved || 0),
      0
    );
    total = easy + medium + hard;
  }

  useEffect(() => {
    if (!chartRef.current) return;
    const ctx = chartRef.current.getContext("2d");

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Easy", "Medium", "Hard"],
        datasets: [
          {
            label: "DSA Progress",
            data: [easy, medium, hard],
            backgroundColor: ["#1DB954", "#8FDCAA", "#F5F7F5"],
            borderColor: "#151817",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        elements: { arc: { borderWidth: 2 } },
        cutout: "70%",
      },
    });

    return () => chartInstanceRef.current?.destroy();
  }, [easy, medium, hard]);

  return (
    <>
      <div className="pf-donut__ring">
        <canvas ref={chartRef} width="30" height="30" className="doughnutPie" />
        <p className="pf-donut__total">
          {total}
          <small>solved</small>
        </p>
      </div>
      <div className="pf-donut__legend">
        {[
          { label: "Easy", value: easy, color: "#1DB954" },
          { label: "Medium", value: medium, color: "#8FDCAA" },
          { label: "Hard", value: hard, color: "#F5F7F5" },
        ].map((item, index) => (
          <div key={index} className="pf-donut__row">
            <span className="pf-donut__key">
              <i style={{ backgroundColor: item.color }} />
              {item.label}
            </span>
            <span className="pf-donut__val">{item.value}</span>
          </div>
        ))}
      </div>
    </>
  );
};

export default DoughnutChart;
