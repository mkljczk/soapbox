import React, { useEffect, useRef, useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import { processCircle } from 'pl-fe/actions/circle';
import { resetCompose, uploadComposeSuccess, uploadFile } from 'pl-fe/actions/compose';
import Account from 'pl-fe/components/account';
import Accordion from 'pl-fe/components/ui/accordion';
import Avatar from 'pl-fe/components/ui/avatar';
import Button from 'pl-fe/components/ui/button';
import Column from 'pl-fe/components/ui/column';
import Form from 'pl-fe/components/ui/form';
import FormActions from 'pl-fe/components/ui/form-actions';
import HStack from 'pl-fe/components/ui/hstack';
import ProgressBar from 'pl-fe/components/ui/progress-bar';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useOwnAccount } from 'pl-fe/hooks/use-own-account';
import { useModalsStore } from 'pl-fe/stores/modals';

const toRad = (x: number) => x * (Math.PI / 180);

const avatarMissing = require('pl-fe/assets/images/avatar-missing.png');

const HEIGHT = 1000;
const WIDTH = 1000;

const messages = defineMessages({
  heading: { id: 'column.circle', defaultMessage: 'Interactions circle' },
  pending: { id: 'interactions_circle.state.pending', defaultMessage: 'Fetching interactions' },
  fetchingStatuses: { id: 'interactions_circle.state.fetching_statuses', defaultMessage: 'Fetching posts' },
  fetchingFavourites: { id: 'interactions_circle.state.fetching_favourites', defaultMessage: 'Fetching likes' },
  fetchingAvatars: { id: 'interactions_circle.state.fetching_avatars', defaultMessage: 'Fetching avatars' },
  drawing: { id: 'interactions_circle.state.drawing', defaultMessage: 'Drawing circle' },
  done: { id: 'interactions_circle.state.done', defaultMessage: 'Finalizing…' },
});

const Circle: React.FC = () => {
  const [{ state, progress }, setProgress] = useState<{
    state: 'unrequested' | 'pending' | 'fetchingStatuses' | 'fetchingFavourites' | 'fetchingAvatars' | 'drawing' | 'done';
    progress: number;
  }>({ state: 'unrequested', progress: 0 });
  const [expanded, setExpanded] = useState(false);
  const [users, setUsers] = useState<Array<{ id: string; avatar?: string; avatar_description?: string; acct: string }>>();

  const intl = useIntl();
  const dispatch = useAppDispatch();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { openModal } = useModalsStore();
  const { account } = useOwnAccount();

  useEffect(() => {
  }, []);

  const onSave: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();

    const fileToDownload = document.createElement('a');
    fileToDownload.download = 'interactions_circle.png';
    fileToDownload.href = canvasRef.current!.toDataURL('image/png');
    fileToDownload.click();
  };

  const onCompose: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();

    dispatch(resetCompose('compose-modal'));

    canvasRef.current!.toBlob((blob) => {
      const file = new File([blob!], 'interactions_circle.png', { type: 'image/png' });

      dispatch(uploadFile(file, intl, (data) => {
        dispatch(uploadComposeSuccess('compose-modal', data, file));
        openModal('COMPOSE');
      }));
    }, 'image/png');
  };

  const handleRequest = () => {
    setProgress({ state: 'pending', progress: 0 });

    dispatch(processCircle(setProgress)).then(async (users) => {
      setUsers(users);

      // Adapted from twitter-interaction-circles, licensed under MIT License
      // https://github.com/duiker101/twitter-interaction-circles
      const ctx = canvasRef.current?.getContext('2d')!;

      // ctx.fillStyle = '#C5EDCE';
      // ctx.fillRect(0, 0, 1000, 1000);

      for (const layer of [
        { index: 0, off: 0, distance: 0, count: 1, radius: 110, users: [{ avatar: account?.avatar || avatarMissing }] },
        { index: 1, off: 1, distance: 200, count: 8, radius: 64, users: users.slice(0, 8) },
        { index: 2, off: 9, distance: 330, count: 15, radius: 58, users: users.slice(8, 23) },
        { index: 3, off: 24, distance: 450, count: 26, radius: 50, users: users.slice(23, 49) },
      ]) {
        const { index, off, count, radius, distance, users } = layer;

        const angleSize = 360 / count;

        for (let i = 0; i < count; i++) {
          setProgress({ state: 'drawing', progress: 90 + (i + off) / users.length * 10 });

          const offset = index * 30;

          const r = toRad(i * angleSize + offset);

          const centerX = Math.cos(r) * distance + WIDTH / 2;
          const centerY = Math.sin(r) * distance + HEIGHT / 2;

          if (!users[i]) break;

          const avatarUrl = users[i].avatar || avatarMissing;

          await new Promise(resolve => {
            const img = new Image();

            img.onload = () => {
              ctx.save();
              ctx.beginPath();
              ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
              ctx.closePath();
              ctx.clip();

              ctx.drawImage(img, centerX - radius, centerY - radius, radius * 2, radius * 2);
              ctx.restore();

              resolve(null);
            };

            img.setAttribute('crossorigin', 'anonymous');
            img.src = avatarUrl;
          });
        }
      }

      setProgress({ state: 'done', progress: 100 });
    }).catch(() => {});
  };

  if (state === 'unrequested') {
    return (
      <Column label={intl.formatMessage(messages.heading)}>
        <Form onSubmit={handleRequest}>
          <Text size='xl' weight='semibold'>
            <FormattedMessage id='interactions_circle.confirmation_heading' defaultMessage='Do you want to generate an interaction circle for the user @{username}?' values={{ username: account?.acct }} />
          </Text>

          <div className='mx-auto max-w-md rounded-lg p-2 black:border black:border-gray-800'>
            {account && <Account account={account} withRelationship={false} disabled />}
          </div>

          <FormActions>
            <Button theme='primary' type='submit'>
              <FormattedMessage id='interactions_circle.start' defaultMessage='Generate' />
            </Button>
          </FormActions>
        </Form>
      </Column>
    );
  }

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <Stack alignItems='center' space={6}>
        {state !== 'done' && (
          <Stack
            alignItems='center'
            justifyContent='center'
            className='absolute inset-0 z-40 w-full bg-gray-800/75 p-4 backdrop-blur-lg'
            space={4}
          >
            <ProgressBar progress={progress / 100} size='md' />
            <Text theme='white' weight='semibold'>
              {intl.formatMessage(messages[state])}
            </Text>
          </Stack>
        )}

        <canvas className='max-w-full' ref={canvasRef} width={1000} height={1000} />

        <div className='w-full'>
          <Accordion
            headline={<FormattedMessage id='interactions_circle.user_list' defaultMessage='User list' />}
            expanded={expanded}
            onToggle={setExpanded}
          >
            <Stack space={2}>
              {users?.map(user => (
                <Link key={user.id} to={`/@${user.acct}`}>
                  <HStack space={2} alignItems='center'>
                    <Avatar size={20} src={user.avatar!} alt={user.avatar_description} />
                    <Text size='sm' weight='semibold' truncate>
                      {user.acct}
                    </Text>
                  </HStack>
                </Link>
              ))}
            </Stack>
          </Accordion>
        </div>

        <HStack space={2}>
          <Button onClick={onSave} icon={require('@tabler/icons/outline/download.svg')}>
            <FormattedMessage id='interactions_circle.download' defaultMessage='Download' />
          </Button>
          <Button onClick={onCompose} icon={require('@tabler/icons/outline/pencil-plus.svg')}>
            <FormattedMessage id='interactions_circle.compose' defaultMessage='Share' />
          </Button>
        </HStack>
      </Stack>
    </Column>
  );
};

export { Circle as default };
