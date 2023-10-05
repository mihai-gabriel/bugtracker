<script lang="ts">
  import type { PageData } from "./$types";
  import { type AssigneeType, Status } from "$lib/interfaces/shared";
  import { Avatar, ProgressBar } from "@skeletonlabs/skeleton";
  import type { BugRequest, BugResponseWithTracker } from "$lib/interfaces/dto/bug";
  import { loadFormDataFromObject } from "$lib/utils/formDataInit";
  import { invalidate } from "$app/navigation";
  import { formatStatusText } from "$lib/utils/formatText";
  import { unwrapUser } from "$lib/utils/unwrapUser";

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
        assignee: JSON.stringify(bug.assignee),
        reviewer: JSON.stringify(bug.reviewer),
        priority: bug.priority,
        status: status,
        archived: bug.archived
      };

      const formData = loadFormDataFromObject(updatedBug);
      await fetch("/api/bugs", { method: "PUT", body: formData });
      await invalidate("assigned-bugs");
    }
  };

  const determineAssigneeType = (bug: BugResponseWithTracker): AssigneeType => {
    if (data.session?.user) {
      const { user } = data.session;

      if (user.id === unwrapUser(bug.reviewer, "_id")) {
        return "REVIEWER";
      }
    }

    return "ASSIGNEE";
  };
</script>

<div class="flex flex-col gap-2">
  <h3 class="h3">Fix / Review Issues assigned to you</h3>
  <a class="anchor" href="/bugs/archived">See archived</a>
</div>

{#if data.bugsAssignedToUser.length !== 0}
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
{/if}

<div class="flex flex-col gap-6">
  {#each data.bugsAssignedToUser as bug (bug._id)}
    <div class="flex flex-col gap-2">
      <h5 class="h5 text-slate-300">
        {#if determineAssigneeType(bug) === "ASSIGNEE"}
          <span class="font-bold">Assigned</span> to
        {:else}
          <span class="font-bold">Reviewing</span> this issue
        {/if}
      </h5>
      <article
        class="px-2 py-4 gap-4 shadow-md rounded-xl bg-opacity-5 flex flex-1 flex-row items-center box-border"
        class:bg-slate-500={determineAssigneeType(bug) === "ASSIGNEE"}
        class:bg-teal-500={determineAssigneeType(bug) === "REVIEWER"}
      >
        {#each Object.values(Status) as status, idx (idx)}
          {#if bug.status === status}
            <div class="relative card shadow-lg flex-grow p-4 w-full max-w-[480px]">
              <a href="/bugs/{bug._id}">
                <h4 class="h4 text-ellipsis overflow-hidden whitespace-nowrap max-w-[250px]">
                  {bug.title}
                </h4>
              </a>
              <a href="/trackers/{bug.tracker._id}">
                <h6
                  class="h6 text-slate-400 text-ellipsis overflow-hidden whitespace-nowrap hover:underline underline-offset-4"
                >
                  {bug.tracker.name} <i class="fa-solid fa-link fa-xs" />
                </h6>
              </a>
              <div class="w-full flex flex-row items-center justify-between">
                <p
                  class:text-primary-500={bug.status === Status.COMPLETED}
                  class:text-warning-500={bug.status === Status.IN_PROGRESS}
                >
                  {formatStatusText(bug.status)}
                </p>
                <Avatar width="w-8" src={unwrapUser(bug.assignee, "image") ?? ""} />
              </div>
            </div>
          {:else}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div
              class="flex w-full group select-none justify-center items-center px-4 h-[106px] max-w-[480px] rounded-lg border-dashed border-2 border-gray-600"
              class:hover:border-gray-400={status === Status.NOT_STARTED}
              class:hover:border-warning-400={status === Status.IN_PROGRESS}
              class:hover:border-primary-400={status === Status.COMPLETED}
              on:click={() => updateBugStatus(bug._id, status)}
              role="button"
              tabindex="0"
            >
              <p
                class="text-slate-600 font-bold uppercase"
                class:group-hover:text-gray-400={status === Status.NOT_STARTED}
                class:group-hover:text-warning-400={status === Status.IN_PROGRESS}
                class:group-hover:text-primary-400={status === Status.COMPLETED}
              >
                {formatStatusText(status)}
              </p>
            </div>
          {/if}
        {/each}
      </article>
    </div>
  {:else}
    <div class="flex flex-col items-center justify-center gap-6 mt-6">
      <i class="fa-solid fa-ghost fa-4x" />
      <h4 class="h4">No Issues Found!</h4>
    </div>
  {/each}
</div>
