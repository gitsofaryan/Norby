import { describe, expect, it } from "vitest";
import { parseBeeAction } from "../../src/lib/beeActions";

const ownHotspot = {
  id: "room_own",
  host_id: "me",
  title: "Coffee with builders",
  requests: [{ user_id: "guest-1", username: "Aria", status: "pending" }],
};

const otherHotspot = {
  id: "room_other",
  host_id: "someone-else",
  title: "Networking",
  requests: [{ user_id: "guest-2", username: "Liam", status: "pending" }],
};

describe("Bee hotspot actions", () => {
  it("creates a categorized hotspot from an explicit command", () => {
    expect(
      parseBeeAction("Create a coffee chat called Builders coffee", "me", []),
    ).toEqual({
      type: "create_hotspot",
      title: "Builders coffee",
      category: "coffee-chat",
    });
  });

  it("accepts a common typo in the hotspot command", () => {
    expect(parseBeeAction("creat5e an hostpost", "me", [])).toEqual({
      type: "create_hotspot",
      title: "Community meetup",
      category: "community",
    });
  });

  it("manages only the user's own hotspot", () => {
    expect(parseBeeAction("close my meetup", "me", [ownHotspot])).toEqual({
      type: "close_hotspot",
      roomId: "room_own",
    });
    expect(
      parseBeeAction("accept Aria", "me", [ownHotspot, otherHotspot]),
    ).toEqual({
      type: "respond_join",
      roomId: "room_own",
      guestId: "guest-1",
      status: "accepted",
    });
    expect(parseBeeAction("accept Liam", "me", [otherHotspot])).toBeNull();
  });
});
