import L from 'leaflet';
import { useStatus } from 'pl-hooks';
import React, { useEffect, useRef } from 'react';
import { FormattedMessage } from 'react-intl';

import Button from 'pl-fe/components/ui/button';
import Modal from 'pl-fe/components/ui/modal';
import Stack from 'pl-fe/components/ui/stack';
import { usePlFeConfig } from 'pl-fe/hooks/use-pl-fe-config';

import type { BaseModalProps } from '../modal-root';

import 'leaflet/dist/leaflet.css';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface EventMapModalProps {
  statusId: string;
}

const EventMapModal: React.FC<BaseModalProps & EventMapModalProps> = ({ onClose, statusId }) => {
  const { tileServer, tileServerAttribution } = usePlFeConfig();

  const { data: status } = useStatus(statusId);
  const location = status!.event!.location!;

  const map = useRef<L.Map>();

  useEffect(() => {
    const latlng: [number, number] = [location.latitude, location.longitude];

    map.current = L.map('event-map').setView(latlng, 15);

    L.marker(latlng, {
      title: location.name,
    }).addTo(map.current);

    L.tileLayer(tileServer, {
      attribution: tileServerAttribution,
    }).addTo(map.current);

    return () => {
      map.current?.remove();
    };
  }, []);

  const onClickClose = () => {
    onClose('EVENT_MAP');
  };

  const onClickNavigate = () => {
    window.open(`https://www.openstreetmap.org/directions?from=&to=${location.latitude},${location.longitude}#map=14/${location.latitude}/${location.longitude}`, '_blank');
  };

  return (
    <Modal
      title={<FormattedMessage id='column.event_map' defaultMessage='Event location' />}
      onClose={onClickClose}
      width='2xl'
    >
      <Stack alignItems='center' space={6}>
        <div className='h-96 w-full' id='event-map' />
        <Button onClick={onClickNavigate} icon={require('@tabler/icons/outline/gps.svg')}>
          <FormattedMessage id='event_map.navigate' defaultMessage='Navigate' />
        </Button>
      </Stack>
    </Modal>
  );
};

export { EventMapModal as default, type EventMapModalProps };
