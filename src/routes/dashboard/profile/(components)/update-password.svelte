<script lang="ts">
	import { createFormState } from '$lib/hooks/form-state.svelte.js';
	import z4 from 'zod/v4';
	import { remoteSubmitHandler } from '$lib/hooks/remote-sumbit-handler.svelte.js';
	import { updatePassword } from '$lib/remotes/profile.remote.js';

	const updatePasswordState = createFormState({
		schema: z4
			.object({
				oldPassword: z4.string().optional(),
				newPassword: z4.string().min(1),
				confirmNewPassword: z4.string().min(1)
			})
			.refine((data) => data.newPassword === data.confirmNewPassword, {
				message: 'Passwords do not match',
				path: ['confirmNewPassword']
			}),
		initial: {
			oldPassword: undefined as string | undefined,
			newPassword: '',
			confirmNewPassword: ''
		}
	});

	const _updatePasswordHandler = remoteSubmitHandler({
		onSubmit: ({ cancel, toast }) => {
			const validated = updatePasswordState.validateAll();
			if (!validated.success) {
				toast.error('Invalid Data');
				return cancel();
			}
			return async () => await updatePassword(validated.data);
		}
	});
</script>
