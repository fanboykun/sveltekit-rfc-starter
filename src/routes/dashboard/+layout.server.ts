import { SIDEBAR_COOKIE_NAME } from '$lib/components/ui/sidebar/constants';
import { ensureAuthenticated } from '$lib/server/middlewares/ensure-authenticated';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ensureAuthenticated(async ({ locals: { user }, cookies }) => {
	const sidebar = cookies.get(SIDEBAR_COOKIE_NAME);
	const preferences = {
		sidebarOpen: sidebar !== 'false'
	};
	const safeUser: SafeUser = {
		id: user.id,
		name: user.name,
		email: user.email,
		image: user.image,
		userRole: user.userRole
	};
	return { user: safeUser, preferences };
});
