<script lang="ts">
  import type { PageData } from './$types';
  import { page } from '$app/stores';

  export let data: PageData;
</script>

<pre>
	{JSON.stringify(data.tracker, null, 2)}
</pre>

<pre>
	{JSON.stringify($page.params)}
	{JSON.stringify($page.route)}
	{JSON.stringify($page.url)}
</pre>

<div />
