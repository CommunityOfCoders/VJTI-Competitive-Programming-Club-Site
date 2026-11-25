"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { buildMonthGrid, neighbourDate } from "@/lib/daily/schedule.mjs";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

const monthOf = (date) => {
  const [year, month] = date.split("-").map(Number);
  return { year, month: month - 1 };
};

const monthKey = ({ year, month }) => `${year}-${String(month + 1).padStart(2, "0")}`;

const formatLong = (date) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });


export default function DailyCalendar({ selectedDate, onSelectDate, availableDates, todayDate }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(null);
  const rootRef = useRef(null);

  const available = useMemo(() => new Set(availableDates), [availableDates]);
  const anchor = selectedDate || todayDate;

  useEffect(() => {
    if (anchor) setView(monthOf(anchor));
  }, [anchor, open]);

  useEffect(() => {
    if (!open) return undefined;
    const closeOnOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  if (!anchor || availableDates.length === 0) return null;

  const previousDate = neighbourDate(availableDates, selectedDate || anchor, -1);
  const nextDate = neighbourDate(availableDates, selectedDate || anchor, 1);
  const isToday = selectedDate === todayDate;
  const sorted = [...availableDates].sort();
  const firstMonth = sorted[0].slice(0, 7);
  const lastMonth = (todayDate || sorted[sorted.length - 1]).slice(0, 7);
  const currentMonth = view ? monthKey(view) : firstMonth;

  const shiftMonth = (delta) => {
    const next = new Date(Date.UTC(view.year, view.month + delta, 1));
    setView({ year: next.getUTCFullYear(), month: next.getUTCMonth() });
  };

  const choose = (date) => {
    setOpen(false);
    onSelectDate(date);
  };

  return (
    <div ref={rootRef} className="dc">
      <div className="dc__row">
        <button
          onClick={() => previousDate && choose(previousDate)}
          disabled={!previousDate}
          aria-label="Previous day with questions"
          className="icon-btn"
        >
          <ChevronLeft />
        </button>

        <button
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-haspopup="dialog"
          className={`dc__toggle${open ? " is-open" : ""}`}
        >
          <CalendarDays className="dc__icon" />
          <span className="dc__date">{selectedDate ? formatLong(selectedDate) : "Select a date"}</span>
          <span className={`tag${isToday ? " tag--solid" : ""}`}>{isToday ? "Today" : "Past"}</span>
          <ChevronDown className="dc__chev" />
        </button>

        <button
          onClick={() => nextDate && choose(nextDate)}
          disabled={!nextDate}
          aria-label="Next day with questions"
          className="icon-btn"
        >
          <ChevronRight />
        </button>

        {!isToday && todayDate && available.has(todayDate) && (
          <button
            onClick={() => choose(todayDate)}
            className="btn btn--ghost btn--sm"
          >
            Today
          </button>
        )}
      </div>

      {open && view && (
        <div
          role="dialog"
          aria-label="Choose a date"
          className="dc__pop"
        >
          <div className="dc__pop-head">
            <button
              onClick={() => shiftMonth(-1)}
              disabled={currentMonth <= firstMonth}
              aria-label="Previous month"
              className="icon-btn icon-btn--sm"
            >
              <ChevronLeft />
            </button>
            <span className="dc__month">
              {new Date(Date.UTC(view.year, view.month, 1)).toLocaleString("en-US", {
                month: "long",
                year: "numeric",
                timeZone: "UTC",
              })}
            </span>
            <button
              onClick={() => shiftMonth(1)}
              disabled={currentMonth >= lastMonth}
              aria-label="Next month"
              className="icon-btn icon-btn--sm"
            >
              <ChevronRight />
            </button>
          </div>

          <div className="dc__grid">
            {WEEKDAYS.map((day, index) => (
              <span key={index} className="dc__dow">
                {day}
              </span>
            ))}
            {buildMonthGrid(view.year, view.month).map((date, index) => {
              if (!date) return <span key={`blank-${index}`} />;
              const hasQuestions = available.has(date);
              const isSelected = date === selectedDate;
              const style = isSelected ? "is-selected" : hasQuestions ? "has-q" : "";
              return (
                <button
                  key={date}
                  disabled={!hasQuestions}
                  onClick={() => choose(date)}
                  aria-label={formatLong(date)}
                  aria-current={date === todayDate ? "date" : undefined}
                  className={`dc__day ${style}${date === todayDate ? " is-today" : ""}`}
                >
                  {Number(date.slice(8))}
                </button>
              );
            })}
          </div>

          <p className="dc__legend">
            <span className="dc__legend-dot" />
            Highlighted days have questions
          </p>
        </div>
      )}
    </div>
  );
}
