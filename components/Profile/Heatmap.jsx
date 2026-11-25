import React, { useState } from 'react';
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { Tooltip } from "react-tooltip";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ActivityHeatmap = ({ heatMapData }) => {
    const [timeOffset, setTimeOffset] = useState(0);

    // Calculate date ranges (9 months)
    const calculateDateRange = () => {
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() - (9 * timeOffset));
        const startDate = new Date(endDate);
        startDate.setMonth(startDate.getMonth() - 9);
        return { startDate, endDate };
    };

    const { startDate, endDate } = calculateDateRange();

    // Transform data to match calendar heatmap format
    const transformedData = heatMapData.map((item) => ({
        date: item.date,
        count: item.count,
    }));

    // Calculate total submissions
    const totalSubmissions = heatMapData.reduce((sum, item) => sum + item.count, 0);

    const monthLabels = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    // Dynamic color strength based on dataset
    const maxCount = Math.max(...heatMapData.map((d) => d.count), 1);

    const getIntensityLevel = (count) => {
        if (!count || count === 0) return 0;
        // ratio from 0..1
        const ratio = count / maxCount;
        const level = Math.ceil(ratio * 4);
        return Math.min(Math.max(level, 1), 4);
    };

    const getClassForValue = (value) => {
        if (!value || value.count === 0) return "color-empty";
        const level = getIntensityLevel(value.count);
        return `color-scale-${level}`;
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const handlePrevious = () => {
        setTimeOffset(prev => {
            const candidateOffset = prev + 1;
            const candidateEnd = new Date();
            candidateEnd.setMonth(candidateEnd.getMonth() - (9 * candidateOffset));

            const earliestAllowed = new Date();
            earliestAllowed.setFullYear(earliestAllowed.getFullYear() - 4);

            // Prevent going earlier than 4 years before today
            if (candidateEnd < earliestAllowed) return prev;
            return candidateOffset;
        });
    };

    const handleNext = () => {
        setTimeOffset(prev => Math.max(0, prev - 1));
    };

    const LEVELS = ['#1D211F', 'rgba(29, 185, 84, 0.3)', 'rgba(29, 185, 84, 0.55)', 'rgba(29, 185, 84, 0.8)', '#1DB954'];

    return (
        <div className="panel panel--pad pf-card pf-heat">
            <style>{`
        .pf-heat .react-calendar-heatmap text { font-size: 9px; fill: rgba(245, 247, 245, 0.38); font-family: 'DM Mono', ui-monospace, monospace; }
        .pf-heat .react-calendar-heatmap rect { rx: 2; }
        .pf-heat .react-calendar-heatmap .color-empty { fill: ${LEVELS[0]}; }
        .pf-heat .react-calendar-heatmap .color-scale-1 { fill: ${LEVELS[1]}; }
        .pf-heat .react-calendar-heatmap .color-scale-2 { fill: ${LEVELS[2]}; }
        .pf-heat .react-calendar-heatmap .color-scale-3 { fill: ${LEVELS[3]}; }
        .pf-heat .react-calendar-heatmap .color-scale-4 { fill: ${LEVELS[4]}; }
        .pf-heat .react-calendar-heatmap rect:hover { stroke: #F5F7F5; stroke-width: 1px; }
      `}</style>

            <div className="pf-card__head">
                <h3 className="pf-card__title">
                    Activity <span className="pf-card__count">{totalSubmissions} submissions</span>
                </h3>
                <div className="pf-heat__nav">
                    <span className="pf-heat__range">
                        {startDate.getFullYear() === endDate.getFullYear()
                            ? endDate.getFullYear()
                            : `${startDate.getFullYear()} - ${endDate.getFullYear()}`}
                    </span>
                    <button onClick={handlePrevious} className="icon-btn icon-btn--sm" aria-label="Earlier months">
                        <ChevronLeft />
                    </button>
                    <button
                        onClick={handleNext}
                        className="icon-btn icon-btn--sm"
                        disabled={timeOffset === 0}
                        aria-label="Later months"
                    >
                        <ChevronRight />
                    </button>
                </div>
            </div>

            <div className="pf-heat__grid">
                <CalendarHeatmap
                    startDate={startDate}
                    endDate={endDate}
                    values={transformedData}
                    classForValue={getClassForValue}
                    tooltipDataAttrs={(value) => ({
                        "data-tooltip-id": "heatmap-tooltip",
                        "data-tooltip-content": value && value.date
                            ? `${formatDate(value.date)}: ${value.count} submission${value.count !== 1 ? 's' : ''}`
                            : 'No submissions',
                    })}
                    showWeekdayLabels={true}
                    weekdayLabels={['S', 'M', 'T', 'W', 'T', 'F', 'S']}
                    monthLabels={monthLabels}
                    gutterSize={3}
                />
            </div>

            <div className="pf-heat__legend">
                <span>Less</span>
                {LEVELS.map((c) => (
                    <i key={c} style={{ background: c }} />
                ))}
                <span>More</span>
            </div>

            <Tooltip
                id="heatmap-tooltip"
                style={{
                    backgroundColor: '#0E100F',
                    color: '#F5F7F5',
                    borderRadius: '8px',
                    padding: '7px 11px',
                    fontSize: '12px',
                    fontFamily: "'DM Mono', ui-monospace, monospace",
                    boxShadow: '0 0 0 1px rgba(245, 247, 245, 0.18)',
                    zIndex: 50,
                }}
            />
        </div>
    );
};

export default ActivityHeatmap;