<script>
  import { signIn, signOut } from '@auth/sveltekit/client';
  import { page } from '$app/stores';
</script>

<nav class="list-nav max-w-lg mx-auto">
  <h3 class="h3 mb-2">Navigation</h3>
  <ul>
    <li>
      <a href="/trackers">
        <span class="badge bg-primary-500">
          <i class="fa-solid fa-link" />
        </span>
        <span class="flex-auto">Trackers</span>
      </a>
    </li>
    <li>
      <a href="/assigned-bugs">
        <span class="badge bg-error-500">
          <i class="fa-solid fa-bug" />
        </span>
        <span class="flex-auto">Assigned bugs</span>
      </a>
    </li>
  </ul>
</nav>
