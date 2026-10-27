import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { VibeFilterBar } from "../../src/components/Map/overlays/VibeFilterBar";

const setSelectedFilter = vi.fn();
const vibrate = vi.fn();

vi.mock("@/components/Map/MapProvider", () => ({
  useMapContext: () => ({ selectedFilter: "all", setSelectedFilter }),
}));

describe("VibeFilterBar mobile compatibility", () => {
  beforeEach(() => {
    setSelectedFilter.mockReset();
    vibrate.mockReset();
    Object.defineProperty(navigator, "vibrate", {
      configurable: true,
      value: vibrate,
    });
  });

  it("keeps Devcon filters horizontally scrollable and clear of iPhone safe areas", () => {
    const { container } = render(<VibeFilterBar />);
    const bar = container.querySelector("#vibe-filter-bar");
    const scroller = bar?.firstElementChild;

    expect(bar).toHaveClass("left-3", "right-3", "top-[max(0.75rem,env(safe-area-inset-top))]");
    expect(scroller).toHaveClass("overflow-x-auto");
    expect(screen.getByRole("button", { name: /coffee chats/i })).toBeVisible();
  });

  it("works with Android haptics when available and still selects a filter", () => {
    render(<VibeFilterBar />);

    fireEvent.click(screen.getByRole("button", { name: /side events/i }));

    expect(vibrate).toHaveBeenCalledWith(8);
    expect(setSelectedFilter).toHaveBeenCalledWith("side-events");
  });
});
