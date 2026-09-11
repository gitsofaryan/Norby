import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSocket } from '../../src/hooks/useSocket';

class MockWebSocket {
  static instances: MockWebSocket[] = [];
  url: string;
  sent: string[] = [];
  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: ((error: any) => void) | null = null;
  readyState: number = 0; // CONNECTING

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
    setTimeout(() => {
      this.readyState = 1; // OPEN
      if (this.onopen) this.onopen();
    }, 10);
  }

  send(data: string) {
    this.sent.push(data);
  }

  close() {
    this.readyState = 3; // CLOSED
    if (this.onclose) this.onclose();
  }
}

describe('useSocket Hook Reconnect & Full Registration', () => {
  beforeEach(() => {
    MockWebSocket.instances = [];
    vi.stubGlobal('WebSocket', MockWebSocket);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('forces full registration on WebSocket reconnect within throttle window', async () => {
    const props = {
      userId: 'test_user_1',
      handle: 'testuser',
      vibeEmoji: '🚀',
      avatarUrl: 'https://example.com/avatar.png',
      location: { lat: 37.7749, lng: -122.4194 },
      profile: { bio: 'Hello World', selectedTags: ['dev'], blockedUsers: [] },
      localBlocks: [],
      onSync: vi.fn(),
      onLocationUpdate: vi.fn(),
      onHotspotsList: vi.fn(),
      onHotspotCreated: vi.fn(),
      onJoinRequestReceived: vi.fn(),
      onJoinResponse: vi.fn(),
      onRoomSync: vi.fn(),
      onNewMessage: vi.fn(),
      onWaveReceived: vi.fn(),
      onUserDisconnected: vi.fn(),
    };

    const { unmount } = renderHook(() => useSocket(props));

    // Fast-forward to trigger first socket open
    await act(async () => {
      vi.advanceTimersByTime(20);
    });

    const firstSocket = MockWebSocket.instances[0];
    expect(firstSocket).toBeDefined();

    // Check first message is full registration
    const firstMsg = JSON.parse(firstSocket.sent[0]);
    expect(firstMsg.type).toBe('location_update');
    expect(firstMsg.bio).toBe('Hello World');

    // Simulate socket disconnect & fast reconnect (within 10s throttle)
    act(() => {
      firstSocket.close();
      vi.advanceTimersByTime(1000); // 1s elapsed
    });

    await act(async () => {
      vi.advanceTimersByTime(20);
    });

    const secondSocket = MockWebSocket.instances[1];
    expect(secondSocket).toBeDefined();

    // Verify second socket forces full registration first
    expect(secondSocket.sent.length).toBeGreaterThan(0);
    const reconnectFirstMsg = JSON.parse(secondSocket.sent[0]);
    expect(reconnectFirstMsg.type).toBe('location_update');
    expect(reconnectFirstMsg.bio).toBe('Hello World');
    expect(reconnectFirstMsg.selectedTags).toEqual(['dev']);

    unmount();
  });
});
