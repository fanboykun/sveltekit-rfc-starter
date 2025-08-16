import { afterNavigate, beforeNavigate } from '$app/navigation';
import ProgressBar from './progress-bar.svelte';
export { ProgressBar };

export const progressOnNavigate = () => {
	let processing = $state(false);
	beforeNavigate(() => {
		processing = true;
	});
	afterNavigate(() => {
		processing = false;
	});
	return {
		get processing() {
			return processing;
		}
	};
};
