import { getContext, setContext } from 'svelte';

export function createBreadcrumb(props: { label: string; url?: string }) {
	let value = $state([props]);

	const setBreadcrumb = (val: { label: string; url?: string }[]) => {
		value = val;
	};

	const addBreadcrumb = (val: { label: string; url?: string }) => {
		value = [...value, val];
	};

	return {
		get value() {
			return value;
		},
		setBreadcrumb,
		addBreadcrumb
	};
}
type BreadCrumb = ReturnType<typeof createBreadcrumb>;
const breadcrumbCtx = Symbol('breadcrumb_context');

export function setBreadcrumb(breadcrumb: BreadCrumb) {
	return setContext(breadcrumbCtx, breadcrumb);
}

export function useBreadcrumb(): BreadCrumb {
	return getContext(breadcrumbCtx);
}
