<script lang="ts">
  import icons from "../icons";

  import type { Activity } from "../types";

  export let activity: Activity;
</script>

<span class="status__visibility-icon">
  {#if activity.to.includes("https://www.w3.org/ns/activitystreams#Public")}
    <icons.PublicIcon />
  {:else if activity.cc.includes("https://www.w3.org/ns/activitystreams#Public")}
    <icons.UnlistedIcon />
  {:else if activity.to.some((to) => to.endsWith('/followers'))}
    <icons.FollowersIcon />
  {:else}
    <icons.DirectIcon />
  {/if}
</span>