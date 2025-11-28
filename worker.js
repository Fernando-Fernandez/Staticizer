export default {
  async fetch(request, env) {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get("u");

    if (!targetUrl) {
      return new Response("Missing ?u= parameter.", { status: 400 });
    }

    // STRICT domain allowlist
    if (!targetUrl.startsWith("https://support.roku.com")) {
      return new Response("Only support.roku.com is allowed.", { status: 400 });
    }

    // Launch remote browser session via Cloudflare Browser Rendering API
    const browser = await env.BROWSER.newBrowser();
    const context = await browser.newContext();
    const page = await context.newPage();

    // Navigate and wait for DOM content
    await page.goto(targetUrl, { waitUntil: "domcontentloaded" });

    // Extract full rendered DOM
    let html = await page.content();

    await context.close();
    await browser.close();

    // 1. Rewrite internal Roku support links
    html = rewriteLinks(html);

    // 2. Strip all scripts (prevent client JS from running)
    html = html.replace(/<script[\s\S]*?<\/script>/gi, "");

    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });
  }
};

// --- Helper: rewrite internal links to proxy through /?u= ---
function rewriteLinks(html) {
  // Absolute links
  html = html.replace(
    /href="https:\/\/support\.roku\.com\/([^"]*)"/g,
    (match, path) =>
      `href="/?u=${encodeURIComponent("https://support.roku.com/" + path)}"`
  );

  // Relative links
  html = html.replace(
    /href="\/([^"]*)"/g,
    (match, path) =>
      `href="/?u=${encodeURIComponent("https://support.roku.com/" + path)}"`
  );

  return html;
}
