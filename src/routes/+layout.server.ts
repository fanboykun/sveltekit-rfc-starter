import { type LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const { user } = locals;
	if (!user) return { user: null };
	return {
		user: {
			name: user.name,
			email: user.email,
			image: user.image,
			userRole: user.userRole
		}
	};
};
