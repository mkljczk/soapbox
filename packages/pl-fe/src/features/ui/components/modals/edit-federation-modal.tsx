import React, { useState, useEffect, useCallback } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { updateMrf } from 'pl-fe/actions/mrf';
import { useInstance } from 'pl-fe/api/hooks/instance/use-instance';
import List, { ListItem } from 'pl-fe/components/list';
import Modal from 'pl-fe/components/ui/modal';
import Toggle from 'pl-fe/components/ui/toggle';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { makeGetRemoteInstance } from 'pl-fe/selectors';
import toast from 'pl-fe/toast';

import type { BaseModalProps } from '../modal-root';

const messages = defineMessages({
  mediaRemoval: { id: 'edit_federation.media_removal', defaultMessage: 'Strip media' },
  forceNsfw: { id: 'edit_federation.force_nsfw', defaultMessage: 'Force attachments to be marked sensitive' },
  unlisted: { id: 'edit_federation.unlisted', defaultMessage: 'Force posts unlisted' },
  followersOnly: { id: 'edit_federation.followers_only', defaultMessage: 'Hide posts except to followers' },
  save: { id: 'edit_federation.save', defaultMessage: 'Save' },
  success: { id: 'edit_federation.success', defaultMessage: '{host} federation was updated' },
});

interface EditFederationModalProps {
  host: string;
}

/** Modal for moderators to edit federation with a remote instance. */
const EditFederationModal: React.FC<BaseModalProps & EditFederationModalProps> = ({ host, onClose }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const { data: instance } = useInstance();
  const getRemoteInstance = useCallback(makeGetRemoteInstance(), []);
  const remoteInstance = useAppSelector(state => getRemoteInstance(state, host, instance));

  const [data, setData] = useState<Record<string, any>>({});

  useEffect(() => {
    setData(remoteInstance.federation);
  }, [remoteInstance]);

  const handleDataChange = (key: string): React.ChangeEventHandler<HTMLInputElement> => ({ target }) => {
    setData({ ...data, [key]: target.checked });
  };

  const handleMediaRemoval: React.ChangeEventHandler<HTMLInputElement> = ({ target: { checked } }) => {
    const newData = {
      ...data,
      avatar_removal: checked,
      banner_removal: checked,
      media_removal: checked,
    };

    setData(newData);
  };

  const handleSubmit = () => {
    dispatch(updateMrf(host, data))
      .then(() => toast.success(intl.formatMessage(messages.success, { host })))
      .catch(() => {});

    onClose('EDIT_FEDERATION');
  };

  const {
    avatar_removal,
    banner_removal,
    federated_timeline_removal,
    followers_only,
    media_nsfw,
    media_removal,
    reject,
  } = data;

  const fullMediaRemoval = avatar_removal && banner_removal && media_removal;

  return (
    <Modal
      onClose={onClose}
      title={host}
      confirmationAction={handleSubmit}
      confirmationText={intl.formatMessage(messages.save)}
    >
      <List>
        <ListItem label={<FormattedMessage id='edit_federation.reject' defaultMessage='Reject all activities' />}>
          <Toggle
            checked={reject}
            onChange={handleDataChange('reject')}
            id='reject'
          />
        </ListItem>

        <ListItem label={<FormattedMessage id='edit_federation.media_removal' defaultMessage='Strip media' />}>
          <Toggle
            checked={fullMediaRemoval}
            onChange={handleMediaRemoval}
            id='media_removal'
            disabled={reject}
          />
        </ListItem>

        <ListItem label={<FormattedMessage id='edit_federation.force_nsfw' defaultMessage='Force attachments to be marked sensitive' />}>
          <Toggle
            checked={media_nsfw}
            onChange={handleDataChange('media_nsfw')}
            id='media_nsfw'
            disabled={reject || media_removal}
          />
        </ListItem>

        <ListItem label={<FormattedMessage id='edit_federation.followers_only' defaultMessage='Hide posts except to followers' />}>
          <Toggle
            checked={followers_only}
            onChange={handleDataChange('followers_only')}
            id='followers_only'
            disabled={reject}
          />
        </ListItem>

        <ListItem label={<FormattedMessage id='edit_federation.unlisted' defaultMessage='Force posts unlisted' />}>
          <Toggle
            checked={federated_timeline_removal}
            onChange={handleDataChange('federated_timeline_removal')}
            id='federated_timeline_removal'
            disabled={reject || followers_only}
          />
        </ListItem>
      </List>
    </Modal>
  );
};

export { EditFederationModal as default, type EditFederationModalProps };
