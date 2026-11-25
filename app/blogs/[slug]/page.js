import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogBySlug, getAllBlogs } from "@/lib/blogs";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export async function generateStaticParams() {
  const blogs = getAllBlogs();
  return blogs.map((blog) => ({ slug: blog.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const blog = getBlogBySlug(slug);
  if (!blog) return {};

  return {
    title: `${blog.title} | CP Club`,
    description: blog.description || blog.title,
  };
}

const formatDate = (iso) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

const markdownComponents = {
  // only links that leave the site open in a new tab
  a: ({ href = "", children }) =>
    /^https?:\/\//.test(href) ? (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ) : (
      <a href={href}>{children}</a>
    ),
  img: ({ src, alt }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt || ""} loading="lazy" />
  ),
  table: ({ children }) => (
    <div className="table-scroll">
      <table>{children}</table>
    </div>
  ),
};

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const blog = getBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  const all = getAllBlogs();
  const at = all.findIndex((b) => b.slug === slug);
  const next = at >= 0 ? all[at + 1] : null;

  return (
    <div className="container page page--narrow">
      <Link href="/blogs" className="link-arrow" style={{ color: "var(--fg-dim)" }}>
        <ArrowLeft /> All articles
      </Link>

      <header className="bp-head">
        <span className="eyebrow">
          {formatDate(blog.date)} · {blog.readingTime} min read
        </span>
        <h1 className="page-title page-title--sm" style={{ marginTop: 18 }}>
          {blog.title}
        </h1>
        <div className="bp-byline">
          <span className="bp-avatar" aria-hidden="true">
            {blog.author.charAt(0)}
          </span>
          <span>
            <span className="bp-author">{blog.author}</span>
            <span className="label" style={{ marginTop: 2 }}>CP Club, VJTI</span>
          </span>
        </div>
        {blog.tags.length > 0 && (
          <div className="chips" style={{ gap: 6, marginTop: 22 }}>
            {blog.tags.map((tag) => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
        )}
      </header>

      <article className="prose">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={markdownComponents}
        >
          {blog.content}
        </ReactMarkdown>
      </article>

      {next && (
        <Link href={`/blogs/${next.slug}`} className="panel panel--hover bp-next">
          <span className="label">Read next</span>
          <span className="panel__title bp-next__title">{next.title}</span>
          <ArrowRight className="bp-next__go" />
        </Link>
      )}
    </div>
  );
}
