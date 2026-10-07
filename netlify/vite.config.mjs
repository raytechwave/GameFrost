import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
export default defineConfig({root:root+'netlify',publicDir:root+'public',plugins:[react()],resolve:{alias:{'next/navigation':root+'netlify/navigation.ts','@':root}},build:{manifest:true,outDir:root+'netlify-dist',emptyOutDir:true,assetsDir:'assets',chunkSizeWarningLimit:900},base:'/'});
