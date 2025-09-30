<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { createFormState } from '$lib/hooks/form-state.svelte';
	import { remoteSubmitHandler } from '$lib/hooks/remote-sumbit-handler.svelte';
	import { updateAccount } from '$lib/remotes/profile.remote';
	import z4 from 'zod/v4';
	interface Props {
		user: SafeUser;
	}
	let { user }: Props = $props();
	const formState = createFormState({
		schema: z4.object({
			name: z4.string().min(1)
		}),
		initial: {
			name: user.name
		}
	});
	const _handleUpdateAccount = remoteSubmitHandler({
		onSubmit: ({ cancel, toast }) => {
			const validated = formState.validateAll();
			if (!validated.success) {
				toast.error('Invalid Data');
				return cancel();
			}
			return async () => await updateAccount(validated.data);
		},
		onSuccess: async () => {
			await invalidateAll();
		}
	});
</script>
