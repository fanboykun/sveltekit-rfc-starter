<script lang="ts">
	import AppHeader from '$lib/components/layouts/app/app-header.svelte';
	import AppSidebar, {
		type Link,
		type NavLinks
	} from '$lib/components/layouts/app/app-sidebar.svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { createBreadcrumb, setBreadcrumb } from '$lib/hooks/use-breadcrumb.svelte';
	import { EditIcon, PlusIcon, SettingsIcon, SquareTerminalIcon, Trash2Icon } from '@lucide/svelte';
	let { children } = $props();
	const user = {
		name: 'shadcn',
		email: 'm@example.com',
		image: '/avatars/shadcn.jpg'
	};
	const primaryLinks: NavLinks[] = [
		{
			title: 'Dashboard',
			links: [
				{
					label: 'Statistics',
					url: '#',
					icon: SquareTerminalIcon,
					isActive: true
				}
			]
		},
		{
			title: 'Report',
			links: [
				{
					label: 'Report',
					icon: SquareTerminalIcon,
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
					icon: SquareTerminalIcon,
					isActive: true,
					id: '1',
					actions: [
						{
							label: 'Add Project',
							isActive: false,
							url: '#',
							icon: PlusIcon,
							onclick: () => {
								console.log('Add Project');
							}
						},
						{
							label: 'Edit Project',
							isActive: false,
							url: '#',
							icon: EditIcon,
							onclick: () => {
								console.log('Edit Project');
							}
						},
						{
							label: 'Delete Project',
							isActive: false,
							url: '#',
							icon: Trash2Icon,
							onclick: () => {
								console.log('Delete Project');
							}
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
			icon: SettingsIcon,
			isActive: false
		}
	];
	const breadcrumb = createBreadcrumb({ label: 'Dashboard' });
	setBreadcrumb(breadcrumb);
</script>

<Sidebar.Provider>
	<AppSidebar {user} {primaryLinks} {secondaryLink} />
	<Sidebar.Inset>
		<header class="flex h-16 shrink-0 items-center gap-2">
			<div class="flex w-full items-center gap-2 px-4">
				<Sidebar.Trigger class="-ml-1" />
				<Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
				<AppHeader />
			</div>
		</header>
		<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
			<svelte:boundary>
				{#snippet failed()}
					whoops, apples or bananas failed.
				{/snippet}
				{#snippet pending()}
					loading...
				{/snippet}
				{@render children?.()}
			</svelte:boundary>
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>
