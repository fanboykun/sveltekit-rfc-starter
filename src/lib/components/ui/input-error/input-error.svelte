<script lang="ts">
	import { cn } from '$lib/shared/utils/shadcn';
	import { Dot } from '@lucide/svelte';

	let {
		message = $bindable(),
		class: className
	}: {
		message?: string | string[] | { [key: string]: unknown } | null;
		class?: string;
	} = $props();
	function toArrayOfString(item: unknown): string[] {
		const result = [];
		if (typeof item === 'string') result.push(item);
		else if (Array.isArray(item)) {
			item.forEach((i) => {
				if (typeof i === 'string') result.push(i);
				else result.push(...toArrayOfString(i));
			});
		} else if (typeof item === 'object' && item)
			Object.values(item).forEach((i) => result.push(...toArrayOfString(i)));
		return result;
	}
	const flatMessage = $derived(toArrayOfString(message));
</script>

<div class={cn('grid gap-1', className)}>
	{#each flatMessage as msg}
		<span class="flex w-auto items-center gap-1 overflow-hidden text-sm text-clip text-destructive">
			<Dot class="size-4" />
			<span class="break-words">
				{msg}
			</span>
		</span>
	{/each}
</div>
