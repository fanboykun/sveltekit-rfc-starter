import { AuthProviderList } from '$lib/shared/enums/enum';
import { z } from 'zod';

export function match(value: string) {
	return z.enum(AuthProviderList).safeParse(value).success;
}
