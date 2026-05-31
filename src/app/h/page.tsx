import { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";
import { MapPin, Navigation, MessageSquare, Download } from "lucide-react";

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const shortId = (searchParams.id as string) || "hotspot";
  const fullTitle = `Join a Hotspot on Norby`;
  const description = `Someone invited you to a Hotspot on Norby! Join to see the map, route, and jump into the live chat.`;

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

export default function HotspotSharePage({ searchParams }: Props) {
  const shortId = (searchParams.id as string) || "hotspot";
  
  return (
    <div className="min-h-[100dvh] bg-zinc-950 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden text-zinc-50">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm">
        {/* The Card */}
        <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-[2rem] p-8 shadow-2xl flex flex-col items-center text-center">
          
          <div className="w-20 h-20 bg-white/10 rounded-[1.5rem] flex items-center justify-center text-4xl shadow-inner mb-6 border border-white/5 ring-4 ring-white/5">
            🔥
          </div>

          <p className="text-xs font-bold tracking-widest text-zinc-400 uppercase mb-2">
            You're invited to join
          </p>

          <h1 className="text-2xl font-black tracking-tight leading-tight mb-4 bg-gradient-to-br from-white to-zinc-400 text-transparent bg-clip-text">
            A Live Hotspot
          </h1>

          <div className="flex gap-4 justify-center w-full mb-8">
            <div className="flex flex-col items-center gap-1.5 text-zinc-500">
              <div className="w-10 h-10 rounded-full bg-zinc-800/50 flex items-center justify-center">
                <MapPin size={16} />
              </div>
              <span className="text-[10px] font-bold">Map</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-zinc-500">
              <div className="w-10 h-10 rounded-full bg-zinc-800/50 flex items-center justify-center">
                <Navigation size={16} />
              </div>
              <span className="text-[10px] font-bold">Route</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-zinc-500">
              <div className="w-10 h-10 rounded-full bg-zinc-800/50 flex items-center justify-center">
                <MessageSquare size={16} />
              </div>
              <span className="text-[10px] font-bold">Live Chat</span>
            </div>
          </div>

          <div className="w-full space-y-3">
            <Link 
              href="/"
              className="w-full flex items-center justify-center gap-2 bg-white text-zinc-950 py-4 rounded-2xl font-black text-sm transition-transform active:scale-95"
            >
              Open in Norby
            </Link>
          </div>
          
        </div>

        <p className="text-[11px] text-zinc-600 font-medium text-center mt-6">
          Norby is a location-based social app to find hotspots, join live chats, and see friends on the map.
        </p>
      </div>
    </div>
  );
}
