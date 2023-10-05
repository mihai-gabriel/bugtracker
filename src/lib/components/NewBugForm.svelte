<script lang="ts">
  import { enhance } from "$app/forms";
  import type { TrackerResponse, UserResponse } from "$lib/interfaces/dto";
  import { Priority, Status } from "$lib/interfaces/shared";
  import {
    Autocomplete,
    type AutocompleteOption,
    Avatar,
    type CssClasses,
    getModalStore,
    popup,
    type PopupSettings,
    RadioGroup,
    RadioItem
  } from "@skeletonlabs/skeleton";
  import { formatPriorityText, formatStatusText } from "$lib/utils/formatText";

  export let parent: Record<CssClasses, CssClasses>;
  export let trackerId: TrackerResponse["_id"]; // the tracker we create the bug for
  export let users: UserResponse[];

  const modalStore = getModalStore();

  const usersSelectOptions: AutocompleteOption[] = users.map(user => ({
    label: user.name ?? "",
    value: user._id ?? "",
    meta: { avatar: user.image ?? "" }
  }));

  /* Assignee Configuration */
  let assignee: string;
  let assigneeInput: string;
  let assigneeInputImage: string;

  let assigneePopup: PopupSettings = {
    event: "focus-click",
    target: "assignee-popup",
    placement: "bottom"
  };

  const onAssigneeSelection = (event: CustomEvent<AutocompleteOption>): void => {
    assigneeInput = event.detail.label;
    assignee = String(event.detail.value);
    assigneeInputImage = String(event.detail.meta?.avatar);
  };

  const unassignAsignee = () => {
    assigneeInput = "";
    assignee = "unassigned";
    assigneeInputImage = "";
  };

  /* Reviewer Configuration */
  let reviewer: string;
  let reviewerInput: string;
  let reviewerInputImage: string;

  let reviewerPopup: PopupSettings = {
    event: "focus-click",
    target: "reviewer-popup",
    placement: "bottom"
  };

  const onReviewerSelection = (event: CustomEvent<AutocompleteOption>): void => {
    reviewerInput = event.detail.label;
    reviewer = String(event.detail.value);
    reviewerInputImage = String(event.detail.meta?.avatar);
  };

  const unassignReviewer = () => {
    reviewerInput = "";
    reviewer = "unassigned";
    reviewerInputImage = "";
  };

  /* Priority Configuration */
  let priorityInput: Priority = $modalStore[0].meta.form?.data?.priority ?? Priority.MINIMAL;

  const priorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.MINIMAL:
        return "variant-filled-surface";
      case Priority.LOW:
        return "variant-filled-tertiary";
      case Priority.MODERATE:
        return "variant-filled-secondary";
      case Priority.HIGH:
        return "variant-filled-warning";
      case Priority.CRITICAL:
        return "variant-filled-error";
    }
  };

  /* Status Configuration */
  let statusInput: Status = $modalStore[0].meta.form?.data?.status ?? Status.NOT_STARTED;

  /* Styling */
  $: parentClasses = `${parent.position} ${parent.background} ${parent.width} \
    ${parent.height} ${parent.spacing} ${parent.rounded} ${parent.shadow}`;
</script>

{#if $modalStore[0]}
  <section class="{parentClasses} p-10">
    {#if $modalStore[0]}
      <p class="text-right"><kbd class="kbd">Esc</kbd> or click away to close modal</p>
      <header class={parent.regionHeader}>
        <h3 class="h3">New Bug</h3>
      </header>

      <form class="space-y-4" action="/trackers/{trackerId}?/createBug" method="POST" use:enhance>
        <fieldset class="space-y-2">
          <label for="title">Title:</label>
          <input
            id="title"
            name="title"
            class="input rounded-md"
            value={$modalStore[0].meta.form?.data?.title ?? ""}
          />
          {#if $modalStore[0].meta.form?.errors?.title}
            <p class="text-error-500">{$modalStore[0].meta.form?.errors?.title}</p>
          {/if}
        </fieldset>
        <fieldset class="space-y-2">
          <label for="description">Description:</label>
          <textarea id="description" name="description" class="textarea rounded-md"
            >{$modalStore[0].meta.form?.data?.description ?? ""}</textarea
          >
          {#if $modalStore[0].meta.form?.errors?.description}
            <p class="text-error-500">{$modalStore[0].meta.form?.errors?.description}</p>
          {/if}
        </fieldset>

        <hr class="!border-t-1" />

        <fieldset class="space-y-2 relative">
          <label for="assignee">Assignee:</label>
          <div
            class="card w-full max-h-48 p-4 overflow-y-auto drop-shadow-md z-10"
            tabindex="-1"
            data-popup="assignee-popup"
          >
            <Autocomplete
              bind:input={assigneeInput}
              options={usersSelectOptions}
              on:selection={onAssigneeSelection}
            />
          </div>
          <div
            class="input-group input-group-divider grid-cols-[auto_1fr]"
            use:popup={assigneePopup}
          >
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
              autocomplete="off"
            />
          </div>
          {#if assignee !== "unassigned" && assignee !== undefined}
            <button class="anchor" on:click|preventDefault={unassignAsignee}>Unassign</button>
          {/if}

          <input type="hidden" name="assignee" bind:value={assignee} />
          {#if $modalStore[0].meta.form?.errors?.assignee}
            <p class="text-error-500">{$modalStore[0].meta.form?.errors?.assignee}</p>
          {/if}
        </fieldset>

        <fieldset class="space-y-2 relative">
          <label for="reviewer">Reviewer:</label>
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
          <div
            class="input-group input-group-divider grid-cols-[auto_1fr]"
            use:popup={reviewerPopup}
          >
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
              autocomplete="off"
            />
          </div>
          {#if reviewer !== "unassigned" && reviewer !== undefined}
            <button class="anchor" on:click|preventDefault={unassignReviewer}>Unassign</button>
          {/if}

          <input type="hidden" name="reviewer" bind:value={reviewer} />
          {#if $modalStore[0].meta.form?.errors?.reviewer}
            <p class="text-error-500">{$modalStore[0].meta.form?.errors?.reviewer}</p>
          {/if}
        </fieldset>

        <hr class="!border-t-1" />

        <fieldset class="space-y-2">
          <p>Priority:</p>
          <RadioGroup>
            {#each Object.values(Priority) as priority}
              <RadioItem
                bind:group={priorityInput}
                name="priority"
                value={priority}
                color={priorityColor(priority)}
              >
                {formatPriorityText(priority)}
              </RadioItem>
            {/each}
          </RadioGroup>
        </fieldset>
        <fieldset class="space-y-2">
          <p>Status:</p>
          <RadioGroup active="variant-filled-primary" hover="hover:variant-soft-primary">
            {#each Object.values(Status) as status}
              <RadioItem bind:group={statusInput} name="status" value={status}>
                {formatStatusText(status)}
              </RadioItem>
            {/each}
          </RadioGroup>
        </fieldset>

        <input type="hidden" name="archived" value={false} />

        <hr class="!border-t-1" />

        <div class="flex flex-row gap-3">
          <button type="submit" class="btn text-white rounded-md variant-filled-primary">
            {parent.buttonTextSubmit}
          </button>
        </div>
      </form>

      <footer class={parent.regionFooter}>
        {#if $modalStore[0].meta.form?.errors?.serverError}
          <p class="text-error-500">{$modalStore[0].meta.form?.errors?.serverError}</p>
        {/if}
      </footer>
    {/if}

    <slot />
  </section>
{/if}
