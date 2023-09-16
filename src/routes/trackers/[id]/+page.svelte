<script lang="ts">
  import BugDetail from '$lib/components/BugDetail.svelte';
  import NewBugForm from '$lib/components/NewBugForm.svelte';
  import type { BugResponseFull } from '$lib/interfaces/dto';
  import { Priority, Status } from '$lib/interfaces/shared';
  import {
    Avatar,
    getModalStore,
    ListBox,
    ListBoxItem,
    type ModalComponent,
    type ModalSettings
  } from '@skeletonlabs/skeleton';
  import { quadInOut } from 'svelte/easing';
  import { fly } from 'svelte/transition';
  import type { ActionData, PageData } from './$types';
  import { receive, send } from './utils/transition';
  import { flip } from 'svelte/animate';
  import { page } from '$app/stores';

  export let data: PageData;
  export let form: ActionData;

  const modalStore = getModalStore();

  const openCreateForm = () => {
    const newBugModal: ModalComponent = {
      ref: NewBugForm,
      props: { trackerId: data.tracker._id, users: data.users }
    };

    const modal: ModalSettings = {
      type: 'component',
      component: newBugModal,
      meta: { form }
    };

    modalStore.trigger(modal);
  };

  const openDetails = (bug: BugResponseFull) => {
    const bugDetailModal: ModalComponent = {
      ref: BugDetail,
      props: { bug, trackerId: data.tracker._id, users: data.users }
    };

    const modal: ModalSettings = {
      type: 'component',
      component: bugDetailModal,
      meta: { form }
    };

    modalStore.trigger(modal);
  };

  const updateModalStore = (formData: ActionData) => {
    if ($modalStore[0]) {
      $modalStore[0].meta.form = formData;
    }
  };

  const resetFormWhenModalChanges = (modal: ModalSettings) => {
    if (modal) {
      form = {
        data: {},
        errors: {},
        success: undefined
      };
    }
  };

  // Close the store if form actions data returns `success` as a property.
  $: {
    if (form?.success) {
      modalStore.close();
    }
  }

  // Update the modal store whenever the form actions data changes to display info like errors etc.
  $: updateModalStore(form);

  // Reset Form When Modal Changes
  $: resetFormWhenModalChanges($modalStore[0]);

  // Filter bugs based on what the user selected
  let statusInput: Status[] = [];

  $: bugsByStatus = (status: Status) => {
    return data.bugs
      .filter(bug => bug.status === status)
      .sort(
        (a, b) =>
          Object.values(Priority).indexOf(b.priority) - Object.values(Priority).indexOf(a.priority)
      );
  };

  let statusColumns: Status[];

  $: {
    if (statusInput.length) {
      statusColumns = [...statusInput].sort(
        (a, b) => Object.values(Status).indexOf(a) - Object.values(Status).indexOf(b)
      );
    } else {
      statusColumns = Object.values(Status);
    }
  }

  // Note: It does not render properly if you compute it like this: `grid-cols-${statusInput.length || 3}`
  $: gridColumns = () => {
    switch (statusInput.length) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-2';
      case 0:
      case 3:
      default:
        return 'grid-cols-3';
    }
  };
</script>

<section class="space-y-4">
  <header class="flex flex-row justify-between">
    <h3 class="h3">{data.tracker.name}</h3>
    <div class="flex flex-row gap-4 items-center">
      {#if statusInput.length !== 0}
        <button
          class="btn variant-soft-tertiary text-sm px-4 py-2"
          on:click={() => (statusInput = [])}
        >
          <i class="fa-solid fa-circle-xmark" />
          <p class="text-md">Clear</p>
        </button>
      {/if}
      <ListBox multiple class="flex flex-row gap-2 [&>label]:!m-0">
        {#each Object.values(Status) as status}
          <ListBoxItem bind:group={statusInput} name="status" value={status}>
            <i
              class="fa-solid"
              class:fa-calendar-days={status === Status.NOT_STARTED}
              class:fa-hourglass-half={status === Status.IN_PROGRESS}
              class:fa-circle-check={status === Status.COMPLETED}
            />
          </ListBoxItem>
        {/each}
      </ListBox>
      <span class="divider-vertical h-5" />
      <button class="btn variant-soft-warning rounded-md gap-2" on:click={openCreateForm}>
        <i class="fa-solid fa-bug" />
        Create Bug
      </button>
    </div>
  </header>

  <main class="grid duration-150 ease-out {gridColumns()} gap-6">
    {#each statusColumns as status (Object.values(Status).indexOf(status))}
      <div in:fly={{ duration: 300, easing: quadInOut }} class="flex flex-col space-y-4">
        <h5 class="h5">
          {status.charAt(0).toUpperCase()}{status.split('_').join(' ').slice(1).toLowerCase()}
        </h5>
        <ul class="flex flex-col space-y-3">
          {#each bugsByStatus(status) as bug (bug._id)}
            <li
              in:receive={{ key: bug._id }}
              out:send={{ key: bug._id }}
              animate:flip={{ duration: 200 }}
              draggable={true}
            >
              <!-- TODO: Add a keyboard event -->
              <!-- svelte-ignore a11y-click-events-have-key-events -->
              <div
                class="card card-hover flex flex-row items-center px-4 py-2 justify-between rounded-sm border-l-4"
                class:border-surface-400={bug.priority === Priority.MINIMAL}
                class:border-tertiary-400={bug.priority === Priority.LOW}
                class:border-secondary-400={bug.priority === Priority.MODERATE}
                class:border-warning-400={bug.priority === Priority.HIGH}
                class:border-error-400={bug.priority === Priority.CRITICAL}
                on:click={() => openDetails(bug)}
                role="button"
                tabindex="0"
              >
                <div>
                  <h6 class="h6">{bug.title}</h6>
                </div>
                <div class="flex flex-row space-x-6 items-center">
                  <div class="flex flex-row space-x-2 items-center">
                    <Avatar
                      src={bug.assignee.image ?? ''}
                      width="w-8"
                      rounded="rounded-full"
                      border="border-2 border-cyan-700"
                    />
                  </div>
                  <div class="flex flex-row space-x-2 items-center">
                    <Avatar
                      src={bug.reviewer.image ?? ''}
                      width="w-8"
                      rounded="rounded-full"
                      border="border-2 border-purple-700"
                    />
                  </div>
                </div>
              </div>
            </li>
          {/each}
        </ul>
      </div>
    {/each}
  </main>
</section>
