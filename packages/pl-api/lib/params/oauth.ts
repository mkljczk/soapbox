/**
 * @category Request params
 */
interface OauthAuthorizeParams {
  /** String. Should be set equal to `code`. */
  response_type: string;
  /** String. The client ID, obtained during app registration. */
  client_id: string;
  /** String. Set a URI to redirect the user to. If this parameter is set to `urn:ietf:wg:oauth:2.0:oob` then the authorization code will be shown instead. Must match one of the `redirect_uris` declared during app registration. */
  redirect_uri: string;
  /** String. List of requested OAuth scopes, separated by spaces (or by pluses, if using query parameters). Must be a subset of `scopes` declared during app registration. If not provided, defaults to `read`. */
  scope?: string;
  /** Boolean. Forces the user to re-login, which is necessary for authorizing with multiple accounts from the same instance. */
  force_login?: boolean;
  /** String. The ISO 639-1 two-letter language code to use while rendering the authorization form. */
  lang?: string;
}

/**
 * @category Request params
 */
interface GetTokenParams {
  /** String. Set equal to `authorization_code` if `code` is provided in order to gain user-level access. Otherwise, set equal to `client_credentials` to obtain app-level access only. */
  grant_type: string;
  /** String. A user authorization code, obtained via [GET /oauth/authorize](https://docs.joinmastodon.org/methods/oauth/#authorize). */
  code?: string;
  /** String. The client ID, obtained during app registration. */
  client_id: string;
  /** String. The client secret, obtained during app registration. */
  client_secret: string;
  /** String. Set a URI to redirect the user to. If this parameter is set to urn:ietf:wg:oauth:2.0:oob then the token will be shown instead. Must match one of the `redirect_uris` declared during app registration. */
  redirect_uri: string;
  /** String. List of requested OAuth scopes, separated by spaces (or by pluses, if using query parameters). If `code` was provided, then this must be equal to the `scope` requested from the user. Otherwise, it must be a subset of `scopes` declared during app registration. If not provided, defaults to `read`. */
  scope?: string;
}

/**
 * @category Request params
 */
interface RevokeTokenParams {
  /** String. The client ID, obtained during app registration. */
  client_id: string;
  /** String. The client secret, obtained during app registration. */
  client_secret: string;
  /** String. The previously obtained token, to be invalidated. */
  token: string;
}

/**
 * @category Request params
 */
interface MfaChallengeParams {
  client_id: string;
  client_secret: string;
  /** access token to check second step of mfa */
  mfa_token: string;
  challenge_type: 'totp' | 'recovery';
  code: string;
}

export type {
  OauthAuthorizeParams,
  GetTokenParams,
  RevokeTokenParams,
  MfaChallengeParams,
};
