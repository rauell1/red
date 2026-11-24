# RED // Nyekundu CODM Creator Portfolio

A mobile-first CODM creator portfolio, fan hub, sponsor media kit, and admin console for Red (`@nyekunduuu`). The React/Vite frontend builds to static assets; Cloudflare Workers handles only `/api/*`. Public content is returned from one batched API route, stored in Neon Serverless PostgreSQL when configured, and edge-cached. Without a database URL, the API uses an editable in-memory demo repository so the preview works immediately.

> **Preview data notice:** The included metrics, prices, contact details, sponsor example, device/settings, and CODM share codes are illustrative placeholders, not verified creator information. Confirm and replace them in `/admin` before publishing or contacting brands.

## Requirements

- Node.js 20.3+ and npm
- Optional: Neon PostgreSQL for persistent edits and inquiries
- Optional: Cloudflare account + Wrangler for deployment; Cloudflare R2 for video assets

## Run in Replit / local development

```bash
npm install
cp .env.example .env
# Optional: add DATABASE_URL, ADMIN_PASSWORD, and SESSION_SECRET to .env
npm run dev
```

Open the Vite/Replit preview on **port 5000**. Vite serves the React site and proxies `/api/*` to the lightweight Hono Node adapter on port `3000` (`PORT` can change the API adapter port). No secrets are required to browse, submit a demo booking inquiry, or use the admin dashboard.

- `GET /api/portfolio` returns the profile, clips, loadouts, and sponsor packages in one request.
- `/admin` uses the default preview password **`red-admin-demo`** when `ADMIN_PASSWORD` is unset. In-memory edits and test inquiries persist for the lifetime of the API process and reset on restart.
- The browser console warns when sample portfolio data is in use. Keep the visible demo disclaimer in mind before publishing.

To run a Node production preview after a build, use `npm run build && PORT=5000 npm run start`. `npm run preview` serves the static Vite build only (it does not provide the Hono API).

## Neon schema and seed

Add a Neon HTTP-compatible connection string to `.env`, then run:

```bash
npm run db:push && npm run db:seed
```

`db:push` applies the Drizzle schema. `db:seed` is safe to re-run: it checks/upserts the creator profile, three requested highlight clips, sample HUD/sensitivity/gunsmith/device loadouts, and three sponsor packages. It never seeds fake sponsor inquiries. Open `/admin` and sign in with `ADMIN_PASSWORD` to manage profile metrics and links, clips, loadouts, packages, and incoming leads. Admin writes invalidate the edge portfolio cache. The session cookie is HMAC-SHA256 signed with Web Crypto and uses `HttpOnly; SameSite=Lax` plus `Secure` on HTTPS.

## Add and compress highlight videos

Use widescreen **16:9** footage and encode mobile-friendly H.264 MP4. Videos are not downloaded until a viewer opens a clip; every video element uses `preload="none"`. Keep short-lived preview assets in `public/videos/`, or use Cloudflare R2 for production.

Example FFmpeg encode (adjust input, output, and quality to suit the source):

```bash
ffmpeg -i gameplay-source.mp4 -vf "scale='min(1920,iw)':-2" -c:v libx264 -preset medium -crf 25 -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 96k -ac 2 red-snd-clutch.mp4
```

Upload to an R2 bucket with Wrangler (create/bind the bucket first):

```bash
npx wrangler r2 bucket create red-codm-highlights
npx wrangler r2 object put red-codm-highlights/clips/red-snd-clutch.mp4 --file ./red-snd-clutch.mp4 --content-type video/mp4
```

For public playback, expose the bucket through an R2 custom domain or a Worker route, then paste the resulting HTTPS URL into the clip's **MP4 / R2 video URL** field in `/admin`. Alternatively, copy the MP4 into `public/videos/` and use `/videos/red-snd-clutch.mp4`. The UI uses custom SVG landscape posters while no video URL is configured; it never embeds TikTok iframes.

## Build and production preview

```bash
npm run build
npm run start
```

`npm run build` runs strict TypeScript checking and Vite production bundling. `npm run start` serves `dist/client` and the Hono API on `Number(process.env.PORT) || 3000`, with SPA fallback for `/` and `/admin`. For a Vite-only static preview, run `npm run preview` after building.

## Deploy to Cloudflare Workers + Static Assets

1. Set a production `DATABASE_URL`, a strong `ADMIN_PASSWORD`, and a long random `SESSION_SECRET`. `.env.example` documents the variables; do not commit `.env`.
2. Apply and seed Neon:

   ```bash
   npm run db:push && npm run db:seed
   ```

3. Build static assets and deploy the Worker:

   ```bash
   npm run build && npx wrangler deploy
   ```

4. Configure production secrets interactively:

   ```bash
   npx wrangler secret put DATABASE_URL
   npx wrangler secret put ADMIN_PASSWORD
   npx wrangler secret put SESSION_SECRET
   ```

`wrangler.jsonc` points at `src/worker.ts` and `dist/client`, uses SPA fallback for client routes, and runs the Worker first only for `/api/*`. Static files bypass Worker CPU. `GET /api/portfolio` executes one parallel read across profile, clips, loadouts, and sponsor packages, with `Cache-Control: public, max-age=300, s-maxage=3600, stale-while-revalidate=86400` and `caches.default` when available. Local Node development skips the Cache API cleanly.

## Resource and safety notes

- The hero uses one procedural Three.js canvas (no `.glb` downloads), capped at `dpr={[1, 1.5]}` with Drei `PerformanceMonitor`. It pauses when outside the viewport or when the document is hidden. Reduced-motion and WebGL-failure states show a CSS/SVG tactical fallback.
- The canvas is lazy-loaded and split from the initial site bundle. `/admin` does not load the 3D code. The initial public view makes one portfolio API request.
- Neon uses `@neondatabase/serverless` with `neon(DATABASE_URL)` and `drizzle-orm/neon-http`; there is no long-lived `pg` TCP pool.
- Inquiry submissions use shared Zod validation, a hidden honeypot, and a small isolate-local limit of five requests per ten minutes per observed client IP. Keep Cloudflare edge protections enabled for public deployments.
- Browser updates are validated again by the API. Admin writes invalidate the edge portfolio cache. Admin sessions use Web Crypto rather than a heavy auth package.

## Replacing preview content

Use `/admin` to update profile metrics, social/contact links, clips and video URLs, touch-layout and sensitivity details, weapon builds, sponsor packages, and inquiry statuses. Replace `public/social-card.svg` if the creator has approved campaign artwork, and update the canonical and social-card domain in `index.html` before launch. The included follower counts, average views, engagement rate, package pricing, Karifast proof example, phone/device settings, WhatsApp/email contacts, and share codes are demonstration content—not verified creator data.
