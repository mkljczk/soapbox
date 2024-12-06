/// <reference types="vitest" />
import fs from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { bundleStats } from 'rollup-plugin-bundle-stats';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import compileTime from 'vite-plugin-compile-time';
import { createHtmlPlugin } from 'vite-plugin-html';
import { VitePWA } from 'vite-plugin-pwa';
import vitePluginRequire from 'vite-plugin-require';
import { viteStaticCopy } from 'vite-plugin-static-copy';

const config = defineConfig(({ command }) => ({
  build: {
    assetsDir: 'packs',
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        assetFileNames: 'packs/assets/[name]-[hash].[ext]',
        chunkFileNames: 'packs/js/[name]-[hash].js',
        entryFileNames: 'packs/[name]-[hash].js',
      },
    },
    sourcemap: true,
  },
  assetsInclude: ['**/*.oga'],
  server: {
    port: Number(process.env.PORT ?? 3036),
  },
  plugins: [
    checker({ typescript: true }),
    // @ts-ignore
    vitePluginRequire.default(),
    compileTime(),
    createHtmlPlugin({
      template: 'index.html',
      minify: {
        collapseWhitespace: true,
        removeComments: false,
      },
      inject: {
        data: {
          snippets: readFileContents('custom/snippets.html'),
        },
      },
    }),
    react(),
    VitePWA({
      injectRegister: null,
      strategies: 'injectManifest',
      injectManifest: {
        injectionPoint: undefined,
        plugins: [
          // @ts-ignore
          compileTime(),
        ],
      },
      manifestFilename: 'manifest.json',
      manifest: {
        name: 'pl-fe',
        short_name: 'pl-fe',
        description: 'Web-based federated social media client, a fork of Soapbox',
        icons: [
          {
            src: '/instance/images/logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
        ],
        display: 'standalone',
        display_override: [
          'window-controls-overlay',
        ],
        theme_color: '#d80482',
        categories: ['social'],
        share_target: {
          params: {
            title: 'title',
            text: 'text',
            url: 'url',
          },
          action: 'share',
          method: 'GET',
        },
        shortcuts: [
          {
            name: 'Search',
            url: '/search',
            icons: [
              {
                src: '/instance/images/shortcuts/search.png',
                sizes: '192x192',
                type: 'image/png',
              },
            ],
          },
          {
            name: 'Notifications',
            url: '/notifications',
            icons: [
              {
                src: '/instance/images/shortcuts/notifications.png',
                sizes: '192x192',
                type: 'image/png',
              },
            ],
          },
          {
            name: 'Chats',
            url: '/chats',
            icons: [
              {
                src: '/instance/images/shortcuts/chats.png',
                sizes: '192x192',
                type: 'image/png',
              },
            ],
          },
        ],
        start_url: '/',
        id: '/',
      },
      srcDir: 'src/service-worker',
      filename: 'sw.ts',
    }),
    viteStaticCopy({
      targets: [{
        src: './node_modules/@twemoji/svg/*',
        dest: 'packs/emoji/',
      }, {
        src: './favicon.ico',
        dest: '.',
      }, {
        src: './src/instance',
        dest: '.',
      }, {
        src: './custom/instance',
        dest: '.',
      }, {
        src: './node_modules/fasttext.wasm.js/dist/models/language-identification/assets/lid.176.ftz',
        dest: 'fastText/models/',
      }, {
        src: './node_modules/fasttext.wasm.js/dist/core/fastText.common.wasm',
        dest: 'fastText/',
      }],
    }),
    bundleStats(),
    {
      name: 'mock-api',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (/^\/api\//.test(req.url!)) {
            res.statusCode = 404;
            res.end('Not Found');
          } else {
            next();
          }
        });
      },
    },
  ],
  resolve: {
    alias: [
      { find: 'pl-fe', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
    ],
    dedupe: ['@floating-ui/react', 'tabbable', 'query-string', 'valibot'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: 'src/jest/test-setup.ts',
  },
}));

/** Return file as string, or return empty string if the file isn't found. */
const readFileContents = (path: string) => {
  try {
    return fs.readFileSync(path, 'utf8');
  } catch {
    return '';
  }
};

export { config as default };
