<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import InputError from '$lib/components/ui/input-error/input-error.svelte';
	import { Label } from '$lib/components/ui/label';
	import { createFormState } from '$lib/hooks/form-state.svelte';
	import { remoteSubmitHandler } from '$lib/hooks/remote-sumbit-handler.svelte';
	import { handlePasswordRegister } from '$lib/remotes/auth.remote';
	import { Eye, EyeOff } from '@lucide/svelte';
	import z from 'zod';

	let { state: s, plugins }: { state?: string; plugins?: ['password'] } = $props();

	const formState = createFormState({
		schema: z
			.object({
				name: z.string().min(3),
				email: z.string({ error: 'Invalid Email' }).email(),
				password: z.string({ error: 'Invalid Password' }).min(4).max(255),
				confirmPassword: z.string({ error: 'Invalid Password' }).min(4).max(255)
				// check if password and confirmPassword is the same
			})
			.refine((data) => data.password === data.confirmPassword, {
				message: 'Passwords do not match',
				path: ['confirmPassword']
			})
	});
	const submitHandler = remoteSubmitHandler({
		onSubmit: async ({ cancel, toast }) => {
			const validated = formState.validateAll();
			if (!validated.success) {
				toast.error('Invalid Data');
				return cancel();
			}
			return async () => await handlePasswordRegister({ state: s, payload: validated.data });
		}
	});
	let passwordInputType = $state<'password' | 'text'>('password');
</script>

<form class="grid gap-6" onsubmit={submitHandler.handle}>
	{#if plugins && plugins.includes('password')}
		<div class="grid gap-3">
			<Label for="name">Name {@render RedDot()}</Label>
			<div class="grid gap-1">
				<Input
					id="name"
					name="name"
					type="text"
					placeholder="your name"
					required
					{...formState.attribute.name}
					bind:value={formState.value.name}
				/>
				<InputError message={formState.result.name.errors} />
			</div>
		</div>
		<div class="grid gap-3">
			<Label for="email">Email {@render RedDot()}</Label>
			<div class="grid gap-1">
				<Input
					id="email"
					name="email"
					type="email"
					placeholder="m@example.com"
					required
					{...formState.attribute.email}
					bind:value={formState.value.email}
				/>
				<InputError message={formState.result.email.errors} />
			</div>
		</div>
		<div class="grid gap-3">
			<div class="flex items-center">
				<Label for="password">Password {@render RedDot()}</Label>
			</div>
			<div class="grid gap-1">
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
				<InputError message={formState.result.password.errors} />
			</div>
		</div>
		<div class="grid gap-3">
			<div class="flex items-center">
				<Label for="confirmPassword">Confirm Password {@render RedDot()}</Label>
			</div>
			<div class="grid gap-1">
				<div class="relative">
					<Input
						id="confirmPassword"
						name="confirmPassword"
						type={passwordInputType}
						minlength={4}
						maxlength={255}
						placeholder="Confirm Password"
						required
						class="pr-10"
						{...formState.attribute.confirmPassword}
						bind:value={formState.value.confirmPassword}
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
				<InputError message={formState.result.confirmPassword.errors} />
			</div>
		</div>
		<Button disabled={submitHandler.processing} type="submit" class="w-full">Register</Button>
	{/if}
</form>
{#snippet RedDot()}
	<span class="text-red-500">*</span>
{/snippet}
