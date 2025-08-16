<script lang="ts">
	import { cn } from '$lib/shared/utils/shadcn';

	let {
		processing = $bindable(false),
		duration = 500,
		rootClass,
		processingClass = 'w-full bg-primary/20 opacity-100',
		notProcessingClass = 'w-0 bg-transparent opacity-0',
		progressClass = 'bg-gradient-to-r from-teal-400 to-fuchsia-400'
	}: {
		processing: boolean;
		duration?: number;
		rootClass?: string;
		processingClass?: string;
		notProcessingClass?: string;
		progressClass?: string;
	} = $props();

	// let isFirstInteration = true;
	const createRandomStyle = () => {
		const randomWidth = Math.floor(Math.random() * 100) + '%';
		const randomRight = Math.floor(Math.random() * 100) + '%';
		const styles = {
			width: randomWidth,
			right: randomRight
			// 'transition-delay': isFirstInteration ? `${duration}ms` : '0s'
		};
		// if (isFirstInteration) isFirstInteration = false;
		return Object.entries(styles)
			.map(([key, value]) => `${key}: ${value};`)
			.join(' ');
	};
	let progress = $state(createRandomStyle());
	let randomInterval: NodeJS.Timeout;
	$effect(() => {
		if (processing) {
			randomInterval = setInterval(() => {
				progress = createRandomStyle();
			}, duration);
		} else {
			clearInterval(randomInterval);
		}
	});
</script>

<div
	class={cn(
		'relative h-1 overflow-hidden rounded-full transition-all duration-500',
		rootClass,
		processing ? processingClass : notProcessingClass
	)}
>
	<div
		class={cn(
			'absolute h-full animate-pulse rounded-full bg-primary/80 transition-all duration-500',
			progressClass,
			processing ? 'block' : 'hidden'
		)}
		style={progress}
	></div>
</div>
