// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

import solidJs from '@astrojs/solid-js';

export default defineConfig({
  site: 'https://grzes-business.github.io',
  base: 'Opyleo-Landing-Page',
  integrations: [tailwind(), solidJs()],
  vite: {
    ssr: {
      noExternal: ['swiper', 'swiper/*']
    }
  },
});