import type { Cookies } from '@sveltejs/kit';
import { randomBytes, createHmac, timingSafeEqual } from 'node:crypto';
import type { AuthConfig } from './config';

/**
 * Base session utilities for creating, signing, verifying and managing
 * cookie-based sessions. Intended to be extended by concrete session managers.
 */
export abstract class BaseSession {
	/**
	 * In the future, maybe this should be configurable
	 */
	protected static readonly DELIM: string = '.' as const;

	/**
	 * Initialize BaseSession with the provided config and ensure a secret exists.
	 * If no secret is provided, a new one will be generated.
	 * @param config Auth configuration
	 */
	constructor(public config: AuthConfig) {
		if (!config.secret) config.secret = this.createSecret();
	}

	/**
	 * Generate a random session identifier.
	 * @returns Hex-encoded string identifying the session
	 */
	generateSessionId() {
		return randomBytes(32).toString('hex');
	}

	/**
	 * Read and verify the signed session cookie.
	 * If invalid, the cookie will be deleted.
	 * @param cookies SvelteKit cookies interface
	 * @returns The verified session id or null when missing/invalid
	 */
	getCookie(cookies: Cookies): string | null {
		const cookie = cookies.get(this.config.sessionName);
		if (!cookie) return null;
		const verified = this.verifyCookie(cookie);
		if (!verified.valid) {
			cookies.delete(this.config.sessionName, { path: '/' });
			return null;
		}
		return verified.value;
	}

	/**
	 * Sign and set the session cookie with appropriate options and expiry.
	 * @param cookies SvelteKit cookies interface
	 * @param sessionId The raw (unsigned) session id to store
	 */
	setCookie(cookies: Cookies, sessionId: string) {
		const cookieExpiresAt = new Date(Date.now() + this.config.sessionLifetime * 1000);
		const signed = this.signCookie(sessionId);
		cookies.set(this.config.sessionName, signed, {
			...this.config.cookieOptions,
			expires: cookieExpiresAt
		});
	}

	/**
	 * Delete the session cookie from the client.
	 * @param cookies SvelteKit cookies interface
	 */
	deleteCookie(cookies: Cookies) {
		cookies.delete(this.config.sessionName, { path: '/' });
	}

	/**
	 * Generate a cryptographically secure, URL-safe random secret.
	 * @param lengthBytes Number of random bytes to generate (default: 32 = 256 bits)
	 * @returns URL-safe base64 string without padding
	 */
	private createSecret(lengthBytes: number = 32): string {
		const buf: Buffer = randomBytes(lengthBytes);
		const b64: string = buf.toString('base64');
		return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
	}

	/**
	 * Produce a URL-safe HMAC-SHA256 signature for the given text using the instance secret.
	 * @param text Plain text to sign
	 * @returns URL-safe base64 signature
	 */
	private signText(text: string): string {
		const mac: Buffer = createHmac('sha256', this.config.secret!).update(text).digest();
		const b64: string = mac.toString('base64');
		return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
	}

	/**
	 * Create a signed cookie value in the format: `${value}.${signature}`.
	 * @param value Unsigned cookie payload (e.g., session id)
	 * @returns Signed cookie string
	 */
	public signCookie(value: string): string {
		const sig: string = this.signText(value);
		return `${value}${BaseSession.DELIM}${sig}` as const;
	}

	/**
	 * Verify a signed cookie string by recomputing and comparing its signature
	 * using a constant-time comparison. If valid, returns the original value.
	 * @param signed Cookie string in the format `${value}.${signature}`
	 * @returns `{ valid: true, value }` when valid; otherwise `{ valid: false }`
	 */
	public verifyCookie(
		signed: string
	): { readonly valid: true; readonly value: string } | { readonly valid: false } {
		const i: number = signed.lastIndexOf(BaseSession.DELIM);
		if (i <= 0) return { valid: false } as const;
		const value: string = signed.slice(0, i);
		const sig: string = signed.slice(i + 1);
		const expected: string = this.signText(value);
		const a: Buffer = Buffer.from(expected, 'utf8');
		const b: Buffer = Buffer.from(sig, 'utf8');
		if (a.length !== b.length) return { valid: false } as const;
		return timingSafeEqual(a, b) ? ({ valid: true, value } as const) : ({ valid: false } as const);
	}
}
