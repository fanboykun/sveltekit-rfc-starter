<script lang="ts" module>
	export type Link = {
		label: string;
		url: string;
		isActive: boolean;
		icon: typeof import('@lucide/svelte/icons').Icon;
	};

	export type ActionLink = Link & {
		id: string;
		actions?: (Link & { onclick?: (id: string) => void })[];
	};

	export type CollapsibleLink = Omit<Link, 'url'> & {
		items?: Omit<Link, 'icon'>[];
	};

	export type NavLinks = {
		title: string;
		links: (Link | ActionLink | CollapsibleLink)[];
	};

	type AppSidebarProps = {
		user: SafeUser;
		primaryLinks: NavLinks[];
		secondaryLink: Link[];
		collapsible?: 'none' | 'offcanvas' | 'icon';
		AppLogo?: Snippet<[{ props: Record<string, unknown> }]>;
	} & ComponentProps<typeof Sidebar.Root>;
</script>

<script lang="ts">
	import NavMain from './nav-main.svelte';
	import NavSecondary from './nav-secondary.svelte';
	import NavUser from './nav-user.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import CommandIcon from '@lucide/svelte/icons/command';
	import type { ComponentProps, Snippet } from 'svelte';

	let {
		ref = $bindable(null),
		user,
		primaryLinks,
		secondaryLink,
		AppLogo,
		...restProps
	}: AppSidebarProps = $props();
</script>

<Sidebar.Root bind:ref variant="inset" {...restProps}>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg">
					{#snippet child({ props })}
						{#if AppLogo}
							{@render AppLogo({ props })}
						{:else}
							<a href="/" {...props}>
								<div
									class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
								>
									<CommandIcon class="size-4" />
								</div>
								<div class="grid flex-1 text-left text-sm leading-tight">
									<span class="truncate font-medium">Acme Inc</span>
									<span class="truncate text-xs">Enterprise</span>
								</div>
							</a>
						{/if}
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		<NavMain items={primaryLinks} />
		<NavSecondary items={secondaryLink} class="mt-auto" />
	</Sidebar.Content>
	<Sidebar.Footer>
		<NavUser {user} />
	</Sidebar.Footer>
</Sidebar.Root>
