type Enum<T extends string> = {
	[K in T as Uppercase<K>]: K;
};

export type AuthProviderType =
	(typeof import('$lib/server/db/schema/enums').authProviderEnum)['enumValues'][number];
export type UserRoleType =
	(typeof import('$lib/server/db/schema/enums').userRoleEnum)['enumValues'][number];

export const AuthProvider = Object.freeze({
	GOOGLE: 'google',
	GITHUB: 'github'
}) satisfies Enum<AuthProviderType>;
export const AuthProviderList = Object.freeze(Object.values(AuthProvider)) as [AuthProviderType];

export const UserRole = Object.freeze({
	USER: 'user',
	ADMIN: 'admin'
}) satisfies Enum<UserRoleType>;
export const UserRoleList = Object.freeze(Object.values(UserRole)) as [UserRoleType];
