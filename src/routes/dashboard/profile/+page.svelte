<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Settings } from '@lucide/svelte';
	import UpdateAccount from './(components)/update-account.svelte';
	import UpdatePassword from './(components)/update-password.svelte';
	let { data } = $props();
</script>

<div class="flex w-full flex-wrap items-center justify-between rounded-lg p-2">
	<h1 class="flex gap-2 text-lg font-bold sm:text-xl"><Settings /> Profil</h1>
</div>
<div class="flex w-full flex-col gap-4 @lg:flex-row @lg:gap-8">
	<Card.Root class="h-fit w-full @lg:w-1/5">
		<Card.Content class="flex items-center justify-center">
			<Avatar.Root class="size-18 sm:size-26">
				<Avatar.Image src={data.user.image || 'https://github.com/shadcn.png'} alt="@shadcn" />
				<Avatar.Fallback>
					<Avatar.Fallback>SL</Avatar.Fallback>
				</Avatar.Fallback>
			</Avatar.Root>
		</Card.Content>
	</Card.Root>
	<div class="flex w-full flex-col gap-8 @lg:w-4/5">
		<UpdateAccount user={data.user} />
		<UpdatePassword />
	</div>
</div>
