import { z } from 'zod';

export function match(value: string) {
	return z
		.string()
		.min(1, {
			message: 'path slug is required'
		})
		.max(50, {
			message: 'path slug must be at most 50 characters long'
		})
		.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
			message:
				'path must be a valid slug: lowercase letters, numbers, and hyphens only. Cannot start or end with a hyphen.'
		})
		.refine((val) => !val.includes('--'), { message: 'path cannot contain consecutive hyphens' })
		.safeParse(value).success;
}
