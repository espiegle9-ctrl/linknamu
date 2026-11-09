import type { Profile } from "@/lib/data";

export default function ProfileHeader({ name, bio, photoUrl }: Profile) {
  return (
    <header className="flex flex-col items-center text-center">
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl}
          alt={`${name} 프로필 사진`}
          className="h-28 w-28 rounded-full object-cover ring-2 ring-emerald-600/30"
        />
      ) : (
        <div
          aria-hidden
          className="flex h-28 w-28 items-center justify-center rounded-full bg-emerald-600 text-4xl font-bold text-white"
        >
          {name.charAt(0)}
        </div>
      )}
      <h1 className="mt-4 text-xl font-bold">{name}</h1>
      <p className="mt-1 text-sm text-foreground/70">{bio}</p>
    </header>
  );
}
