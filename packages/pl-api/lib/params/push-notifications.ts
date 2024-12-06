/**
 * @category Request params
 */
interface CreatePushNotificationsSubscriptionParams {
  subscription: {
    /** String. The endpoint URL that is called when a notification event occurs. */
    endpoint: string;
    keys?: {
      /** String. User agent public key. Base64 encoded string of a public key from a ECDH keypair using the prime256v1 curve. */
      p256dh: string;
      /** String. Auth secret. Base64 encoded string of 16 bytes of random data. */
      auth: string;
    };
  };
  data?: {
    alerts?: Record<string, boolean>;
    /** String. Specify whether to receive push notifications from `all`, `followed`, `follower`, or `none` users. */
    policy?: string;
  };
}

/**
 * @category Request params
 */
interface UpdatePushNotificationsSubscriptionParams {
  data?: {
    alerts?: Record<string, boolean>;
  };
  /** String. Specify whether to receive push notifications from `all`, `followed`, `follower`, or `none` users. */
  policy?: string;
}

export type {
  CreatePushNotificationsSubscriptionParams,
  UpdatePushNotificationsSubscriptionParams,
};
