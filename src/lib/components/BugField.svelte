<script lang="ts">
  import { Priority } from "$lib/interfaces/shared";
  import { Avatar } from "@skeletonlabs/skeleton";
  import type { OptionalAssignedUser } from "$lib/interfaces/dto/user";
  import { unwrapUser } from "$lib/utils/unwrapUser";

  export let title: string;
  export let assignee: OptionalAssignedUser;
  export let reviewer: OptionalAssignedUser;
  export let priority: Priority;
</script>

<!-- TODO: Add a keyboard event -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  class="card card-hover flex flex-row items-center px-4 py-2 justify-between rounded-sm border-l-4"
  class:border-surface-400={priority === Priority.MINIMAL}
  class:border-tertiary-400={priority === Priority.LOW}
  class:border-secondary-400={priority === Priority.MODERATE}
  class:border-warning-400={priority === Priority.HIGH}
  class:border-error-400={priority === Priority.CRITICAL}
  role="button"
  on:click
  tabindex="0"
>
  <div class="max-w-[150px] w-[25%]">
    <h6 class="h6 text-ellipsis whitespace-nowrap overflow-hidden">{title}</h6>
  </div>
  <div class="max-w-[50px] w-[25%]">
    <i class="fa-solid fa-grip-lines" />
  </div>
  <div class="flex flex-row space-x-6 items-center">
    <div class="flex flex-row space-x-2 items-center">
      <Avatar
        src={unwrapUser(assignee, "image") ?? ""}
        width="w-8"
        rounded="rounded-full"
        border="border-2 border-cyan-700"
      />
    </div>
    <div class="flex flex-row space-x-2 items-center">
      <Avatar
        src={unwrapUser(reviewer, "image") ?? ""}
        width="w-8"
        rounded="rounded-full"
        border="border-2 border-purple-700"
      />
    </div>
  </div>
</div>
