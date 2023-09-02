<script lang="ts">
	import { page } from '$app/stores';
	import { signIn, signOut } from '@auth/sveltekit/client';
	import { modeCurrent } from '@skeletonlabs/skeleton';

	import githubLogo from '$lib/assets/github-mark.png';
</script>

{#if $page.data.session}
	<section class="flex flex-col gap-4 items-center justify-center">
		{#if $page.data.session.user?.image}
			<img src={$page.data.session.user.image} class="w-24 h-24 rounded-lg" alt="User Avatar" />
		{/if}
		<div class="flex flex-col gap-1 items-center">
			<h4 class="h4">Signed in as</h4>
			<h3 class="h3 font-semibold">{$page.data.session.user?.name ?? 'Unknown'}</h3>
		</div>
		<button class="btn variant-soft-primary" on:click={() => signOut()}>Sign out</button>
	</section>
{:else}
	<section class="flex flex-col gap-4 items-center justify-center">
		<img src={githubLogo} class="w-24 h-24" class:invert={!$modeCurrent} alt="Github Logo" />
		<h3 class="h3">You are not signed in</h3>
		<button class="btn variant-soft-secondary" on:click={() => signIn('github')}>
			Sign in with GitHub
		</button>
	</section>
{/if}
