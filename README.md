# Staticizer

Simple Cloudflare Worker that automates browser tasks via `env.MyPuppeteer` and `env.AI`.

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
