<script>
	import '@fortawesome/fontawesome-free/css/all.min.css';
	import '../app.postcss';

	import { AppBar, LightSwitch } from '@skeletonlabs/skeleton';
</script>

<header class="container mx-auto">
	<AppBar gridColumns="grid-cols-3" slotDefault="place-self-center" slotTrail="place-content-end">
		<svelte:fragment slot="lead">
			<i class="fa-solid fa-bug fa-xl" />
		</svelte:fragment>

		<svelte:fragment slot="trail">
			<i class="fa-solid fa-user-tie fa-xl" />
			<LightSwitch />
		</svelte:fragment>
	</AppBar>
</header>

<main class="container mx-auto py-8">
	<slot />
</main>
