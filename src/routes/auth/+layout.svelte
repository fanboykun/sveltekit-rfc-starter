<script lang="ts">
	import { Toaster } from '$lib/components/ui/sonner';
	import { Folders } from '@lucide/svelte';

	let { children } = $props();
</script>

<Toaster position="top-center" richColors closeButton />
<div class="grid min-h-svh lg:grid-cols-2">
	<div class="flex flex-col gap-4 p-6 md:p-10">
		<div class="flex justify-center gap-2 md:justify-start">
			<a href="/" class="flex items-center gap-2 font-medium">
				<div
					class="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground"
				>
					<Folders class="size-4" />
				</div>
				App
			</a>
		</div>
		<div class="flex flex-1 items-center justify-center">
			{@render children?.()}
		</div>
	</div>
	<div class="relative hidden bg-muted lg:block">
		<img
			src="/placeholder.svg"
			alt="placeholder"
			class="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
		/>
	</div>
</div>
