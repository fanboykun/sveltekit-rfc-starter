/* eslint-disable @typescript-eslint/no-explicit-any */
export type AtLeastOne<T, K extends keyof T = keyof T> = K extends keyof T
	? Required<Pick<T, K>> & Partial<Omit<T, K>>
	: never;

export type AtLeastOneItem<T extends Array<any>> = [...T];
type IsObject<T> = T extends object
	? T extends Array<any>
		? false
		: T extends () => any
			? false
			: T extends Date
				? false
				: true
	: false;

type DeepMerge<T, U> = {
	[K in keyof T | keyof U]: K extends keyof U
		? K extends keyof T
			? IsObject<T[K]> extends true
				? IsObject<U[K]> extends true
					? DeepMerge<T[K], U[K]>
					: U[K]
				: U[K]
			: U[K]
		: K extends keyof T
			? T[K]
			: never;
};
function isPlainObject(obj: unknown): obj is Record<string, unknown> {
	return (
		obj !== null &&
		typeof obj === 'object' &&
		!Array.isArray(obj) &&
		!(obj instanceof Date) &&
		!(obj instanceof RegExp) &&
		typeof obj !== 'function'
	);
}

export function deepMerge<T extends Record<string, unknown>, U extends Record<string, unknown>>(
	target: T,
	source: U
): DeepMerge<T, U> {
	// Create a shallow copy of the target to avoid mutation
	const result = { ...target } as any;

	for (const key in source) {
		if (Object.prototype.hasOwnProperty.call(source, key)) {
			const sourceValue = source[key];
			const targetValue = result[key];

			if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
				// Recursively merge nested objects
				result[key] = deepMerge(targetValue, sourceValue);
			} else {
				// Replace primitive values, arrays, dates, functions, etc.
				result[key] = sourceValue;
			}
		}
	}

	return result as DeepMerge<T, U>;
}
