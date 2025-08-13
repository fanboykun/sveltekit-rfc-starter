<script lang="ts">
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import { Button } from '$lib/components/ui/button';
	import { useBreadcrumb } from '$lib/hooks/use-breadcrumb.svelte';
	import { MoonIcon, SunIcon } from '@lucide/svelte';
	import { mode, toggleMode } from 'mode-watcher';
	import { fly } from 'svelte/transition';
	const breadcrumbs = useBreadcrumb();
</script>

<div class="flex w-full items-center justify-between gap-2">
	<Breadcrumb.Root>
		<Breadcrumb.List>
			{#each breadcrumbs.value as breadcrumb, i}
				{@const href = breadcrumb.url ? { href: breadcrumb.url } : {}}
				<Breadcrumb.Item class="hidden md:block">
					<Breadcrumb.Link {...href}>{breadcrumb.label}</Breadcrumb.Link>
				</Breadcrumb.Item>
				{#if i < breadcrumbs.value.length - 1}
					<Breadcrumb.Separator class="hidden md:block" />
				{/if}
			{/each}
		</Breadcrumb.List>
	</Breadcrumb.Root>
	<Button size="icon" variant="ghost" onclick={toggleMode}>
		{#if mode.current === 'dark'}
			<div in:fly={{ y: 10, duration: 300 }}>
				<SunIcon size="16" class="text-primary" />
			</div>
		{:else}
			<div in:fly={{ y: -10, duration: 300 }}>
				<MoonIcon size="16" class="text-primary" />
			</div>
		{/if}
	</Button>
</div>
