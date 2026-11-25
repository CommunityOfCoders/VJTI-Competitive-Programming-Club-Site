import React, { useState } from "react";

const TopicAnalysis = ({ data }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // one entry per topic across all levels, most solved first
  const byTag = new Map();
  [...(data?.advanced || []), ...(data?.intermediate || []), ...(data?.fundamental || [])].forEach((t) => {
    const key = t.tagSlug || t.tagName;
    const prev = byTag.get(key);
    if (prev) prev.problemsSolved += t.problemsSolved;
    else byTag.set(key, { ...t });
  });
  const mergedTopics = [...byTag.values()].sort((a, b) => b.problemsSolved - a.problemsSolved);
  const top = mergedTopics[0]?.problemsSolved || 1;

  // Determine how many items to display based on the expanded state
  const displayedItems = isExpanded ? mergedTopics : mergedTopics.slice(0, 15);

  return (
    <div>
      {mergedTopics.length === 0 && <p className="pf-card__sub">No solved problems to break down yet.</p>}
      <div className="pf-topics">
        {displayedItems.map((item) => (
          <div key={item.tagSlug || item.tagName} className="pf-topic">
            <span className="pf-topic__name">{item.tagName}</span>
            <span className="pf-topic__num">{item.problemsSolved}</span>
            <span className="bar pf-topic__bar">
              <span style={{ width: `${Math.max(4, (item.problemsSolved / top) * 100)}%` }} />
            </span>
          </div>
        ))}
      </div>
      {mergedTopics.length > 15 && (
        <button onClick={() => setIsExpanded(!isExpanded)} className="link-arrow" style={{ marginTop: 18 }}>
          {isExpanded ? "Show fewer" : `Show all ${mergedTopics.length} topics`}
        </button>
      )}
    </div>
  );
};

export default TopicAnalysis;
