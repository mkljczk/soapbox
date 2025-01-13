<script lang="ts">
  import type { Activity, OrderedColllection } from "../types";
  import Status from "../components/Status.svelte";
  import icons from "../icons";
  import Spinner from "../components/Spinner.svelte";

  let outbox: OrderedColllection<Activity> | null = $state(null);

  fetch("./outbox.json")
    .then((response) => response.json())
    .then((data) => {
      outbox = data;
    });
</script>

<h1>
  <icons.OutboxIcon />
  <span>Outbox</span>
</h1>
{#if outbox}
  <ul>
    {#each outbox.orderedItems as activity}
      <li>
        <Status {activity} />
      </li>
    {/each}
  </ul>
{:else}
  <Spinner />
{/if}
