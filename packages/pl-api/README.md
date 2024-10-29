# `pl-api`

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

## Projects using `pl-api`

[`pl-fe`](https://github.com/mkljczk/pl-fe) is a web client for Mastodon-compatible servers forked from Soapbox. It uses `pl-api` for API interactions.

## License

`pl-api` utilizes code from [Soapbox](https://gitlab.com/soapbox-pub/soapbox) and bases off official [Mastodon documentation](https://docs.joinmastodon.org).

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