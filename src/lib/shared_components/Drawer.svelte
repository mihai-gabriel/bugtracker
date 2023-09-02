<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { Drawer, getDrawerStore } from '@skeletonlabs/skeleton';

	const drawerStore = getDrawerStore();
</script>

<Drawer>
	<!-- BEGIN trackers/+page.svelte -->
	{#if $drawerStore.id === 'create-tracker'}
		<section class="px-8 py-10 space-y-4">
			<h3 class="h3">Create Tracker</h3>
			<form class="space-y-4" method="POST" action="/trackers?/createTracker" use:enhance>
				<fieldset class="space-y-2">
					<label for="name">Name:</label>
					<input
						id="name"
						class="input variant-form-material"
						name="name"
						value={$drawerStore.meta.form?.name ?? ''}
						placeholder="Type here..."
					/>
					{#if $drawerStore.meta.form?.errors?.name}
						<p class="text-error-500">{$drawerStore.meta.form.errors.name}</p>
					{/if}
				</fieldset>

				<fieldset>
					<label for="name">Owner:</label>
					<input
						id="name"
						class="input variant-form-material"
						name="name"
						value={$page.data.session?.user?.name ?? 'Unknown'}
						placeholder="Type here..."
						disabled
						readonly
					/>
					<small class="text-gray-600">The person who has full access to the tracker.</small>
				</fieldset>

				{#if $drawerStore.meta.form?.errors?.serverError}
					<p class="text-error-500">{$drawerStore.meta.form.errors.serverError}</p>
				{/if}

				<button type="submit" class="btn text-white rounded-md variant-filled-primary">
					Submit
				</button>
			</form>
		</section>
	{/if}
	<!-- END trackers/+page.svelte -->
</Drawer>
