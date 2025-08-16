import { ensureAuthenticated } from '$lib/server/middlewares/ensure-authenticated';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ensureAuthenticated(async ({ locals: { user } }) => {
	const safeUser: SafeUser = {
		id: user.id,
		name: user.name,
		email: user.email,
		image: user.image,
		userRole: user.userRole
	};
	return { user: safeUser };
});
