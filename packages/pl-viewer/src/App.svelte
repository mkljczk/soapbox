<script lang="ts">
  import Nav from "./components/Nav.svelte";
  import Actor from "./pages/Actor.svelte";
  import Bookmarks from "./pages/Bookmarks.svelte";
  import Followers from "./pages/Followers.svelte";
  import Following from "./pages/Following.svelte";
  import Likes from "./pages/Likes.svelte";
  import NotFound from "./pages/NotFound.svelte";
  import Outbox from "./pages/Outbox.svelte";

  import type { Actor as ActorType } from "./types";

  let activePage = $state(location.hash.slice(1) || "actor");
  let PageComponent = $state(Actor);

  let actor: ActorType | null = $state(null);

  fetch("./actor.json")
    .then((response) => response.json())
    .then((data) => {
      actor = data;
    });

  const pages = {
    "": Actor,
    actor: Actor,
    outbox: Outbox,
    bookmarks: Bookmarks,
    followers: Followers,
    following: Following,
    likes: Likes,
  };

  const onHashChange = () => {
    activePage = location.hash.slice(1);

    PageComponent = pages[activePage] || NotFound;
  };
</script>

<svelte:window on:hashchange={onHashChange} />

<Nav {activePage} {actor} />

<main>
  <PageComponent {actor} />
</main>
