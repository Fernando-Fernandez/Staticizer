# Staticizer

Staticizer is a Cloudflare Worker that accepts a dynamic page URL via `?u=<url>`, renders it remotely with `env.MyPuppeteer`, and returns a fully static HTML snapshot—perfect for serving content from JavaScript-heavy sites without client-side execution.

## Deploy

Install Wrangler and push the worker:

```bash
npm install -g wrangler
npx wrangler deploy
```

Successful deploy output should resemble:

```
Your Worker has access to the following bindings:
Binding                 Resource
env.MyPuppeteer         Browser
env.AI                  AI

Uploaded staticizer
Deployed staticizer triggers
  https://staticizer.fmendes-cloudflare.workers.dev
```
