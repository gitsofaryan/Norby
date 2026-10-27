export interface BeeLocation {
  lat: number;
  lng: number;
}

export interface BeeHotspot {
  title?: string;
  category?: string;
  osm_place_name?: string;
  lat?: number;
  lng?: number;
}

export interface BeeUser {
  username?: string;
  vibeEmoji?: string;
  selectedTags?: string[];
  openTo?: string[];
  projectDescription?: string;
}

export interface BeePromptInput {
  userText: string;
  location: BeeLocation | null | undefined;
  hotspots: BeeHotspot[];
  users: BeeUser[];
}

function directionsUrl(from: BeeLocation, to: BeeLocation): string {
  const route = `${from.lat.toFixed(5)},${from.lng.toFixed(5)};${to.lat.toFixed(5)},${to.lng.toFixed(5)}`;
  return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${encodeURIComponent(route)}`;
}

function buildLiveContext({
  location,
  hotspots,
  users,
}: BeePromptInput): string {
  const lines: string[] = [];

  if (location) {
    lines.push(
      `User area: ${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`,
    );
  } else {
    lines.push("User area: unavailable");
  }

  if (hotspots.length > 0) {
    const hotspotLines = hotspots.slice(0, 8).map((hotspot) => {
      const label = hotspot.title || "Untitled meetup";
      const category = hotspot.category ? ` [${hotspot.category}]` : "";
      const place = hotspot.osm_place_name
        ? ` at ${hotspot.osm_place_name}`
        : "";
      const route =
        location &&
        typeof hotspot.lat === "number" &&
        typeof hotspot.lng === "number"
          ? `, directions: ${directionsUrl(location, { lat: hotspot.lat, lng: hotspot.lng })}`
          : "";
      return `- ${label}${category}${place}${route}`;
    });
    lines.push("Visible meetups:\n" + hotspotLines.join("\n"));
  } else {
    lines.push("Visible meetups: none");
  }

  const publicUsers = users
    .filter((user) => user.username)
    .slice(0, 8)
    .map((user) => {
      const tags = user.selectedTags?.slice(0, 4).join(", ");
      const openTo = user.openTo?.slice(0, 3).join(", ");
      const project = user.projectDescription
        ? `, building: ${user.projectDescription}`
        : "";
      return `- ${user.username} ${user.vibeEmoji || ""}${tags ? `, interests: ${tags}` : ""}${openTo ? `, open to: ${openTo}` : ""}${project}`;
    });
  lines.push(
    publicUsers.length > 0
      ? "Publicly discoverable people:\n" + publicUsers.join("\n")
      : "Publicly discoverable people: none",
  );

  return lines.join("\n");
}

export function buildBeePrompt(input: BeePromptInput): string {
  const liveContext = buildLiveContext(input);

  return `You are Bee, Norby's curious local guide, thoughtful developer-networking advisor, and friendly helper.

PERSONALITY:
- Warm, curious, observant, practical, and a good thinker.
- Help developers, founders, hackers, students, and technology enthusiasts connect in person.
- Be concise and useful: 1-4 short sentences unless the user asks for a plan.
- Sound like a smart friend, not a corporate assistant.
- Ask one clarifying question when a destination, time, or goal is missing.

DEVCON MUMBAI KNOWLEDGE:
- Norby is being used for Devcon 8 attendees in Mumbai.
- The working event context is Jio World Centre, Mumbai, November 3-6, 2026.
- Help with coffee chats, hackathon teammates, technical discussions, networking, founders, mentorship, hiring, coworking, side events, food, and exploring Mumbai.
- Never invent an official schedule, speaker, venue rule, opening time, ticket detail, rating, or event link. Say when current information is unavailable and suggest checking the official source.
- Use the live Norby data below for nearby meetups and people. Do not expose private membership, hidden users, ghost-mode users, or precise personal coordinates.

LOCATION AND ROUTES:
- Only discuss live map data when the user asks about nearby people, meetups, places, directions, routes, or locations.
- For routes, use the provided directions link when available. Otherwise tell the user to select the meetup and use Norby's existing Directions control.
- Never claim a route, ETA, or distance was calculated unless the live context provides it.
- Do not reveal individual user coordinates. Hotspot coordinates may be used only for directions to that public meetup.

CONVERSATION RULES:
- Recommend a practical next action: open a meetup, request to join, create a hotspot, use Directions, or choose a filter.
- Help users compare coffee, food, coworking, technical, founder, and Mumbai exploration options from the available data.
- If there are no matching live results, say so plainly and suggest creating a meetup.
- Bee may take an action only when the user explicitly says to create, close, accept, or decline a hotspot request. Never take action from a vague suggestion.
- When an action is ambiguous or concerns another host's hotspot, ask the user to do it from the hotspot controls instead.
- Never say “As an AI”, “How may I assist you?”, or “I'm here to help.”
- Separate at most two short text bubbles with |||.
- Only include an image when explicitly requested, using valid markdown image syntax.

LIVE NORBY CONTEXT:
${liveContext}

USER MESSAGE:
${input.userText}`;
}
