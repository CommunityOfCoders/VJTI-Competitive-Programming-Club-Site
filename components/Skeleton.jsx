// Loading placeholders, drawn with the same page kit as the real pages
// so nothing jumps when the data arrives.

const Bar = ({ w, h = 14, style }) => <div className="skel" style={{ width: w, height: h, ...style }} />;

export const LeaderboardSkeleton = () => (
  <div className="container page" aria-busy="true" aria-label="Loading leaderboard">
    <div className="page-head">
      <Bar w={190} h={12} />
      <Bar w="min(560px, 90%)" h={78} style={{ marginTop: 22 }} />
      <Bar w="min(460px, 80%)" h={16} style={{ marginTop: 24 }} />
      <div className="stat-row">
        {[0, 1, 2].map((i) => (
          <div key={i} className="stat">
            <Bar w={64} h={30} />
            <Bar w={96} h={10} style={{ marginTop: 8 }} />
          </div>
        ))}
      </div>
    </div>
    <div className="chips" style={{ marginBottom: 20 }}>
      {[130, 100, 100].map((w, i) => (
        <Bar key={i} w={w} h={38} style={{ borderRadius: 999 }} />
      ))}
    </div>
    <div className="panel panel--clip">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 16px", borderBottom: "1px solid var(--line)" }}
        >
          <Bar w={30} h={30} style={{ borderRadius: 999 }} />
          <Bar w={36} h={36} style={{ borderRadius: 999 }} />
          <Bar w="clamp(90px, 22%, 200px)" />
          <Bar w={60} style={{ marginLeft: "auto" }} />
          <Bar w={60} />
          <Bar w={86} />
        </div>
      ))}
    </div>
  </div>
);

export const ContestTableSkeleton = () => (
  <div className="panel panel--clip" aria-busy="true" aria-label="Loading standings">
    {Array.from({ length: 10 }).map((_, i) => (
      <div
        key={i}
        style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 16px", borderBottom: "1px solid var(--line)" }}
      >
        <Bar w={30} h={30} style={{ borderRadius: 999 }} />
        <Bar w="clamp(120px, 30%, 260px)" />
        <Bar w={100} style={{ marginLeft: "auto" }} />
      </div>
    ))}
  </div>
);
