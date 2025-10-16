import { env } from '$env/dynamic/private';
import { Resend } from 'resend';

const resendApiKey = env.RESEND_API_KEY;
if (!resendApiKey) throw new Error('RESEND_API_KEY is not defined');
export const resend = new Resend(resendApiKey);
