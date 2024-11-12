# Changelog

## Unreleased

Changes made since the project forked from Soapbox in April 2024.

### Major changes

- Switched to a separate library [`pl-api`](https://github.com/mkljczk/pl-fe/tree/develop/packages/pl-api) for Mastodon API integration. It is mostly written from scratch, inheriting minor code parts from Soapbox/Mastodon. This also comes with improved compatibility with various Mastodon API extensions and abstracts out the implementation details.

### Added

**Behavior:**
- Notifications of the same type and reposts of the same post are grouped client-side.
- Date is displayed for notifications that are not about new posts.
- Replies to your posts are displayed differently to other mentions in notification list.
- Hashtags from the last line of a post are displayed in a separate component. Adapted [from Mastodon](https://github.com/mastodon/mastodon/pull/26499).
- Native grouped notifications are used on Mastodon.

**Settings:**
- You can add image description to your avatar/backend, if supported by backend.
- GoToSocial users can manage post interaction policies.

**Composing posts:**
- WYSIWYG text formatting, available if Markdown is supported.
- When writing posts, links to statuses are added as quotes, when supported by backend.
- You can select post language manually, when composing.
- You can write posts with multiple language versions, when supported by backend.
- Language detection is done client-side for composed posts, utilizing `fasttext.wasm.js`.
- Draft posts. They are stored locally only and work with any backend.
- New visibility scopes are supported – local-only and list-only for Pleroma. Local-only is a separate switch on GoToSocial.

**Features:**
- The most recent scrobble is displayed on user profile/card.
- Users can generate *interaction circles* for their profiles.
- You can bite users, if supported by backend.
- You can browse Bubble timeline, if supported by backend.
- Mastodon displays trending articles on Search page.
- Posts can be addressed to lists of users, on Pleroma.
- Support for events with external registration.
- Added a dedicated wrench reaction button.
- Interaction requests are supported. You can review pending requests and you get informed if your backend doesn't let you reply to a post. Supported on GoToSocial.
- Events with external sign up are supported.
- Application name used to post a status is displayed.

### Changed

**Behavior:**
- Separated favourites from reaction emojis. Limit for one reaction per post is removed. Facebook-like emoji reaction bar is removed.
- Simplified sensitive text/media logic.
- Reposting user is mentioned, when replying to a reposted status.
- Notification types filtering options are reasonably merged.
- Search results are never cleared by just leaving the page.
- Status spoilers are displayed with a collapse/expand button, not in an overlay.
- Mentions and hashtags in bio no longer link to external pages.
- Quotes are counted with reblogs for non-detailed statuses.
- Reactions/favourites/reblogs list modal is displayed on long press.

**Settings:**
- Moved missing description confirmation option back to Settings page.
- Profile fields can be reordered on the Edit profile page.

**UI changes:**
- Removed header. Search bar and profile dropdown are moved to the sidebar. Mobile sidebar button is moved to the thumb navigation.
- Floating action button for creating new posts is moved to the thumb navigation.
- Mobile sidebar UI is changed to look like a popover.
- Added some animations, improved consistency of the existing ones.
- Max width of the layout is increased.
- Updated Lists UI, to match the overall style.
- RSS button is displayed in account header for local users, when unauthenticated.
- Conversations page is always displayed, even when Chats are supported.
- Made it woke.
- Emojis are zoomed on hover.
- Event create/edit form is now a page, instead of a modal.
- A star is used for favorite icon, instead of a heart.

**Internal:**
- Migrated some local stores from Redux to Zustand. Other stores are being migrated away from `immutable`, before moving them either to Zustand or TanStack Query.
- Posts are now emojified during render, instead of when inserting posts to the state.
- Barrel exports are no longer used.

**Dependencies:**
- `@tanstack/react-virtual` is used for list virtualization, instead of `react-virtuoso`. This improves compatibility with Ladybird browser.
- Replaced `react-popper` and `react-overlays` with `@floating-ui/react`.
- `uuid` package is replaced by the `randomUUID()` method.

### Removed

- Removed Truth Social-specific features.
- Removed Nostr-specific stuff.
- Removed option that disabled name editing for verified users.
- Removed Call to Action banner.

### Fixed

- When initializing FaviconService, canvas export permission is checked.
- Improved regex for mentions in post composer.
- Post tombstones don't interrupt status navigation with hotkeys.
- Emojis are supported in poll options.
- Unsupported content types are not listed as available, when composing a post.
