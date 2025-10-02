<script lang="ts" module>
	interface PwaInstall {
		count: number;
		outcome: 'accepted' | 'dismissed' | '';
		installed: boolean;
		platform: string;
		lastPrompt: Date;
	}
	const pwaLocalStoragekey = 'pwa-install';
	const safeParse = <T,>(item: string | null, fallback: T) => {
		if (!item) return fallback;
		try {
			return JSON.parse(item) as T;
		} catch {
			return fallback;
		}
	};
	const fallback: PwaInstall = {
		count: 0,
		installed: false,
		outcome: '',
		platform: 'web',
		lastPrompt: new Date()
	};
	function getInstallPrompt(): PwaInstall {
		if (typeof window === 'undefined') return fallback;
		return safeParse<PwaInstall>(window.localStorage.getItem(pwaLocalStoragekey), fallback);
	}
	export function prepareInstallPromt(force: boolean = false) {
		if (typeof window === 'undefined') return;
		const pwaInstall = force ? fallback : getInstallPrompt();
		window.localStorage.setItem(pwaLocalStoragekey, JSON.stringify({ ...fallback, ...pwaInstall }));
		if (force) window.location.reload();
	}
	function updateInstallPrompt(prompt: Partial<PwaInstall>) {
		if (typeof window === 'undefined') return;
		const current = safeParse<PwaInstall>(
			window.localStorage.getItem(pwaLocalStoragekey),
			fallback
		);
		window.localStorage.setItem(pwaLocalStoragekey, JSON.stringify({ ...current, ...prompt }));
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { toast } from 'svelte-sonner';
	import { Toaster } from '../sonner';

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

	function shouldShowInstallToast(prompt: PwaInstall) {
		if (prompt.installed) return false;
		if (prompt.count >= 3) return false;
		if (prompt.outcome === 'accepted') return false;
		if (prompt.outcome === 'dismissed') {
			// Only show again after 24 hours
			return new Date().getTime() - prompt.lastPrompt.getTime() > 1000 * 60 * 60 * 24;
		}
		// Show for first time or other states
		return true;
	}

	onMount(() => {
		if (!browser) return;
		const currentPrompt = getInstallPrompt();
		// Listen for install prompt
		window.addEventListener('beforeinstallprompt', (e) => {
			e.preventDefault();
			deferredPrompt = e;
			if (shouldShowInstallToast(currentPrompt)) {
				showInstallToast();
				updateInstallPrompt({ count: currentPrompt.count + 1, lastPrompt: new Date() });
			}
		});

		// Check if app is already installed
		window.addEventListener('appinstalled', () => {
			updateInstallPrompt({ installed: true });
			deferredPrompt = null;
		});
	});

	async function installApp() {
		if (!deferredPrompt) return;
		deferredPrompt.prompt();
		const { outcome, platform } = await deferredPrompt.userChoice;
		updateInstallPrompt({
			outcome,
			platform,
			installed: outcome === 'accepted'
		});

		deferredPrompt = null;
	}
</script>

<Toaster />
