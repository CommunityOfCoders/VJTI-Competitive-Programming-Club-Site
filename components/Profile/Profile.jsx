"use client";
import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import MainLayout from "./MainLayout";
import ProfileSidebar from "./ProfileSidebar";

function Profile({ data }) {
  return (
    <div className="container page">
      <Link href="/leaderboard" className="link-arrow" style={{ color: "var(--fg-dim)", marginBottom: 28 }}>
        <ArrowLeft /> Leaderboard
      </Link>
      <div className="pf">
        <aside className="pf__side">
          <ProfileSidebar data={data} />
        </aside>
        <div className="pf__main">
          <MainLayout data={data} />
        </div>
      </div>
    </div>
  );
}

export default Profile;
