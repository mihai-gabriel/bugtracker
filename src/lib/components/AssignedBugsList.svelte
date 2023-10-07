<script lang="ts">
  import type { AssignedIssuesResponse, BugResponseWithTracker } from "$lib/interfaces/dto/bug";
  import { type AssigneeType, Status } from "$lib/interfaces/shared";
  import { formatStatusText } from "$lib/utils/formatText";
  import { Avatar } from "@skeletonlabs/skeleton";
  import { unwrapUser } from "$lib/utils/unwrapUser";
  import { createEventDispatcher } from "svelte";
  import type { SessionUser } from "$lib/interfaces/dto/user";

  export let bugs: AssignedIssuesResponse[];
  export let currentUser: SessionUser;

  const dispatch = createEventDispatcher();

  const dispatchStatusUpdate = (id: string, status: Status) => {
    dispatch("updateBugStatus", { id, status });
  };

  const determineAssigneeType = (bug: BugResponseWithTracker): AssigneeType => {
    const reviewing = currentUser.id === unwrapUser(bug.reviewer, "_id");
    const assignedTo = currentUser.id === unwrapUser(bug.assignee, "_id");

    if (reviewing && assignedTo) {
      return "BOTH";
    }

    if (reviewing) {
      return "REVIEWER";
    }

    return "ASSIGNEE";
  };
</script>

{#each bugs as bug, idx (idx)}
  <div class="flex flex-col gap-2">
    <article
      class="px-2 py-4 gap-4 shadow-md rounded-xl bg-opacity-5 bg-slate-500 flex flex-1 flex-row items-center box-border"
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
              <div class="flex flex-row gap-2">
                <Avatar width="w-6" src={currentUser.image ?? ""} />
                {#if determineAssigneeType(bug) === "ASSIGNEE"}
                  <p class="text-slate-300">assigned</p>
                {:else if determineAssigneeType(bug) === "REVIEWER"}
                  <p class="text-slate-300">reviewing</p>
                {:else}
                  <p class="text-slate-300">assigned & reviewing</p>
                {/if}
              </div>
            </div>
          </div>
        {:else}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <div
            class="flex w-full group select-none justify-center items-center px-4 h-[106px] max-w-[480px] rounded-lg border-dashed border-2 border-gray-600"
            class:hover:border-gray-400={status === Status.NOT_STARTED &&
              bug.permissions.includes("EDIT")}
            class:hover:border-warning-400={status === Status.IN_PROGRESS &&
              bug.permissions.includes("EDIT")}
            class:hover:border-primary-400={status === Status.COMPLETED &&
              bug.permissions.includes("EDIT")}
            on:click={() => dispatchStatusUpdate(bug._id, status)}
            class:cursor-not-allowed={!bug.permissions.includes("EDIT")}
            role="button"
            tabindex="0"
          >
            <p
              class="text-slate-600 font-bold uppercase"
              class:group-hover:text-gray-400={status === Status.NOT_STARTED &&
                bug.permissions.includes("EDIT")}
              class:group-hover:text-warning-400={status === Status.IN_PROGRESS &&
                bug.permissions.includes("EDIT")}
              class:group-hover:text-primary-400={status === Status.COMPLETED &&
                bug.permissions.includes("EDIT")}
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
