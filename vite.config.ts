/// <reference path="./stillum-forms-react-plugin.d.ts" />
import { copyFileSync, cpSync, existsSync, mkdirSync } from 'fs';
import { dirname, join, resolve } from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { stillumSharedPlugin } from '@tecnosys/stillum-forms-react/plugin';
import { defineConfig } from 'vite';
// import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

function copyCatalogPlugin() {
  return {
    name: 'copy-catalog',
    closeBundle() {
      const root = join(process.cwd(), 'catalog.json');
      const out = join(process.cwd(), 'dist', 'catalog.json');
      if (existsSync(root)) {
        const dir = dirname(out);
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
        copyFileSync(root, out);
      }
    },
  };
}

function copyMaterialIconsPlugin() {
  return {
    name: 'copy-material-icons',
    closeBundle() {
      const src = resolve(__dirname, 'node_modules/material-icon-theme/icons');
      const dest = join(process.cwd(), 'dist', 'material-icons');
      if (!existsSync(src)) return;
      mkdirSync(dest, { recursive: true });
      cpSync(src, dest, { recursive: true });
    },
  };
}

export default defineConfig({
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    /** Origine che serve dist/material-icons (preview :5003). Senza questo, <img src="/material-icons/..."> nel iframe editor punta all’host sbagliato → 404. */
    // build è quasi sempre production → non usare mode. Default :5002 = dove serve il preview + material-icons (iframe editor su altro host).
    'import.meta.env.VITE_MATERIAL_ICONS_BASE_URL': JSON.stringify(
      process.env.VITE_MATERIAL_ICONS_BASE_URL ?? 'http://localhost:5002/'
    ),
  },
  server: {
    port: 5003,
    strictPort: true,
    cors: true,
    fs: { allow: ['.', '..'] },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'chrome89',
    lib: {
      entry: 'src/index.tsx',
      name: 'StillumUI',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      output: {
        banner:
          '(function(){typeof process==="undefined"&&(globalThis.process={env:{NODE_ENV:"production"}});})();',
      },
    },
  },
  plugins: [
    tailwindcss(),
    stillumSharedPlugin(),
    react(),
    //cssInjectedByJsPlugin(),
    copyCatalogPlugin(),
    copyMaterialIconsPlugin(),
  ],
});
