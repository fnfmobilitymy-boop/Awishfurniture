import {defineConfig} from 'vite';
import {SITE_PATH} from './src/seo.js';
export default defineConfig({base:SITE_PATH,build:{assetsInlineLimit:4096,chunkSizeWarningLimit:1800}});
