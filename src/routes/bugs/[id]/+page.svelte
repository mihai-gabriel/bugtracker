<script lang="ts">
  import type { PageData } from "./$types";
  import { Status } from "$lib/interfaces/shared";
  import { formatStatusText } from "$lib/utils/formatText";
  import type { BugRequest } from "$lib/interfaces/dto";
  import { loadFormDataFromObject } from "$lib/utils/formDataInit";
  import { invalidate } from "$app/navigation";
  import { Avatar } from "@skeletonlabs/skeleton";

  export let data: PageData;

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
    switch (data.bug.status) {
      case Status.NOT_STARTED:
        return "bg-surface-500/20";
      case Status.IN_PROGRESS:
        return "bg-warning-500/20";
      case Status.COMPLETED:
        return "bg-primary-500/20";
    }
  };
</script>

<div class="rounded-sm px-4 py-2 text-center {statusBarColor()}">
  <p>{formatStatusText(data.bug.status)}</p>
</div>

<header class="flex flex-col gap-2 px-4 py-2 rounded-md bg-gradient-to-t {currentStatusGradient()}">
  <div>
    <h3 class="h3">{data.bug.title}</h3>
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
    <span class="chip variant-soft-error hover:variant-filled">
      <span><i class="fa-solid fa-trash" /></span>
      <span>Delete</span>
    </span>
  </div>
  <div>
    <!--    <span class="card">{formatPriorityText(data.bug.priority)}</span>-->
  </div>
</header>

<main class="flex flex-col gap-4">
  <article class="flex flex-col gap-1 group hover:variant-glass-surface rounded-md px-4 py-2">
    <header class="flex flex-row gap-4">
      <h6 class="h6 text-slate-400 select-none">Description</h6>
      <button class="opacity-0 group-hover:opacity-100 text-slate-300" aria-hidden="true">
        <i class="fa-solid fa-pen-to-square" />
      </button>
    </header>
    <p>{data.bug.description}</p>
  </article>

  <article class="flex flex-col gap-1 group hover:variant-glass-surface rounded-md px-4 py-2">
    <header class="flex flex-row gap-4">
      <h6 class="h6 text-slate-400 select-none">Assignee</h6>
      <button class="opacity-0 group-hover:opacity-100 text-slate-300" aria-hidden="true">
        <i class="fa-solid fa-pen-to-square" />
      </button>
    </header>
    <div class="flex flex-row gap-2">
      <Avatar class="w-6 h-6" src={data.bug.assignee.image ?? ""} />
      <p>{data.bug.assignee.name}</p>
    </div>
  </article>

  <article class="flex flex-col gap-1 group hover:variant-glass-surface rounded-md px-4 py-2">
    <header class="flex flex-row gap-4">
      <h6 class="h6 text-slate-400 select-none">Reviewer</h6>
      <button class="opacity-0 group-hover:opacity-100 text-slate-300" aria-hidden="true">
        <i class="fa-solid fa-pen-to-square" />
      </button>
    </header>
    <div class="flex flex-row gap-2">
      <Avatar class="w-6 h-6" src={data.bug.reviewer.image ?? ""} />
      <p>{data.bug.reviewer.name}</p>
    </div>
  </article>
</main>
