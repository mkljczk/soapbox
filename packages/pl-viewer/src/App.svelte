<script lang="ts">
  import Nav from "./components/Nav.svelte";
  import Actor from "./pages/Actor.svelte";
  import Bookmarks from "./pages/Bookmarks.svelte";
  import Followers from "./pages/Followers.svelte";
  import Following from "./pages/Following.svelte";
  import Likes from "./pages/Likes.svelte";
  import Outbox from "./pages/Outbox.svelte";

  let activePage = $state(location.hash.slice(1) || "actor");
  let PageComponent = $state(Actor);

  let actor: Actor | null = $state(null);

  fetch("./actor.json")
    .then((response) => response.json())
    .then((data) => {
      actor = data;
    });

  const pages = {
    actor: Actor,
    outbox: Outbox,
    bookmarks: Bookmarks,
    followers: Followers,
    following: Following,
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
  <PageComponent {actor} />
</main>
