<script lang="ts">
  import BugDetail from "$lib/components/BugDetail.svelte";
  import NewBugForm from "$lib/components/NewBugForm.svelte";
  import { Status } from "$lib/interfaces/shared";
  import {
    getModalStore,
    ListBox,
    ListBoxItem,
    type ModalComponent,
    type ModalSettings
  } from "@skeletonlabs/skeleton";
  import { quadInOut } from "svelte/easing";
  import { fly } from "svelte/transition";
  import type { ActionData, PageData } from "./$types";
  import BugList from "$lib/components/BugList.svelte";
  import type { ComponentEvents } from "svelte";
  import { onMount } from "svelte";
  import { getColsClassByCount } from "./utils/getColsClassByCount";
  import { formatStatusText } from "$lib/utils/formatText";
  import { sortPredicateBugPriority, sortPredicateStatus } from "./utils/sortPredicates";
  import type { BugRequest } from "$lib/interfaces/dto";
  import { loadFormDataFromObject } from "$lib/utils/formDataInit";
  import { invalidate } from "$app/navigation";
  import { page } from "$app/stores";
  import { unwrapUser } from "$lib/utils/unwrapUser";

  export let data: PageData;
  export let form: ActionData;

  const modalStore = getModalStore();

  const openCreateForm = () => {
    const newBugModal: ModalComponent = {
      ref: NewBugForm,
      props: { trackerId: data.tracker._id, users: data.trackerUsers }
    };

    const modal: ModalSettings = {
      type: "component",
      component: newBugModal,
      meta: { form },
      response: () => {
        // Reset Form on clicking away
        form = {
          data: {},
          errors: {},
          success: undefined
        };
      }
    };

    modalStore.trigger(modal);
  };

  const openDetails = (event: ComponentEvents<BugList>["selectBug"]) => {
    const selectedBug = data.tracker.bugs.find(bug => bug._id === event.detail.id);

    const bugDetailModal: ModalComponent = {
      ref: BugDetail,
      props: {
        bug: selectedBug,
        trackerId: data.tracker._id,
        users: data.trackerUsers,
        currentUrl: $page.url.pathname
      }
    };

    const modal: ModalSettings = {
      type: "component",
      component: bugDetailModal,
      meta: { form },
      response: () => {
        // Reset Form on clicking away
        form = {
          data: {},
          errors: {},
          success: undefined
        };
      }
    };

    modalStore.trigger(modal);
  };

  const updateModalStore = (formData: ActionData) => {
    // Close the store if form actions data returns `success` as a property.
    // Otherwise, update the modal store whenever the form actions data changes to display info like errors etc.
    if (form?.success) {
      modalStore.close();
    } else if ($modalStore[0]) {
      $modalStore[0].meta.form = formData;
    }
  };

  $: updateModalStore(form);

  // Filter bugs based on what the user selected
  let statusInput: Status[] = [];

  // bug columns grouped by Status;
  let columnsByStatus: Status[];

  // filter by assignee or reviewer name
  let searchInput = "";

  const filterColumnsByStatusInput = (input: Status[]) => {
    if (input.length === 0) {
      return Object.values(Status);
    }

    return [...input].sort(sortPredicateStatus);
  };

  $: columnsByStatus = filterColumnsByStatusInput(statusInput);
  $: filteredBugsByStatusAndSearch = (status: Status) => {
    return data.tracker.bugs
      .filter(bug => {
        const matchesStatus = bug.status === status;
        const matchesAssigneeName = unwrapUser(bug.assignee, "name")
          ?.toLowerCase()
          .includes(searchInput.toLowerCase());
        const matchesReviewerName = unwrapUser(bug.reviewer, "name")
          ?.toLowerCase()
          .includes(searchInput.toLowerCase());

        return matchesStatus && (matchesAssigneeName || matchesReviewerName);
      })
      .sort(sortPredicateBugPriority);
  };

  // Drag And Drop
  let columnHovered: Status | null;

  const dragStart = (event: ComponentEvents<BugList>["dragStart"]) => {
    const { bugId, dragEvent } = event.detail;

    dragEvent.dataTransfer.setData("text/plain", JSON.stringify({ bugId }));
    dragEvent.dataTransfer.dropEffect = "link";
  };

  const drop = async (event: DragEvent, status: Status) => {
    const dragData = event.dataTransfer?.getData("text/plain");

    if (dragData) {
      const { bugId } = JSON.parse(dragData);
      const bug = data.tracker.bugs.find(bug => bug._id === bugId);

      if (bug) {
        const updatedBug: BugRequest = {
          ...bug,
          id: bug._id,
          status,
          assignee: JSON.stringify(bug.assignee),
          reviewer: JSON.stringify(bug.reviewer)
        };

        const formData = loadFormDataFromObject(updatedBug);
        await fetch("/api/bugs", { method: "PUT", body: formData });
        await invalidate("bugs");
      }
    }

    columnHovered = null;
  };

  $: gridColumnsClass = getColsClassByCount(statusInput.length);

  onMount(() => {
    if (
      $page.url.searchParams.get("action") === "create-bug" &&
      data.currentUserPermissions.includes("EDIT")
    ) {
      openCreateForm();
    }
  });
</script>

<section class="space-y-6">
  <header class="flex flex-row justify-between items-center">
    <h3 class="h3">{data.tracker.name}</h3>
    <div class="flex flex-row gap-4 items-center">
      {#if statusInput.length !== 0}
        <button
          class="btn variant-soft-tertiary text-sm px-4 py-2 gap-2"
          on:click={() => (statusInput = [])}
        >
          <i class="fa-solid fa-circle-xmark" />
          Clear
        </button>
      {/if}
      <ListBox multiple class="flex flex-row gap-2 [&>label]:!m-0">
        {#each Object.values(Status) as status}
          <ListBoxItem bind:group={statusInput} name="status" value={status}>
            <i
              class="fa-solid"
              class:fa-calendar-days={status === Status.NOT_STARTED}
              class:fa-hourglass-half={status === Status.IN_PROGRESS}
              class:fa-circle-check={status === Status.COMPLETED}
            />
          </ListBoxItem>
        {/each}
      </ListBox>
      <span class="divider-vertical h-5" />
      {#if data.currentUserPermissions.includes("EDIT")}
        <button class="btn variant-soft-warning rounded-md gap-2" on:click={openCreateForm}>
          <i class="fa-solid fa-bug" />
          Create Bug
        </button>
      {/if}
      {#if data.tracker.author === data.session?.user.id}
        <a
          class="btn variant-soft-tertiary rounded-md gap-2"
          href="/trackers/{data.tracker._id}/users"
        >
          <i class="fa-solid fa-people-group" />Manage Team
        </a>
      {/if}
      <input
        class="input rounded-md variant-ghost"
        type="text"
        bind:value={searchInput}
        placeholder="Search by user..."
      />
    </div>
  </header>

  <main class="grid {gridColumnsClass} transition-all ease-out duration-150 gap-6">
    {#each columnsByStatus as status (Object.values(Status).indexOf(status))}
      <div class="relative flex flex-col space-y-4" in:fly={{ duration: 300, easing: quadInOut }}>
        <h5 class="h5">{formatStatusText(status)}</h5>
        <BugList
          bugs={filteredBugsByStatusAndSearch(status)}
          hoveringOver={status === columnHovered && data.currentUserPermissions.includes("EDIT")}
          on:selectBug={openDetails}
          on:dragStart={dragStart}
          on:drop={event => drop(event, status)}
          on:dragenter={() => (columnHovered = status)}
          on:dragleave={() => (columnHovered = null)}
          userPermissions={data.currentUserPermissions}
          displayArchive={status === Status.COMPLETED}
        />
      </div>
    {/each}
  </main>
</section>
