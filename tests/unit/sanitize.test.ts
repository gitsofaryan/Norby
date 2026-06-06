import { describe, it, expect } from 'vitest';
import { sanitizeInput } from '../../src/server/socket-server';

describe('sanitizeInput', () => {
  it('escapes HTML entities', () => {
    expect(sanitizeInput('<div>test</div>')).toBe('&lt;div&gt;test&lt;&#x2F;div&gt;');
    expect(sanitizeInput('test & test')).toBe('test &amp; test');
    expect(sanitizeInput('"test"')).toBe('&quot;test&quot;');
    expect(sanitizeInput("'test'")).toBe('&#x27;test&#x27;');
    expect(sanitizeInput('/test/')).toBe('&#x2F;test&#x2F;');
  });

  it('handles null/undefined/empty string', () => {
    expect(sanitizeInput(null)).toBe('');
    expect(sanitizeInput(undefined)).toBe('');
    expect(sanitizeInput('')).toBe('');
  });

  it('prevents XSS payloads', () => {
    const payload = '<script>alert("xss")</script>';
    expect(sanitizeInput(payload)).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
  });
});
