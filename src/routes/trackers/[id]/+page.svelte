<script lang="ts">
  import NewBugForm from '$lib/components/NewBugForm.svelte';
  import {
    Avatar,
    getModalStore,
    type ModalComponent,
    type ModalSettings
  } from '@skeletonlabs/skeleton';
  import type { ActionData, PageData } from './$types';
  import type { BugResponseFull } from '$lib/interfaces/dto';

  export let data: PageData;
  export let form: ActionData;

  const modalStore = getModalStore();

  const openCreateForm = () => {
    const newBugModal: ModalComponent = {
      ref: NewBugForm,
      props: { id: data.tracker._id, users: data.users }
    };

    const modal: ModalSettings = {
      type: 'component',
      component: newBugModal,
      meta: { form }
    };

    modalStore.trigger(modal);
  };

  const openDetails = (bugId: string) => {};

  const updateModalStore = (formData: ActionData) => {
    if ($modalStore[0]) {
      $modalStore[0].meta.form = formData;
    }
  };

  $: updateModalStore(form);

  $: {
    if (form?.success) {
      modalStore.close();
    }
  }
</script>

<section class="space-y-4">
  <header class="flex flex-row justify-between">
    <p>Bugs</p>
    <button class="btn variant-soft-warning rounded-md gap-2" on:click={openCreateForm}>
      <i class="fa-solid fa-bug" />
      Create Bug
    </button>
  </header>

  <ul>
    {#each data.bugs as bug (bug._id)}
      <li>
        <!-- TODO: Add a keyboard event -->
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div
          class="card flex flex-row items-center px-4 py-2 justify-between rounded-sm border-l-4 border-surface-500"
          on:click={() => openDetails(bug._id)}
          role="button"
          tabindex="0"
        >
          <div>
            <h5 class="h5">{bug.title}</h5>
          </div>
          <div class="flex flex-row space-x-6 items-center">
            <div class="flex flex-row space-x-2 items-center">
              <p>Asignee:</p>
              <Avatar
                src={bug.assignee.image ?? ''}
                width="w-6"
                rounded="rounded-full hover:rounded-md"
              />
            </div>
            <div class="flex flex-row space-x-2 items-center">
              <p>Reviewer:</p>
              <Avatar
                src={bug.reviewer.image ?? ''}
                width="w-6"
                rounded="rounded-full hover:rounded-md"
              />
            </div>
          </div>
        </div>
      </li>
    {/each}
  </ul>
</section>
