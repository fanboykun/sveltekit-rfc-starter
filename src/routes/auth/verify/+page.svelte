<script lang="ts">
	import { Mail, CheckCircle, AlertCircle, Loader, Clock } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Card } from '$lib/components/ui/card';
	import { remoteSubmitHandler } from '$lib/hooks/remote-sumbit-handler.svelte';
	import { handleVerifyEmail, sendVerificationEmail } from '$lib/remotes/auth.remote.js';
	import { page } from '$app/state';

	let { data } = $props();

	let errorMessage = $state(data.message ?? '');
	let email = $state<string>(data.email ?? '');
	let timeRemaining = $state(data.expiration ?? 0); // 5 min in seconds

	let interval: NodeJS.Timeout;
	$effect(() => {
		if (!data.expiration) return;

		interval = setInterval(() => {
			if (timeRemaining <= 1) {
				clearInterval(interval);
				return;
			}
			timeRemaining--;
		}, 1000);

		return () => clearInterval(interval);
	});

	const formatTimeRemaining = (seconds: number) => {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;

		if (hours > 0) {
			return `${hours}h ${minutes}m ${secs}s`;
		}
		return `${minutes}m ${secs}s`;
	};

	const submitHandler = remoteSubmitHandler({
		onSubmit: ({ cancel }) => {
			if (!email) return cancel('Email is required');
			return () => sendVerificationEmail({ email });
		},
		onSuccess: ({ data }) => {
			errorMessage = '';
			clearInterval(interval);
			timeRemaining = data.expiration;
		}
	});

	const retryHandler = remoteSubmitHandler({
		onSubmit: ({ cancel }) => {
			const token = page.url.searchParams.get('token');
			if (!token) return cancel('Token is required');
			return () => handleVerifyEmail({ token });
		}
	});
</script>

<Card class="w-full max-w-md border-0 shadow-lg">
	<div class="p-8">
		<div class="mb-8 text-center">
			<div
				class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10"
			>
				<Mail class="h-6 w-6 text-primary" />
			</div>
			<h1 class="mb-2 text-2xl font-bold text-foreground">Verify Your Email</h1>
			<p class="text-sm text-muted-foreground">
				We'll send a verification link to your email address
			</p>
		</div>

		{#if !data.email}
			{#if submitHandler.processing}
				<div class="flex flex-col items-center justify-center space-y-4 py-8">
					<div class="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
						<Loader class="h-6 w-6 animate-spin text-primary" />
					</div>
					<p class="text-sm text-muted-foreground">Sending verification email...</p>
				</div>
			{:else}
				<form class="space-y-4" onsubmit={submitHandler.handle}>
					<div class="space-y-2">
						<label for="email" class="text-sm font-medium text-foreground"> Email Address </label>
						<Input
							id="email"
							bind:value={email}
							type="email"
							placeholder="you@example.com"
							class="h-10"
						/>
					</div>
					<Button disabled={submitHandler.processing} type="submit" class="h-10 w-full font-medium"
						>Send Verification Email</Button
					>
				</form>
			{/if}
		{:else if errorMessage}
			<div class="space-y-4">
				<div class="flex justify-center">
					<div
						class="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30"
					>
						<AlertCircle class="h-8 w-8 text-red-600 dark:text-red-400" />
					</div>
				</div>
				<div class="space-y-2 text-center">
					<h2 class="text-lg font-semibold text-foreground">Something went wrong</h2>
					<p class="text-sm text-muted-foreground">{errorMessage}</p>
				</div>
				<Button
					variant="outline"
					onclick={async () => {
						errorMessage = '';
						await retryHandler.handle();
					}}
					disabled={retryHandler.processing}
					class="mt-6 w-full bg-transparent">Try Again</Button
				>
			</div>
		{:else}
			<div class="space-y-4">
				<div class="flex justify-center">
					<div
						class="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30"
					>
						<CheckCircle class="h-8 w-8 text-green-600 dark:text-green-400" />
					</div>
				</div>
				<div class="space-y-2 text-center">
					<h2 class="text-lg font-semibold text-foreground">Check your email!</h2>
					<p class="text-sm text-muted-foreground">
						We've sent a verification link to
						<span class="font-medium text-foreground">{email}</span>
					</p>
					<div
						class="mt-4 flex items-center justify-center gap-2 rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20"
					>
						<Clock class="h-4 w-4 text-amber-600 dark:text-amber-400" />
						<p class="text-sm font-medium text-amber-900 dark:text-amber-200">
							Expires in: <span class="font-mono">{formatTimeRemaining(timeRemaining)}</span>
						</p>
					</div>
				</div>
				<Button
					variant="outline"
					onclick={async () => {
						errorMessage = '';
						email = data.email ?? '';
						await submitHandler.handle();
					}}
					disabled={submitHandler.processing}
					class="mt-6 w-full bg-transparent">Send Another Email</Button
				>
			</div>
		{/if}

		<div class="mt-8 border-t border-border pt-6">
			<p class="text-center text-xs text-muted-foreground">
				Didn't receive the email? Check your spam folder or
				<button class="font-medium text-primary hover:underline"> try again </button>
			</p>
		</div>
	</div>
</Card>
