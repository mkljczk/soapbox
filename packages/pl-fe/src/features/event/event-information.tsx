import React, { useCallback, useEffect, useState } from 'react';
import { FormattedDate, FormattedMessage, useIntl } from 'react-intl';

import { fetchStatus } from 'pl-fe/actions/statuses';
import MissingIndicator from 'pl-fe/components/missing-indicator';
import StatusContent from 'pl-fe/components/status-content';
import HStack from 'pl-fe/components/ui/hstack';
import Icon from 'pl-fe/components/ui/icon';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { usePlFeConfig } from 'pl-fe/hooks/use-pl-fe-config';
import { makeGetStatus } from 'pl-fe/selectors';
import { useModalsStore } from 'pl-fe/stores/modals';

type RouteParams = { statusId: string };

interface IEventInformation {
  params: RouteParams;
}

const EventInformation: React.FC<IEventInformation> = ({ params }) => {
  const dispatch = useAppDispatch();
  const getStatus = useCallback(makeGetStatus(), []);
  const intl = useIntl();

  const status = useAppSelector(state => getStatus(state, { id: params.statusId }))!;

  const { openModal } = useModalsStore();
  const { tileServer } = usePlFeConfig();

  const [isLoaded, setIsLoaded] = useState<boolean>(!!status);

  useEffect(() => {
    dispatch(fetchStatus(params.statusId, intl)).then(() => {
      setIsLoaded(true);
    }).catch(() => {
      setIsLoaded(true);
    });
  }, [params.statusId]);

  const handleShowMap: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    e.preventDefault();

    openModal('EVENT_MAP', {
      statusId: status.id,
    });
  };

  const renderEventLocation = useCallback(() => {
    const event = status!.event!;

    if (!event.location) return null;

    const text = [
      <React.Fragment key='event-name'>
        {event.location.name}
      </React.Fragment>,
    ];

    if (event.location.street?.trim()) {
      text.push (
        <React.Fragment key='event-street'>
          <br />{event.location.street}
        </React.Fragment>,
      );
    }

    const address = [event.location.postal_code, event.location.locality, event.location.country].filter(text => text).join(', ');

    if (address) {
      text.push(
        <React.Fragment key='event-address'>
          <br />
          {address}
        </React.Fragment>,
      );
    }

    if (tileServer && event.location.latitude) {
      text.push(
        <React.Fragment key='event-map'>
          <br />
          <a href='#' className='text-primary-600 hover:underline dark:text-accent-blue' onClick={handleShowMap}>
            <FormattedMessage id='event.show_on_map' defaultMessage='Show on map' />
          </a>
        </React.Fragment>,
      );
    }

    return event.location && (
      <Stack space={1}>
        <Text size='xl' weight='bold'>
          <FormattedMessage id='event.location' defaultMessage='Location' />
        </Text>
        <HStack space={2} alignItems='center'>
          <Icon src={require('@fluentui/location_24_regular.svg')} />
          <Text>{text}</Text>
        </HStack>
      </Stack>
    );
  }, [status]);

  const renderEventDate = useCallback(() => {
    const event = status!.event!;

    if (!event.start_time) return null;

    const startDate = new Date(event.start_time);
    const endDate = event.end_time && new Date(event.end_time);

    const sameDay = endDate && startDate.getDate() === endDate.getDate() && startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear();

    return (
      <Stack space={1}>
        <Text size='xl' weight='bold'>
          <FormattedMessage id='event.date' defaultMessage='Date' />
        </Text>
        <HStack space={2} alignItems='center'>
          <Icon src={require('@fluentui/calendar_ltr_24_regular.svg')} />
          <Text>
            <FormattedDate
              value={startDate}
              year='numeric'
              month='long'
              day='2-digit'
              weekday='long'
              hour='2-digit'
              minute='2-digit'
            />
            {endDate && (<>
              {' - '}
              <FormattedDate
                value={endDate}
                year={sameDay ? undefined : 'numeric'}
                month={sameDay ? undefined : 'long'}
                day={sameDay ? undefined : '2-digit'}
                weekday={sameDay ? undefined : 'long'}
                hour='2-digit'
                minute='2-digit'
              />
            </>)}
          </Text>
        </HStack>
      </Stack>
    );
  }, [status]);

  const renderLinks = useCallback(() => {
    if (!status.event?.links?.length) return null;

    return (
      <Stack space={1}>
        <Text size='xl' weight='bold'>
          <FormattedMessage id='event.website' defaultMessage='External links' />
        </Text>

        {status.event.links.map(link => (
          <HStack space={2} alignItems='center'>
            <Icon src={require('@fluentui/link_24_regular.svg')} />
            <a href={link.remote_url || link.url} className='text-primary-600 hover:underline dark:text-accent-blue' target='_blank'>
              {(link.remote_url || link.url).replace(/^https?:\/\//, '')}
            </a>
          </HStack>
        ))}
      </Stack>
    );
  }, [status]);

  if (!status && isLoaded) {
    return (
      <MissingIndicator />
    );
  } else if (!status) return null;

  return (
    <Stack className='mt-4 sm:p-2' space={2}>
      {!!status.content.trim() && (
        <Stack space={1}>
          <Text size='xl' weight='bold'>
            <FormattedMessage id='event.description' defaultMessage='Description' />
          </Text>

          <StatusContent status={status} translatable withMedia />
        </Stack>
      )}

      {renderEventLocation()}

      {renderEventDate()}

      {renderLinks()}
    </Stack>
  );
};

export { EventInformation as default };
