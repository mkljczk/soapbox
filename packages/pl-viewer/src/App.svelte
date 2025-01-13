<script lang="ts">
  import Nav from "./components/Nav.svelte";
  import Actor from "./pages/Actor.svelte";
  import Bookmarks from "./pages/Bookmarks.svelte";
  import Likes from "./pages/Likes.svelte";
  import Outbox from "./pages/Outbox.svelte";

  let activePage = $state(location.hash.slice(1) || "actor");
  let PageComponent = $state(Outbox);

  const pages = {
    actor: Actor,
    outbox: Outbox,
    bookmarks: Bookmarks,
    likes: Likes,
  };

  const onHashChange = () => {
    activePage = location.hash.slice(1);

    PageComponent = pages[activePage] || Actor;
  };
</script>

<svelte:window on:hashchange={onHashChange} />

<Nav {activePage} />

<main>
  <PageComponent />
</main>
