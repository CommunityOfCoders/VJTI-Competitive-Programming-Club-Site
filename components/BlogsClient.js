"use client";
import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ArrowUpRight } from "lucide-react";

const formatDate = (iso) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

export default function BlogsClient({ initialBlogs }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");

  // tags sorted by how many articles use them, most common first
  const allTags = useMemo(() => {
    const counts = new Map();
    initialBlogs.forEach((blog) => blog.tags?.forEach((t) => counts.set(t, (counts.get(t) || 0) + 1)));
    return ["all", ...[...counts.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t)];
  }, [initialBlogs]);

  const filteredBlogs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return initialBlogs.filter((blog) => {
      const matchesSearch =
        !q ||
        blog.title.toLowerCase().includes(q) ||
        blog.description.toLowerCase().includes(q) ||
        blog.tags?.some((t) => t.toLowerCase().includes(q));
      const matchesTag = selectedTag === "all" || blog.tags?.includes(selectedTag);
      return matchesSearch && matchesTag;
    });
  }, [initialBlogs, searchQuery, selectedTag]);

  return (
    <div>
      <div className="bl-tools">
        <div className="field-wrap bl-search">
          <Search />
          <input
            type="text"
            placeholder="Search articles"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="field"
            aria-label="Search articles"
          />
        </div>
        <div className="chips chips--scroll" aria-label="Filter by tag">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              aria-pressed={selectedTag === tag}
              className={`chip-btn${selectedTag === tag ? " is-active" : ""}`}
            >
              {tag === "all" ? "All" : tag}
            </button>
          ))}
        </div>
      </div>

      {filteredBlogs.length === 0 ? (
        <div className="panel panel--flat empty">
          <p className="empty__title">No articles match that</p>
          <p className="empty__text">Try another word, or clear the tag filter.</p>
        </div>
      ) : (
        <div className="bl-grid">
          {filteredBlogs.map((blog, i) => (
            <Link key={blog.slug} href={`/blogs/${blog.slug}`} className="panel panel--hover bl-card">
              <div className="bl-card__top">
                <span className="bl-card__num">{String(i + 1).padStart(2, "0")}</span>
                <ArrowUpRight className="bl-card__go" />
              </div>
              <h2 className="panel__title bl-card__title">{blog.title}</h2>
              <p className="panel__text bl-card__desc">{blog.description}</p>
              <div className="chips" style={{ gap: 6 }}>
                {blog.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
              <div className="panel__foot bl-card__meta">
                <span>{blog.author}</span>
                <span>
                  {formatDate(blog.date)} · {blog.readingTime} min read
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
