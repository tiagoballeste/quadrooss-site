/*
 * Cloudflare Pages middleware: picks the site's language by country.
 *
 * - First visit (no qd_lang cookie): Brazil gets Portuguese, everyone else
 *   English. If the requested page is in the other language, the visitor is
 *   sent to the same page in theirs, and the choice is saved in the cookie.
 * - With the cookie (set here, or by the language menu), the URL is respected
 *   as is: a manual choice or a shared /en link is never undone.
 * - Search engines and link previews are never redirected, so both versions
 *   get indexed and shared links keep their language.
 * - English pages get <html lang="en-US"> (the static HTML says pt-BR).
 *
 * Only page requests (GET with Accept: text/html) are touched; static files
 * skip this function entirely through public/_routes.json.
 *
 * Testing: on preview deployments only (<branch>.quadrooss-site.pages.dev),
 * ?__country=US pretends the visit comes from that country.
 */

const COOKIE = "qd_lang";
const ONE_YEAR = 60 * 60 * 24 * 365;
const BOTS =
  /bot|crawl|spider|slurp|facebookexternalhit|facebot|whatsapp|telegram|discord|slack|linkedin|twitter|pinterest|embedly|preview|lighthouse|headless/i;

function isEnglishPath(path) {
  return path === "/en" || path.startsWith("/en/");
}

function localizedPath(path, locale) {
  const base = isEnglishPath(path) ? path.slice(3) || "/" : path;
  if (locale === "pt") return base;
  return base === "/" ? "/en" : `/en${base}`;
}

function readCookie(request) {
  const match = /(?:^|;\s*)qd_lang=(pt|en)\b/.exec(request.headers.get("cookie") || "");
  return match ? match[1] : null;
}

function setLangAttribute(response, locale) {
  return new HTMLRewriter()
    .on("html", {
      element(element) {
        element.setAttribute("lang", locale === "en" ? "en-US" : "pt-BR");
      },
    })
    .transform(response);
}

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const isPage =
    (request.method === "GET" || request.method === "HEAD") &&
    (request.headers.get("accept") || "").includes("text/html");

  if (!isPage) return context.next();

  const pageLocale = isEnglishPath(path) ? "en" : "pt";
  const saved = readCookie(request);
  const isBot = BOTS.test(request.headers.get("user-agent") || "");

  if (!saved && !isBot) {
    const isPreview = url.hostname.endsWith(".pages.dev") && url.hostname.split(".").length > 3;
    const testCountry = isPreview ? url.searchParams.get("__country") : null;
    const country = testCountry || (request.cf && request.cf.country);
    const locale = country === "BR" ? "pt" : country ? "en" : null;

    if (locale) {
      const cookie = `${COOKIE}=${locale}; Path=/; Max-Age=${ONE_YEAR}; SameSite=Lax; Secure`;

      if (locale !== pageLocale) {
        return new Response(null, {
          status: 302,
          headers: {
            Location: `${localizedPath(path, locale)}${url.search}`,
            "Set-Cookie": cookie,
            "Cache-Control": "private, no-store",
            Vary: "Cookie",
          },
        });
      }

      const response = await context.next();
      const withCookie = new Response(response.body, response);
      withCookie.headers.append("Set-Cookie", cookie);
      return pageLocale === "en" ? setLangAttribute(withCookie, "en") : withCookie;
    }
  }

  const response = await context.next();
  return pageLocale === "en" ? setLangAttribute(response, "en") : response;
}
