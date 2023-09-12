<script lang="ts">
  import { enhance } from '$app/forms';
  import type { TrackerResponse, UserResponse } from '$lib/interfaces/dto';
  import { Priority, Status } from '$lib/interfaces/shared';
  import {
    getModalStore,
    type CssClasses,
    Autocomplete,
    type AutocompleteOption,
    popup,
    type PopupSettings,
    Avatar
  } from '@skeletonlabs/skeleton';

  export let parent: Record<CssClasses, CssClasses>;
  export let id: TrackerResponse['_id']; // the tracker we create the bug for
  export let users: UserResponse[];

  const usersSelectOptions: AutocompleteOption[] = users.map(user => ({
    label: user.name ?? '',
    value: user._id ?? '',
    meta: { avatar: user.image ?? '' }
  }));

  /* Asignee Configuration */
  let assignee: string;
  let assigneeInput: string;
  let assigneeInputImage: string;

  let asigneePopup: PopupSettings = {
    event: 'focus-click',
    target: 'asignee-popup',
    placement: 'bottom'
  };

  const onAssigneeSelection = (event: CustomEvent<AutocompleteOption>): void => {
    assigneeInput = event.detail.label;
    assignee = String(event.detail.value);
    assigneeInputImage = String(event.detail.meta?.avatar);
  };

  /* Reviewer Configuration */
  let reviewer: string;
  let reviewerInput: string;
  let reviewerInputImage: string;

  let reviewerPopup: PopupSettings = {
    event: 'focus-click',
    target: 'reviewer-popup',
    placement: 'bottom'
  };

  const onReviewerSelection = (event: CustomEvent<AutocompleteOption>): void => {
    reviewerInput = event.detail.label;
    reviewer = String(event.detail.value);
    reviewerInputImage = String(event.detail.meta?.avatar);
  };

  const modalStore = getModalStore();

  $: parentClasses = `${parent.position} ${parent.background} ${parent.width} \
    ${parent.height} ${parent.spacing} ${parent.rounded} ${parent.shadow}`;
</script>

<section class="{parentClasses} p-10">
  {#if $modalStore[0]}
    <header class={parent.regionHeader}>
      <h3 class="h3">New Bug</h3>
    </header>

    <form class="space-y-4" action="/trackers/{id}" method="POST" use:enhance>
      <fieldset class="space-y-2">
        <label for="title">Title:</label>
        <input
          id="title"
          name="title"
          class="input rounded-md"
          value={$modalStore[0].meta.form?.data?.title ?? ''}
        />
        {#if $modalStore[0].meta.form?.errors?.title}
          <p class="text-error-500">{$modalStore[0].meta.form?.errors?.title}</p>
        {/if}
      </fieldset>
      <fieldset class="space-y-2">
        <label for="description">Description:</label>
        <textarea
          id="description"
          name="description"
          class="textarea rounded-md"
          value={$modalStore[0].meta.form?.data?.description ?? ''}
        />
        {#if $modalStore[0].meta.form?.errors?.description}
          <p class="text-error-500">{$modalStore[0].meta.form?.errors?.description}</p>
        {/if}
      </fieldset>

      <hr class="!border-t-1" />

      <fieldset class="space-y-2 relative">
        <label for="assignee">Assignee:</label>
        <div class="input-group input-group-divider grid-cols-[auto_1fr]" use:popup={asigneePopup}>
          <div class="input-group-shim">
            {#if assigneeInputImage}
              <Avatar src={assigneeInputImage} width="w-8" rounded="rounded-full" />
            {:else}
              <i class="fa-solid fa-user-astronaut fa-lg" />
            {/if}
          </div>
          <input
            id="assignee"
            class="autocomplete"
            type="search"
            bind:value={assigneeInput}
            placeholder="Search..."
          />
        </div>
        <div
          class="card w-full max-h-48 p-4 overflow-y-auto drop-shadow-md z-10"
          tabindex="-1"
          data-popup="asignee-popup"
        >
          <Autocomplete
            bind:input={assigneeInput}
            options={usersSelectOptions}
            on:selection={onAssigneeSelection}
          />
        </div>
        <input type="hidden" name="assignee" bind:value={assignee} />
        {#if $modalStore[0].meta.form?.errors?.assignee}
          <p class="text-error-500">{$modalStore[0].meta.form?.errors?.assignee}</p>
        {/if}
      </fieldset>

      <fieldset class="space-y-2 relative">
        <label for="reviewer">Reviewer:</label>
        <div class="input-group input-group-divider grid-cols-[auto_1fr]" use:popup={reviewerPopup}>
          <div class="input-group-shim">
            {#if reviewerInputImage}
              <Avatar src={reviewerInputImage} width="w-8" rounded="rounded-full" />
            {:else}
              <i class="fa-solid fa-user-astronaut fa-lg" />
            {/if}
          </div>
          <input
            id="reviewer"
            class="w-full autocomplete"
            type="search"
            bind:value={reviewerInput}
            placeholder="Search..."
          />
        </div>
        <div
          class="card w-full max-h-48 p-4 overflow-y-auto drop-shadow-md"
          tabindex="-1"
          data-popup="reviewer-popup"
        >
          <Autocomplete
            bind:input={reviewerInput}
            options={usersSelectOptions}
            on:selection={onReviewerSelection}
          />
        </div>
        <input type="hidden" name="reviewer" bind:value={reviewer} />
        {#if $modalStore[0].meta.form?.errors?.reviewer}
          <p class="text-error-500">{$modalStore[0].meta.form?.errors?.reviewer}</p>
        {/if}
      </fieldset>

      <hr class="!border-t-1" />

      <fieldset class="space-y-2">
        <label for="priority">Priority:</label>
        <select
          id="priority"
          name="priority"
          class="select"
          value={$modalStore[0].meta.form?.data?.priority ?? Priority.LOW}
        >
          {#each Object.values(Priority) as priority}
            <option value={priority}
              >{priority.charAt(0).toUpperCase()}{priority.slice(1).toLowerCase()}</option
            >
          {/each}
        </select>
      </fieldset>
      <fieldset class="space-y-2">
        <label for="status">Status:</label>
        <select
          id="status"
          name="status"
          class="select"
          value={$modalStore[0].meta.form?.data?.status ?? Status.NOT_STARTED}
        >
          {#each Object.values(Status) as status}
            <option value={status}
              >{status.charAt(0).toUpperCase()}{status
                .split('_')
                .join(' ')
                .slice(1)
                .toLowerCase()}</option
            >
          {/each}
        </select>
      </fieldset>

      <hr class="!border-t-1" />

      <button type="submit" class="btn text-white rounded-md variant-filled-primary"
        >{parent.buttonTextSubmit}</button
      >
      <button class="btn text-white rounded-md variant-ghost-surface" on:click={modalStore.close}
        >{parent.buttonTextCancel}</button
      >
    </form>

    <footer class={parent.regionFooter}>
      {#if $modalStore[0].meta.form?.errors?.serverError}
        <p class="text-error-500">{$modalStore[0].meta.form?.errors?.serverError}</p>
      {:else}
        <p>Clicking away will reset progress</p>
      {/if}
    </footer>
  {/if}

  <slot />
</section>
