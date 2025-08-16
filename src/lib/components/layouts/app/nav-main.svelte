<script lang="ts">
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import type { CollapsibleLink, Link, NavLinks } from './app-sidebar.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { EllipsisIcon } from '@lucide/svelte';
	import { useSidebar } from '$lib/components/ui/sidebar/index.js';

	interface NavMainProps {
		items: NavLinks[];
	}

	let { items }: NavMainProps = $props();
	const sidebar = useSidebar();
</script>

{#each items as item (item.title)}
	<Sidebar.Group>
		<Sidebar.GroupLabel>{item.title}</Sidebar.GroupLabel>
		<Sidebar.Menu>
			{#each item.links as link (link.label)}
				{#if 'items' in link}
					{@const collapsibleLink = link as CollapsibleLink}
					<Collapsible.Root open={collapsibleLink.isActive}>
						{#snippet child({ props })}
							<Sidebar.MenuItem {...props}>
								<Sidebar.MenuButton tooltipContent={collapsibleLink.label}>
									<collapsibleLink.icon />
									<span>{collapsibleLink.label}</span>
								</Sidebar.MenuButton>
								{#if collapsibleLink.items?.length}
									<Collapsible.Trigger>
										{#snippet child({ props })}
											<Sidebar.MenuAction {...props} class="data-[state=open]:rotate-90">
												<ChevronRightIcon />
												<span class="sr-only">Toggle</span>
											</Sidebar.MenuAction>
										{/snippet}
									</Collapsible.Trigger>
									<Collapsible.Content>
										<Sidebar.MenuSub>
											{#each collapsibleLink.items as subItem (subItem.label)}
												<Sidebar.MenuSubItem>
													<Sidebar.MenuSubButton href={subItem.url}>
														<span>{subItem.label}</span>
													</Sidebar.MenuSubButton>
												</Sidebar.MenuSubItem>
											{/each}
										</Sidebar.MenuSub>
									</Collapsible.Content>
								{/if}
							</Sidebar.MenuItem>
						{/snippet}
					</Collapsible.Root>
				{:else}
					<Sidebar.MenuItem>
						<Sidebar.MenuButton>
							{#snippet child({ props })}
								<a href={(link as Link).url} {...props}>
									<link.icon />
									<span>{link.label}</span>
								</a>
							{/snippet}
						</Sidebar.MenuButton>
						{#if 'actions' in link && link.actions?.length}
							<DropdownMenu.Root>
								<DropdownMenu.Trigger>
									{#snippet child({ props })}
										<Sidebar.MenuAction showOnHover {...props}>
											<EllipsisIcon />
											<span class="sr-only">More</span>
										</Sidebar.MenuAction>
									{/snippet}
								</DropdownMenu.Trigger>
								<DropdownMenu.Content
									class="w-48"
									side={sidebar.isMobile ? 'bottom' : 'right'}
									align={sidebar.isMobile ? 'end' : 'start'}
								>
									{#each link.actions as action (action.label)}
										<DropdownMenu.Item onclick={() => action.onclick?.(link.id)}>
											<action.icon class="text-muted-foreground" />
											<span>{action.label}</span>
										</DropdownMenu.Item>
									{/each}
								</DropdownMenu.Content>
							</DropdownMenu.Root>
						{/if}
					</Sidebar.MenuItem>
				{/if}
			{/each}
		</Sidebar.Menu>
	</Sidebar.Group>
{/each}
