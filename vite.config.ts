import devtoolsJson from 'vite-plugin-devtools-json';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import type { PWAAssetsOptions } from 'vite-plugin-pwa';
const pwaAssets: PWAAssetsOptions = { image: 'static/favicon.svg' };

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		devtoolsJson(),
		SvelteKitPWA({
			strategies: 'generateSW',
			registerType: 'autoUpdate',
			includeAssets: ['favicon.svg'],
			pwaAssets,
			workbox: {
				globPatterns: ['client/**/*.{js,css,html,ico,png,svg,webp,woff,woff2,json,webmanifest}']
			},
			manifest: {
				name: 'SvelteKit RFC Starter',
				short_name: 'RFC Starter',
				description: 'A SvelteKit starter with PWA capabilities',
				theme_color: '#3b82f6',
				background_color: '#ffffff',
				display: 'standalone',
				scope: '/',
				start_url: '/'
			},
			devOptions: {
				enabled: true
			}
		})
	],
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'client',
					environment: 'browser',
					browser: {
						enabled: true,
						provider: 'playwright',
						instances: [{ browser: 'chromium' }]
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**'],
					setupFiles: ['./vitest-setup-client.ts']
				}
			},
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
