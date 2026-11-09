import { Suspense } from "react";
import LinkCard from "@/components/LinkCard";
import ProfileHeader from "@/components/ProfileHeader";
import { getLinks, getProfile } from "@/lib/data";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-4 py-12 sm:py-16">
      <Suspense fallback={<p className="text-center text-sm">불러오는 중…</p>}>
        <Content />
      </Suspense>
    </main>
  );
}

async function Content() {
  const [profile, links] = await Promise.all([getProfile(), getLinks()]);
  return (
    <>
      <ProfileHeader {...profile} />
      <ul className="flex flex-col gap-3">
        {links.map((link) => (
          <li key={link.id}>
            <LinkCard {...link} />
          </li>
        ))}
      </ul>
    </>
  );
}
