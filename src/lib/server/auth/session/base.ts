import { randomBytes, createHmac, timingSafeEqual } from 'node:crypto';

export class BaseSession {
	secret: string;
	private static readonly DELIM: string = '.' as const;

	constructor(secret?: string) {
		this.secret = secret || this.createSecret();
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

	private signText(text: string): string {
		const mac: Buffer = createHmac('sha256', this.secret).update(text).digest();
		const b64: string = mac.toString('base64');
		return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
	}

	public signCookie(value: string): string {
		const sig: string = this.signText(value);
		return `${value}${BaseSession.DELIM}${sig}` as const;
	}

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
