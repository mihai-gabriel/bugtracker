<script lang="ts">
  import type { PageData } from "./$types";
  import { Status } from "$lib/interfaces/shared";
  import { popup, type PopupSettings, ProgressBar } from "@skeletonlabs/skeleton";
  import type { BugRequest } from "$lib/interfaces/dto/bug";
  import { loadFormDataFromObject } from "$lib/utils/formDataInit";
  import { invalidate } from "$app/navigation";
  import { formatStatusText } from "$lib/utils/formatText";

  export let data: PageData;

  const avoidZeroDivisor = (divisor: number) => divisor || 1;

  $: tasksCompleted = data.bugsAssignedToUser.filter(bug => bug.status === Status.COMPLETED).length;
  $: progress = Math.round(
    (100 * tasksCompleted) / avoidZeroDivisor(data.bugsAssignedToUser.length)
  );

  const updateBugStatus = async (_id: string, status: Status): Promise<void> => {
    const bug = data.bugsAssignedToUser.find(bug => bug._id === _id);

    if (bug) {
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
      await invalidate("assigned-bugs");
    }
  };

  /* Menu */
  let menuPopup: PopupSettings = {
    event: "focus-click",
    placement: "bottom-end",
    target: "unset"
  };
</script>

<h3 class="h3">Issues assigned to you</h3>

<div class="flex flex-col gap-2">
  <p class="self-end text-primary-400">
    {tasksCompleted} / {data.bugsAssignedToUser.length}
  </p>
  <ProgressBar
    class="h-1 transition-all duration-100 ease-in"
    meter="bg-primary-500"
    track="bg-primary-500/30"
    label="Issues Completion"
    value={progress}
    max={100}
  />
</div>

<div class="flex flex-col gap-4">
  {#each data.bugsAssignedToUser as bug (bug._id)}
    {#if bug._id}
      <article class="card p-4 flex justify-between items-center">
        <div class="grid grid-flow-col auto-cols-fr gap-8 items-center w-[60%]">
          <h5 class="h5 text-ellipsis overflow-hidden whitespace-nowrap">
            {bug.title}
          </h5>
          <p
            class:text-primary-500={bug.status === Status.COMPLETED}
            class:text-warning-500={bug.status === Status.IN_PROGRESS}
          >
            {formatStatusText(bug.status)}
          </p>
          <a href="/trackers/{bug.tracker._id}">
            <h6
              class="h6 text-ellipsis overflow-hidden whitespace-nowrap hover:underline underline-offset-4"
            >
              {bug.tracker.name}
            </h6>
          </a>
        </div>

        <div class="flex flex-row gap-4">
          <a class="btn gap-2 variant-soft-primary" href="/bugs/{bug._id}">
            <i class="fa-solid fa-link fa-xs" />
            Details
          </a>
          <button
            class="btn-icon variant-glass-primary"
            use:popup={{ ...menuPopup, target: `bug-menu-${bug._id}` }}
          >
            <i class="fa-solid fa-ellipsis-vertical" />
          </button>
        </div>
      </article>
      <div class="card shadow-xl py-2 z-10" data-popup="bug-menu-{bug._id}">
        <div class="flex flex-col gap-2 px-2 py-1">
          <button
            class="btn rounded-md gap-2 variant-glass-primary"
            on:click={() => updateBugStatus(bug._id, Status.COMPLETED)}
          >
            Done
            <i class="fa-solid fa-check" />
          </button>
          <button
            class="btn rounded-md gap-2 variant-glass-warning"
            on:click={() => updateBugStatus(bug._id, Status.IN_PROGRESS)}
          >
            In Progress
            <i class="fa-regular fa-hourglass" />
          </button>
          <button
            class="btn rounded-md gap-2 variant-glass-surface"
            on:click={() => updateBugStatus(bug._id, Status.NOT_STARTED)}
          >
            Not Started
            <i class="fa-solid fa-ban" />
          </button>
        </div>
      </div>
    {/if}
  {/each}
</div>
