import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useOSM } from "../../src/hooks/useOSM";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

const bounds = () => ({
  _southWest: { lat: 28.6, lng: 77.2 },
  _northEast: { lat: 28.63, lng: 77.22 },
});

function Places({ mapBounds }: { mapBounds: ReturnType<typeof bounds> }) {
  const places = useOSM(mapBounds, 15);
  return <output>{places.length}</output>;
}

describe("useOSM", () => {
  beforeEach(() => {
    localStorage.clear();
    fetchMock.mockReset();
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not cancel a valid fetch when Leaflet recreates identical bounds", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ elements: [] }),
    });
    const { rerender } = render(<Places mapBounds={bounds()} />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const requestSignal = fetchMock.mock.calls[0][1].signal as AbortSignal;

    rerender(<Places mapBounds={bounds()} />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    expect(requestSignal.aborted).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
