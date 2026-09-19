import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Keeps Supabase auth sessions fresh and blocks unauthorized access to admin routes.
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  const isLoginRoute = request.nextUrl.pathname.startsWith('/admin/login');
  const isProtectedAdminRoute = request.nextUrl.pathname.startsWith('/admin') && !isLoginRoute;

  if (isProtectedAdminRoute && (error || !user)) {
    const redirectResponse = NextResponse.redirect(new URL('/admin/login', request.url));
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  }

  if (isLoginRoute && user) {
    const redirectResponse = NextResponse.redirect(new URL('/admin/dashboard', request.url));
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  }

  return response;
}

// Run on application requests so Supabase can refresh the auth session before
// Server Components and Server Actions read it. Static assets are excluded.
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
