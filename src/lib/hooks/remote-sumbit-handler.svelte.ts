import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { isRedirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';

type BaseRemoteResponse =
	| { success: true; message: string; status: 'success' }
	| { success: false; message: string; status: 'failure' }
	| { success: false; message: string; status: 'redirect' };
type SuccessRemoteResponse<T extends BaseRemoteResponse> = Extract<
	T,
	{ success: true; status: 'success' }
>;
type FailureRemoteResponse<F extends BaseRemoteResponse> = Extract<
	F,
	{ success: false; status: 'failure' }
>;
type RedirectRemoteResponse<R extends BaseRemoteResponse> = Extract<
	R,
	{ success: false; status: 'redirect' }
>;
export type RemoteHandler<T extends BaseRemoteResponse> = () => Promise<T> | never;
export type OnSubmitProps = {
	signal: AbortSignal;
	cancel: (reason?: string) => never;
	toast: typeof toast;
};
export type RemoteSubmitHandlerProps<T extends BaseRemoteResponse> = {
	onSubmit: (props: OnSubmitProps) => MaybePromise<RemoteHandler<T>>;
	onSuccess?: (data: SuccessRemoteResponse<T>) => MaybePromise<void>;
	onFailure?: (fail: FailureRemoteResponse<T>) => MaybePromise<void>;
	onError?: (error: App.Error) => MaybePromise<void>;
	onUnknownError?: (error: unknown) => MaybePromise<void>;
	onAborted?: (event: Event | Error) => MaybePromise<void>;
	onRedirect?: (redirect: RedirectRemoteResponse<T>) => MaybePromise<void>;
};

class CancelationError extends Error {
	public name = 'CancelationError';
	constructor() {
		super('Request canceled', { cause: 'Cancelation Error' });
	}
}

export function remoteSubmitHandler<T extends BaseRemoteResponse>(
	props: RemoteSubmitHandlerProps<T>
) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleIfRedirect = async (result: any) => {
		if ('redirect' in result && typeof result.redirect === 'string') {
			if (result.redirect.startsWith(window.location.origin) || result.redirect.startsWith('/')) {
				return await goto(resolve(result.redirect));
			} else {
				window.location.href = result.redirect;
				return;
			}
		}
		if (isRedirect(result)) {
			if (result.location.startsWith(window.location.origin) || result.location.startsWith('/')) {
				return await goto(result.location);
			} else {
				window.location.href = result.location;
				return;
			}
		}
	};
	let processing = $state(false);
	/**
	 * Abort Controller to abort the request
	 */
	let abortController = new AbortController();
	let canceled = false;
	/**
	 * Prevent the submission
	 */
	const cancel = (reason?: string) => {
		canceled = true;
		if (reason) toast.error(reason);
		throw new CancelationError();
	};

	/**
	 * Signal Abortion Listener
	 */
	const listenToAbortion = (e: Event) => props.onAborted?.(e);

	/**
	 * Main Remote Function Caller Handler
	 */
	const handle = async <E extends Event | SubmitEvent | MouseEvent>(event?: E) => {
		try {
			event?.preventDefault();
			if (processing) return cancel();
			abortController.signal.addEventListener('abort', listenToAbortion);

			const onSubmitProps: OnSubmitProps = {
				signal: abortController.signal,
				cancel,
				toast
			};

			processing = true;
			const remoteFn = await props.onSubmit(onSubmitProps);
			if (canceled || abortController.signal.aborted) return;
			const result = await remoteFn();
			// await handleIfRedirect(result);

			if (result.success && result.status === 'success') {
				toast.success(result.message);
				await props.onSuccess?.(result as SuccessRemoteResponse<T>);
			} else if (!result.success) {
				if (result.status === 'failure') {
					toast.error(result.message);
					await props.onFailure?.(result as FailureRemoteResponse<T>);
				} else if (result.status === 'redirect') {
					toast.info(result.message);
					await handleIfRedirect(result);
					await props.onRedirect?.(result as RedirectRemoteResponse<T>);
				}
			}
		} catch (error) {
			if (error instanceof CancelationError) return;

			// handle if the error is AbortController error
			if ((error as Error).name === 'AbortError') return props.onAborted?.(error as Error);

			if (
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				'body' in (error as any) &&
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				'status' in (error as any)
			) {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const err = (error as any).body as App.Error;
				toast.error(err.message);
				await props.onError?.(err);
			} else {
				console.error(error);
				toast.error('Something went wrong');
				await props.onUnknownError?.(error);
			}
		} finally {
			processing = false;
			canceled = false;
			abortController = new AbortController();
		}
	};
	return {
		get processing() {
			return processing;
		},
		set processing(v) {
			processing = v;
		},
		get abortController() {
			return abortController;
		},
		cancel,
		handle
	};
}
