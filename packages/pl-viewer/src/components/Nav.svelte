<script lang="ts">
  import icons from "../icons";

  import type { Actor } from "../types";

  let { activePage, actor }: { activePage: string; actor: Actor | null } = $props();

  const items = $derived([
    {
      id: "actor",
      icon: icons.ActorIcon,
      activeIcon: icons.ActorActiveIcon,
      label: "User",
      enabled: true,
    },
    {
      id: "outbox",
      icon: icons.OutboxIcon,
      activeIcon: icons.OutboxActiveIcon,
      label: "Posts",
      enabled: actor?.outbox === 'outbox.json',
    },
    {
      id: "bookmarks",
      icon: icons.BookmarksIcon,
      activeIcon: icons.BookmarksActiveIcon,
      label: "Bookmarks",
      enabled: actor?.bookmarks === 'bookmarks.json',
    },
    {
      id: "likes",
      icon: icons.LikesIcon,
      activeIcon: icons.LikesActiveIcon,
      label: "Favourites",
      enabled: actor?.likes === 'likes.json',
    },
    {
      id: "followers",
      icon: icons.PeopleIcon,
      activeIcon: icons.PeopleActiveIcon,
      label: "Followers",
      enabled: actor?.followers === 'followers.json',
    },
    {
      id: "following",
      icon: icons.PeopleIcon,
      activeIcon: icons.PeopleActiveIcon,
      label: "Following",
      enabled: actor?.following === 'following.json',
    },
  ]);
</script>

<nav>
  {#each items.filter(({ enabled}) => enabled) as { id, icon: Icon, activeIcon: ActiveIcon, label }}
    <a href="/#{id}" class:active={activePage === id}>
      {#if activePage === id}
        <ActiveIcon />
      {:else}
        <Icon />
      {/if}
      <span>{label}</span>
    </a>
  {/each}
</nav>
