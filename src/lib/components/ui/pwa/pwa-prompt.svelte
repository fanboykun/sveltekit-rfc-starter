<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { toast } from 'svelte-sonner';

	let deferredPrompt: BeforeInstallPromptEvent | null = null;

	const showInstallToast = () => {
		toast.info('Install App', {
			description: 'Install this app for a better experience',
			position: 'bottom-right',
			dismissable: true,
			closeButton: true,
			action: {
				label: 'Install',
				onClick: () => {
					installApp();
				}
			}
		});
	};

	onMount(() => {
		if (!browser) return;

		// Listen for install prompt
		window.addEventListener('beforeinstallprompt', (e) => {
			e.preventDefault();
			deferredPrompt = e as BeforeInstallPromptEvent;
			showInstallToast();
		});

		// Check if app is already installed
		window.addEventListener('appinstalled', () => {
			deferredPrompt = null;
		});
	});

	async function installApp() {
		if (!deferredPrompt) return;
		deferredPrompt.prompt();
		deferredPrompt = null;
	}
</script>
