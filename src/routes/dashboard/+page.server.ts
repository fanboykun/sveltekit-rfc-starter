import type { PageServerLoad } from './$types';
import { ensureAuthenticated } from '$lib/server/middlewares/ensure-authenticated';

export const load: PageServerLoad = ensureAuthenticated(() => {});
