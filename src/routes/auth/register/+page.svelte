<script lang="ts">
	import MockLogin from '../(components)/mock-login.svelte';
	import PasswordRegister from '../(components)/password-register.svelte';
	import SocialLogin from '../(components)/social-login.svelte';
	import { page } from '$app/state';
	import { Separator } from '$lib/components/ui/separator';

	let { data } = $props();
	let errorMessage = $derived(page.url.searchParams.get('error'));
</script>

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
			{#if data.plugins?.length}
				<PasswordRegister plugins={data.plugins} />
			{/if}
			{#if data.plugins?.length && data.providers?.length}
				<div class="flex items-center gap-2">
					<Separator class="w-fit shrink" />
					<span class="w-full text-center text-xs">Or continue with</span>
					<Separator class="w-fit shrink" />
				</div>
			{/if}
			{#if data.providers?.length}
				<SocialLogin providers={data.providers} />
			{/if}
			<span class="-mt-2 w-full text-center text-xs"
				>Already have an account? <a href="/auth/login" class="underline">Sign in</a></span
			>
		{/if}
	</div>
</div>
