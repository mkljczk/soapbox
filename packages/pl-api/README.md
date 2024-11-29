# `pl-api`

[![GitHub License](https://img.shields.io/github/license/mkljczk/pl-fe)](https://github.com/mkljczk/pl-fe?tab=AGPL-3.0-1-ov-file#readme)
[![NPM Version](https://img.shields.io/npm/v/pl-api)
![NPM Downloads](https://img.shields.io/npm/dw/pl-api)](https://www.npmjs.com/package/pl-api)

A JavaScript library for interacting with Mastodon API-compatible servers, focused on support for projects extending the official Mastodon API.

`pl-api` attempts to abstract out the implementation details when supporting different backends, implementing the same features in different ways. It uses [Valibot](https://valibot.dev/) to ensure type safety and normalize API responses.

Example:
```ts
import { PlApiClient, type CreateApplicationParams } from 'pl-api';

const { ACCESS_TOKEN } = process.env;

const client = new PlApiClient('https://mastodon.example/', ACCESS_TOKEN, {
  fetchInstance: true,
  onInstanceFetchSuccess: () => console.log('Instance fetched'),
});

await client.statuses.createStatus({
  status: 'Hello, world!',
  language: 'en',
});
```

Some sort of documentation is available on https://pl.mkljczk.pl/pl-api-docs

> This project should be considered unstable before the 1.0.0 release. I will not provide any changelog or information on breaking changes until then.

## Supported projects

Currently, `pl-api` includes compatibility definitions for 12 independent Mastodon API implementations and 5 variants of them (like, forks). As the combination of software name and version is not the only way `pl-api` infers feature availability, some feature definitions will also work on other software.

For unsupported projects, it falls back to a basic feature set, though every method of PlApiClient may be used anyway.

## Projects using `pl-api`

* [`pl-fe`](https://github.com/mkljczk/pl-fe/tree/develop/packages/pl-fe) is a web client for Mastodon-compatible servers forked from Soapbox. It uses `pl-api` for API interactions.
* [`pl-hooks`](https://github.com/mkljczk/pl-fe/tree/develop/packages/pl-hooks) is a work-in-progress library utilizing `pl-api`.

## License

`pl-api` utilizes parts of code from [Soapbox](https://gitlab.com/soapbox-pub/soapbox) and bases off official [Mastodon documentation](https://docs.joinmastodon.org).

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.