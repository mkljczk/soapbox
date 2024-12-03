import React from 'react';
import { FormattedMessage } from 'react-intl';

import { useInstance } from 'pl-fe/api/hooks/instance/use-instance';
import Account from 'pl-fe/components/account';
import Button from 'pl-fe/components/ui/button';
import Card, { CardBody } from 'pl-fe/components/ui/card';
import Icon from 'pl-fe/components/ui/icon';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import { useOwnAccount } from 'pl-fe/hooks/use-own-account';

const FediverseStep = ({ onNext }: { onNext: () => void }) => {
  const { account } = useOwnAccount();
  const { data: instance } = useInstance();

  return (
    <Card variant='rounded' size='xl'>
      <CardBody>
        <Stack space={2}>
          <Icon strokeWidth={1} src={require('@tabler/icons/outline/affiliate.svg')} className='mx-auto size-16 text-primary-600 dark:text-primary-400' />

          <Text size='2xl' weight='bold'>
            <FormattedMessage
              id='onboarding.fediverse.title'
              defaultMessage='{siteTitle} is just one part of the Fediverse'
              values={{
                siteTitle: instance.title,
              }}
            />
          </Text>

          <Stack space={4}>
            <div className='border-b border-solid border-gray-200 pb-2 dark:border-gray-800 sm:pb-5'>
              <Stack space={4}>
                <Text theme='muted'>
                  <FormattedMessage
                    id='onboarding.fediverse.message'
                    defaultMessage='The Fediverse is a social network made up of thousands of diverse and independently-run social media sites (aka "servers"). You can follow users — and like, repost, and reply to posts — from most other Fediverse servers, because they can communicate with {siteTitle}.'
                    values={{
                      siteTitle: instance.title,
                    }}
                  />
                </Text>

                <Text theme='muted'>
                  <FormattedMessage
                    id='onboarding.fediverse.trailer'
                    defaultMessage='Because it is distributed and anyone can run their own server, the Fediverse is resilient and open. If you choose to join another server or set up your own, you can interact with the same people and continue on the same social graph.'
                  />
                </Text>
              </Stack>
            </div>

            {account && (
              <div className='rounded-lg bg-primary-50 p-4 text-center dark:bg-gray-800'>
                <Account account={account} />
              </div>
            )}

            <Text theme='muted'>
              <FormattedMessage
                id='onboarding.fediverse.its_you'
                defaultMessage='This is you! Other people can follow you from other servers by using your full @-handle.'
              />
            </Text>

            <Text theme='muted'>
              <FormattedMessage
                id='onboarding.fediverse.other_instances'
                defaultMessage='When browsing your timeline, pay attention to the full username after the second @ symbol to know which server a post is from.'
              />
            </Text>
          </Stack>
        </Stack>

        <div className='mx-auto pt-10 sm:w-2/3 md:w-1/2'>
          <Stack justifyContent='center' space={2}>
            <Button
              block
              theme='primary'
              onClick={onNext}
            >
              <FormattedMessage id='onboarding.fediverse.next' defaultMessage='Next' />
            </Button>
          </Stack>
        </div>
      </CardBody>
    </Card>
  );
};

export { FediverseStep as default };
