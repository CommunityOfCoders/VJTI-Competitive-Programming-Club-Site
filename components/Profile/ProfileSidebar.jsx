import React from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

const ProfileSidebar = ({ data }) => {
  const user = data.user_data || {};
  const cf = data.codeForcesData;
  const lcRating = data.leetCodeData?.userContestDetails?.rating;

  const ratingData = [
    { image: "/svgs/cf.svg", platform: "Codeforces", rating: cf?.rating || "-", sub: cf?.rank || "unrated" },
    { image: "/svgs/lc.svg", platform: "LeetCode", rating: lcRating ? Math.round(lcRating) : "-", sub: "contest rating" },
  ];

  const platformsData = [
    { image: "/svgs/cf.svg", platform: "Codeforces", username: user.cf_username, link: "https://codeforces.com/profile" },
    { image: "/svgs/lc.svg", platform: "LeetCode", username: user.lc_username, link: "https://leetcode.com/u" },
    { image: "/svgs/cc.svg", platform: "CodeChef", username: user.cc_username, link: "https://www.codechef.com/users" },
  ].filter((p) => p.username);

  if (user.cses_id) {
    platformsData.push({ image: "/images/cses.png", platform: "CSES", username: user.cses_id, link: "https://cses.fi/user" });
  }

  const photo =
    cf?.titlePhoto && !cf.titlePhoto.includes("no-title") ? cf.titlePhoto : null;

  return (
    <div className="pf-side">
      <div className="panel panel--pad pf-id">
        {photo ? (
          <Image width={96} height={96} src={photo} alt={user.name || ""} className="avatar pf-id__photo" unoptimized />
        ) : (
          <div className="pf-id__photo pf-id__initial" aria-hidden="true">
            {user.name?.charAt(0).toUpperCase()}
          </div>
        )}
        <h1 className="pf-id__name">{user.name}</h1>
        <p className="pf-id__meta">
          <span className="tag">{user.year}</span>
          {user.inClub && <span className="tag tag--accent">CP Club</span>}
        </p>

        <div className="pf-ratings">
          {ratingData.map((item) => (
            <div key={item.platform} className="pf-rating">
              <span className="label">{item.platform}</span>
              <span className="pf-rating__num">{item.rating}</span>
              <span className="pf-rating__sub">{item.sub}</span>
            </div>
          ))}
        </div>

        {user.cses_id ? (
          <Link href={`/cses/${encodeURIComponent(user.cses_id)}`} className="pf-link pf-link--cses">
            <Image src="/images/cses.png" width={22} height={22} alt="" className="pf-link__logo" />
            <span className="pf-link__text">
              <span className="pf-link__name">CSES progress</span>
              <span className="pf-link__user">Solved problems, by section</span>
            </span>
            <ArrowUpRight className="pf-link__go" />
          </Link>
        ) : null}
      </div>

      <div className="panel panel--pad">
        <span className="label">Coding platforms</span>
        <div className="pf-links">
          {platformsData.map((item) => (
            <a
              href={`${item.link}/${item.username}`}
              target="_blank"
              rel="noopener noreferrer"
              key={item.platform}
              className="pf-link"
            >
              <Image src={item.image} width={22} height={22} alt="" className="pf-link__logo" />
              <span className="pf-link__text">
                <span className="pf-link__name">{item.platform}</span>
                <span className="pf-link__user">{item.username}</span>
              </span>
              <ArrowUpRight className="pf-link__go" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;
