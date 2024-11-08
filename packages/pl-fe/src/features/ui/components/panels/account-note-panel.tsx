import debounce from 'lodash/debounce';
import React, { useEffect, useRef, useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { submitAccountNote } from 'pl-fe/actions/account-notes';
import HStack from 'pl-fe/components/ui/hstack';
import Text from 'pl-fe/components/ui/text';
import Textarea from 'pl-fe/components/ui/textarea';
import Widget from 'pl-fe/components/ui/widget';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';

import type { Account as AccountEntity } from 'pl-fe/normalizers/account';
import type { AppDispatch } from 'pl-fe/store';

const onSave = debounce(
  (dispatch: AppDispatch, accountId: string, value: string, callback: () => void) =>
    dispatch(submitAccountNote(accountId, value)).then(() => callback()),
  900,
);

const messages = defineMessages({
  placeholder: { id: 'account_note.placeholder', defaultMessage: 'Click to add a note' },
  saved: { id: 'generic.saved', defaultMessage: 'Saved' },
});

interface IAccountNotePanel {
  account: Pick<AccountEntity, 'id' | 'relationship'>;
}

const AccountNotePanel: React.FC<IAccountNotePanel> = ({ account }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const me = useAppSelector((state) => state.me);

  const textarea = useRef<HTMLTextAreaElement>(null);

  const [value, setValue] = useState<string | undefined>(account.relationship?.note);
  const [saved, setSaved] = useState(false);

  const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> = e => {
    setValue(e.target.value);

    onSave(dispatch, account.id, e.target.value, () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  useEffect(() => {
    setValue(account.relationship?.note);
  }, [account.relationship?.note]);

  if (!me || !account) {
    return null;
  }

  return (
    <Widget
      title={<HStack space={2} alignItems='center'>
        <label htmlFor={`account-note-${account.id}`}>
          <FormattedMessage id='account_note.header' defaultMessage='Note' />
        </label>
        {saved && (
          <Text theme='success' tag='span' className='leading-none'>
            <FormattedMessage id='generic.saved' defaultMessage='Saved' />
          </Text>
        )}
      </HStack>}
    >
      <div className='-mx-2'>
        <Textarea
          id={`account-note-${account.id}`}
          theme='transparent'
          placeholder={intl.formatMessage(messages.placeholder)}
          value={value || ''}
          onChange={handleChange}
          ref={textarea}
          autoGrow
        />
      </div>
    </Widget>
  );
};

export { AccountNotePanel as default };
