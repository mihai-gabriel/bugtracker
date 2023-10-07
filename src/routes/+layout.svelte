<script lang="ts">
  import "@fortawesome/fontawesome-free/css/all.min.css";
  import "../app.postcss";
  import { arrow, autoUpdate, computePosition, flip, offset, shift } from "@floating-ui/dom";
  import {
    AppBar,
    Avatar,
    initializeStores,
    LightSwitch,
    Modal,
    storePopup,
    Toast
  } from "@skeletonlabs/skeleton";
  import { page } from "$app/stores";
  import { generateBreadcrumbs } from "$lib/utils/breadcrumbs";
  import Drawer from "$lib/components/Drawer.svelte";

  // stores enable global components like toasts
  initializeStores();

  // enables pop-up functionality
  storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

  // Generate breadcrumbs for current page
  $: breadcrumbs = $page.route.id ? generateBreadcrumbs($page.route.id, $page.params) : [];

  const excludedRoutes = ["/", "/auth"];

  let menuActive = true;

  $: gridClass =
    !excludedRoutes.includes($page.route.id ?? "") && menuActive
      ? "grid grid-cols-[180px_1fr]"
      : "";
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
      <div class="flex flex-row items-center gap-4">
        {#if !excludedRoutes.includes($page.route.id ?? "")}
          <button class="btn variant-soft" on:click={() => (menuActive = !menuActive)}>
            <i class="fa-solid fa-bars" />
          </button>
        {/if}
        <a href="/" class="flex flex-row items-center gap-2" data-sveltekit-preload-data="hover">
          <i class="fa-solid fa-bug leading-none" />
          <h6 class="h6">Bug Tracker</h6>
        </a>
      </div>
    </svelte:fragment>

    <svelte:fragment slot="trail">
      {#if $page.data.session}
        <a
          class="transition-all ease-out duration-200 hover:scale-105 flex flex-row items-center gap-2"
          href="/auth"
        >
          <Avatar class="w-8 h-8" src={$page.data.session.user?.image ?? ""} />
          <p>{$page.data.session.user?.name ?? ""}</p>
        </a>
      {:else}
        <a
          href="/auth"
          class="btn"
          class:variant-ghost-tertiary={$page.data.session}
          class:variant-ghost-surface={$page.data.session === null}
        >
          <i class="fa-brands fa-github-alt fa-md leading-none" />
        </a>
      {/if}

      <LightSwitch />
    </svelte:fragment>
  </AppBar>
</header>

<main class={gridClass}>
  {#if !excludedRoutes.includes($page.route.id ?? "") && menuActive}
    <div class="relative flex flex-col gap-2 p-6">
      <a
        class="card variant-soft rounded-md w-full py-2 px-4 flex flex-row items-center gap-2"
        class:!variant-soft-primary={$page.url.pathname === "/"}
        href="/"
      >
        <i class="fa-solid fa-house" /> Home
      </a>
      <a
        class="card variant-soft rounded-md w-full py-2 px-4 flex flex-row items-center gap-2"
        class:!variant-soft-primary={$page.url.pathname === "/trackers"}
        href="/trackers"
      >
        <i class="fa-solid fa-cash-register" />
        Trackers
      </a>
      <a
        class="card variant-soft rounded-md w-full py-2 px-4 flex flex-row items-center gap-2"
        class:!variant-soft-primary={$page.url.pathname === "/bugs"}
        href="/bugs"
      >
        <i class="fa-solid fa-spider" />
        Bugs
      </a>
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div
        class="absolute px-2 right-0 h-[80vh] group hover:cursor-col-resize"
        on:click={() => (menuActive = false)}
        role="button"
        tabindex="0"
      >
        <span
          class="divider-vertical opacity-40 h-[100%] group-hover:opacity-100 group-hover:border-2"
        />
      </div>
    </div>
  {/if}
  <div
    class="container mx-auto flex-col space-y-8 px-4 py-4 my-4 overflow-y-auto h-[calc(100vh-100px)]"
  >
    <ol class="breadcrumb">
      {#if !excludedRoutes.includes($page.route.id ?? "")}
        {#each breadcrumbs as breadcrumb, index (index)}
          {#if index === breadcrumbs.length - 1}
            <li class="crumb">{breadcrumb.name}</li>
          {:else}
            <li class="crumb">
              <a class="btn btn-sm variant-soft-primary rounded-xl" href={breadcrumb.path}
                >{breadcrumb.name}</a
              >
            </li>
            <li class="crumb-separator" aria-hidden="true">&rsaquo;</li>
          {/if}
        {/each}
      {/if}
    </ol>
    <slot />
  </div>
</main>
