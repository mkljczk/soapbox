<script lang="ts">
  import type { OrderedColllection } from "../types";
  import Link from "../components/Link.svelte";
  import icons from "../icons";
  import Spinner from "../components/Spinner.svelte";

  let following: OrderedColllection<string> | null = $state(null);

  fetch("./following.json")
    .then((response) => response.json())
    .then((data) => {
      following = data;
    });
</script>

<h1>
  <icons.PeopleIcon />
  <span>Following</span>
</h1>
{#if following}
  <ul>
    {#each following.orderedItems as href}
      <li>
        <Link {href} />
      </li>
    {/each}
  </ul>
{:else}
  <Spinner />
{/if}
