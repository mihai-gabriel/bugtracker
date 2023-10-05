<script lang="ts">
  import type { PageData } from "./$types";
  import { Status } from "$lib/interfaces/shared";
  import { formatStatusText } from "$lib/utils/formatText";

  export let data: PageData;
</script>

<div class="flex flex-col gap-2">
  <h3 class="h3">Archived issues assigned to you</h3>
  <a class="anchor" href="/bugs">Back to assigned bugs</a>
</div>

<div class="flex flex-col gap-4">
  {#each data.archivedBugsAssignedToUser as bug (bug._id)}
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
      </div>
    </article>
  {:else}
    <div class="flex flex-col items-center justify-center gap-6 mt-6">
      <i class="fa-solid fa-ghost fa-4x" />
      <h4 class="h4">No Issues Found!</h4>
    </div>
  {/each}
</div>
