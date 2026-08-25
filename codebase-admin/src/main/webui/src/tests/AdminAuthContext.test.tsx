import { describe, it, expect, beforeEach } from 'vitest';
import { isTokenAdmin, parseJwtPayload } from '../utils/adminAuthUtils';

function createJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.mockSignature`;
}

describe('AdminAuthContext helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('parseJwtPayload', () => {
    it('parses valid JWT payload', () => {
      const token = createJwt({ sub: 'user-123', email: 'test@example.com' });
      const payload = parseJwtPayload(token);
      expect(payload).toEqual({ sub: 'user-123', email: 'test@example.com' });
    });

    it('returns null for invalid token strings', () => {
      expect(parseJwtPayload('invalid-token')).toBeNull();
      expect(parseJwtPayload('')).toBeNull();
    });
  });

  describe('isTokenAdmin', () => {
    it('returns true for dev token', () => {
      expect(isTokenAdmin('admin-dev-token')).toBe(true);
      expect(isTokenAdmin('admin-test')).toBe(true);
    });

    it('returns false for empty/null token', () => {
      expect(isTokenAdmin(null)).toBe(false);
      expect(isTokenAdmin('')).toBe(false);
    });

    it('returns true when role claim is admin', () => {
      const token = createJwt({ role: 'admin', exp: Math.floor(Date.now() / 1000) + 3600 });
      expect(isTokenAdmin(token)).toBe(true);
    });

    it('returns true when role is uppercase ADMIN', () => {
      const token = createJwt({ role: 'ADMIN', exp: Math.floor(Date.now() / 1000) + 3600 });
      expect(isTokenAdmin(token)).toBe(true);
    });

    it('returns true when roles array contains admin', () => {
      const token = createJwt({ roles: ['user', 'admin'], exp: Math.floor(Date.now() / 1000) + 3600 });
      expect(isTokenAdmin(token)).toBe(true);
    });

    it('returns true when app_metadata contains role admin', () => {
      const token = createJwt({
        app_metadata: { role: 'admin' },
        exp: Math.floor(Date.now() / 1000) + 3600,
      });
      expect(isTokenAdmin(token)).toBe(true);
    });

    it('returns true when user_metadata contains role admin', () => {
      const token = createJwt({
        user_metadata: { role: 'admin' },
        exp: Math.floor(Date.now() / 1000) + 3600,
      });
      expect(isTokenAdmin(token)).toBe(true);
    });

    it('returns false for regular user token', () => {
      const token = createJwt({ role: 'user', exp: Math.floor(Date.now() / 1000) + 3600 });
      expect(isTokenAdmin(token)).toBe(false);
    });

    it('returns false for expired admin token', () => {
      const token = createJwt({ role: 'admin', exp: Math.floor(Date.now() / 1000) - 100 });
      expect(isTokenAdmin(token)).toBe(false);
    });
  });
});
