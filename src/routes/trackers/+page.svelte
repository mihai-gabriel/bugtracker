<script lang="ts">
  import { goto } from "$app/navigation";
  import { Status } from "$lib/interfaces/shared";
  import {
    type DrawerSettings,
    getDrawerStore,
    getToastStore,
    type ToastSettings
  } from "@skeletonlabs/skeleton";
  import type { ActionData, PageData } from "./$types";
  import { onMount } from "svelte";
  import { page } from "$app/stores";

  export let data: PageData;
  export let form: ActionData;

  const drawerStore = getDrawerStore();
  const toastStore = getToastStore();

  $: bugCreationMode = $page.url.searchParams.get("action") === "create-bug";

  let searchInput = "";

  $: trackers = data.trackers.filter(tracker =>
    tracker.name.toLowerCase().includes(searchInput.toLowerCase())
  );

  const openDrawer = () => {
    const drawerSettings: DrawerSettings = {
      id: "create-tracker",
      meta: { form },
      // styling
      position: "right",
      width: "w-[280px] md:w-[480px]",
      rounded: "rounded-xl",
      blur: "backdrop-blur-sm"
    };

    drawerStore.open(drawerSettings);
  };

  $: {
    if (form?.success) {
      const trackerId = form?._id;

      if (trackerId) {
        const t: ToastSettings = {
          message: "Tracker created.",
          action: {
            label: "Open",
            response: () => goto(`/trackers/${trackerId}`)
          }
        };

        toastStore.trigger(t);
        drawerStore.close();
      }
    }
  }

  // Update the drawer state whenever the form data changes
  $: drawerStore.update(settings => ({ ...settings, meta: { form } }));

  const dismissCreationAction = () => {
    bugCreationMode = false;
    goto("?");
  };

  onMount(() => {
    switch ($page.url.searchParams.get("action")) {
      case "create-tracker":
        openDrawer();
        break;

      default:
        break;
    }
  });
</script>

<section class="flex flex-col gap-5">
  <header class="flex flex-row justify-between">
    <div class="flex items-center gap-4 animate-pulse">
      {#if bugCreationMode}
        {#if trackers.length === 0}
          <p>Create or join a Tracker and then select it to issue a Bug for it.</p>
        {:else}
          <p>Please select a Tracker to issue a Bug for.</p>
        {/if}
        <button class="flex flex-row gap-2 items-center" on:click={dismissCreationAction}>
          <i class="fa-solid fa-circle-xmark" />
          Dismiss
        </button>
      {/if}
    </div>
    <div class="flex flex-row gap-4">
      <input
        type="text"
        class="input rounded-md variant-ghost"
        placeholder="Search..."
        bind:value={searchInput}
      />
      <button class="btn variant-soft-primary rounded-md gap-2" on:click={openDrawer}>
        <i class="fa-solid fa-plus" />
        Create Tracker
      </button>
    </div>
  </header>

  <div class="flex-row gap-4 space-y-4">
    {#each trackers as tracker (tracker._id)}
      <div class="card px-8 py-4 flex justify-between items-center">
        <a
          href="/trackers/{tracker._id}{bugCreationMode ? '?action=create-bug' : ''}"
          class="cursor-pointer flex-grow py-2"
        >
          <h4 class="h4">{tracker.name}</h4>
        </a>
        <div class="flex flex-row gap-4">
          <ul class="flex flex-row gap-2">
            {#each Object.values(Status) as status}
              <li class="flex w-10 items-center gap-2">
                <i
                  class="fa-solid"
                  class:fa-calendar-days={status === Status.NOT_STARTED}
                  class:fa-hourglass-half={status === Status.IN_PROGRESS}
                  class:fa-circle-check={status === Status.COMPLETED}
                />
                <p>{tracker.bugs.filter(bug => bug.status === status).length}</p>
              </li>
            {/each}
          </ul>
          {#if $page.data.session?.user.id === tracker.author}
            <a
              class="btn rounded-md variant-ghost-tertiary flex flex-row gap-2 items-center"
              href="/trackers/{tracker._id}/users"
            >
              <i class="fa-solid fa-people-group" /> Manage Team
            </a>
          {/if}
        </div>
      </div>
    {:else}
      <div class="flex flex-col items-center justify-center gap-6 mt-6">
        <i class="fa-solid fa-ghost fa-4x" />
        <h4 class="h4">No Trackers Found!</h4>
      </div>
    {/each}
  </div>
</section>
