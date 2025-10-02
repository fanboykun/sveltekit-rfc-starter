<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { toast } from 'svelte-sonner';
	import { Toaster } from '../sonner';

	let shouldShowInstallPrompt = $state(false);
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

	$effect(() => {
		if (shouldShowInstallPrompt === true) showInstallToast();
	});

	onMount(() => {
		if (!browser) return;

		// Listen for install prompt
		window.addEventListener('beforeinstallprompt', (e) => {
			e.preventDefault();
			deferredPrompt = e;
			shouldShowInstallPrompt = true;
		});

		// Check if app is already installed
		window.addEventListener('appinstalled', () => {
			shouldShowInstallPrompt = false;
			deferredPrompt = null;
		});
	});

	async function installApp() {
		if (!deferredPrompt) return;
		deferredPrompt.prompt();
		const { outcome } = await deferredPrompt.userChoice;

		if (outcome === 'accepted') {
			shouldShowInstallPrompt = false;
		}
		deferredPrompt = null;
	}
</script>

<Toaster />
