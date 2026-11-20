// Runs on Cloudflare in front of every page of the site.
// Anyone who arrives through the old *.pages.dev address is sent on to the real website.
export function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.hostname.endsWith(".pages.dev")) {
    return Response.redirect("https://lavalampmagazine.com" + url.pathname + url.search, 301);
  }
  return context.next();
}
