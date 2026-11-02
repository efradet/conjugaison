import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

// base relative : le site fonctionne en local comme sur GitHub Pages (/conjugaison/).
export default defineConfig({base: './', plugins: [react()]});
