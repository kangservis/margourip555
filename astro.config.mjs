// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
	fonts: [
		{
			provider: fontProviders.google(),
			name: 'Playfair Display',
			cssVariable: '--font-playfair-display',
			weights: [700],
			styles: ['normal'],
			subsets: ['latin'],
			fallbacks: ['serif'],
		},
		{
			provider: fontProviders.google(),
			name: 'Plus Jakarta Sans',
			cssVariable: '--font-plus-jakarta-sans',
			weights: [400, 600],
			styles: ['normal'],
			subsets: ['latin'],
			fallbacks: ['sans-serif'],
		},
	],
	vite: {
		plugins: [tailwindcss()],
	},
});
