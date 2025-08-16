import { pgEnum } from 'drizzle-orm/pg-core';

export const authProviderEnum = pgEnum('auth_provider', ['google', 'github']);
export const userRoleEnum = pgEnum('user_role', ['user', 'admin']);
