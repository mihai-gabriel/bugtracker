<script lang="ts">
  import '@fortawesome/fontawesome-free/css/all.min.css';
  import '../app.postcss';

  import Drawer from '$lib/shared_components/Drawer.svelte';
  import { AppBar, LightSwitch, Toast, initializeStores } from '@skeletonlabs/skeleton';
  import { page } from '$app/stores';

  initializeStores(); // stores enable global components like toasts
</script>

<Toast />
<Drawer />

<header>
  <AppBar
    class="px-10"
    gridColumns="grid-cols-3"
    slotDefault="place-self-center"
    slotTrail="place-content-end"
  >
    <svelte:fragment slot="lead">
      <a href="/" class="flex flex-row items-center gap-2" data-sveltekit-preload-data="hover">
        <i class="fa-solid fa-bug leading-none" />
        <h6 class="h6">Bug Tracker</h6>
      </a>
    </svelte:fragment>

    <svelte:fragment slot="trail">
      <a
        href="/auth"
        class="btn"
        class:variant-ghost-tertiary={$page.data.session}
        class:variant-ghost-surface={$page.data.session === null}
        data-sveltekit-preload-data="hover"
      >
        <i class="fa-brands fa-github-alt fa-lg leading-none" />
      </a>
      <LightSwitch />
    </svelte:fragment>
  </AppBar>
</header>

<main class="container mx-auto px-4 py-8">
  <slot />
</main>
