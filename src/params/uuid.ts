import { z } from 'zod';

export function match(value: string) {
	return z.uuid().safeParse(value).success;
}
