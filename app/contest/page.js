'use client'

import { useState, useEffect, useMemo } from "react"
import { ChevronLeft, ChevronRight, ArrowUpRight, Clock, Calendar, Trophy, AlertCircle } from "lucide-react"
import axios from "axios"
import dayjs from "dayjs"
import Link from "next/link"
import Image from "next/image"

const platformLogos = {
  codeforces: "https://sta.codeforces.com/s/44094/favicon-32x32.png",
  leetcode: "https://leetcode.com/static/images/LeetCode_logo.png",
  codechef: "https://www.codechef.com/favicon.ico",
  atcoder: "https://atcoder.jp/favicon.ico",
}

const platformNames = {
  codeforces: "Codeforces",
  leetcode: "LeetCode",
  codechef: "CodeChef",
  atcoder: "AtCoder",
}

const platformName = (p = "") => platformNames[p] || p.charAt(0).toUpperCase() + p.slice(1)

const TABS = [
  { key: "upcoming", label: "Upcoming" },
  { key: "previous", label: "Past" },
  { key: "calendar", label: "Calendar" },
]

// Countdown Timer Component
function CountdownTimer({ contestStartDate }) {
  const [timeLeft, setTimeLeft] = useState("")

  useEffect(() => {
    const tick = () => {
      const diff = dayjs(contestStartDate).diff(dayjs())
      if (diff <= 0) {
        setTimeLeft("Live now")
        return false
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      if (days > 0) setTimeLeft(`${days}d ${hours}h ${minutes}m`)
      else if (hours > 0) setTimeLeft(`${hours}h ${minutes}m`)
      else setTimeLeft(`${minutes}m ${String(seconds).padStart(2, "0")}s`)
      return true
    }
    if (!tick()) return undefined
    const timer = setInterval(() => {
      if (!tick()) clearInterval(timer)
    }, 1000)
    return () => clearInterval(timer)
  }, [contestStartDate])

  return (
    <span className="ct-card__count">
      <Clock /> Starts in {timeLeft}
    </span>
  )
}

function PlatformMark({ platform, size = 20 }) {
  const src = platformLogos[platform]
  if (!src) {
    return <span className="ct-mark" style={{ width: size, height: size }}>{platformName(platform).charAt(0)}</span>
  }
  return <Image src={src} alt="" width={size} height={size} className="ct-logo" style={{ width: size, height: size }} />
}

function ContestGrid({ contests, emptyText }) {
  if (contests.length === 0) {
    return (
      <div className="panel panel--flat empty">
        <p className="empty__title">Nothing here yet</p>
        <p className="empty__text">{emptyText}</p>
      </div>
    )
  }
  return (
    <div className="ct-grid">
      {contests.map((event) => {
        const isUpcoming = dayjs(event.contestStartDate).isAfter(dayjs())
        const hasBoard = (event.platform === 'leetcode' || event.platform === 'codeforces') && !isUpcoming

        return (
          <article key={`${event.platform}-${event.contestCode}-${event.contestStartDate}`} className="panel panel--hover ct-card">
            <div className="ct-card__top">
              <span className="ct-card__platform">
                <PlatformMark platform={event.platform} />
                {platformName(event.platform)}
              </span>
              <span className={`tag${isUpcoming ? " tag--accent" : ""}`}>{isUpcoming ? "Upcoming" : "Past"}</span>
            </div>

            <h3 className="panel__title ct-card__title">{event.contestName}</h3>

            <p className="ct-card__date">
              <Calendar /> {dayjs(event.contestStartDate).format("ddd, D MMM · HH:mm")}
            </p>
            {isUpcoming && <CountdownTimer contestStartDate={event.contestStartDate} />}

            <div className="panel__foot ct-card__foot">
              <a href={event.contestUrl} target="_blank" rel="noopener noreferrer" className="link-arrow">
                Open contest <ArrowUpRight />
              </a>
              {hasBoard && (
                <Link
                  href={`/pastcontest?contestId=${encodeURIComponent(event.contestCode)}&contestName=${encodeURIComponent(event.contestName)}&platform=${event.platform}`}
                  className="link-arrow ct-card__board"
                >
                  <Trophy /> Club standings
                </Link>
              )}
            </div>
          </article>
        )
      })}
    </div>
  )
}

export default function Component() {
  const [currentDate, setCurrentDate] = useState(dayjs())
  const [contests, setContests] = useState({ previous: [], upcoming: [] })
  const [status, setStatus] = useState("loading")
  const [activeTab, setActiveTab] = useState("upcoming")
  const [pickedDay, setPickedDay] = useState(dayjs().format('YYYY-MM-DD'))

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const startDate = dayjs().subtract(3, 'months').startOf('day').toISOString()
        const endDate = dayjs().add(3, 'months').endOf('day').toISOString()

        const response = await axios.get("https://node.codolio.com/api/contest-calendar/v1/all/get-contests", {
          params: { startDate, endDate }
        })

        const allContests = (response.data?.data || [])
          .filter(event => event.platform && event.platform !== 'geeksforgeeks')
          .sort((a, b) => new Date(a.contestStartDate) - new Date(b.contestStartDate))

        const now = dayjs()
        const previousContests = allContests
          .filter(contest => dayjs(contest.contestStartDate).isBefore(now))
          .sort((a, b) => new Date(b.contestStartDate) - new Date(a.contestStartDate))
        const upcomingContests = allContests.filter(contest => dayjs(contest.contestStartDate).isAfter(now))

        setContests({ previous: previousContests, upcoming: upcomingContests })
        setStatus("ready")
      } catch (error) {
        console.error("Error fetching contests:", error)
        setStatus("error")
      }
    }

    fetchContests()
  }, [])

  const eventsByDate = useMemo(
    () =>
      [...contests.previous, ...contests.upcoming].reduce((acc, event) => {
        const eventDate = dayjs(event.contestStartDate).format('YYYY-MM-DD')
        if (!acc[eventDate]) acc[eventDate] = []
        acc[eventDate].push(event)
        return acc
      }, {}),
    [contests]
  )

  const previousMonth = () => setCurrentDate(currentDate.subtract(1, 'month'))
  const nextMonth = () => setCurrentDate(currentDate.add(1, 'month'))
  const daysInMonth = Array.from({ length: currentDate.daysInMonth() }, (_, i) => i + 1)
  const startDayOfWeek = currentDate.startOf('month').day()
  const nextUp = contests.upcoming[0]

  const counts = { upcoming: contests.upcoming.length, previous: contests.previous.length }

  return (
    <div className="container page">
      <header className="page-head">
        <span className="eyebrow">Codeforces · LeetCode · CodeChef · AtCoder</span>
        <h1 className="page-title">
          Contest <span className="mark">calendar.</span>
        </h1>
        <p className="page-lede">
          Every rated round on the big four platforms, three months back and three months ahead. Past
          Codeforces and LeetCode rounds show how the club placed.
        </p>
        <div className="stat-row">
          <div className="stat">
            <span className="stat__num">{status === "ready" ? counts.upcoming : "-"}</span>
            <span className="stat__label">Upcoming rounds</span>
          </div>
          <div className="stat">
            <span className="stat__num">{status === "ready" ? counts.previous : "-"}</span>
            <span className="stat__label">In the last 3 months</span>
          </div>
          {nextUp && (
            <div className="stat">
              <span className="stat__num is-accent">{dayjs(nextUp.contestStartDate).format("D MMM")}</span>
              <span className="stat__label">Next: {platformName(nextUp.platform)}</span>
            </div>
          )}
        </div>
      </header>

      <div className="chips chips--scroll" role="tablist" aria-label="Contest view" style={{ marginBottom: 24 }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`chip-btn${activeTab === tab.key ? " is-active" : ""}`}
          >
            {tab.label}
            {tab.key !== "calendar" && status === "ready" && <span className="chip-btn__count">{counts[tab.key]}</span>}
          </button>
        ))}
      </div>

      {status === "loading" && activeTab !== "calendar" && (
        <div className="ct-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skel" style={{ height: 210, borderRadius: "var(--r-md)" }} />
          ))}
        </div>
      )}

      {status === "error" && (
        <div className="alert">
          <AlertCircle />
          <span>Could not reach the contest calendar right now. Try again in a minute.</span>
        </div>
      )}

      {status === "ready" && activeTab === "upcoming" && (
        <ContestGrid contests={contests.upcoming} emptyText="No upcoming rounds are listed yet." />
      )}
      {status === "ready" && activeTab === "previous" && (
        <ContestGrid contests={contests.previous} emptyText="No rounds in the last three months." />
      )}

      {activeTab === "calendar" && (
        <div className="panel panel--pad">
          <div className="ct-cal__head">
            <h2 className="sub-head__title">{currentDate.format("MMMM YYYY")}</h2>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={previousMonth} className="icon-btn" aria-label="Previous month">
                <ChevronLeft />
              </button>
              <button onClick={nextMonth} className="icon-btn" aria-label="Next month">
                <ChevronRight />
              </button>
            </div>
          </div>

          <div className="ct-cal">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="ct-cal__dow">{day}</div>
            ))}

            {Array.from({ length: startDayOfWeek }, (_, i) => (
              <div key={`empty-${i}`} className="ct-cal__cell is-blank" />
            ))}

            {daysInMonth.map((day) => {
              const date = currentDate.date(day)
              const events = eventsByDate[date.format('YYYY-MM-DD')]
              const isToday = date.isSame(dayjs(), 'day')

              return (
                <div
                  key={day}
                  className={`ct-cal__cell${events ? " has-events" : ""}${isToday ? " is-today" : ""}${pickedDay === date.format('YYYY-MM-DD') ? " is-picked" : ""}`}
                  onClick={() => setPickedDay(date.format('YYYY-MM-DD'))}
                >
                  <span className="ct-cal__day">{day}</span>
                  {events && (
                    <div className="ct-cal__events">
                      {events.slice(0, 2).map((event) => (
                        <a
                          key={`${event.platform}-${event.contestCode}`}
                          href={event.contestUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ct-cal__event"
                          title={`${event.contestName} · ${dayjs(event.contestStartDate).format("HH:mm")}`}
                        >
                          {platformName(event.platform)}
                        </a>
                      ))}
                      {events.length > 2 && <span className="ct-cal__more">+{events.length - 2}</span>}
                    </div>
                  )}
                  {events && <span className="ct-cal__dots" aria-hidden="true">{events.length}</span>}
                </div>
              )
            })}
          </div>

          <div className="ct-day">
            <p className="label">{dayjs(pickedDay).format("dddd, D MMMM")}</p>
            {(eventsByDate[pickedDay] || []).length === 0 ? (
              <p className="ct-day__none">No rounds on this day. Tap a highlighted day.</p>
            ) : (
              <ul className="ct-day__list">
                {eventsByDate[pickedDay].map((event) => (
                  <li key={`${event.platform}-${event.contestCode}`}>
                    <a href={event.contestUrl} target="_blank" rel="noopener noreferrer" className="ct-day__item">
                      <PlatformMark platform={event.platform} size={18} />
                      <span className="ct-day__name">{event.contestName}</span>
                      <span className="ct-day__time">{dayjs(event.contestStartDate).format("HH:mm")}</span>
                      <ArrowUpRight />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
