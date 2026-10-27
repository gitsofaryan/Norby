import { HOTSPOT_CATEGORIES } from "@/lib/mapFilters";

export interface BeeActionHotspot {
  id: string;
  host_id: string;
  title?: string;
  category?: string;
  requests?: Array<{ user_id: string; username?: string; status?: string }>;
}

export type BeeAction =
  | { type: "create_hotspot"; title: string; category: string }
  | { type: "close_hotspot"; roomId: string }
  | {
      type: "respond_join";
      roomId: string;
      guestId: string;
      status: "accepted" | "declined";
    };

function findCategory(text: string) {
  const normalized = text.toLowerCase();
  return HOTSPOT_CATEGORIES.find((category) =>
    [category.key, category.label, category.prompt].some((value) =>
      normalized.includes(value.toLowerCase()),
    ),
  );
}

function titleFromCommand(text: string, category?: { prompt: string }) {
  const named = text
    .match(/(?:called|named|titled)\s+["']?(.+?)["']?$/i)?.[1]
    ?.trim();
  if (named) return named.slice(0, 100);
  return category?.prompt || "Community meetup";
}

export function parseBeeAction(
  text: string,
  userId: string,
  hotspots: BeeActionHotspot[],
): BeeAction | null {
  const normalized = text.trim().toLowerCase();
  const ownHotspots = hotspots.filter((hotspot) => hotspot.host_id === userId);

  if (/\b(close|end|delete|cancel)\b.*\b(hotspot|meetup)\b/.test(normalized)) {
    if (ownHotspots.length === 1) {
      return { type: "close_hotspot", roomId: ownHotspots[0].id };
    }
    return null;
  }

  const response = normalized.match(
    /\b(accept|approve|decline|reject)\b(?:\s+(?:the\s+)?(?:request|join request)\s*)?(?:from\s+)?@?([a-z0-9_.-]+)?/i,
  );
  if (response) {
    const status =
      response[1].toLowerCase() === "accept" ||
      response[1].toLowerCase() === "approve"
        ? "accepted"
        : "declined";
    const requestedName = response[2];
    const pending = ownHotspots.flatMap((hotspot) =>
      (hotspot.requests || [])
        .filter((request) => request.status === "pending")
        .map((request) => ({ hotspot, request })),
    );
    const matches = requestedName
      ? pending.filter(
          ({ request }) => request.username?.toLowerCase() === requestedName,
        )
      : pending;
    if (matches.length === 1) {
      return {
        type: "respond_join",
        roomId: matches[0].hotspot.id,
        guestId: matches[0].request.user_id,
        status,
      };
    }
    return null;
  }

  if (
    /\b(create|creat5e|cretae|start|post|open|make)\b.*\b(hotspot|hostpost|hotspost|meetup|group|chat)\b/.test(
      normalized,
    )
  ) {
    const category = findCategory(normalized);
    return {
      type: "create_hotspot",
      title: titleFromCommand(text, category),
      category: category?.key || "community",
    };
  }

  return null;
}
