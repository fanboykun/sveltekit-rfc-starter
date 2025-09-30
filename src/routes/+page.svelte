<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import ThemeToggler from '$lib/components/ui/theme-toggler/theme-toggler.svelte';
	import { handleLogout } from '$lib/remotes/auth.remote';

	let { data } = $props();
</script>

<div
	class="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a]"
>
	<header class="mb-6 w-full max-w-[335px] text-sm not-has-[nav]:hidden lg:max-w-4xl">
		<nav class="flex items-center justify-end gap-4">
			{#if data.user}
				<a
					href="/dashboard"
					class="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
					>Dashboard</a
				>
				<button
					type="button"
					onclick={async () => {
						const result = await handleLogout();
						if ('success' in result && result.success) {
							await invalidateAll();
						}
					}}
					class="inline-block rounded-sm border border-transparent px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
					aria-label="Logout">Logout</button
				>
			{:else}
				<a
					href="/auth/login"
					class="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
					>Login</a
				>
			{/if}
			<ThemeToggler />
		</nav>
	</header>
	<div
		class="flex w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0"
	>
		<main class="flex w-full max-w-[335px] flex-col-reverse lg:max-w-4xl lg:flex-row">
			<div
				class="flex-1 rounded-br-lg rounded-bl-lg bg-white p-6 pb-12 text-[13px] leading-[20px] shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] lg:rounded-tl-lg lg:rounded-br-none lg:p-20 dark:bg-[#161615] dark:text-[#EDEDEC] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]"
			>
				<h1 class="mb-1 font-medium">Let's get started</h1>
				<p class="mb-2 text-[#706f6c] dark:text-[#A1A09A]">
					This starterkit provides a solid foundation for building web applications.
				</p>
				<ul class="mb-4 flex flex-col lg:mb-6">
					<li
						class="relative flex items-center gap-4 py-2 before:absolute before:top-1/2 before:bottom-0 before:left-[0.4rem] before:border-l before:border-[#e3e3e0] dark:before:border-[#3E3E3A]"
					>
						<span class="relative bg-white py-1 dark:bg-[#161615]">
							<span
								class="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-[#e3e3e0] bg-[#FDFDFC] shadow-[0px_0px_1px_0px_rgba(0,0,0,0.03),0px_1px_2px_0px_rgba(0,0,0,0.06)] dark:border-[#3E3E3A] dark:bg-[#161615]"
							>
								<span class="h-1.5 w-1.5 rounded-full bg-[#dbdbd7] dark:bg-[#3E3E3A]"></span>
							</span>
						</span>
						<span> Sveltekit And Remote Functions </span>
					</li>
					<li
						class="relative flex items-center gap-4 py-2 before:absolute before:top-1/2 before:bottom-0 before:left-[0.4rem] before:border-l before:border-[#e3e3e0] dark:before:border-[#3E3E3A]"
					>
						<span class="relative bg-white py-1 dark:bg-[#161615]">
							<span
								class="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-[#e3e3e0] bg-[#FDFDFC] shadow-[0px_0px_1px_0px_rgba(0,0,0,0.03),0px_1px_2px_0px_rgba(0,0,0,0.06)] dark:border-[#3E3E3A] dark:bg-[#161615]"
							>
								<span class="h-1.5 w-1.5 rounded-full bg-[#dbdbd7] dark:bg-[#3E3E3A]"></span>
							</span>
						</span>
						<span> Shadcn-svelte</span>
					</li>
					<li
						class="relative flex items-center gap-4 py-2 before:absolute before:top-0 before:bottom-1/2 before:left-[0.4rem] before:border-l before:border-[#e3e3e0] dark:before:border-[#3E3E3A]"
					>
						<span class="relative bg-white py-1 dark:bg-[#161615]">
							<span
								class="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-[#e3e3e0] bg-[#FDFDFC] shadow-[0px_0px_1px_0px_rgba(0,0,0,0.03),0px_1px_2px_0px_rgba(0,0,0,0.06)] dark:border-[#3E3E3A] dark:bg-[#161615]"
							>
								<span class="h-1.5 w-1.5 rounded-full bg-[#dbdbd7] dark:bg-[#3E3E3A]"></span>
							</span>
						</span>
						<span> 0Auth Using Arctic </span>
					</li>
					<li
						class="relative flex items-center gap-4 py-2 before:absolute before:top-0 before:bottom-1/2 before:left-[0.4rem] before:border-l before:border-[#e3e3e0] dark:before:border-[#3E3E3A]"
					>
						<span class="relative bg-white py-1 dark:bg-[#161615]">
							<span
								class="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-[#e3e3e0] bg-[#FDFDFC] shadow-[0px_0px_1px_0px_rgba(0,0,0,0.03),0px_1px_2px_0px_rgba(0,0,0,0.06)] dark:border-[#3E3E3A] dark:bg-[#161615]"
							>
								<span class="h-1.5 w-1.5 rounded-full bg-[#dbdbd7] dark:bg-[#3E3E3A]"></span>
							</span>
						</span>
						<span> TailwindCss v4 </span>
					</li>
					<li
						class="relative flex items-center gap-4 py-2 before:absolute before:top-0 before:bottom-1/2 before:left-[0.4rem] before:border-l before:border-[#e3e3e0] dark:before:border-[#3E3E3A]"
					>
						<span class="relative bg-white py-1 dark:bg-[#161615]">
							<span
								class="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-[#e3e3e0] bg-[#FDFDFC] shadow-[0px_0px_1px_0px_rgba(0,0,0,0.03),0px_1px_2px_0px_rgba(0,0,0,0.06)] dark:border-[#3E3E3A] dark:bg-[#161615]"
							>
								<span class="h-1.5 w-1.5 rounded-full bg-[#dbdbd7] dark:bg-[#3E3E3A]"></span>
							</span>
						</span>
						<span> Postgres With Drizzle ORM </span>
					</li>
					<li
						class="relative flex items-center gap-4 py-2 before:absolute before:top-0 before:bottom-1/2 before:left-[0.4rem] before:border-l before:border-[#e3e3e0] dark:before:border-[#3E3E3A]"
					>
						<span class="relative bg-white py-1 dark:bg-[#161615]">
							<span
								class="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-[#e3e3e0] bg-[#FDFDFC] shadow-[0px_0px_1px_0px_rgba(0,0,0,0.03),0px_1px_2px_0px_rgba(0,0,0,0.06)] dark:border-[#3E3E3A] dark:bg-[#161615]"
							>
								<span class="h-1.5 w-1.5 rounded-full bg-[#dbdbd7] dark:bg-[#3E3E3A]"></span>
							</span>
						</span>
						<span> Cache and session management with Redis </span>
					</li>
				</ul>
			</div>
			<div
				class="relative -mb-px aspect-[335/376] w-full shrink-0 overflow-hidden rounded-t-lg bg-[#fff2f2] lg:mb-0 lg:-ml-px lg:aspect-auto lg:w-[438px] lg:rounded-t-none lg:rounded-r-lg dark:bg-[#1D0002]"
			>
				<img src="/placeholder.svg" alt="" class="object-fit h-full w-full" />
			</div>
		</main>
	</div>
</div>
