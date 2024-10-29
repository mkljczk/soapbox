/**
 * @category Request params
 */
interface CreateApplicationParams {
  /** String. A name for your application */
  client_name: string;
  /** String. Where the user should be redirected after authorization. To display the authorization code to the user instead of redirecting to a web page, use `urn:ietf:wg:oauth:2.0:oob` in this parameter. */
  redirect_uris: string;
  /** String. Space separated list of scopes. If none is provided, defaults to `read`. See [OAuth Scopes](https://docs.joinmastodon.org/api/oauth-scopes/) for a list of possible scopes. */
  scopes?: string;
  /** String. A URL to the homepage of your app */
  website?: string;
}

export type {
  CreateApplicationParams,
};
