import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container nf">
      <div>
        <p className="nf__code">
          4<span>0</span>4
        </p>
        <h1 className="nf__title">This page doesn&apos;t exist.</h1>
        <p className="nf__text">The link may be old, or the member or article was renamed.</p>
        <div className="nf__actions">
          <Link href="/" className="btn">
            Back home <ArrowRight />
          </Link>
          <Link href="/leaderboard" className="btn btn--ghost">
            Leaderboard
          </Link>
        </div>
      </div>
    </div>
  );
}
