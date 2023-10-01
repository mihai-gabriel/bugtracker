<script lang="ts">
  import { page } from "$app/stores";
</script>

<div class="relative flex flex-row justify-center w-[100%]">
  <div
    class="flex flex-col items-start max-w-[50%] gap-10"
    class:pointer-events-none={!$page.data.session}
    class:select-none={!$page.data.session}
    class:opacity-20={!$page.data.session}
  >
    <div class="flex flex-col gap-2 w-[100%]">
      <h2 class="h2">Track your projects bugs</h2>
      <h4 class="h4 text-slate-400">
        Start the process of logging bugs onto a board for streamlined bug management within your
        team.
      </h4>
    </div>
    <div class="flex flex-row gap-6">
      <a
        class="card variant-ghost hover:variant-soft flex flex-row items-center justify-center w-[300px]"
        href="/trackers?action=create-tracker"
      >
        <h4 class="h4">Create a Tracker</h4>
      </a>
      <span class="divider-vertical h-26" />
      <a
        class="card variant-ghost hover:variant-soft flex py-10 flex-row items-center justify-center w-[300px] hover:variant-ghost"
        href="/trackers?action=create-bug"
      >
        <h4 class="h4">Report a Bug</h4>
      </a>
    </div>
    {#if $page.data.session}
      <div class="flex flex-col gap-2">
        <h3 class="h3">Quick Actions</h3>
        <a class="anchor" href="/trackers">View Trackers</a>
        <a class="anchor" href="/bugs">View Assigned Bugs</a>
        <a class="anchor" href="/auth">View Profile</a>
      </div>
    {/if}
  </div>
  {#if !$page.data.session}
    <div class="flex flex-col items-center gap-10 absolute self-center">
      <a class="card card-hover variant-glass-primary py-3 px-4 text-center" href="/auth">
        <h5 class="h5">Please sign in first</h5>
      </a>
    </div>
  {/if}
</div>
