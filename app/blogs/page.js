import React from "react";
import { getAllBlogs } from "@/lib/blogs";
import BlogsClient from "@/components/BlogsClient";

export const metadata = {
  title: "Blogs & Editorials | CP Club",
  description: "Tutorials, algorithm breakdowns, and competitive programming tips.",
};

export default function BlogsPage() {
  const blogs = getAllBlogs();
  const authors = new Set(blogs.map((b) => b.author)).size;
  const minutes = blogs.reduce((sum, b) => sum + b.readingTime, 0);

  return (
    <div className="container page">
      <header className="page-head">
        <span className="eyebrow">Written by club members</span>
        <h1 className="page-title">
          Articles &amp; <span className="mark">insights.</span>
        </h1>
        <p className="page-lede">
          Tutorials, problem-solving write-ups and algorithm guides, from game theory to segment trees.
        </p>
        <div className="stat-row">
          <div className="stat">
            <span className="stat__num">{blogs.length}</span>
            <span className="stat__label">Articles</span>
          </div>
          <div className="stat">
            <span className="stat__num">{minutes}</span>
            <span className="stat__label">Minutes of reading</span>
          </div>
          <div className="stat">
            <span className="stat__num">{authors}</span>
            <span className="stat__label">{authors === 1 ? "Author" : "Authors"}</span>
          </div>
        </div>
      </header>

      <BlogsClient initialBlogs={blogs} />
    </div>
  );
}
