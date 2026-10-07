import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // All pathnames except API routes, Next internals and files with an extension.
  // "/" is listed explicitly: under a basePath the bare root (/<base>) is not
  // matched by the pattern alone, so it 404s instead of redirecting to the
  // default locale.
  matcher: ["/", "/((?!api|_next|_vercel|.*\..*).*)"],
};
