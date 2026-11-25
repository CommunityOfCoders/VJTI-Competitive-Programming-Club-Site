"use client"

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { AlertCircle, ArrowUpRight, Check } from 'lucide-react'

const CSESUserPage = () => {
  const params = useParams();
  const userId = params?.userId;
  const [csesData, setCsesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilter, setShowFilter] = useState('all'); // 'all', 'solved', 'unsolved'
  
//   console.log('CSES UserId from params:', userId);
  useEffect(() => {
    if (!userId) return;

    async function fetchSolvedProblems(id) {
      setLoading(true);
      setError(null);
      
      try {
          const cacheKey = `cses:${encodeURIComponent(id)}`;
          const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours
  
          // Try to use cached data first (so UI can show immediately on reload)
          try {
              const raw = localStorage.getItem(cacheKey);
              if (raw) {
                  const parsed = JSON.parse(raw);
                  if (parsed?.ts && (Date.now() - parsed.ts) < CACHE_TTL && parsed.data) {
                      setCsesData(parsed.data);
                      setLoading(false);
                      return; // skip using the network response body
                  }
              }
          } catch (e) {
              console.warn('CSES cache read failed', e);
          }
  
          const response = await fetch(`/api/cses?userId=${encodeURIComponent(id)}`);
          
          if (!response.ok) {
            const err = await response.json().catch(() => ({ error: 'Unknown' }));
            throw new Error(err?.error || 'Failed to fetch CSES data');
          }
          const data = await response.json();
  
          // Cache the fresh response
          try {
              localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data }));
          } catch (e) {
              console.warn('CSES cache write failed', e);
          }
          setCsesData(data);
        } catch (err) {
          setError(err.message);
          console.error('Error fetching CSES data:', err);
        } finally {
          setLoading(false);
        }
        
    }

    fetchSolvedProblems(userId);

  }, [userId]);

  const FILTERS = [
    { key: 'all', label: 'All problems' },
    { key: 'solved', label: 'Solved' },
    { key: 'unsolved', label: 'Unsolved' },
  ];

  const renderProblemCard = (problem, index) => {
    const solved = problem.status === 'Solved';
    return (
      <a
        key={`${problem.id}-${index}`}
        href={problem.link}
        target="_blank"
        rel="noopener noreferrer"
        className={`cs-prob${solved ? ' is-solved' : ''}`}
        title={problem.title}
      >
        <span className="cs-prob__mark" aria-label={solved ? 'Solved' : 'Not solved'}>
          {solved && <Check />}
        </span>
        <span className="cs-prob__body">
          <span className="cs-prob__title">{problem.title}</span>
          <span className="cs-prob__stats">#{problem.id}{problem.stats ? ` · ${problem.stats}` : ''}</span>
        </span>
      </a>
    );
  };

  const renderSection = (sectionName, sectionData) => {
    let problemsToShow = [];

    if (showFilter === 'solved') {
      problemsToShow = sectionData.solved;
    } else if (showFilter === 'unsolved') {
      problemsToShow = sectionData.unsolved;
    } else {
      problemsToShow = [...sectionData.solved, ...sectionData.unsolved];
    }

    if (problemsToShow.length === 0) return null;

    return (
      <section key={sectionName} className="cs-section">
        <div className="cs-section__head">
          <h3 className="cs-section__title">{sectionName}</h3>
          <span className="cs-section__count">
            <b>{sectionData.solvedCount}</b>/{sectionData.totalCount} · {sectionData.completionPercentage}%
          </span>
          <span className="bar"><span style={{ width: `${sectionData.completionPercentage}%` }} /></span>
        </div>
        <div className="cs-grid">
          {problemsToShow.map((problem, index) => renderProblemCard(problem, index))}
        </div>
      </section>
    );
  };

  if (!userId) {
    return (
      <div className="container page page--narrow">
        <div className="panel panel--flat empty">
          <p className="empty__title">No CSES user given</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container page">
      <header className="page-head">
        <span className="eyebrow">CSES Problem Set</span>
        <h1 className="page-title page-title--sm">
          {csesData ? csesData.username : 'CSES progress'}
          <span className="mark">.</span>
        </h1>
        {csesData && (
          <>
            <div className="stat-row">
              <div className="stat">
                <span className="stat__num is-accent">{csesData.solvedProblems}</span>
                <span className="stat__label">Solved</span>
              </div>
              <div className="stat">
                <span className="stat__num">{csesData.totalProblems}</span>
                <span className="stat__label">Problems in the set</span>
              </div>
              <div className="stat">
                <span className="stat__num">{csesData.completionPercentage}%</span>
                <span className="stat__label">Complete</span>
              </div>
            </div>
            <div className="bar" style={{ marginTop: 22, height: 8 }}>
              <span style={{ width: `${csesData.completionPercentage}%` }} />
            </div>
          </>
        )}
      </header>

      {loading && (
        <div className="cs-grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="skel" style={{ height: 66 }} />
          ))}
          <p className="table-note" style={{ gridColumn: '1 / -1' }}>
            Loading from CSES. This can take a moment, the site has to sign in first.
          </p>
        </div>
      )}

      {error && (
        <div className="alert">
          <AlertCircle />
          <span>{error}</span>
        </div>
      )}

      {csesData && (
        <>
          <div className="cs-tools">
            <div className="chips" role="tablist" aria-label="Show problems">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  role="tab"
                  aria-selected={showFilter === f.key}
                  onClick={() => setShowFilter(f.key)}
                  className={`chip-btn${showFilter === f.key ? ' is-active' : ''}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <a
              href={`https://cses.fi/problemset/user/${encodeURIComponent(userId)}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="link-arrow"
            >
              Open on CSES <ArrowUpRight />
            </a>
          </div>

          {csesData.sections &&
            Object.entries(csesData.sections).map(([sectionName, sectionData]) => renderSection(sectionName, sectionData))}
        </>
      )}
    </div>
  );
}

export default CSESUserPage
