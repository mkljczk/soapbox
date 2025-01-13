<script lang="ts">
  import type { OrderedColllection } from "../types";
  import Link from "../components/Link.svelte";
  import icons from "../icons";
  import Spinner from "../components/Spinner.svelte";

  let likes: OrderedColllection<string> | null = $state(null);

  fetch("./likes.json")
    .then((response) => response.json())
    .then((data) => {
      likes = data;
    });
</script>

<h1>
  <icons.LikesIcon />
  <span>Favourites</span>
</h1>
{#if likes}
  <ul>
    {#each likes.orderedItems as href}
      <li>
        <Link {href} />
      </li>
    {/each}
  </ul>
{:else}
  <Spinner />
{/if}
