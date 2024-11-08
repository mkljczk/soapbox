import clsx from 'clsx';
import React from 'react';
import { defineMessages, useIntl, FormatDateOptions } from 'react-intl';

import Markup from 'pl-fe/components/markup';
import { ParsedContent } from 'pl-fe/components/parsed-content';
import HStack from 'pl-fe/components/ui/hstack';
import Icon from 'pl-fe/components/ui/icon';
import Emojify from 'pl-fe/features/emoji/emojify';
import { CryptoAddress, LightningAddress } from 'pl-fe/features/ui/util/async-components';
import { unescapeHTML } from 'pl-fe/utils/html';

import type { Account } from 'pl-fe/normalizers/account';

const getTicker = (value: string): string => (value.match(/\$([a-zA-Z]*)/i) || [])[1];
const isTicker = (value: string): boolean => Boolean(getTicker(value));
const isZapEmoji = (value: string) => /^\u26A1[\uFE00-\uFE0F]?$/.test(value);

const messages = defineMessages({
  linkVerifiedOn: { id: 'account.link_verified_on', defaultMessage: 'Ownership of this link was checked on {date}' },
});

const dateFormatOptions: FormatDateOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour12: true,
  hour: 'numeric',
  minute: '2-digit',
};

interface IProfileField {
  field: Account['fields'][number];
  emojis?: Account['emojis'];
}

/** Renders a single profile field. */
const ProfileField: React.FC<IProfileField> = ({ field, emojis }) => {
  const intl = useIntl();

  if (isTicker(field.name)) {
    return (
      <CryptoAddress
        ticker={getTicker(field.name).toLowerCase()}
        address={unescapeHTML(field.value)}
      />
    );
  } else if (isZapEmoji(field.name)) {
    return <LightningAddress address={unescapeHTML(field.value)} />;
  }

  return (
    <dl>
      <dt title={field.name}>
        <Markup weight='bold' tag='span'>
          <Emojify text={field.name} emojis={emojis} />
        </Markup>
      </dt>

      <dd
        className={clsx({ 'text-success-500': field.verified_at })}
        title={unescapeHTML(field.value)}
      >
        <HStack space={2} alignItems='center'>
          {field.verified_at && (
            <span className='flex-none' title={intl.formatMessage(messages.linkVerifiedOn, { date: intl.formatDate(field.verified_at, dateFormatOptions) })}>
              <Icon src={require('@fluentui/checkmark_24_regular.svg')} />
            </span>
          )}

          <Markup className='overflow-hidden break-words' tag='span'>
            <ParsedContent html={field.value} emojis={emojis} />
          </Markup>
        </HStack>
      </dd>
    </dl>
  );
};

export { ProfileField as default };
