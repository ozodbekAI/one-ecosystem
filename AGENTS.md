<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- Frontend only: there is no backend, database, auth or admin panel. Don't add Supabase/Lovable Cloud back unless the owner asks.
- Products live in `PRODUCTS` in `src/lib/products.ts` (uz / ru / en texts) and every page reads them from there; to add or change a product, edit that list — never hardcode a product list inside a page.
- Product images are WebP files in `src/assets/` imported by Vite (convert uploads to WebP, ~1080px wide), so they work in any dev server and in the build without Lovable's asset proxy.
- The 3D ring (`src/components/three/`) is built from `ringSegments` in `src/lib/brand.ts`, so it always matches the logo. Keep three.js behind the dynamic `import("./ring-scene")` in `OneRing3D.tsx` so it stays out of the main bundle.
- Hero animation = products assemble the ONE logo: one ring piece per product in `PRODUCTS` (first live product = pink accent). The story/timing lives in `eco-timeline.ts`; it is drawn by `eco-scene.ts` (WebGL, GPU devices) and `eco-canvas.ts` (2D canvas, `html.lite`). Change the choreography in the timeline so both stay in sync.
- Shared animations live in `src/components/motion/primitives.tsx` (Reveal, SplitReveal, TiltCard, Magnetic, ...); everything must keep working with `prefers-reduced-motion`.
- Performance: devices without a GPU get `html.lite` (`src/lib/device.ts`): no WebGL scene, single-layer CSS ring, no drifting light. Avoid `mix-blend-mode`, `backdrop-filter` over animated content and animated `filter: blur` — they made the page stutter. `?webgl=1` forces the full 3D version for testing.
