import { getDb, hasDatabase } from "@/lib/mongodb";

export type Profile = {
  name: string;
  bio: string;
  /** 프로필 사진 URL. 없으면 이름 첫 글자를 표시합니다. */
  photoUrl?: string;
};

export type LinkItem = {
  id: string;
  title: string;
  url: string;
};

type ProfileDoc = Profile & { _id: string };
type LinkDoc = Omit<LinkItem, "id"> & {
  _id: string;
  order: number;
  clicks: number;
};

// DB가 비어 있을 때 최초 1회 넣는 초기 데이터 (MONGODB_URI가 없거나 DB에 연결할 수 없으면 그대로 화면에 사용)
// TODO: 아래는 보여 주기용 더미 값입니다. 실제 내용으로 교체하세요.
const seedProfile: Profile = {
  name: "홍길동",
  bio: "안녕하세요! 개발과 기록을 좋아하는 크리에이터입니다.",
  photoUrl: "/dummy-avatar.svg",
};

const seedLinks: LinkItem[] = [
  { id: "github", title: "Github", url: "https://github.com" },
  { id: "linkedin", title: "LinkedIn", url: "https://www.linkedin.com" },
  { id: "blog", title: "Blog", url: "https://example.com/blog" },
];

async function seedIfEmpty() {
  const db = await getDb();
  await db
    .collection<ProfileDoc>("profile")
    .updateOne(
      { _id: "main" },
      { $setOnInsert: seedProfile },
      { upsert: true },
    );
  const links = db.collection<LinkDoc>("links");
  if ((await links.estimatedDocumentCount()) === 0) {
    await links.insertMany(
      seedLinks.map(({ id, title, url }, order) => ({
        _id: id,
        title,
        url,
        order,
        clicks: 0,
      })),
      { ordered: false },
    ).catch(() => {
      // 동시 요청으로 이미 시드된 경우 무시
    });
  }
}

/** DB 작업이 실패하면(연결 불가 등) 경고만 남기고 대체값을 사용합니다. */
async function withFallback<T>(
  label: string,
  run: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await run();
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.warn(`[linknamu] ${label}: DB 사용 불가, 임시 데이터로 대체합니다. (${reason})`);
    return fallback;
  }
}

export async function getProfile(): Promise<Profile> {
  if (!hasDatabase) return seedProfile;
  return withFallback(
    "프로필 조회",
    async () => {
      await seedIfEmpty();
      const db = await getDb();
      const doc = await db
        .collection<ProfileDoc>("profile")
        .findOne({ _id: "main" });
      if (!doc) return seedProfile;
      return { name: doc.name, bio: doc.bio, photoUrl: doc.photoUrl };
    },
    seedProfile,
  );
}

export async function getLinks(): Promise<LinkItem[]> {
  if (!hasDatabase) return seedLinks;
  return withFallback(
    "링크 조회",
    async () => {
      await seedIfEmpty();
      const db = await getDb();
      const docs = await db
        .collection<LinkDoc>("links")
        .find({})
        .sort({ order: 1 })
        .toArray();
      return docs.map((d) => ({ id: d._id, title: d.title, url: d.url }));
    },
    seedLinks,
  );
}

/**
 * 클릭 수를 1 올리고 이동할 URL을 반환합니다. 없는 링크면 null.
 * DB를 쓸 수 없으면 클릭 수는 기록되지 않지만 이동은 가능하도록 임시 데이터의 URL을 반환합니다.
 */
export async function recordClick(id: string): Promise<string | null> {
  const fallbackUrl = seedLinks.find((l) => l.id === id)?.url ?? null;
  if (!hasDatabase) return fallbackUrl;
  return withFallback(
    "클릭 집계",
    async () => {
      const db = await getDb();
      const doc = await db
        .collection<LinkDoc>("links")
        .findOneAndUpdate({ _id: id }, { $inc: { clicks: 1 } });
      return doc?.url ?? null;
    },
    fallbackUrl,
  );
}
