import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import WebSocket from 'ws';
import { startServer, stopServer } from '../../src/server/socket-server';

describe('WebSocket Server Integration', () => {
  let ws1: WebSocket;
  let ws2: WebSocket;

  beforeAll(async () => {
    // Start the server on a dedicated test port to avoid conflicts
    await startServer(3005);

    const connect = (port: number) => {
      return new Promise<WebSocket>((resolve, reject) => {
        const client = new WebSocket(`ws://localhost:${port}`);
        client.on('open', () => resolve(client));
        client.on('error', (err) => reject(err));
      });
    };
    ws1 = await connect(3005);
    ws2 = await connect(3005);
  });

  afterAll(async () => {
    if (ws1 && ws1.readyState === WebSocket.OPEN) ws1.close();
    if (ws2 && ws2.readyState === WebSocket.OPEN) ws2.close();
    await stopServer();
  });

  it('should reject malformed messages with validation failure', () => {
    return new Promise<void>((resolve) => {
      const onMessage = (data: WebSocket.RawData) => {
        const parsed = JSON.parse(data.toString());
        if (parsed.type === 'error') {
          expect(parsed.message).toContain('validation');
          ws1.off('message', onMessage);
          resolve();
        }
      };
      ws1.on('message', onMessage);
      ws1.send(JSON.stringify({ type: 'unknown_type' }));
    });
  });

  it('should reject actions before registering location/identity', () => {
    return new Promise<void>((resolve) => {
      const onMessage = (data: WebSocket.RawData) => {
        const parsed = JSON.parse(data.toString());
        if (parsed.type === 'error') {
          expect(parsed.message).toContain('register location first');
          ws1.off('message', onMessage);
          resolve();
        }
      };
      ws1.on('message', onMessage);
      ws1.send(JSON.stringify({ type: 'send_wave', target_user_id: 'user2', sender_id: 'user1', sender_username: 'user1' }));
    });
  });
});
