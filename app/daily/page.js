"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { ArrowUpRight, RotateCcw } from "lucide-react";
import DailyLeaderboard from "@/components/DailyLeaderboard";
import DailyCalendar from "@/components/DailyCalendar";

const CACHE_MS = 5 * 60 * 1000;

const urlFor = (date) => (date ? `/api/daily?date=${date}` : "/api/daily");
const readDateParam = () => new URLSearchParams(window.location.search).get("date") || "";

export default function DailyQuestionsPage() {
  const [data, setData] = useState(null);
  const [meta, setMeta] = useState({ today: "", availableDates: [] });
  const [selectedDate, setSelectedDate] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const cache = useRef(new Map());
  const latestRequest = useRef(0);

  const load = useCallback(async (date) => {
    const requestId = ++latestRequest.current;
    const key = urlFor(date);
    setError(null);

    const apply = (payload) => {
      setData(payload);
      setSelectedDate(payload.date);
      setMeta({ today: payload.today, availableDates: payload.availableDates });
      setLoading(false);
    };

    const cached = cache.current.get(key);
    if (cached && Date.now() - cached.at < CACHE_MS) {
      apply(cached.payload);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(key);
      if (requestId !== latestRequest.current) return;
      cache.current.set(key, { payload: response.data, at: Date.now() });
      apply(response.data);
    } catch (err) {
      if (requestId !== latestRequest.current) return;
      const payload = err.response?.data;
      setData(null);
      setError(payload?.error || "Could not load the questions");
      if (payload?.availableDates) {
        setMeta({ today: payload.today, availableDates: payload.availableDates });
      }
      setSelectedDate(date);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(readDateParam());
    const onPopState = () => load(readDateParam());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [load]);

  const selectDate = (date) => {
    const target = date === meta.today ? "" : date;
    if (date === selectedDate && !error) return;
    const url = new URL(window.location.href);
    if (target) {
      url.searchParams.set("date", target);
    } else {
      url.searchParams.delete("date");
    }
    if (url.href !== window.location.href) window.history.pushState({}, "", url);
    load(target);
  };

  const isPast = Boolean(data && !data.stale && meta.today && selectedDate !== meta.today);

  return (
    <div className="container page">
      <header className="page-head">
        <span className="eyebrow">Codeforces · Every day</span>
        <h1 className="page-title">
          Daily <span className="mark">questions.</span>
        </h1>
        <p className="page-lede">
          Six fresh Codeforces problems every day, rated 800 to 2000. Solve them on Codeforces and the
          leaderboard below picks it up.
        </p>
      </header>

      <div className="dq-bar">
        <DailyCalendar
          selectedDate={selectedDate}
          onSelectDate={selectDate}
          availableDates={meta.availableDates}
          todayDate={meta.today}
        />
        {isPast && <p className="dq-hint">Practice mode: past questions don&apos;t count for the leaderboard.</p>}
        {data?.stale && <p className="dq-hint">Today&apos;s set isn&apos;t ready yet, showing the latest one.</p>}
      </div>

      {loading && !data && (
        <div className="dq-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skel" style={{ height: 150, borderRadius: "var(--r-md)" }} />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="panel panel--flat empty">
          <p className="empty__title">{error}</p>
          <p className="empty__text">Pick a highlighted date in the calendar to see its questions.</p>
          {meta.today && (
            <button onClick={() => selectDate(meta.today)} className="btn btn--ghost" style={{ marginTop: 22 }}>
              <RotateCcw /> Back to today
            </button>
          )}
        </div>
      )}

      {data && (
        <div className={`dq-grid${loading ? " is-loading" : ""}`}>
          {data.problems.map((problem) => (
            <a
              key={problem.id}
              href={problem.url}
              target="_blank"
              rel="noopener noreferrer"
              className="panel panel--hover dq-card"
            >
              <div className="dq-card__top">
                <span className="dq-card__slot">Q{problem.slot}</span>
                <span className="tag tag--accent">{problem.rating}</span>
                <ArrowUpRight className="dq-card__go" />
              </div>
              <h3 className="panel__title">{problem.name}</h3>
              <div className="chips" style={{ gap: 6 }}>
                {problem.tags.map((tag) => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            </a>
          ))}
        </div>
      )}

      <DailyLeaderboard questionCount={data?.count ?? 6} />
    </div>
  );
}
