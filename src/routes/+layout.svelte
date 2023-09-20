<script lang="ts">
  import '@fortawesome/fontawesome-free/css/all.min.css';
  import '../app.postcss';

  import Drawer from '$lib/components/Drawer.svelte';
  import { arrow, autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';
  import {
    AppBar,
    initializeStores,
    LightSwitch,
    Modal,
    storePopup,
    Toast
  } from '@skeletonlabs/skeleton';
  import { page } from '$app/stores';
  import { generateBreadcrumbs } from '$lib/utils/breadcrumbs';

  // stores enable global components like toasts
  initializeStores();

  // enables pop-up functionality
  storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

  // Generate breadcrumbs for current page
  $: breadcrumbs = $page.route.id ? generateBreadcrumbs($page.route.id, $page.params) : [];
</script>

<Toast />
<Modal />
<!-- Drawer is a custom component on top of skeleton drawer -->
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

<main class="container mx-auto flex-col space-y-8 px-4 py-8">
  <ol class="breadcrumb">
    {#each breadcrumbs as breadcrumb, index (index)}
      {#if index === breadcrumbs.length - 1}
        <li class="crumb">{breadcrumb.name}</li>
      {:else}
        <li class="crumb">
          <a class="btn btn-sm variant-soft-primary" href={breadcrumb.path}>{breadcrumb.name}</a>
        </li>
        <li class="crumb-separator" aria-hidden="true">&rsaquo;</li>
      {/if}
    {/each}
  </ol>
  <slot />
</main>
