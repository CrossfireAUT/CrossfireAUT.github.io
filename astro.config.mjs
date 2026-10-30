// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Public URL of the site (used for the sitemap and canonical URLs)
  site: 'https://crossfireaut.github.io',
  integrations: [sitemap()],
  image: {
    // Lets the build turn our own SVG covers into PNGs for social previews (og:image)
    dangerouslyProcessSVG: true,
  },
  markdown: {
    shikiConfig: {
      theme: 'github-dark-default',
    },
  },
});
