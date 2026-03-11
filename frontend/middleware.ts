import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ROUTE_PERMISSION_MAP } from '@/lib/constants';
// Note: We cannot use the 'jsonwebtoken' library directly in Next.js Edge Middleware
// because it relies on Node.js core modules. Instead, we either rely on an API call,
// or we use a lightweight library like 'jose', or we just decode the payload directly if we only need the payload data.
// For this tutorial task, if we must validate the token server-side, it's best to call an API.
// However, the instructions state "Validate the token and permissions server-side" in middleware.
// Let's decode the JWT manually (base64) to inspect the data, since full signature validation
// often happens on the backend API itself. If signature validation is strictly required here,
// we should use the 'jose' package. Let's do a loose decode for now, assuming the backend validates requests anyway.

function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all routes defined in our map
  const requiredAtom = Object.keys(ROUTE_PERMISSION_MAP).find((route) =>
    pathname.startsWith(route)
  );

  if (requiredAtom) {
    const requiredPermission = ROUTE_PERMISSION_MAP[requiredAtom];
    const refreshToken = request.cookies.get('refreshToken')?.value;
    
    // In our architecture, the accessToken is mostly in-memory (from /refresh),
    // but the Next.js frontend has the `refreshToken` HTTP-only cookie to know they are logged in.
    // If there is no refresh token cookie, they are definitively not logged in.
    if (!refreshToken) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    // As middleware runs on the Edge, we cannot reliably inspect the in-memory access token.
    // We *can* inspect the refresh token if it's not encrypted, but the permissions are normally fetched via API.
    // If the frontend requires strict Edge gating based on permissions, 
    // we would actually need to make a server-side API call here, or decode a token containing them.
    // Let's assume standard auth verification happens in the layout/context on load,
    // and if the middleware just enforces that *any* protected route requires a cookie to proceed, this acts as the first layer.
    
    // To strictly fulfill "Validate the token and permissions server-side":
    // If the backend adds permissions to the JWT token payload, we can read it here.
    // But since `Permissions` are fetched dynamically, let's allow it through the cookie check,
    // and let the client-side AuthProvider layout/Hooks manage the 403 redirect if permissions are mismatched.
    // OR we can make a backend call to /users/me/permissions here.
    // In many typical Next.js setups, permission checking happens via a Higher Order Component / Layout protecting the route.
    
    // For this implementation, we will perform the JWT permission check strictly on the client Layout, 
    // unless the JWT itself contains the permissions. We'll do a simple existence check for the cookie.
    
    // Actually, following the AGENTS.md strictly:
    // "Look up the required atom from ROUTE_PERMISSION_MAP. Validate the token and permissions server-side. Redirect to /403 if the atom is not present."
    
    // Since we must validate server-side, let's call the backend /auth/refresh endpoint to get an access token and the user data,
    // and then call /users/<id>/permissions. Or, more simply, if the JWT payload *contains* the permissions, we can decode it.
    
    // Let's implement an API call to validate. 
    try {
      const authRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          Cookie: `refreshToken=${refreshToken}`
        }
      });
      
      if (!authRes.ok) {
        throw new Error('Unauthorized');
      }
      
      const { accessToken } = await authRes.json();
      const decoded = parseJwt(accessToken);
      
      if (!decoded || !decoded.sub) {
          throw new Error('Invalid token');
      }
      
      // Fetch permissions for the user
      const permRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${decoded.sub}/permissions`, {
          headers: {
              Authorization: `Bearer ${accessToken}`
          }
      });
      
      if (!permRes.ok) {
           throw new Error('Failed to fetch permissions');
      }
      
      const permissions: string[] = await permRes.json();
      
      if (!permissions.includes(requiredPermission)) {
        return NextResponse.redirect(new URL('/403', request.url));
      }
      
      // Passed all checks
      const response = NextResponse.next();
      // We don't need to forward the new access token to the client from here,
      // as the client AuthProvider will run its own refresh on mount.
      return response;

    } catch (e) {
      // Token invalid or expired, or API down
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Allow public routes (e.g., /login) or static files to pass through
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (auth page)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login).*)',
  ],
};
