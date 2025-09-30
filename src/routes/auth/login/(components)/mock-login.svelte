<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { createFormState } from '$lib/hooks/form-state.svelte';
	import { remoteSubmitHandler } from '$lib/hooks/remote-sumbit-handler.svelte';
	import { handleMockLogin } from '$lib/remotes/auth.remote';
	import z from 'zod';

	let { state: s }: { state?: string } = $props();
	const formState = createFormState({
		schema: z.object({
			name: z.string({ error: 'Invalid Name' }).min(4).max(255),
			email: z.string({ error: 'Invalid Email' }).email()
		})
	});
	const submitHandler = remoteSubmitHandler({
		onSubmit: async ({ cancel, toast }) => {
			const validated = formState.validateAll();
			if (!validated.success) {
				toast.error('Invalid Data');
				return cancel();
			}
			return async () => await handleMockLogin({ state: s, ...validated.data });
		}
	});
</script>

<div class="grid gap-6">
	<div class="grid gap-3">
		<div class="flex items-center">
			<Label for="name">Name</Label>
		</div>
		<Input
			id="name"
			name="name"
			minlength={4}
			maxlength={255}
			type="text"
			placeholder="John Doe"
			required
			{...formState.attribute.name}
			bind:value={formState.value.name}
		/>
	</div>
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
	<Button onclick={submitHandler.handle} disabled={submitHandler.processing} class="w-full"
		>Login</Button
	>
</div>
