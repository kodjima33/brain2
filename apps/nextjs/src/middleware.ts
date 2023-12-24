import { authMiddleware } from "@clerk/nextjs";
 
// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your Middleware
export default authMiddleware({
  ignoredRoutes: ["/((?!api|trpc))(_next.*|.+\.[\w]+$)", "/api/notes"]
});
 
export const config = {
  // matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/'],
  // ignoredRoutes: ['/((?!.+\\.[\\w]+$|_next).*)', '/'],
  // eslint-disable-next-line no-useless-escape
  ignoredRoutes: ["/((?!api|trpc))(_next.*|.+\.[\w]+$)", "/api/notes"]
};
 