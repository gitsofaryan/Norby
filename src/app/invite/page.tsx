import { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";
import { Sparkles, Map, UserPlus } from "lucide-react";

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  let username = "A friend";
  const encoded = searchParams.d as string;
  if (encoded) {
    try {
      username = decodeURIComponent(Buffer.from(encoded, 'base64').toString('utf-8'));
    } catch (e) {
      console.error("Failed to parse invite data", e);
    }
  }

  const fullTitle = `${username} invited you to Norby! 🌍`;
  const description = `Join ${username} on Norby to see who's nearby, find local hotspots, and meet up in real time.`;

  return {
    title: fullTitle,
    description: description,
    openGraph: {
      title: fullTitle,
      description: description,
      siteName: "Norby",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: description,
    },
  };
}

export default function InvitePage({ searchParams }: Props) {
  let username = "A friend";
  const encoded = searchParams.d as string;
  if (encoded) {
    try {
      username = decodeURIComponent(Buffer.from(encoded, 'base64').toString('utf-8'));
    } catch (e) {
      console.error("Failed to parse invite data", e);
    }
  }

  return (
    <div className="min-h-[100dvh] bg-black flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden text-zinc-50">
      {/* Background Ambience */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-rose-500/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center text-center">
        
        {/* Glowy App Icon */}
        <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-rose-500 rounded-[2rem] flex items-center justify-center text-white shadow-[0_0_40px_rgba(245,158,11,0.4)] mb-8 p-0.5">
          <div className="w-full h-full bg-black/50 backdrop-blur-md rounded-[1.8rem] flex items-center justify-center">
            <Sparkles size={40} className="text-amber-300 drop-shadow-[0_0_10px_rgba(252,211,77,0.8)]" />
          </div>
        </div>

        <h1 className="text-3xl font-black tracking-tight leading-tight mb-3 text-white">
          See <span className="text-amber-400">@{username}</span> on the map!
        </h1>

        <p className="text-sm font-medium text-zinc-400 mb-10 px-4 leading-relaxed">
          Norby is a live map where you can see friends, join local hotspots, and instantly drop into voice rooms.
        </p>

        <div className="w-full flex flex-col gap-3 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 p-6 rounded-3xl mb-8">
          <div className="flex items-center gap-4 text-left">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-emerald-400 shrink-0">
              <Map size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Live Location</p>
              <p className="text-[10px] text-zinc-400">See each other instantly</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-left">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-blue-400 shrink-0">
              <UserPlus size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Proximity Sparks</p>
              <p className="text-[10px] text-zinc-400">Your avatars glow when near</p>
            </div>
          </div>
        </div>

        <Link 
          href="/"
          className="w-full flex items-center justify-center gap-2 bg-white text-black py-4 rounded-2xl font-black text-sm transition-transform hover:scale-[1.02] active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
        >
          Download & Join
        </Link>
        
      </div>
    </div>
  );
}
