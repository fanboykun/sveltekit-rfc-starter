<script lang="ts">
	import { dev } from '$app/environment';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { createFormState } from '$lib/hooks/form-state.svelte';
	import { remoteSubmitHandler } from '$lib/hooks/remote-sumbit-handler.svelte';
	import { handlePluginLogin } from '$lib/remotes/auth.remote';
	import { Eye, EyeOff } from '@lucide/svelte';
	import z from 'zod';

	// remove this in production
	const defaultUserPayload = {
		email: 'admin@admin.com',
		password: 'Admin123'
	};
	let { state: s, plugins }: { state?: string; plugins?: ['password'] } = $props();

	const formState = createFormState({
		initial: dev ? defaultUserPayload : undefined,
		schema: z.object({
			email: z.string({ error: 'Invalid Email' }).email(),
			password: z.string({ error: 'Invalid Password' }).min(4).max(255)
		})
	});
	const submitHandler = remoteSubmitHandler({
		onSubmit: async ({ cancel, toast }) => {
			const validated = formState.validateAll();
			if (!validated.success) {
				toast.error('Invalid Data');
				return cancel();
			}
			return async () =>
				await handlePluginLogin({ state: s, payload: validated.data, plugin: 'password' });
		}
	});
	let passwordInputType = $state<'password' | 'text'>('password');
</script>

<form class="grid gap-6" onsubmit={submitHandler.handle}>
	{#if plugins && plugins.includes('password')}
		<div class="grid gap-3">
			<Label for="email">Email</Label>
			<Input
				id="email"
				name="email"
				type="email"
				placeholder="m@example.com"
				required
				{...formState.attribute.email}
				bind:value={formState.value.email}
			/>
		</div>
		<div class="grid gap-3">
			<div class="flex items-center">
				<Label for="password">Password</Label>
			</div>
			<div class="relative">
				<Input
					id="password"
					name="password"
					type={passwordInputType}
					minlength={4}
					maxlength={255}
					placeholder="Password"
					required
					class="pr-10"
					{...formState.attribute.password}
					bind:value={formState.value.password}
				/>
				<Button
					variant="ghost"
					size="icon"
					type="button"
					class="absolute top-0 right-2"
					onclick={() =>
						(passwordInputType = passwordInputType === 'password' ? 'text' : 'password')}
				>
					{#if passwordInputType === 'password'}
						<Eye />
					{:else}
						<EyeOff />
					{/if}
				</Button>
			</div>
		</div>
		<Button disabled={submitHandler.processing} type="submit" class="w-full">Login</Button>
	{/if}
</form>
