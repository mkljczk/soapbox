<script lang="ts">
  import icons from '../icons';
  
  export let activePage: string;
</script>

<nav>
  <a href='/#actor' class:active={activePage === 'actor'}>
    {#if activePage === 'actor'}
      <icons.ActorActiveIcon />
    {:else}
      <icons.ActorIcon />
    {/if}
    <span>User</span>
  </a>
  <a href='/#outbox' class:active={activePage === 'outbox'}>
    {#if activePage === 'outbox'}
      <icons.OutboxActiveIcon />
    {:else}
      <icons.OutboxIcon />
    {/if}
    <span>Posts</span>
  </a>
  <a href='/#bookmarks' class:active={activePage === 'bookmarks'}>
    {#if activePage === 'bookmarks'}
      <icons.BookmarksActiveIcon />
    {:else}
      <icons.BookmarksIcon />
    {/if}
    <span>Bookmarks</span>
  </a>
  <a href='/#likes' class:active={activePage === 'likes'}>
    {#if activePage === 'likes'}
      <icons.LikesActiveIcon />
    {:else}
      <icons.LikesIcon />
    {/if}
    <span>Favourites</span>
  </a>
  <a href='/#followers' class:active={activePage === 'followers'}>
    {#if activePage === 'followers'}
      <icons.PeopleActiveIcon />
    {:else}
      <icons.PeopleIcon />
    {/if}
    <span>Followers</span>
  </a>
  <a href='/#following' class:active={activePage === 'following'}>
    {#if activePage === 'following'}
      <icons.PeopleActiveIcon />
    {:else}
      <icons.PeopleIcon />
    {/if}
    <span>Following</span>
  </a>
</nav>