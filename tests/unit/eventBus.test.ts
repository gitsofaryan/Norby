import { describe, it, expect, vi } from 'vitest';
import { globalEventBus } from '../../src/lib/eventBus';

describe('EventBus', () => {
  it('fires and cleans up listeners correctly', () => {
    const callback = vi.fn();
    const unsubscribe = globalEventBus.on('test-event', callback);

    globalEventBus.emit('test-event', { foo: 'bar' });
    expect(callback).toHaveBeenCalledWith({ foo: 'bar' });

    unsubscribe();
    globalEventBus.emit('test-event', { foo: 'baz' });
    expect(callback).toHaveBeenCalledTimes(1); // Should not have run a second time
  });

  it('can unsubscribe via off', () => {
    const callback = vi.fn();
    globalEventBus.on('test-event-2', callback);
    globalEventBus.off('test-event-2', callback);

    globalEventBus.emit('test-event-2', 'data');
    expect(callback).not.toHaveBeenCalled();
  });

  it('can clear all listeners or specific event listeners and query count', () => {
    globalEventBus.clear();
    const cb1 = vi.fn();
    const cb2 = vi.fn();

    globalEventBus.on('event-a', cb1);
    globalEventBus.on('event-a', cb2);
    globalEventBus.on('event-b', cb1);

    expect(globalEventBus.listenerCount('event-a')).toBe(2);
    expect(globalEventBus.listenerCount('event-b')).toBe(1);

    globalEventBus.clear('event-a');
    expect(globalEventBus.listenerCount('event-a')).toBe(0);
    expect(globalEventBus.listenerCount('event-b')).toBe(1);

    globalEventBus.clear();
    expect(globalEventBus.listenerCount('event-b')).toBe(0);
  });
});
