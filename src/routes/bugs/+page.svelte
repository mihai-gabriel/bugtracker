<script lang="ts">
  import type { PageData } from "./$types";
  import { Status } from "$lib/interfaces/shared";
  import { ProgressBar } from "@skeletonlabs/skeleton";
  import type { BugRequest } from "$lib/interfaces/dto/bug";
  import { loadFormDataFromObject } from "$lib/utils/formDataInit";
  import { invalidate } from "$app/navigation";
  import { avoidZeroDivisor } from "$lib/utils/avoidZeroDivisor";
  import AssignedBugsList from "$lib/components/AssignedBugsList.svelte";
  import type { ComponentEvents } from "svelte";

  export let data: PageData;

  $: tasksCompleted = data.bugsAssignedToUser.filter(bug => bug.status === Status.COMPLETED).length;
  $: progress = Math.round(
    (100 * tasksCompleted) / avoidZeroDivisor(data.bugsAssignedToUser.length)
  );

  const updateBugStatus = async (
    event: ComponentEvents<AssignedBugsList>["updateBugStatus"]
  ): Promise<void> => {
    const bug = data.bugsAssignedToUser.find(bug => bug._id === event.detail.id);

    if (bug) {
      const updatedBug: BugRequest = {
        id: bug._id,
        title: bug.title,
        description: bug.description,
        assignee: JSON.stringify(bug.assignee),
        reviewer: JSON.stringify(bug.reviewer),
        priority: bug.priority,
        status: event.detail.status,
        archived: bug.archived
      };

      const formData = loadFormDataFromObject(updatedBug);
      await fetch("/api/bugs", { method: "PUT", body: formData });
      await invalidate("assigned-bugs");
    }
  };
</script>

<div class="flex flex-col gap-2">
  <h3 class="h3">Fix / Review Issues assigned to you</h3>
</div>

{#if data.bugsAssignedToUser.length !== 0}
  <div class="flex flex-col gap-2">
    <div class="flex flex-row justify-between">
      <p class="text-slate-300">Progress</p>
      <p class="text-primary-400">
        {tasksCompleted} / {data.bugsAssignedToUser.length}
      </p>
    </div>
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
  {#if data.session?.user}
    <AssignedBugsList
      bugs={data.bugsAssignedToUser}
      currentUser={data.session.user}
      on:updateBugStatus={updateBugStatus}
    />
  {/if}
</div>

<div>
  <a class="btn variant-soft rounded-md gap-2 flex flex-row !items-center" href="/bugs/archived">
    <i class="fa-solid fa-box-archive fa-sm" /> See archived
  </a>
</div>
