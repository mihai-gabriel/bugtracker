<script lang="ts">
  import type { ActionData, PageData } from "./$types";
  import { Priority, Status } from "$lib/interfaces/shared";
  import { capitalizeWord, formatPriorityText, formatStatusText } from "$lib/utils/formatText";
  import type { BugRequest } from "$lib/interfaces/dto";
  import { loadFormDataFromObject } from "$lib/utils/formDataInit";
  import { goto, invalidate } from "$app/navigation";
  import {
    Autocomplete,
    type AutocompleteOption,
    Avatar,
    getModalStore,
    type ModalSettings,
    RadioGroup,
    RadioItem
  } from "@skeletonlabs/skeleton";
  import { enhance } from "$app/forms";
  import SvelteMarkdown from "svelte-markdown";
  import { onMount } from "svelte";
  import type { SubmitFunction } from "@sveltejs/kit";

  export let data: PageData;
  export let form: ActionData;

  // Avoiding TS errors / mental gymnastics
  let DOMPurify: { sanitize: (text: string, options: object) => string } | undefined = undefined;

  onMount(async () => {
    const module = await import("dompurify");
    DOMPurify = module.default;
  });

  const modalStore = getModalStore();

  let linkText = "Link";
  let linkIcon = "fa-share";

  const copyLink = async () => {
    await navigator.clipboard.writeText(`https://TODO_REPLACE_HOSTNAME/bugs/${data.bug._id}}`);
    linkIcon = "fa-circle-check";
    linkText = "Copied!";

    setTimeout(() => {
      linkText = "Link";
      linkIcon = "fa-share";
    }, 2000);
  };

  const updateBugStatus = async (status: Status): Promise<void> => {
    const { bug } = data;

    const updatedBug: BugRequest = {
      id: bug._id,
      title: bug.title,
      description: bug.description,
      assignee: bug.assignee._id,
      reviewer: bug.reviewer._id,
      priority: bug.priority,
      status: status
    };

    const formData = loadFormDataFromObject(updatedBug);
    await fetch("/api/bugs", { method: "PUT", body: formData });
    await invalidate("bug");

    // Make sure we also update the default value for the status input
    statusInput = status;
  };

  const deleteCurrentBug = async (): Promise<void> => {
    const { bug } = data;

    if (bug.tracker._id) {
      const formData = new FormData();

      formData.append("id", bug._id);
      formData.append("trackerId", bug.tracker._id);

      await fetch(`/api/bugs`, { method: "DELETE", body: formData });
      await goto(`/trackers/${bug.tracker._id}`);
    }
  };

  const confirmDeleteDialog = () => {
    const modal: ModalSettings = {
      type: "confirm",
      title: "Confirm Deletion",
      body: `Are you sure you want to permanently delete '${data.bug.title}'?`,
      response: (r: boolean) => r && deleteCurrentBug()
    };

    modalStore.trigger(modal);
  };

  $: currentStatusGradient = () => {
    switch (data.bug.status) {
      case Status.NOT_STARTED:
        return "from-surface-400/5";
      case Status.IN_PROGRESS:
        return "from-warning-400/5";
      case Status.COMPLETED:
        return "from-primary-400/5";
    }
  };

  $: statusBarColor = () => {
    if (form?.errors) {
      return "bg-error-500/20";
    }

    if (formActive) {
      return "bg-secondary-500/20";
    }

    switch (data.bug.status) {
      case Status.NOT_STARTED:
        return "bg-surface-500/20";
      case Status.IN_PROGRESS:
        return "bg-warning-500/20";
      case Status.COMPLETED:
        return "bg-primary-500/20";
    }
  };

  /* FIELDS EDIT ACTION */
  let editingTitle = false;
  let editingDescription = false;
  let editingAssignee = false;
  let editingReviewer = false;
  let editingStatus = false;
  let editingPriority = false;

  let titleInput = data.bug.title;
  let statusInput = data.bug.status;
  let priorityInput = data.bug.priority;

  /* Description handlers */
  let descriptionElement: HTMLTextAreaElement;
  let descriptionInput = data.bug.description;

  const boldModifier = (text: string) => `**${text}**`;
  const italicModifier = (text: string) => `*${text}*`;
  const heading1Modifier = (text: string) => `# ${text}`;
  const heading2Modifier = (text: string) => `## ${text}`;
  const heading3Modifier = (text: string) => `### ${text}`;
  const heading4Modifier = (text: string) => `#### ${text}`;
  const heading5Modifier = (text: string) => `##### ${text}`;
  const heading6Modifier = (text: string) => `###### ${text}`;
  const codeModifier = (text: string) => `\`${text}\``;

  const replaceSelection = (modifier: (selection: string) => string): void => {
    const selectedText = descriptionElement.value.substring(
      descriptionElement.selectionStart,
      descriptionElement.selectionEnd
    );

    if (selectedText) {
      const beforeSelection = descriptionElement.value.substring(
        0,
        descriptionElement.selectionStart
      );
      const afterSelection = descriptionElement.value.substring(descriptionElement.selectionEnd);

      descriptionInput = `${beforeSelection}${modifier(selectedText)}${afterSelection}`;
    }
  };

  /* Asignee & Reviewer options */
  const usersSelectOptions: AutocompleteOption[] = data.users.map(user => ({
    label: user.name ?? "",
    value: user._id ?? "",
    meta: { avatar: user.image ?? "" }
  }));

  let assignee: string = data.bug.assignee._id;
  let assigneeInput: string = data.bug.assignee.name ?? "";
  let assigneeInputImage: string = data.bug.assignee.image ?? "";

  const onAssigneeSelection = (event: CustomEvent<AutocompleteOption>): void => {
    assigneeInput = event.detail.label;
    assignee = String(event.detail.value);
    assigneeInputImage = String(event.detail.meta?.avatar);
  };

  let reviewer: string = data.bug.reviewer._id;
  let reviewerInput: string = data.bug.reviewer.name ?? "";
  let reviewerInputImage: string = data.bug.reviewer.image ?? "";

  const onReviewerSelection = (event: CustomEvent<AutocompleteOption>): void => {
    reviewerInput = event.detail.label;
    reviewer = String(event.detail.value);
    reviewerInputImage = String(event.detail.meta?.avatar);
  };

  const inactivateForm = () => {
    editingTitle = false;
    editingDescription = false;
    editingAssignee = false;
    editingReviewer = false;
    editingStatus = false;
    editingPriority = false;
  };

  const activateForm = () => {
    editingTitle = true;
    editingDescription = true;
    editingAssignee = true;
    editingReviewer = true;
    editingStatus = true;
    editingPriority = true;
  };

  const revertChanges = (): void => {
    inactivateForm();

    descriptionInput = data.bug.description;
    titleInput = data.bug.title;
    statusInput = data.bug.status;
    priorityInput = data.bug.priority;

    assignee = data.bug.assignee._id;
    assigneeInput = data.bug.assignee.name ?? "";
    assigneeInputImage = data.bug.assignee.image ?? "";

    reviewer = data.bug.reviewer._id;
    reviewerInput = data.bug.reviewer.name ?? "";
    reviewerInputImage = data.bug.reviewer.image ?? "";

    form = {
      data: {},
      errors: undefined,
      success: undefined
    };
  };

  $: formActive =
    editingTitle ||
    editingDescription ||
    editingAssignee ||
    editingReviewer ||
    editingStatus ||
    editingPriority;

  $: formErrors = form?.errors as Record<string, string[]>;

  const submitForm: SubmitFunction = ({ formData }) => {
    // if DOMPurify is available, sanitize the input that's about to be sent to the server.
    if (DOMPurify) {
      const description = String(formData.get("description"));
      const sanitizedDescription = DOMPurify.sanitize(description, {
        USE_PROFILES: { html: false }
      });

      formData.set("description", sanitizedDescription);
      descriptionInput = sanitizedDescription;
    }

    inactivateForm();
  };
</script>

{#if form?.errors || formActive || data.bug.status === Status.COMPLETED}
  <div class="rounded-sm px-4 py-2 text-center {statusBarColor()}">
    {#if form?.errors}
      <p>Form Error <span class="text-slate-400">(fields reverted)</span></p>
    {:else}
      <p>{formActive ? "Pending Changes" : formatStatusText(data.bug.status)}</p>
    {/if}
  </div>
{/if}

<form class="flex flex-col gap-6" method="POST" use:enhance={submitForm}>
  <header
    class="flex flex-col gap-2 px-4 py-2 rounded-md bg-gradient-to-t {currentStatusGradient()}"
  >
    <div>
      <div class="group flex flex-row gap-2 min-w-[300px] w-[50%]">
        {#if editingTitle}
          <input
            class="input my-2 rounded-md variant-ghost-surface"
            type="text"
            bind:value={titleInput}
            name="title"
          />
        {:else}
          <h3
            class="h3"
            class:underline={formErrors?.title}
            class:decoration-error-400={formErrors?.title}
          >
            {data.bug.title}
          </h3>
          <input type="hidden" value={data.bug.title} name="title" />
          <button
            class="opacity-0 group-hover:opacity-100 text-slate-300"
            aria-hidden="true"
            on:click={() => (editingTitle = true)}
          >
            <i class="fa-solid fa-pen-to-square" />
          </button>
        {/if}
      </div>
      <a class="hover:underline text-slate-300" href="/trackers/{data.bug.tracker._id}">
        {data.bug.tracker.name} <i class="fa-solid fa-link fa-xs" />
      </a>
    </div>
    <div class="flex flex-row gap-2">
      <!-- TODO: Add a keyboard event -->
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <span
        class="chip variant-soft hover:variant-filled"
        on:click={copyLink}
        role="button"
        tabindex="0"
      >
        <span><i class="fa-solid {linkIcon}" /></span>
        <span>{linkText}</span>
      </span>
      {#if data.bug.status !== Status.COMPLETED}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <span
          class="chip variant-soft-primary hover:variant-filled"
          on:click={() => updateBugStatus(Status.COMPLETED)}
          role="button"
          tabindex="0"
        >
          <span><i class="fa-regular fa-circle-check" /></span>
          <span>Mark as Completed</span>
        </span>
      {/if}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <span
        class="chip variant-soft-secondary hover:variant-filled"
        on:click={activateForm}
        role="button"
        tabindex="0"
      >
        <span><i class="fa-solid fa-pen-nib" /></span>
        <span>Edit Mode</span>
      </span>
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- TODO: Perhaps use a form action here?  -->
      <span
        class="chip variant-soft-error hover:variant-filled"
        on:click={confirmDeleteDialog}
        role="button"
        tabindex="0"
      >
        <span><i class="fa-solid fa-trash" /></span>
        <span>Delete</span>
      </span>
    </div>
  </header>

  <main class="flex flex-row gap-4">
    <div class="flex flex-col gap-4 min-w-[300px] w-[50%]">
      <article
        class="flex flex-col gap-1 group hover:variant-glass-surface rounded-md px-4 py-2"
        class:variant-glass-error={formErrors?.description}
      >
        <header class="flex flex-row gap-4">
          <h6 class="h6 text-slate-400 select-none">Description</h6>
          <button
            class="opacity-0 group-hover:opacity-100 text-slate-300"
            aria-hidden="true"
            on:click|preventDefault={() => (editingDescription = true)}
          >
            <i class="fa-solid fa-pen-to-square" />
          </button>
        </header>
        {#if editingDescription}
          <div>
            <p class="text-slate-200">Make a text selection and choose a format modifier</p>
          </div>
          <div class="flex flex-row gap-2">
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <span
              class="chip variant-glass font-bold"
              on:click={() => replaceSelection(boldModifier)}
              role="button"
              tabindex="0"
            >
              B
            </span>
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <span
              class="chip variant-glass italic"
              on:click={() => replaceSelection(italicModifier)}
              role="button"
              tabindex="0"
            >
              I
            </span>
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <span
              class="chip variant-glass"
              on:click={() => replaceSelection(heading1Modifier)}
              role="button"
              tabindex="0"
            >
              H1
            </span>
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <span
              class="chip variant-glass"
              on:click={() => replaceSelection(heading2Modifier)}
              role="button"
              tabindex="0"
            >
              H2
            </span>
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <span
              class="chip variant-glass"
              on:click={() => replaceSelection(heading3Modifier)}
              role="button"
              tabindex="0"
            >
              H3
            </span>
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <span
              class="chip variant-glass"
              on:click={() => replaceSelection(heading4Modifier)}
              role="button"
              tabindex="0"
            >
              H4
            </span>
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <span
              class="chip variant-glass"
              on:click={() => replaceSelection(heading5Modifier)}
              role="button"
              tabindex="0"
            >
              H5
            </span>
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <span
              class="chip variant-glass"
              on:click={() => replaceSelection(heading6Modifier)}
              role="button"
              tabindex="0"
            >
              H6
            </span>
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <span
              class="chip variant-glass"
              on:click={() => replaceSelection(codeModifier)}
              role="button"
              tabindex="0"
            >
              Code
            </span>
          </div>
          <textarea
            class="textarea my-2 rounded-md variant-ghost-surface"
            rows={4}
            bind:this={descriptionElement}
            bind:value={descriptionInput}
            name="description"
          />
          <p class="text-slate-400">
            Use <a
              class="text-blue-500"
              href="https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax"
              target="_blank">Markdown</a
            > to format the text
          </p>
        {:else}
          {#key data.bug.description}
            {#if DOMPurify}
              <div id="description-markdown">
                <SvelteMarkdown
                  source={DOMPurify.sanitize(data.bug.description, {
                    USE_PROFILES: { html: false }
                  })}
                />
              </div>
            {:else}
              <p>Markdown loading...</p>
            {/if}
          {/key}
          <input type="hidden" value={data.bug.description} name="description" />
        {/if}
      </article>

      <article class="flex flex-col gap-1 group hover:variant-glass-surface rounded-md px-4 py-2">
        <header class="flex flex-row gap-4">
          <h6 class="h6 text-slate-400 select-none">Assignee</h6>
          <button
            class="opacity-0 group-hover:opacity-100 text-slate-300"
            aria-hidden="true"
            on:click|preventDefault={() => (editingAssignee = true)}
          >
            <i class="fa-solid fa-pen-to-square" />
          </button>
        </header>
        {#if editingAssignee}
          <div
            class="input-group input-group-divider grid-cols-[auto_1fr] rounded-md variant-ghost-surface my-2"
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
          <div class="card w-full max-h-48 p-4 overflow-y-auto drop-shadow-md z-10" tabindex="-1">
            <Autocomplete
              bind:input={assigneeInput}
              options={usersSelectOptions}
              on:selection={onAssigneeSelection}
            />
          </div>
          <input type="hidden" name="assignee" bind:value={assignee} />
        {:else}
          <div class="flex flex-row gap-2">
            <Avatar class="w-6 h-6" src={data.bug.assignee.image ?? ""} />
            <p>{data.bug.assignee.name}</p>
          </div>
          <input type="hidden" name="assignee" value={data.bug.assignee._id} />
        {/if}
      </article>

      <article class="flex flex-col gap-1 group hover:variant-glass-surface rounded-md px-4 py-2">
        <header class="flex flex-row gap-4">
          <h6 class="h6 text-slate-400 select-none">Reviewer</h6>
          <button
            class="opacity-0 group-hover:opacity-100 text-slate-300"
            aria-hidden="true"
            on:click|preventDefault={() => (editingReviewer = true)}
          >
            <i class="fa-solid fa-pen-to-square" />
          </button>
        </header>
        {#if editingReviewer}
          <div
            class="input-group input-group-divider grid-cols-[auto_1fr] rounded-md variant-ghost-surface my-2"
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
              class="autocomplete"
              type="search"
              bind:value={reviewerInput}
              placeholder="Search..."
              autocomplete="off"
            />
          </div>
          <div class="card w-full max-h-48 p-4 overflow-y-auto drop-shadow-md z-10" tabindex="-1">
            <Autocomplete
              bind:input={reviewerInput}
              options={usersSelectOptions}
              on:selection={onReviewerSelection}
            />
          </div>
          <input type="hidden" name="reviewer" bind:value={reviewer} />
        {:else}
          <div class="flex flex-row gap-2">
            <Avatar class="w-6 h-6" src={data.bug.reviewer.image ?? ""} />
            <p>{data.bug.reviewer.name}</p>
          </div>
          <input type="hidden" name="reviewer" value={data.bug.reviewer._id} />
        {/if}
      </article>

      <input type="hidden" name="id" value={data.bug._id} />

      {#if formActive}
        <div class="flex flex-row gap-2 mt-2">
          <button class="btn rounded-md variant-glass-secondary" type="submit">
            Save Changes
          </button>
          <button class="btn rounded-md variant-soft" on:click|preventDefault={revertChanges}>
            Revert
          </button>
        </div>
      {/if}
    </div>

    <div class="flex flex-col gap-4 min-w-[300px] w-[50%]">
      <article class="flex flex-col gap-1 group hover:variant-glass-surface rounded-md px-4 py-2">
        <header class="flex flex-row gap-4">
          <h6 class="h6 text-slate-400 select-none">Status</h6>
          <button
            class="opacity-0 group-hover:opacity-100 text-slate-300"
            aria-hidden="true"
            on:click|preventDefault={() => (editingStatus = true)}
          >
            <i class="fa-solid fa-pen-to-square" />
          </button>
        </header>
        <div>
          {#if editingStatus}
            <RadioGroup rounded="rounded-md" background="variant-soft">
              <RadioItem bind:group={statusInput} name="status" value={Status.NOT_STARTED}>
                <i class="fa-solid fa-calendar-days" />
              </RadioItem>
              <RadioItem bind:group={statusInput} name="status" value={Status.IN_PROGRESS}>
                <i class="fa-solid fa-hourglass-half" />
              </RadioItem>
              <RadioItem bind:group={statusInput} name="status" value={Status.COMPLETED}>
                <i class="fa-solid fa-circle-check" />
              </RadioItem>
            </RadioGroup>
          {:else}
            <p>{formatStatusText(data.bug.status)}</p>
            <input type="hidden" name="status" value={data.bug.status} />
          {/if}
        </div>
      </article>

      <article class="flex flex-col gap-1 group hover:variant-glass-surface rounded-md px-4 py-2">
        <header class="flex flex-row gap-4">
          <h6 class="h6 text-slate-400 select-none">Priority</h6>
          <button
            class="opacity-0 group-hover:opacity-100 text-slate-300"
            aria-hidden="true"
            on:click|preventDefault={() => (editingPriority = true)}
          >
            <i class="fa-solid fa-pen-to-square" />
          </button>
        </header>
        <div>
          {#if editingPriority}
            <RadioGroup rounded="rounded-md" background="variant-soft">
              <RadioItem bind:group={priorityInput} name="priority" value={Priority.MINIMAL}>
                {formatPriorityText(Priority.MINIMAL)}
              </RadioItem>
              <RadioItem bind:group={priorityInput} name="priority" value={Priority.LOW}>
                {formatPriorityText(Priority.LOW)}
              </RadioItem>
              <RadioItem bind:group={priorityInput} name="priority" value={Priority.MODERATE}>
                {formatPriorityText(Priority.MODERATE)}
              </RadioItem>
              <RadioItem bind:group={priorityInput} name="priority" value={Priority.HIGH}>
                {formatPriorityText(Priority.HIGH)}
              </RadioItem>
              <RadioItem bind:group={priorityInput} name="priority" value={Priority.CRITICAL}>
                {formatPriorityText(Priority.CRITICAL)}
              </RadioItem>
            </RadioGroup>
          {:else}
            <p>{formatPriorityText(data.bug.priority)}</p>
            <input type="hidden" name="priority" value={data.bug.priority} />
          {/if}
        </div>
      </article>

      {#if formErrors}
        <article
          class="animate-pulse relative flex flex-col gap-1 rounded-md px-4 py-2 bg-error-500/5"
        >
          <h6 class="h6 text-error-400 select-none">Errors</h6>
          {#each Object.entries(formErrors) as [field, message]}
            <div>
              <h6 class="h6 text-slate-400 select-none">{capitalizeWord(field)}</h6>
              <p>{message}</p>
            </div>
          {/each}
        </article>
      {/if}
    </div>
  </main>
</form>

<style>
  #description-markdown {
    & h1 {
      @apply h1;
    }

    & h2 {
      @apply h2;
    }

    & h3 {
      @apply h3;
    }

    & h4 {
      @apply h4;
    }

    & h5 {
      @apply h5;
    }

    & h6 {
      @apply h6;
    }

    & ul {
      @apply list-disc list-inside;
    }
  }
</style>
