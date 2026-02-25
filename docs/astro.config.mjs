// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://npmjs.com/package/fixseo',

  integrations: [
    react(),
    starlight({
      title: 'FixSEO',
      description: 'CLI & OpenCode Tool - Scan websites for SEO issues',
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/anomalyco/fixseo',
        },
      ],
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Introduction', link: '/getting-started/' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'CLI Usage', link: '/guides/cli/' },
            { label: 'OpenCode Tool', link: '/guides/opencode/' },
            { label: 'API Reference', link: '/guides/api/' },
          ],
        },
      ],
      customCss: [
        './src/styles/global.css',
        '@fontsource/geist-mono/400.css',
        '@fontsource/geist-mono/500.css',
        '@fontsource/geist-mono/600.css',
        '@fontsource/geist-mono/700.css',
      ],
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});