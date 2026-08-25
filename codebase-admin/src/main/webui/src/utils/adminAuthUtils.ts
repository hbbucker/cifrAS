export interface AdminUserSession {
  id: string;
  email: string;
  name: string;
  role: string;
}

export function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function isTokenAdmin(token: string | null): boolean {
  if (!token) return false;
  const payload = parseJwtPayload(token);
  if (!payload) {
    // Check fallback dev tokens
    return token === 'admin-dev-token' || token.startsWith('admin-');
  }

  // Check expiration
  if (payload.exp && typeof payload.exp === 'number') {
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) return false;
  }

  // 1. Direct role claim
  if (typeof payload.role === 'string' && payload.role.toLowerCase() === 'admin') {
    return true;
  }

  // 2. roles array
  if (Array.isArray(payload.roles) && payload.roles.some((r) => String(r).toLowerCase() === 'admin')) {
    return true;
  }

  // 3. app_metadata.role or app_metadata.roles
  if (payload.app_metadata && typeof payload.app_metadata === 'object') {
    const appMeta = payload.app_metadata as Record<string, unknown>;
    if (typeof appMeta.role === 'string' && appMeta.role.toLowerCase() === 'admin') {
      return true;
    }
    if (Array.isArray(appMeta.roles) && appMeta.roles.some((r) => String(r).toLowerCase() === 'admin')) {
      return true;
    }
  }

  // 4. user_metadata.role
  if (payload.user_metadata && typeof payload.user_metadata === 'object') {
    const userMeta = payload.user_metadata as Record<string, unknown>;
    if (typeof userMeta.role === 'string' && userMeta.role.toLowerCase() === 'admin') {
      return true;
    }
  }

  // 5. Hardcoded admin emails for dev/test
  if (payload.email && typeof payload.email === 'string') {
    if (payload.email.toLowerCase() === 'admin@cifras.com') {
      return true;
    }
  }

  return false;
}

export function extractUserFromToken(token: string): AdminUserSession | null {
  const payload = parseJwtPayload(token);
  if (!payload) {
    if (token === 'admin-dev-token' || token.startsWith('admin-')) {
      return {
        id: 'admin-dev',
        email: 'admin@cifras.com',
        name: 'Administrador CifrAS',
        role: 'admin',
      };
    }
    return null;
  }

  const userMeta = (payload.user_metadata as Record<string, unknown>) || {};
  const rawName = userMeta.full_name || userMeta.name || payload.name;
  let displayName = typeof rawName === 'string' ? rawName : undefined;
  if (!displayName && typeof payload.email === 'string') {
    displayName = payload.email.split('@')[0];
  }

  return {
    id: typeof payload.sub === 'string' ? payload.sub : 'admin',
    email: typeof payload.email === 'string' ? payload.email : '',
    name: displayName || 'Administrador',
    role: 'admin',
  };
}
