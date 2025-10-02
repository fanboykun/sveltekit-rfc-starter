<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let showInstallPrompt = $state(false);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	let showUpdatePrompt = $state(false);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let deferredPrompt: any;

	onMount(() => {
		if (!browser) return;

		// Listen for install prompt
		window.addEventListener('beforeinstallprompt', (e) => {
			e.preventDefault();
			deferredPrompt = e;
			showInstallPrompt = true;
		});

		// Check if app is already installed
		window.addEventListener('appinstalled', () => {
			showInstallPrompt = false;
			deferredPrompt = null;
		});
	});

	async function installApp() {
		if (!deferredPrompt) return;

		deferredPrompt.prompt();
		const { outcome } = await deferredPrompt.userChoice;

		if (outcome === 'accepted') {
			showInstallPrompt = false;
		}

		deferredPrompt = null;
	}

	function dismissInstall() {
		showInstallPrompt = false;
	}
</script>

{#if showInstallPrompt}
	<div
		class="fixed right-4 bottom-4 left-4 z-50 rounded-lg border border-gray-200 bg-white p-4 shadow-lg"
	>
		<div class="flex items-center justify-between">
			<div>
				<h3 class="font-semibold text-gray-900">Install App</h3>
				<p class="text-sm text-gray-600">Install this app for a better experience</p>
			</div>
			<div class="flex gap-2">
				<button
					onclick={dismissInstall}
					class="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
				>
					Dismiss
				</button>
				<button
					onclick={installApp}
					class="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
				>
					Install
				</button>
			</div>
		</div>
	</div>
{/if}
