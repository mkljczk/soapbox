<script lang="ts">
  import icons from "../icons";

  import StatusVisibility from "./StatusVisibility.svelte";

  import type { Activity } from "../types";

  export let activity: Activity;
</script>

<div class="status">
  {#if activity.type === "Create"}
    <div class="status__info">
      <span class="status__relative-time">
        <StatusVisibility {activity} />
        <time datetime={activity.published}>{activity.published}</time>
        <a href={activity.id} target="_blank"
          ><span class="status__visibility-icon"><icons.LinkIcon /></span></a
        >
      </span>
    </div>
    {#if activity.object.summary}
      <div class="content-warning">
        <p>
          {activity.object.summary}
        </p>
      </div>
    {/if}
    <div class="status__content">
      <div
        class="status__content__text"
        lang={Object.keys(activity.object.contentMap || {})?.[0]}
      >
        {@html activity.object.content}
      </div>
    </div>
    {#if activity.object.attachment?.length > 0}
      <div class="media-gallery">
        <div class="media-gallery__item">
          {#each activity.object.attachment as attachment}
            {#if attachment.mediaType.startsWith("image")}
              <img
                src={attachment.url}
                height={attachment.height}
                width={attachment.width}
                alt={attachment.name}
              />
            {:else if attachment.mediaType.startsWith("video")}
              <video controls>
                <source src={attachment.url} type={attachment.mediaType} />
              </video>
            {:else if attachment.mediaType.startsWith("audio")}
              <audio controls>
                <source src={attachment.url} type={attachment.mediaType} />
              </audio>
            {:else}
              <a href={attachment.url} target="_blank" rel="noopener">
                {attachment.name}
              </a>
            {/if}
          {/each}
        </div>
        <!-- <div class="media-gallery__actions">
        <button class="media-gallery__actions__pill"
          ><span>Hide</span></button
        >
      </div> -->
      </div>
    {/if}
    {#if activity.object.quoteUrl}
      <div class="status__prepend">
        <span class="status__prepend__icon">
          <icons.QuoteIcon />
        </span>
        <span>
          <a href={activity.object.quoteUrl} target="_blank"
            >{activity.object.quoteUrl}</a
          >
        </span>
      </div>
    {/if}
    {#if activity.object.shares || activity.object.likes || activity.object.repliesCount !== undefined}
      <div class="status__action-bar">
        {#if activity.object.shares !== undefined}
          <div title="Boosts" class="status__action-bar__button icon-button">
            <icons.BoostIcon height="24" width="24" />
            <span class="icon-button__counter">
              {activity.object.shares?.totalItems}
            </span>
          </div>
        {/if}
        {#if activity.object.likes !== undefined}
          <div
            title="Favorites"
            class="status__action-bar__button star-icon icon-button"
          >
            <icons.FavouriteIcon height="24" width="24" />
            <span class="icon-button__counter">
              {activity.object.likes?.totalItems}
            </span>
          </div>
        {/if}
        {#if activity.object.repliesCount !== undefined}
          <div
            title="Replies"
            class="status__action-bar__button comment-icon icon-button"
          >
            <icons.ReplyIcon height="24" width="24" />
            <span class="icon-button__counter">
              {activity.object.repliesCount}
            </span>
          </div>
        {/if}
      </div>
    {/if}
  {:else}
    <div class="status__prepend">
      <span class="status__prepend__icon">
        <icons.BoostIcon />
      </span>
      <span>
        Boosted <a href={activity.object} target="_blank">{activity.object}</a>
      </span>
    </div>
  {/if}
</div>
