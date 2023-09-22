<script lang="ts">
  import BugField from '$lib/components/BugField.svelte';
  import type { BugResponseFull } from '$lib/interfaces/dto';
  import { receive, send } from '../utils/transition';
  import { flip } from 'svelte/animate';
  import { createEventDispatcher } from 'svelte';

  export let bugs: BugResponseFull[];
  export let hoveringOver: boolean;

  const dispatch = createEventDispatcher();
  const selectBug = (id: string) => {
    dispatch('selectBug', { id });
  };

  const dragStart = (event: DragEvent, id: string) => {
    dispatch('dragStart', {
      bugId: id,
      dragEvent: event
    });
  };

  $: backgroundStyle = hoveringOver ? 'bg-secondary-400/20' : 'bg-secondary-100/10';
</script>

<ul
  class="flex flex-col space-y-3 p-2 min-h-[600px] rounded-md {backgroundStyle}"
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
      draggable={true}
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
</ul>
