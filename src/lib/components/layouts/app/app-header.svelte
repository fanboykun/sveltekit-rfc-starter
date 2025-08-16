<script lang="ts">
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import ThemeToggler from '$lib/components/ui/theme-toggler/theme-toggler.svelte';
	import { useBreadcrumb } from '$lib/hooks/use-breadcrumb.svelte';
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
	<ThemeToggler />
</div>
