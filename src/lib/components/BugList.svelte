<script lang="ts">
  import BugField from "$lib/components/BugField.svelte";
  import type { BugResponse } from "$lib/interfaces/dto";
  import { receive, send } from "../utils/transition";
  import { flip } from "svelte/animate";
  import { createEventDispatcher } from "svelte";
  import type { Permission } from "$lib/interfaces/shared";
  import { goto } from "$app/navigation";

  export let bugs: BugResponse[];
  export let hoveringOver: boolean;
  export let userPermissions: Permission[];
  export let displayArchive: boolean;

  const dispatch = createEventDispatcher();
  const selectBug = async (id: string) => {
    if (!userPermissions.includes("EDIT")) {
      await goto(`/bugs/${id}`);
      return;
    }

    dispatch("selectBug", { id });
  };

  const dragStart = (event: DragEvent, id: string) => {
    dispatch("dragStart", {
      bugId: id,
      dragEvent: event
    });
  };

  $: backgroundStyle = hoveringOver ? "bg-secondary-400/20" : "bg-secondary-100/10";

  // add spacing so that archive button won't cover the last bug in the column
  $: completedColumnPadding = displayArchive && bugs.length !== 0 ? "!pb-16" : "";
</script>

<ul
  class="flex flex-col rounded-md space-y-3 p-3 min-h-[600px] max-h-[600px] overflow-y-auto w-full {backgroundStyle} {completedColumnPadding}"
  class:outline-dashed={hoveringOver}
  class:outline-2={hoveringOver}
  class:outline-offset-4={hoveringOver}
  class:outline-secondary-400={hoveringOver}
  on:drop|preventDefault
  on:dragenter
  on:dragleave
  on:dragover|preventDefault={() => null}
>
  {#each bugs as bug (bug._id)}
    <li
      class:pointer-events-none={hoveringOver}
      draggable={userPermissions.includes("EDIT")}
      in:receive={{ key: bug._id }}
      out:send={{ key: bug._id }}
      animate:flip={{ duration: 100 }}
      on:dragstart={event => dragStart(event, bug._id)}
    >
      <BugField
        title={bug.title}
        assignee={bug.assignee}
        reviewer={bug.reviewer}
        priority={bug.priority}
        on:click={() => selectBug(bug._id)}
      />
    </li>
  {/each}
  {#if displayArchive && bugs.length !== 0}
    <button
      class="absolute bottom-0 left-0 btn rounded-md w-full variant-filled-secondary gap-2"
      disabled
    >
      <i class="fa-solid fa-box-archive" /> Archive Completed Bugs (Not implemented yet)
    </button>
  {/if}
</ul>
