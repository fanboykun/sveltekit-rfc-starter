import { z } from 'zod';

export function match(value: string) {
	return z.coerce.number().int().positive().safeParse(value).success;
}
