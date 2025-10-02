<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import PWAPrompt from '$lib/components/ui/pwa/pwa-prompt.svelte';
	import { pwaInfo } from 'virtual:pwa-info';
	import { registerSW } from 'virtual:pwa-register';
	import { onMount } from 'svelte';

	let { children } = $props();

	const webManifestLink = $derived(pwaInfo ? pwaInfo.webManifest.linkTag : '');

	onMount(() => {
		if (pwaInfo) {
			registerSW({
				onNeedRefresh() {
					// Show update available notification
					console.log('New content available, please refresh.');
				},
				onOfflineReady() {
					// Show ready to work offline notification
					console.log('App ready to work offline.');
				}
			});
		}
	});
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" />
	<title>Sveltekit Remote Function Starter</title>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html webManifestLink}
</svelte:head>

<ModeWatcher />
{@render children?.()}
<PWAPrompt />
