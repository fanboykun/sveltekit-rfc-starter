import type { LayoutServerLoadEvent } from './$types';

export const load = async ({ locals }: LayoutServerLoadEvent) => {
	const { user } = locals;
	const safeUser: SafeUser | null = user
		? {
				id: user.id,
				name: user.name,
				email: user.email,
				image: user.image,
				userRole: user.userRole
			}
		: null;
	return { user: safeUser };
};
