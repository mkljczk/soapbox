`pl-fe` is a social networking client app. It works with any Mastodon API-compatible software, but it's focused on supporting alternative backends, like Pleroma or GoToSocial.

[![GitHub Repo stars](https://img.shields.io/github/stars/mkljczk/pl-fe)](https://github.com/mkljczk/pl-fe)
[![GitHub License](https://img.shields.io/github/license/mkljczk/pl-fe)](https://github.com/mkljczk/pl-fe?tab=AGPL-3.0-1-ov-file#readme)
[![Weblate project translated](https://img.shields.io/weblate/progress/pl-fe)](https://hosted.weblate.org/engage/pl-fe/)

## Try it out

Want to test `pl-fe` with **any existing MastoAPI-compatible server?** Try [pl.mkljczk.pl](https://pl.mkljczk.pl) — enter your server's domain name to use `pl-fe` on any server!

If you want to use `pl-fe` as the default frontend on your server, download the latest build from [pl.mkljczk.pl/pl-fe.zip](http://pl.mkljczk.pl/pl-fe.zip) and install it following the instructions for your backend. For example, on a standard Pleroma installation you can use:

```sh
curl -O https://pl.mkljczk.pl/pl-fe.zip
unzip pl-fe.zip -d /opt/pleroma/instance/static/
rm pl-fe.zip
```

## Contribute

Code contributions are welcome. [Weblate](https://hosted.weblate.org/projects/pl-fe/) is used for project translation.

<a href="https://hosted.weblate.org/engage/pl-fe/">
<img src="https://hosted.weblate.org/widget/pl-fe/287x66-grey.png" alt="Translation status" />
</a>

## License

`pl-fe` is a fork of [Soapbox](https://gitlab.com/soapbox-pub/soapbox/), which was forked from [Gab Social](https://github.com/GabOpenSource/gab-social), which is a fork of [Mastodon](https://github.com/mastodon/mastodon/).

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

---

Follow [my Pleroma account](https://pl.fediverse.pl/@mkljczk) to stay up to date on `pl-fe` development.
