// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Public URL of the site (used for canonical URLs)
  site: 'https://crossfireaut.github.io',
  markdown: {
    shikiConfig: {
      theme: 'github-dark-default',
    },
  },
});
