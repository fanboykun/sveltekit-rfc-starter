import { fail as failKit, redirect as redirectKit, error as errorKit } from '@sveltejs/kit';
export function failure<T>({ message, error }: { message: string; error: T }) {
	return {
		success: false as const,
		status: 'failure' as const,
		message,
		error
	};
}
export function success<T>({ message, data }: { message: string; data: T }) {
	return {
		success: true as const,
		status: 'success' as const,
		message,
		data
	};
}
export function go({ location, message = '' }: { location: string; message: string }) {
	return {
		success: false as const,
		status: 'redirect' as const,
		redirect: location,
		message
	};
}
export function fail<T>({
	message,
	error,
	status = 400
}: {
	message: string;
	error: T;
	status?: number;
}) {
	return failKit(status, { message, error, status: 'fail' as const });
}
export function redirect({ location, status = 302 }: { location: string | URL; status?: number }) {
	return redirectKit(status, location);
}
export function error({ status = 500, ...body }: { status?: number } & App.Error) {
	return errorKit(status, body);
}
export const RemoteResponse = { failure, success, go, fail, redirect, error };
