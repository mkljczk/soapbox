import { OrderedSet } from 'immutable';
import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import Button from 'pl-fe/components/ui/button';
import FormGroup from 'pl-fe/components/ui/form-group';
import HStack from 'pl-fe/components/ui/hstack';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import Toggle from 'pl-fe/components/ui/toggle';
import StatusCheckBox from 'pl-fe/features/ui/components/modals/report-modal/components/status-check-box';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { getDomain } from 'pl-fe/utils/accounts';

import type { Account } from 'pl-fe/normalizers/account';

const messages = defineMessages({
  addAdditionalStatuses: { id: 'report.other_actions.add_additional', defaultMessage: 'Would you like to add additional statuses to this report?' },
  addMore: { id: 'report.other_actions.add_more', defaultMessage: 'Add more' },
  furtherActions: { id: 'report.other_actions.further_actions', defaultMessage: 'Further actions:' },
  hideAdditionalStatuses: { id: 'report.other_actions.hide_additional', defaultMessage: 'Hide additional statuses' },
  otherStatuses: { id: 'report.other_actions.other_statuses', defaultMessage: 'Include other statuses?' },
});

interface IOtherActionsStep {
  account: Pick<Account, 'id' | 'acct' | 'local' | 'url'>;
  selectedStatusIds: string[];
  setSelectedStatusIds: (value: string[]) => void;
  block: boolean;
  setBlock: (value: boolean) => void;
  forward: boolean;
  setForward: (value: boolean) => void;
  isSubmitting: boolean;
}

const OtherActionsStep = ({
  account,
  selectedStatusIds,
  setSelectedStatusIds,
  block,
  setBlock,
  forward,
  setForward,
  isSubmitting,
}: IOtherActionsStep) => {
  const features = useFeatures();
  const intl = useIntl();

  const statusIds = useAppSelector((state) => OrderedSet(state.timelines.get(`account:${account.id}:with_replies`)!.items).union(selectedStatusIds) as OrderedSet<string>);
  const isBlocked = block;
  const isForward = forward;
  const canForward = !account.local && features.federating;

  const [showAdditionalStatuses, setShowAdditionalStatuses] = useState<boolean>(false);

  const handleBlockChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBlock(event.target.checked);
  };

  const handleForwardChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForward(event.target.checked);
  };

  const toggleStatusReport = (statusId: string) => (value: boolean) => {
    let newStatusIds = selectedStatusIds;
    if (value && !selectedStatusIds.includes(statusId)) newStatusIds = [...selectedStatusIds, statusId];
    if (!value) newStatusIds = selectedStatusIds.filter(id => id !== statusId);

    setSelectedStatusIds(newStatusIds);
  };

  return (
    <Stack space={4}>
      <Stack space={2}>
        <Text tag='h1' size='xl' weight='semibold'>
          {intl.formatMessage(messages.otherStatuses)}
        </Text>

        <FormGroup labelText={intl.formatMessage(messages.addAdditionalStatuses)}>
          {showAdditionalStatuses ? (
            <Stack space={2}>
              <div className='divide-y divide-solid divide-gray-200 dark:divide-gray-800'>
                {statusIds.map((statusId) => (
                  <StatusCheckBox
                    id={statusId}
                    key={statusId}
                    checked={selectedStatusIds.includes(statusId)}
                    toggleStatusReport={toggleStatusReport(statusId)}
                  />
                ))}
              </div>

              <div>
                <Button
                  icon={require('@tabler/icons/outline/arrows-minimize.svg')}
                  theme='tertiary'
                  size='sm'
                  onClick={() => setShowAdditionalStatuses(false)}
                >
                  {intl.formatMessage(messages.hideAdditionalStatuses)}
                </Button>
              </div>
            </Stack>
          ) : (
            <Button
              icon={require('@tabler/icons/outline/plus.svg')}
              theme='tertiary'
              size='sm'
              onClick={() => setShowAdditionalStatuses(true)}
            >
              {intl.formatMessage(messages.addMore)}
            </Button>
          )}
        </FormGroup>
      </Stack>

      <Stack space={2}>
        <Text tag='h1' size='xl' weight='semibold'>
          {intl.formatMessage(messages.furtherActions)}
        </Text>

        <FormGroup
          labelText={<FormattedMessage id='report.block_hint' defaultMessage='Do you also want to block this account?' />}
        >
          <HStack space={2} alignItems='center'>
            <Toggle
              checked={isBlocked}
              onChange={handleBlockChange}
              id='report-block'
            />

            <Text theme='muted' tag='label' size='sm' htmlFor='report-block'>
              <FormattedMessage id='report.block' defaultMessage='Block {target}' values={{ target: `@${account.acct}` }} />
            </Text>
          </HStack>
        </FormGroup>

        {canForward && (
          <FormGroup
            labelText={<FormattedMessage id='report.forward_hint' defaultMessage='The account is from another server. Send a copy of the report there as well?' />}
          >
            <HStack space={2} alignItems='center'>
              <Toggle
                checked={isForward}
                onChange={handleForwardChange}
                id='report-forward'
                disabled={isSubmitting}
              />

              <Text theme='muted' tag='label' size='sm' htmlFor='report-forward'>
                <FormattedMessage id='report.forward' defaultMessage='Forward to {target}' values={{ target: getDomain(account) }} />
              </Text>
            </HStack>
          </FormGroup>
        )}
      </Stack>
    </Stack>
  );
};

export { OtherActionsStep as default };
