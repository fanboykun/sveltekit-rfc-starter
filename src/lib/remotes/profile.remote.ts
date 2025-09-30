import { command, getRequestEvent } from '$app/server';
import { Models } from '$lib/server/db/models';
import { RemoteResponse } from '$lib/shared/utils/remote-response';
import z from 'zod/v4';
import { compare, hash } from 'bcryptjs';
import { PasswordPlugin } from '$lib/server/auth/plugins/password';

export const updateAccount = command(
	z.object({
		name: z.string().min(1).max(100)
	}),
	async ({ name }) => {
		const event = getRequestEvent();
		const {
			locals: { user }
		} = event;
		if (!user) return RemoteResponse.failure({ message: 'Unauthorized', error: {} });
		const updated = await new Models.User().update(user.id, { name });
		if (!updated) return RemoteResponse.failure({ message: 'Failed to update account', error: {} });
		return RemoteResponse.success({ message: 'Account updated successfully', data: {} });
	}
);
export const updatePassword = command(
	z
		.object({
			oldPassword: z.string().optional(),
			newPassword: z.string().min(1).max(100),
			confirmNewPassword: z.string().min(1).max(100)
		})
		.refine((data) => data.newPassword === data.confirmNewPassword, {
			message: 'Passwords do not match',
			path: ['confirmNewPassword']
		}),
	async ({ oldPassword, newPassword }) => {
		const event = getRequestEvent();
		const {
			locals: { user }
		} = event;

		if (!user) return RemoteResponse.failure({ message: 'Unauthorized', error: {} });
		if (user.password) {
			if (!oldPassword)
				return RemoteResponse.failure({ message: 'Old password is required', error: {} });
			const verified = await compare(oldPassword, user.password);
			if (!verified) {
				return RemoteResponse.failure({ message: 'Invalid password', error: {} });
			}
		}

		const hashed = await hash(newPassword, PasswordPlugin.getHashingOptions().saltRounds);
		const updated = await new Models.User().update(user.id, {
			password: hashed,
			provider: 'password'
		});
		if (!updated) {
			return RemoteResponse.failure({ message: 'Failed to update password', error: {} });
		}
		return RemoteResponse.success({ message: 'Password updated successfully', data: {} });
	}
);
