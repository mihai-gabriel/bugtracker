<script lang="ts">
  import type { PageData } from "./$types";
  import type { Permission } from "$lib/interfaces/shared";
  import { enhance } from "$app/forms";
  import { Avatar, SlideToggle } from "@skeletonlabs/skeleton";

  export let data: PageData;

  let searchInput = "";
  let joinedUsersFilter = false;
  let showInfo = true;

  $: users = data.usersWithPermissions.filter(user => {
    const matchesName = user?.name?.toLowerCase().includes(searchInput.toLowerCase());
    const matchesEmail = user.email.includes(searchInput.toLowerCase());
    const joinedTeam = user.permissions.includes("READ" as Permission);
    const isTheAuthor = user._id === data.tracker.author;

    if (isTheAuthor) {
      return false;
    }

    // Note: The impact of `joinedTeam` on the condition is dictated by `joinedUsersFilter`.
    // If `joinedUsersFilter` is unchecked then `joinedTeam` does not matter,
    // since `!false || variable1` always equals `true` => `true && variable2` always equals `variable2`
    return (!joinedUsersFilter || joinedTeam) && (matchesName || matchesEmail);
  });

  const permissions: Permission[] = ["READ", "EDIT", "DELETE"];
</script>

<div class="flex flex-col">
  <h3 class="h3 mb-6">
    <span class="text-slate-400">Manage</span>
    {data.tracker.name}<span class="text-slate-400">'s team</span>
  </h3>
  <div class="flex flex-row gap-2 items-center mb-1">
    <i class="fa-solid fa-circle-info fa-lg" />
    <h4 class="h4 font-semibold text-slate-200">Info</h4>
    <button class="anchor" on:click={() => (showInfo = !showInfo)}>
      {showInfo ? "Hide" : "Show"}
    </button>
  </div>
  {#if showInfo}
    <p class="text-slate-300">The author of the tracker is not part of the list.</p>
    <p class="text-slate-300">All the registered users are listed below (unless filtered).</p>
    <p class="text-slate-300 mb-4">
      Any user that has <span class="font-bold">Read</span> permission is considered part of this tracker's
      team.
    </p>
    <p class="text-slate-300">
      - <span class="font-bold">Read</span> permission grants the user the ability to be able to
      <span class="underline">see</span> the tracker and all the bugs.
    </p>
    <p class="text-slate-300">
      - <span class="font-bold">Edit</span> permission grants the user the ability to be able to
      <span class="underline">add</span>
      or
      <span class="underline">edit</span> bugs.
    </p>
    <p class="text-slate-300">
      - <span class="font-bold">Delete</span> permission grants the user the ability to be able to
      <span class="underline">delete</span>
      bugs.
    </p>
  {/if}
</div>

<SlideToggle name="slider-label" active="bg-primary-500" size="sm" bind:checked={joinedUsersFilter}>
  Show only the users who are part of the team
</SlideToggle>

<div class="flex flex-col gap-2">
  <label class="font-semibold text-slate-200" for="search">Search</label>
  <input
    id="search"
    class="input rounded-md variant-ghost"
    type="text"
    bind:value={searchInput}
    placeholder="Filter by name or email..."
    autocomplete="off"
  />
</div>

<div class="flex flex-col gap-8">
  {#each users as user (user._id)}
    <div class="flex flex-col gap-2">
      <div class="flex flex-row gap-3 items-center">
        <Avatar class="w-15 h-15" src={user.image ?? ""} />
        <div class="flex flex-col">
          <h4 class="h4">{user.name}</h4>
          <p class="text-slate-400">{user.email}</p>
        </div>
      </div>
      <p class="text-slate-300">Permissions:</p>
      <div class="flex flex-row gap-2">
        {#each permissions as permission, index (index)}
          <form action="?/updatePermissions" method="POST" use:enhance>
            <input type="hidden" name="user" value={user._id} />
            <input type="hidden" name="permission" value={permission} />
            {#if user.permissions.includes(permission)}
              <button
                type="submit"
                class="btn rounded-md variant-soft-primary gap-2 hover:variant-soft-error"
              >
                <i class="fa-solid fa-check" />
                {permission}
              </button>
              <input type="hidden" name="action" value="REMOVE" />
            {:else}
              <button type="submit" class="btn variant-soft gap-2">
                <i class="fa-solid fa-plus" />
                {permission}
              </button>
              <input type="hidden" name="action" value="GRANT" />
            {/if}
          </form>
        {/each}
      </div>
    </div>
  {/each}
</div>
