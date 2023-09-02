<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import { Status } from '$lib/types';
	import {
		getDrawerStore,
		type DrawerSettings,
		type ToastSettings,
		getToastStore
	} from '@skeletonlabs/skeleton';
	import { goto } from '$app/navigation';
	import type { TrackerResponse } from '$lib/types/dto';

	export let data: PageData;
	export let form: ActionData;

	const drawerStore = getDrawerStore();
	const toastStore = getToastStore();

	const openDrawer = () => {
		const drawerSettings: DrawerSettings = {
			id: 'create-tracker',
			meta: { form },
			// styling
			position: 'right',
			width: 'w-[280px] md:w-[480px]',
			rounded: 'rounded-xl',
			blur: 'backdrop-blur-sm'
		};

		drawerStore.open(drawerSettings);
	};

	$: {
		if (form?.success) {
			if (form?.tracker) {
				const tracker: TrackerResponse = form.tracker;

				const t: ToastSettings = {
					message: 'Tracker created.',
					action: {
						label: 'Open',
						response: () => goto(`/tracker/${tracker._id}`)
					}
				};

				toastStore.trigger(t);
				drawerStore.close();
			}
		}
	}

	// Update the drawer state whenever the form data changes
	$: drawerStore.update(settings => ({ ...settings, meta: { form } }));
</script>

<section class="flex flex-col gap-5">
	<header class="flex flex-row justify-end">
		<button class="btn variant-soft-primary rounded-md gap-2" on:click={openDrawer}>
			<i class="fa-solid fa-plus" />
			Create
		</button>
	</header>

	<div class="flex-row gap-4">
		{#each data.trackers as tracker (tracker._id)}
			<a
				href="/trackers/{tracker._id}"
				class="card card-hover cursor-pointer px-8 py-4 flex justify-between"
			>
				<h4 class="h4">{tracker.name}</h4>
				<ul class="flex flex-row gap-2">
					{#each Object.values(Status) as status}
						<li class="flex w-10 items-center gap-2">
							<i
								class="fa-solid"
								class:fa-calendar-days={status === Status.NOT_STARTED}
								class:fa-hourglass-half={status === Status.IN_PROGRESS}
								class:fa-list-check={status === Status.REVIEW}
								class:fa-circle-check={status === Status.COMPLETED}
								class:fa-ban={status === Status.CANCELED}
							/>
							<p>{tracker.bugs.filter(bug => bug.status === status).length}</p>
						</li>
					{/each}
				</ul>
			</a>
		{/each}
	</div>
</section>
