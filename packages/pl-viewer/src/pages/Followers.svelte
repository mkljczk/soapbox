<script lang="ts">
  import type { OrderedColllection } from "../types";
  import Link from "../components/Link.svelte";
  import icons from "../icons";
  import Spinner from "../components/Spinner.svelte";

  let followers: OrderedColllection<string> | null = $state(null);

  fetch("./followers.json")
    .then((response) => response.json())
    .then((data) => {
      followers = data;
    });
</script>

<h1>
  <icons.PeopleIcon />
  <span>Followers</span>
</h1>
{#if followers}
  <ul>
    {#each followers.orderedItems as href}
      <li>
        <Link {href} />
      </li>
    {/each}
  </ul>
{:else}
  <Spinner />
{/if}
