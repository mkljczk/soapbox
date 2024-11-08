import React from 'react';
import { FormattedDate } from 'react-intl';

import Icon from 'pl-fe/components/icon';
import HStack from 'pl-fe/components/ui/hstack';

import type { Status } from 'pl-fe/normalizers/status';

interface IEventDate {
  status: Pick<Status, 'event'>;
}

const EventDate: React.FC<IEventDate> = ({ status }) => {
  const event = status.event!;

  if (!event.start_time) return null;

  const startDate = new Date(event.start_time);

  let date;

  if (event.end_time) {
    const endDate = new Date(event.end_time);

    const sameYear = startDate.getFullYear() === endDate.getFullYear();
    const sameDay = startDate.getDate() === endDate.getDate() && startDate.getMonth() === endDate.getMonth() && sameYear;

    if (sameDay) {
      date = (
        <>
          <FormattedDate value={event.start_time} year={sameYear ? undefined : '2-digit'} month='short' day='2-digit' weekday='short' hour='2-digit' minute='2-digit' />
          {' - '}
          <FormattedDate value={event.end_time} hour='2-digit' minute='2-digit' />
        </>
      );
    } else {
      date = (
        <>
          <FormattedDate value={event.start_time} year='2-digit' month='short' day='2-digit' weekday='short' />
          {' - '}
          <FormattedDate value={event.end_time} year='2-digit' month='short' day='2-digit' weekday='short' />
        </>
      );
    }
  } else {
    date = (
      <FormattedDate value={event.start_time} year='2-digit' month='short' day='2-digit' weekday='short' hour='2-digit' minute='2-digit' />
    );
  }

  return (
    <HStack alignItems='center' space={2}>
      <Icon src={require('@fluentui/calendar_ltr_24_regular.svg')} />
      <span>{date}</span>
    </HStack>
  );
};

export { EventDate as default };
