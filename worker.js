import puppeteer from "@cloudflare/puppeteer";

const ALLOWED_HOSTS = [
  "support.roku.com",
  // add more if you want multi-domain later
];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const target = url.searchParams.get("u");

    if (!target) {
      return new Response("Missing ?u= parameter", { status: 400 });
    }

    let targetUrl;
    try {
      targetUrl = new URL(target);
    } catch {
      return new Response("Invalid URL", { status: 400 });
    }

    if (!ALLOWED_HOSTS.includes(targetUrl.host)) {
      return new Response("Domain not allowed", { status: 403 });
    }

    // Launch remote browser using Cloudflare Browser Rendering binding
    const browser = await puppeteer.launch(env.BROWSER);

    try {
      const page = await browser.newPage();
      await page.goto(targetUrl.toString(), { waitUntil: "networkidle0" });

      let html = await page.content();

      // rewrite internal links to go back through this worker
      html = rewriteLinks(html, targetUrl);

      // strip all scripts so client runs no JS
      html = html.replace(/<script[\s\S]*?<\/script>/gi, "");

      return new Response(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    } finally {
      await browser.close();
    }
  },
};

// Rewrite only links that point to the same host as targetUrl
function rewriteLinks(html, targetUrl) {
  const origin = `${targetUrl.protocol}//${targetUrl.host}`;

  // Absolute links to same origin
  html = html.replace(
    new RegExp(`href="${origin}([^"]*)"`, "g"),
    (match, path) =>
      `href="/?u=${encodeURIComponent(origin + path)}"`
  );

  // Relative links (href="/...") - assume same origin
  html = html.replace(
    /href="\/([^"]*)"/g,
    (match, path) =>
      `href="/?u=${encodeURIComponent(origin + "/" + path)}"`
  );

  return html;
}
