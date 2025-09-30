<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { page } from '$app/state';
	import { HelpCircle, House, Info } from '@lucide/svelte';
</script>

<div
	class="relative min-h-screen overflow-hidden bg-gradient-to-br from-destructive/5 via-background to-primary/5"
>
	<div class="bg-grid-pattern absolute inset-0 opacity-5"></div>
	<div
		class="absolute top-20 right-20 h-72 w-72 rounded-full bg-gradient-to-br from-destructive/10 to-primary/10 blur-3xl"
	></div>
	<div
		class="absolute bottom-20 left-20 h-96 w-96 rounded-full bg-gradient-to-tr from-primary/10 to-secondary/10 blur-3xl"
	></div>

	<div class="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-16">
		<div class="mx-auto mb-12 max-w-2xl text-center">
			<div class="mb-6">
				<h1
					class="mb-4 bg-gradient-to-r from-destructive via-destructive/80 to-primary bg-clip-text text-6xl font-bold tracking-tight text-transparent"
				>
					Oops!
				</h1>
				<h2 class="mb-2 text-2xl font-semibold text-foreground/90">
					{page.error?.message || 'Something went wrong'}
				</h2>
				<p class="mx-auto max-w-lg text-lg leading-relaxed text-muted-foreground/80">
					We encountered an unexpected error. Don't worry, our team has been notified and we're
					working on a fix.
				</p>
			</div>

			<div
				class="mb-8 rounded-xl border border-border/50 bg-gradient-to-r from-muted/30 to-muted/20 p-6 shadow-lg backdrop-blur-sm"
			>
				<div class="mb-4 flex items-center justify-center gap-3">
					<Info class="h-5 w-5 text-primary" />
					<span class="text-sm font-medium text-foreground/80">Error Details</span>
				</div>
				<div class="grid grid-cols-2 gap-4 text-sm">
					<div class="text-left">
						<span class="text-muted-foreground">Status:</span>
						<span class="ml-2 font-mono font-semibold text-destructive">{page.status}</span>
					</div>
					<div class="text-left"></div>
					<div class="text-left">
						<span class="text-muted-foreground">Time:</span>
						<span class="ml-2 font-mono font-semibold text-foreground/70"
							>{new Date().toLocaleTimeString()}</span
						>
					</div>
				</div>
			</div>
		</div>

		<div class="mx-auto flex w-full max-w-md flex-col gap-4 sm:flex-row">
			<Button
				href="/"
				class="flex-1 bg-gradient-to-r from-primary to-primary/90 shadow-lg transition-all duration-300 hover:from-primary/90 hover:to-primary hover:shadow-xl"
			>
				<House class="mr-2 h-5 w-5" />
				Go Home
			</Button>
		</div>

		<div class="mt-8">
			<Button
				variant="ghost"
				class="text-accent-foreground/70 transition-all duration-300 hover:bg-accent/10 hover:text-accent-foreground"
			>
				<HelpCircle class="mr-2 h-4 w-4" />
				Contact Support
			</Button>
		</div>

		<div class="absolute bottom-6 left-1/2 -translate-x-1/2 transform">
			<p class="text-xs text-muted-foreground/60">
				If this problem persists, please contact our support team
			</p>
		</div>
	</div>
</div>
