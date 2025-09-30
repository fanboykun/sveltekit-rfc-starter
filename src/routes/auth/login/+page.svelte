<script lang="ts">
	import MockLogin from './(components)/mock-login.svelte';
	import PasswordLogin from './(components)/password-login.svelte';
	import SocialLogin from './(components)/social-login.svelte';
	import { page } from '$app/state';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { Folders } from '@lucide/svelte';

	let { data } = $props();
	let errorMessage = $derived(page.url.searchParams.get('error'));
</script>

<Toaster position="top-center" richColors closeButton />
<div class="grid min-h-svh lg:grid-cols-2">
	<div class="flex flex-col gap-4 p-6 md:p-10">
		<div class="flex justify-center gap-2 md:justify-start">
			<a href="##" class="flex items-center gap-2 font-medium">
				<div
					class="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground"
				>
					<Folders class="size-4" />
				</div>
				App
			</a>
		</div>
		<div class="flex flex-1 items-center justify-center">
			<div class="w-full max-w-xs">
				<div class="flex flex-col gap-6">
					<div class="flex flex-col items-center gap-2 text-center">
						<h1 class="text-2xl font-bold">Login to your account</h1>
						<p class="text-sm text-balance text-muted-foreground">Fill your credentials</p>
						<p class="text-sm text-destructive">{errorMessage}</p>
					</div>
					{#if data.shouldMockLogin === true}
						<MockLogin />
					{:else}
						{#if data.plugins.length}
							<PasswordLogin plugins={data.plugins} />
						{/if}
						{#if data.providers.length}
							<SocialLogin providers={data.providers} />
						{/if}
					{/if}
				</div>
			</div>
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
