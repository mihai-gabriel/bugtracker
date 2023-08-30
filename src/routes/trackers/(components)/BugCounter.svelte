<script lang="ts">
	import { Status } from '$lib/types';

	export let status: Status;
	export let label: string;
	export let count: number;
</script>

<li class="flex gap-2 items-center">
	<i
		class="fa-solid"
		class:fa-calendar-days={status === Status.NOT_STARTED}
		class:fa-hourglass-half={status === Status.IN_PROGRESS}
		class:fa-list-check={status === Status.REVIEW}
		class:fa-circle-check={status === Status.COMPLETED}
		class:fa-ban={status === Status.CANCELED}
	/>
	<p>{label}: {count}</p>
</li>
