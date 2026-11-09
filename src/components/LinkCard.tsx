import type { LinkItem } from "@/lib/data";

export default function LinkCard({ id, title }: LinkItem) {
  return (
    <a
      // 서버에서 클릭 수를 집계한 뒤 실제 URL로 리디렉션됩니다.
      href={`/go/${encodeURIComponent(id)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full rounded-2xl border border-foreground/20 px-5 py-4 text-center font-medium transition hover:-translate-y-0.5 hover:border-emerald-600 hover:shadow-md focus-visible:outline-2 focus-visible:outline-emerald-600"
    >
      {title}
    </a>
  );
}
