<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { MoonIcon, SunIcon } from '@lucide/svelte';
	import { mode, toggleMode } from 'mode-watcher';
	import { fly } from 'svelte/transition';
</script>

<Button size="icon" variant="ghost" class="transition-opacity" onclick={toggleMode}>
	{#if mode.current === 'dark'}
		<div in:fly={{ y: 10, duration: 300 }}>
			<SunIcon size="16" class="text-primary" />
		</div>
	{:else if mode.current === 'light'}
		<div in:fly={{ y: -10, duration: 300 }}>
			<MoonIcon size="16" class="text-primary" />
		</div>
	{/if}
</Button>
