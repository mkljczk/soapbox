<script lang="ts">
  import Spinner from "../components/Spinner.svelte";
  import icons from "../icons";
  import type { Actor } from "../types";

  let { actor }: { actor: Actor | null } = $props();
</script>

<h1>
  <icons.ActorIcon />
  <span>User</span>
</h1>
{#if actor}
  <div class="account__header">
    <div class="account__header__image">
      <img
        src={actor.image?.url ||
          "https://mastodon.social/headers/original/missing.png"}
        alt=""
        class="parallax"
      />
    </div>
    <div class="account__header__bar">
      <div class="account__header__tabs">
        <div class="avatar">
          <div class="account__avatar" style="width: 90px; height: 90px;">
            <img
              src={actor.icon?.url ||
                "https://mastodon.social/avatars/original/missing.png"}
              alt=""
            />
          </div>
        </div>
      </div>
      <div class="account__header__tabs__name">
        <h1>
          <span>{actor.name || actor.preferredUsername}</span><small
            ><span>@{actor.preferredUsername}</span></small
          >
        </h1>
      </div>
      <div class="account__header__extra">
        <div class="account__header__bio">
          <div class="account__header__content">
            {@html actor.summary}
          </div>
          <div class="account__header__fields">
            {#if actor.published}
              <dl>
                <dt><span>Joined</span></dt>
                <dd>{actor.published}</dd>
              </dl>
            {/if}
            {#each actor.attachment as field}
              <dl>
                <dt><span>{field.name}</span></dt>
                <dd>{@html field.value}</dd>
              </dl>
            {/each}
          </div>
        </div>
      </div>
    </div>
  </div>
{:else}
  <Spinner />
{/if}
