import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Protected routes - require authentication before accessing
const isProtectedRoutes = createRouteMatcher([ "/" , "/projects(.*)" ])

// Public routes that should not require authentication
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/invite(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  // Skip protection for public routes
  if (isPublicRoute(req)) return
  
  // Protect all other routes that match the protected pattern
  if (isProtectedRoutes(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}