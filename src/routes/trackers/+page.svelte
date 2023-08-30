<script lang="ts">
	import { Status } from '$lib/types';
	import type { BugResponse } from '$lib/types/dto/bug';
	import type { PageData } from './$types';
	import BugCounter from './(components)/BugCounter.svelte';

	export let data: PageData;

	const countBugsByStatus = (bugs: BugResponse[], status: Status) => {
		return bugs.filter(bug => bug.status === status).length;
	};
</script>

<div class="flex-row gap-4">
	{#each data.trackers as tracker (tracker._id)}
		<div class="card card-hover cursor-pointer px-8 py-4 flex justify-between">
			<h3 class="h3">{tracker.name}</h3>
			<ul class="flex flex-row gap-2">
				<BugCounter
					label="Not started"
					status={Status.NOT_STARTED}
					count={countBugsByStatus(tracker.bugs, Status.NOT_STARTED)}
				/>
				<BugCounter
					label="In progress"
					status={Status.IN_PROGRESS}
					count={countBugsByStatus(tracker.bugs, Status.IN_PROGRESS)}
				/>
				<BugCounter
					label="In review"
					status={Status.REVIEW}
					count={countBugsByStatus(tracker.bugs, Status.REVIEW)}
				/>
				<BugCounter
					label="Completed"
					status={Status.COMPLETED}
					count={countBugsByStatus(tracker.bugs, Status.COMPLETED)}
				/>
				<BugCounter
					label="Canceled"
					status={Status.CANCELED}
					count={countBugsByStatus(tracker.bugs, Status.CANCELED)}
				/>
			</ul>
		</div>
	{/each}
</div>
