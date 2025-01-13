<script lang="ts">
  import icons from "../icons";

  export let href: string;
</script>

<div class="status">
  <div class="status__prepend">
    <span class="status__prepend__icon">
      <icons.LinkIcon />
    </span>
    <a {href} target="_blank">{href}</a>
  </div>
</div>
