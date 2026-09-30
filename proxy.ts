import { clerkMiddleware } from "@clerk/nextjs/server";

/**
 * Route prefixes that require a signed-in user (the prefix itself and any subtree).
 *
 * Matched against `request.nextUrl.pathname` so path handling stays in sync with the
 * Next.js router. `createRouteMatcher()` is deprecated in Clerk v7:
 * https://clerk.com/docs/guides/development/upgrading/upgrade-guides/migrate-from-create-route-matcher
 */
const PROTECTED_ROUTE_PREFIXES = ["/studio"] as const;

function isProtectedRoute(pathname: string) {
  return PROTECTED_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request.nextUrl.pathname)) {
    // Document requests are redirected to NEXT_PUBLIC_CLERK_SIGN_IN_URL (/sign-in)
    // with a return-back URL. Non-document requests (RSC/API fetches) get a 404.
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
