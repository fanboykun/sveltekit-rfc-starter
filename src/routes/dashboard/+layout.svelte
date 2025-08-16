<script lang="ts">
	import AppHeader from '$lib/components/layouts/app/app-header.svelte';
	import AppSidebar, {
		type Link,
		type NavLinks
	} from '$lib/components/layouts/app/app-sidebar.svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { createBreadcrumb, setBreadcrumb } from '$lib/hooks/use-breadcrumb.svelte';
	import {
		ChartBar,
		EditIcon,
		Folder,
		LayoutDashboardIcon,
		Loader,
		PlusIcon,
		Trash2Icon
	} from '@lucide/svelte';
	import type { LayoutProps } from './$types';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { ProgressBar, progressOnNavigate } from '$lib/components/ui/progress-bar/index.svelte';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import AlertCircleIcon from '@lucide/svelte/icons/alert-circle';
	import { Button } from '$lib/components/ui/button';
	import Settings_2 from '@lucide/svelte/icons/settings-2';

	let { children, data }: LayoutProps = $props();

	const primaryLinks: NavLinks[] = [
		{
			title: 'Dashboard',
			links: [
				{
					label: 'Statistics',
					url: '#',
					icon: ChartBar,
					isActive: true
				}
			]
		},
		{
			title: 'Report',
			links: [
				{
					label: 'Report',
					icon: LayoutDashboardIcon,
					isActive: true,
					items: [
						{
							label: 'Cash Flow',
							isActive: false,
							url: '#'
						}
					]
				}
			]
		},
		{
			title: 'Projects',
			links: [
				{
					label: 'Main Projects',
					icon: Folder,
					isActive: true,
					id: '1',
					actions: [
						{
							label: 'Add Project',
							isActive: false,
							url: '#',
							icon: PlusIcon
						},
						{
							label: 'Edit Project',
							isActive: false,
							url: '#',
							icon: EditIcon
						},
						{
							label: 'Delete Project',
							isActive: false,
							url: '#',
							icon: Trash2Icon
						}
					]
				}
			]
		}
	];
	const secondaryLink: Link[] = [
		{
			label: 'Settings',
			url: '#',
			icon: Settings_2,
			isActive: false
		}
	];
	const breadcrumb = createBreadcrumb({ label: 'Dashboard' });
	setBreadcrumb(breadcrumb);
	const progress = progressOnNavigate();
</script>

<Toaster />
<ProgressBar processing={progress.processing} />
<Sidebar.Provider open={data.preferences.sidebarOpen}>
	<AppSidebar user={data.user} {primaryLinks} {secondaryLink} collapsible="icon" />
	<Sidebar.Inset>
		<header class="flex h-16 shrink-0 items-center gap-2">
			<div class="flex w-full items-center gap-2 px-4">
				<Sidebar.Trigger class="-ml-1" />
				<Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
				<AppHeader />
			</div>
		</header>
		<div
			class="flex flex-1 flex-col gap-4 p-4 pt-0 transition-opacity duration-300 starting:opacity-0"
		>
			<svelte:boundary>
				{#snippet failed(_, reset)}
					<div class="flex h-full w-full items-center items-start justify-center">
						<Alert.Root class="w-fit">
							<AlertCircleIcon />
							<Alert.Title>Error! Something went wrong</Alert.Title>
							<Alert.Description class="flex items-center justify-between gap-2">
								<p>Something went wrong, please try again.</p>
								<Button onclick={reset} variant="outline" size="sm">Retry</Button>
							</Alert.Description>
						</Alert.Root>
					</div>
				{/snippet}
				{#snippet pending()}
					<div class="flex h-full w-full items-center items-start justify-center">
						<Loader class="size-8 animate-spin" />
					</div>
				{/snippet}
				{@render children?.()}
			</svelte:boundary>
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>
