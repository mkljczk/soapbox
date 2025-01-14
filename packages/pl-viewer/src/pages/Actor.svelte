<script lang="ts">
  import Spinner from "../components/Spinner.svelte";
  import icons from "../icons";
  import type { Actor } from "../types";

  let { actor }: { actor: Actor } = $props();
</script>

<h1>
  <icons.ActorIcon />
  <span>User</span>
</h1>
<Spinner />
