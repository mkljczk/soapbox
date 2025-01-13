<script lang="ts">
  import type { OrderedColllection } from "../types";
  import Link from "../components/Link.svelte";
  import icons from "../icons";
  import Spinner from "../components/Spinner.svelte";

  let bookmarks: OrderedColllection<string> | null = $state(null);

  fetch("./bookmarks.json")
    .then((response) => response.json())
    .then((data) => {
      bookmarks = data;
    });
</script>

<h1>
  <icons.BookmarksIcon />
  <span>Bookmarks</span>
</h1>
{#if bookmarks}
  <ul>
    {#each bookmarks.orderedItems as href}
      <li>
        <Link {href} />
      </li>
    {/each}
  </ul>
{:else}
  <Spinner />
{/if}
