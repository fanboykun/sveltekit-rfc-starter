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
		House,
		LayoutDashboardIcon,
		PlusIcon,
		RefreshCcw,
		Trash2Icon
	} from '@lucide/svelte';
	import type { LayoutProps } from './$types';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { ProgressBar, progressOnNavigate } from '$lib/components/ui/progress-bar/index.svelte';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import AlertCircleIcon from '@lucide/svelte/icons/alert-circle';
	import { Button } from '$lib/components/ui/button';
	import Settings_2 from '@lucide/svelte/icons/settings-2';
	import { dev } from '$app/environment';

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

<Toaster position="top-center" richColors closeButton />
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
				{#snippet failed(error, reset)}
					<div class="flex h-full w-full items-center items-start justify-center">
						<Alert.Root class="w-fit">
							<AlertCircleIcon />
							<Alert.Title>Error! Something went wrong</Alert.Title>
							<Alert.Description class="flex flex-col items-center justify-start gap-2">
								<div class="flex w-full flex-col justify-start">
									<p>Please try again or contact the developer.</p>
									<p class="hidden">
										{console.log(error)}
									</p>
									{#if dev}
										<p>{error}</p>
									{/if}
								</div>
								<div class="w-full">
									<Button onclick={reset} variant="outline" size="sm"
										><RefreshCcw /> Coba Lagi</Button
									>
									<Button href="/" variant="ghost" size="sm"><House /> Home</Button>
								</div>
							</Alert.Description>
						</Alert.Root>
					</div>
				{/snippet}
				{#snippet pending()}
					<div
						class="absolute inset-0 flex items-center justify-center overflow-hidden bg-background"
					>
						<div class="absolute inset-0 opacity-30">
							<div
								class="gradient-primary animate-float absolute top-20 left-20 h-32 w-32 rounded-full"
							></div>
							<div
								class="gradient-accent animate-float absolute right-32 bottom-32 h-24 w-24 rounded-full"
								style="animation-delay: 1s;"
							></div>
							<div
								class="gradient-app animate-morph absolute top-1/2 left-1/4 h-40 w-40 rounded-full opacity-60"
							></div>
							<div
								class="animate-spin-slow absolute right-1/4 bottom-1/4 h-28 w-28 rounded-full bg-primary/20"
							></div>
						</div>

						<div class="relative z-10 mx-auto max-w-md px-8 text-center">
							<div class="animate-fade-in-up mb-12">
								<div class="relative">
									<div class="relative mx-auto mb-6 h-24 w-24">
										<div
											class="gradient-primary animate-pulse-glow absolute inset-0 rounded-2xl"
										></div>
										<div
											class="absolute inset-2 flex items-center justify-center rounded-xl bg-background"
										>
											<div class="gradient-app animate-morph h-8 w-8 rounded-lg"></div>
										</div>
									</div>

									<h1
										class="animate-gradient mb-2 bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] bg-clip-text text-4xl font-bold text-transparent"
									>
										{data.config.name}
									</h1>
									<p class="text-lg text-muted-foreground">{data.config.description}</p>
								</div>
							</div>

							<div
								class="gradient-primary animate-spin-slow absolute -top-32 -left-32 h-64 w-64 rounded-full opacity-10"
							></div>
							<div
								class="gradient-accent animate-spin-slow absolute -right-32 -bottom-32 h-64 w-64 rounded-full opacity-10"
								style="animation-direction: reverse;"
							></div>
						</div>

						<div class="pointer-events-none absolute inset-0">
							{#each { length: 6 } as _, i}
								{@const idx = i + 1}
								<div
									class="animate-float absolute h-1 w-1 rounded-full bg-primary opacity-60"
									style="left: {20 + idx * 5}%; top: {30 + idx * 5}%; animation-delay: {idx *
										0.5}s; animation-duration: {3 + idx * 0.5}s;"
								></div>
							{/each}
						</div>
					</div>
				{/snippet}
				{@render children?.()}
			</svelte:boundary>
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>
