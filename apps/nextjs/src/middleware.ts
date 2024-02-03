import { authMiddleware } from "@clerk/nextjs";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your Middleware
export default authMiddleware({
  // eslint-disable-next-line no-useless-escape
  ignoredRoutes: [
    "/api/conversations/messenger-hook",
    "/api/debug",
    "/api/inngest",
    "/api/cron/digest/:span",
    "/api/retrieval",
  ],
});

export const config = {
  matcher: ["/api/((?!.+\\.[\\w]+$|_next).*)", "/debug", "/app"],
};
