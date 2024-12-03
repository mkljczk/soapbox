import React from 'react';
import { useIntl, defineMessages } from 'react-intl';

import { pinHost, unpinHost } from 'pl-fe/actions/remote-timeline';
import { useInstance } from 'pl-fe/api/hooks/instance/use-instance';
import Widget from 'pl-fe/components/ui/widget';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useSettings } from 'pl-fe/hooks/use-settings';
import { makeGetRemoteInstance } from 'pl-fe/selectors';

const getRemoteInstance = makeGetRemoteInstance();

const messages = defineMessages({
  pinHost: { id: 'remote_instance.pin_host', defaultMessage: 'Pin {host}' },
  unpinHost: { id: 'remote_instance.unpin_host', defaultMessage: 'Unpin {host}' },
});

interface IInstanceInfoPanel {
  /** Hostname (domain) of the remote instance, eg "gleasonator.com" */
  host: string;
}

/** Widget that displays information about a remote instance to users. */
const InstanceInfoPanel: React.FC<IInstanceInfoPanel> = ({ host }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const settings = useSettings();
  const pinned = settings.remote_timeline.pinnedHosts.includes(host);
  const { data: instance } = useInstance();
  const remoteInstance = useAppSelector(state => getRemoteInstance(state, host, instance));

  const handlePinHost = () => {
    if (!pinned) {
      dispatch(pinHost(host));
    } else {
      dispatch(unpinHost(host));
    }
  };

  if (!remoteInstance) return null;

  return (
    <Widget
      title={remoteInstance.host}
      onActionClick={handlePinHost}
      actionIcon={pinned ? require('@tabler/icons/outline/pinned-off.svg') : require('@tabler/icons/outline/pin.svg')}
      actionTitle={intl.formatMessage(pinned ? messages.unpinHost : messages.pinHost, { host })}
    />
  );
};

export { InstanceInfoPanel as default };
